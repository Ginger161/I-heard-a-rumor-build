import { GameState, WinRewards } from './types';
import { TARGETS, TargetArchetype, Tier, getTarget, isSpotlight, targetsInTier } from './data/targets';
import { PERKS, getPerk } from './data/perks';
import { BALANCE, STARS_TO_UNLOCK_TIER } from './balance';
import { dailyBonus, dailyStreak } from './daily';
import { StoryProgress, emptyStory, sanitizeStory } from './story';

// The persistent player profile ("MetaProfile"). Lives in its own storage slot, so a finished or reset
// match never touches it. "Reset saved game" keeps it; "Erase progress" wipes it.
export const PROFILE_KEY = 'rumor_meta_profile_v1';
const LEGACY_PROFILE_KEY = 'rumor_profile_v1'; // v2 profile (wins + archive): migrated on first load

export interface ArchiveEntry {
  targetId: string;
  targetName: string;
  scandalTitle: string;
  day: number;
  believers: number;
  stars: number;
  finishedAt: number;
}

export interface MetaProfile {
  version: 1;
  envelopes: number;                      // Brown Envelopes
  targetStars: Record<string, number>;    // targetId -> best stars (1-3)
  unlockedTargetIds: string[];            // Individually bribed (unsealed) Targets
  unlockedTiers: number[];                // Tiers bought outright
  unlockedPerks: string[];
  equippedPerkId: string | null;
  archive: ArchiveEntry[];                // Newest first
  dailyWins: string[];                    // Date keys (YYYY-MM-DD) of won Daily Cases
  story: StoryProgress;                   // Story Mode: chosen variants, chapter results, reputation
}
export type Profile = MetaProfile;

export const emptyProfile = (): MetaProfile => ({
  version: 1,
  envelopes: BALANCE.envelopesStart,
  targetStars: {},
  unlockedTargetIds: [],
  unlockedTiers: [],
  unlockedPerks: [],
  equippedPerkId: null,
  archive: [],
  dailyWins: [],
  story: emptyStory()
});

// ---------------------------------------------------------------------------
// Persistence (with migration from the v2 profile)
// ---------------------------------------------------------------------------
const isMeta = (p: unknown): p is MetaProfile => {
  const m = p as Partial<MetaProfile> | null;
  return !!m && m.version === 1 && typeof m.envelopes === 'number' && typeof m.targetStars === 'object' &&
    Array.isArray(m.unlockedTargetIds) && Array.isArray(m.unlockedTiers) && Array.isArray(m.unlockedPerks) && Array.isArray(m.archive);
};

const migrateLegacy = (): MetaProfile | null => {
  try {
    const raw = localStorage.getItem(LEGACY_PROFILE_KEY);
    if (!raw) return null;
    const old = JSON.parse(raw) as { wins?: Record<string, number>; archive?: Omit<ArchiveEntry, 'stars'>[] };
    const wonIds = Object.keys(old.wins ?? {}).filter(id => (old.wins![id] ?? 0) > 0 && TARGETS.some(t => t.id === id));
    const p = emptyProfile();
    wonIds.forEach(id => { p.targetStars[id] = 1; });
    // Old wins earn what they would have earned under the new rules.
    p.envelopes += wonIds.length * (BALANCE.envelopesFirstWin + BALANCE.envelopesPerNewStar);
    p.archive = (old.archive ?? []).map(a => ({ ...a, stars: 1 }));
    return p;
  } catch { return null; }
};

export const loadProfile = (): MetaProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as unknown;
      if (isMeta(p)) return { ...p, dailyWins: Array.isArray((p as MetaProfile).dailyWins) ? (p as MetaProfile).dailyWins : [], story: sanitizeStory((p as MetaProfile).story) };
    }
    const migrated = migrateLegacy();
    if (migrated) { saveProfile(migrated); return migrated; }
  } catch { /* fall through to a fresh profile */ }
  return emptyProfile();
};

export const saveProfile = (p: MetaProfile): void => {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
};

export const eraseProfile = (): MetaProfile => {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(LEGACY_PROFILE_KEY);
  } catch { /* storage unavailable */ }
  return emptyProfile();
};

// ---------------------------------------------------------------------------
// Stars and rewards
// ---------------------------------------------------------------------------
export const starsFor = (s: GameState): number => {
  if (s.status !== 'WON') return 0;
  const day = Math.min(s.currentDay, s.dayBudget);
  let stars = 1;
  if (day <= s.dayBudget * BALANCE.star2DayShare && s.peakHeat < BALANCE.star2PeakHeat) stars = 2;
  if (day <= s.dayBudget * BALANCE.star3DayShare && s.peakHeat < BALANCE.star3PeakHeat && s.backfires === 0) stars = 3;
  return stars;
};

export type { WinRewards };

export const applyWin = (p: MetaProfile, s: GameState, believers: number): { profile: MetaProfile; rewards: WinRewards } | null => {
  if (!s.activeTargetId || s.status !== 'WON') return null;
  const target = getTarget(s.activeTargetId);
  // Training Cases pay nothing and leave no trace.
  if (s.training) return { profile: p, rewards: { stars: 0, previousStars: 0, newStars: 0, breakdown: [{ label: 'Training case (no rewards)', amount: 0 }], total: 0, envelopesAfter: p.envelopes } };
  // Assist Mode keeps the win but caps the glory: 1 star, half the envelopes, no Daily bonus.
  const stars = s.assisted ? 1 : starsFor(s);
  const previousStars = p.targetStars[target.id] ?? 0;
  const newStars = Math.max(0, stars - previousStars);

  const breakdown: { label: string; amount: number }[] = [];
  breakdown.push(previousStars === 0
    ? { label: 'First takedown', amount: BALANCE.envelopesFirstWin }
    : { label: 'Replay win', amount: BALANCE.envelopesReplayWin });
  if (newStars > 0) breakdown.push({ label: `${newStars} new star${newStars > 1 ? 's' : ''}`, amount: newStars * BALANCE.envelopesPerNewStar });
  // Daily Case: a once-a-day bonus that grows with your streak.
  const claimDaily = !s.assisted && !!s.dailyKey && !p.dailyWins.includes(s.dailyKey);
  if (claimDaily) {
    const streakBefore = dailyStreak(p.dailyWins, s.dailyKey!) ;
    breakdown.push({ label: `Daily Case${streakBefore > 0 ? ` (${streakBefore + 1}-day streak)` : ''}`, amount: dailyBonus(streakBefore) });
  }
  if (s.assisted) breakdown.forEach(b => { b.amount = Math.floor(b.amount * BALANCE.assistRewardShare); });
  const total = breakdown.reduce((a, b) => a + b.amount, 0);

  const profile: MetaProfile = {
    ...p,
    envelopes: p.envelopes + total,
    targetStars: { ...p.targetStars, [target.id]: Math.max(previousStars, stars) },
    dailyWins: claimDaily ? [...p.dailyWins, s.dailyKey!].slice(-60) : p.dailyWins,
    archive: [{
      targetId: target.id,
      targetName: target.fullName,
      scandalTitle: s.scandalTitle,
      day: Math.min(s.currentDay, s.dayBudget),
      believers,
      stars,
      finishedAt: Date.now()
    }, ...p.archive].slice(0, 60)
  };
  return { profile, rewards: { stars, previousStars, newStars, breakdown, total, envelopesAfter: profile.envelopes } };
};

// ---------------------------------------------------------------------------
// Unlocks
// ---------------------------------------------------------------------------
export const starsOf = (p: MetaProfile, targetId: string): number => p.targetStars[targetId] ?? 0;

export const starsInTier = (p: MetaProfile, tier: Tier): number =>
  targetsInTier(tier).reduce((sum, t) => sum + starsOf(p, t.id), 0);

export const winsInTier = (p: MetaProfile, tier: Tier): number =>
  targetsInTier(tier).filter(t => starsOf(p, t.id) > 0).length;

// Tier 1 is open. Tier N+1 opens with STARS_TO_UNLOCK_TIER stars in tier N, or when its files are bought.
export const isTierUnlocked = (p: MetaProfile, tier: Tier, unlockAll = false): boolean => {
  if (unlockAll || tier === 1) return true;
  if (p.unlockedTiers.includes(tier)) return true;
  return starsInTier(p, (tier - 1) as Tier) >= STARS_TO_UNLOCK_TIER;
};

// Spotlight creators are always open; others need their tier, or an individual bribe.
export const isTargetUnlocked = (p: MetaProfile, target: TargetArchetype, unlockAll = false): boolean => {
  if (unlockAll || isSpotlight(target.id) || target.folder === 1) return true;
  if (p.unlockedTargetIds.includes(target.id)) return true;
  return target.folder !== 'SPOTLIGHT' && isTierUnlocked(p, target.folder);
};

export const tierBuyoutCost = (tier: Tier): number => BALANCE.tierBuyout[tier] ?? 9999;

// "Bribe Informant to Unseal Dossier": opens one Target immediately.
export const bribeTarget = (p: MetaProfile, targetId: string): MetaProfile | null => {
  const target = TARGETS.find(t => t.id === targetId);
  if (!target || isTargetUnlocked(p, target) || p.envelopes < BALANCE.bribeTarget) return null;
  return { ...p, envelopes: p.envelopes - BALANCE.bribeTarget, unlockedTargetIds: [...p.unlockedTargetIds, targetId] };
};

// Buy a whole folder of sealed files.
export const buyTier = (p: MetaProfile, tier: Tier): MetaProfile | null => {
  const cost = tierBuyoutCost(tier);
  if (isTierUnlocked(p, tier) || p.envelopes < cost) return null;
  return { ...p, envelopes: p.envelopes - cost, unlockedTiers: [...p.unlockedTiers, tier] };
};

// ---------------------------------------------------------------------------
// Perks
// ---------------------------------------------------------------------------
export const buyPerk = (p: MetaProfile, perkId: string): MetaProfile | null => {
  const perk = getPerk(perkId);
  if (!perk || p.unlockedPerks.includes(perkId) || p.envelopes < perk.cost) return null;
  return { ...p, envelopes: p.envelopes - perk.cost, unlockedPerks: [...p.unlockedPerks, perkId], equippedPerkId: p.equippedPerkId ?? perkId };
};

export const equipPerk = (p: MetaProfile, perkId: string | null): MetaProfile => {
  if (perkId !== null && !p.unlockedPerks.includes(perkId)) return p;
  return { ...p, equippedPerkId: perkId };
};

export const totalTargets = TARGETS.length;
export const perkCount = PERKS.length;

// ---------------------------------------------------------------------------
// Export / import (the "progress code" in Settings). Imported data is rebuilt field by field, never trusted.
// ---------------------------------------------------------------------------
export const importProfile = (raw: unknown): MetaProfile | null => {
  if (!isMeta(raw)) return null;
  const strs = (a: unknown): string[] => (Array.isArray(a) ? a.filter((x): x is string => typeof x === 'string').slice(0, 500) : []);
  const stars: Record<string, number> = {};
  Object.entries(raw.targetStars ?? {}).forEach(([id, n]) => {
    if (typeof n === 'number' && n >= 1 && n <= 3) stars[id] = Math.floor(n);
  });
  return {
    version: 1,
    envelopes: Math.max(0, Math.min(1e6, Math.floor(raw.envelopes))),
    targetStars: stars,
    unlockedTargetIds: strs(raw.unlockedTargetIds),
    unlockedTiers: (raw.unlockedTiers as unknown[]).filter((n): n is number => typeof n === 'number' && n >= 2 && n <= 5),
    unlockedPerks: strs(raw.unlockedPerks),
    equippedPerkId: typeof raw.equippedPerkId === 'string' ? raw.equippedPerkId : null,
    archive: raw.archive.filter(a => a && typeof a.targetId === 'string').slice(0, 60),
    dailyWins: strs(raw.dailyWins).slice(-60),
    story: sanitizeStory(raw.story)
  };
};
