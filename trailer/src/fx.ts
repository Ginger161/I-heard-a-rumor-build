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
