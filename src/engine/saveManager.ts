import { GameState } from './types';
import { createLobbyState } from './newGame';
import { NIGERIA_STATES } from './data/nigeriaData';
import { TARGETS, SCANDAL_CATEGORIES } from './data/targets';


// Bump the suffix whenever GameState changes shape so stale saves are discarded, never migrated.
export const SAVE_KEY = 'rumor_game_save_v4';
const STATE_COUNT = Object.keys(NIGERIA_STATES).length;

export const defaultGameState: GameState = createLobbyState();

// Structural sanity check: a save that fails this is thrown away rather than risk a broken board.
const isValidSave = (value: unknown): value is GameState => {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<GameState>;
  if (!s.status || !['LOBBY', 'PLAYING', 'WON', 'LOST_HEAT', 'LOST_TIME'].includes(s.status)) return false;
  if (!s.states || Object.keys(s.states).length !== STATE_COUNT) return false;
  if (!Object.keys(NIGERIA_STATES).every(id => s.states![id])) return false;
  if (typeof s.currentDay !== 'number' || typeof s.sparks !== 'number' || typeof s.heat !== 'number') return false;
  if (!Array.isArray(s.unlockedChannels) || !Array.isArray(s.notificationQueue) || !Array.isArray(s.activeSparks)) return false;
  if (s.status !== 'LOBBY') {
    if (!s.activeTargetId || !TARGETS.some(t => t.id === s.activeTargetId)) return false;
    if (!s.scandalCategory || !SCANDAL_CATEGORIES.includes(s.scandalCategory)) return false;
  }
  return true;
};

export const SaveManager = {
  save: (state: GameState): void => {
    try {
      // Transient map events are never persisted.
      const serializable: GameState = { ...state, flightEvents: [], newlyInfectedIds: [] };
      localStorage.setItem(SAVE_KEY, JSON.stringify(serializable));
    } catch (e) {
      console.error('Failed to save game state to local storage', e);
    }
  },

  load: (): GameState => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isValidSave(parsed)) {
          return {
            ...parsed,
            // Resume paused so the player is never dropped mid-tick. Before the first spark the
            // engine is frozen anyway, so there is nothing to resume.
            isPaused: parsed.status === 'PLAYING' && parsed.hasPoppedFirstSpark,
            activeModal: 'NONE',
            flightEvents: [],
            newlyInfectedIds: []
          };
        }
        console.warn('Discarding incompatible save.');
        localStorage.removeItem(SAVE_KEY);
      }
    } catch (e) {
      console.error('Save load failed', e);
      try { localStorage.removeItem(SAVE_KEY); } catch { /* storage unavailable */ }
    }
    return createLobbyState();
  },

  // "New Investigation / Reset": wipe the save and return a clean lobby.
  hardReset: (): GameState => {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* storage unavailable */ }
    return createLobbyState();
  }
};
