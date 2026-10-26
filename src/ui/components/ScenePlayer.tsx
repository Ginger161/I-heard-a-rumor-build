import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Beat, CastId, ChatMsg, Mood, Scene, StoryEffects } from '../../engine/season/types';
import { CAST_INFO } from '../../engine/season/cast';
import { CLUE_BY_ID } from '../../engine/season/clues';
import { StoryProgress, addClue, applyStoryEffects, condHolds } from '../../engine/story';
import { getTarget } from '../../engine/data/targets';
import type { TargetArchetype } from '../../engine/data/targetTypes';
import { Avatar } from './Silhouette';
import { sfx, haptic } from '../audio';

// THE SCENE PLAYER: the film layer. It plays a scene's beats full screen, one at a time. Tap to go on; messages arrive one by one; a
// choice stops the film until the player decides (and a timed choice decides for them). Everything here is dark, because it is night.

const NAMES: Record<string, string> = { oracle: '@OracleNaija', you: 'You', m1: 'Member', m2: 'Member', m3: 'Member', system: '' };

const portraitOf = (who: Exclude<CastId, 'you'>, targetId?: string | null): TargetArchetype => {
  if (who === 'target') return getTarget(targetId);
  const info = CAST_INFO[who];
  const t = getTarget(info.id);
  // Real Targets (Halo, Ngozi, Gistlord, Mbakwe) have faces; the rest are drawn from their entry in the faces list.
  return t.id === info.id ? t : ({ id: info.id, silhouette: info.sil, avatar: undefined } as unknown as TargetArchetype);
};
const nameOf = (from: string, targetId?: string | null): string =>
  from === 'target' ? getTarget(targetId).shortName : NAMES[from] ?? (CAST_INFO[from as keyof typeof CAST_INFO]?.name ?? from);
const colorOf = (from: string): string => (from === 'oracle' ? '#F59E0B' : CAST_INFO[from as keyof typeof CAST_INFO]?.color ?? '#94A3B8');

const MOOD_RING: Record<Mood, string> = { NEUTRAL: '#94A3B8', CONFIDENT: '#34D399', SMUG: '#F59E0B', ANGRY: '#EF4444', WORRIED: '#38BDF8', PANIC: '#F43F5E', DEFEATED: '#64748B', LAUGH: '#FBBF24' };

const TAP = 'text-[10px] font-black uppercase tracking-[0.3em] text-[var(--m-ink)]/72 animate-hint';

// ---- one beat at a time ----------------------------------------------------------------------------------------------------
const Typewriter: React.FC<{ text: string; speed?: number; onDone?: () => void; skip?: boolean }> = ({ text, speed = 22, onDone, skip }) => {
  const [n, setN] = useState(0);
  useEffect(() => { setN(0); }, [text]);
  useEffect(() => {
    if (skip) { setN(text.length); return; }
    if (n >= text.length) { onDone?.(); return; }
    const t = setTimeout(() => setN(k => Math.min(text.length, k + 1)), speed);
    return () => clearTimeout(t);
  }, [n, text, speed, skip, onDone]);
  return <>{text.slice(0, n)}</>;
};

const ChatBeat: React.FC<{ beat: Extract<Beat, { t: 'chat' }>; targetId?: string | null; fast: boolean; onComplete: () => void }> = ({ beat, targetId, fast, onComplete }) => {
  const [shown, setShown] = useState(fast ? beat.msgs.length : 0);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (fast) setShown(beat.msgs.length); }, [fast, beat.msgs.length]);
  useEffect(() => {
    if (shown >= beat.msgs.length) { setTyping(false); onComplete(); return; }
    setTyping(true);
    const m = beat.msgs[shown];
    const t = setTimeout(() => { setTyping(false); setShown(k => k + 1); sfx.play('hint'); haptic(8); }, Math.min(1700, 520 + m.text.length * 16));
    return () => clearTimeout(t);
  }, [shown, beat.msgs, onComplete]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [shown, typing]);
  const next = beat.msgs[shown];
  return (
    <div className="w-full max-w-[400px] flex flex-col gap-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-t-2xl bg-[var(--m-surface2)] border border-[var(--m-line)]">
        <span className="w-2 h-2 rounded-full bg-[#34D399]" aria-hidden />
        <span className="text-[12px] font-black tracking-wide text-[var(--m-ink)]">{beat.title}</span>
      </div>
      <div className="flex flex-col gap-1.5 max-h-[52vh] overflow-y-auto no-scrollbar px-1">
        {beat.msgs.slice(0, shown).map((m, i) => <Bubble key={i} m={m} targetId={targetId} />)}
        {typing && next && (
          <div className={`flex ${next.from === 'you' ? 'justify-end' : 'justify-start'}`}>
            <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--m-surface2)] text-[var(--m-soft)] tracking-widest text-[14px] animate-pulse">•••</div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

const Bubble: React.FC<{ m: ChatMsg; targetId?: string | null }> = ({ m, targetId }) => {
  const mine = m.from === 'you';
  const sys = m.from === 'system';
  if (sys) return <div className="self-center text-[11px] font-mono text-[var(--m-soft)] bg-[var(--m-sunk)] border border-[var(--m-line)] rounded px-2 py-1 animate-pop-in">{m.text}</div>;
  const c = colorOf(String(m.from));
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-pop-in`}>
      <div className={`max-w-[84%] px-3 py-2 rounded-2xl ${mine ? 'rounded-br-sm bg-[#0F766E] text-white' : 'rounded-bl-sm bg-[var(--m-surface2)] text-[var(--m-ink)] border'} `} style={mine ? undefined : { borderColor: c }}>
        {!mine && <div className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: c }}>{nameOf(String(m.from), targetId)}</div>}
        <div className="text-[14px] font-sans leading-snug">{m.text}</div>
      </div>
    </div>
  );
};

const VoiceBeat: React.FC<{ beat: Extract<Beat, { t: 'voice' }>; skip: boolean; onComplete: () => void }> = ({ beat, skip, onComplete }) => {
  const bars = useMemo(() => Array.from({ length: 34 }, (_, i) => 6 + Math.round(Math.abs(Math.sin(i * 1.7) * 22 + Math.cos(i * 0.6) * 8))), []);
  return (
    <div className="w-full max-w-[400px] flex flex-col gap-3">
      <div className="bg-[var(--m-surface2)] border border-[var(--m-line)] rounded-2xl p-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--m-accent2)]">🎙 Voice note • {beat.from}</div>
        <div className="flex items-end gap-[3px] h-9 mt-2" aria-hidden>
          {bars.map((h, i) => <span key={i} className="flex-1 rounded-full bg-[var(--m-accent)] animate-pulse" style={{ height: h, animationDelay: `${(i % 7) * 90}ms`, opacity: 0.55 + (i % 3) * 0.15 }} />)}
        </div>
        <div className="text-[10px] font-mono text-[var(--m-soft)] mt-1">0:00 / 0:{String(beat.secs).padStart(2, '0')}</div>
      </div>
      <div className="font-serif italic text-[16px] leading-relaxed text-[var(--m-ink)] px-1">“<Typewriter text={beat.text} speed={26} skip={skip} onDone={onComplete} />”</div>
    </div>
  );
};

const DocBeat: React.FC<{ beat: Extract<Beat, { t: 'doc' }>; skip: boolean; onComplete: () => void }> = ({ beat, skip, onComplete }) => {
  const [n, setN] = useState(skip ? beat.lines.length : 0);
  useEffect(() => {
    if (skip) { setN(beat.lines.length); return; }
    if (n >= beat.lines.length) { onComplete(); return; }
    const t = setTimeout(() => { setN(k => k + 1); sfx.play('click'); }, 380);
    return () => clearTimeout(t);
  }, [n, skip, beat.lines.length, onComplete]);
  const tag = { notes: 'NOTES', ledger: 'LEDGER', email: 'EMAIL', receipt: 'RECEIPT', court: 'COURT ORDER', draft: 'NOTES • DRAFT' }[beat.kind];
  const mono = beat.kind === 'ledger' || beat.kind === 'receipt';
  return (
    <div className="w-full max-w-[400px] bg-[#F4F1EA] text-[#1A1A1A] rounded-lg border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,.6)] rotate-[-0.6deg] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1A1A1A] text-[#F4F1EA]">
        <span className="text-[10px] font-black tracking-[0.25em]">{tag}</span>
        <span className="text-[10px] font-mono opacity-70 truncate max-w-[70%]">{beat.title}</span>
      </div>
      <div className={`p-3.5 flex flex-col gap-1.5 ${mono ? 'font-mono text-[12px]' : 'font-sans text-[14px]'} leading-snug`}>
        {beat.lines.slice(0, n).map((l, i) => (
          <div key={i} className={`animate-fade-in ${beat.mark?.includes(i) ? 'bg-[#FDE047] px-1 -mx-1 font-bold' : ''}`}>{l}</div>
        ))}
      </div>
    </div>
  );
};

const StillBeat: React.FC<{ beat: Extract<Beat, { t: 'still' }> }> = ({ beat }) => (
  <div className="w-full max-w-[400px] flex flex-col gap-2">
    <div className="relative h-[210px] rounded-md border-2 border-[#1F2937] bg-[#0b130f] overflow-hidden" style={{ filter: 'contrast(1.1) saturate(.7)' }}>
      <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, rgba(120,255,160,.07) 0 2px, transparent 2px 4px)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(120,255,160,.14), transparent 62%)' }} />
      <div className="absolute left-[34%] top-[30%] w-[34%] h-[40%] border-2 border-[#FDE047] animate-pulse" aria-hidden />
      <div className="absolute left-2 top-2 text-[11px] font-mono text-[#86efac]">● {beat.cam}</div>
      <div className="absolute right-2 top-2 text-[11px] font-mono text-[#86efac]">{beat.time}</div>
      <div className="absolute left-2 bottom-2 text-[10px] font-mono text-[#86efac]/80">REC</div>
    </div>
    <div className="font-serif text-[16px] leading-snug text-[var(--m-ink)]">{beat.caption}</div>
    {beat.detail && <div className="text-[13px] font-sans leading-snug text-[var(--m-accent2)]">{beat.detail}</div>}
  </div>
);

const NewsBeat: React.FC<{ beat: Extract<Beat, { t: 'news' }> }> = ({ beat }) => (
  <div className="w-full max-w-[400px] flex flex-col">
    <div className="bg-[#B91C1C] text-white text-[11px] font-black tracking-[0.25em] px-3 py-1.5 flex justify-between"><span>BREAKING</span><span className="opacity-80">{beat.channel}</span></div>
    <div className="bg-[#0b1220] border-x-2 border-[#B91C1C] px-3 py-4 font-serif font-black text-[22px] leading-tight text-white">{beat.headline}</div>
    {beat.ticker && <div className="bg-[#111827] border-2 border-t-0 border-[#B91C1C] px-3 py-1.5 text-[11px] font-mono text-[#FDE68A] overflow-hidden whitespace-nowrap"><span className="inline-block animate-pulse">{beat.ticker}</span></div>}
  </div>
);

const SayBeat: React.FC<{ beat: Extract<Beat, { t: 'say' }>; targetId?: string | null; skip: boolean; onComplete: () => void }> = ({ beat, targetId, skip, onComplete }) => {
  const you = beat.who === 'you';
  const mood = beat.mood ?? 'NEUTRAL';
  return (
    <div className="w-full max-w-[400px] flex flex-col items-center gap-3">
      {!you && (
        <div className="w-28 h-32 rounded-lg overflow-hidden border-[3px] bg-[#2A3350]" style={{ borderColor: MOOD_RING[mood], boxShadow: `0 0 24px ${MOOD_RING[mood]}66` }}>
          <Avatar target={portraitOf(beat.who as Exclude<CastId, 'you'>, targetId)} emotion={mood} className={`w-full h-full ${mood === 'PANIC' ? 'avatar-shake' : ''}`} />
        </div>
      )}
      <div className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: you ? '#2DD4BF' : colorOf(beat.who) }}>{you ? 'You' : nameOf(beat.who, targetId)}</div>
      <div className="font-serif text-[19px] leading-relaxed text-center text-[var(--m-ink)] px-1">“<Typewriter text={beat.text} speed={20} skip={skip} onDone={onComplete} />”</div>
    </div>
  );
};

const ClueBeat: React.FC<{ id: string; onShown: () => void }> = ({ id, onShown }) => {
  const c = CLUE_BY_ID[id];
  useEffect(() => { sfx.play('stamp'); haptic([20, 40, 20]); onShown(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!c) return null;
  return (
    <div className="w-full max-w-[380px] flex flex-col items-center gap-3">
      <div className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--m-accent-text)] animate-stamp-in">New clue pinned</div>
      <div className="relative w-full bg-[#F4F1EA] text-[#1A1A1A] rounded-md border-2 border-black p-4 shadow-[6px_6px_0px_rgba(0,0,0,.6)] rotate-[1.2deg] animate-pop-in">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#E11D48] border-2 border-black shadow-md" aria-hidden />
        <div className="text-[10px] font-black tracking-[0.3em] text-[#8B0000]">CLUE {String(c.n).padStart(2, '0')} / 24</div>
        <div className="font-serif font-black text-[20px] leading-tight mt-1">{c.title}</div>
        <p className="font-sans text-[13px] leading-snug mt-1.5">{c.detail}</p>
      </div>
    </div>
  );
};

const ChoiceBeat: React.FC<{ beat: Extract<Beat, { t: 'choice' }>; story: StoryProgress; onPick: (optionId: string, auto: boolean) => void }> = ({ beat, story, onPick }) => {
  const options = beat.options.filter(o => condHolds(story, o.when));
  const [left, setLeft] = useState(beat.timer ?? 0);
  const done = useRef(false);
  const pick = useCallback((id: string, auto: boolean) => { if (done.current) return; done.current = true; onPick(id, auto); }, [onPick]);
  useEffect(() => {
    if (!beat.timer) return;
    if (left <= 0) { pick(beat.fallback && options.some(o => o.id === beat.fallback) ? beat.fallback : options[options.length - 1].id, true); return; }
    if (left <= 5) sfx.play('tick');
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, beat, pick]);
  return (
    <div className="w-full max-w-[400px] flex flex-col gap-3">
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--m-accent-text)]">A decision</div>
      <div className="font-serif font-black text-[22px] leading-tight text-[var(--m-ink)]">{beat.prompt}</div>
      {beat.timer ? (
        <div className="h-2 rounded-full bg-[var(--m-sunk)] border border-[var(--m-line)] overflow-hidden" aria-label={`${left} seconds left`}>
          <div className="h-full bg-[var(--m-accent)] transition-all duration-1000 ease-linear" style={{ width: `${(left / beat.timer) * 100}%` }} />
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        {options.map(o => (
          <button key={o.id} onClick={() => { sfx.play('pop'); pick(o.id, false); }} className="text-left min-h-[56px] rounded-xl border-2 border-[var(--m-line)] bg-[var(--m-surface2)] px-4 py-3 cursor-pointer active:translate-y-[2px] hover:border-[var(--m-accent)]">
            <div className="font-black text-[15px] leading-tight text-[var(--m-ink)]">{o.label}</div>
            {o.hint && <div className="text-[12px] font-sans text-[var(--m-soft)] leading-snug mt-0.5">{o.hint}</div>}
          </button>
        ))}
      </div>
      {beat.timer ? <div className="text-center text-[12px] font-mono text-[var(--m-accent2)]">{left}s</div> : null}
    </div>
  );
};

// ---- the player ------------------------------------------------------------------------------------------------------------
interface Props {
  scene: Scene;
  story: StoryProgress;
  targetId?: string | null;
  label?: string;
  onEffects: (fx: StoryEffects | undefined, choice?: [string, string]) => void;
  onClue: (id: string) => void;
  onDone: () => void;
}

export const ScenePlayer: React.FC<Props> = ({ scene, story, targetId, label, onEffects, onClue, onDone }) => {
  // The story as it is *during* the scene: choices made a moment ago change what later beats say.
  const [live, setLive] = useState<StoryProgress>(story);
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);     // the current beat has finished playing (a tap now moves on)
  const [skipFast, setSkipFast] = useState(false);
  const [toast, setToast] = useState<string | null>(null);   // what a choice just did, in plain words
  const liveRef = useRef(live); liveRef.current = live;

  const beatAt = (i: number): Beat | null => scene.beats[i] ?? null;
  // The next beat whose condition holds, starting at i.
  const firstShowable = useCallback((i: number): number => {
    let k = i;
    while (k < scene.beats.length && !condHolds(liveRef.current, scene.beats[k].when)) k++;
    return k;
  }, [scene.beats]);

  const finish = useCallback(() => { onEffects(scene.onEnd); onDone(); }, [scene.onEnd, onEffects, onDone]);
  const advance = useCallback(() => {
    const k = firstShowable(idx + 1);
    setReady(false); setSkipFast(false);
    if (k >= scene.beats.length) { finish(); return; }
    setIdx(k);
  }, [idx, firstShowable, scene.beats.length, finish]);

  // The first beat that should be shown.
  useEffect(() => { const k = firstShowable(0); if (k >= scene.beats.length) finish(); else setIdx(k); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const beat = beatAt(idx);
  const cluePinned = useRef<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  useEffect(() => { if (beat?.shake) { setShakeKey(k => k + 1); sfx.play('warn'); haptic([30, 30, 60]); } }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Beats that need no tap.
  useEffect(() => {
    if (!beat) return;
    if (beat.t === 'pause') { const t = setTimeout(advance, beat.ms); return () => clearTimeout(t); }
    if (beat.t === 'cold' || beat.t === 'narr' || beat.t === 'still' || beat.t === 'news') { const t = setTimeout(() => setReady(true), beat.t === 'cold' ? 1400 : 700); return () => clearTimeout(t); }
  }, [beat, advance]);

  const onChoice = (b: Extract<Beat, { t: 'choice' }>) => (optionId: string) => {
    const opt = b.options.find(o => o.id === optionId) ?? b.options.find(o => condHolds(liveRef.current, o.when)) ?? b.options[0];
    const next = applyStoryEffects(liveRef.current, opt.effects, [b.id, opt.id]);
    // Clues named by an option are shown on the board straight away.
    setLive(next);
    onEffects(opt.effects, [b.id, opt.id]);
    const fx = opt.effects;
    const notes = [
      fx?.trust ? (fx.trust > 0 ? 'Biko trusts you more' : 'Biko trusts you less') : '',
      fx?.coker ? (fx.coker > 0 ? 'Inspector Coker is paying attention' : 'Inspector Coker loses the scent') : '',
      fx?.integrity ? (fx.integrity > 0 ? 'Your reputation goes up' : 'Your reputation takes a hit') : ''
    ].filter(Boolean);
    if (notes.length) { setToast(notes.join(' • ')); setTimeout(() => setToast(null), 2600); sfx.play(fx?.trust && fx.trust < 0 || fx?.integrity && fx.integrity < 0 ? 'warn' : 'step'); }
    advance();
  };
  const onClueShown = useCallback(() => {
    if (!beat || beat.t !== 'clue' || cluePinned.current === beat.id + idx) { setReady(true); return; }
    cluePinned.current = beat.id + idx;
    setLive(l => addClue(l, (beat as Extract<Beat, { t: 'clue' }>).id));
    onClue((beat as Extract<Beat, { t: 'clue' }>).id);
    setTimeout(() => setReady(true), 500);
  }, [beat, idx, onClue]);

  // Skip: jump to the next choice (never past one), pinning clues on the way.
  const skip = () => {
    sfx.play('click');
    let k = idx;
    for (;;) {
      k = firstShowable(k + 1);
      if (k >= scene.beats.length) { scene.beats.slice(idx + 1).forEach(b => { if (b.t === 'clue' && condHolds(liveRef.current, b.when)) { setLive(l => addClue(l, b.id)); onClue(b.id); } }); finish(); return; }
      const b = scene.beats[k];
      if (b.t === 'clue') { setLive(l => addClue(l, b.id)); onClue(b.id); continue; }
      if (b.t === 'choice') break;
    }
    setReady(false); setSkipFast(false); setIdx(k);
  };

  const tapScreen = () => {
    if (!beat || beat.t === 'choice' || beat.t === 'pause') return;
    if (!ready) { setSkipFast(true); setReady(true); return; }
    sfx.play('click');
    advance();
  };

  if (!beat) return null;
  const total = scene.beats.length;

  const body = (() => {
    switch (beat.t) {
      case 'cold': return (
        <div className="text-center px-4 animate-fade-in">
          <div className="font-serif font-black text-[36px] leading-tight text-[var(--m-ink)]">{beat.text}</div>
          {beat.time && <div className="mt-3 text-[13px] font-mono tracking-wide text-[var(--m-accent2)]">{beat.time}</div>}
        </div>
      );
      case 'narr': return <p className="max-w-[380px] font-serif italic text-[20px] leading-relaxed text-center text-[var(--m-ink)] animate-fade-in px-2">{beat.text}</p>;
      case 'say': return <SayBeat beat={beat} targetId={targetId} skip={skipFast} onComplete={() => setReady(true)} />;
      case 'chat': return <ChatBeat key={idx} beat={beat} targetId={targetId} fast={skipFast} onComplete={() => setReady(true)} />;
      case 'voice': return <VoiceBeat key={idx} beat={beat} skip={skipFast} onComplete={() => setReady(true)} />;
      case 'news': return <NewsBeat beat={beat} />;
      case 'doc': return <DocBeat key={idx} beat={beat} skip={skipFast} onComplete={() => setReady(true)} />;
      case 'still': return <StillBeat beat={beat} />;
      case 'clue': return <ClueBeat key={idx} id={beat.id} onShown={onClueShown} />;
      case 'choice': return <ChoiceBeat key={idx} beat={beat} story={live} onPick={onChoice(beat)} />;
      default: return null;
    }
  })();

  return (
    <div data-mode="story" className="absolute inset-0 z-[125] flex flex-col tex-story fx-film text-[var(--m-ink)] overflow-hidden animate-fade-in" onClick={tapScreen}>
      <div className="relative z-[70] flex-shrink-0 h-11 px-3 flex items-center justify-between bg-black/70 border-b border-white/10">
        <span className="text-[10px] font-mono tracking-widest text-[#FB7185] animate-hint">● REC</span>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--m-ink)]/72 truncate px-2">{label ?? 'The Receipts'}</span>
        <button onClick={e => { e.stopPropagation(); skip(); }} className="min-h-[44px] px-2 text-[11px] font-black uppercase tracking-widest text-[var(--m-ink)]/72 cursor-pointer">Skip ⏭</button>
      </div>
      {toast && <div className="absolute z-[80] inset-x-4 top-14 flex justify-center pointer-events-none animate-pop-in"><div className="bg-[var(--m-panel)] text-[var(--m-panel-ink)] border-2 border-[var(--m-line)] rounded-full px-4 py-1.5 text-[12px] font-sans font-black text-center shadow-[3px_3px_0px_var(--m-line)]">{toast}</div></div>}
      <div key={shakeKey} className={`relative flex-1 min-h-0 flex items-center justify-center p-4 ${beat.shake ? 'scene-shake' : ''}`}>{body}</div>
      <div className="relative z-[70] flex-shrink-0 h-12 px-4 flex items-center justify-between bg-black/70 border-t border-white/10">
        <div className="flex gap-1" aria-hidden>{scene.beats.map((_, i) => <span key={i} className={`h-1 rounded-full ${i < idx ? 'w-2 bg-[var(--m-ink)]/50' : i === idx ? 'w-4 bg-[var(--m-accent)]' : 'w-1.5 bg-[var(--m-ink)]/15'}`} />).slice(0, 24)}</div>
        <div className={ready && beat.t !== 'choice' && beat.t !== 'pause' ? TAP : 'opacity-0'}>{idx >= total - 1 ? 'Tap to finish' : 'Tap to continue'}</div>
      </div>
    </div>
  );
};
