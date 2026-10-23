import React, { useMemo, useState } from 'react';
import { BrutalButton, PaperGrain } from '../components/common';
import { Avatar } from '../components/Silhouette';
import { sfx } from '../audio';
import { APPROACHES, ACTS, STORY_CHAPTERS, STORY_PROLOGUE, StoryChapter, StoryVariant, getChapter, seasonEnding } from '../../engine/data/story';
import { getTarget } from '../../engine/data/targets';
import { StoryApproach } from '../../engine/data/perks';
import { MetaProfile } from '../../engine/profile';
import {
  INTEGRITY_MAX, INTEGRITY_MIN, REP_LABEL, chapterUnlocked, chaptersWon, nextChapterIndex, repBand, seasonComplete, variantFor
} from '../../engine/story';
import { GameState } from '../../engine/types';
import { getClimate } from '../../engine/data/climates';

// A narrative card: scene-setting text, or Biko's DMs rendered like a chat bubble.
const Beat: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const biko = /^Your intern /.test(text);
  return biko ? (
    <div key={index} className="animate-pop-in bg-[#DCF8C6] border-2 border-[#1A1A1A] rounded-2xl rounded-tl-sm p-3.5 shadow-[3px_3px_0px_#1A1A1A]">
      <div className="text-[9px] font-black uppercase tracking-widest text-[#065F46] mb-1">💬 Your intern</div>
      <p className="font-sans text-[13px] leading-snug">{text.replace(/^Your intern (says|whispers|slides your phone back to you)[,.]?\s*/i, '')}</p>
    </div>
  ) : (
    <div key={index} className="animate-pop-in bg-white border-2 border-[#1A1A1A] rounded-xl p-4 shadow-[3px_3px_0px_#1A1A1A]">
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
        <div className="flex gap-1" aria-hidden>{beats.map((_, k) => <span key={k} className={`h-1.5 rounded-full ${k === i ? 'w-4 bg-[#1A1A1A]' : 'w-1.5 bg-[#1A1A1A]/30'}`} />)}</div>
        <BrutalButton tone="ink" className="py-2 px-5" onClick={() => { sfx.play('click'); if (last) onDone(); else setI(i + 1); }}>{last ? doneLabel : 'Next →'}</BrutalButton>
      </div>
    </div>
  );
};

const Reputation: React.FC<{ integrity: number }> = ({ integrity }) => {
  const band = repBand(integrity);
  const pct = ((integrity - INTEGRITY_MIN) / (INTEGRITY_MAX - INTEGRITY_MIN)) * 100;
  return (
    <div className="bg-[#F4F1EA] border-2 border-[#1A1A1A] rounded-lg px-3 py-2">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
        <span>Reputation</span><span className={band === 'low' ? 'text-[#8B0000]' : band === 'high' ? 'text-[#065F46]' : 'text-slate-600'}>{REP_LABEL[band].name}</span>
      </div>
      <div className="relative h-2.5 mt-1 rounded-full border border-[#1A1A1A] bg-gradient-to-r from-[#FCA5A5] via-white to-[#86EFAC] overflow-hidden">
        <div className="absolute top-0 bottom-0 w-1.5 bg-[#1A1A1A]" style={{ left: `calc(${pct}% - 3px)` }} />
      </div>
      <div className="text-[10px] font-sans text-slate-600 mt-1 leading-snug">{REP_LABEL[band].line}</div>
    </div>
  );
};

interface StoryProps {
  profile: MetaProfile;
  onBack: () => void;
  onStart: (chapterId: string, approach: StoryApproach) => void;
  onPick: (chapterId: string, targetId: string) => void;
  onPrologueSeen: () => void;
}

type View = { kind: 'map' } | { kind: 'prologue' } | { kind: 'chapter'; id: string; step: 'pick' | 'setting' | 'motive' | 'approach' };

export const StoryScreen: React.FC<StoryProps> = ({ profile, onBack, onStart, onPick, onPrologueSeen }) => {
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
      <Shell onBack={onBack} title="Season 1 • The Receipts">
        <div className="font-serif font-black text-2xl leading-tight">Your page. Your receipts.</div>
        <BeatStepper beats={STORY_PROLOGUE} doneLabel="Open the page" onDone={() => { onPrologueSeen(); setView({ kind: 'map' }); }} />
      </Shell>
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
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B0000]">{ch.kicker}</div>
          <div className="font-serif font-black text-2xl leading-tight">{ch.pairPrompt}</div>
          <p className="text-[12px] font-sans text-slate-600 leading-snug">It is your story, so you decide who it is about. The setting, the pace and the stakes stay the same.</p>
          <div className="flex flex-col gap-3">
            {ch.variants.map(vr => {
              const t = getTarget(vr.targetId);
              return (
                <button key={vr.targetId} onClick={() => { sfx.play('buy'); onPick(ch.id, vr.targetId); setView({ kind: 'chapter', id: ch.id, step: 'setting' }); }} className="text-left flex items-center gap-3 bg-white border-2 border-[#1A1A1A] rounded-xl p-3 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer">
                  <Avatar target={t} className="w-12 h-14 flex-shrink-0 bg-[#D9CBB0] rounded" />
                  <div className="min-w-0">
                    <div className="font-serif font-black text-base leading-tight">{vr.label}</div>
                    <div className="text-[11px] font-sans text-slate-600 leading-snug">{vr.teaser}</div>
                    
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

    if (step === 'setting' || step === 'motive') {
      const beats = step === 'setting' ? [variant.setting] : variant.motive;
      return (
        <Shell onBack={() => setView({ kind: 'map' })} title={`Chapter ${STORY_CHAPTERS.indexOf(ch) + 1} • ${ch.title}`}>
          <div className="flex items-center gap-3">
            <Avatar target={target} className="w-14 h-16 flex-shrink-0 bg-[#D9CBB0] rounded border-2 border-[#1A1A1A]" />
            <div className="min-w-0">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B0000]">{ch.kicker}</div>
              <div className="font-serif font-black text-lg leading-tight">{target.fullName}</div>
              <div className="text-[11px] font-sans text-slate-600">{target.title} • {climate.icon} {climate.name}</div>
            </div>
          </div>
          <BeatStepper
            key={step}
            beats={beats}
            doneLabel={step === 'setting' ? 'Why this matters' : 'Choose your approach'}
            onDone={() => setView({ kind: 'chapter', id: ch.id, step: step === 'setting' ? 'motive' : 'approach' })}
          />
        </Shell>
      );
    }

    // approach
    const sel = APPROACHES.find(a => a.id === approach)!;
    return (
      <Shell onBack={() => setView({ kind: 'map' })} title={`Chapter ${STORY_CHAPTERS.indexOf(ch) + 1} • ${ch.title}`}>
        <div className="font-serif font-black text-xl leading-tight">How do you tell it?</div>
        <p className="text-[11px] font-sans text-slate-600 leading-snug -mt-1">Each approach plays differently, and each leaves a mark on your reputation. People notice how you win.</p>
        <div className="flex flex-col gap-2.5">
          {APPROACHES.map(a => (
            <button
              key={a.id} onClick={() => { sfx.play('click'); setApproach(a.id); }}
              aria-pressed={approach === a.id}
              className={`text-left border-2 border-[#1A1A1A] rounded-xl p-3 cursor-pointer transition-all ${approach === a.id ? 'bg-[#FDE68A] shadow-[3px_3px_0px_#1A1A1A]' : 'bg-white opacity-90'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-serif font-black text-base leading-tight">{a.icon} {a.name}</div>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${a.integrity >= 0 ? 'bg-[#065F46] text-white' : 'bg-[#8B0000] text-white'}`}>Rep {a.integrity > 0 ? '+' : ''}{a.integrity}</span>
              </div>
              <div className="text-[11px] font-sans leading-snug mt-0.5">{a.blurb}</div>
              <div className="text-[10px] font-sans font-bold text-[#B45309] mt-1 leading-snug">{a.effect}</div>
              {approach === a.id && <div className="text-[10px] font-sans italic text-slate-700 mt-1 leading-snug">“{variant.approachNotes[a.id]}”</div>}
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
    <Shell onBack={onBack} title="Season 1 • The Receipts">
      <Reputation integrity={story.integrity} />
      {ending && (
        <div className="bg-[#1A1A1A] text-[#F4F1EA] rounded-xl p-4 animate-pop-in">
          <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#FDE68A]">Season complete</div>
          <div className="font-serif font-black text-xl leading-tight mt-0.5">{ending.title}</div>
          {ending.body.map((b, i) => <p key={i} className="text-[12px] font-sans leading-snug mt-2 text-slate-200">{b}</p>)}
        </div>
      )}
      {([1, 2, 3] as const).map(act => (
        <div key={act}>
          <div className="flex items-baseline justify-between border-b-2 border-[#1A1A1A] pb-1 mb-2">
            <div className="font-serif font-black text-base uppercase tracking-wide">Act {act} • {ACTS[act].name}</div>
          </div>
          <div className="text-[10px] font-sans italic text-slate-600 -mt-1 mb-2">{ACTS[act].blurb}</div>
          <div className="flex flex-col gap-2">
            {STORY_CHAPTERS.map((ch, idx) => ch.act !== act ? null : (
              <ChapterRow key={ch.id} ch={ch} idx={idx} profile={profile} current={!complete && idx === next} onOpen={() => openChapter(ch)} />
            ))}
          </div>
        </div>
      ))}
    </Shell>
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
      className={`text-left flex items-center gap-3 border-2 border-[#1A1A1A] rounded-xl p-2.5 transition-all ${
        !open ? 'bg-[#D4CFC4] opacity-60 cursor-not-allowed' : current ? 'bg-[#FDE68A] shadow-[3px_3px_0px_#1A1A1A] cursor-pointer active:translate-x-[3px] active:translate-y-[3px] active:shadow-none' : 'bg-white cursor-pointer'
      }`}
    >
      <div className="w-8 h-8 flex-shrink-0 rounded-full border-2 border-[#1A1A1A] bg-[#F4F1EA] flex items-center justify-center font-black text-sm">{open ? idx + 1 : '🔒'}</div>
      <div className="min-w-0 flex-1">
        <div className="font-serif font-black text-[15px] leading-tight">{ch.title}</div>
        <div className="text-[10px] font-sans text-slate-600 leading-snug truncate">
          {open ? (target ? target.fullName : ch.pairPrompt ?? ch.kicker) : 'Finish the previous chapter'}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        {result?.won ? (
          <div className="text-[13px] tracking-tight" aria-label={`${result.stars} stars`}>{[1, 2, 3].map(n => <span key={n} className={n <= result.stars ? 'text-[#B45309]' : 'text-[#1A1A1A]/20'}>★</span>)}</div>
        ) : current ? <span className="text-[10px] font-black uppercase tracking-wider text-[#8B0000]">Play ▶</span> : null}
        {result && !result.won && <div className="text-[9px] font-sans text-slate-500">{result.attempts} tries</div>}
      </div>
    </button>
  );
};

const Shell: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({ title, onBack, children }) => (
  <div className="relative flex-1 min-h-0 bg-[#EFEBE0] text-[#1A1A1A] font-serif flex flex-col overflow-hidden">
    <PaperGrain />
    <div className="relative flex-shrink-0 px-3 py-2.5 border-b-4 border-double border-[#1A1A1A] flex items-center gap-3">
      <button onClick={() => { sfx.play('click'); onBack(); }} aria-label="Back" className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] bg-white font-black cursor-pointer flex-shrink-0">←</button>
      <div className="min-w-0">
        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-[#8B0000]">Story Mode</div>
        <h1 className="text-[16px] font-black uppercase tracking-tight leading-none truncate">{title}</h1>
      </div>
    </div>
    <div className="relative overflow-y-auto no-scrollbar p-3.5 flex flex-col gap-3.5 flex-1">{children}</div>
  </div>
);

// ---------------------------------------------------------------------------
// After the match: the chapter's epilogue and what it did to your reputation.
// ---------------------------------------------------------------------------
export const StoryEpilogue: React.FC<{ gameState: GameState; profile: MetaProfile; onDone: () => void; onRetry: () => void }> = ({ gameState, profile, onDone, onRetry }) => {
  const ch = gameState.storyId ? getChapter(gameState.storyId) : undefined;
  const won = gameState.status === 'WON';
  const variant = ch?.variants.find(v => v.targetId === gameState.activeTargetId);
  const [stage, setStage] = useState<'beats' | 'result'>('beats');
  const result = ch ? profile.story.results[ch.id] : undefined;
  const complete = seasonComplete(profile.story);
  const ending = useMemo(() => (complete && ch?.id === STORY_CHAPTERS[STORY_CHAPTERS.length - 1].id && won ? seasonEnding(profile.story.integrity) : null), [complete, ch, won, profile.story.integrity]);
  if (!ch || !variant) return null;
  const idx = STORY_CHAPTERS.indexOf(ch);
  const lastChapter = idx === STORY_CHAPTERS.length - 1;
  const nextCh = STORY_CHAPTERS[idx + 1];
  const band = repBand(profile.story.integrity);

  return (
    <div className="absolute inset-0 z-[120] bg-[#EFEBE0] text-[#1A1A1A] font-serif flex flex-col overflow-hidden animate-fade-in">
      <PaperGrain />
      <div className="relative px-3.5 py-3 border-b-4 border-double border-[#1A1A1A] flex-shrink-0">
        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-[#8B0000]">Chapter {idx + 1} • {ch.title}</div>
        <div className="font-serif font-black text-xl leading-tight">{won ? 'Epilogue' : 'Not this time'}</div>
      </div>
      <div className="relative flex-1 min-h-0 overflow-y-auto no-scrollbar p-3.5 flex flex-col gap-3.5">
        {stage === 'beats' ? (
          <BeatStepper beats={won ? variant.win : [variant.lose]} doneLabel={won ? 'See what it cost' : 'Continue'} onDone={() => setStage('result')} />
        ) : (
          <>
            <div className="bg-white border-2 border-[#1A1A1A] rounded-xl p-3.5 shadow-[3px_3px_0px_#1A1A1A]">
              {won ? (
                <>
                  <div className="text-[9px] font-black uppercase tracking-widest text-[#065F46]">Story told</div>
                  <div className="text-xl tracking-tight" aria-label={`${result?.stars ?? 1} stars`}>{[1, 2, 3].map(n => <span key={n} className={n <= (result?.stars ?? 1) ? 'text-[#B45309]' : 'text-[#1A1A1A]/20'}>★</span>)}</div>
                  <div className="text-[11px] font-sans text-slate-600 mt-1">{gameState.backfires > 0 ? `${gameState.backfires} forged file${gameState.backfires > 1 ? 's were' : ' was'} exposed along the way. People remember that.` : 'Clean run, no forged files exposed.'}</div>
                </>
              ) : (
                <>
                  <div className="text-[9px] font-black uppercase tracking-widest text-[#8B0000]">The story did not land</div>
                  <div className="text-[12px] font-sans mt-1 leading-snug">Nothing is lost. Your reputation is untouched and the chapter is still open. Try a different approach, or a different pace.</div>
                </>
              )}
            </div>
            <Reputation integrity={profile.story.integrity} />
            {won && band === 'low' && <div className="text-[11px] font-sans italic text-[#8B0000]">“People are starting to ask whether you tell the truth.” The next story starts with more Doubt.</div>}
            {won && band === 'high' && <div className="text-[11px] font-sans italic text-[#065F46]">“People forward your posts without checking.” The next story starts with less Doubt.</div>}
            {ending && (
              <div className="bg-[#1A1A1A] text-[#F4F1EA] rounded-xl p-4 animate-pop-in">
                <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#FDE68A]">Season 1 complete</div>
                <div className="font-serif font-black text-xl leading-tight mt-0.5">{ending.title}</div>
                {ending.body.map((b, i) => <p key={i} className="text-[12px] font-sans leading-snug mt-2 text-slate-200">{b}</p>)}
              </div>
            )}
            {won && !lastChapter && nextCh && <div className="text-[11px] font-sans text-slate-700">Next: <b>Chapter {idx + 2} • {nextCh.title}</b> — {nextCh.kicker.toLowerCase()}.</div>}
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
