// Single source of truth for the gameplay trailer's timeline. Pure data: the picture (src/scenes.tsx) and the audio build
// (scripts/make-mix.mjs) both read it, so sound and image cannot drift apart.
// Scene times are in global seconds; "local" times inside a scene start at 0 at the scene's first frame.

export const FPS = 60;
export const sec = (s: number) => Math.round(s * FPS);

export const SCENE_SEC = {
  hook: { from: 0, dur: 5.5 }, //      one whisper, one country
  target: { from: 5.5, dur: 9.0 }, //   pick a Target: tiers, sealed files, the case file
  plant: { from: 14.5, dur: 8.5 }, //   plant the rumour, pop the first spark, the clock starts
  channels: { from: 23.0, dur: 8.5 }, // the Conspiracy Board: 26 channels, 4 lanes
  spread: { from: 31.5, dur: 11.5 }, // the 3D map from a real simulated game
  fight: { from: 43.0, dur: 8.5 }, //   doubt, spin bubbles, the Target fights back
  desks: { from: 51.5, dur: 7.5 }, //   evidence, defense, heat
  ending: { from: 59.0, dur: 6.0 }, //  win the front page or get busted
  title: { from: 65.0, dur: 10.0 }, //  four modes, then the title (its slam is where the music's closing chord lands)
} as const;
export type SceneKey = keyof typeof SCENE_SEC;
export const TOTAL_SEC = 75;
export const TOTAL = sec(TOTAL_SEC);
export const SCENES = Object.fromEntries(
  (Object.keys(SCENE_SEC) as SceneKey[]).map((k) => [k, { from: sec(SCENE_SEC[k].from), dur: sec(SCENE_SEC[k].dur) }]),
) as Record<SceneKey, { from: number; dur: number }>;
export const gs = (scene: SceneKey, local: number) => SCENE_SEC[scene].from + local;

/** Where in each recorded take (seconds) a scene starts playing. Marks come from public/takes/markers.json. */
export const CLIP = {
  target: { take: 'run', start: 2.2 }, //   tiers flick 2.8-6, pick 7.15, case file 8.8, scandal 10.3
  plant: { take: 'run', start: 12.9 }, //   map 13.45, plant 15.7, spark pop 18.1, ground zero 19.9
  channels: { take: 'run', start: 25.4 }, // board 26.4, pin 28.4, acquire 31.5
  fight: { take: 'spread', start: 8.0 },
  evidence: { take: 'run', start: 33.4 },
  defense: { take: 'run', start: 36.1 },
  heat: { take: 'heat', start: 0.2 },
  win: { take: 'win', start: 0.4 },
  lose: { take: 'lose_heat', start: 0.4 },
  story: { take: 'story', start: 0.3 },
  arcade: { take: 'run', start: 1.0 },
  arena: { take: 'arena', start: 0.3 },
  campaign: { take: 'campaign', start: 0.3 },
} as const;

// ---- local beat times per scene (seconds) -----------------------------------------------------------------------------------
export const T_HOOK = { l1: 0.5, l2: 1.7, l3: 2.9, glow: 3.7, cut: 5.0 };
export const T_TARGET = { head: 0.4, tiers: 2.2, sealed: 4.0, pick: 5.1, file: 6.8 };
export const T_PLANT = { head: 0.3, plant: 2.6, pop: 5.1, clock: 6.1 };
export const T_CHANNELS = { head: 0.3, lanes: 1.6, pin: 3.0, buy: 5.5, count: 6.6 };
export const T_SPREAD = { head: 0.3, run: 1.2, planes: 4.0, hot: 8.0 };
export const T_FIGHT = { head: 0.3, doubt: 1.8, spin: 3.8, coverup: 6.0 };
export const T_DESKS = { head: 0.3, evidence: 0.6, defense: 2.7, heat: 4.9 };
export const T_ENDING = { win: 0.2, bust: 3.0 };
export const T_TITLE = { modes: 0.3, m: [0.6, 2.1, 3.6, 5.1], title: 6.25, sub: 7.6, tag: 8.5 };
