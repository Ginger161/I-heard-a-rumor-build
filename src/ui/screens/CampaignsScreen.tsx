import React, { useMemo, useState } from 'react';
import { BrutalButton, PaperGrain } from '../components/common';
import { Avatar } from '../components/Silhouette';
import { sfx } from '../audio';
import { CAMPAIGN_DEFS } from '../../engine/data/campaigns';
import { getTarget } from '../../engine/data/targets';
import { CAMPAIGN_TYPES_META, ANGLE_NAMES } from '../../engine/campaigns';
import type { CampaignType, TargetArchetype } from '../../engine/data/targetTypes';
import type { ScandalCategory } from '../../engine/data/channels';
import type { MetaProfile } from '../../engine/profile';

// THE CAMPAIGNS HUB: spread something good. Five kinds, three campaigns each, from gentle to hard. The same game underneath (channels, proof,
// protection, bubbles), with the words and the opposition changed. Each campaign has four angles; the one you pick decides which channels
// work harder (the same "synergy" idea as a scandal's category).
const TYPES: CampaignType[] = ['HEALTH', 'AWARENESS', 'POLITICAL', 'MARKETING', 'MYTHBUST'];
const LEVEL = ['', 'Gentle', 'Steady', 'Tough'];

interface Props {
  profile: MetaProfile;
  onBack: () => void;
  onPlay: (targetId: string, category: ScandalCategory) => void;
}

const Stars: React.FC<{ n: number }> = ({ n }) => (
  <span className="text-[13px] tracking-tight" aria-label={`${n} stars`}>{[1, 2, 3].map(i => <span key={i} className={i <= n ? 'text-[#B45309]' : 'text-[var(--m-ink)]/72'}>{i <= n ? '★' : '☆'}</span>)}</span>
);

const Shell: React.FC<{ title: string; onBackClick: () => void; children: React.ReactNode }> = ({ title, onBackClick, children }) => (
  <div data-mode="campaign" className="relative flex-1 min-h-0 tex-campaign text-[var(--m-ink)] font-serif flex flex-col overflow-hidden">
    <PaperGrain />
    <div className="relative flex-shrink-0 px-3 py-2.5 border-b-4 border-double border-[var(--m-line)] flex items-center gap-3 bg-[var(--m-header)]">
      <button onClick={() => { sfx.play('click'); onBackClick(); }} aria-label="Back" className="w-11 h-11 rounded-full border-2 border-[var(--m-line)] bg-[var(--m-surface2)] font-black cursor-pointer flex-shrink-0">←</button>
      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--m-accent-text)]">Campaigns</div>
        <h1 className="text-[16px] font-black uppercase tracking-tight leading-none truncate">{title}</h1>
      </div>
    </div>
    <div className="relative overflow-y-auto no-scrollbar p-3.5 flex flex-col gap-3.5 flex-1">{children}</div>
  </div>
);

export const CampaignsScreen: React.FC<Props> = ({ profile, onBack, onPlay }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [angle, setAngle] = useState<ScandalCategory>('FINANCIAL');
  const [type, setType] = useState<CampaignType | 'ALL'>('ALL');
  const done = useMemo(() => CAMPAIGN_DEFS.filter(d => (profile.targetStars[d.id] ?? 0) > 0).length, [profile.targetStars]);
  const defs = CAMPAIGN_DEFS.filter(d => type === 'ALL' || d.campaign?.type === type);
  const open: TargetArchetype | null = openId ? getTarget(openId) : null;

  // ------------------------------------------------------------------ one campaign: the brief and its four angles
  if (open && open.campaign) {
    const c = open.campaign;
    const meta = CAMPAIGN_TYPES_META[c.type];
    const stars = profile.targetStars[open.id] ?? 0;
    return (
      <Shell title={c.cause} onBackClick={() => setOpenId(null)}>
        <div className="rounded-xl border-2 border-[var(--m-line)] bg-[var(--m-surface2)] p-3.5 shadow-[3px_3px_0px_var(--m-line)]">
          <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: meta.color }}>{meta.icon} {meta.name} • {LEVEL[open.tier] ?? ''}</div>
          <div className="font-serif font-black text-[24px] leading-tight mt-0.5">{c.cause}</div>
          <div className="text-[14px] font-sans font-bold leading-snug mt-1">“{c.slogan}”</div>
          <div className="text-[13px] font-sans leading-snug mt-2.5">🎯 {c.goal}</div>
          <div className="flex items-center justify-between mt-2"><Stars n={stars} /><span className="text-[11px] font-sans font-bold text-[var(--m-soft)]">{stars > 0 ? 'Won before' : 'Not won yet'}</span></div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-[var(--m-line)] bg-[var(--m-surface)] p-3">
          <Avatar target={open} emotion="SMUG" className="w-14 h-16 flex-shrink-0 bg-[var(--m-sunk)] rounded border-2 border-[var(--m-line)]" />
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--m-accent-text)]">Standing in the way</div>
            <div className="font-serif font-black text-[16px] leading-tight">{open.fullName}</div>
            <div className="text-[12px] font-sans text-[var(--m-soft)] leading-snug">{open.title}. {c.opposition}.</div>
          </div>
        </div>

        <div>
          <div className="font-serif font-black text-[18px] leading-tight">Choose your angle</div>
          <p className="text-[12px] font-sans text-[var(--m-soft)] leading-snug mt-0.5">The angle decides which channels work harder (+35%). Pick the one that fits the channels you plan to buy.</p>
          <div className="flex flex-col gap-2 mt-2">
            {open.scandals.map(s => (
              <button key={s.category} onClick={() => { sfx.play('click'); setAngle(s.category); }} aria-pressed={angle === s.category}
                className={`text-left rounded-xl border-2 border-[var(--m-line)] p-3 cursor-pointer transition-all min-h-[56px] ${angle === s.category ? 'bg-[var(--m-accent2)] text-[var(--m-accent2-ink)] shadow-[3px_3px_0px_var(--m-line)]' : 'bg-[var(--m-surface2)]'}`}>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80">{ANGLE_NAMES[s.category]}</div>
                <div className="font-serif font-black text-[15px] leading-tight">{s.title}</div>
              </button>
            ))}
          </div>
        </div>

        <BrutalButton tone="ink" className="py-3.5" onClick={() => { sfx.play('stamp'); onPlay(open.id, angle); }}>▶ Launch the campaign</BrutalButton>
        <p className="text-[11px] font-sans text-[var(--m-soft)] leading-snug">Same game, new words. Win by getting 75% of the country on board. Lose if the opposition reaches 100%, the backlash reaches 100%, or time runs out. Bold exaggerations spread fast, and can backfire when they are checked.</p>
      </Shell>
    );
  }

  // ------------------------------------------------------------------ the list
  return (
    <Shell title="Spread something good" onBackClick={onBack}>
      <div className="rounded-xl border-2 border-[var(--m-line)] bg-[var(--m-accent2)] text-[var(--m-accent2-ink)] p-3.5 shadow-[3px_3px_0px_var(--m-line)]">
        <div className="text-[10px] font-black uppercase tracking-[0.2em]">📣 Campaigns • {done}/{CAMPAIGN_DEFS.length} won</div>
        <div className="font-serif font-black text-[21px] leading-tight mt-0.5">Not every rumour has to be a scandal.</div>
        <p className="text-[12px] font-sans leading-snug mt-1">Health drives, civic drives, product launches and myth-busters. The same channels, the same bubbles, a different enemy: apathy, a hoax, a rival.</p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Campaign kinds">
        {(['ALL', ...TYPES] as const).map(t => (
          <button key={t} role="tab" aria-selected={type === t} onClick={() => { sfx.play('click'); setType(t); }}
            className={`min-h-[44px] px-3 rounded-full border-2 border-[var(--m-line)] text-[11px] font-black uppercase tracking-wider cursor-pointer ${type === t ? 'bg-[var(--m-btn-ink-bg)] text-[var(--m-btn-ink-fg)]' : 'bg-[var(--m-surface2)]'}`}>
            {t === 'ALL' ? 'All' : `${CAMPAIGN_TYPES_META[t].icon} ${CAMPAIGN_TYPES_META[t].name}`}
          </button>
        ))}
      </div>

      {(type === 'ALL' ? TYPES : [type]).map(t => {
        const rows = defs.filter(d => d.campaign?.type === t);
        if (rows.length === 0) return null;
        const meta = CAMPAIGN_TYPES_META[t];
        return (
          <div key={t}>
            <div className="border-b-2 border-[var(--m-line)] pb-1 mb-2">
              <div className="font-serif font-black text-base uppercase tracking-wide">{meta.icon} {meta.name}</div>
              <div className="text-[11px] font-sans italic text-[var(--m-soft)]">{meta.blurb}</div>
            </div>
            <div className="flex flex-col gap-2">
              {rows.map(d => {
                const a = getTarget(d.id);
                const stars = profile.targetStars[d.id] ?? 0;
                return (
                  <button key={d.id} onClick={() => { sfx.play('click'); setOpenId(d.id); setAngle(a.scandals[0].category); }}
                    className="text-left flex items-center gap-3 border-2 border-[var(--m-line)] rounded-xl p-2.5 bg-[var(--m-surface2)] cursor-pointer active:translate-y-[2px] min-h-[64px]">
                    <div className="w-11 h-12 flex-shrink-0 rounded border-2 border-[var(--m-line)] overflow-hidden bg-[var(--m-sunk)]"><Avatar target={a} className="w-full h-full" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-serif font-black text-[15px] leading-tight">{d.campaign!.cause}</div>
                      <div className="text-[11px] font-sans text-[var(--m-soft)] leading-snug">{LEVEL[d.tier]} • against {a.shortName.toLowerCase()}</div>
                    </div>
                    <div className="flex-shrink-0 text-right"><Stars n={stars} /></div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-[10px] font-sans italic text-[var(--m-soft)] leading-snug">Every campaign, hoax and organisation here is invented. In myth-busting campaigns you spread the correction; the hoax is the opponent.</p>
    </Shell>
  );
};
