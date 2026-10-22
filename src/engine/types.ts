// --- GLOBAL STATE ---
export type ModalState = 'NONE' | 'LOBBY_DOSSIER' | 'PAST_LOG' | 'CHANNELS_DESK' | 'EVIDENCE_DESK' | 'COUNTER_OPS_DESK' | 'BREAKING_NEWS' | 'VERDICT' | 'BELIEVERS_INFO' | 'HEAT_INFO';

export type GameStatus = 'LOBBY' | 'PLAYING' | 'VICTORY' | 'DEFEAT_HEAT' | 'DEFEAT_TIME';

export type AlertArchetype = 
  | 'STREET_WHISPER'    // Torn notebook scrap / Napkin (Seed pop, Regional sweep)
  | 'VIRAL_RECEIPT'     // Social media / WhatsApp card (Social/Street channels, Evidence, Backfire)
  | 'BREAKING_FRONT'    // Tabloid newspaper clipping (Press/Elite channels, Critical mass, Clock warnings, Endgame)
  | 'TARGET_PR'         // Official letterhead / Legal threat (Doubt stagnation, Target counter-moves)
  | 'SECURITY_WIRE'     // Red carbon-copy DSS dossier (Heat thresholds, Defense upgrades)
  | 'INFORMANT_TIP';    // Manila folder / Redacted note (Investigation unlocks)

export type DemographicTag = 'GRASSROOTS' | 'HYPER_ONLINE' | 'ELITE_HUB';

export interface SpinBubbleData {
  id: string;
  stateId: string;
  doubtPenalty: number; // How much Doubt spikes if ignored (e.g., +15%)
  offsetX: number;
  offsetY: number;
  ticksRemaining: number; // Explodes when it hits 0
}

export interface GameAlert {
  id: string;
  archetype: AlertArchetype;
  stampText: string;       // e.g., "BREAKING NEWS", "CONFIDENTIAL // DSS", "WHATSAPP FORWARD"
  headline: string;
  body: string;
  subtext?: string;        // e.g., "-15% Doubt | +10% Heat" or source attribution
  buttonText: string;
  priority: number;        // 100 = Immediate Player Action, 90 = Endgame, 80 = Security/Heat, 60 = Target/Map, 40 = Clock/Tip
}

export interface GameState {
  status: GameStatus;
  isPaused: boolean;
  activeModal: ModalState;
  hasPlantedSeed: boolean;
  hasPoppedFirstSpark: boolean; // Engine stays frozen until this is true
  startingStateId: string | null; // To highlight the chosen state
  
  // Progression
  tier: 'NOVICE' | 'REGIONAL' | 'HEAVYWEIGHT' | 'ELITE' | 'APEX';
  targetsDefeated: string[];
  
  // Active Match Data (Only valid if status === 'PLAYING')
  matchId: string | null;
  activeTargetId: string | null;
  activeStoryId: string | null;
  
  currentDay: number;
  dayBudget: number;
  sparks: number;
  heat: number; // 0 to 100
  investigationProgress: number; // 0 to 100 (Unlocks Endgame Evidence)
  endgameShotFired: boolean;
  
  // Plague Inc. Style Nodes
  states: Record<string, StateNode>;
  
  // Interrupts & AI Director
  lastInterruptDay: number;
  scramble: ScrambleState;
  pastHistoryLog: HistoryLogEntry[];
  
  // Upgrades Acquired
  unlockedChannels: string[];
  droppedEvidence: string[];
  activeCounterOps: string[];

  // Dynamic board entities
  activeSparks: SparkBubble[];
  activeSpinBubbles: SpinBubbleData[]; // NEW: Target AI counter-bubbles on the map

  // Event & Alert Queue System
  notificationQueue: GameAlert[];
  triggeredMilestones: string[]; // Stores IDs like 'HEAT_40', 'BELIEVERS_25', 'HUB_LAGOS' so they never repeat
}

export interface StateNode {
  id: string;
  name: string;
  population: number;
  region: string;
  traits: string[];
  demographicTag: DemographicTag; // NEW: Controls channel resistance & Doubt speed
  neighbors: string[];            // NEW: Adjacent state IDs for land border contagion
  hasAirport: boolean;            // NEW: Domestic flight hub (Lagos, FCT, Kano, Rivers, Enugu)
  unaware: number;
  heard: number;
  believers: number;
  jaded: number;                  // NEW: "Gist Fatigue" burnout pool when Doubt stays > 70%
  highDoubtTicks: number;         // NEW: Tracks consecutive ticks with Doubt > 70%
  doubt: number;
  gistReport?: string;
  hasSpawnedFirstWhisper?: boolean;
}

export interface SparkBubble {
  id: string;
  stateId: string;
  amount: number;
  offsetX: number; // -15 to +15 (pixel offset from state center)
  offsetY: number; 
  ticksRemaining: number; // Sparks expire after a set number of ticks
}

export interface ScrambleState {
  active: boolean;
  hoursRemaining: number;
  subtleClue: string;
  queuedMoveId: string | null;
  damageReductionMuliplier: number; // Used if player counters
}

export interface HistoryLogEntry {
  day: number;
  headline: string;
  impact: string;
}
