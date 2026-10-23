import { GameState, SpinBubbleData, StateNode, TimedEffectKind } from './types';
import { Branch } from './data/channels';
import { ZoneId } from './data/zones';
import { BOT_FARM_HUBS, getTarget } from './data/targets';
import { BALANCE } from './balance';
import { clamp, getChannel, isFrozen, isInfected } from './selectors';

export type Rng = () => number;

export type Effect =
  | { kind: 'doubtAll'; amount: number }
  | { kind: 'heat'; amount: number }
  | { kind: 'sparks'; amount: number }
  | { kind: 'coverUp'; amount: number }
  | { kind: 'freshness'; amount: number }
  | { kind: 'investigation'; amount: number }
  | { kind: 'spin'; count: number }
  | { kind: 'freeze'; days: number; branch?: Branch }
  | { kind: 'timed'; effectKind: TimedEffectKind; days: number; mult: number; label: string; zone?: ZoneId; branch?: Branch };

const jitter = (rng: Rng, range: number) => Math.floor(rng() * (range * 2 + 1)) - range;

// Spin bubbles (Target AI "PR spin"): host states are weighted, and Bot Farm style Targets double the
// weight of the online hubs.
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
  const doubleHubs = !!getTarget(targetId).mods.spinHubs;
  const weights = infected.map(s => (doubleHubs && BOT_FARM_HUBS.includes(s.id) ? 2 : 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const out = [...existing];
  for (let i = 0; i < count; i++) {
    let roll = rng() * totalWeight;
    let host = infected[infected.length - 1];
    for (let j = 0; j < infected.length; j++) {
      roll -= weights[j];
      if (roll <= 0) { host = infected[j]; break; }
    }
    out.push({
      id: `spin_${idSeed}_${i}_${Math.floor(rng() * 100000)}`,
      stateId: host.id,
      doubtPenalty: BALANCE.spinDoubt,
      offsetX: jitter(rng, 14),
      offsetY: jitter(rng, 14),
      ticksRemaining: BALANCE.spinLifetimeTicks
    });
  }
  return out;
};

export interface EffectResult {
  state: GameState;
  notes: string[]; // Human-readable outcomes (e.g. which channel was frozen)
}

// Applies a list of effects to a state. Pure: returns a new state.
export const applyEffects = (input: GameState, effects: Effect[], rng: Rng, idSeed: string): EffectResult => {
  let s = input;
  const notes: string[] = [];

  effects.forEach((e, idx) => {
    switch (e.kind) {
      case 'doubtAll': {
        const states = { ...s.states };
        Object.keys(states).forEach(id => {
          const st = states[id];
          const doubt = clamp(st.doubt + e.amount, 0, 100);
          states[id] = { ...st, doubt, highDoubtTicks: doubt >= 70 ? st.highDoubtTicks : 0 };
        });
        s = { ...s, states };
        break;
      }
      case 'heat': {
        const heat = clamp(s.heat + e.amount, 0, 100);
        s = { ...s, heat, peakHeat: Math.max(s.peakHeat, heat) };
        break;
      }
      case 'sparks':
        s = { ...s, sparks: Math.max(0, s.sparks + e.amount) };
        break;
      case 'coverUp': {
        const coverUp = clamp(s.coverUp + e.amount, 0, 100);
        s = { ...s, coverUp, peakCoverUp: Math.max(s.peakCoverUp, coverUp) };
        break;
      }
      case 'freshness':
        s = { ...s, freshness: clamp(s.freshness + e.amount, 0, 100) };
        break;
      case 'investigation':
        s = { ...s, investigationProgress: clamp(s.investigationProgress + e.amount, 0, 100) };
        break;
      case 'spin':
        s = { ...s, activeSpinBubbles: spawnSpinBubbles(e.count, s.states, s.activeTargetId, rng, `${idSeed}${idx}`, s.activeSpinBubbles) };
        break;
      case 'freeze': {
        const candidates = s.unlockedChannels.filter(id => {
          const ch = getChannel(id);
          return !!ch && !isFrozen(s, id) && (!e.branch || ch.branch === e.branch);
        });
        if (candidates.length === 0) { notes.push('None of your channels were exposed to it.'); break; }
        if (s.injunctionShield > 0) {
          s = { ...s, injunctionShield: s.injunctionShield - 1 };
          notes.push('Your SAN counter-injunction blocked it.');
          break;
        }
        const id = candidates[Math.floor(rng() * candidates.length)];
        s = { ...s, frozenChannels: { ...s.frozenChannels, [id]: s.currentDay + e.days } };
        notes.push(`${getChannel(id)?.name ?? id} is frozen for ${e.days} days.`);
        break;
      }
      case 'timed':
        s = {
          ...s,
          timedEffects: [
            ...s.timedEffects.filter(t => t.id !== `${idSeed}_${e.label}`),
            { id: `${idSeed}_${e.label}`, label: e.label, kind: e.effectKind, until: s.currentDay + e.days, mult: e.mult, zone: e.zone, branch: e.branch }
          ]
        };
        break;
    }
  });

  return { state: s, notes };
};
