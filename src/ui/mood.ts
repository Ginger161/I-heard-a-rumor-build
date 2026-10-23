import { GameState } from '../engine/types';
import { nationalBelieverPct } from '../engine/selectors';

// The game's colours react to how the case is going. Heat tints the frame and pulses a red vignette, a stale story
// drains colour, belief builds a golden glow, frozen channels bring an icy edge, and the map slowly moves from
// morning paper to evening amber as the days pass.
export type MoodKey = 'CALM' | 'WARM' | 'HOT' | 'CRITICAL';

export interface Mood {
  key: MoodKey;
  label: string;
  accent: string;       // Top-bar / frame accent
  vignette: string;     // CSS background for the overlay (may be 'none')
  pulse: boolean;       // Vignette pulses
  mapBg: string;        // Map background colour
  filter: string;       // CSS filter on the live screen (desaturates a stale story)
  glow: string | null;  // Golden momentum glow around the frame
  frost: boolean;       // Icy edge when channels are frozen
}

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lerp = (a: string, b: string, t: number): string => {
  const k = Math.max(0, Math.min(1, t));
  const [ar, ag, ab] = hex(a);
  const [br, bg, bb] = hex(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * k).toString(16).padStart(2, '0');
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`;
};

// Morning paper -> midday -> golden hour -> dusk, across the match.
const DAY_STOPS = ['#F0E4D0', '#EADCC8', '#EBD0A6', '#DDB794'];
export const dayTint = (progress: number): string => {
  const p = Math.max(0, Math.min(1, progress)) * (DAY_STOPS.length - 1);
  const i = Math.min(DAY_STOPS.length - 2, Math.floor(p));
  return lerp(DAY_STOPS[i], DAY_STOPS[i + 1], p - i);
};

export const moodOf = (s: GameState): Mood => {
  const heat = s.heat;
  const key: MoodKey = heat >= 90 ? 'CRITICAL' : heat >= 70 ? 'HOT' : heat >= 40 ? 'WARM' : 'CALM';
  const accent = { CALM: '#1A1A1A', WARM: '#B45309', HOT: '#B91C1C', CRITICAL: '#7F1D1D' }[key];
  const vignette =
    key === 'CRITICAL' ? 'radial-gradient(ellipse at center, rgba(127,29,29,0) 45%, rgba(185,28,28,0.38) 100%)'
    : key === 'HOT' ? 'radial-gradient(ellipse at center, rgba(185,28,28,0) 55%, rgba(185,28,28,0.2) 100%)'
    : key === 'WARM' ? 'radial-gradient(ellipse at center, rgba(180,83,9,0) 65%, rgba(180,83,9,0.1) 100%)'
    : 'none';

  const believers = nationalBelieverPct(s.states);
  const stale = Math.max(0, (45 - s.freshness) / 45); // 0 when fresh, up to 1 when very stale
  const frozen = Object.values(s.frozenChannels).some(until => until >= s.currentDay);
  const progress = s.dayBudget > 1 ? (s.currentDay - 1) / (s.dayBudget - 1) : 0;

  return {
    key,
    label: { CALM: 'Calm', WARM: 'Heating up', HOT: 'Under pressure', CRITICAL: 'Critical' }[key],
    accent,
    vignette,
    pulse: key === 'CRITICAL',
    mapBg: dayTint(progress),
    filter: stale > 0 ? `saturate(${(1 - stale * 0.45).toFixed(2)})` : 'none',
    glow: believers >= 50 ? 'inset 0 0 36px rgba(245,158,11,0.45)' : believers >= 25 ? 'inset 0 0 22px rgba(245,158,11,0.22)' : null,
    frost: frozen
  };
};
