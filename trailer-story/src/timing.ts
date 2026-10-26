// Single source of truth for the story trailer's timeline. Pure data, no imports: the picture
// (src/scenes) and the audio build (scripts/make-mix.mjs, scripts/vo-script.mjs) both read it,
// so sound and image cannot drift apart.
//
// All times below are LOCAL to their scene, in seconds, unless a name says "global".

export const FPS = 60;
export const sec = (s: number) => Math.round(s * FPS);

// Scene ranges in global seconds.
export const SCENE_SEC = {
  a: { from: 0, dur: 9.0 }, //   6:06            cold open, the apology, Biko's text
  b: { from: 9.0, dur: 9.5 }, //  The page        "I bring receipts", five people cornered
  c: { from: 18.5, dur: 10.0 }, // The pattern    the same apology on every phone
  d: { from: 28.5, dur: 13.0 }, // The trail      the clue board, Halo's voice note
  e: { from: 41.5, dur: 7.0 }, //  The choice      a timed decision, the map
  f: { from: 48.5, dur: 6.5 }, //  Aimed           the flip
  g: { from: 55.0, dur: 8.0 }, //  Title
} as const;
export type SceneKey = keyof typeof SCENE_SEC;

export const TOTAL_SEC = 63;
export const TOTAL = sec(TOTAL_SEC);
export const SCENES = Object.fromEntries(
  (Object.keys(SCENE_SEC) as SceneKey[]).map((k) => [k, { from: sec(SCENE_SEC[k].from), dur: sec(SCENE_SEC[k].dur) }]),
) as Record<SceneKey, { from: number; dur: number }>;

/** global seconds of a scene-local second */
export const gs = (scene: SceneKey, local: number) => SCENE_SEC[scene].from + local;

// ---- A: 6:06 -------------------------------------------------------------------------------------
export const A = {
  dateIn: 0.55,
  tick: 1.75, //     5 -> 6 PM digit change
  buzz: [2.3, 2.64, 2.98], // phone vibration bursts; screen wakes on the first
  typeStart: 3.2,
  typeEnd: 5.7,
  circle: 6.0, //    red scribble round "the owner of The Receipts"
  chat1: 6.35, //    Biko: "Boss."
  chat2: 6.95, //    "Somebody wrote your apology."
  dots: 7.55, //     typing indicator
  chat3: 8.2, //     "Before you did anything."  (slams)
};

// ---- B: the page ---------------------------------------------------------------------------------
export const B = {
  tag: 0.3,
  card: 0.9,
  countFrom: 1.0,
  countTo: 2.6,
  // five people cornered: each lands on a hit
  beats: [3.5, 4.45, 5.3, 6.05, 6.7],
  // rapid "apology posted" pings that bridge into the next scene
  pings: [7.5, 7.95, 8.35, 8.7, 8.98],
};

// ---- C: the pattern ------------------------------------------------------------------------------
export const Cc = {
  typeStart: 0.15,
  typeEnd: 1.9,
  pullStart: 1.1,
  pullEnd: 4.6,
  words: [1.95, 3.3, 4.65], // SAME WORDS. / SAME FORMAT. / SAME MINUTE.
  minute: 4.65, //            every timestamp snaps to 6:06 PM
  signoff: 5.9, //            "Peace and light." lights up on every phone
  push: 6.0,
};

// ---- D: the trail --------------------------------------------------------------------------------
export const D = {
  pins: [0.7, 2.15, 3.6, 5.05, 6.4, 7.75],
  voice: 8.7, //  Halo's voice note starts playing
};

// ---- E: the choice -------------------------------------------------------------------------------
export const E = {
  card: 0.15,
  select: 2.0,
  hurt: 2.95, //  Trust drops
  map: 3.55,
  sparks: [4.0, 4.9, 5.7],
  flip: 4.5,
  wire: 5.9,
};

// ---- F: aimed ------------------------------------------------------------------------------------
export const F = {
  whisper: 0.4,
  reticle: 3.3,
  lock: 5.1, //  reticle locks on the profile as the word "aimed" lands
  text: 5.15,
};

// ---- G: title ------------------------------------------------------------------------------------
export const G = {
  buzz: 0.6,
  banner: 0.85,
  title: 2.4,
  sub: 3.4,
  season: 4.05,
  tagline: 4.9,
  clock: 6.75,
};

// ---- voiceover: ids match public/audio/vo/<id>.wav. `at` = global seconds the first WORD is heard --
export type VoLine = { id: string; at: number };
export const VO_AT: Record<string, number> = {
  n1a: gs('b', 0.55), //   "I don't make up gist."
  n1b: gs('b', 2.55), //   "I bring receipts."
  n2a: gs('c', Cc.words[0] - 0.05), // "Same words."
  n2b: gs('c', Cc.words[1] - 0.05), // "Same format."
  n2c: gs('c', Cc.words[2] - 0.05), // "Same minute."
  chorus: gs('c', Cc.signoff + 0.05), // "Peace and light." x many voices
  h1: gs('d', D.voice), //  Halo, phone-filtered voice note
  n3a: gs('e', 0.3), //    "Every case ends in a choice."
  n3b: gs('e', 3.35), //   "And someone always gets hurt."
  n4: gs('f', F.whisper), // "I thought I was exposing them."
  h2: gs('f', 3.65), //    "You were being aimed."
  n5: gs('g', G.tagline - 0.1), // "Who writes the apologies?"
};
