import { GameState, StateNode } from './types';
import { CHANNELS_DATA, ChannelUpgrade } from './data/channels';
import { getEvidence } from './data/evidence';
import { BALANCE } from './balance';
import { STYLE_MULTIPLIERS, getTarget } from './data/targets';
import { perkEffects } from './data/perks';
import { getClimate } from './data/climates';

export const DISPLAY_POPULATION_LABEL = '223.8M';

export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const isInfected = (s: StateNode): boolean => s.heard > 0 || s.believers > 0;

export const totalPopulation = (states: Record<string, StateNode>): number =>
  Object.values(states).reduce((sum, s) => sum + s.population, 0);

export const nationalBelieverPct = (states: Record<string, StateNode>): number => {
  const pop = totalPopulation(states);
  if (pop === 0) return 0;
  return (Object.values(states).reduce((sum, s) => sum + s.believers, 0) / pop) * 100;
};

export const nationalHeardPct = (states: Record<string, StateNode>): number => {
  const pop = totalPopulation(states);
  if (pop === 0) return 0;
  return (Object.values(states).reduce((sum, s) => sum + s.heard, 0) / pop) * 100;
};

export const nationalJadedPct = (states: Record<string, StateNode>): number => {
  const pop = totalPopulation(states);
  if (pop === 0) return 0;
  return (Object.values(states).reduce((sum, s) => sum + s.jaded, 0) / pop) * 100;
};

// "National average Doubt" is measured across states the rumor has actually reached;
// before any spread it falls back to the plain mean.
export const nationalAverageDoubt = (states: Record<string, StateNode>): number => {
  const all = Object.values(states);
  if (all.length === 0) return 0;
  const infected = all.filter(isInfected);
  const pool = infected.length > 0 ? infected : all;
  return pool.reduce((sum, s) => sum + s.doubt, 0) / pool.length;
};

export const getChannel = (id: string): ChannelUpgrade | undefined => CHANNELS_DATA.find(c => c.id === id);

// Michaelis-Menten soft cap: grows almost linearly early, flattens toward `cap`.
export const softCap = (x: number, cap: number): number => x / (1 + x / cap);

export const freshnessMultiplier = (freshness: number): number =>
  BALANCE.freshnessMinMultiplier + (1 - BALANCE.freshnessMinMultiplier) * (clamp(freshness, 0, 100) / 100);

type FrozenView = Pick<GameState, 'frozenChannels' | 'currentDay'>;
export const isFrozen = (s: FrozenView, channelId: string): boolean =>
  (s.frozenChannels[channelId] ?? -1) >= s.currentDay;

export interface MasterVariables {
  velocity: number;      // Effective (soft-capped) Velocity
  credibility: number;   // Effective Credibility
  notoriety: number;     // Effective Notoriety
  rawVelocity: number;
  rawCredibility: number;
  rawNotoriety: number;
  freshnessMult: number;
  hype: number;          // Doubt growth added by viral Social channels
  streetCount: number;
  socialCount: number;
  pressCount: number;
  pressEliteCount: number;
}

type VarsView = Pick<GameState, 'unlockedChannels' | 'scandalCategory' | 'frozenChannels' | 'currentDay' | 'freshness' | 'timedEffects'> & { activeTargetId?: string | null; climateId?: string };

// Spec §6 Stage 1, extended: frozen channels contribute nothing, a stale story is weaker,
// event effects can mute a lane, and totals are soft-capped.
export const computeMasterVariables = (state: VarsView): MasterVariables => {
  const freshnessMult = freshnessMultiplier(state.freshness);
  const ai = getTarget(state.activeTargetId).ai;
  const climate = getClimate(state.climateId).mods;
  let v = 0.2, c = 0.05, n = 0.05, hype = 0;
  let street = 0, social = 0, press = 0, pressElite = 0;

  state.unlockedChannels.forEach(id => {
    const ch = getChannel(id);
    if (!ch || isFrozen(state, id)) return;
    const synergy = ch.synergy.includes(state.scandalCategory) ? 1.35 : 1;
    let branchMult = 1;
    state.timedEffects.forEach(e => {
      if (e.kind === 'BRANCH_MULT' && e.branch === ch.branch && e.until >= state.currentDay) branchMult *= e.mult;
    });
    // AI personality: the Target is weak to one lane and resists another.
    const laneMult = ch.branch === ai.weaknessBranch ? BALANCE.weaknessMult : ch.branch === ai.resistanceBranch ? BALANCE.resistanceMult : 1;
    const gain = freshnessMult * branchMult * laneMult * (climate.branchMult?.[ch.branch] ?? 1);
    v += ch.velocity * synergy * gain;
    c += ch.credibility * synergy * gain;
    n += ch.notoriety;
    if (ch.branch === 'SOCIAL') hype += ch.velocity * BALANCE.hypePerSocialVelocity * branchMult;
    if (ch.branch === 'STREET') street++;
    if (ch.branch === 'SOCIAL') social++;
    if (ch.branch === 'PRESS') press++;
    if (ch.branch === 'PRESS' || ch.branch === 'ELITE') pressElite++;
  });

  // Temporary velocity modifiers (e.g. a Crashout backlash)
  state.timedEffects.forEach(e => {
    if (e.kind === 'VELOCITY_MULT' && e.until >= state.currentDay) v *= e.mult;
  });

  return {
    velocity: softCap(v, BALANCE.capVelocity),
    credibility: softCap(c, BALANCE.capCredibility),
    notoriety: softCap(n, BALANCE.capNotoriety),
    rawVelocity: v,
    rawCredibility: c,
    rawNotoriety: n,
    freshnessMult,
    hype,
    streetCount: street,
    socialCount: social,
    pressCount: press,
    pressEliteCount: pressElite
  };
};

export const channelAvailable = (state: Pick<GameState, 'unlockedChannels'>, channel: ChannelUpgrade): boolean =>
  channel.requires.every(req => state.unlockedChannels.includes(req));

export const countEvidence = (state: Pick<GameState, 'droppedEvidence'>) => {
  let genuine = 0;
  let forged = 0;
  state.droppedEvidence.forEach(id => {
    const ev = getEvidence(id);
    if (!ev) return;
    if (ev.isFabricated) forged++; else genuine++;
  });
  return { genuine, forged, total: genuine + forged };
};

export const defenseUses = (state: Pick<GameState, 'defensePurchases'>, id: string): number =>
  state.defensePurchases[id] ?? 0;

// First Whisper bounty scales with the state's size: Lagos pays more than Bayelsa.
export const whisperBounty = (population: number): number =>
  Math.round(BALANCE.whisperBase + BALANCE.whisperScale * Math.sqrt(population / 15_400_000));

// ---- Combined multipliers (shared by the simulation and the Heat sheet so they can never disagree) ----
type TargetView = Pick<GameState, 'activeTargetId' | 'perkId'> & { climateId?: string };

export const heatMultiplier = (s: TargetView): number => {
  const target = getTarget(s.activeTargetId);
  return BALANCE.tier.heat[target.tier - 1]
    * STYLE_MULTIPLIERS[target.ai.defenseStyle].heat
    * (target.mods.heatRate ?? 1)
    * (perkEffects(s.perkId).heatMult ?? 1)
    * (getClimate(s.climateId).mods.heatMult ?? 1);
};

export const spinMultiplier = (s: Pick<GameState, 'activeTargetId'>): number =>
  STYLE_MULTIPLIERS[getTarget(s.activeTargetId).ai.defenseStyle].spin;
