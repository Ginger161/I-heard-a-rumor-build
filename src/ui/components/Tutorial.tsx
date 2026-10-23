import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GameState } from '../../engine/types';
import { BrutalButton } from './common';
import { sfx } from '../audio';
import { markHintSeen, shouldShowHint, useSettings } from '../settings';

// The guided first case. Each step either explains something (a card; the clock is held) or waits for the player to do the
// real thing (a coach-mark ring; the game runs normally). It teaches only the loop (spread it, make it believable, stay
// safe) in a few short cards, and leaves the details to the one-time hints that appear when they first matter, and to the
// Field Guide ("Learn more"). The player can take over at any moment ("Take over" keeps the case running with the
// tutorial gone) or leave ("Skip"). Targets are found with data-tour="..." attributes.
interface Step {
  id: string;
  target?: string;                              // data-tour value to spotlight
  title: string;
  body: string;
  flow?: string[];                              // a row of chips shown under the title (the game in one line)
  modalBody?: string;                           // text to show instead while a desk is open
  action?: boolean;                             // waits for the player instead of a Next button
  done?: (gs: GameState) => boolean;            // action steps: when the step is complete
  ready?: (gs: GameState) => boolean;           // card steps: only show when true (e.g. no alert on screen)
  cta?: string;
  learn?: string;                               // Field Guide entry to open from "Learn more"
}

const noOverlay = (gs: GameState) => gs.notificationQueue.length === 0 && gs.activeModal === 'NONE';

export const TUTORIAL_STEPS: Step[] = [
  {
    id: 'welcome', title: 'You are the Gist',
    body: 'Get 75% of Nigeria to believe your story about the Target before the days run out. This practice case takes about 2 minutes and nothing in it counts.',
    flow: ['📣 Spread it', '🧾 Make them believe', '🛡️ Don’t get caught'],
    cta: "Let's go", learn: 'goal'
  },
  {
    id: 'plant', target: 'map', action: true, title: '1. Plant the rumour',
    body: 'Tap any state to start the rumour there. Big central states have the most neighbours to spread to.',
    done: gs => gs.hasPlantedSeed
  },
  {
    id: 'spark', target: 'map', action: true, title: '2. Pop the spark',
    body: 'Tap the glowing ⚡ bubble. Sparks are your money, and the clock starts when you pop it.',
    done: gs => gs.hasPoppedFirstSpark, learn: 'sparks'
  },
  {
    id: 'hud', target: 'hud', title: 'Your dashboard', ready: noOverlay,
    body: 'DAY is the clock. 👥 is how many believe you: 75% wins. 🚨 Heat is how close you are to a raid: 100% busts you. ⚡ is your cash.',
    learn: 'heat'
  },
  {
    id: 'channels', target: 'dock-channels', action: true, title: '3. Buy a Channel',
    body: 'Channels are how the story travels. Open Channels and buy “Agbero & Motor Park Loudmouths”: cheap and fast.',
    modalBody: 'Tap a pin, then Acquire. Street is cheap and fast, Social is fastest but breeds Doubt, Press builds belief, Elite opens the big cities. Gold tags match your scandal for +35%. Buy the Agbero to go on.',
    done: gs => gs.unlockedChannels.length > 0, learn: 'synergy'
  },
  {
    id: 'watch', target: 'map', title: 'Hearing is not believing', ready: noOverlay,
    body: 'Each day it spreads on its own, over borders and by air between the big cities. Velocity gets people to hear it; Credibility gets them to believe it. Hype with no proof builds Doubt. Tap any state to see who has heard, believes or is bored.',
    learn: 'doubt'
  },
  {
    id: 'fights', target: 'meters', title: 'The Target fights back', ready: noOverlay,
    body: 'At 100% Cover-Up they walk free. Evidence cuts Doubt and Cover-Up (a little Heat); Defence cools Heat. Pop the dark Spin bubbles before they go off. Random news cards will ask you to choose: there is always a free option.',
    learn: 'coverup'
  },
  {
    id: 'finish', title: 'Your game plan', ready: noOverlay,
    body: 'Seed a big state. Buy Street and Social for speed, then Press and Elite for belief. Leak Evidence when Doubt climbs, keep Heat under 70%, and reach 75% before the days end. The Field Guide in the pause menu explains every term.',
    cta: 'Take over', learn: 'goal'
  }
];

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

export const Tutorial: React.FC<TutorialProps> = ({ gameState, rootRef, onHold, onFinish, onTakeOver, onSkip, onLearn }) => {
  const initial = gameState.hasPoppedFirstSpark ? TUTORIAL_STEPS.findIndex(s => s.id === 'hud') : gameState.hasPlantedSeed ? TUTORIAL_STEPS.findIndex(s => s.id === 'spark') : 0;
  const [idx, setIdx] = useState(Math.max(0, initial));
  const [rect, setRect] = useState<Rect | null>(null);
  const step = TUTORIAL_STEPS[idx];

  // Action steps advance on their own as soon as the player has done the thing.
  useEffect(() => {
    if (step?.action && step.done?.(gameState)) {
      sfx.play('step');
      setIdx(i => Math.min(i + 1, TUTORIAL_STEPS.length - 1));
    }
  }, [gameState, step]);

  const visible = !!step && (step.action ? true : (step.ready ? step.ready(gameState) : true)) && gameState.notificationQueue.length === 0;
  const holding = visible && !step.action;
  useEffect(() => { onHold(holding); return () => onHold(false); }, [holding, onHold]);

  // Track the spotlighted element's position (layout can shift as bars animate).
  const targetName = step?.target;
  const measure = () => {
    const root = rootRef.current;
    if (!root || !targetName) { setRect(null); return; }
    const el = root.querySelector<HTMLElement>(`[data-tour="${targetName}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    const o = root.getBoundingClientRect();
    setRect({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height });
  };
  useLayoutEffect(measure, [targetName, visible, gameState.activeModal]);
  useEffect(() => {
    const t = setInterval(measure, 400);
    return () => clearInterval(t);
  });

  const lastId = useRef('');
  useEffect(() => {
    if (visible && step && lastId.current !== step.id) { lastId.current = step.id; sfx.play('hint'); }
  }, [visible, step]);

  if (!step || !visible) return null;
  const modalOpen = gameState.activeModal !== 'NONE';
  const showRing = !!rect && !modalOpen;
  const rootH = rootRef.current?.getBoundingClientRect().height ?? 800;
  // Put the card on whichever side of the spotlight has more room.
  const below = !rect || rect.y + rect.h / 2 < rootH / 2;
  const cardStyle: React.CSSProperties = showRing && rect
    ? (below ? { top: Math.min(rootH - 300, rect.y + rect.h + 14) } : { bottom: Math.max(14, rootH - rect.y + 14) })
    : { top: modalOpen ? 8 : '24%' };
  const isLast = idx === TUTORIAL_STEPS.length - 1;
  const body = modalOpen && step.modalBody ? step.modalBody : step.body;

  return (
    <div className="absolute inset-0 z-[90] pointer-events-none" aria-live="polite">
      {/* Card steps dim and block the screen; action steps leave everything tappable. */}
      {holding && <div className="absolute inset-0 pointer-events-auto" style={{ background: showRing ? 'transparent' : 'rgba(26,26,26,0.6)' }} />}
      {showRing && rect && (
        <div
          className="absolute rounded-xl border-[3px] border-[#FDE68A] animate-pulse"
          style={{ left: rect.x - 4, top: rect.y - 4, width: rect.w + 8, height: rect.h + 8, boxShadow: '0 0 0 9999px rgba(26,26,26,0.55)' }}
        />
      )}
      <div className="absolute inset-x-3 flex justify-center" style={cardStyle}>
        <div className="pointer-events-auto relative w-full max-w-[350px] bg-[#FDE68A] border-[3px] border-[#1A1A1A] rounded-xl shadow-[5px_5px_0px_#1A1A1A] p-3.5 animate-pop-in">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8B0000]">How to play</div>
            <div className="text-[9px] font-black text-[#1A1A1A]/50">Step {idx + 1} of {TUTORIAL_STEPS.length}</div>
          </div>
          <div className="font-serif font-black text-base leading-tight">{step.title}</div>
          {step.flow && <div className="flex flex-wrap items-center gap-1 mt-1.5">{step.flow.map((f, i) => <React.Fragment key={f}>{i > 0 && <span aria-hidden className="text-[#1A1A1A]/50 text-[11px]">→</span>}<span className="text-[10px] font-black bg-white border-2 border-[#1A1A1A] rounded px-1.5 py-0.5">{f}</span></React.Fragment>)}</div>}
          <p className="font-sans text-[12px] leading-snug mt-1.5 text-[#1A1A1A]">{body}</p>
          {step.action ? (
            <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#B45309]">Your turn — try it ↑</div>
          ) : (
            <BrutalButton
              tone="ink" className="mt-2.5 py-2 w-full"
              onClick={() => { sfx.play('click'); if (isLast) onFinish(); else setIdx(i => i + 1); }}
            >{step.cta ?? 'Next'}</BrutalButton>
          )}
          <div className="flex items-center justify-between gap-2 mt-2.5">
            {step.learn
              ? <button onClick={() => onLearn(step.learn!)} className="text-[10px] font-black uppercase tracking-wider underline text-[#1A1A1A] cursor-pointer">📖 Learn more</button>
              : <span />}
            <div className="flex items-center gap-3">
              {!isLast && <button onClick={onTakeOver} className="text-[10px] font-black uppercase tracking-wider underline text-[#8B0000] cursor-pointer">Take over</button>}
              <button onClick={onSkip} className="text-[10px] font-black uppercase tracking-wider underline text-[#1A1A1A]/60 cursor-pointer">Skip</button>
            </div>
          </div>
          <div className="flex gap-1 justify-center mt-2" aria-hidden>
            {TUTORIAL_STEPS.map((s, i) => <span key={s.id} className={`h-1.5 rounded-full ${i === idx ? 'w-4 bg-[#1A1A1A]' : 'w-1.5 bg-[#1A1A1A]/30'}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// One-time contextual hints, shown the first time something new matters. They never stop the clock.
// ---------------------------------------------------------------------------
interface Hint { id: string; title: string; body: string; when: (gs: GameState) => boolean }

export const HINTS: Hint[] = [
  { id: 'spin', title: 'Spin bubble!', body: 'The Target’s PR team is planting doubt. Tap the dark bubble before it detonates: a blast raises Doubt and Cover-Up.', when: gs => gs.activeSpinBubbles.length > 0 },
  { id: 'golden', title: 'Golden jackpot', body: 'A golden ⚡ is worth triple. Grab it before it fades.', when: gs => gs.activeSparks.some(s => s.kind === 'GOLDEN') },
  { id: 'decision', title: 'Decision card', body: 'Pick one option. There is always a free choice, and costly ones usually pay off.', when: gs => !!gs.notificationQueue[0]?.choices?.length },
  { id: 'evidence', title: 'Evidence is ready', body: 'The investigation unlocked a verified file. Leak it from the Evidence desk to crush Doubt and push Cover-Up back.', when: gs => gs.investigationProgress >= 25 },
  { id: 'heat', title: 'Heat is climbing', body: 'At 100% Heat the DSS raids you. The Defence desk cools it, and a SAN counter-injunction also thaws frozen channels.', when: gs => gs.heat >= 40 },
  { id: 'frozen', title: 'Channel frozen', body: 'An injunction froze a channel: it gives nothing until it thaws. A SAN Counter-Injunction thaws every frozen channel.', when: gs => Object.values(gs.frozenChannels).some(u => u >= gs.currentDay) },
  { id: 'jaded', title: 'Gist fatigue', body: 'People get bored of talk with no receipts and stop spreading it. Leak evidence to win them back.', when: gs => Object.values(gs.states).some(s => s.population > 0 && s.jaded / s.population > 0.08) },
  { id: 'stale', title: 'Story going stale', body: 'Your channels are weakening. New evidence, a new channel or a milestone refreshes the story.', when: gs => gs.freshness <= 40 },
  { id: 'coverup', title: 'Cover-Up at 50%', body: 'At 100% the Target walks free. Genuine evidence pushes it back, and high Credibility slows it.', when: gs => gs.coverUp >= 50 }
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
  return (
    <div className="absolute inset-x-3 top-[132px] z-[56] flex justify-center pointer-events-none">
      <div role="status" className="pointer-events-auto w-full max-w-[360px] bg-[#1A1A1A] text-[#F4F1EA] border-2 border-[#FDE68A] rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.35)] px-3 py-2 flex gap-2.5 items-start animate-drop-in">
        <span className="text-lg leading-none mt-0.5" aria-hidden>💡</span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#FDE68A]">{current.title}</div>
          <div className="text-[11px] font-sans leading-snug">{current.body}</div>
        </div>
        <button onClick={() => setCurrent(null)} aria-label="Dismiss hint" className="text-[10px] font-black uppercase underline text-[#FDE68A] cursor-pointer flex-shrink-0">Got it</button>
      </div>
    </div>
  );
};
