import { GameState, StateNode } from './types';
import { NIGERIA_STATES } from './data/nigeriaData';
import { ScandalCategory } from './data/channels';
import { TargetId } from './data/targets';
import { BALANCE } from './balance';

export const DAY_BUDGET = 20;

// Doubt baseline per state (see balance.ts). Flock Immunity overrides every state with a flat value.
export const startingDoubt = (state: StateNode, targetId: TargetId | null): number =>
  targetId === 'televangelist' ? BALANCE.flockImmunityDoubt : Math.round(state.doubt * BALANCE.baselineDoubtScale);

export const buildFreshStates = (targetId: TargetId | null): Record<string, StateNode> => {
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
      doubt: startingDoubt(s, targetId),
      hasSpawnedFirstWhisper: false
    };
  });
  return fresh;
};

// The exact Phase 1 "pre-leak" frozen state (spec §3.1).
export const createMatchState = (targetId: TargetId, scandalCategory: ScandalCategory): GameState => ({
  status: 'PLAYING',
  isPaused: false,
  activeModal: 'NONE',
  hasPlantedSeed: false,
  hasPoppedFirstSpark: false,
  startingStateId: null,
  selectedStateId: null,
  activeTargetId: targetId,
  scandalCategory,
  currentDay: 1,
  dayBudget: DAY_BUDGET,
  sparks: 0,
  heat: 0,
  peakHeat: 0,
  investigationProgress: 0,
  states: buildFreshStates(targetId),
  unlockedChannels: [],
  droppedEvidence: [],
  defensePurchases: {},
  activeSparks: [],
  activeSpinBubbles: [],
  flightEvents: [],
  newlyInfectedIds: [],
  notificationQueue: [],
  triggeredMilestones: [],
  historyLog: []
});

export const createLobbyState = (): GameState => ({
  ...createMatchState('godfather', 'FINANCIAL'),
  status: 'LOBBY',
  activeTargetId: null
});
