import { spring } from 'remotion';

export const FPS = 60;
export const TOTAL = 1800;

export const SCENES = {
  s1: { from: 0, dur: 240 },
  s2: { from: 240, dur: 300 },
  s3: { from: 540, dur: 360 },
  s4: { from: 900, dur: 360 },
  s5: { from: 1260, dur: 300 },
  s6: { from: 1560, dur: 240 },
} as const;

type SpringCfg = { damping: number; stiffness: number; mass: number };

// A falling object is modelled as |1 - spring|, so it touches the desk each time the spring
// crosses 1. Returns those touch-down frames (relative to the spring's own start).
export const touchdowns = (cfg: SpringCfg, delay = 0, fps = FPS, max = 150): number[] => {
  const out: number[] = [];
  let prev = spring({ frame: 0, fps, config: cfg });
  for (let f = 1; f < max; f++) {
    const s = spring({ frame: f, fps, config: cfg });
    if ((prev - 1) * (s - 1) < 0) out.push(f + delay);
    prev = s;
  }
  return out;
};

// ---- per-scene event frames, LOCAL to each scene (audio and visuals share these) ----
export const S1 = {
  dropDelay: 30,
  dropCfg: { damping: 7, stiffness: 80, mass: 1.5 },
  // phrase starts leave ~1s between lines so a voiceover can read them
  words: [72, 78, 129, 135, 213, 219, 229],
};
export const S2 = { craneEnd: 90, sparkPop: 88, shatter: 150, cardSlam: 205 };
export const S3 = { pins: [70, 135, 200, 265], whipFrames: 22 };
export const S4 = { arcs: [30, 70, 110, 150], counterLock: 255 };
export const S5 = { wire: 24, stamp: 150 };
export const S6 = { flash: 0, stamp: 50 };

export const globalImpacts = (): { t: number; w: number }[] => {
  const ev: { t: number; w: number }[] = [];
  touchdowns(S1.dropCfg, S1.dropDelay).slice(0, 3).forEach((f, i) => ev.push({ t: SCENES.s1.from + f, w: 1 / (1 + i * 1.8) }));
  [S1.words[0], S1.words[2], S1.words[4]].forEach((f) => ev.push({ t: SCENES.s1.from + f, w: 0.55 }));
  ev.push({ t: SCENES.s2.from + S2.shatter, w: 0.8 }, { t: SCENES.s2.from + S2.cardSlam, w: 1 });
  S3.pins.forEach((f) => ev.push({ t: SCENES.s3.from + f, w: 0.6 }));
  ev.push({ t: SCENES.s4.from + S4.counterLock, w: 0.9 });
  ev.push({ t: SCENES.s5.from + S5.wire, w: 0.6 }, { t: SCENES.s5.from + S5.stamp, w: 1.2 });
  ev.push({ t: SCENES.s6.from + S6.flash, w: 1 }, { t: SCENES.s6.from + S6.stamp, w: 1.3 });
  return ev;
};
