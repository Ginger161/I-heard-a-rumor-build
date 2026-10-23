import type { Branch, ScandalCategory } from './data/channels';
import type { ZoneId } from './data/zones';
import type { ChatterLines } from './data/targetTypes';

// --- GLOBAL STATE ---
export type ModalState =
  | 'NONE'
  | 'CHANNELS_DESK'
  | 'EVIDENCE_DESK'
  | 'COUNTER_OPS_DESK'
  | 'PAUSE_MENU'
  | 'HISTORY_LOG'
  | 'BELIEVERS_INFO'
  | 'HEAT_INFO'
  | 'TARGET_INFO';

export type GameStatus = 'LOBBY' | 'PLAYING' | 'WON' | 'LOST_HEAT' | 'LOST_TIME' | 'LOST_COVERUP';

export type AlertArchetype =
  | 'STREET_WHISPER'    // Torn notebook scrap (Seed pop, Power Hub Breach, Regional Sweep)
  | 'VIRAL_RECEIPT'     // WhatsApp / blog cutout (Street/Social channels, successful forgery)
  | 'BREAKING_FRONT'    // Newspaper front page (Press/Elite channels, genuine evidence, critical mass, clock)
  | 'TARGET_PR'         // Official letterhead (Doubt stagnation, counter-offensives, forensic backfire)
  | 'SECURITY_WIRE'     // Carbon-copy DSS telex (Heat thresholds, Defense purchases)
  | 'INFORMANT_TIP';    // Manila envelope (Investigation tiers)

export type DemographicTag = 'GRASSROOTS' | 'HYPER_ONLINE' | 'ELITE_HUB';

export interface SpinBubbleData {
  id: string;
  stateId: string;
  doubtPenalty: number;  // Doubt added to the host state if it detonates (e.g. 15)
  offsetX: number;
  offsetY: number;
  ticksRemaining: number; // Detonates when it hits 0
}

// WHISPER: a state's first-whisper bounty (and the seed) | FAST: small, quick | FAT: big, slow | GOLDEN: rare jackpot.
export type SparkKind = 'WHISPER' | 'FAST' | 'FAT' | 'GOLDEN';

export interface SparkBubble {
  id: string;
  kind: SparkKind;
  stateId: string;
  amount: number;
  offsetX: number; // pixel offset from state center
  offsetY: number;
  ticksRemaining: number; // Sparks expire after a set number of ticks
}

// Transient map events produced by a tick and consumed by the map canvas. Never persisted.
export interface FlightEvent {
  id: string;
  from: string;
  to: string;
}

// A decision button on an event/tip card. Choosing one applies its effects and dismisses the card.
export interface AlertChoice {
  id: string;
  label: string;
  detail?: string; // e.g. "-12 sparks, +25 Freshness"
  cost?: number;   // Sparks required
}

export interface GameAlert {
  id: string;
  eventId?: string;        // Set on event/tip cards that carry choices
  choices?: AlertChoice[];
  archetype: AlertArchetype;
  stampText: string;
  headline: string;
  body: string;
  subtext?: string;
  buttonText: string;
  priority: number; // 100 = player action, 90 = endgame, 80 = security, 60 = target/map, 40 = clock/tip
}

// Temporary modifiers created by events (blackouts, travel season, network outages...).
export type TimedEffectKind = 'HIGHWAY_MULT' | 'ZONE_FRICTION' | 'BRANCH_MULT' | 'SPARK_BOUNTY' | 'VELOCITY_MULT';
export interface TimedEffect {
  id: string;
  label: string;
  kind: TimedEffectKind;
  until: number;       // Last day (inclusive) the effect is active
  mult: number;
  zone?: ZoneId;
  branch?: Branch;
}

// A line the Target "says" on the Polaroid pinned to the map HUD. Transient: never saved.
export interface ChatterPing {
  id: number;
  event: keyof ChatterLines;
  text: string;
}

// Stars and Brown Envelopes granted for a takedown. Stored on the finished match so a win can only be claimed once.
export interface WinRewards {
  stars: number;
  previousStars: number;
  newStars: number;
  breakdown: { label: string; amount: number }[];
  total: number;
  envelopesAfter: number;
}

export interface HistoryLogEntry {
  day: number;
  headline: string;
  impact: string;
}

export interface StateNode {
  id: string;
  name: string;
  population: number;
  region: string;
  traits: string[];
  demographicTag: DemographicTag;
  neighbors: string[];
  hasAirport: boolean;
  unaware: number;
  heard: number;
  believers: number;
  jaded: number;           // "Gist Fatigue" burnout pool
  highDoubtTicks: number;  // Consecutive ticks with Doubt >= 70
  doubt: number;
  gistReport?: string;
  hasSpawnedFirstWhisper: boolean;
}

export interface GameState {
  status: GameStatus;
  isPaused: boolean;
  activeModal: ModalState;

  // Phase 1 hard lock
  hasPlantedSeed: boolean;
  hasPoppedFirstSpark: boolean; // Engine stays frozen until this is true
  startingStateId: string | null;
  selectedStateId: string | null;

  // Loadout
  activeTargetId: string | null;
  scandalCategory: ScandalCategory;
  scandalTitle: string;
  perkId: string | null;          // Equipped Syndicate Perk for this run
  climateId: string;              // This case's news climate (see data/climates.ts)
  copySeed: number;               // Picks which variant of each alert/event text this run shows (stable within a run)
  seed: number | null;            // Daily cases use a fixed seed so every player's run is seeded identically
  dailyKey: string | null;        // YYYY-MM-DD when this is the Daily Case

  // Clock & economy
  currentDay: number;
  dayBudget: number;
  sparks: number;
  heat: number;                  // 0..100
  peakHeat: number;
  investigationProgress: number; // 0..100
  coverUp: number;               // 0..100: the Target's counter-narrative. 100 = story neutralized
  peakCoverUp: number;
  freshness: number;             // 0..100: how alive the story still is in the news cycle

  // Map
  states: Record<string, StateNode>;

  // Upgrades acquired
  unlockedChannels: string[];
  droppedEvidence: string[];
  defensePurchases: Record<string, number>;

  // Target pressure & events
  frozenChannels: Record<string, number>; // channel id -> last day it is frozen
  injunctionShield: number;               // Remaining freezes the SAN counter-injunction will absorb
  abilityNext: number[];                  // Next day each Target ability fires
  timedEffects: TimedEffect[];
  usedEvents: string[];
  lastEventDay: number;
  backfires: number;                      // Exposed forgeries this run (3-star condition)
  winRewards: WinRewards | null;          // Set once, when a victory has been recorded in the profile
  assisted: boolean;                      // Assist Mode was on: slower clock, capped rewards
  training: boolean;                      // Training Case: no stars, envelopes or archive entry
  storyId: string | null;                 // Story Mode chapter this case belongs to
  challenge: { id: string; by: string; score: number } | null; // A friend's challenge: the same case, to beat their score

  // Bubbles & map events
  activeSparks: SparkBubble[];
  activeSpinBubbles: SpinBubbleData[];
  flightEvents: FlightEvent[];     // Transient (cleared on save/load)
  newlyInfectedIds: string[];      // Transient (states infected this tick)
  chatter: ChatterPing | null;     // Transient (Target Polaroid speech bubble)

  // Alert queue
  notificationQueue: GameAlert[];
  triggeredMilestones: string[];
  historyLog: HistoryLogEntry[];
}

export const isGameOver = (status: GameStatus): boolean =>
  status === 'WON' || status === 'LOST_HEAT' || status === 'LOST_TIME' || status === 'LOST_COVERUP';
