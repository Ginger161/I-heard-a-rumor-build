import { GameState } from './types';
import { createLobbyState } from './newGame';
import { checkInvariants } from './invariants';
import { findChoice, getEventDef } from './events';
import { getTarget } from './data/targets';
import { NIGERIA_STATES } from './data/nigeriaData';
import { TARGETS, SCANDAL_CATEGORIES } from './data/targets';
import { isWiping } from './wipe';


// Bump the suffix whenever GameState changes shape so stale saves are discarded, never migrated.
export const SAVE_KEY = 'rumor_game_save_v9';
const STATE_COUNT = Object.keys(NIGERIA_STATES).length;

export const defaultGameState: GameState = createLobbyState();

// Structural sanity check: a save that fails this is thrown away rather than risk a broken board.
const isValidSave = (value: unknown): value is GameState => {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<GameState>;
  if (!s.status || !['LOBBY', 'PLAYING', 'WON', 'LOST_HEAT', 'LOST_TIME', 'LOST_COVERUP'].includes(s.status)) return false;
  if (!s.states || Object.keys(s.states).length !== STATE_COUNT) return false;
  if (!Object.keys(NIGERIA_STATES).every(id => s.states![id])) return false;
  if (typeof s.currentDay !== 'number' || typeof s.sparks !== 'number' || typeof s.heat !== 'number') return false;
  if (!Array.isArray(s.unlockedChannels) || !Array.isArray(s.notificationQueue) || !Array.isArray(s.activeSparks)) return false;
  if (typeof s.backfires !== 'number' || typeof s.climateId !== 'string' || s.seed === undefined || typeof s.copySeed !== 'number' || s.dailyKey === undefined || s.winRewards === undefined || typeof s.coverUp !== 'number' || typeof s.freshness !== 'number' || !Array.isArray(s.abilityNext) || !Array.isArray(s.timedEffects) || !Array.isArray(s.usedEvents)) return false;
  if (typeof s.frozenChannels !== 'object' || s.frozenChannels === null) return false;
  if (s.status !== 'LOBBY') {
    if (!s.activeTargetId || !TARGETS.some(t => t.id === s.activeTargetId)) return false;
    if (!s.scandalCategory || !SCANDAL_CATEGORIES.includes(s.scandalCategory)) return false;
  }
  return true;
};

// Repairs a loaded save so it can never crash or trap the player. Numbers are clamped, stale or unanswerable decision cards
// are dropped, and the ability schedule is re-aligned with the Target. If the save is still unhealthy after repair, the
// caller discards it.
export const sanitizeState = (input: GameState): GameState => {
  const clamp = (n: unknown, lo: number, hi: number, fallback = 0) => (typeof n === 'number' && Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fallback);
  const s: GameState = { ...input };

  s.sparks = clamp(s.sparks, 0, 1e9);
  s.heat = clamp(s.heat, 0, 100);
  s.peakHeat = clamp(s.peakHeat, 0, 100);
  s.coverUp = clamp(s.coverUp, 0, 100);
  s.peakCoverUp = clamp(s.peakCoverUp, 0, 100);
  s.freshness = clamp(s.freshness, 0, 100, 100);
  s.investigationProgress = clamp(s.investigationProgress, 0, 100);
  s.backfires = clamp(s.backfires, 0, 1e6);
  s.injunctionShield = clamp(s.injunctionShield, 0, 99);
  s.currentDay = clamp(s.currentDay, 1, 9999, 1);
  s.assisted = !!s.assisted;
  s.training = !!s.training;
  s.storyId = typeof s.storyId === 'string' ? s.storyId : null;
  s.storyChoices = Array.isArray(s.storyChoices) ? s.storyChoices.filter(x => typeof x === 'string').slice(0, 40) : [];
  const ch = s.challenge as unknown as { id?: unknown; by?: unknown; score?: unknown } | null | undefined;
  s.challenge = ch && typeof ch.id === 'string' && typeof ch.by === 'string' && typeof ch.score === 'number' ? { id: ch.id.slice(0, 24), by: ch.by.slice(0, 20), score: Math.max(0, Math.min(9999, ch.score)) } : null;

  const states: GameState['states'] = {};
  Object.entries(s.states).forEach(([id, n]) => {
    const pop = Math.max(1, clamp(n.population, 1, 1e9, 1));
    const heard = clamp(n.heard, 0, pop);
    const believers = clamp(n.believers, 0, pop - heard);
    const jaded = clamp(n.jaded, 0, pop - heard - believers);
    states[id] = { ...n, population: pop, heard, believers, jaded, unaware: Math.max(0, pop - heard - believers - jaded), doubt: clamp(n.doubt, 0, 100) };
  });
  s.states = states;

  s.unlockedChannels = Array.from(new Set(s.unlockedChannels));
  s.droppedEvidence = Array.from(new Set(s.droppedEvidence));

  if (s.status !== 'LOBBY') {
    const target = getTarget(s.activeTargetId);
    const next = Array.isArray(s.abilityNext) ? s.abilityNext.slice(0, target.abilities.length) : [];
    while (next.length < target.abilities.length) next.push(target.abilities[next.length].start);
    s.abilityNext = next;
  }

  // A decision card whose event or choices no longer exist could never be answered: drop it.
  s.notificationQueue = (s.notificationQueue ?? []).filter(a => {
    if (!a || !a.id || !a.headline || !a.archetype) return false;
    if (a.choices && a.choices.length > 0) {
      if (!a.eventId || !getEventDef(a.eventId.split(':')[0])) return false;
      return a.choices.every(c => !!findChoice(a.eventId!, c.id));
    }
    return true;
  });
  return s;
};

export const SaveManager = {
  save: (state: GameState): void => {
    if (isWiping()) return;
    try {
      // Transient map events are never persisted.
      const serializable: GameState = { ...state, flightEvents: [], newlyInfectedIds: [], chatter: null };
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
        const repaired = isValidSave(parsed) ? sanitizeState(parsed) : null;
        if (repaired && checkInvariants(repaired).length === 0) {
          const resumePaused = repaired.status === 'PLAYING' && repaired.hasPoppedFirstSpark;
          return {
            ...repaired,
            // Resume paused so the player is never dropped mid-tick. Before the first spark the
            // engine is frozen anyway, so there is nothing to resume.
            isPaused: resumePaused,
            activeModal: resumePaused ? 'PAUSE_MENU' : 'NONE',
            flightEvents: [],
            newlyInfectedIds: [],
            chatter: null
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
