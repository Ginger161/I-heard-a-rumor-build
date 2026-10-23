import { ScandalCategory } from './data/channels';
import { CLIMATES } from './data/climates';
import { TARGETS } from './data/targets';

// The Daily Case: one Target, scandal, climate and random seed per calendar day, identical for every player.
// The pool is the always-open Spotlight creators plus Tier 1, so nobody needs unlocks to play it and sealed Targets are
// never revealed by it. Daily runs use no perks, so results are comparable.
export interface DailyCase {
  dateKey: string;       // YYYY-MM-DD (local)
  targetId: string;
  category: ScandalCategory;
  climateId: string;
  seed: number;
}

export const dateKeyOf = (d: Date = new Date()): string => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

export const DAILY_POOL = (): string[] =>
  TARGETS.filter(t => !t.packId && (t.folder === 'SPOTLIGHT' || t.folder === 1)).map(t => t.id).sort();

export const dailyCase = (dateKey: string = dateKeyOf()): DailyCase => {
  const pool = DAILY_POOL();
  const h = hash(dateKey);
  const targetId = pool[h % pool.length];
  const target = TARGETS.find(t => t.id === targetId)!;
  return {
    dateKey,
    targetId,
    category: target.scandals[(h >>> 8) % target.scandals.length].category,
    climateId: CLIMATES[(h >>> 16) % CLIMATES.length].id,
    seed: h
  };
};

// Consecutive days (ending today or yesterday) on which the daily was won.
export const dailyStreak = (wins: string[], today: string = dateKeyOf()): number => {
  const set = new Set(wins);
  const step = (key: string, delta: number): string => {
    const [y, m, d] = key.split('-').map(Number);
    return dateKeyOf(new Date(y, m - 1, d + delta));
  };
  let cursor = set.has(today) ? today : step(today, -1);
  let streak = 0;
  while (set.has(cursor)) { streak++; cursor = step(cursor, -1); }
  return streak;
};

export const DAILY_BASE_BONUS = 25;
export const DAILY_STREAK_BONUS = 5;
export const DAILY_STREAK_CAP = 6;

export const dailyBonus = (streakBeforeToday: number): number =>
  DAILY_BASE_BONUS + DAILY_STREAK_BONUS * Math.min(streakBeforeToday, DAILY_STREAK_CAP);

// A small seeded PRNG so a daily case plays out the same for everyone (player timing aside).
export const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
