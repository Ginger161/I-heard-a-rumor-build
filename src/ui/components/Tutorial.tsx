import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GameState } from '../../engine/types';
import { BrutalButton } from './common';
import { sfx } from '../audio';
import { markHintSeen, shouldShowHint, useSettings } from '../settings';
import { nationalAverageDoubt } from '../../engine/selectors';
import { getTarget } from '../../engine/data/targets';

// THE GUIDED FIRST CASE, as lessons. A lesson appears at the moment it is needed, not on a fixed schedule: the first time Heat climbs, when
// evidence is ready, when the Target's spin bubbles appear. Each lesson either explains something (a card; the clock waits) or asks the
// player to do the real thing right now (a ring on the button, and the case keeps running). The guided case has the matching moments built
// in (engine/data/trainingEvents.ts), so every lesson really does happen. The player can take over at any time, or skip one lesson.
interface Lesson {
  id: string;
  icon: string;
  tag: string;                                  // what it teaches, shown on the card ("HEAT")
  title: string;
  body: string;
  flow?: string[];                              // a row of chips under the title
  target?: string;                              // data-tour value to spotlight
  modalBody?: string;                           // the text to show instead while a desk or sheet is open
  action?: boolean;                             // waits for the player to do it instead of a button
  ready: (gs: GameState) => boolean;            // when its moment has come
  after?: string;                               // only after this lesson is finished
  done?: (gs: GameState) => boolean;            // action lessons: when it has been done
  skipAfterDay?: number;                        // an action lesson gives up after this day (never blocks the others)
  hint?: string;                                // the plain hint toast this lesson replaces
  cta?: string;
  learn?: string;                               // Field Guide entry to open from "Learn more"
}

const avgDoubt = (gs: GameState) => nationalAverageDoubt(gs.states);
const DEFENDED = (gs: GameState) => Object.values(gs.defensePurchases).some(n => n > 0);

// Order is priority: situational lessons (Heat, Evidence, Spin) come before the "spend your sparks" nudges, so they are never held up by them.
export const LESSONS: Lesson[] = [
  { id: 'plant', icon: '📍', tag: 'START', title: 'Tap your state', body: 'The gist starts from there.', target: 'map', action: true,
    ready: gs => !gs.hasPlantedSeed, done: gs => gs.hasPlantedSeed },
  { id: 'spark', icon: '⚡', tag: 'SPARKS', title: 'Pop the ⚡', body: 'Sparks are your money. The day clock only starts when you pop this one.', target: 'map', action: true,
    ready: gs => gs.hasPlantedSeed && !gs.hasPoppedFirstSpark, done: gs => gs.hasPoppedFirstSpark, learn: 'sparks' },
  { id: 'goal', icon: '🎯', tag: 'YOUR MISSION', title: 'Make 75% believe it', body: 'Get three quarters of Nigeria to believe the rumour before the days run out. Watch these three:', target: 'hud',
    flow: ['📅 Day: time left', '👥 Believers: need 75%', '⚡ Sparks: your cash'], cta: 'Got it', learn: 'goal',
    ready: gs => gs.hasPoppedFirstSpark },
  { id: 'channels', icon: '📣', tag: 'CHANNELS', title: 'Buy your first channel', body: 'Channels are how the story travels. Open Channels and buy the cheap Agbero one.', target: 'dock-channels', action: true,
    modalBody: 'Tap the glowing Agbero pin, then Acquire. (The ? button gives you a tour of the board.)', learn: 'synergy',
    ready: gs => gs.hasPoppedFirstSpark, after: 'goal', done: gs => gs.unlockedChannels.length > 0 },
  { id: 'spread', icon: '🗺️', tag: 'HOW IT SPREADS', title: 'Now it spreads by itself', body: 'Each day the news jumps to nearby states and between the big cities. Orange: heard it. Red: believes it. Pop the ⚡ bubbles as they appear: the further the news travels, the more bubbles come.', target: 'map', cta: 'Next',
    ready: gs => gs.unlockedChannels.length > 0 && gs.currentDay >= 2, after: 'channels' },
  { id: 'heat', icon: '🚨', tag: 'HEAT', title: 'Heat: the police are coming', body: 'Heat climbs when you are loud: Social channels, leaked evidence. At 100% you are busted. Keep it below 70% by buying Defense.', target: 'heat', cta: 'Next', hint: 'heat', learn: 'heat',
    ready: gs => gs.peakHeat >= 10 },
  { id: 'defend', icon: '🛡️', tag: 'DEFENSE', title: 'Cool it down', body: 'Open Defense and buy a Burner SIM. It cuts Heat by 18%.', target: 'dock-defense', action: true,
    modalBody: 'Tap "Burner SIM", then buy it. Defense is how you stay out of jail.',
    ready: gs => gs.peakHeat >= 15, after: 'heat', done: DEFENDED },
  { id: 'evidence', icon: '🧾', tag: 'EVIDENCE', title: 'Evidence is ready: leak it', body: 'Real evidence cuts Doubt and pushes the Target’s Cover-Up back, but it adds some Heat. Open Evidence and leak your first file.', target: 'dock-evidence', action: true,
    modalBody: 'Verified files are safe. Forged ones are cheap but can backfire. Tap a verified file, then leak it.', hint: 'evidence', learn: 'evidence',
    ready: gs => gs.investigationProgress >= 25, done: gs => gs.droppedEvidence.length > 0 },
  { id: 'spin', icon: '⚫', tag: 'SPIN', title: 'Spin bubbles: pop them', body: 'The dark bubbles are the Target’s spin. Tap them before the ring runs out, or Doubt and Cover-Up jump.', target: 'map', cta: 'Pop them', hint: 'spin',
    ready: gs => gs.activeSpinBubbles.length > 0 },
  { id: 'morechannels', icon: '🛒', tag: 'CHANNELS', title: 'Spend your sparks', body: 'Buy a second channel. Social is the fastest but breeds Doubt. Press makes people believe.', target: 'dock-channels', action: true,
    modalBody: 'Pick a channel you can afford (the pins that glow), then Acquire.', skipAfterDay: 8,
    ready: gs => gs.unlockedChannels.length >= 1 && gs.sparks >= 15 && gs.currentDay >= 3, after: 'spread', done: gs => gs.unlockedChannels.length >= 2 },
  { id: 'doubt', icon: '🤨', tag: 'DOUBT', title: 'Doubt: people not buying it', body: 'Tap any state to see its Doubt. High Doubt makes people stop believing and stop sharing. Press and Elite channels, and real evidence, bring it down.', target: 'map', cta: 'Next', learn: 'doubt',
    ready: gs => avgDoubt(gs) >= 38 && gs.currentDay >= 3, after: 'spread' },
  { id: 'cover', icon: '🕵️', tag: 'COVER-UP', title: 'Cover-Up: the real enemy', body: 'At 100% the Target walks free. It rises over time, and faster as you win. Evidence pushes it back. Freshness is how new the story feels: new channels and evidence refresh it.', target: 'meters', cta: 'Next', hint: 'coverup', learn: 'coverup',
    ready: gs => gs.coverUp >= 15 || gs.currentDay >= 11 },
  { id: 'finish', icon: '🏁', tag: 'YOU ARE READY', title: 'You know the game', body: 'Pop every bubble, keep the Heat low, bring the Doubt down, and reach 75% before the days end. The Field Guide in the pause menu explains every word.', cta: 'Take over',
    ready: gs => gs.currentDay >= 14 || ['heat', 'defend', 'evidence', 'spin', 'cover'].every(id => readProgress().includes(id)) }
];

const PROGRESS_KEY = 'rumor_tour_progress';
export const readProgress = (): string[] => { try { const v = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []; } catch { return []; } };
const writeProgress = (ids: string[]) => { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(ids)); } catch { /* storage unavailable */ } };
export const clearTutorialProgress = () => { try { localStorage.removeItem(PROGRESS_KEY); } catch { /* storage unavailable */ } };

interface Rect { x: number; y: number; w: number; h: number }

interface TutorialProps {
  gameState: GameState;
  rootRef: React.RefObject<HTMLDivElement | null>;
  onHold: (hold: boolean) => void;
  onFinish: () => void;      // tutorial completed: keep playing the case
  onTakeOver: () => void;    // the player wants the controls now: keep playing the case
  onSkip: () => void;        // leave the training case
  onLearn: (term: string) => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ gameState: gs, rootRef, onHold, onFinish, onTakeOver, onSkip, onLearn }) => {
  const [doneIds, setDoneIds] = useState<string[]>(readProgress);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const doneRef = useRef(doneIds); doneRef.current = doneIds;
  const active = LESSONS.find(l => l.id === activeId) ?? null;

  const complete = useCallback((id: string) => {
    if (!doneRef.current.includes(id)) { const n = [...doneRef.current, id]; doneRef.current = n; writeProgress(n); setDoneIds(n); }
    const hint = LESSONS.find(l => l.id === id)?.hint;
    if (hint) markHintSeen(hint);                         // the plain hint toast would only repeat the lesson
    setActiveId(a => (a === id ? null : a));
  }, []);

  // Start the next lesson whose moment has come. Nothing starts while a card, desk or sheet is open.
  useEffect(() => {
    if (activeId || gs.status !== 'PLAYING') return;
    for (const l of LESSONS) {
      if (doneRef.current.includes(l.id)) continue;
      if (l.action && l.done?.(gs)) { complete(l.id); continue; }      // the player already did it
      if (l.after && !doneRef.current.includes(l.after)) continue;
      if (!l.ready(gs)) continue;
      if (gs.notificationQueue.length > 0 || gs.activeModal !== 'NONE') break;
      setActiveId(l.id); sfx.play('hint');
      break;
    }
  }, [gs, activeId, complete]);

  // A lesson that asks for an action ends the moment it is done (or when its day has passed).
  useEffect(() => {
    if (!active) return;
    if (active.action && active.done?.(gs)) { sfx.play('step'); complete(active.id); }
    else if (active.skipAfterDay && gs.currentDay > active.skipAfterDay) complete(active.id);
  }, [gs, active, complete]);

  const modalOpen = gs.activeModal !== 'NONE';
  // The Channels board has its own tour on first open; the lesson card waits until it is closed.
  const boardTourOpen = !!rootRef.current?.querySelector('[role="dialog"][aria-label="How the board works"]');
  const visible = !!active && gs.notificationQueue.length === 0 && !boardTourOpen && (!modalOpen || !!active.modalBody);
  const holding = visible && !!active && !active.action && !modalOpen;
  useEffect(() => { onHold(holding); return () => onHold(false); }, [holding, onHold]);

  // Track the spotlighted element's position (layout can shift as bars animate).
  const targetName = active?.target;
  const measure = () => {
    const root = rootRef.current;
    if (!root || !targetName) { setRect(null); return; }
    const el = root.querySelector<HTMLElement>(`[data-tour="${targetName}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    const o = root.getBoundingClientRect();
    setRect({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height });
  };
  useLayoutEffect(measure, [targetName, visible, gs.activeModal]);
  useEffect(() => {
    const t = setInterval(measure, 400);
    return () => clearInterval(t);
  });

  if (!active || !visible) return null;
  const showRing = !!rect && !modalOpen;
  const rootH = rootRef.current?.getBoundingClientRect().height ?? 800;
  // Put the card on whichever side of the spotlight has more room.
  const below = !rect || rect.y + rect.h / 2 < rootH / 2;
  const cardStyle: React.CSSProperties = showRing && rect
    ? (below ? { top: Math.min(rootH - 330, rect.y + rect.h + 14) } : { bottom: Math.max(14, rootH - rect.y + 14) })
    : { top: modalOpen ? 8 : '22%' };
  const body = modalOpen && active.modalBody ? active.modalBody : active.body;
  const n = Math.min(LESSONS.length, doneIds.length + 1);

  return (
    <div className="absolute inset-0 z-[90] pointer-events-none" aria-live="polite">
      {/* Card lessons dim and block the screen; action lessons leave everything tappable. */}
      {holding && <div className="absolute inset-0 pointer-events-auto" style={{ background: showRing ? 'transparent' : 'rgba(26,26,26,0.6)' }} />}
      {showRing && rect && (
        <div
          className="absolute rounded-xl border-[3px] border-[#FDE68A] animate-pulse"
          style={{ left: rect.x - 4, top: rect.y - 4, width: rect.w + 8, height: rect.h + 8, boxShadow: '0 0 0 9999px rgba(26,26,26,0.55)' }}
        />
      )}
      <div className="absolute inset-x-3 flex justify-center" style={cardStyle}>
        <div className={`pointer-events-auto relative w-full max-w-[350px] bg-[#FDE68A] text-[#1A1A1A] border-[3px] border-[#1A1A1A] rounded-xl shadow-[5px_5px_0px_#1A1A1A] animate-pop-in ${modalOpen ? 'p-3' : 'p-3.5'}`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7F1D1D]">{active.icon} Learn: {active.tag}</div>
            <div className="text-[11px] font-black text-[#1A1A1A]/72">Lesson {n} of {LESSONS.length}</div>
          </div>
          {!modalOpen && <div className="font-serif font-black text-xl leading-tight">{active.title}</div>}
          {!modalOpen && active.flow && <div className="flex flex-wrap items-center gap-1 mt-1.5">{active.flow.map(f => <span key={f} className="text-[11px] font-black bg-white border-2 border-[#1A1A1A] rounded px-1.5 py-0.5">{f}</span>)}</div>}
          <p className={`font-sans font-semibold leading-snug text-[#1A1A1A] ${modalOpen ? 'text-[13px]' : 'text-[14px] mt-1.5'}`}>{body}</p>
          {active.action ? (
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#7F1D1D]">Your turn 👆</span>
              <button onClick={() => complete(active.id)} className="min-h-[44px] px-2 text-[12px] font-black uppercase tracking-wider underline text-[#1A1A1A]/72 cursor-pointer">Skip this one</button>
            </div>
          ) : (
            <BrutalButton tone="ink" className="mt-2.5 py-2 w-full" onClick={() => { sfx.play('click'); if (active.id === 'finish') { complete('finish'); onFinish(); } else complete(active.id); }}>{active.cta ?? 'Next'}</BrutalButton>
          )}
          <div className="flex items-center justify-between gap-2 mt-1.5">
            {active.learn
              ? <button onClick={() => onLearn(active.learn!)} className="min-h-[44px] text-[12px] font-black uppercase tracking-wider underline px-1 text-[#1A1A1A] cursor-pointer">📖 Learn more</button>
              : <span />}
            <div className="flex items-center gap-3">
              {active.id !== 'finish' && <button onClick={onTakeOver} className="min-h-[44px] text-[12px] font-black uppercase tracking-wider underline px-1 text-[#7F1D1D] cursor-pointer">Take over</button>}
              <button onClick={onSkip} className="min-h-[44px] text-[12px] font-black uppercase tracking-wider underline px-1 text-[#1A1A1A]/72 cursor-pointer">Leave</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// One-time contextual hints, shown the first time something new matters. They never stop the clock.
// ---------------------------------------------------------------------------
interface Hint { id: string; title: string; body: string; campaign?: { title: string; body: string }; when: (gs: GameState) => boolean }

export const HINTS: Hint[] = [
  { id: 'spin', title: '⚫ Spin bubble!', body: 'Their PR team is planting doubt. Tap the dark bubble before it blows.', campaign: { title: '⚫ Hoax bubble!', body: 'A hoax is spreading. Tap the dark bubble before it lands.' }, when: gs => gs.activeSpinBubbles.length > 0 },
  { id: 'golden', title: '🌟 Golden ⚡', body: 'Worth triple. Grab am before it fades.', when: gs => gs.activeSparks.some(s => s.kind === 'GOLDEN') },
  { id: 'decision', title: '📰 News card', body: 'Pick one. There is always a free option.', when: gs => !!gs.notificationQueue[0]?.choices?.length },
  { id: 'evidence', title: '🧾 Evidence is ready', body: 'Open Evidence and leak it. Doubt drops.', campaign: { title: '🧾 Proof is ready', body: 'Open the Proof Desk and share it. Skepticism drops.' }, when: gs => gs.investigationProgress >= 25 },
  { id: 'heat', title: '🚨 Police dey watch you', body: 'Heat at 100% and you are busted. Defense cools it down.', campaign: { title: '📣 Backlash is rising', body: 'At 100% the campaign is shut down. Open the Protection Desk before then.' }, when: gs => gs.heat >= 15 },
  { id: 'frozen', title: '❄ Channel frozen', body: 'A court froze it. A SAN Counter-Injunction thaws all.', campaign: { title: '❄ Channel blocked', body: 'An official blocked it. Pro Bono Legal Counsel clears every block.' }, when: gs => Object.values(gs.frozenChannels).some(u => u >= gs.currentDay) },
  { id: 'jaded', title: '😴 Gist fatigue', body: 'People are bored of talk with no proof. Leak evidence.', campaign: { title: '😴 Campaign fatigue', body: 'People have heard the slogan too often. Share fresh proof.' }, when: gs => Object.values(gs.states).some(s => s.population > 0 && s.jaded / s.population > 0.08) },
  { id: 'stale', title: '🥱 Story going stale', body: 'New evidence or a new channel refreshes it.', when: gs => gs.freshness <= 40 },
  { id: 'coverup', title: '🛡 Cover-Up rising', body: 'At 100% the Target walks free. Evidence pushes it back.', campaign: { title: '🛡 The opposition is rising', body: 'At 100% the message is dead. Proof pushes it back.' }, when: gs => gs.coverUp >= 25 }
];

export const HintToast: React.FC<{ gameState: GameState; suppressed?: boolean }> = ({ gameState, suppressed }) => {
  const settings = useSettings();
  const [current, setCurrent] = useState<Hint | null>(null);

  useEffect(() => {
    if (current || suppressed || !settings.hints || gameState.status !== 'PLAYING' || !gameState.hasPoppedFirstSpark) return;
    const next = HINTS.find(h => shouldShowHint(h.id) && h.when(gameState));
    if (next) { markHintSeen(next.id); setCurrent(next); sfx.play('hint'); }
  }, [gameState, current, suppressed, settings.hints]);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(null), 9000);
    return () => clearTimeout(t);
  }, [current]);

  if (!current || suppressed) return null;
  const shown = getTarget(gameState.activeTargetId).campaign && current.campaign ? current.campaign : current;
  return (
    <div className="absolute inset-x-3 top-[132px] z-[56] flex justify-center pointer-events-none">
      <div role="status" className="pointer-events-auto w-full max-w-[360px] bg-[#1A1A1A] text-[#F4F1EA] border-2 border-[#FDE68A] rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.35)] px-3 py-2 flex gap-2.5 items-start animate-drop-in">
        <span className="text-lg leading-none mt-0.5" aria-hidden>💡</span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#FDE68A]">{shown.title}</div>
          <div className="text-[11px] font-sans leading-snug">{shown.body}</div>
        </div>
        <button onClick={() => setCurrent(null)} aria-label="Dismiss hint" className="text-[12px] font-black uppercase underline text-[#FDE68A] px-1 cursor-pointer flex-shrink-0">Got it</button>
      </div>
    </div>
  );
};
