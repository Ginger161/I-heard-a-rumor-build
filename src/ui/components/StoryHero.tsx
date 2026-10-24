import React from 'react';
import { ACTS, STORY_CHAPTERS } from '../../engine/data/story';
import { chaptersWon, nextChapterIndex, seasonComplete, storyStars, variantFor } from '../../engine/story';
import type { MetaProfile } from '../../engine/profile';
import { getTarget } from '../../engine/data/targets';
import { Avatar } from './Silhouette';
import { TapeStrip } from './common';
import { sfx } from '../audio';

// STORY MODE, the headline of the front page. It shows where the player is in the season (the next chapter, who is in it,
// how far along they are) and one big button to carry on. Arcade cases sit underneath as the second course.
export const StoryHero: React.FC<{ profile: MetaProfile; onOpen: () => void; wide?: boolean }> = ({ profile, onOpen, wide = false }) => {
  const story = profile.story;
  const won = chaptersWon(story);
  const done = seasonComplete(story);
  const idx = done ? 0 : nextChapterIndex(story);
  const ch = STORY_CHAPTERS[idx];
  const picked = variantFor(ch, story);
  const shown = picked ?? ch.variants[0];
  const target = getTarget(shown.targetId);
  const act = ACTS[ch.act];
  const fresh = won === 0;

  const cta = fresh ? 'Start the story' : done ? 'Replay the season' : 'Continue the story';

  return (
    <button
      onClick={() => { sfx.play('click'); onOpen(); }}
      data-mode="story"
      className={`fx-film tex-story relative w-full text-left text-[var(--m-ink)] border-4 border-[var(--m-line)] rounded-2xl shadow-[5px_5px_0px_var(--m-accent)] cursor-pointer active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_var(--m-accent)] overflow-hidden ${wide ? 'p-3.5' : 'p-4'}`}
      aria-label={`Story Mode: ${cta}`}
    >
      <TapeStrip className="-top-1 left-6 rotate-[-5deg]" />
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--m-accent2)]">🎬 Story Mode • Season 1</div>
        <div className="text-[10px] font-sans font-black uppercase tracking-wider text-[var(--m-ink)]/60 whitespace-nowrap">{won}/{STORY_CHAPTERS.length}{storyStars(story) > 0 ? ` • ${storyStars(story)}★` : ''}</div>
      </div>

      <div className="flex gap-3.5 items-center mt-2.5">
        <div className={`flex-shrink-0 ${wide ? 'w-[84px] h-[104px]' : 'w-[104px] h-[128px]'} bg-[#D9CBB0] border-[3px] border-[var(--m-ink)] rounded-lg overflow-hidden rotate-[-2deg] shadow-[3px_3px_0px_var(--m-accent)]`}>
          {!picked && ch.variants.length > 1 ? (
            // The player has not chosen yet who it was: both faces share the frame.
            <div className="w-full h-full flex">
              {ch.variants.slice(0, 2).map(vr => (
                <div key={vr.targetId} className="w-1/2 h-full overflow-hidden border-r border-[#F4F1EA]/40 last:border-r-0"><Avatar target={getTarget(vr.targetId)} emotion="SMUG" className="h-full w-[200%] max-w-none -ml-[0%]" /></div>
              ))}
            </div>
          ) : (
            <Avatar target={target} emotion={done ? 'DEFEATED' : 'SMUG'} className="w-full h-full" />
          )}
        </div>
        <div className="min-w-0">
          <div className={`font-serif font-black uppercase leading-[0.95] tracking-tight ${wide ? 'text-[26px]' : 'text-[34px]'}`}>The Receipts</div>
          <div className="text-[12px] font-sans leading-snug text-[var(--m-ink)]/80 mt-1.5">
            {fresh ? '13 chapters • 4 acts • every one personal' : done ? 'Season complete. See who you became.' : <>Act {ch.act} • {act.name}</>}
          </div>
          {!fresh && !done && (
            <div className="mt-1.5 text-[13px] font-black leading-tight text-[var(--m-accent2)]">Ch {idx + 1}: {ch.title}<span className="block font-sans font-semibold text-[11px] text-[var(--m-ink)]/70">{ch.kicker}</span></div>
          )}
        </div>
      </div>

      {/* the hook: what the story is, without giving anything away */}
      {fresh && (
        <p className="mt-3 text-[13px] font-sans leading-snug text-[var(--m-ink)]/90">
          You run <b className="text-[var(--m-accent2)]">The Receipts</b>, Lagos's most feared anonymous gist page. Your ex. Your boss. Your own family. Every one of them, when cornered, posts the same tearful apology, signed <i>“Peace and light.”</i> Somebody is writing their lines. <b className="text-[var(--m-accent2)]">Find out who.</b>
        </p>
      )}

      {/* the season at a glance: one pip per chapter */}
      <div className="flex gap-1 mt-3" aria-hidden>
        {STORY_CHAPTERS.map((c, i) => {
          const w = !!story.results[c.id]?.won;
          const cur = !done && i === idx;
          return <span key={c.id} className={`flex-1 h-2 rounded-full border border-[var(--m-ink)]/30 ${w ? 'bg-[#34D399]' : cur ? 'bg-[var(--m-accent2)] animate-pulse' : 'bg-[var(--m-ink)]/15'}`} />;
        })}
      </div>

      <div className="mt-3.5 w-full min-h-[52px] rounded-xl border-2 border-[var(--m-line)] bg-[var(--m-accent)] text-white font-serif font-black text-[19px] uppercase tracking-wide flex items-center justify-center gap-2 shadow-[3px_3px_0px_rgba(0,0,0,.5)]">
        {cta} <span aria-hidden>▶</span>
      </div>
    </button>
  );
};
