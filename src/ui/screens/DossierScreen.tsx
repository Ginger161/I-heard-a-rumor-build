import React, { useState } from 'react';
import { ScandalCategory } from '../../engine/data/channels';
import {
  FOLDERS, FOLDER_INFO, Folder, SCANDALS, Tier, TargetArchetype, describeTarget, targetsInFolder
} from '../../engine/data/targets';
import { PERKS, getPerk } from '../../engine/data/perks';
import {
  MetaProfile, isTargetUnlocked, isTierUnlocked, starsInTier, starsOf, tierBuyoutCost
} from '../../engine/profile';
import { BALANCE, STARS_TO_UNLOCK_TIER } from '../../engine/balance';
import { BrutalButton, PaperGrain, TapeStrip } from '../components/common';
import { Avatar } from '../components/Silhouette';
import { DAILY_BASE_BONUS, DailyCase, dailyBonus, dailyStreak } from '../../engine/daily';
import { describeClimate, getClimate } from '../../engine/data/climates';
import { pickTagline } from '../../engine/data/copyUi';
import { PARODY_DISCLAIMER, SHOW_DISCLAIMER } from '../../engine/data/parody';
import { getTarget } from '../../engine/data/targets';
import { sfx } from '../audio';
import { eggTap } from '../egg';
import { PremiumSheet } from '../components/PremiumSheet';
import { usePremium } from '../usePremium';
import { STORY_CHAPTERS } from '../../engine/data/story';
import { chaptersWon, seasonComplete } from '../../engine/story';
import { SettingsSheet } from '../components/SettingsSheet';
import { FieldGuide } from '../components/FieldGuide';
import { updateSettings, useSettings } from '../settings';

interface DossierProps {
  profile: MetaProfile;
  climateId: string;
  daily: DailyCase;
  onStartDaily: () => void;
  unlockAll: boolean;
  onStart: (targetId: string, category: ScandalCategory) => void;
  onReset: () => void;
  onEraseProgress: () => void;
  onBribe: (targetId: string) => void;
  onBuyTier: (tier: Tier) => void;
  onBuyPerk: (perkId: string) => void;
  onEquipPerk: (perkId: string | null) => void;
  onStartTraining: () => void;
  onOpenStory: () => void;
  onImportProgress: (raw: unknown) => boolean;
  onOpenBoards?: () => void;
  wide?: boolean;   // desktop: a three-pane layout (your desk, the roster, the case file)
}

const LockIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const Stars: React.FC<{ n: number; className?: string }> = ({ n, className = '' }) => (
  <span className={`tracking-tight ${className}`} aria-label={`${n} of 3 stars`}>
    {[1, 2, 3].map(i => <span key={i} className={i <= n ? 'text-[#B45309]' : 'text-[#1A1A1A]/20'}>★</span>)}
  </span>
);

const Envelope: React.FC<{ n: number; className?: string }> = ({ n, className = '' }) => (
  <span className={`inline-flex items-center gap-1 font-black ${className}`}>✉️ {n}</span>
);

const MENU_BTN = 'text-left px-3 py-2.5 border-2 border-[#1A1A1A] rounded-md bg-white font-black text-[12px] uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';

const SheetFrame: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="absolute inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-[2px] flex items-end animate-fade-in desk-wrap" onClick={onClose}>
    <div className="relative w-full max-h-[80%] bg-[#EADCC8] border-t-4 border-[#1A1A1A] rounded-t-3xl flex flex-col overflow-hidden animate-slide-up desk-sheet" onClick={e => e.stopPropagation()}>
      <PaperGrain />
      <div className="relative bg-[#1A1A1A] text-[#F4F1EA] p-4 flex items-center justify-between border-b-4 border-[#8B0000]">
        <span className="font-black tracking-widest uppercase font-serif">{title}</span>
        <button onClick={onClose} aria-label={`Close ${title}`} className="w-8 h-8 bg-[#F4F1EA] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-md font-bold cursor-pointer">✕</button>
      </div>
      <div className="relative overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">{children}</div>
    </div>
  </div>
);


// Desktop only: your desk. A quick read on your standing, with the places that used to hide behind phone buttons.
const DeskAside: React.FC<{ profile: MetaProfile; onOpenPerks: () => void; onOpenArchive: () => void; onOpenPremium: () => void; supporter: boolean; onOpenBoards?: () => void; onGuide: () => void; onTraining: () => void }> = ({ profile, onOpenPerks, onOpenArchive, onOpenPremium, supporter, onOpenBoards, onGuide, onTraining }) => {
  const stars = Object.values(profile.targetStars).reduce((a, b) => a + b, 0);
  const cleared = Object.keys(profile.targetStars).length;
  const recent = profile.archive.slice(0, 4);
  const equipped = getPerk(profile.equippedPerkId);
  const BTN = 'text-left px-3 py-2 border-2 border-[#1A1A1A] rounded-md bg-white font-black text-[12px] uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';
  return (
    <div className="relative px-3 pt-3 flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[['Cleared', cleared], ['Stars', stars], ['Envelopes', profile.envelopes]].map(([l, v]) => (
          <div key={String(l)} className="bg-[#F4F1EA] border-2 border-[#1A1A1A] rounded-md py-2">
            <div className="font-mono font-black text-[18px] leading-none">{v}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]/55 mt-1">{l}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B0000] mb-1.5">Recent front pages</div>
        {recent.length === 0 && <div className="text-[12px] font-sans text-slate-600">Nothing yet. Take someone down.</div>}
        <ul className="flex flex-col gap-1.5">
          {recent.map((a, i) => (
            <li key={i} className="bg-[#F4F1EA] border border-[#1A1A1A] rounded-md px-2.5 py-1.5">
              <div className="text-[12px] font-black leading-tight truncate">{a.targetName}</div>
              <div className="flex justify-between text-[10px] font-sans text-slate-600"><span>Day {a.day} • {Math.round(a.believers)}%</span><Stars n={a.stars} className="text-[11px]" /></div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-[#F4F1EA] border-2 border-dashed border-[#1A1A1A] rounded-md px-3 py-2">
        <div className="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]/55">Equipped perk</div>
        <div className="text-[12px] font-bold leading-tight">{equipped ? equipped.name : 'None'}</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onOpenPerks} className={BTN}>Perks</button>
        <button onClick={onOpenArchive} className={BTN}>Archive</button>
        {onOpenBoards && <button onClick={onOpenBoards} className={`${BTN} col-span-2 bg-[#FDE68A]`}>🏆 Leaderboards</button>}
        <button onClick={onOpenPremium} className={`${BTN} col-span-2 ${supporter ? 'bg-[#D1FAE5]' : ''}`}>{supporter ? '⭐ Supporter • thank you' : '⭐ Gist Pass • coming soon'}</button>
        <button onClick={onGuide} className={BTN}>📖 Field Guide</button>
        <button onClick={onTraining} className={BTN}>? Tutorial</button>
      </div>
    </div>
  );
};

export const DossierScreen: React.FC<DossierProps> = ({
  profile, climateId, daily, onStartDaily, unlockAll, onStart, onReset, onEraseProgress, onBribe, onBuyTier, onBuyPerk, onEquipPerk, onStartTraining, onImportProgress, onOpenStory, onOpenBoards, wide = false
}) => {
  const settings = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [folder, setFolder] = useState<Folder>(1);
  const [selectedId, setSelectedId] = useState<string>(targetsInFolder(1)[0].id);
  const [scandalIdx, setScandalIdx] = useState(0);
  const [sheet, setSheet] = useState<'none' | 'archive' | 'perks' | 'premium' | 'menu'>('none');
  const [fileOpen, setFileOpen] = useState(false);   // phone: the case file is its own full screen
  const premium = usePremium();
  const [confirm, setConfirm] = useState<'none' | 'save' | 'progress'>('none');

  const list = targetsInFolder(folder);
  const isTier = folder !== 'SPOTLIGHT';
  const tierOpen = !isTier || isTierUnlocked(profile, folder as Tier, unlockAll);
  const selected: TargetArchetype = list.find(t => t.id === selectedId) ?? list[0];
  const selectedOpen = isTargetUnlocked(profile, selected, unlockAll);
  const scandal = selected.scandals[Math.min(scandalIdx, selected.scandals.length - 1)];
  const equipped = getPerk(profile.equippedPerkId);
  const climate = getClimate(climateId);
  const tagline = React.useMemo(() => pickTagline(Math.floor(Math.random() * 1e6)), []);
  const dailyTarget = getTarget(daily.targetId);
  const dailyDone = profile.dailyWins.includes(daily.dateKey);
  const streak = dailyStreak(profile.dailyWins, daily.dateKey);
  const prevTierStars = isTier && folder !== 1 ? starsInTier(profile, (folder - 1) as Tier) : 0;

  const pickFolder = (f: Folder) => {
    setFolder(f);
    setScandalIdx(0);
    setSelectedId(targetsInFolder(f)[0].id);
  };
  const pickTarget = (id: string) => {
    setSelectedId(id);
    setScandalIdx(0);
    if (!wide) setFileOpen(true);
  };

  const folderLabel = (f: Folder) => (f === 'SPOTLIGHT' ? '★' : `T${f}`);

  // Small print and reset controls: at the foot of the case file on desktop, inside the menu on a phone.
  const footer = (
    <>
      {SHOW_DISCLAIMER && <div className="text-[8px] font-sans italic text-center text-[#1A1A1A]/55 leading-tight">{PARODY_DISCLAIMER}</div>}

      <div className="flex items-center justify-center gap-3 text-[9px] font-sans font-bold uppercase tracking-widest text-[#1A1A1A]/50"><a href="./privacy.html" target="_blank" rel="noopener" className="underline">Privacy</a><a href="./terms.html" target="_blank" rel="noopener" className="underline">Terms</a></div>

      {/* RESET */}
      <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
        {confirm === 'none' && (
          <>
            {wide && <button onClick={onStartTraining} className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#8B0000] underline cursor-pointer">? How to play</button>}
            {wide && <button onClick={() => setGuideOpen(true)} className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#8B0000] underline cursor-pointer">📖 Field Guide</button>}
            <button onClick={() => setConfirm('save')} className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#1A1A1A]/50 underline cursor-pointer">New Investigation / Reset saved game</button>
            <button onClick={() => setConfirm('progress')} className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#1A1A1A]/50 underline cursor-pointer">Erase progress</button>
          </>
        )}
        {confirm !== 'none' && (
          <div className="inline-flex items-center gap-2">
            <span className="text-[10px] font-sans font-bold text-[#8B0000]">{confirm === 'save' ? 'Wipe the saved game?' : 'Erase stars, envelopes, perks and archive?'}</span>
            <button onClick={() => { if (confirm === 'save') onReset(); else onEraseProgress(); setConfirm('none'); }} className="text-[10px] font-black uppercase text-white bg-[#8B0000] px-2 py-1 rounded cursor-pointer">Confirm</button>
            <button onClick={() => setConfirm('none')} className="text-[10px] font-black uppercase bg-white border border-[#1A1A1A] px-2 py-1 rounded cursor-pointer">Cancel</button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="relative flex-1 min-h-0 bg-[#EFEBE0] text-[#1A1A1A] font-serif flex flex-col select-none overflow-hidden">
      <PaperGrain />

      {/* MASTHEAD */}
      <div className="relative flex-shrink-0 px-3 pt-2.5 pb-2 border-b-4 border-double border-[#1A1A1A] flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-[#8B0000]">Classified // Case Files</div>
          <h1 onClick={eggTap} className={wide ? 'text-[30px] whitespace-nowrap font-black uppercase tracking-tight leading-none' : 'text-[17px] whitespace-nowrap font-black uppercase tracking-tight leading-none'}>I Heard A Rumor</h1>
          <div className="text-[8px] font-sans italic text-[#1A1A1A]/60 leading-tight mt-0.5 truncate">{tagline}</div>
        </div>
        {wide ? (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => { sfx.play('click'); setSheet('premium'); }} aria-label="Gist Pass" className={`text-[11px] border-2 border-[#1A1A1A] rounded px-1.5 py-0.5 shadow-[2px_2px_0px_#1A1A1A] cursor-pointer ${premium ? 'bg-[#FDE68A]' : 'bg-white'}`}>⭐</button>
            <span className="bg-[#E6D5B8] border-2 border-[#1A1A1A] rounded px-1.5 py-1 text-[10px] shadow-[2px_2px_0px_#1A1A1A]" aria-label="Brown Envelopes"><Envelope n={profile.envelopes} /></span>
            <button onClick={() => { sfx.play('click'); setSettingsOpen(true); }} aria-label="Settings" className="text-[11px] bg-white border-2 border-[#1A1A1A] rounded px-1.5 py-0.5 shadow-[2px_2px_0px_#1A1A1A] cursor-pointer">⚙</button>
            <button onClick={() => setSheet('perks')} className="text-[8px] font-black uppercase tracking-wider bg-white border-2 border-[#1A1A1A] rounded px-1 py-1 shadow-[2px_2px_0px_#1A1A1A] cursor-pointer active:translate-y-[2px] active:translate-x-[2px] active:shadow-none">Perks</button>
            <button onClick={() => setSheet('archive')} className="text-[8px] font-black uppercase tracking-wider bg-white border-2 border-[#1A1A1A] rounded px-1 py-1 shadow-[2px_2px_0px_#1A1A1A] cursor-pointer active:translate-y-[2px] active:translate-x-[2px] active:shadow-none">Archive</button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="bg-[#E6D5B8] border-2 border-[#1A1A1A] rounded px-1.5 py-1 text-[11px] shadow-[2px_2px_0px_#1A1A1A]" aria-label="Brown Envelopes"><Envelope n={profile.envelopes} /></span>
            <button onClick={() => { sfx.play('click'); setSheet('menu'); }} aria-label="Menu" className="text-[14px] leading-none bg-white border-2 border-[#1A1A1A] rounded px-2 py-1 shadow-[2px_2px_0px_#1A1A1A] cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">☰</button>
          </div>
        )}
      </div>

      <div className={wide ? 'relative flex-1 min-h-0 grid grid-cols-[330px_minmax(0,1fr)_440px]' : 'contents'}>
      {/* PHONE: story and daily case share one compact row */}
      {!wide && (
        <div className="relative flex-shrink-0 px-3 pt-2 grid grid-cols-2 gap-2">
          <button onClick={() => { sfx.play('click'); onOpenStory(); }} className="text-left bg-[#1A1A1A] text-[#F4F1EA] border-2 border-[#1A1A1A] rounded-lg px-2.5 py-1.5 shadow-[2px_2px_0px_#8B0000] cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none min-w-0">
            <div className="text-[8px] font-black uppercase tracking-widest text-[#FDE68A] truncate">📖 Story • {chaptersWon(profile.story)}/{STORY_CHAPTERS.length}</div>
            <div className="text-[11px] font-black leading-tight truncate">{chaptersWon(profile.story) === 0 ? 'Start' : seasonComplete(profile.story) ? 'Replay' : 'Continue'} ▶</div>
          </button>
          <button
            onClick={() => { if (!dailyDone) { sfx.play('click'); onStartDaily(); } }}
            disabled={dailyDone}
            className={`text-left border-2 border-[#1A1A1A] rounded-lg px-2.5 py-1.5 min-w-0 ${dailyDone ? 'bg-[#D1FAE5] cursor-default' : 'bg-[#FDE68A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'}`}
          >
            <div className="text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/60 truncate">📅 Daily{streak > 0 ? ` • 🔥 ${streak}` : ''}</div>
            <div className="text-[11px] font-black leading-tight truncate">{dailyDone ? '✓ Done today' : `${dailyTarget.shortName} • +${dailyBonus(streak)}✉️`}</div>
          </button>
        </div>
      )}

      <div className={wide ? 'relative border-r-4 border-[#1A1A1A] bg-[#E6D5B8] overflow-y-auto no-scrollbar flex flex-col gap-1 pb-3' : 'contents'}>
      {wide && (<>
      {/* STORY MODE */}
      <div className="relative flex-shrink-0 px-3 pt-2">
        <button onClick={() => { sfx.play('click'); onOpenStory(); }} className="w-full text-left flex items-center gap-2.5 bg-[#1A1A1A] text-[#F4F1EA] border-2 border-[#1A1A1A] rounded-lg px-2.5 py-1.5 shadow-[2px_2px_0px_#8B0000] cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
          <span className="text-base" aria-hidden>📖</span>
          <div className="min-w-0 flex-1">
            <div className="text-[8px] font-black uppercase tracking-widest text-[#FDE68A]">Story Mode • Season 1</div>
            <div className="text-[11px] font-black leading-tight truncate">The Receipts <span className="font-sans font-bold text-slate-300">• {chaptersWon(profile.story)}/{STORY_CHAPTERS.length} chapters</span></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FDE68A]">{chaptersWon(profile.story) === 0 ? 'Start' : seasonComplete(profile.story) ? 'Replay' : 'Continue'} ▶</span>
        </button>
      </div>

      {/* DAILY CASE */}
      <div className="relative flex-shrink-0 px-3 pt-2">
        <div className={`flex items-center gap-2 border-2 border-[#1A1A1A] rounded-lg px-2.5 py-1.5 ${dailyDone ? 'bg-[#D1FAE5]' : 'bg-[#FDE68A] shadow-[2px_2px_0px_#1A1A1A]'}`}>
          <span className="text-base" aria-hidden>📅</span>
          <div className="min-w-0 flex-1">
            <div className="text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/60">
              Daily Case {streak > 0 ? `• 🔥 ${streak}-day streak` : ''}
            </div>
            <div className="text-[11px] font-black leading-tight truncate">{dailyTarget.shortName} <span className="font-sans font-bold text-[#1A1A1A]/60">({dailyTarget.prRating}) {getClimate(daily.climateId).icon}</span></div>
          </div>
          {dailyDone ? (
            <span className="text-[9px] font-black uppercase tracking-wider text-[#065F46]">✓ Done today</span>
          ) : (
            <button onClick={onStartDaily} className="text-[9px] font-black uppercase tracking-wider bg-[#1A1A1A] text-[#FDE68A] rounded px-2 py-1.5 cursor-pointer whitespace-nowrap active:translate-y-[1px]">
              Play +{dailyBonus(streak)}✉️
            </button>
          )}
        </div>
      </div>
      </>)}

      {wide && <DeskAside profile={profile} onOpenPerks={() => setSheet('perks')} onOpenArchive={() => setSheet('archive')} onOpenPremium={() => setSheet('premium')} supporter={!!premium} onOpenBoards={onOpenBoards} onGuide={() => setGuideOpen(true)} onTraining={onStartTraining} />}
      </div>

      <div className={wide ? 'relative min-w-0 min-h-0 flex flex-col pt-1' : 'contents'}>
      {/* FOLDER TABS */}
      <div className="relative flex-shrink-0 px-3 pt-2.5">
        <div className="flex gap-1.5">
          {FOLDERS.map(f => {
            const open = f === 'SPOTLIGHT' || isTierUnlocked(profile, f as Tier, unlockAll);
            const active = f === folder;
            return (
              <button
                key={String(f)}
                onClick={() => pickFolder(f)}
                aria-label={f === 'SPOTLIGHT' ? 'Creator Spotlight' : `Tier ${f}${open ? '' : ' (sealed)'}`}
                className={`flex-1 py-1.5 border-2 border-[#1A1A1A] rounded-md font-black text-xs flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  active ? 'bg-[#1A1A1A] text-[#F4F1EA] shadow-[2px_2px_0px_#8B0000]' : open ? (f === 'SPOTLIGHT' ? 'bg-[#FDE68A]' : 'bg-white') : 'bg-[#D4CFC4] text-[#1A1A1A]/55'
                }`}
              >
                {open ? folderLabel(f) : <><LockIcon className="w-3 h-3" />{f}</>}
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 flex items-baseline justify-between px-0.5 gap-2">
          <div className="text-[11px] font-black uppercase tracking-wider">{tierOpen ? FOLDER_INFO[folder].name : 'Sealed Files'}</div>
          <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/55 whitespace-nowrap">
            {!isTier ? 'Always open' : tierOpen
              ? (folder === 5 ? `${starsInTier(profile, 5 as Tier)}★ earned` : `${starsInTier(profile, folder as Tier)}/${STARS_TO_UNLOCK_TIER}★ opens next tier`)
              : 'Locked'}
          </div>
        </div>
        {wide
          ? <div className="text-[10px] font-sans text-[#1A1A1A]/65 px-0.5 mb-1.5">
              {tierOpen ? FOLDER_INFO[folder].blurb : 'The identities in this folder are hidden until you earn or buy access.'}
            </div>
          : <div className="mb-1" />}
      </div>

      {/* ROSTER */}
      <div className={wide ? 'relative flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-4' : 'relative flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 pb-4'}>
        <div className={wide ? 'grid grid-cols-3 2xl:grid-cols-4 gap-3 pt-1' : 'grid grid-cols-2 gap-x-2.5 gap-y-3 pt-1.5'}>
          {list.map((t, i) => {
            const open = isTargetUnlocked(profile, t, unlockAll);
            const stars = starsOf(profile, t.id);
            const active = t.id === selectedId;
            const bribed = open && isTier && !tierOpen;
            return (
              <button
                key={t.id}
                onClick={() => pickTarget(t.id)}
                className={`relative text-left p-2 border-2 border-[#1A1A1A] rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  active ? 'bg-[#E6D5B8] shadow-[3px_3px_0px_#8B0000] -translate-y-0.5' : open ? 'bg-[#F4F1EA] shadow-[2px_2px_0px_#1A1A1A]' : 'bg-[#E3DDCF]'
                } ${i % 2 === 0 ? 'rotate-[-0.3deg]' : 'rotate-[0.3deg]'}`}
              >
                {active && <TapeStrip className="-top-2.5 left-4 rotate-[-4deg] w-8 h-3" />}
                <Avatar target={t} locked={!open} className="w-9 h-11 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  {open ? (
                    <>
                      <div className="font-black text-[11px] leading-tight line-clamp-2">{t.fullName}</div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[9px] font-sans font-black tracking-wider bg-[#1A1A1A] text-[#F4F1EA] px-1 rounded-sm" aria-label={`PR Rating ${t.prRating}`}>{t.prRating}</span>
                        <Stars n={stars} className="text-[10px]" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-black text-[11px] leading-tight text-[#1A1A1A]/45 tracking-widest">? ? ?</div>
                      <div className="text-[8px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/40 mt-0.5">Sealed file</div>
                    </>
                  )}
                </div>
                {bribed && <span className="absolute -top-1.5 -right-1 rotate-[8deg] border-2 border-[#B45309] text-[#B45309] bg-[#F4F1EA] text-[7px] font-black tracking-widest px-1 py-[1px]">UNSEALED</span>}
                {open && stars > 0 && !bribed && <span className="absolute -top-1.5 -right-1 rotate-[8deg] border-2 border-[#065F46] text-[#065F46] bg-[#F4F1EA] text-[7px] font-black tracking-widest px-1 py-[1px]">CLOSED</span>}
              </button>
            );
          })}
        </div>
      </div>

      </div>

      {/* CASE FILE PANEL */}
      {(wide || fileOpen) && (
      <div className={wide ? 'relative min-h-0 overflow-y-auto no-scrollbar bg-[#E6D5B8] border-l-4 border-[#1A1A1A] p-5 flex flex-col gap-3' : 'absolute inset-0 z-40 overflow-y-auto no-scrollbar bg-[#E6D5B8] px-4 pb-4 flex flex-col gap-3 animate-slide-up'}>
        {!wide && (
          <div className="sticky top-0 z-10 -mx-4 flex-shrink-0 bg-[#1A1A1A] text-[#F4F1EA] px-3 py-2.5 flex items-center gap-3 border-b-4 border-[#8B0000]">
            <button onClick={() => { sfx.play('click'); setFileOpen(false); }} className="text-[11px] font-black uppercase tracking-wider bg-[#F4F1EA] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded px-2 py-1 cursor-pointer">← Back</button>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FDE68A]">Classified // Case File</span>
          </div>
        )}
        {selectedOpen ? (
          <>
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex-shrink-0 w-14 h-[68px] bg-[#D9CBB0] border-2 border-[#1A1A1A] rounded overflow-hidden"><Avatar target={selected} emotion={starsOf(profile, selected.id) > 0 ? 'DEFEATED' : 'SMUG'} className="w-full h-full" /></div>
                  <div className="font-black text-sm leading-tight">{selected.fullName}</div>
                </div>
                <Stars n={starsOf(profile, selected.id)} className="text-sm flex-shrink-0" />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-[9px] font-sans font-black bg-[#1A1A1A] text-[#F4F1EA] px-1.5 py-0.5 rounded-sm tracking-wider">PR RATING {selected.prRating}</span>
                <span className="text-[9px] font-sans font-black bg-[#F4F1EA] border border-[#1A1A1A] px-1.5 py-0.5 rounded-sm tracking-wider">{selected.ai.defenseStyle.replace('_', ' ')}</span>
                <span className="text-[9px] font-sans font-black bg-[#F4F1EA] border border-[#1A1A1A] px-1.5 py-0.5 rounded-sm tracking-wider">{selected.ai.temperament.replace('_', ' ')}</span>
                <span className="text-[9px] font-sans font-black bg-[#F4F1EA] border border-[#1A1A1A] px-1.5 py-0.5 rounded-sm tracking-wider">{BALANCE.tier.days[selected.tier - 1]} DAYS</span>
              </div>
              <div className="text-[10px] font-sans italic text-slate-700 leading-snug mt-1">{selected.personality}</div>
            </div>

            <div className="bg-[#1A1A1A] text-[#F4F1EA] px-2.5 py-2 rounded-sm">
              <div className="text-[9px] font-black uppercase tracking-widest text-[#FDE68A]">Passive: {selected.passiveName}</div>
              <div className="text-[10px] font-sans leading-snug mt-0.5 text-slate-300 italic">{selected.passiveFlavor}</div>
              <ul className="mt-1 flex flex-col gap-0.5">
                {describeTarget(selected).map(line => (
                  <li key={line} className="text-[9px] font-sans leading-snug text-[#F4F1EA]">• {line}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[9px] font-black uppercase tracking-widest mb-1">Choose the scandal</div>
              <div className="flex flex-col gap-1.5">
                {selected.scandals.map((sd, i) => {
                  const active = i === scandalIdx;
                  return (
                    <button
                      key={sd.category}
                      onClick={() => setScandalIdx(i)}
                      className={`text-left px-2.5 py-1.5 border-2 border-[#1A1A1A] rounded-md cursor-pointer transition-all ${
                        active ? 'bg-[#1A1A1A] text-[#F4F1EA] shadow-[2px_2px_0px_#8B0000]' : 'bg-white'
                      }`}
                    >
                      <div className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-[#FDE68A]' : 'text-[#B45309]'}`}>{SCANDALS[sd.category].label}</div>
                      <div className="text-[11px] font-bold leading-tight">{sd.title}</div>
                    </button>
                  );
                })}
              </div>
              <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#065F46] mt-1.5">
                Matching channels get a ×1.35 Velocity &amp; Credibility bonus.
              </div>
            </div>

            <div className="bg-[#F4F1EA] border-2 border-[#1A1A1A] rounded-md px-2.5 py-1.5">
              <div className="text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/55">Forecast for this case</div>
              <div className="text-[11px] font-bold leading-tight">{climate.icon} {climate.name}</div>
              <div className="text-[9px] font-sans text-slate-600 leading-snug">{climate.blurb}{describeClimate(climate).length ? ` (${describeClimate(climate).join(', ')})` : ''}</div>
            </div>

            <div className="flex items-center justify-between gap-2 bg-[#F4F1EA] border-2 border-dashed border-[#1A1A1A] rounded-md px-2.5 py-1.5">
              <div className="min-w-0">
                <div className="text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/55">Equipped perk</div>
                <div className="text-[11px] font-bold leading-tight truncate">{equipped ? equipped.name : 'None'}</div>
              </div>
              <button onClick={() => setSheet('perks')} className="text-[9px] font-black uppercase tracking-wider underline cursor-pointer whitespace-nowrap">{equipped ? 'Change' : 'Browse'}</button>
            </div>

            <div className={wide ? '' : 'sticky bottom-0 z-10 -mx-4 mt-auto px-4 py-3 bg-[#EFEBE0] border-t-4 border-[#1A1A1A]'}>
              <BrutalButton tone="crimson" className="py-3.5 text-xs" onClick={() => onStart(selected.id, scandal.category)}>
                Open Case File →
              </BrutalButton>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-2 py-1">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#F4F1EA] flex items-center justify-center"><LockIcon className="w-5 h-5" /></div>
            <div className="font-black text-sm uppercase tracking-wider">Files Sealed</div>
            <div className="text-[11px] font-sans text-slate-700 leading-snug max-w-[300px]">
              Earn {STARS_TO_UNLOCK_TIER} ★ across {FOLDER_INFO[(Number(folder) - 1) as Tier].name} ({Math.min(prevTierStars, STARS_TO_UNLOCK_TIER)}/{STARS_TO_UNLOCK_TIER}) to open every file in this folder.
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: STARS_TO_UNLOCK_TIER }).map((_, i) => (
                <span key={i} className={`text-base ${i < prevTierStars ? 'text-[#B45309]' : 'text-[#1A1A1A]/20'}`}>★</span>
              ))}
            </div>
            <div className="flex flex-col gap-2 w-full mt-1">
              <BrutalButton tone="ink" disabled={profile.envelopes < BALANCE.bribeTarget} onClick={() => onBribe(selected.id)} className="py-2.5">
                Bribe Informant to Unseal This Dossier (<Envelope n={BALANCE.bribeTarget} />)
              </BrutalButton>
              <button onClick={() => setSheet('premium')} className="text-[10px] font-sans font-bold uppercase tracking-wider underline text-[#8B0000] cursor-pointer">⭐ Or unlock every file with the Gist Pass</button>
              {isTier && (
                <BrutalButton tone="paper" disabled={profile.envelopes < tierBuyoutCost(folder as Tier)} onClick={() => onBuyTier(folder as Tier)} className="py-2.5">
                  Open the Whole Folder (<Envelope n={tierBuyoutCost(folder as Tier)} />)
                </BrutalButton>
              )}
              {profile.envelopes < BALANCE.bribeTarget && (
                <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#8B0000]">Not enough Brown Envelopes. Win cases to earn more.</div>
              )}
            </div>
          </div>
        )}

        {wide && footer}
      </div>
      )}

      </div>

      {sheet === 'premium' && <PremiumSheet onClose={() => setSheet('none')} />}
      {guideOpen && <FieldGuide onClose={() => setGuideOpen(false)} />}

      {settingsOpen && (
        <SettingsSheet profile={profile} onClose={() => setSettingsOpen(false)} onReplayTutorial={onStartTraining} onImportProgress={onImportProgress} onEraseProgress={onEraseProgress} />
      )}

      {/* FIRST-RUN OFFER: a pop-up that is easy to wave away */}
      {!settings.tutorialDone && !settingsOpen && (
        <div className="absolute inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div role="dialog" aria-label="New here?" className="relative w-full max-w-[320px] bg-[#FDE68A] border-4 border-[#1A1A1A] rounded-2xl shadow-[8px_8px_0px_#1A1A1A] p-5 animate-pop-in">
            <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#8B0000]">New investigator?</div>
            <div className="font-serif font-black text-2xl leading-tight mt-1">Learn the ropes in 2 minutes</div>
            <p className="text-[12px] font-sans leading-snug mt-2">A short guided case: you plant a rumour, buy a channel and see how Heat, Evidence and Spin work. Nothing in it counts, and you can skip it any time.</p>
            <div className="flex flex-col gap-2 mt-4">
              <BrutalButton tone="ink" onClick={() => { sfx.play('click'); onStartTraining(); }}>Show me how</BrutalButton>
              <BrutalButton tone="paper" onClick={() => { sfx.play('click'); updateSettings({ tutorialDone: true }); }}>I know what I'm doing</BrutalButton>
            </div>
          </div>
        </div>
      )}

      {/* MENU (phone) */}
      {sheet === 'menu' && (
        <SheetFrame title="Menu" onClose={() => { setSheet('none'); setConfirm('none'); }}>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setSheet('perks')} className={MENU_BTN}>Perks{equipped ? ' ✓' : ''}</button>
            <button onClick={() => setSheet('archive')} className={MENU_BTN}>Archive</button>
            {onOpenBoards && <button onClick={() => { setSheet('none'); onOpenBoards(); }} className={`${MENU_BTN} col-span-2 bg-[#FDE68A]`}>🏆 Leaderboards</button>}
            <button onClick={() => setSheet('premium')} className={`${MENU_BTN} col-span-2 ${premium ? 'bg-[#D1FAE5]' : ''}`}>{premium ? '⭐ Supporter • thank you' : '⭐ Gist Pass'}</button>
            <button onClick={() => { setSheet('none'); setGuideOpen(true); }} className={MENU_BTN}>📖 Field Guide</button>
            <button onClick={() => { setSheet('none'); onStartTraining(); }} className={MENU_BTN}>? How to play</button>
            <button onClick={() => { setSheet('none'); setSettingsOpen(true); }} className={`${MENU_BTN} col-span-2`}>⚙ Settings</button>
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t-2 border-dashed border-[#1A1A1A]/30">{footer}</div>
        </SheetFrame>
      )}

      {/* ARCHIVE */}
      {sheet === 'archive' && (
        <SheetFrame title="Front-Page Archive" onClose={() => setSheet('none')}>
          {profile.archive.length === 0 && (
            <div className="text-center text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/50 py-8">No front pages yet. Take someone down.</div>
          )}
          {profile.archive.map((a, i) => (
            <div key={`${a.finishedAt}_${i}`} className="bg-[#F4F1EA] border-2 border-[#1A1A1A] rounded-lg p-3 shadow-[2px_2px_0px_#1A1A1A] rotate-[-0.3deg]">
              <div className="flex justify-between items-center">
                <div className="text-[8px] font-black uppercase tracking-[0.25em] text-[#065F46]">Target disgraced • Day {a.day}</div>
                <Stars n={a.stars ?? 1} className="text-[11px]" />
              </div>
              <div className="font-serif font-black text-sm leading-tight mt-0.5">{a.targetName}</div>
              <div className="text-[11px] font-sans italic text-slate-600 mt-0.5">"{a.scandalTitle}"</div>
              <div className="text-[9px] font-black uppercase tracking-wider text-[#1A1A1A]/50 mt-1">{a.believers.toFixed(0)}% believed • {new Date(a.finishedAt).toLocaleDateString()}</div>
            </div>
          ))}
        </SheetFrame>
      )}

      {/* SYNDICATE PERKS */}
      {sheet === 'perks' && (
        <SheetFrame title="Syndicate Perks" onClose={() => setSheet('none')}>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-sans text-slate-700 leading-snug max-w-[70%]">Spend Brown Envelopes on permanent loadout perks. Equip one per case.</div>
            <span className="bg-[#E6D5B8] border-2 border-[#1A1A1A] rounded px-2 py-1 text-xs"><Envelope n={profile.envelopes} /></span>
          </div>
          {PERKS.map(perk => {
            const owned = profile.unlockedPerks.includes(perk.id);
            const isEquipped = profile.equippedPerkId === perk.id;
            return (
              <div key={perk.id} className={`border-2 border-[#1A1A1A] rounded-lg p-3 flex flex-col gap-1.5 ${isEquipped ? 'bg-[#E6D5B8] shadow-[3px_3px_0px_#8B0000]' : 'bg-[#F4F1EA] shadow-[2px_2px_0px_#1A1A1A]'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-black text-sm leading-tight">{perk.name}</div>
                  {owned ? <span className="text-[8px] font-black tracking-widest border border-[#065F46] text-[#065F46] px-1 py-0.5 rounded-sm">OWNED</span> : <Envelope n={perk.cost} className="text-xs" />}
                </div>
                <div className="text-[10px] font-sans italic text-slate-600 leading-snug">{perk.blurb}</div>
                <div className="text-[10px] font-sans font-bold leading-snug">{perk.effectText}</div>
                {owned ? (
                  <BrutalButton tone={isEquipped ? 'paper' : 'ink'} className="py-2" onClick={() => onEquipPerk(isEquipped ? null : perk.id)}>
                    {isEquipped ? 'Unequip' : 'Equip'}
                  </BrutalButton>
                ) : (
                  <BrutalButton tone="ink" className="py-2" disabled={profile.envelopes < perk.cost} onClick={() => onBuyPerk(perk.id)}>
                    {profile.envelopes < perk.cost ? 'Not enough envelopes' : `Buy for ${perk.cost} ✉️`}
                  </BrutalButton>
                )}
              </div>
            );
          })}
        </SheetFrame>
      )}
    </div>
  );
};
