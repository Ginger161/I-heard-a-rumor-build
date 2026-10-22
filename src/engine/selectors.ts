import { GameState, StateNode } from './types';
import { CHANNELS_DATA, ChannelUpgrade } from './data/channels';
import { getEvidence } from './data/evidence';

export const DISPLAY_POPULATION_LABEL = '223.8M';

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

export interface MasterVariables {
  velocity: number;
  credibility: number;
  notoriety: number;
  streetCount: number;
  socialCount: number;
  pressCount: number;
  pressEliteCount: number;
}

// Spec §6 Stage 1.
export const computeMasterVariables = (state: Pick<GameState, 'unlockedChannels' | 'scandalCategory'>): MasterVariables => {
  const vars: MasterVariables = {
    velocity: 0.2,
    credibility: 0.05,
    notoriety: 0.05,
    streetCount: 0,
    socialCount: 0,
    pressCount: 0,
    pressEliteCount: 0
  };
  state.unlockedChannels.forEach(id => {
    const ch = getChannel(id);
    if (!ch) return;
    const synergyBonus = ch.synergy.includes(state.scandalCategory) ? 1.35 : 1;
    vars.velocity += ch.velocity * synergyBonus;
    vars.credibility += ch.credibility * synergyBonus;
    vars.notoriety += ch.notoriety;
    if (ch.branch === 'STREET') vars.streetCount++;
    if (ch.branch === 'SOCIAL') vars.socialCount++;
    if (ch.branch === 'PRESS') vars.pressCount++;
    if (ch.branch === 'PRESS' || ch.branch === 'ELITE') vars.pressEliteCount++;
  });
  return vars;
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
