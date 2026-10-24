import { GameState, StateNode } from './types';
import { NIGERIA_STATES } from './data/nigeriaData';
import { ScandalCategory } from './data/channels';
import { TargetArchetype, TargetId, getTarget, scandalTitleFor } from './data/targets';
import { BALANCE } from './balance';
import { perkEffects } from './data/perks';
import { DEFAULT_CLIMATE } from './data/climates';

// Each tier plays on its own clock (spec ratios 24/20/18/16 days, scaled to our longer run).
export const dayBudgetFor = (target: TargetArchetype): number => Math.max(12, (BALANCE.tier.days[target.tier - 1] ?? BALANCE.dayBudget) + (target.mods.days ?? 0));

// Starting Doubt for a state under a given Target (see targetTypes.TargetMods).
export const startingDoubt = (state: StateNode, target: TargetArchetype): number => {
  const m = target.mods;
  if (m.doubtFlat !== undefined) return m.doubtFlat;
  const base = Math.round(state.doubt * BALANCE.baselineDoubtScale);
  const tier = BALANCE.tier.doubtAdd[target.tier - 1] ?? 0;
  const tag = m.tagDoubt?.[state.demographicTag] ?? 0;
  const zone = m.zoneDoubt?.[state.region as keyof typeof m.zoneDoubt] ?? 0;
  return Math.max(0, Math.min(100, base + tier + (m.doubtAdd ?? 0) + tag + zone));
};

// Story approaches and reputation nudge how much every state trusts you at the start.
const shiftDoubt = (states: Record<string, StateNode>, delta: number): Record<string, StateNode> => {
  if (!delta) return states;
  Object.values(states).forEach(s => { s.doubt = Math.max(0, Math.min(100, s.doubt + delta)); });
  return states;
};

export const buildFreshStates = (target: TargetArchetype): Record<string, StateNode> => {
  const fresh: Record<string, StateNode> = {};
  Object.values(NIGERIA_STATES).forEach(s => {
    fresh[s.id] = {
      ...s,
      neighbors: [...s.neighbors],
      traits: [...s.traits],
      unaware: s.population,
      heard: 0,
      believers: 0,
      jaded: 0,
      highDoubtTicks: 0,
      doubt: startingDoubt(s, target),
      hasSpawnedFirstWhisper: false
    };
  });
  return fresh;
};

// The exact Phase 1 "pre-leak" frozen state (spec §3.1), plus the v2 meters.
export interface MatchOptions { seed?: number | null; dailyKey?: string | null; assisted?: boolean; training?: boolean; storyId?: string | null; challenge?: { id: string; by: string; score: number } | null }

export const createMatchState = (
  targetId: TargetId,
  scandalCategory: ScandalCategory,
  perkId: string | null = null,
  climateId: string = DEFAULT_CLIMATE,
  opts: MatchOptions = {}
): GameState => {
  const target = getTarget(targetId);
  const perk = perkEffects(perkId);
  const caseSeed = opts.seed ?? Math.floor(Math.random() * 2147483647);
  return {
    status: 'PLAYING',
    isPaused: false,
    activeModal: 'NONE',
    hasPlantedSeed: false,
    hasPoppedFirstSpark: false,
    startingStateId: null,
    selectedStateId: null,
    activeTargetId: target.id,
    scandalCategory,
    scandalTitle: scandalTitleFor(target, scandalCategory),
    perkId,
    climateId,
    // Every case is seeded, so any win can become a challenge a friend can replay exactly.
    copySeed: caseSeed,
    seed: caseSeed,
    dailyKey: opts.dailyKey ?? null,
    currentDay: 1,
    dayBudget: dayBudgetFor(target),
    sparks: perk.startSparks ?? 0,
    heat: 0,
    peakHeat: 0,
    investigationProgress: perk.startInvestigation ?? 0,
    coverUp: 0,
    peakCoverUp: 0,
    freshness: 100,
    states: shiftDoubt(buildFreshStates(target), perk.doubtDelta ?? 0),
    unlockedChannels: [],
    droppedEvidence: [],
    defensePurchases: {},
    frozenChannels: {},
    injunctionShield: perk.startShield ?? 0,
    abilityNext: target.abilities.map(a => a.start),
    timedEffects: [],
    usedEvents: [],
    lastEventDay: 0,
    backfires: 0,
    winRewards: null,
    assisted: !!opts.assisted,
    training: !!opts.training,
    storyId: opts.storyId ?? null,
    challenge: opts.challenge ?? null,
    activeSparks: [],
    activeSpinBubbles: [],
    flightEvents: [],
    newlyInfectedIds: [],
    chatter: null,
    notificationQueue: [],
    triggeredMilestones: [],
    historyLog: []
  };
};

export const createLobbyState = (): GameState => ({
  ...createMatchState('godfather', 'FINANCIAL'),
  status: 'LOBBY',
  activeTargetId: null
});
