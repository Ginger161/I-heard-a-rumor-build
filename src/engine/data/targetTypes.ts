import type { Branch, ScandalCategory } from './channels';
import type { DemographicTag } from '../types';
import type { ZoneId } from './zones';

export type Tier = 1 | 2 | 3 | 4 | 5;
export type Folder = Tier | 'SPOTLIGHT';

export type SilhouetteKind =
  | 'agbada' | 'suit' | 'cap' | 'gele' | 'robe'
  | 'hoodie' | 'uniform' | 'crown' | 'mic' | 'glasses';

export interface ScandalDef {
  category: ScandalCategory;
  title: string; // The headline of the case file
}

// Passive rule changes for a Target. All optional; the dossier auto-describes whatever is set.
export interface TargetMods {
  doubtFlat?: number;                                // Every state starts at exactly this Doubt
  doubtAdd?: number;                                 // Added to every state's starting Doubt
  tagDoubt?: Partial<Record<DemographicTag, number>>; // Starting Doubt bonus by demographic
  zoneDoubt?: Partial<Record<ZoneId, number>>;       // Starting Doubt bonus by zone
  coverUpRate?: number;                              // Multiplies Cover-Up growth
  eliteFriction?: number;                            // Elite hub friction before 2 Press/Elite channels
  spinHubs?: boolean;                                // Spin bubbles twice as likely in the online hubs
  counterHeat?: number;                              // Extra Heat on every counter-offensive
  forgeryRisk?: number;                              // Added to forgery backfire probability
  staleRate?: number;                                // Multiplies Freshness decay (short attention spans)
}

export type AbilityKind = 'INJUNCTION' | 'DISTRACTION' | 'HEAT_SURGE' | 'COUNTER_STORY' | 'BOT_SWARM';

// An active move the Target makes on a schedule (days).
export interface AbilityDef {
  kind: AbilityKind;
  every: number;      // Days between uses (+/-1 jitter)
  start: number;      // First possible day
  strength: number;   // INJUNCTION: days frozen | DISTRACTION: Freshness lost | HEAT_SURGE: Heat |
                      // COUNTER_STORY: Cover-Up gained | BOT_SWARM: Spin bubbles spawned
  branch?: Branch;    // INJUNCTION only: restrict to one lane
  stamp: string;      // Alert stamp text
  headline: string;
  line: string;       // Alert body (supports {Target})
}

// ---- AI personality matrix (Chess.com-style bots) ----
// SPIN_DOCTOR: 1.5x PR Spin bubbles, Heat 20% slower | IRON_FIST: Heat 40% faster, fewer Spin bubbles.
// LAWYER_UP: injunctions last +1 day and come 15% more often, Heat 10% slower.
// DISTRACTOR: distractions hit 30% harder, Spin bubbles are rarer, the story goes stale 10% faster.
export type DefenseStyle = 'SPIN_DOCTOR' | 'IRON_FIST' | 'LAWYER_UP' | 'DISTRACTOR' | 'BALANCED';
// THE_CRASHOUT: rants early (15% Believers): you gain +10% Velocity for a while, but 2 Spin bubbles spawn.
// THE_STOIC: skips the early counter-offensives and saves one massive ambush for 55% Believers.
// STEADY: the standard counter-offensives at 20/45/70%.
// THE_SHOWMAN: moves come 25% more often but hit 25% softer.
// THE_PARANOID: your genuine evidence costs 50% more Heat, but its Cover-Up grows 15% slower.
// THE_SCHEMER: at 30% Believers it plants a too-good-to-be-true bombshell for you to fall for.
export type Temperament = 'THE_CRASHOUT' | 'THE_STOIC' | 'THE_SHOWMAN' | 'THE_PARANOID' | 'THE_SCHEMER' | 'STEADY';

export interface ChatterLines {
  onStart: string;
  onChannelBought: string;
  onEvidenceDropped: string;
  onBackfire: string;
  onCritical: string;
}

export interface AiProfile {
  defenseStyle: DefenseStyle;
  temperament: Temperament;
  weaknessBranch: Branch;    // Your channels in this lane are 1.25x as effective
  resistanceBranch: Branch;  // ...and 0.75x in this one
  chatter: ChatterLines;
}

// What the tier files author. `ai`, `prRating` and `folder` are attached in targets.ts.
export interface TargetBase {
  id: string;
  tier: Tier;
  fullName: string;
  shortName: string;  // Replaces {Target} in all flavor text
  title: string;
  personality: string;
  silhouette: SilhouetteKind;
  scandals: ScandalDef[];
  passiveName: string;
  passiveFlavor: string;
  mods: TargetMods;
  abilities: AbilityDef[];
}

export type TargetKind = 'FICTIONAL' | 'PARODY' | 'CREATOR' | 'STORY';

// A real creator appears only with their permission; the reference is kept with the Target.
export interface CreatorInfo {
  handle: string;
  consentRef: string;   // Where the written permission lives (email id, contract no., etc.)
  approvedOn: string;   // ISO date
}

export interface TargetArchetype extends TargetBase {
  kind?: TargetKind;
  storyOnly?: boolean;                               // Played through Story Mode, not listed in the Dossier folders
  avatar?: { imageUrl?: string; accent?: string };   // Optional portrait and colour; the silhouette is the fallback
  creator?: CreatorInfo;
  packId?: string;                                   // Set for Targets that came from a content pack
  parody: boolean;    // Re-skinned by data/parody.ts: comic scandals, flavor and evidence copy
  folder: Folder;     // Which dossier folder tab the Target lives in (tier = mechanics, folder = display/unlock)
  prRating: number;   // Chess.com-style difficulty rating
  ai: AiProfile;
}

export const sc = (category: ScandalCategory, title: string): ScandalDef => ({ category, title });

export const ab = (
  kind: AbilityKind, every: number, start: number, strength: number,
  stamp: string, headline: string, line: string, branch?: Branch
): AbilityDef => ({ kind, every, start, strength, stamp, headline, line, branch });
