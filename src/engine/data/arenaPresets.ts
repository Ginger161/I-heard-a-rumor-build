import type { AbilityDef, AbilityKind, TargetMods } from './targetTypes';
import type { ZoneId } from './zones';

// The building blocks the Arena Creator offers. Every one is an ordinary dial the engine already understands, so a player-made
// Target plays exactly like an official one; the bot check then measures what the combination really does.

export interface PlayStylePreset {
  id: string;
  name: string;
  icon: string;
  blurb: string;       // what it does to the player
  mods: TargetMods;
  zoned?: boolean;     // asks which region
}

export const PLAY_STYLE_PRESETS: PlayStylePreset[] = [
  { id: 'watched', name: 'Watched', icon: '🚨', blurb: 'The security services are close. Loud plans burn out; quiet plans survive.', mods: { heatRate: 1.4, counterHeat: 6 } },
  { id: 'spin_machine', name: 'Spin Machine', icon: '🌀', blurb: 'A fast PR machine. Cover-Up grows quickly, so guard early.', mods: { coverUpRate: 1.4 } },
  { id: 'short_memory', name: 'Short Memory', icon: '⏳', blurb: 'The news cycle is short. Slow plans run out of days.', mods: { days: -8, staleRate: 1.3 } },
  { id: 'true_believers', name: 'True Believers', icon: '🙏', blurb: 'Followers who will not move for hype. You need real evidence.', mods: { doubtFlat: 35, doubtRate: 1.5 } },
  { id: 'iron_curtain', name: 'Iron Curtain', icon: '🏛️', blurb: 'The elite hubs resist street gossip until you bring Press and Elite channels.', mods: { eliteFriction: 0.2, tagDoubt: { ELITE_HUB: 8 } } },
  { id: 'hometown_hero', name: 'Hometown Hero', icon: '🏠', blurb: 'One region will defend them to the death. Spread around it.', mods: { zoneDoubt: { SW: 18 } }, zoned: true },
  { id: 'social_fortress', name: 'Social Fortress', icon: '📱', blurb: 'An online army: hubs fill with Spin bubbles and online states doubt you.', mods: { tagDoubt: { HYPER_ONLINE: 14 }, spinHubs: true } },
  { id: 'old_money', name: 'Old Money', icon: '🎩', blurb: 'Calm, connected, hard to move. Elite hubs are cold, Heat rises slowly.', mods: { tagDoubt: { ELITE_HUB: 10 }, eliteFriction: 0.3, heatRate: 0.9 } },
  { id: 'street_royalty', name: 'Street Royalty', icon: '👑', blurb: 'The grassroots love them. Street channels are not enough.', mods: { tagDoubt: { GRASSROOTS: 14 } } },
  { id: 'slippery_fish', name: 'Slippery Fish', icon: '🐟', blurb: 'Forgeries get caught more often and everyone starts a little doubtful.', mods: { forgeryRisk: 0.15, doubtAdd: 6 } },
  { id: 'paranoid_big_man', name: 'Paranoid Big Man', icon: '🕶️', blurb: 'Every counter-move comes with extra Heat on you.', mods: { counterHeat: 10, heatRate: 1.2 } },
  { id: 'glass_cannon', name: 'Glass Cannon', icon: '💥', blurb: 'Cover-Up races ahead but the clock is short. A sprint with no mercy.', mods: { coverUpRate: 1.7, days: -4 } }
];

export const ABILITY_LABEL: Record<AbilityKind, { name: string; icon: string; blurb: string }> = {
  INJUNCTION: { name: 'Court Injunction', icon: '⚖️', blurb: 'Freezes one of your channels.' },
  DISTRACTION: { name: 'Distraction', icon: '🎭', blurb: 'Drains Story Freshness.' },
  HEAT_SURGE: { name: 'Security Sweep', icon: '🚔', blurb: 'Adds Heat.' },
  COUNTER_STORY: { name: 'Counter-Story', icon: '📰', blurb: 'Adds Cover-Up.' },
  BOT_SWARM: { name: 'Bot Swarm', icon: '🤖', blurb: 'Spawns Spin bubbles you must pop.' },
  DOUBT_WAVE: { name: 'Smear Wave', icon: '🌊', blurb: 'Adds Doubt in every state.' },
  EVIDENCE_RAID: { name: 'Evidence Raid', icon: '🗄️', blurb: 'Sets your Investigation back.' },
  ACCOUNT_FREEZE: { name: 'Account Freeze', icon: '🏦', blurb: 'Seizes some of your ⚡.' },
  ROADBLOCK: { name: 'Roadblocks', icon: '🚧', blurb: 'Halves land-border spread for a while.' },
  LANE_JAM: { name: 'Channel Jam', icon: '📵', blurb: 'One lane of channels runs at 60%.' },
  REGION_LOCK: { name: 'Region Lockdown', icon: '🌍', blurb: 'One region spreads at half speed.' }
};

type Words = Pick<AbilityDef, 'stamp' | 'headline' | 'line'>;
export const ABILITY_WORDS: Record<AbilityKind, Words> = {
  INJUNCTION: { stamp: 'COURT INJUNCTION', headline: 'A Judge Freezes Your Channel', line: '{Target}’s lawyers have found a very friendly judge.' },
  DISTRACTION: { stamp: 'DISTRACTION', headline: 'A Shiny New Scandal Hijacks The Timeline', line: '{Target} drops a bigger story to bury yours.' },
  HEAT_SURGE: { stamp: 'SECURITY SWEEP', headline: 'The Security Services Take An Interest', line: 'Somebody made a phone call about you. A very senior somebody.' },
  COUNTER_STORY: { stamp: 'COUNTER STORY', headline: 'A Counter-Story Appears', line: '{Target} fires back with a counter-story.' },
  BOT_SWARM: { stamp: 'BOT SWARM', headline: 'The Bot Farm Wakes Up', line: 'Ten thousand accounts, all made on Tuesday, all defending {Target}.' },
  DOUBT_WAVE: { stamp: 'SMEAR WAVE', headline: 'Everyone Is Suddenly Asking If You Are Lying', line: '{Target} floods the feeds with doubt about you.' },
  EVIDENCE_RAID: { stamp: 'FILES MISSING', headline: 'Your Evidence Disappears', line: 'A "burglary" at the one office where your files were kept.' },
  ACCOUNT_FREEZE: { stamp: 'ACCOUNTS FROZEN', headline: 'Your Accounts Are Frozen', line: 'The bank has "concerns". They always do when {Target} calls.' },
  ROADBLOCK: { stamp: 'ROADBLOCKS', headline: 'Checkpoints Slow The Gist', line: 'Every highway has a checkpoint and every checkpoint wants a "something small".' },
  LANE_JAM: { stamp: 'CHANNEL JAMMED', headline: 'A Channel Goes Quiet', line: 'Somebody pulled the plug on your people.' },
  REGION_LOCK: { stamp: 'REGION LOCKDOWN', headline: 'A Whole Region Goes Dark', line: 'A "curfew" appears in a region where {Target} has friends.' }
};

/** A sensible first version of an ability of this kind (inside the engine's tested range). */
export const defaultAbility = (kind: AbilityKind): AbilityDef => {
  const base: Record<AbilityKind, { strength: number; every: number }> = {
    INJUNCTION: { strength: 2, every: 9 }, DISTRACTION: { strength: 12, every: 8 }, HEAT_SURGE: { strength: 8, every: 9 }, COUNTER_STORY: { strength: 6, every: 8 }, BOT_SWARM: { strength: 3, every: 9 },
    DOUBT_WAVE: { strength: 6, every: 9 }, EVIDENCE_RAID: { strength: 12, every: 10 }, ACCOUNT_FREEZE: { strength: 14, every: 9 }, ROADBLOCK: { strength: 3, every: 10 }, LANE_JAM: { strength: 3, every: 9 }, REGION_LOCK: { strength: 3, every: 10 }
  };
  const w = ABILITY_WORDS[kind];
  return { kind, every: base[kind].every, start: 7, strength: base[kind].strength, stamp: w.stamp, headline: w.headline, line: w.line, ...(kind === 'LANE_JAM' ? { branch: 'SOCIAL' as const } : {}), ...(kind === 'REGION_LOCK' ? { zone: 'SW' as ZoneId } : {}) };
};

export const DEFENSE_LABEL: Record<string, { name: string; icon: string }> = {
  BALANCED: { name: 'Balanced', icon: '⚖️' }, SPIN_DOCTOR: { name: 'Spin Doctor', icon: '🌀' }, IRON_FIST: { name: 'Iron Fist', icon: '✊' }, LAWYER_UP: { name: 'Lawyer Up', icon: '👨‍⚖️' },
  DISTRACTOR: { name: 'Distractor', icon: '🎭' }, CYBER_SQUAD: { name: 'Cyber Squad', icon: '💻' }, OLD_MONEY: { name: 'Old Money', icon: '🎩' }, STREET_ARMY: { name: 'Street Army', icon: '🛵' }
};
export const TEMPERAMENT_LABEL: Record<string, { name: string; icon: string }> = {
  STEADY: { name: 'Steady', icon: '🧱' }, THE_CRASHOUT: { name: 'The Crashout', icon: '🤬' }, THE_STOIC: { name: 'The Stoic', icon: '🗿' }, THE_SHOWMAN: { name: 'The Showman', icon: '🎤' },
  THE_PARANOID: { name: 'The Paranoid', icon: '👀' }, THE_SCHEMER: { name: 'The Schemer', icon: '♟️' }, THE_BULLY: { name: 'The Bully', icon: '👊' }, THE_GHOST: { name: 'The Ghost', icon: '👻' }
};
