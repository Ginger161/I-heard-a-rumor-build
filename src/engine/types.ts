import type { ScandalCategory } from './data/channels';
import type { TargetId } from './data/targets';

// --- GLOBAL STATE ---
export type ModalState =
  | 'NONE'
  | 'CHANNELS_DESK'
  | 'EVIDENCE_DESK'
  | 'COUNTER_OPS_DESK'
  | 'PAUSE_MENU'
  | 'HISTORY_LOG'
  | 'BELIEVERS_INFO'
  | 'HEAT_INFO';

export type GameStatus = 'LOBBY' | 'PLAYING' | 'WON' | 'LOST_HEAT' | 'LOST_TIME';

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

export interface SparkBubble {
  id: string;
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

export interface GameAlert {
  id: string;
  archetype: AlertArchetype;
  stampText: string;
  headline: string;
  body: string;
  subtext?: string;
  buttonText: string;
  priority: number; // 100 = player action, 90 = endgame, 80 = security, 60 = target/map, 40 = clock/tip
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
  activeTargetId: TargetId | null;
  scandalCategory: ScandalCategory;

  // Clock & economy
  currentDay: number;
  dayBudget: number;
  sparks: number;
  heat: number;                  // 0..100
  peakHeat: number;
  investigationProgress: number; // 0..100

  // Map
  states: Record<string, StateNode>;

  // Upgrades acquired
  unlockedChannels: string[];
  droppedEvidence: string[];
  defensePurchases: Record<string, number>;

  // Bubbles & map events
  activeSparks: SparkBubble[];
  activeSpinBubbles: SpinBubbleData[];
  flightEvents: FlightEvent[];     // Transient (cleared on save/load)
  newlyInfectedIds: string[];      // Transient (states infected this tick)

  // Alert queue
  notificationQueue: GameAlert[];
  triggeredMilestones: string[];
  historyLog: HistoryLogEntry[];
}

export const isGameOver = (status: GameStatus): boolean =>
  status === 'WON' || status === 'LOST_HEAT' || status === 'LOST_TIME';
