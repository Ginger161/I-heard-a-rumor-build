import { TargetArchetype } from '../engine/data/targets';

// A colour for each temperament, so a Target's counter-moves "look" like it: hot-headed orange, cool navy,
// showy gold, nervous green, scheming purple.
export const TEMPERAMENT_ACCENT: Record<string, string> = {
  THE_CRASHOUT: '#C2410C',
  THE_STOIC: '#1E3A5F',
  THE_SHOWMAN: '#B45309',
  THE_PARANOID: '#166534',
  THE_SCHEMER: '#6B21A8',
  STEADY: '#1A1A1A'
};

export const accentOf = (t: TargetArchetype): string => TEMPERAMENT_ACCENT[t.ai.temperament] ?? '#1A1A1A';

export const hashString = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
