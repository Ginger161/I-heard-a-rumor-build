import { spring } from 'remotion';

export const FPS = 60;
export const TOTAL = 2700; // 45 seconds

// Scene ranges (global frames). Six scenes, each long enough for its text to be read.
export const SCENES = {
  s1: { from: 0, dur: 360 }, //  0.0 -  6.0s  The classified drop
  s2: { from: 360, dur: 480 }, //  6.0 - 14.0s  Ground zero & shatter
  s3: { from: 840, dur: 540 }, // 14.0 - 23.0s  The conspiracy board
  s4: { from: 1380, dur: 510 }, // 23.0 - 31.5s  Nationwide contagion
  s5: { from: 1890, dur: 450 }, // 31.5 - 39.0s  Heat & the smoking gun
  s6: { from: 2340, dur: 360 }, // 39.0 - 45.0s  Front page & CTA
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

// ---- per-scene event frames, LOCAL to each scene (picture and audio both read these) ----
export const S1 = {
  lampOn: 54,
  dropDelay: 66,
  dropCfg: { damping: 7, stiffness: 80, mass: 1.5 },
  typeStart: 150, // folder label types itself out after the landing
  // ONE WHISPER. / TWENTY DAYS. / BRING THEM / DOWN.   (~1.4s between phrases so they can be read aloud)
  words: [120, 126, 192, 198, 288, 294, 312],
};
export const S2 = { craneEnd: 130, pulse: 50, sparkPop: 140, shatter: 250, cardSlam: 320 };
export const S3 = { pins: [96, 192, 288, 384], polaroid: 444, pullStart: 450, pullEnd: 530, whipFrames: 30 };
export const S4 = { arcs: [40, 110, 180, 250], fly: [60, 170, 280, 360], flyLen: 190, tickStart: 30, counterLock: 400 };
export const S5 = { wire: 30, heatEnd: 150, bubble: 100, stamp: 270 };
export const S6 = { flash: 0, stamp: 135, cta: 225 };
