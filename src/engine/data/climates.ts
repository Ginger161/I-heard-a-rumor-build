import { Branch } from './channels';

// A "news climate" is rolled for every case. It gently reshapes how the run plays, so the same Target feels different
// each time, and lets players choose a Target that suits the weather.
export interface ClimateMods {
  highwayMult?: number;                       // Land-border spread
  branchMult?: Partial<Record<Branch, number>>; // Channel effectiveness by lane
  heatMult?: number;                          // Daily Heat
  bountyMult?: number;                        // Spark bubble value
  staleMult?: number;                         // Freshness decay
  coverUpMult?: number;                       // Cover-Up growth
}

export interface Climate {
  id: string;
  name: string;
  icon: string;
  blurb: string;
  mods: ClimateMods;
}

export const CLIMATES: Climate[] = [
  { id: 'CLEAR_SKIES', name: 'Clear Skies', icon: '☀️', blurb: 'A normal news week. No surprises, no excuses.', mods: {} },
  { id: 'HARMATTAN', name: 'Harmattan Season', icon: '🌫️', blurb: 'Dusty haze. People gossip on the street, but travel slows.', mods: { branchMult: { STREET: 1.15 }, highwayMult: 0.85 } },
  { id: 'RAINY_SEASON', name: 'Rainy Season', icon: '🌧️', blurb: 'Everybody is stuck indoors, scrolling. Roads are a mess.', mods: { branchMult: { SOCIAL: 1.1 }, highwayMult: 0.8 } },
  { id: 'ELECTION_YEAR', name: 'Election Year', icon: '🗳️', blurb: 'Rallies, billboards and edgy security. Everyone is listening, including DSS.', mods: { heatMult: 1.15, bountyMult: 1.25, branchMult: { PRESS: 1.1 } } },
  { id: 'DETTY_DECEMBER', name: 'Detty December', icon: '🎄', blurb: 'Everyone is traveling and partying. News dies quickly.', mods: { highwayMult: 1.3, staleMult: 1.2, bountyMult: 1.1 } },
  { id: 'FUEL_SCARCITY', name: 'Fuel Scarcity', icon: '⛽', blurb: 'Endless queues are gossip factories. Nobody is driving far.', mods: { branchMult: { STREET: 1.2 }, highwayMult: 0.85, heatMult: 0.95 } },
  { id: 'STRIKE_SEASON', name: 'Strike Season', icon: '✊', blurb: 'Unions on the streets, and the authorities have bigger problems.', mods: { branchMult: { STREET: 1.1, ELITE: 0.9 }, coverUpMult: 0.9 } },
  { id: 'BLACKOUT_WEEK', name: 'Blackout Week', icon: '🔌', blurb: 'No power, so phones die. Talk moves to the street.', mods: { branchMult: { SOCIAL: 0.85, STREET: 1.2 }, staleMult: 0.9 } },
  { id: 'SLOW_NEWS', name: 'Slow News Cycle', icon: '😴', blurb: 'Nothing else is happening. Your story has room to breathe.', mods: { staleMult: 0.8, bountyMult: 0.9 } },
  { id: 'SCANDAL_SEASON', name: 'Scandal Season', icon: '📰', blurb: 'Every desk is chasing a scandal, so it is harder to stand out.', mods: { coverUpMult: 1.15, branchMult: { PRESS: 1.15 } } }
];

export const DEFAULT_CLIMATE = 'CLEAR_SKIES';

export const getClimate = (id: string | null | undefined): Climate =>
  CLIMATES.find(c => c.id === id) ?? CLIMATES[0];

export const randomClimateId = (rng: () => number = Math.random): string =>
  CLIMATES[Math.floor(rng() * CLIMATES.length)].id;

const pct = (n: number) => `${n > 1 ? '+' : '-'}${Math.round(Math.abs(n - 1) * 100)}%`;

// Auto-generated effect list so the card always matches the engine.
export const describeClimate = (c: Climate): string[] => {
  const m = c.mods;
  const out: string[] = [];
  if (m.branchMult) Object.entries(m.branchMult).forEach(([b, v]) => out.push(`${b[0]}${b.slice(1).toLowerCase()} channels ${pct(v!)}`));
  if (m.highwayMult) out.push(`Land-border spread ${pct(m.highwayMult)}`);
  if (m.heatMult) out.push(`Heat ${pct(m.heatMult)}`);
  if (m.bountyMult) out.push(`Spark value ${pct(m.bountyMult)}`);
  if (m.staleMult) out.push(m.staleMult > 1 ? `Story goes stale ${pct(m.staleMult)} faster` : `Story goes stale ${pct(1 / m.staleMult).replace('+', '')} slower`);
  if (m.coverUpMult) out.push(`Cover-Up ${pct(m.coverUpMult)}`);
  return out;
};
