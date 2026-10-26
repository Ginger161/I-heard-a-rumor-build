import { Easing, interpolate, random } from 'remotion';

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ramp = (f: number, from: number, to: number) => clamp01((f - from) / (to - from));
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// Exponentially decaying pulse that starts at `at`.
export const decay = (f: number, at: number, tau = 9) => (f < at ? 0 : Math.exp(-(f - at) / tau));
export const energy = (f: number, impacts: number[], tau = 9) =>
  Math.min(1.6, impacts.reduce((a, i) => a + decay(f, i, tau), 0));

// Unsteady lamp: mostly steady, with random dips and a few hard dropouts.
export const flicker = (f: number, dropouts: number[] = []) => {
  const dip = random(`flk-${Math.floor(f / 2)}`) > 0.93 ? 0.55 : 1;
  const hum = 0.94 + 0.06 * Math.sin(f / 5);
  const out = dropouts.some((d) => f >= d && f < d + 3) ? 0.18 : 1;
  return dip * hum * out;
};

export const mapRange = (f: number, a: number, b: number, from: number, to: number, ease = easeInOut) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

/** Smooth, organic handheld drift (sums of slow sines, never per-frame random) in px / degrees. */
export const handheld = (f: number, seed = 0, amp = 1) => ({
  x: (Math.sin(f * 0.021 + seed) * 7 + Math.sin(f * 0.053 + seed * 2.3) * 3.2) * amp,
  y: (Math.sin(f * 0.017 + seed * 1.7) * 6 + Math.sin(f * 0.047 + seed) * 2.6) * amp,
  r: (Math.sin(f * 0.013 + seed * 0.6) * 0.35 + Math.sin(f * 0.041 + seed) * 0.12) * amp,
});

/** 0..1 triangular pulse around `at` (for flashes that ramp in fast and bleed out slowly). */
export const flash = (f: number, at: number, inF = 2, outF = 14) =>
  f < at ? 0 : f < at + inF ? (f - at) / inF : Math.max(0, 1 - (f - at - inF) / outF);
