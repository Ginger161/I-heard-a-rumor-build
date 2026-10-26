import { GameState, ModalState } from './types';
import { ScandalCategory } from './data/channels';
import { TargetId, getTarget, temperamentMods } from './data/targets';
import { getEvidence } from './data/evidence';
import { getDefense } from './data/defense';
import { AlertFactory, pushAlert } from './alerts';
import { createMatchState, MatchOptions } from './newGame';
import { alertToHistory, appendHistory, evaluateEndgame, Rng } from './simulation';
import { applyEffects } from './effects';
import { findChoice } from './events';
import { BALANCE } from './balance';
import { perkEffects } from './data/perks';
import { chatterPing } from './chatter';
import { channelAvailable, clamp, defenseActualCut, defenseCostFor, evidenceCostFor, evidenceFadeFor, getChannel, nationalAverageDoubt } from './selectors';

export const FIRST_SPARK_AMOUNT = BALANCE.seedSpark;
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
  startMatch: (targetId: TargetId, category: ScandalCategory, perkId: string | null = null, climateId?: string, opts?: MatchOptions): GameState =>
    createMatchState(targetId, category, perkId, climateId, opts),

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
        kind: 'WHISPER' as const,
        stateId,
        amount: perkEffects(s.perkId).seedSpark ?? FIRST_SPARK_AMOUNT,
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
      const alert = AlertFactory.createSeedAlert(stateName, getTarget(s.activeTargetId), s.climateId, s.copySeed);
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

  dismissTopAlert: (s: GameState): GameState => {
    const top = s.notificationQueue[0];
    if (!top || (top.choices && top.choices.length > 0)) return s; // Decision cards must be answered
    // The clock starts when the Ground Zero card is dismissed: the Target reacts.
    const chatter = top.id.startsWith('seed_') ? chatterPing(s.activeTargetId, 'onStart') : s.chatter;
    return { ...s, notificationQueue: s.notificationQueue.slice(1), chatter };
  },

  // Answer an event / informant decision card.
  chooseOption: (s: GameState, choiceId: string, rng: Rng = Math.random): GameState => {
    const top = s.notificationQueue[0];
    if (!top || !top.eventId || !top.choices) return s;
    const choice = findChoice(top.eventId, choiceId);
    if (!choice) {
      // Unknown choice: if the card itself is unanswerable (e.g. content changed), drop it so the game can never get stuck.
      const answerable = top.choices.some(c => !!findChoice(top.eventId!, c.id));
      return answerable ? s : { ...s, notificationQueue: s.notificationQueue.slice(1) };
    }
    if (choice.cost && s.sparks < choice.cost) return s;
    let next: GameState = { ...s, sparks: s.sparks - (choice.cost ?? 0), notificationQueue: s.notificationQueue.slice(1) };
    next = applyEffects(next, choice.effects, rng, `${s.currentDay}c${choiceId}`).state;
    next = {
      ...next,
      storyChoices: choice.story ? [...(next.storyChoices ?? []), `${top.eventId}:${choiceId}`].slice(-40) : next.storyChoices ?? [],
      historyLog: appendHistory(next.historyLog, { day: Math.min(s.currentDay, s.dayBudget), headline: top.headline, impact: choice.label })
    };
    return finalize(next);
  },

  buyChannel: (s: GameState, channelId: string): GameState => {
    const channel = getChannel(channelId);
    if (!channel || s.status !== 'PLAYING') return s;
    if (s.unlockedChannels.includes(channelId) || s.sparks < channel.cost || !channelAvailable(s, channel)) return s;
    const alert = AlertFactory.createChannelAlert(channelId, s.scandalCategory, getTarget(s.activeTargetId), s.copySeed);
    return {
      ...s,
      sparks: s.sparks - channel.cost,
      freshness: clamp(s.freshness + BALANCE.freshnessOnChannelBuy, 0, 100),
      chatter: chatterPing(s.activeTargetId, 'onChannelBought'),
      unlockedChannels: [...s.unlockedChannels, channelId],
      notificationQueue: pushAlert(s.notificationQueue, alert),
      historyLog: alert ? appendHistory(s.historyLog, alertToHistory(alert, s.currentDay)) : s.historyLog
    };
  },

  leakEvidence: (s: GameState, evidenceId: string, rng: Rng = Math.random): GameState => {
    const item = getEvidence(evidenceId);
    if (!item || s.status !== 'PLAYING') return s;
    const cost = evidenceCostFor(s, item);
    if (s.droppedEvidence.includes(evidenceId) || s.sparks < cost) return s;
    if (s.investigationProgress < item.requiredInvestigation) return s;
    if (item.isFabricated && getTarget(s.activeTargetId).mods.noForgery) return s;     // a room of liars: forgeries are not an option

    const backfireRisk = (FORGERY_BASE_BACKFIRE
      + (nationalAverageDoubt(s.states) > 55 ? FORGERY_HIGH_DOUBT_BACKFIRE : 0)
      + (getTarget(s.activeTargetId).mods.forgeryRisk ?? 0)) * (perkEffects(s.perkId).forgeryRiskMult ?? 1);
    const backfired = item.isFabricated && rng() < backfireRisk;

    const states = { ...s.states };
    const fade = item.isFabricated ? 1 : evidenceFadeFor(s);   // people stop being shocked by file after file
    let heat = s.heat;
    let coverUp = s.coverUp;
    let freshness = s.freshness;

    if (backfired) {
      coverUp += 15;
      freshness -= 10;
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
        const doubt = clamp(st.doubt - item.doubtReduction * fade, 0, 100);
        states[id] = {
          ...st,
          heard,
          believers,
          jaded,
          doubt,
          highDoubtTicks: doubt >= 70 ? st.highDoubtTicks : 0
        };
      });
      heat += item.heatIncrease * temperamentMods(getTarget(s.activeTargetId)).evidenceHeat;
      coverUp -= item.coverUpReduction;
      freshness += item.freshnessBoost;
    }

    const alert = AlertFactory.createEvidenceAlert(item, backfired, s.scandalCategory, getTarget(s.activeTargetId), s.copySeed);
    return finalize({
      ...s,
      states,
      sparks: s.sparks - cost,
      heat: clamp(heat, 0, 100),
      coverUp: clamp(coverUp, 0, 100),
      peakCoverUp: Math.max(s.peakCoverUp, clamp(coverUp, 0, 100)),
      freshness: clamp(freshness, 0, 100),
      backfires: s.backfires + (backfired ? 1 : 0),
      chatter: chatterPing(s.activeTargetId, backfired ? 'onBackfire' : 'onEvidenceDropped'),
      droppedEvidence: [...s.droppedEvidence, evidenceId],
      notificationQueue: pushAlert(s.notificationQueue, alert),
      historyLog: appendHistory(s.historyLog, alertToHistory(alert, s.currentDay))
    });
  },

  buyDefense: (s: GameState, defenseId: string): GameState => {
    const item = getDefense(defenseId);
    if (!item || s.status !== 'PLAYING') return s;
    const uses = s.defensePurchases[defenseId] ?? 0;
    const cost = defenseCostFor(s, item);
    if (uses >= item.maxUses || s.sparks < cost) return s;
    const alert = AlertFactory.createDefenseAlert(item, s.copySeed, s.activeTargetId);
    return finalize({
      ...s,
      sparks: s.sparks - cost,
      heat: clamp(s.heat - defenseActualCut(s, item), 0, 100),
      defensePurchases: { ...s.defensePurchases, [defenseId]: uses + 1 },
      activeSpinBubbles: defenseId === 'san_injunction' ? [] : s.activeSpinBubbles,
      frozenChannels: defenseId === 'san_injunction' ? {} : s.frozenChannels,
      injunctionShield: defenseId === 'san_injunction' ? s.injunctionShield + 2 : s.injunctionShield,
      notificationQueue: pushAlert(s.notificationQueue, alert),
      historyLog: appendHistory(s.historyLog, alertToHistory(alert, s.currentDay))
    });
  }
};
