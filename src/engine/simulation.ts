import { FlightEvent, GameAlert, GameState, GameStatus, HistoryLogEntry, SparkBubble, SpinBubbleData, StateNode } from './types';
import { AlertFactory, abilityEffects, buildAbilityAlert, dominantBranch, milestoneEffect } from './alerts';
import { BALANCE } from './balance';
import { Rng, applyEffects, spawnSpinBubbles } from './effects';
import { buildEventAlert, pickEvent, scheduledEvent } from './events';
import { TRAINING_OCCURRENCES } from './data/trainingEvents';
import { STYLE_MULTIPLIERS, getTarget, temperamentMods } from './data/targets';
import {
  clamp, computeMasterVariables, exposureMultiplier, heatMultiplier, isInfected, nationalBelieverPct, spinMultiplier, whisperBounty
} from './selectors';
import { perkEffects } from './data/perks';
import { getClimate } from './data/climates';
import { chatterPing } from './chatter';
import { mulberry32 } from './daily';
import type { Effect } from './effects';

export type { Rng } from './effects';

export const WIN_BELIEVER_PCT = BALANCE.winBelieverPct;
const HISTORY_LIMIT = 80;

// Spec §3.2: the daily clock is frozen unless every one of these holds.
export const canTick = (s: GameState): boolean =>
  s.status === 'PLAYING' &&
  s.hasPoppedFirstSpark &&
  !s.isPaused &&
  s.notificationQueue.length === 0 &&
  s.activeModal === 'NONE';

export const alertToHistory = (alert: GameAlert, day: number): HistoryLogEntry => ({
  day,
  headline: alert.headline,
  impact: alert.subtext ?? alert.stampText
});

export const appendHistory = (log: HistoryLogEntry[], entry: HistoryLogEntry): HistoryLogEntry[] =>
  [...log, entry].slice(-HISTORY_LIMIT);

const jitter = (rng: Rng, range: number) => Math.floor(rng() * (range * 2 + 1)) - range;

export { spawnSpinBubbles };

// Milestones that make the Target say its "critical" line on the Polaroid.
const CRITICAL_MILESTONES = ['HEAT_90', 'COVER_88', 'CRASHOUT', 'STOIC_AMBUSH'];

export const evaluateEndgame = (s: GameState): GameStatus => {
  if (nationalBelieverPct(s.states) >= WIN_BELIEVER_PCT) return 'WON';
  if (s.heat >= 100) return 'LOST_HEAT';
  if (s.coverUp >= BALANCE.coverUpLose) return 'LOST_COVERUP';
  if (s.currentDay > s.dayBudget) return 'LOST_TIME';
  return 'PLAYING';
};

export const SimulationEngine = {
  processTick: (prev: GameState, rngOverride?: Rng): GameState => {
    if (!canTick(prev)) return prev;
    // Daily cases are seeded per day, so every player's world rolls the same dice.
    const rng: Rng = rngOverride ?? (prev.seed !== null ? mulberry32(prev.seed * 997 + prev.currentDay * 7919) : Math.random);

    const day = prev.currentDay + 1;
    const target = getTarget(prev.activeTargetId);
    const mods = target.mods;
    const tierIdx = target.tier - 1;
    const hasDefense = (id: string) => (prev.defensePurchases[id] ?? 0) > 0;

    // Expire timed effects and freezes, then derive this tick's stats.
    const timedEffects = prev.timedEffects.filter(e => e.until >= day);
    const frozenChannels = Object.fromEntries(Object.entries(prev.frozenChannels).filter(([, until]) => until >= day));
    const vars = computeMasterVariables({ ...prev, currentDay: day, timedEffects, frozenChannels });
    const climate = getClimate(prev.climateId).mods;
    const timedMult = (kind: string, pick?: (e: typeof timedEffects[number]) => boolean) =>
      timedEffects.filter(e => e.kind === kind && (!pick || pick(e))).reduce((m, e) => m * e.mult, 1);

    // Working copies
    const states: Record<string, StateNode> = {};
    Object.values(prev.states).forEach(s => { states[s.id] = { ...s }; });
    const wasInfected = new Set(Object.values(prev.states).filter(isInfected).map(s => s.id));
    const history: HistoryLogEntry[] = [];
    let coverUp = prev.coverUp;

    // ---- Stage 2: bubble lifespans & Spin detonations ----
    const sparks: SparkBubble[] = prev.activeSparks
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
        if (states[nid]) states[nid].doubt = clamp(states[nid].doubt + BALANCE.spinNeighbourDoubt, 0, 100);
      });
      coverUp += BALANCE.coverUpSpinDetonation;
      history.push({ day: Math.min(day, prev.dayBudget), headline: `Spin bubble detonated in ${host.name}`, impact: `+${b.doubtPenalty}% Doubt, +${BALANCE.coverUpSpinDetonation}% Cover-Up` });
    });

    // ---- Stage 3: highways & flights (eligibility from the start-of-tick snapshot) ----
    const highwayChance = clamp(
      (BALANCE.highwayBase + BALANCE.highwayPerVelocity * vars.velocity + Math.min(0.15, BALANCE.highwayPerStreet * vars.streetCount)) *
        timedMult('HIGHWAY_MULT') * (climate.highwayMult ?? 1),
      0, BALANCE.highwayMax * 2
    );
    Object.values(prev.states).forEach(src => {
      const reach = src.heard + src.believers;
      if (!(reach > BALANCE.highwayMinReach && reach > src.population * BALANCE.highwayMinReachPct)) return;
      src.neighbors.forEach(nid => {
        const dest = states[nid];
        if (!dest || dest.unaware <= 0) return;
        if (rng() >= highwayChance) return;
        const seed = Math.min(dest.unaware, Math.max(1, Math.floor(dest.population * BALANCE.highwaySeedPct)));
        dest.unaware -= seed;
        dest.heard += seed;
      });
    });

    const flights: FlightEvent[] = [];
    const flightChance = Math.min(BALANCE.flightMax, BALANCE.flightBase + BALANCE.flightPerVelocity * vars.velocity);
    const hubs = Object.values(prev.states).filter(s => s.hasAirport);
    if (vars.socialCount + vars.pressCount >= 1) {
      hubs.forEach(origin => {
        if ((origin.heard + origin.believers) / origin.population <= BALANCE.flightMinAwareness) return;
        if (rng() >= flightChance) return;
        const choices = hubs.filter(h => h.id !== origin.id);
        if (choices.length === 0) return;
        const destSnap = choices[Math.floor(rng() * choices.length)];
        const dest = states[destSnap.id];
        const seed = Math.min(dest.unaware, Math.max(1, Math.floor(dest.population * BALANCE.flightSeedPct)));
        if (seed <= 0) return;
        dest.unaware -= seed;
        dest.heard += seed;
        flights.push({ id: `flight_${day}_${origin.id}_${dest.id}`, from: origin.id, to: dest.id });
      });
    }

    // ---- Stage 4: intra-state funnel, Doubt, Gist Fatigue, First Whisper ----
    const bountyMult = timedMult('SPARK_BOUNTY') * (climate.bountyMult ?? 1);
    const doubtPressure = BALANCE.coverUpDoubtPressure * (coverUp / 100);
    Object.values(states).forEach(s => {
      if (!isInfected(s)) return;

      let friction: number;
      if (s.demographicTag === 'GRASSROOTS') friction = 0.85 + vars.streetCount * 0.2;
      else if (s.demographicTag === 'HYPER_ONLINE') friction = 0.9 + vars.socialCount * 0.25;
      else friction = vars.pressEliteCount < 2 ? (mods.eliteFriction ?? 0.4) : 1.15 + vars.pressEliteCount * 0.15;
      friction *= timedMult('ZONE_FRICTION', e => e.zone === s.region);

      const doubtGrowth = (
        BALANCE.doubtGrowth[s.demographicTag] +
        vars.hype * (s.demographicTag === 'HYPER_ONLINE' ? 1.5 : 1) +
        doubtPressure
      ) * BALANCE.tier.doubtGrowth[tierIdx] * (mods.doubtRate ?? 1);

      // Unaware -> Heard
      const susceptibleRatio = Math.max(0.05, s.unaware / s.population);
      const viralFloor = s.unaware > 0 ? Math.floor(s.population * BALANCE.viralFloorPct * friction * Math.min(1.2, vars.velocity)) : 0;
      const newHeard = Math.min(s.unaware, Math.floor(s.heard * vars.velocity * friction * susceptibleRatio) + viralFloor);

      // Heard -> Believers
      const doubtShield = Math.max(0, (100 - s.doubt) / 100);
      const convictionFloor = s.heard > 100 && s.doubt < 75 ? Math.floor(s.heard * BALANCE.convictionFloor * doubtShield) : 0;
      const newBelievers = Math.min(s.heard, Math.floor(s.heard * vars.credibility * BALANCE.conversionScale * doubtShield) + convictionFloor);

      s.unaware -= newHeard;
      s.heard = s.heard + newHeard - newBelievers;
      s.believers += newBelievers;

      // Doubt vs the credibility anchor
      const anchor = vars.credibility * BALANCE.anchorScale;
      s.doubt = clamp(s.doubt + Math.max(BALANCE.doubtFloorPerDay, doubtGrowth - anchor), 0, 100);

      // Gist Fatigue: Heard -> Jaded
      s.highDoubtTicks = s.doubt >= 70 ? s.highDoubtTicks + 1 : 0;
      if (s.highDoubtTicks >= 2) {
        const burnedOut = Math.floor(s.heard * 0.12);
        s.heard -= burnedOut;
        s.jaded += burnedOut;
      }

      // Tipping point: once a state is really talking, it pays one more bubble (the more the news spreads, the more bubbles there are)
      if (!s.tipped && s.hasSpawnedFirstWhisper && (s.heard + s.believers + s.jaded) / s.population >= BALANCE.tippingAwareness) {
        s.tipped = true;
        sparks.push({
          id: `spark_tip_${s.id}_${day}`,
          kind: 'FAST',
          stateId: s.id,
          amount: Math.max(2, Math.round(whisperBounty(s.population) * BALANCE.tippingFactor * bountyMult)),
          offsetX: jitter(rng, 12),
          offsetY: jitter(rng, 12),
          ticksRemaining: 3
        });
        history.push({ day: Math.min(day, prev.dayBudget), headline: `${s.name} is talking`, impact: 'People there are repeating it. A bubble pops up.' });
      }

      // Deterministic First Whisper spark, sized by the state's population
      if (!s.hasSpawnedFirstWhisper) {
        sparks.push({
          id: `spark_first_${s.id}_${day}`,
          kind: 'WHISPER',
          stateId: s.id,
          amount: Math.max(1, Math.round(whisperBounty(s.population) * BALANCE.whisperShare * bountyMult)),
          offsetX: jitter(rng, 10),
          offsetY: jitter(rng, 10),
          ticksRemaining: 3
        });
        s.hasSpawnedFirstWhisper = true;
      }
    });

    const newlyInfectedIds = Object.values(states).filter(s => isInfected(s) && !wasInfected.has(s.id)).map(s => s.id);

    // ---- Stage 5: stochastic sparks, ambient Spin, Heat, Investigation, Cover-Up, Freshness ----
    const infectedStates = Object.values(states).filter(isInfected);
    if (sparks.length < BALANCE.maxSparksOnBoard && infectedStates.length > 0) {
      // The drip over time: denser in the first days (when little has spread yet), and denser still in the guided first case.
      const earlyScale = day <= BALANCE.earlyDays && !prev.training ? BALANCE.earlySmall : 1;
      const dense = (day <= BALANCE.earlyDays ? BALANCE.earlyDrip : 1) * (prev.training && day <= BALANCE.earlyDays + 2 ? BALANCE.trainingDrip : 1);
      const chance = Math.min(day <= BALANCE.earlyDays ? 0.95 : BALANCE.stochasticMax, (BALANCE.stochasticBase + vars.notoriety * BALANCE.stochasticPerNotoriety) * dense);
      if (rng() < chance) {
        const host = infectedStates[Math.floor(rng() * infectedStates.length)];
        const golden = rng() < BALANCE.goldenChance;
        const fat = golden || rng() > 0.7;
        const [lo, hi] = fat ? BALANCE.fatSpark : BALANCE.fastSpark;
        const base = lo + Math.floor(rng() * (hi - lo + 1));
        sparks.push({
          id: `spark_rng_${host.id}_${day}_${Math.floor(rng() * 100000)}`,
          kind: golden ? 'GOLDEN' : fat ? 'FAT' : 'FAST',
          stateId: host.id,
          amount: Math.max(1, Math.round(base * (golden ? BALANCE.goldenMultiplier : 1) * bountyMult * earlyScale)),
          offsetX: jitter(rng, 15),
          offsetY: jitter(rng, 15),
          ticksRemaining: golden ? 3 : fat ? 4 : 2
        });
      }
    }

    // A board is never left empty: after all of the above, small bubbles drift up to the floor. The guided first case keeps 3 on the board
    // (a person pops them in seconds and then waits for the next tick, so a beginner always has something to tap); other cases keep 1.
    const minBoard = prev.training && day <= BALANCE.trainingMinUntilDay ? BALANCE.trainingMinBubbles : (BALANCE.emptyGuard ? 1 : 0);
    for (let n = 0; sparks.length < minBoard && infectedStates.length > 0 && n < 5; n++) {
      const host = infectedStates[Math.floor(rng() * infectedStates.length)];
      const [lo, hi] = BALANCE.fastSpark;
      sparks.push({
        id: `spark_rng_${host.id}_${day}_${Math.floor(rng() * 100000)}`, kind: 'FAST', stateId: host.id,
        amount: Math.max(1, Math.round((lo + Math.floor(rng() * (hi - lo + 1))) * bountyMult * (day <= BALANCE.earlyDays && !prev.training ? BALANCE.earlySmall : 1))),
        offsetX: jitter(rng, 15), offsetY: jitter(rng, 15), ticksRemaining: 3
      });
    }

    // Ambient Spin grows with the Target's cover-up
    const spinChance = (BALANCE.spinAmbientBase + coverUp * BALANCE.spinAmbientPerCoverUp) * spinMultiplier(prev);
    if (infectedStates.length > 0 && spins.length < BALANCE.spinAmbientMaxActive && rng() < spinChance) {
      spins = spawnSpinBubbles(1, states, prev.activeTargetId, rng, `${day}a`, spins);
    }

    const proxyMultiplier = hasDefense('proxy_relay') ? 0.75 : 1;
    const heatGain = Math.max(BALANCE.heatFloor, vars.notoriety * BALANCE.heatPerNotoriety * proxyMultiplier)
      * heatMultiplier(prev) * exposureMultiplier(prev.states);
    const investigationProgress = Math.min(100, prev.investigationProgress + BALANCE.investigationBase + (hasDefense('whistleblower') ? BALANCE.whistleblowerBonus : 0));

    const believerShare = nationalBelieverPct(states) / 100;
    coverUp = clamp(
      coverUp + BALANCE.coverUpBase * BALANCE.tier.coverUp[tierIdx] * (mods.coverUpRate ?? 1)
        * (1 + BALANCE.coverUpBelieverBoost * believerShare)
        * (1 - BALANCE.coverUpCredibilityDamp * (vars.credibility / BALANCE.capCredibility))
        * temperamentMods(target).coverUp * (climate.coverUpMult ?? 1),
      0, 100
    );
    const freshness = Math.max(BALANCE.freshnessFloor, prev.freshness - BALANCE.freshnessDecay * (mods.staleRate ?? 1) * STYLE_MULTIPLIERS[target.ai.defenseStyle].stale * (climate.staleMult ?? 1) * (perkEffects(prev.perkId).staleMult ?? 1));

    // ---- Assemble, then audit milestones (at most one background alert per tick) ----
    let next: GameState = {
      ...prev,
      currentDay: day,
      states,
      activeSparks: sparks,
      activeSpinBubbles: spins,
      flightEvents: flights,
      newlyInfectedIds,
      heat: clamp(prev.heat + heatGain, 0, 100),
      investigationProgress,
      coverUp,
      freshness,
      timedEffects,
      frozenChannels,
      historyLog: history.reduce((log, h) => appendHistory(log, h), prev.historyLog)
    };
    next.peakHeat = Math.max(prev.peakHeat, next.heat);
    next.peakCoverUp = Math.max(prev.peakCoverUp, next.coverUp);

    const picked = scheduledEvent(next, target.occurrences ?? (prev.training ? TRAINING_OCCURRENCES : undefined), rng) ?? pickEvent(next, rng, BALANCE.eventChance, BALANCE.eventCooldown, BALANCE.eventMinDay);
    const eventAlert = picked ? buildEventAlert(picked.def, next, picked.zone) : null;

    const winner = AlertFactory.evaluateTickTriggers(next, eventAlert);
    if (winner) {
      let alert = winner.alert;

      if (winner.signature && winner.abilityIndex !== undefined) {
        // Signature move: the strongest ability, once, at double strength.
        const base = target.abilities[winner.abilityIndex];
        const ability = { ...base, ...(base.mirror ? { branch: dominantBranch(next.unlockedChannels) } : {}), strength: base.strength * BALANCE.signatureStrength, stamp: `SIGNATURE MOVE // ${base.stamp}` };
        const result = applyEffects(next, abilityEffects(ability, next), rng, `${day}sig`);
        next = { ...result.state, triggeredMilestones: [...result.state.triggeredMilestones, 'SIGNATURE'] };
        alert = buildAbilityAlert(target, ability, next, result.notes);
      } else if (winner.abilityIndex !== undefined) {
        const baseAbility = target.abilities[winner.abilityIndex];
        const ability = baseAbility.mirror ? { ...baseAbility, branch: dominantBranch(next.unlockedChannels) } : baseAbility;
        const result = applyEffects(next, abilityEffects(ability, next), rng, `${day}ab${winner.abilityIndex}`);
        next = result.state;
        alert = buildAbilityAlert(target, ability, next, result.notes);
        const abilityNext = [...next.abilityNext];
        const everyMult = temperamentMods(target).abilityEvery * (ability.kind === 'INJUNCTION' ? STYLE_MULTIPLIERS[target.ai.defenseStyle].injunctionEvery : 1);
        abilityNext[winner.abilityIndex] = day + Math.max(3, Math.round(ability.every * everyMult) + jitter(rng, 1));
        next = { ...next, abilityNext };
      } else if (winner.eventId) {
        next = {
          ...next,
          usedEvents: [...next.usedEvents, winner.eventId],
          lastEventDay: day,
          triggeredMilestones: winner.milestoneId === 'SCHEMER_BAIT' ? [...next.triggeredMilestones, 'SCHEMER_BAIT'] : next.triggeredMilestones
        };
      } else {
        const spinMult = spinMultiplier(next);
        const effects = (milestoneEffect(winner.milestoneId, next) ?? []).map((e): Effect =>
          e.kind === 'spin' ? { ...e, count: Math.max(1, Math.round(e.count * spinMult)) } : e);
        if (effects.length > 0) next = applyEffects(next, effects, rng, `${day}m`).state;
        if (CRITICAL_MILESTONES.includes(winner.milestoneId)) next = { ...next, chatter: chatterPing(next.activeTargetId, 'onCritical', rng) };
        next = { ...next, triggeredMilestones: [...next.triggeredMilestones, winner.milestoneId] };
      }

      next = {
        ...next,
        notificationQueue: [...next.notificationQueue, alert],
        historyLog: appendHistory(next.historyLog, alertToHistory(alert, day))
      };
    }

    // ---- Endgame ----
    const status = evaluateEndgame(next);
    if (status !== 'PLAYING') {
      next = { ...next, status, isPaused: true, activeModal: 'NONE', notificationQueue: [] };
    }
    return next;
  }
};
