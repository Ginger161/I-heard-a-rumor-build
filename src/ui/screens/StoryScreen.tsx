import React, { useMemo, useState } from 'react';
import { BrutalButton, PaperGrain } from '../components/common';
import { Avatar } from '../components/Silhouette';
import { sfx } from '../audio';
import { APPROACHES, ACTS, Act, STORY_CHAPTERS, STORY_PROLOGUE, StoryChapter, StoryVariant, getChapter, seasonEnding } from '../../engine/data/story';
import { getTarget } from '../../engine/data/targets';
import { StoryApproach } from '../../engine/data/perks';
import { MetaProfile } from '../../engine/profile';
import {
  INTEGRITY_MAX, INTEGRITY_MIN, REP_LABEL, chapterUnlocked, chaptersWon, nextChapterIndex, repBand, seasonComplete, variantFor
} from '../../engine/story';
import { GameState } from '../../engine/types';
import { getClimate } from '../../engine/data/climates';
import { ScenePlayer } from '../components/ScenePlayer';
import { ClueBoard } from '../components/ClueBoard';
import { PROLOGUE, scriptFor } from '../../engine/season/script';
import { CLUE_TOTAL } from '../../engine/season/clues';
import type { StoryEffects } from '../../engine/season/types';
import { COKER_MAX, TRUST_MAX } from '../../engine/story';

// What a scene needs from the app: save a choice's effects, pin a clue, remember that a scene was seen.
export interface StoryApi { apply: (fx?: StoryEffects, choice?: [string, string]) => void; clue: (id: string) => void; seen: (sceneId: string) => void }

// Trust with Biko, the Inspector's attention and the clues found, at a glance.
const Meters: React.FC<{ trust: number; coker: number; clues: number; onBoard: () => void }> = ({ trust, coker, clues, onBoard }) => (
  <div className="grid grid-cols-3 gap-2">
    <div className="bg-[var(--m-surface)] border-2 border-[var(--m-line)] rounded-lg px-2.5 py-2">
      <div className="text-[9px] font-black uppercase tracking-widest text-[var(--m-soft)]">Biko's trust</div>
      <div className="h-2 mt-1.5 rounded-full bg-[var(--m-sunk)] overflow-hidden"><div className="h-full bg-[#2DD4BF]" style={{ width: `${(trust / TRUST_MAX) * 100}%` }} /></div>
      <div className="text-[10px] font-sans font-bold mt-1">{trust}/{TRUST_MAX}</div>
    </div>
    <div className="bg-[var(--m-surface)] border-2 border-[var(--m-line)] rounded-lg px-2.5 py-2">
      <div className="text-[9px] font-black uppercase tracking-widest text-[var(--m-soft)]">Inspector Coker</div>
      <div className="h-2 mt-1.5 rounded-full bg-[var(--m-sunk)] overflow-hidden"><div className="h-full bg-[var(--m-accent)]" style={{ width: `${(coker / COKER_MAX) * 100}%` }} /></div>
      <div className="text-[10px] font-sans font-bold mt-1">{coker === 0 ? 'Not watching' : coker < 4 ? 'Curious' : coker < 7 ? 'Closing in' : 'On your door'}</div>
    </div>
    <button onClick={onBoard} className="bg-[var(--m-accent2)] text-[var(--m-accent2-ink)] border-2 border-[var(--m-line)] rounded-lg px-2.5 py-2 text-left cursor-pointer active:translate-y-[2px]">
      <div className="text-[9px] font-black uppercase tracking-widest opacity-80">Clue board</div>
      <div className="font-serif font-black text-[18px] leading-none mt-1">{clues}/{CLUE_TOTAL}</div>
      <div className="text-[10px] font-sans font-bold mt-0.5">Open ▶</div>
    </button>
  </div>
);

// A narrative card: scene-setting text, or Biko's DMs rendered like a chat bubble.
const Beat: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const biko = /^Your intern /.test(text);
  const halo = /^Your mentor (writes|texts)[,.:]?\s*/i.test(text);
  if (halo) return (
    <div key={index} className="animate-pop-in bg-[var(--m-sunk)] text-[var(--m-ink)] border-2 border-[var(--m-accent2)] rounded-2xl rounded-tr-sm p-3.5 shadow-[3px_3px_0px_var(--m-accent)]">
      <div className="text-[9px] font-black uppercase tracking-widest text-[var(--m-accent2)] mb-1">💬 Your mentor</div>
      <p className="font-sans text-[13px] leading-snug">{text.replace(/^Your mentor (writes|texts)[,.:]?\s*/i, '')}</p>
    </div>
  );
  return biko ? (
    <div key={index} className="animate-pop-in bg-[#DCF8C6] text-[var(--m-ink)] border-2 border-[var(--m-line)] rounded-2xl rounded-tl-sm p-3.5 shadow-[3px_3px_0px_var(--m-line)]">
      <div className="text-[9px] font-black uppercase tracking-widest text-[#065F46] mb-1">💬 Your intern</div>
      <p className="font-sans text-[13px] leading-snug">{text.replace(/^Your intern (says|whispers|slides your phone back to you)[,.]?\s*/i, '')}</p>
    </div>
  ) : (
    <div key={index} className="animate-pop-in bg-[var(--m-surface2)] border-2 border-[var(--m-line)] rounded-xl p-4 shadow-[3px_3px_0px_var(--m-line)]">
      <p className="font-serif text-[14px] leading-relaxed">{text}</p>
    </div>
  );
};

// Steps through a list of beats one card at a time.
const BeatStepper: React.FC<{ beats: string[]; onDone: () => void; doneLabel?: string }> = ({ beats, onDone, doneLabel = 'Continue' }) => {
  const [i, setI] = useState(0);
  const last = i >= beats.length - 1;
  return (
    <div className="flex flex-col gap-4">
      <Beat text={beats[i]} index={i} />
      <div className="flex items-center justify-between">
        <div className="flex gap-1" aria-hidden>{beats.map((_, k) => <span key={k} className={`h-1.5 rounded-full ${k === i ? 'w-4 bg-[var(--m-ink)]' : 'w-1.5 bg-[var(--m-ink)]/30'}`} />)}</div>
        <BrutalButton tone="ink" className="py-2 px-5" onClick={() => { sfx.play('click'); if (last) onDone(); else setI(i + 1); }}>{last ? doneLabel : 'Next →'}</BrutalButton>
      </div>
    </div>
  );
};

const Reputation: React.FC<{ integrity: number }> = ({ integrity }) => {
  const band = repBand(integrity);
  const pct = ((integrity - INTEGRITY_MIN) / (INTEGRITY_MAX - INTEGRITY_MIN)) * 100;
  return (
    <div className="bg-[var(--m-surface)] border-2 border-[var(--m-line)] rounded-lg px-3 py-2">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
        <span>Reputation</span><span className={band === 'low' ? 'text-[var(--m-accent)]' : band === 'high' ? 'text-[#065F46]' : 'text-[var(--m-soft)]'}>{REP_LABEL[band].name}</span>
      </div>
      <div className="relative h-2.5 mt-1 rounded-full border border-[var(--m-line)] bg-gradient-to-r from-[#7F1D1D] via-[#334155] to-[#14532D] overflow-hidden">
        <div className="absolute top-0 bottom-0 w-1.5 bg-[var(--m-ink)]" style={{ left: `calc(${pct}% - 3px)` }} />
      </div>
      <div className="text-[10px] font-sans text-[var(--m-soft)] mt-1 leading-snug">{REP_LABEL[band].line}</div>
    </div>
  );
};

interface StoryProps {
  profile: MetaProfile;
  onBack: () => void;
  onStart: (chapterId: string, approach: StoryApproach) => void;
  onPick: (chapterId: string, targetId: string) => void;
  onPrologueSeen: () => void;
  api: StoryApi;
}

type View = { kind: 'map' } | { kind: 'prologue' } | { kind: 'chapter'; id: string; step: 'pick' | 'setting' | 'motive' | 'approach' };

export const StoryScreen: React.FC<StoryProps> = ({ profile, onBack, onStart, onPick, onPrologueSeen, api }) => {
  const [board, setBoard] = useState(false);
  const story = profile.story;
  const [view, setView] = useState<View>(story.prologueSeen ? { kind: 'map' } : { kind: 'prologue' });
  const [approach, setApproach] = useState<StoryApproach>('truth');
  const next = nextChapterIndex(story);
  const complete = seasonComplete(story);

  const openChapter = (ch: StoryChapter) => {
    sfx.play('click');
    const needsPick = ch.variants.length > 1 && !variantFor(ch, story);
    setView({ kind: 'chapter', id: ch.id, step: needsPick ? 'pick' : 'setting' });
  };

  // ------------------------------------------------------------------ prologue
  if (view.kind === 'prologue') {
    return (
      <div className="relative flex-1 min-h-0 tex-story">
        <ScenePlayer scene={PROLOGUE} story={story} label="Season 1 • Prologue" onEffects={api.apply} onClue={api.clue}
          onDone={() => { api.seen(PROLOGUE.id); onPrologueSeen(); setView({ kind: 'map' }); }} />
      </div>
    );
  }

  // ------------------------------------------------------------------ chapter flow
  if (view.kind === 'chapter') {
    const ch = getChapter(view.id)!;
    const variant: StoryVariant | null = variantFor(ch, story);

    const step = variant ? view.step : 'pick';
    if (step === 'pick') {
      return (
        <Shell onBack={() => setView({ kind: 'map' })} title={`Chapter ${STORY_CHAPTERS.indexOf(ch) + 1} • ${ch.title}`}>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--m-accent)]">{ch.kicker}</div>
          <div className="font-serif font-black text-2xl leading-tight">{ch.pairPrompt}</div>
          <p className="text-[12px] font-sans text-[var(--m-soft)] leading-snug">It is your story, so you decide who it is about. The setting, the pace and the stakes stay the same.</p>
          <div className="flex flex-col gap-3">
            {ch.variants.map(vr => {
              const t = getTarget(vr.targetId);
              return (
                <button key={vr.targetId} onClick={() => { sfx.play('buy'); onPick(ch.id, vr.targetId); setView({ kind: 'chapter', id: ch.id, step: 'setting' }); }} className="text-left flex items-center gap-3 bg-[var(--m-surface2)] border-2 border-[var(--m-line)] rounded-xl p-3 shadow-[3px_3px_0px_var(--m-line)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer">
                  <Avatar target={t} className="w-12 h-14 flex-shrink-0 bg-[#2A3350] rounded" />
                  <div className="min-w-0">
                    <div className="font-serif font-black text-base leading-tight">{vr.label}</div>
                    <div className="text-[11px] font-sans text-[var(--m-soft)] leading-snug">{vr.teaser}</div>
                    
                  </div>
                </button>
              );
            })}
          </div>
        </Shell>
      );
    }

    if (!variant) return null;
    const target = getTarget(variant.targetId);
    const climate = getClimate(variant.climateId);

    // Chapters that have a script open with its cold open (once); the older "setting" card is only for chapters that do not have one yet.
    const script = scriptFor(ch.id);
    if (step === 'setting' && script && !story.scenesSeen.includes(script.pre.id)) {
      return (
        <div className="relative flex-1 min-h-0 tex-story">
          <ScenePlayer scene={script.pre} story={story} targetId={variant.targetId} label={`Chapter ${STORY_CHAPTERS.indexOf(ch) + 1} • ${ch.title}`} onEffects={api.apply} onClue={api.clue}
            onDone={() => { api.seen(script.pre.id); setView({ kind: 'chapter', id: ch.id, step: 'motive' }); }} />
        </div>
      );
    }
    if (step === 'setting' || step === 'motive') {
      const stepEff = step === 'setting' && script ? 'motive' : step;
      const beats = stepEff === 'setting' ? [variant.setting] : variant.motive;
      return (
        <Shell onBack={() => setView({ kind: 'map' })} title={`Chapter ${STORY_CHAPTERS.indexOf(ch) + 1} • ${ch.title}`}>
          <div className="flex items-center gap-3">
            <Avatar target={target} emotion={stepEff === 'setting' ? 'SMUG' : 'ANGRY'} className="w-14 h-16 flex-shrink-0 bg-[#2A3350] rounded border-2 border-[var(--m-line)]" />
            <div className="min-w-0">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--m-accent)]">{ch.kicker}</div>
              <div className="font-serif font-black text-lg leading-tight">{target.fullName}</div>
              <div className="text-[11px] font-sans text-[var(--m-soft)]">{target.title} • {climate.icon} {climate.name}</div>
            </div>
          </div>
          <BeatStepper
            key={stepEff}
            beats={beats}
            doneLabel={stepEff === 'setting' ? 'Why this matters' : 'Choose your approach'}
            onDone={() => setView({ kind: 'chapter', id: ch.id, step: stepEff === 'setting' ? 'motive' : 'approach' })}
          />
        </Shell>
      );
    }

    // approach
    const sel = APPROACHES.find(a => a.id === approach)!;
    return (
      <Shell onBack={() => setView({ kind: 'map' })} title={`Chapter ${STORY_CHAPTERS.indexOf(ch) + 1} • ${ch.title}`}>
        <div className="font-serif font-black text-xl leading-tight">How do you tell it?</div>
        <p className="text-[11px] font-sans text-[var(--m-soft)] leading-snug -mt-1">Each approach plays differently, and each leaves a mark on your reputation. People notice how you win.</p>
        <div className="flex flex-col gap-2.5">
          {APPROACHES.map(a => (
            <button
              key={a.id} onClick={() => { sfx.play('click'); setApproach(a.id); }}
              aria-pressed={approach === a.id}
              className={`text-left border-2 border-[var(--m-line)] rounded-xl p-3 cursor-pointer transition-all ${approach === a.id ? 'bg-[var(--m-accent2)] text-[var(--m-accent2-ink)] shadow-[3px_3px_0px_var(--m-line)]' : 'bg-[var(--m-surface2)] opacity-90'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-serif font-black text-base leading-tight">{a.icon} {a.name}</div>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${a.integrity >= 0 ? 'bg-[#065F46] text-white' : 'bg-[var(--m-accent)] text-white'}`}>Rep {a.integrity > 0 ? '+' : ''}{a.integrity}</span>
              </div>
              <div className="text-[11px] font-sans leading-snug mt-0.5">{a.blurb}</div>
              <div className="text-[10px] font-sans font-bold text-[var(--m-accent2)] mt-1 leading-snug">{a.effect}</div>
              {approach === a.id && <div className="text-[10px] font-sans italic text-[var(--m-soft)] mt-1 leading-snug">“{variant.approachNotes[a.id]}”</div>}
            </button>
          ))}
        </div>
        <Reputation integrity={story.integrity} />
        <BrutalButton tone="crimson" className="py-3" onClick={() => { sfx.play('stamp'); onStart(ch.id, sel.id); }}>▶ Publish the story ({target.shortName})</BrutalButton>
      </Shell>
    );
  }

  // ------------------------------------------------------------------ chapter map
  const ending = complete ? seasonEnding(story.integrity) : null;
  return (
    <>
    <Shell onBack={onBack} title="Season 1 • The Receipts">
      <Meters trust={story.trust} coker={story.coker} clues={story.clues.length} onBoard={() => { sfx.play('click'); setBoard(true); }} />
      <Reputation integrity={story.integrity} />
      {ending && (
        <div className="bg-[var(--m-sunk)] text-[var(--m-ink)] border-2 border-[var(--m-accent)] rounded-xl p-4 animate-pop-in">
          <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--m-accent2)]">Season complete</div>
          <div className="font-serif font-black text-xl leading-tight mt-0.5">{ending.title}</div>
          {ending.body.map((b, i) => <p key={i} className="text-[12px] font-sans leading-snug mt-2 text-[var(--m-ink)]">{b}</p>)}
        </div>
      )}
      {(Object.keys(ACTS).map(Number) as Act[]).map(act => (
        <div key={act}>
          <div className="flex items-baseline justify-between border-b-2 border-[var(--m-line)] pb-1 mb-2">
            <div className="font-serif font-black text-base uppercase tracking-wide">Act {act} • {ACTS[act].name}</div>
          </div>
          <div className="text-[10px] font-sans italic text-[var(--m-soft)] -mt-1 mb-2">{ACTS[act].blurb}</div>
          <div className="flex flex-col gap-2">
            {STORY_CHAPTERS.map((ch, idx) => ch.act !== act ? null : (
              <ChapterRow key={ch.id} ch={ch} idx={idx} profile={profile} current={!complete && idx === next} onOpen={() => openChapter(ch)} />
            ))}
          </div>
        </div>
      ))}
    </Shell>
    {board && <ClueBoard found={story.clues} onClose={() => setBoard(false)} />}
    </>
  );
};

const ChapterRow: React.FC<{ ch: StoryChapter; idx: number; profile: MetaProfile; current: boolean; onOpen: () => void }> = ({ ch, idx, profile, current, onOpen }) => {
  const story = profile.story;
  const result = story.results[ch.id];
  const open = chapterUnlocked(story, idx);
  const variant = variantFor(ch, story) ?? (result ? ch.variants.find(v => v.targetId === result.targetId) ?? null : null);
  const target = variant ? getTarget(variant.targetId) : null;
  return (
    <button
      disabled={!open} onClick={onOpen}
      className={`text-left flex items-center gap-3 border-2 border-[var(--m-line)] rounded-xl p-2.5 transition-all ${
        !open ? 'bg-[var(--m-disabled)] opacity-60 cursor-not-allowed' : current ? 'bg-[var(--m-accent2)] text-[var(--m-accent2-ink)] shadow-[3px_3px_0px_var(--m-line)] cursor-pointer active:translate-x-[3px] active:translate-y-[3px] active:shadow-none' : 'bg-[var(--m-surface2)] cursor-pointer'
      }`}
    >
      <div className={`w-8 h-8 flex-shrink-0 rounded-full border-2 border-[var(--m-line)] flex items-center justify-center font-black text-sm ${current ? 'bg-[var(--m-accent2-ink)] text-[var(--m-accent2)]' : 'bg-[var(--m-surface)]'}`}>{open ? idx + 1 : '🔒'}</div>
      <div className="min-w-0 flex-1">
        <div className="font-serif font-black text-[15px] leading-tight">{ch.title}</div>
        <div className={`text-[10px] font-sans leading-snug truncate ${current ? 'text-[var(--m-accent2-ink)]/75' : 'text-[var(--m-soft)]'}`}>
          {open ? (target ? target.fullName : ch.pairPrompt ?? ch.kicker) : 'Finish the previous chapter'}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        {result?.won ? (
          <div className="text-[13px] tracking-tight" aria-label={`${result.stars} stars`}>{[1, 2, 3].map(n => <span key={n} className={n <= result.stars ? 'text-[var(--m-accent2)]' : 'text-[var(--m-ink)]/20'}>★</span>)}</div>
        ) : current ? <span className="text-[10px] font-black uppercase tracking-wider text-[var(--m-accent)]">Play ▶</span> : null}
        {result && !result.won && <div className="text-[9px] font-sans text-[var(--m-soft)]">{result.attempts} tries</div>}
      </div>
    </button>
  );
};

const Shell: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({ title, onBack, children }) => (
  <div className="relative flex-1 min-h-0 tex-story fx-film text-[var(--m-ink)] font-serif flex flex-col overflow-hidden">
    <div className="relative flex-shrink-0 px-3 py-2.5 border-b-4 border-double border-[var(--m-line)] flex items-center gap-3">
      <button onClick={() => { sfx.play('click'); onBack(); }} aria-label="Back" className="w-11 h-11 rounded-full border-2 border-[var(--m-line)] bg-[var(--m-surface2)] font-black cursor-pointer flex-shrink-0">←</button>
      <div className="min-w-0">
        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--m-accent)]">Story Mode</div>
        <h1 className="text-[16px] font-black uppercase tracking-tight leading-none truncate">{title}</h1>
      </div>
    </div>
    <div className="relative overflow-y-auto no-scrollbar p-3.5 flex flex-col gap-3.5 flex-1">{children}</div>
  </div>
);

// ---------------------------------------------------------------------------
// After the match: the chapter's epilogue and what it did to your reputation.
// ---------------------------------------------------------------------------
export const StoryEpilogue: React.FC<{ gameState: GameState; profile: MetaProfile; onDone: () => void; onRetry: () => void; api: StoryApi }> = ({ gameState, profile, onDone, onRetry, api }) => {
  const ch = gameState.storyId ? getChapter(gameState.storyId) : undefined;
  const won = gameState.status === 'WON';
  const variant = ch?.variants.find(v => v.targetId === gameState.activeTargetId);
  const [stage, setStage] = useState<'beats' | 'scene' | 'result'>('beats');
  const result = ch ? profile.story.results[ch.id] : undefined;
  const complete = seasonComplete(profile.story);
  const ending = useMemo(() => (complete && ch?.id === STORY_CHAPTERS[STORY_CHAPTERS.length - 1].id && won ? seasonEnding(profile.story.integrity) : null), [complete, ch, won, profile.story.integrity]);
  if (!ch || !variant) return null;
  const afterScene = scriptFor(ch.id) ? (won ? scriptFor(ch.id)!.won : scriptFor(ch.id)!.lost) : undefined;
  if (stage === 'scene' && afterScene) {
    return <ScenePlayer scene={afterScene} story={profile.story} targetId={variant.targetId} label={`Chapter ${STORY_CHAPTERS.indexOf(ch) + 1} • ${ch.title}`} onEffects={api.apply} onClue={api.clue} onDone={() => { api.seen(afterScene.id); setStage('result'); }} />;
  }
  const idx = STORY_CHAPTERS.indexOf(ch);
  const lastChapter = idx === STORY_CHAPTERS.length - 1;
  const nextCh = STORY_CHAPTERS[idx + 1];
  const band = repBand(profile.story.integrity);

  return (
    <div data-mode="story" className="absolute inset-0 z-[120] tex-story fx-film text-[var(--m-ink)] font-serif flex flex-col overflow-hidden animate-fade-in">
      <div className="relative px-3.5 py-3 border-b-4 border-double border-[var(--m-line)] flex-shrink-0 flex items-center gap-3">
        <div className="flex-shrink-0 w-14 h-16 bg-[#2A3350] border-2 border-[var(--m-line)] rounded overflow-hidden"><Avatar target={getTarget(variant.targetId)} emotion={won ? 'DEFEATED' : 'LAUGH'} className="w-full h-full" /></div>
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--m-accent)]">Chapter {idx + 1} • {ch.title}</div>
          <div className="font-serif font-black text-xl leading-tight">{won ? 'Epilogue' : 'Not this time'}</div>
        </div>
      </div>
      <div className="relative flex-1 min-h-0 overflow-y-auto no-scrollbar p-3.5 flex flex-col gap-3.5">
        {stage === 'beats' ? (
          <BeatStepper beats={won ? variant.win : [variant.lose]} doneLabel={won ? 'Next' : 'Continue'} onDone={() => setStage(afterScene && !profile.story.scenesSeen.includes(afterScene.id) ? 'scene' : 'result')} />
        ) : (
          <>
            <div className="bg-[var(--m-surface2)] border-2 border-[var(--m-line)] rounded-xl p-3.5 shadow-[3px_3px_0px_var(--m-line)]">
              {won ? (
                <>
                  <div className="text-[9px] font-black uppercase tracking-widest text-[#065F46]">Story told</div>
                  <div className="text-xl tracking-tight" aria-label={`${result?.stars ?? 1} stars`}>{[1, 2, 3].map(n => <span key={n} className={n <= (result?.stars ?? 1) ? 'text-[var(--m-accent2)]' : 'text-[var(--m-ink)]/20'}>★</span>)}</div>
                  <div className="text-[11px] font-sans text-[var(--m-soft)] mt-1">{gameState.backfires > 0 ? `${gameState.backfires} forged file${gameState.backfires > 1 ? 's were' : ' was'} exposed along the way. People remember that.` : 'Clean run, no forged files exposed.'}</div>
                </>
              ) : (
                <>
                  <div className="text-[9px] font-black uppercase tracking-widest text-[var(--m-accent)]">The story did not land</div>
                  <div className="text-[12px] font-sans mt-1 leading-snug">Nothing is lost. Your reputation is untouched and the chapter is still open. Try a different approach, or a different pace.</div>
                </>
              )}
            </div>
            <Reputation integrity={profile.story.integrity} />
            {won && band === 'low' && <div className="text-[11px] font-sans italic text-[var(--m-accent)]">“People are starting to ask whether you tell the truth.” The next story starts with more Doubt.</div>}
            {won && band === 'high' && <div className="text-[11px] font-sans italic text-[#065F46]">“People forward your posts without checking.” The next story starts with less Doubt.</div>}
            {ending && (
              <div className="bg-[var(--m-sunk)] text-[var(--m-ink)] border-2 border-[var(--m-accent)] rounded-xl p-4 animate-pop-in">
                <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--m-accent2)]">Season 1 complete</div>
                <div className="font-serif font-black text-xl leading-tight mt-0.5">{ending.title}</div>
                {ending.body.map((b, i) => <p key={i} className="text-[12px] font-sans leading-snug mt-2 text-[var(--m-ink)]">{b}</p>)}
              </div>
            )}
            {won && !lastChapter && nextCh && <div className="text-[11px] font-sans text-[var(--m-soft)]">Next: <b>Chapter {idx + 2} • {nextCh.title}</b> — {nextCh.kicker.toLowerCase()}.</div>}
            <div className="flex flex-col gap-2 pt-1">
              {!won && <BrutalButton tone="crimson" onClick={onRetry}>↺ Try again</BrutalButton>}
              <BrutalButton tone="ink" onClick={onDone}>{won ? 'Back to the chapters' : 'Back to the chapters'}</BrutalButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { chaptersWon };
