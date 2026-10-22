import { FlightEvent, GameAlert, GameState, GameStatus, HistoryLogEntry, SparkBubble, SpinBubbleData, StateNode } from './types';
import { AlertFactory, milestoneEffect } from './alerts';
import { BOT_FARM_HUBS } from './data/targets';
import { BALANCE } from './balance';
import { computeMasterVariables, isInfected, nationalBelieverPct } from './selectors';

export type Rng = () => number;

export const WIN_BELIEVER_PCT = 75;
const MAX_SPARKS_ON_BOARD = 5;
const MAX_SPIN_BUBBLES = 6;
const HISTORY_LIMIT = 80;

// Spec §3.2: the daily clock is frozen unless every one of these holds.
export const canTick = (s: GameState): boolean =>
  s.status === 'PLAYING' &&
  s.hasPoppedFirstSpark &&
  !s.isPaused &&
  s.notificationQueue.length === 0 &&
  s.activeModal === 'NONE';

export const alertToHistory = (alert: GameAlert, day: number): HistoryLogEntry => ({
  day: Math.min(day, 20),
  headline: alert.headline,
  impact: alert.subtext ?? alert.stampText
});

export const appendHistory = (log: HistoryLogEntry[], entry: HistoryLogEntry): HistoryLogEntry[] =>
  [...log, entry].slice(-HISTORY_LIMIT);

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const jitter = (rng: Rng, range: number) => Math.floor(rng() * (range * 2 + 1)) - range;

// ---------------------------------------------------------------------------
// Spin bubbles (Target AI "PR spin"): host states are weighted; Bot Farm War Chest doubles the
// weight of the online hubs.
// ---------------------------------------------------------------------------
export const spawnSpinBubbles = (
  count: number,
  states: Record<string, StateNode>,
  targetId: GameState['activeTargetId'],
  rng: Rng,
  idSeed: string,
  existing: SpinBubbleData[]
): SpinBubbleData[] => {
  const infected = Object.values(states).filter(isInfected);
  if (infected.length === 0 || count <= 0) return existing;
  const weights = infected.map(s => (targetId === 'cryptoking' && BOT_FARM_HUBS.includes(s.id) ? 2 : 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const out = [...existing];
  for (let i = 0; i < count && out.length < MAX_SPIN_BUBBLES + count; i++) {
    let roll = rng() * totalWeight;
    let host = infected[infected.length - 1];
    for (let j = 0; j < infected.length; j++) {
      roll -= weights[j];
      if (roll <= 0) { host = infected[j]; break; }
    }
    out.push({
      id: `spin_${idSeed}_${i}_${Math.floor(rng() * 100000)}`,
      stateId: host.id,
      doubtPenalty: 15,
      offsetX: jitter(rng, 14),
      offsetY: jitter(rng, 14),
      ticksRemaining: BALANCE.spinLifetimeTicks
    });
  }
  return out;
};

export const evaluateEndgame = (s: GameState): GameStatus => {
  if (nationalBelieverPct(s.states) >= WIN_BELIEVER_PCT) return 'WON';
  if (s.heat >= 100) return 'LOST_HEAT';
  if (s.currentDay > s.dayBudget) return 'LOST_TIME';
  return 'PLAYING';
};

export const SimulationEngine = {
  processTick: (prev: GameState, rng: Rng = Math.random): GameState => {
    if (!canTick(prev)) return prev;

    const day = prev.currentDay + 1;
    const vars = computeMasterVariables(prev);
    const hasDefense = (id: string) => (prev.defensePurchases[id] ?? 0) > 0;

    // Working copies
    const states: Record<string, StateNode> = {};
    Object.values(prev.states).forEach(s => { states[s.id] = { ...s }; });
    const wasInfected = new Set(Object.values(prev.states).filter(isInfected).map(s => s.id));
    const history: HistoryLogEntry[] = [];

    // ---- Stage 2: bubble lifespans & Spin detonations ----
    let sparks: SparkBubble[] = prev.activeSparks
      .map(sp => ({ ...sp, ticksRemaining: sp.ticksRemaining - 1 }))
      .filter(sp => sp.ticksRemaining > 0);

    let spins: SpinBubbleData[] = prev.activeSpinBubbles.map(b => ({ ...b, ticksRemaining: b.ticksRemaining - 1 }));
    const detonated = spins.filter(b => b.ticksRemaining <= 0);
    spins = spins.filter(b => b.ticksRemaining > 0);
    detonated.forEach(b => {
      const host = states[b.stateId];
      if (!host) return;
      host.doubt = clamp(host.doubt + b.doubtPenalty, 0, 100);
      host.neighbors.forEach(nid => {
        if (states[nid]) states[nid].doubt = clamp(states[nid].doubt + 4, 0, 100);
      });
      history.push({ day: Math.min(day, prev.dayBudget), headline: `Spin bubble detonated in ${host.name}`, impact: `+${b.doubtPenalty}% Doubt (${host.name}), +4% neighbors` });
    });

    // ---- Stage 3: highways & flights (eligibility from the start-of-tick snapshot) ----
    const highwayChance = Math.min(0.85, 0.2 + vars.velocity * 0.3 + vars.streetCount * 0.08);
    Object.values(prev.states).forEach(src => {
      const reach = src.heard + src.believers;
      if (!(reach > 2000 || reach > src.population * 0.01)) return;
      src.neighbors.forEach(nid => {
        const dest = states[nid];
        if (!dest || dest.unaware <= 0) return;
        if (rng() >= highwayChance) return;
        const seed = Math.min(dest.unaware, Math.max(1, Math.floor(dest.population * 0.002)));
        dest.unaware -= seed;
        dest.heard += seed;
      });
    });

    const flights: FlightEvent[] = [];
    const flightChance = Math.min(0.75, 0.15 + vars.velocity * 0.25);
    const hubs = Object.values(prev.states).filter(s => s.hasAirport);
    if (vars.socialCount + vars.pressCount >= 1) {
      hubs.forEach(origin => {
        if ((origin.heard + origin.believers) / origin.population <= 0.03) return;
        if (rng() >= flightChance) return;
        const choices = hubs.filter(h => h.id !== origin.id);
        if (choices.length === 0) return;
        const destSnap = choices[Math.floor(rng() * choices.length)];
        const dest = states[destSnap.id];
        const seed = Math.min(dest.unaware, Math.max(1, Math.floor(dest.population * 0.003)));
        if (seed <= 0) return;
        dest.unaware -= seed;
        dest.heard += seed;
        flights.push({ id: `flight_${day}_${origin.id}_${dest.id}`, from: origin.id, to: dest.id });
      });
    }

    // ---- Stage 4: intra-state funnel, Doubt, Gist Fatigue, First Whisper ----
    Object.values(states).forEach(s => {
      if (!isInfected(s)) return;

      let friction = 1;
      let doubtGrowth = 1.5;
      if (s.demographicTag === 'GRASSROOTS') {
        friction = 0.85 + vars.streetCount * 0.2;
        doubtGrowth = 1.5;
      } else if (s.demographicTag === 'HYPER_ONLINE') {
        friction = 0.9 + vars.socialCount * 0.25;
        doubtGrowth = 3.5;
      } else {
        // ELITE_HUB
        friction = vars.pressEliteCount < 2
          ? (prev.activeTargetId === 'godfather' ? 0.25 : 0.4)
          : 1.15 + vars.pressEliteCount * 0.15;
        doubtGrowth = 2.8;
      }

      // Unaware -> Heard
      const susceptibleRatio = Math.max(0.05, s.unaware / s.population);
      const viralFloor = s.unaware > 0 ? Math.floor(s.population * 0.014 * friction * Math.min(1.2, vars.velocity)) : 0;
      const newHeard = Math.min(s.unaware, Math.floor(s.heard * vars.velocity * friction * susceptibleRatio) + viralFloor);

      // Heard -> Believers
      const doubtShield = Math.max(0, (100 - s.doubt) / 100);
      const convictionFloor = s.heard > 100 && s.doubt < 75 ? Math.floor(s.heard * 0.045 * doubtShield) : 0;
      const newBelievers = Math.min(s.heard, Math.floor(s.heard * vars.credibility * doubtShield) + convictionFloor);

      s.unaware -= newHeard;
      s.heard = s.heard + newHeard - newBelievers;
      s.believers += newBelievers;

      // Doubt escalation vs credibility anchor
      const anchor = vars.credibility * 3.2;
      s.doubt = clamp(s.doubt + Math.max(-1.8, doubtGrowth - anchor), 0, 100);

      // Gist Fatigue: Heard -> Jaded
      s.highDoubtTicks = s.doubt >= 70 ? s.highDoubtTicks + 1 : 0;
      if (s.highDoubtTicks >= 2) {
        const burnedOut = Math.floor(s.heard * 0.12);
        s.heard -= burnedOut;
        s.jaded += burnedOut;
      }

      // Deterministic First Whisper spark
      if (!s.hasSpawnedFirstWhisper) {
        sparks.push({
          id: `spark_first_${s.id}_${day}`,
          stateId: s.id,
          amount: 8,
          offsetX: jitter(rng, 10),
          offsetY: jitter(rng, 10),
          ticksRemaining: 3
        });
        s.hasSpawnedFirstWhisper = true;
      }
    });

    const newlyInfectedIds = Object.values(states).filter(s => isInfected(s) && !wasInfected.has(s.id)).map(s => s.id);

    // ---- Stage 5: stochastic sparks, ambient Spin, Heat, Investigation ----
    const infectedStates = Object.values(states).filter(isInfected);
    if (sparks.length < MAX_SPARKS_ON_BOARD && infectedStates.length > 0) {
      if (rng() < Math.min(0.65, 0.25 + vars.notoriety * 0.45)) {
        const host = infectedStates[Math.floor(rng() * infectedStates.length)];
        const fat = rng() > 0.7;
        sparks.push({
          id: `spark_rng_${host.id}_${day}_${Math.floor(rng() * 100000)}`,
          stateId: host.id,
          amount: fat ? 7 + Math.floor(rng() * 6) : 3 + Math.floor(rng() * 3),
          offsetX: jitter(rng, 15),
          offsetY: jitter(rng, 15),
          ticksRemaining: fat ? 4 : 2
        });
      }
    }

    // Ambient Spin: once the story has real traction the Target's PR machine starts lobbing bubbles.
    if (nationalBelieverPct(states) >= BALANCE.spinAmbientMinBelieverPct && spins.length < BALANCE.spinAmbientMaxActive && rng() < BALANCE.spinAmbientChance) {
      spins = spawnSpinBubbles(1, states, prev.activeTargetId, rng, `${day}a`, spins);
    }

    const proxyMultiplier = hasDefense('proxy_relay') ? 0.75 : 1;
    const targetHeatMultiplier = prev.activeTargetId === 'godfather' ? 1.15 : 1;
    let heat = prev.heat + Math.max(1.5, vars.notoriety * 7.5 * proxyMultiplier) * targetHeatMultiplier;
    const investigationBonus = hasDefense('whistleblower') ? 5 : 0;
    const investigationProgress = Math.min(100, prev.investigationProgress + 6 + investigationBonus);

    // ---- Assemble, then audit milestones (at most one background alert per tick) ----
    let next: GameState = {
      ...prev,
      currentDay: day,
      states,
      activeSparks: sparks,
      activeSpinBubbles: spins,
      flightEvents: flights,
      newlyInfectedIds,
      heat: clamp(heat, 0, 100),
      investigationProgress,
      historyLog: history.reduce((log, h) => appendHistory(log, h), prev.historyLog)
    };
    next.peakHeat = Math.max(prev.peakHeat, next.heat);

    const winner = AlertFactory.evaluateTickTriggers(next);
    if (winner) {
      const effect = milestoneEffect(winner.milestoneId, next);
      if (effect) {
        if (effect.doubtAll) {
          Object.values(next.states).forEach(s => { s.doubt = clamp(s.doubt + effect.doubtAll!, 0, 100); });
        }
        if (effect.heat) {
          next.heat = clamp(next.heat + effect.heat, 0, 100);
          next.peakHeat = Math.max(next.peakHeat, next.heat);
        }
        if (effect.spin) {
          next.activeSpinBubbles = spawnSpinBubbles(effect.spin, next.states, next.activeTargetId, rng, `${day}p${winner.milestoneId}`, next.activeSpinBubbles);
        }
      }
      next.notificationQueue = [...next.notificationQueue, winner.alert];
      next.triggeredMilestones = [...next.triggeredMilestones, winner.milestoneId];
      next.historyLog = appendHistory(next.historyLog, alertToHistory(winner.alert, day));
    }

    // ---- Endgame ----
    const status = evaluateEndgame(next);
    if (status !== 'PLAYING') {
      next = { ...next, status, isPaused: true, activeModal: 'NONE', notificationQueue: [] };
    }
    return next;
  }
};
