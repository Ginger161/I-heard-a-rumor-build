import { GameState } from './types';
import { INITIAL_STATES } from './data/defaultStates';

const SAVE_KEY = 'ihar_tabloid_save_v1';

export const defaultGameState: GameState = {
  status: 'LOBBY',
  isPaused: false,
  activeModal: 'NONE',
  hasPlantedSeed: false,
  hasPoppedFirstSpark: false,
  startingStateId: null,
  tier: 'NOVICE',
  targetsDefeated: [],
  matchId: null,
  activeTargetId: null,
  activeStoryId: null,
  currentDay: 1,
  dayBudget: 20,
  sparks: 0,
  heat: 0,
  investigationProgress: 0,
  endgameShotFired: false,
  states: INITIAL_STATES,
  lastInterruptDay: 0,
  scramble: { active: false, hoursRemaining: 0, subtleClue: '', queuedMoveId: null, damageReductionMuliplier: 1 },
  pastHistoryLog: [],
  unlockedChannels: [],
  droppedEvidence: [],
  activeCounterOps: [],
  activeSparks: [],
  activeSpinBubbles: [],
  notificationQueue: [],
  triggeredMilestones: []
};

export const SaveManager = {
  save: (state: GameState): void => {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(SAVE_KEY, serialized);
    } catch (e) {
      console.error("Failed to save game state to local storage", e);
    }
  },

  load: (): GameState => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        // SAFETY CATCH: If the save has a planted seed but is at Day 1, or has 0 believers, wipe the board to fix old ghost data.
        if (parsed.currentDay <= 1 && parsed.hasPlantedSeed) {
          localStorage.removeItem(SAVE_KEY);
          return defaultGameState;
        }
        parsed.isPaused = true;
        const rawStates = parsed.states || INITIAL_STATES;
        const normalizedStates = Object.fromEntries(
          Object.entries(rawStates).map(([k, s]) => [
            k,
            { 
              ...s, 
              hasSpawnedFirstWhisper: s.hasSpawnedFirstWhisper ?? false,
              jaded: s.jaded ?? 0,
              highDoubtTicks: s.highDoubtTicks ?? 0,
              demographicTag: s.demographicTag ?? (INITIAL_STATES[k]?.demographicTag || 'GRASSROOTS'),
              neighbors: s.neighbors ?? (INITIAL_STATES[k]?.neighbors || []),
              hasAirport: s.hasAirport ?? (INITIAL_STATES[k]?.hasAirport || false),
              traits: s.traits ?? (INITIAL_STATES[k]?.traits || [])
            }
          ])
        );

        // Ensure newly supported states are included if save came from an older version
        Object.entries(INITIAL_STATES).forEach(([k, s]) => {
          if (!normalizedStates[k]) {
            normalizedStates[k] = s;
          }
        });

        return {
          ...defaultGameState,
          ...parsed,
          states: normalizedStates,
          activeSpinBubbles: parsed.activeSpinBubbles || [],
          isPaused: true,
          activeModal: parsed.status === 'PLAYING' ? 'NONE' : (parsed.activeModal || 'NONE')
        };
      }
    } catch (e) {
      console.error('Save load failed', e);
    }
    return defaultGameState;
  },

  clearActiveMatch: (state: GameState): GameState => {
    const newState = {
      ...defaultGameState,
      tier: state.tier,
      targetsDefeated: state.targetsDefeated, // Keep progression
      status: 'LOBBY' as const,
      activeModal: 'NONE' as const
    };
    SaveManager.save(newState);
    return newState;
  },

  hardReset: (): GameState => {
    localStorage.removeItem(SAVE_KEY);
    return defaultGameState;
  }
};
