import { GameState, ModalState } from './types';
import { ScandalCategory } from './data/channels';
import { TargetId, getTarget } from './data/targets';
import { getEvidence } from './data/evidence';
import { getDefense } from './data/defense';
import { AlertFactory, pushAlert } from './alerts';
import { createMatchState } from './newGame';
import { alertToHistory, appendHistory, evaluateEndgame, Rng } from './simulation';
import { channelAvailable, getChannel, nationalAverageDoubt } from './selectors';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const FIRST_SPARK_AMOUNT = 15;
export const FORGERY_BASE_BACKFIRE = 0.3;
export const FORGERY_HIGH_DOUBT_BACKFIRE = 0.35;

export const seedSparkId = (stateId: string) => `spark_first_${stateId}`;

// After any action that can move Heat or Believers, re-run the endgame check.
const finalize = (s: GameState): GameState => {
  const peakHeat = Math.max(s.peakHeat, s.heat);
  const next = { ...s, peakHeat };
  if (next.status !== 'PLAYING') return next;
  const status = evaluateEndgame(next);
  if (status === 'PLAYING') return next;
  return { ...next, status, isPaused: true, activeModal: 'NONE', notificationQueue: [] };
};

export const Actions = {
  startMatch: (targetId: TargetId, category: ScandalCategory): GameState => createMatchState(targetId, category),

  // Phase 1, step 1: plant the seed and drop the deterministic 15 spark.
  plantSeed: (s: GameState, stateId: string): GameState => {
    if (s.status !== 'PLAYING' || s.hasPlantedSeed || !s.states[stateId]) return s;
    const node = s.states[stateId];
    return {
      ...s,
      hasPlantedSeed: true,
      startingStateId: stateId,
      selectedStateId: stateId,
      states: {
        ...s.states,
        [stateId]: {
          ...node,
          heard: 1,
          unaware: Math.max(0, node.unaware - 1),
          hasSpawnedFirstWhisper: true
        }
      },
      activeSparks: [{
        id: seedSparkId(stateId),
        stateId,
        amount: FIRST_SPARK_AMOUNT,
        offsetX: 0,
        offsetY: -14,
        ticksRemaining: 9999
      }]
    };
  },

  // Phase 1, step 2 (and every later spark): bank the spark. Popping the seed spark unlocks the game.
  collectSpark: (s: GameState, sparkId: string): GameState => {
    const spark = s.activeSparks.find(sp => sp.id === sparkId);
    if (!spark || s.status !== 'PLAYING') return s;
    const isSeed = !s.hasPoppedFirstSpark && s.startingStateId !== null && sparkId === seedSparkId(s.startingStateId);
    let next: GameState = {
      ...s,
      sparks: s.sparks + spark.amount,
      activeSparks: s.activeSparks.filter(sp => sp.id !== sparkId)
    };
    if (isSeed) {
      const stateName = s.states[s.startingStateId!]?.name ?? 'Nigeria';
      const alert = AlertFactory.createSeedAlert(stateName, getTarget(s.activeTargetId));
      next = {
        ...next,
        hasPoppedFirstSpark: true,
        notificationQueue: pushAlert(next.notificationQueue, alert),
        historyLog: appendHistory(next.historyLog, alertToHistory(alert, next.currentDay))
      };
    }
    return next;
  },

  // Shattering a Spin bubble before it detonates.
  popSpin: (s: GameState, spinId: string): GameState => {
    if (!s.activeSpinBubbles.some(b => b.id === spinId)) return s;
    return { ...s, activeSpinBubbles: s.activeSpinBubbles.filter(b => b.id !== spinId) };
  },

  // Inspection card selection. Tapping the ocean passes null.
  selectState: (s: GameState, stateId: string | null): GameState => {
    if (!s.hasPlantedSeed) return s;
    if (stateId !== null && !s.states[stateId]) return s;
    return s.selectedStateId === stateId ? s : { ...s, selectedStateId: stateId };
  },

  setModal: (s: GameState, modal: ModalState): GameState => {
    if (s.status !== 'PLAYING') return s;
    if (modal !== 'NONE' && !s.hasPoppedFirstSpark) return s; // Dock is locked in Phase 1
    return { ...s, activeModal: modal };
  },

  pause: (s: GameState): GameState =>
    s.status === 'PLAYING' && s.hasPoppedFirstSpark ? { ...s, isPaused: true, activeModal: 'PAUSE_MENU' } : s,

  resume: (s: GameState): GameState => ({ ...s, isPaused: false, activeModal: 'NONE' }),

  dismissTopAlert: (s: GameState): GameState =>
    s.notificationQueue.length === 0 ? s : { ...s, notificationQueue: s.notificationQueue.slice(1) },

  buyChannel: (s: GameState, channelId: string): GameState => {
    const channel = getChannel(channelId);
    if (!channel || s.status !== 'PLAYING') return s;
    if (s.unlockedChannels.includes(channelId) || s.sparks < channel.cost || !channelAvailable(s, channel)) return s;
    const alert = AlertFactory.createChannelAlert(channelId, s.scandalCategory, getTarget(s.activeTargetId));
    return {
      ...s,
      sparks: s.sparks - channel.cost,
      unlockedChannels: [...s.unlockedChannels, channelId],
      notificationQueue: pushAlert(s.notificationQueue, alert),
      historyLog: alert ? appendHistory(s.historyLog, alertToHistory(alert, s.currentDay)) : s.historyLog
    };
  },

  leakEvidence: (s: GameState, evidenceId: string, rng: Rng = Math.random): GameState => {
    const item = getEvidence(evidenceId);
    if (!item || s.status !== 'PLAYING') return s;
    if (s.droppedEvidence.includes(evidenceId) || s.sparks < item.cost) return s;
    if (s.investigationProgress < item.requiredInvestigation) return s;

    const backfireRisk = FORGERY_BASE_BACKFIRE + (nationalAverageDoubt(s.states) > 55 ? FORGERY_HIGH_DOUBT_BACKFIRE : 0);
    const backfired = item.isFabricated && rng() < backfireRisk;

    const states = { ...s.states };
    let heat = s.heat;

    if (backfired) {
      Object.keys(states).forEach(id => {
        states[id] = { ...states[id], doubt: clamp(states[id].doubt + 20, 0, 100) };
      });
      heat += 25;
    } else {
      Object.keys(states).forEach(id => {
        const st = states[id];
        const toHeard = Math.floor(st.jaded * item.jadedToHeard);
        const toBelievers = Math.floor(st.jaded * item.jadedToBelievers);
        let heard = st.heard + toHeard;
        let believers = st.believers + toBelievers;
        const jaded = Math.max(0, st.jaded - toHeard - toBelievers);
        if (item.heardToBelievers > 0) {
          const converted = Math.floor(heard * item.heardToBelievers);
          heard -= converted;
          believers += converted;
        }
        const doubt = clamp(st.doubt - item.doubtReduction, 0, 100);
        states[id] = {
          ...st,
          heard,
          believers,
          jaded,
          doubt,
          highDoubtTicks: doubt >= 70 ? st.highDoubtTicks : 0
        };
      });
      heat += item.heatIncrease;
    }

    const alert = AlertFactory.createEvidenceAlert(item, backfired, s.scandalCategory, getTarget(s.activeTargetId));
    return finalize({
      ...s,
      states,
      sparks: s.sparks - item.cost,
      heat: clamp(heat, 0, 100),
      droppedEvidence: [...s.droppedEvidence, evidenceId],
      notificationQueue: pushAlert(s.notificationQueue, alert),
      historyLog: appendHistory(s.historyLog, alertToHistory(alert, s.currentDay))
    });
  },

  buyDefense: (s: GameState, defenseId: string): GameState => {
    const item = getDefense(defenseId);
    if (!item || s.status !== 'PLAYING') return s;
    const uses = s.defensePurchases[defenseId] ?? 0;
    if (uses >= item.maxUses || s.sparks < item.cost) return s;
    const alert = AlertFactory.createDefenseAlert(item);
    return finalize({
      ...s,
      sparks: s.sparks - item.cost,
      heat: clamp(s.heat - item.heatReduction, 0, 100),
      defensePurchases: { ...s.defensePurchases, [defenseId]: uses + 1 },
      activeSpinBubbles: defenseId === 'san_injunction' ? [] : s.activeSpinBubbles,
      notificationQueue: pushAlert(s.notificationQueue, alert),
      historyLog: appendHistory(s.historyLog, alertToHistory(alert, s.currentDay))
    });
  }
};
