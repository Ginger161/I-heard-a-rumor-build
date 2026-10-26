import React, { useEffect, useMemo, useState } from 'react';
import { GameState, WinRewards } from '../../engine/types';
import { getTarget, SCANDALS, TargetArchetype } from '../../engine/data/targets';
import { countEvidence, nationalBelieverPct } from '../../engine/selectors';
import { CAMPAIGN_ENDINGS } from '../../engine/data/campaignCopy';
import { CAMPAIGN_TYPES_META, vocabFor } from '../../engine/campaigns';
import { BrutalButton, PaperGrain } from '../components/common';
import { Avatar } from '../components/Silhouette';
import { targetEmotion } from '../mood';
import { BALANCE } from '../../engine/balance';
import { pickFrom } from '../../engine/data/copy';
import {
  LOSE_COVERUP_BODIES, LOSE_COVERUP_HEADLINES, LOSE_HEAT_BODIES, LOSE_HEAT_HEADLINES, LOSE_TIME_BODIES, LOSE_TIME_HEADLINES,
  PARODY_WIN_BODIES, PARODY_WIN_HEADLINES, WIN_BODIES, WIN_HEADLINES, fillEnd, pickTip
} from '../../engine/data/copyUi';
import { shareText } from '../../engine/share';
import { PARODY_DISCLAIMER, SHOW_DISCLAIMER } from '../../engine/data/parody';
import { sfx } from '../audio';
import { useSettings } from '../settings';
import { computeScore, encodeChallenge, encodeEntry, makeChallenge, makeEntry, playerId } from '../../engine/scores';
import { baseUrl, shareResultCard } from '../shareCard';

interface EndgameProps {
  gameState: GameState;
  rewards: WinRewards | null;
  onNewInvestigation: () => void;
  continueLabel?: string;
  // After the very first win: the next Target, as a cliffhanger with a button that starts that case.
  teaser?: { target: TargetArchetype; onPlay: () => void };
}

const Row: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = '' }) => (
  <div className={`flex justify-between items-center gap-3 px-3 py-2 border-2 border-[#1A1A1A] rounded-lg ${className}`}>
    <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{label}</span>
    <span className="text-xs font-black text-right">{value}</span>
  </div>
);

// Counts up to a number so a reward feels earned.
const CountUp: React.FC<{ to: number; ms?: number; prefix?: string }> = ({ to, ms = 900, prefix = '' }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setN(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <>{prefix}{n}</>;
};

// Pure-CSS confetti. Decorative only.
const Confetti: React.FC = () => {
  const pieces = useMemo(() => Array.from({ length: 36 }).map((_, i) => ({
    left: (i * 97) % 100,
    delay: (i % 12) * 0.12,
    dx: ((i * 53) % 120) - 60,
    color: ['#B91C1C', '#F59E0B', '#065F46', '#1D4ED8', '#7C3AED', '#FDE047'][i % 6],
    size: 6 + (i % 4) * 2
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti-fall"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 1.6, backgroundColor: p.color, animationDelay: `${p.delay}s`, ['--dx' as string]: `${p.dx}px` }}
        />
      ))}
    </div>
  );
};

// Stars and Brown Envelopes earned for a takedown, plus what the next star would have needed.
const RewardPanel: React.FC<{ gameState: GameState; rewards: WinRewards }> = ({ gameState, rewards }) => {
  const budget = gameState.dayBudget;
  const hint =
    rewards.stars >= 3
      ? 'Perfect case. Nothing left to improve.'
      : rewards.stars === 2
        ? `3 stars: win by Day ${Math.floor(budget * BALANCE.star3DayShare)} with Heat under ${BALANCE.star3PeakHeat}% and no exposed forgeries.`
        : `2 stars: win by Day ${Math.floor(budget * BALANCE.star2DayShare)} with Heat under ${BALANCE.star2PeakHeat}%.`;
  return (
    <div className="border-4 border-[#1A1A1A] bg-[#E6D5B8] rounded-xl p-3 shadow-[4px_4px_0px_#1A1A1A] flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black uppercase tracking-widest">Case rating</div>
        <div className="text-3xl tracking-widest" aria-label={`${rewards.stars} stars`}>
          {[1, 2, 3].map(i => (
            <span key={i} className={i <= rewards.stars ? 'text-[#92400E] inline-block animate-star-pop' : 'text-[#1A1A1A]/72 inline-block'} style={{ animationDelay: `${i * 0.25}s` }}>{i <= rewards.stars ? '★' : '☆'}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {rewards.breakdown.map(b => (
          <div key={b.label} className="flex justify-between text-[11px] font-sans font-bold">
            <span>{b.label}</span><span>+{b.amount} ✉️</span>
          </div>
        ))}
        <div className="flex justify-between text-xs font-sans font-black border-t-2 border-[#1A1A1A] pt-1 mt-0.5">
          <span>Brown Envelopes earned</span><span><CountUp to={rewards.total} prefix="+" /> ✉️</span>
        </div>
        <div className="text-[10px] font-sans font-bold text-[#1A1A1A]/72 text-right">Balance: {rewards.envelopesAfter} ✉️</div>
      </div>
      <div className="text-[10px] font-sans italic text-slate-700 border-t border-dashed border-[#1A1A1A] pt-1.5">{hint}</div>
    </div>
  );
};

const copyText = async (text: string): Promise<boolean> => {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* clipboard unavailable */ }
    document.body.removeChild(area);
    return ok;
  }
};

// Share the result: a front-page picture, a challenge link so a friend can play the identical case, and a score link for the group board.
const ShareButton: React.FC<{ gameState: GameState; stars: number; tone: 'ink' | 'paper' | 'crimson' | 'green' }> = ({ gameState, stars, tone }) => {
  const settings = useSettings();
  const [note, setNote] = useState<string | null>(null);
  const won = gameState.status === 'WON' && !gameState.training;
  const score = computeScore(gameState, stars);
  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(null), 2600); };
  const challenge = won ? makeChallenge(gameState, stars, settings.playerName) : null;
  const challengeLink = challenge ? `${baseUrl()}?c=${encodeChallenge(challenge)}` : baseUrl();

  const shareCard = async () => {
    sfx.play('click');
    const r = await shareResultCard(gameState, { stars, score, name: settings.playerName, url: baseUrl(), link: challengeLink });
    flash(r === 'shared' ? 'Shared!' : r === 'saved' ? 'Picture saved and text copied. Post it!' : 'Could not make the picture. Text copied.');
  };
  const shareChallenge = async () => {
    sfx.play('click');
    const text = `Beat my ${score} on ${getTarget(gameState.activeTargetId).shortName} in I Heard A Rumor: ${challengeLink}`;
    try { if (navigator.share) { await navigator.share({ text, url: challengeLink }); return; } } catch { /* fall back to copy */ }
    flash((await copyText(text)) ? 'Challenge link copied. Send it to a friend!' : 'Could not copy.');
  };
  const shareScore = async () => {
    sfx.play('click');
    const entry = makeEntry(gameState, stars, { pid: playerId(), name: settings.playerName, crew: settings.crew });
    const link = `${baseUrl()}?s=${encodeEntry(entry)}`;
    flash((await copyText(`${settings.playerName || 'I'} scored ${score} in I Heard A Rumor. Add it to your board: ${link}`)) ? 'Score link copied. Paste it in the group chat!' : 'Could not copy.');
  };

  return (
    <div className="flex flex-col gap-2">
      {gameState.status === 'WON' && (
        <BrutalButton tone="green" onClick={() => { sfx.play('click'); const text = `${shareText(gameState, stars)}

Try am: ${baseUrl()}`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener'); }}>💬 Send to WhatsApp</BrutalButton>
      )}
      <BrutalButton tone={gameState.status === 'WON' ? 'paper' : tone} onClick={shareCard}>📸 Share front page</BrutalButton>
      {won && challenge && (
        <div className="grid grid-cols-2 gap-2">
          <BrutalButton tone="paper" onClick={shareChallenge}>⚔ Challenge a friend</BrutalButton>
          <BrutalButton tone="paper" onClick={shareScore}>🏆 Share my score</BrutalButton>
        </div>
      )}
      {won && <div className="text-center text-[10px] font-sans font-bold uppercase tracking-wider text-slate-600">Score {score}{gameState.assisted ? ' (assisted counts half)' : ''}</div>}
      {note && <div role="status" className="text-center text-[11px] font-bold text-[#065F46]">{note}</div>}
    </div>
  );
};

// The cliffhanger after the first win: who is next, and one tap to go after them.
const NextHeadline: React.FC<{ teaser: NonNullable<EndgameProps['teaser']> }> = ({ teaser }) => (
  <div className="rounded-xl border-4 border-[#1A1A1A] bg-[#1A1A1A] text-[#F4F1EA] p-3 shadow-[4px_4px_0px_#B91C1C] flex flex-col gap-3">
    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FDE68A]">Next headline 👀</div>
    <div className="flex gap-3 items-center">
      <div className="w-16 h-20 flex-shrink-0 bg-[#D9CBB0] border-2 border-[#F4F1EA] rounded-md overflow-hidden"><Avatar target={teaser.target} emotion="SMUG" className="w-full h-full" /></div>
      <div className="min-w-0">
        <div className="font-serif font-black text-lg leading-tight">{teaser.target.shortName}</div>
        <div className="text-[12px] font-sans leading-snug text-[#F4F1EA]/80">"{teaser.target.scandals[0].title}"</div>
      </div>
    </div>
    <BrutalButton tone="crimson" onClick={() => { sfx.play('click'); teaser.onPlay(); }}>🔥 Spread the next one</BrutalButton>
  </div>
);

// How the Target took it: crushed when you won, laughing when you lost.
const EndPortrait: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const target = getTarget(gameState.activeTargetId);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-28 h-32 bg-[#D9CBB0] border-4 border-[#1A1A1A] rounded-lg shadow-[4px_4px_0px_#1A1A1A] overflow-hidden -rotate-2">
        <Avatar target={target} emotion={targetEmotion(gameState)} className="w-full h-full" />
      </div>
      <div className="font-serif font-black text-[11px] uppercase tracking-widest">{target.shortName}</div>
    </div>
  );
};

export const EndgameScreen: React.FC<EndgameProps> = ({ gameState, rewards, onNewInvestigation, continueLabel = 'New Investigation', teaser }) => {
  const target = getTarget(gameState.activeTargetId);
  const believers = nationalBelieverPct(gameState.states);
  const ev = countEvidence(gameState);
  const days = Math.min(gameState.currentDay, gameState.dayBudget);
  const defenses = Object.values(gameState.defensePurchases).reduce((a, b) => a + b, 0);
  const seed = gameState.copySeed;
  const vars = { Name: target.fullName, Short: target.shortName, days, day: days, pct: believers.toFixed(1) };
  const tip = pickTip(seed, gameState.status);
  const stars = rewards?.stars ?? 0;

  const rows = [
    ['Target', target.fullName],
    ['Scandal', gameState.scandalTitle || SCANDALS[gameState.scandalCategory].label],
    ['Climate', gameState.dailyKey ? `📅 Daily ${gameState.dailyKey}` : gameState.climateId.replace(/_/g, ' ').toLowerCase()],
    ['Days Taken', `${days}/${gameState.dayBudget}`],
    ['Final Believers', `${believers.toFixed(1)}%`],
    ['Peak Heat', `${Math.floor(gameState.peakHeat)}%`],
    ['Peak Cover-Up', `${Math.floor(gameState.peakCoverUp)}%`],
    ['Channels Syndicated', `${gameState.unlockedChannels.length}`],
    ['Evidence Leaked', `${ev.total}${ev.forged > 0 ? ` (${ev.forged} forged)` : ''}`]
  ];

  // ---- A CAMPAIGN: a community bulletin, not a tabloid. The same numbers, in the campaign's own words. ----
  if (target.campaign) {
    const c = target.campaign;
    const V = vocabFor(target.id);
    const meta = CAMPAIGN_TYPES_META[c.type];
    const end = CAMPAIGN_ENDINGS[c.type];
    const won = gameState.status === 'WON';
    const lost = !won ? end.lost[gameState.status === 'LOST_HEAT' ? 'LOST_HEAT' : gameState.status === 'LOST_COVERUP' ? 'LOST_COVERUP' : 'LOST_TIME'] : null;
    const fill = (t: string) => t.replace(/\{Cause\}/g, c.cause).replace(/\{Target\}/g, target.shortName).replace(/\{Adopters\}/g, c.adopter);
    const campRows = [
      ['Campaign', c.cause], ['Angle', gameState.scandalTitle || ''], ['Days Taken', `${days}/${gameState.dayBudget}`],
      [`Final ${V.adopters}`, `${believers.toFixed(1)}%`], [`Peak ${V.heat}`, `${Math.floor(gameState.peakHeat)}%`], [`Peak ${V.coverUp}`, `${Math.floor(gameState.peakCoverUp)}%`],
      ['Channels Used', `${gameState.unlockedChannels.length}`], [`${V.evidence} Shared`, `${ev.total}${ev.forged > 0 ? ` (${ev.forged} exaggerated)` : ''}`]
    ];
    return (
      <div className={`absolute inset-0 z-[120] end-root ${won ? 'bg-[#ECFDF5]' : 'bg-[#F4F1EA]'} text-[#1A1A1A] flex flex-col overflow-y-auto no-scrollbar animate-fade-in`}>
        <PaperGrain />
        {won && <Confetti />}
        <div className="relative p-5 flex flex-col gap-4">
          <div className="border-b-4 border-double pb-2 text-center" style={{ borderColor: meta.color }}>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/72"><span>{meta.icon} {meta.name} campaign</span><span>Community edition</span></div>
            <div className="font-serif font-black text-3xl uppercase tracking-tight leading-none">The Community Bulletin</div>
          </div>
          <div className="relative">
            <div className="absolute -top-2 right-0 rotate-[8deg] border-4 font-black text-sm tracking-[0.25em] px-3 py-1 bg-white/80 animate-stamp-in" style={{ borderColor: won ? '#065F46' : '#7F1D1D', color: won ? '#065F46' : '#7F1D1D' }}>{won ? 'SUCCESS' : 'NOT THIS TIME'}</div>
            <h1 className="font-serif font-black text-[32px] uppercase leading-[0.95] tracking-tight pt-6">{won ? end.win : lost!.head}</h1>
          </div>
          <p className="font-serif text-sm leading-relaxed border-t-2 border-b-2 border-[#1A1A1A] py-3">{fill(won ? end.winBody : lost!.body)}</p>
          <div className="text-[12px] font-sans font-bold leading-snug">🎯 {c.goal}</div>
          <EndPortrait gameState={gameState} />
          <div className="flex flex-col gap-2">{campRows.map(([l, v]) => <Row key={l} label={l} value={v} className="bg-white/80 shadow-[2px_2px_0px_#1A1A1A]" />)}</div>
          {won && rewards && <RewardPanel gameState={gameState} rewards={rewards} />}
          {!won && <div className="text-[12px] font-sans border-2 border-dashed border-[#1A1A1A]/60 bg-white/70 rounded-lg p-3 leading-snug"><b>Next time:</b> {gameState.status === 'LOST_HEAT' ? `Open the ${V.defenseDesk} earlier, and keep ${V.heat} low while you grow.` : gameState.status === 'LOST_COVERUP' ? `Share ${V.evidence.toLowerCase()} early and often, and pop the ${V.spin.toLowerCase()} bubbles before they land.` : 'Buy bigger channels earlier. Every day the window is open is a day people can come round.'}</div>}
          <div className="text-[10px] font-sans italic text-slate-600 text-center">Tip: {tip}</div>
          <ShareButton gameState={gameState} stars={stars} tone={won ? 'green' : 'paper'} />
          <BrutalButton tone="ink" onClick={onNewInvestigation}>{continueLabel === 'New Investigation' ? 'Back to the campaigns' : continueLabel}</BrutalButton>
        </div>
      </div>
    );
  }

  const Disclaimer = SHOW_DISCLAIMER && target.parody
    ? <div className="text-[10px] font-sans italic text-center opacity-60 px-2">{PARODY_DISCLAIMER}</div>
    : null;

  // ---- VICTORY: tabloid front page ----
  if (gameState.status === 'WON') {
    const headline = target.parody ? pickFrom(PARODY_WIN_HEADLINES, 'win-h', seed) : pickFrom(WIN_HEADLINES, 'win-h', seed);
    const body = target.parody ? pickFrom(PARODY_WIN_BODIES, 'win-b', seed) : pickFrom(WIN_BODIES, 'win-b', seed);
    return (
      <div className="absolute inset-0 z-[120] end-root bg-[#F4F1EA] text-[#1A1A1A] flex flex-col overflow-y-auto no-scrollbar animate-fade-in">
        <PaperGrain />
        <Confetti />
        <div className="relative p-5 flex flex-col gap-4">
          <div className="border-b-4 border-double border-[#1A1A1A] pb-2 text-center">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/72">
              <span>{gameState.dailyKey ? 'Daily Special' : 'Special Edition'}</span>
              <span>₦300</span>
            </div>
            <div className="font-serif font-black text-4xl uppercase tracking-tight leading-none">The Daily Gist</div>
          </div>
          <div className="relative">
            <div className="absolute -top-2 right-0 rotate-[8deg] border-4 border-[#065F46] text-[#065F46] font-black text-sm tracking-[0.25em] px-3 py-1 bg-[#F4F1EA]/80 animate-stamp-in">PUBLISHED</div>
            <h1 className="font-serif font-black text-[34px] uppercase leading-[0.95] tracking-tight pt-6">{fillEnd(headline, vars)}</h1>
          </div>
          <p className="font-serif text-sm leading-relaxed border-t-2 border-b-2 border-[#1A1A1A] py-3 first-letter:text-4xl first-letter:font-black first-letter:float-left first-letter:mr-1.5 first-letter:leading-none">
            {fillEnd(body, vars)}
          </p>
          <EndPortrait gameState={gameState} />
          {/* After the very first win the next Target comes first; the numbers are one short row, not a long list. */}
          {teaser && <NextHeadline teaser={teaser} />}
          {teaser ? (
            <Row label="Days taken" value={`${days}/${gameState.dayBudget}`} className="bg-[#EBE5D9] shadow-[2px_2px_0px_#1A1A1A]" />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {rows.map(([l, v]) => <Row key={l} label={l} value={v} className="bg-[#EBE5D9] shadow-[2px_2px_0px_#1A1A1A]" />)}
              </div>
              {rewards && <RewardPanel gameState={gameState} rewards={rewards} />}
              <div className="text-[10px] font-sans italic text-slate-600 text-center">Tip: {tip}</div>
            </>
          )}
          <ShareButton gameState={gameState} stars={stars} tone="green" />
          <BrutalButton tone="ink" onClick={onNewInvestigation}>{continueLabel}</BrutalButton>
          {Disclaimer}
        </div>
      </div>
    );
  }

  // ---- DEFEAT: BUSTED (red DSS security report) ----
  if (gameState.status === 'LOST_HEAT') {
    return (
      <div className="absolute inset-0 z-[120] end-root bg-[#FFE4E6] text-[#1A1A1A] flex flex-col overflow-y-auto no-scrollbar animate-fade-in">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 3px, rgba(139,0,0,0.25) 3px 4px)' }} />
        <div className="relative bg-[#8B0000] text-white px-4 py-2 flex justify-between font-mono text-[10px] font-black tracking-widest">
          <span>DEPT OF STATE SERVICES</span>
          <span>INCIDENT REPORT // FINAL</span>
        </div>
        <div className="relative p-5 flex flex-col gap-4">
          <div className="self-start rotate-[-4deg] border-4 border-[#8B0000] text-[#8B0000] font-black text-lg tracking-[0.2em] px-3 py-1 animate-stamp-in">BUSTED</div>
          <h1 className="font-mono font-black text-2xl uppercase leading-tight text-[#8B0000]">{fillEnd(pickFrom(LOSE_HEAT_HEADLINES, 'lh-h', seed), vars)}</h1>
          <p className="font-mono text-xs leading-relaxed bg-white/70 border border-[#8B0000] p-3">{fillEnd(pickFrom(LOSE_HEAT_BODIES, 'lh-b', seed), vars)}</p>
          <EndPortrait gameState={gameState} />
          <div className="flex flex-col gap-2">
            {rows.map(([l, v]) => <Row key={l} label={l} value={v} className="bg-white/70 border-[#8B0000] font-mono" />)}
          </div>
          <div className="font-mono text-xs border-2 border-dashed border-[#8B0000] bg-[#FEE2E2] p-3 leading-relaxed">
            <span className="font-black text-[#8B0000]">FIELD TIP:</span>{' '}
            {defenses === 0
              ? 'You never opened the Defense Desk. Burner SIMs, the Darknet Relay and the Safehouse panic button are all cheaper than losing the case. Spend Sparks on OpSec before Heat passes 70%.'
              : `You bought ${defenses} OpSec upgrade${defenses > 1 ? 's' : ''}, but Heat still outran you. Buy the Darknet Relay early (it cuts daily Heat) and keep 40 ⚡ in reserve for the Safehouse.`}
          </div>
          <div className="text-[10px] font-mono italic text-[#8B0000]/80 text-center">Tip: {tip}</div>
          <ShareButton gameState={gameState} stars={0} tone="paper" />
          <BrutalButton tone="crimson" onClick={onNewInvestigation}>{continueLabel}</BrutalButton>
          {Disclaimer}
        </div>
      </div>
    );
  }

  // ---- DEFEAT: STORY SPUN (the Cover-Up reached 100%) ----
  if (gameState.status === 'LOST_COVERUP') {
    return (
      <div className="absolute inset-0 z-[120] end-root bg-[#FAF8F5] text-[#1A1A1A] flex flex-col overflow-y-auto no-scrollbar animate-fade-in">
        <PaperGrain />
        <div className="relative m-3 border-double border-[6px] border-[#1A1A1A] p-1">
          <div className="border border-[#1A1A1A] p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-[#1A1A1A] pb-2">
              <div className="w-10 h-10 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center font-serif font-black">★</div>
              <div>
                <div className="font-serif font-bold text-[11px] uppercase tracking-[0.2em]">Office of the Principal</div>
                <div className="font-serif text-[10px] uppercase tracking-widest text-slate-600">Press Secretariat • For immediate release</div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-2 right-0 rotate-[-8deg] border-4 border-[#8B0000] text-[#8B0000] font-black text-sm tracking-[0.25em] px-2 py-0.5 bg-[#FAF8F5]/80 animate-stamp-in">CASE CLOSED</div>
              <h1 className="font-serif font-black text-[30px] uppercase leading-[0.95] tracking-tight pt-10">{fillEnd(pickFrom(LOSE_COVERUP_HEADLINES, 'lc-h', seed), vars)}</h1>
            </div>
            <p className="font-serif text-sm leading-relaxed italic border-l-4 border-[#1A1A1A] pl-3">
              "After a thorough review, the matter is closed. All allegations were baseless and unsupported by evidence. {target.fullName} thanks the people for their prayers and looks forward to continuing."
            </p>
            <p className="font-serif text-xs leading-relaxed">{fillEnd(pickFrom(LOSE_COVERUP_BODIES, 'lc-b', seed), vars)}</p>
            <EndPortrait gameState={gameState} />
            <div className="flex flex-col gap-2">
              {rows.map(([l, v]) => <Row key={l} label={l} value={v} className="bg-[#EBE5D9] shadow-[2px_2px_0px_#1A1A1A]" />)}
            </div>
            <div className="font-serif text-xs italic border-l-4 border-[#8B0000] pl-3 leading-relaxed">
              Tip: the Cover-Up rises faster when more people believe, and slower when your Credibility is high. Verified evidence pushes it back, and a SAN Counter-Injunction thaws frozen channels and blocks the next injunctions.
            </div>
            <div className="text-[10px] font-serif italic text-slate-600 text-center">{tip}</div>
            <ShareButton gameState={gameState} stars={0} tone="paper" />
            <BrutalButton tone="ink" onClick={onNewInvestigation}>{continueLabel}</BrutalButton>
            {Disclaimer}
          </div>
        </div>
      </div>
    );
  }

  // ---- DEFEAT: FIZZLED OUT (tabloid front page, the story dies) ----
  return (
    <div className="absolute inset-0 z-[120] end-root bg-[#E7E2D6] text-[#1A1A1A] flex flex-col overflow-y-auto no-scrollbar animate-fade-in">
      <PaperGrain />
      <div className="relative p-5 flex flex-col gap-4">
        <div className="border-b-4 border-double border-[#1A1A1A] pb-2 text-center">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/72">
            <span>Late Edition</span>
            <span>₦300</span>
          </div>
          <div className="font-serif font-black text-4xl uppercase tracking-tight leading-none">The Daily Gist</div>
        </div>
        <div className="relative">
          <div className="absolute -top-2 right-0 rotate-[8deg] border-4 border-[#8B0000] text-[#8B0000] font-black text-sm tracking-[0.2em] px-3 py-1 bg-[#E7E2D6]/80 animate-stamp-in">TIME&apos;S UP</div>
          <h1 className="font-serif font-black text-[32px] uppercase leading-[0.95] tracking-tight pt-6">{fillEnd(pickFrom(LOSE_TIME_HEADLINES, 'lt-h', seed), vars)}</h1>
        </div>
        <p className="font-serif text-sm leading-relaxed border-t-2 border-b-2 border-[#1A1A1A] py-3 first-letter:text-4xl first-letter:font-black first-letter:float-left first-letter:mr-1.5 first-letter:leading-none">
          {fillEnd(pickFrom(LOSE_TIME_BODIES, 'lt-b', seed), vars)}
        </p>
        <EndPortrait gameState={gameState} />
        <div className="flex flex-col gap-2">
          {rows.map(([l, v]) => <Row key={l} label={l} value={v} className="bg-[#D9D3C3] shadow-[2px_2px_0px_#1A1A1A]" />)}
        </div>
        <div className="font-serif text-xs italic border-l-4 border-[#1A1A1A] pl-3 leading-relaxed">
          Editor&apos;s note: Stories die when the receipts run dry. Chain PRESS and ELITE channels early, and leak verified evidence before Doubt hardens into Gist Fatigue.
        </div>
        <div className="text-[10px] font-serif italic text-slate-600 text-center">{tip}</div>
        <ShareButton gameState={gameState} stars={0} tone="paper" />
        <BrutalButton tone="ink" onClick={onNewInvestigation}>{continueLabel}</BrutalButton>
        {Disclaimer}
      </div>
    </div>
  );
};
