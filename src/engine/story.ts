import type { GameState } from './types';
import type { MetaProfile } from './profile';
import { starsFor } from './profile';
import { APPROACHES, STORY_CHAPTERS, StoryChapter, StoryVariant, chapterIndex, getChapter, seasonEnding } from './data/story';
import { RepBand, StoryApproach, parseStoryPerk, storyPerkId } from './data/perks';
import { CLUE_BY_ID } from './season/clues';
import { plotChoiceStory } from './season/script';
import type { Cond, StoryEffects } from './season/types';

// Story Mode progress and rules. The chapters (text and cast) live in data/story.ts; this file decides what is unlocked,
// what reputation does, and how a finished match is recorded.
export interface ChapterResult {
  won: boolean;
  stars: number;
  approach: StoryApproach;
  backfires: number;
  day: number;
  targetId: string;
  attempts: number;
}

export interface StoryProgress {
  picks: Record<string, string>;            // chapterId -> chosen variant targetId (for the pair chapters)
  results: Record<string, ChapterResult>;
  integrity: number;                        // Reputation: how honest you have been (-12..12)
  lastRecorded: string | null;              // Guards against recording one match twice
  prologueSeen: boolean;
  // The thriller layer
  trust: number;                            // Biko's Trust, 0 to 10 (starts at 5)
  coker: number;                            // How close Inspector Coker is, 0 to 10 (starts at 0)
  flags: string[];                          // Facts the story remembers
  clues: string[];                          // Clue ids on the board
  choices: Record<string, string>;          // choice id -> option id
  scenesSeen: string[];                     // Scenes already played (so a cold open is only shown once)
}

export const emptyStory = (): StoryProgress => ({ picks: {}, results: {}, integrity: 0, lastRecorded: null, prologueSeen: false, trust: 5, coker: 0, flags: [], clues: [], choices: {}, scenesSeen: [] });

export const TRUST_MAX = 10;
export const COKER_MAX = 10;
const clampN = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const uniq = (a: string[]) => [...new Set(a)];

/** Applies a choice's or scene's effects to the story. Pure. */
export const applyStoryEffects = (p: StoryProgress, fx: StoryEffects | undefined, choice?: [string, string]): StoryProgress => {
  if (!fx && !choice) return p;
  const f = fx ?? {};
  return {
    ...p,
    trust: clampN(p.trust + (f.trust ?? 0), 0, TRUST_MAX),
    coker: clampN(p.coker + (f.coker ?? 0), 0, COKER_MAX),
    integrity: clampN(p.integrity + (f.integrity ?? 0), INTEGRITY_MIN, INTEGRITY_MAX),
    flags: f.flags ? uniq([...p.flags, ...f.flags]).slice(-200) : p.flags,
    clues: f.clues ? uniq([...p.clues, ...f.clues.filter(c => !!CLUE_BY_ID[c])]) : p.clues,
    choices: choice ? { ...p.choices, [choice[0]]: choice[1] } : p.choices
  };
};

export const addClue = (p: StoryProgress, id: string): StoryProgress => (CLUE_BY_ID[id] && !p.clues.includes(id) ? { ...p, clues: [...p.clues, id] } : p);

/** Does a beat's condition hold for this story? */
export const condHolds = (p: StoryProgress, c: Cond | undefined): boolean => {
  if (!c) return true;
  if (c.flag && !p.flags.includes(c.flag)) return false;
  if (c.flags && !c.flags.every(f => p.flags.includes(f))) return false;
  if (c.anyFlag && !c.anyFlag.some(f => p.flags.includes(f))) return false;
  if (c.cluesGte !== undefined && p.clues.length < c.cluesGte) return false;
  if (c.notFlag && p.flags.includes(c.notFlag)) return false;
  if (c.clue && !p.clues.includes(c.clue)) return false;
  if (c.notClue && p.clues.includes(c.notClue)) return false;
  if (c.trustGte !== undefined && p.trust < c.trustGte) return false;
  if (c.trustLt !== undefined && p.trust >= c.trustLt) return false;
  if (c.cokerGte !== undefined && p.coker < c.cokerGte) return false;
  if (c.cokerLt !== undefined && p.coker >= c.cokerLt) return false;
  if (c.choice && p.choices[c.choice[0]] !== c.choice[1]) return false;
  return true;
};

export const markSceneSeen = (p: StoryProgress, id: string): StoryProgress => (p.scenesSeen.includes(id) ? p : { ...p, scenesSeen: [...p.scenesSeen, id].slice(-120) });

export const INTEGRITY_MIN = -12;
export const INTEGRITY_MAX = 12;

export const repBand = (integrity: number): RepBand => (integrity <= -3 ? 'low' : integrity >= 3 ? 'high' : 'mid');

export const REP_LABEL: Record<RepBand, { name: string; line: string }> = {
  low: { name: 'Known to embellish', line: 'People are wary of your page. Everyone starts with more Doubt.' },
  mid: { name: 'Neutral', line: 'People read you with mixed feelings.' },
  high: { name: 'A trusted source', line: 'People trust your page. Less Doubt, and a little starting cash.' }
};

export const chapterUnlocked = (p: StoryProgress, index: number): boolean =>
  index === 0 || !!p.results[STORY_CHAPTERS[index - 1]?.id]?.won;

/** A Premium Gist episode opens once the main chapter it follows has been won. (Needing a licence is checked by the screens and the engine's startStory.) */
export const episodeUnlocked = (p: StoryProgress, ep: { requires?: string }): boolean => !ep.requires || !!p.results[ep.requires]?.won;

export const chaptersWon = (p: StoryProgress): number => STORY_CHAPTERS.filter(c => p.results[c.id]?.won).length;
export const seasonComplete = (p: StoryProgress): boolean => chaptersWon(p) === STORY_CHAPTERS.length;
export const nextChapterIndex = (p: StoryProgress): number => {
  const i = STORY_CHAPTERS.findIndex(c => !p.results[c.id]?.won);
  return i === -1 ? STORY_CHAPTERS.length - 1 : i;
};
export const storyStars = (p: StoryProgress): number => STORY_CHAPTERS.reduce((n, c) => n + (p.results[c.id]?.stars ?? 0), 0);
export const currentEnding = (p: StoryProgress) => (seasonComplete(p) ? seasonEnding(p.integrity) : null);

// The variant the player has chosen for a chapter (or the only one).
export const variantFor = (chapter: StoryChapter, p: StoryProgress): StoryVariant | null => {
  if (chapter.variants.length === 1) return chapter.variants[0];
  return chapter.variants.find(v => v.targetId === p.picks[chapter.id]) ?? null;
};

export const pickVariant = (p: StoryProgress, chapterId: string, targetId: string): StoryProgress => {
  const ch = getChapter(chapterId);
  if (!ch || !ch.variants.some(v => v.targetId === targetId)) return p;
  return { ...p, picks: { ...p.picks, [chapterId]: targetId } };
};

export const approachDelta = (a: StoryApproach): number => APPROACHES.find(x => x.id === a)?.integrity ?? 0;
export const perkIdFor = (p: StoryProgress, approach: StoryApproach): string => storyPerkId(approach, repBand(p.integrity));

// Records a finished story match. Safe to call repeatedly: the same match is only ever recorded once.
// Reputation only changes the first time a chapter is won (replays are for stars), and a defeat costs nothing but time.
export const recordChapter = (profile: MetaProfile, s: GameState): MetaProfile => {
  if (!s.storyId || (s.status !== 'WON' && s.status !== 'LOST_HEAT' && s.status !== 'LOST_TIME' && s.status !== 'LOST_COVERUP')) return profile;
  const key = `${s.storyId}:${s.copySeed}:${s.status}`;
  const story = profile.story ?? emptyStory();
  if (story.lastRecorded === key) return profile;
  const ch = getChapter(s.storyId);
  const perk = parseStoryPerk(s.perkId);
  if (!ch || !perk || !s.activeTargetId) return { ...profile, story: { ...story, lastRecorded: key } };

  const prev = story.results[ch.id];
  const won = s.status === 'WON';
  const stars = won ? (s.assisted ? 1 : starsFor(s)) : 0;
  let integrity = story.integrity;
  if (won && !prev?.won && !ch.premium) {   // bonus episodes never move your reputation or the season's plot choices
    integrity += approachDelta(perk.approach) - Math.min(2, s.backfires);
    integrity = Math.max(INTEGRITY_MIN, Math.min(INTEGRITY_MAX, integrity));
  }
  // What the player chose during the match's plot beats counts the first time the chapter is won.
  let after: StoryProgress = { ...story, integrity };
  if (won && !prev?.won && !ch.premium) (s.storyChoices ?? []).forEach(k => { const i = k.lastIndexOf(':'); after = applyStoryEffects(after, plotChoiceStory(k.slice(0, i), k.slice(i + 1))); });
  integrity = after.integrity;
  const result: ChapterResult = won
    ? { won: true, stars: Math.max(prev?.stars ?? 0, stars), approach: prev?.won ? prev.approach : perk.approach, backfires: s.backfires, day: Math.min(s.currentDay, s.dayBudget), targetId: s.activeTargetId, attempts: (prev?.attempts ?? 0) + 1 }
    : { won: !!prev?.won, stars: prev?.stars ?? 0, approach: prev?.approach ?? perk.approach, backfires: prev?.backfires ?? 0, day: prev?.day ?? 0, targetId: prev?.targetId ?? s.activeTargetId, attempts: (prev?.attempts ?? 0) + 1 };
  return { ...profile, story: { ...after, integrity, results: { ...story.results, [ch.id]: result }, lastRecorded: key } };
};

export const markPrologueSeen = (profile: MetaProfile): MetaProfile => ({ ...profile, story: { ...(profile.story ?? emptyStory()), prologueSeen: true } });
export const choosePick = (profile: MetaProfile, chapterId: string, targetId: string): MetaProfile => ({ ...profile, story: pickVariant(profile.story ?? emptyStory(), chapterId, targetId) });

// Import: rebuild the story block field by field.
export const sanitizeStory = (raw: unknown): StoryProgress => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<StoryProgress>;
  const base = emptyStory();
  const picks: Record<string, string> = {};
  Object.entries(r.picks ?? {}).forEach(([cid, tid]) => {
    const ch = getChapter(cid);
    if (ch && typeof tid === 'string' && ch.variants.some(v => v.targetId === tid)) picks[cid] = tid;
  });
  const results: Record<string, ChapterResult> = {};
  Object.entries(r.results ?? {}).forEach(([cid, res]) => {
    const ch = getChapter(cid);
    const x = res as Partial<ChapterResult> | null;
    if (!ch || !x || typeof x.targetId !== 'string' || !ch.variants.some(v => v.targetId === x.targetId)) return;
    const approach = (['truth', 'whatever', 'mercy'] as const).find(a => a === x.approach) ?? 'truth';
    results[cid] = {
      won: !!x.won, stars: Math.max(0, Math.min(3, Math.floor(Number(x.stars) || 0))), approach,
      backfires: Math.max(0, Math.min(99, Math.floor(Number(x.backfires) || 0))), day: Math.max(0, Math.min(99, Math.floor(Number(x.day) || 0))),
      targetId: x.targetId, attempts: Math.max(0, Math.min(999, Math.floor(Number(x.attempts) || 0)))
    };
  });
  return {
    ...base, picks, results,
    integrity: Math.max(INTEGRITY_MIN, Math.min(INTEGRITY_MAX, Math.round(Number(r.integrity) || 0))),
    prologueSeen: !!r.prologueSeen,
    trust: clampN(Number.isFinite(Number(r.trust)) && r.trust !== undefined && r.trust !== null ? Math.round(Number(r.trust)) : 5, 0, TRUST_MAX),
    coker: clampN(Number.isFinite(Number(r.coker)) ? Math.round(Number(r.coker)) : 0, 0, COKER_MAX),
    flags: Array.isArray(r.flags) ? uniq(r.flags.filter((x): x is string => typeof x === 'string' && x.length <= 40)).slice(0, 200) : [],
    clues: Array.isArray(r.clues) ? uniq(r.clues.filter((x): x is string => typeof x === 'string' && !!CLUE_BY_ID[x])) : [],
    choices: Object.fromEntries(Object.entries(r.choices && typeof r.choices === 'object' ? r.choices : {}).filter(([k, v]) => typeof v === 'string' && k.length <= 40 && (v as string).length <= 40).slice(0, 200)),
    scenesSeen: Array.isArray(r.scenesSeen) ? uniq(r.scenesSeen.filter((x): x is string => typeof x === 'string' && x.length <= 40)).slice(-120) : []
  };
};

export { chapterIndex };
