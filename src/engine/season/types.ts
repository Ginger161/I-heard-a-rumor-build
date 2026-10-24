import type { Effect } from '../effects';
import type { AlertArchetype } from '../types';

// THE FILM LAYER. A scene is a short list of beats that the player watches and taps through: a cold open, a WhatsApp thread, a voice
// note, a news bulletin, a document, a CCTV still, a choice. Scenes are plain data (like Target packs), so a writer never touches code.
export type Mood = 'NEUTRAL' | 'CONFIDENT' | 'SMUG' | 'ANGRY' | 'WORRIED' | 'PANIC' | 'DEFEATED' | 'LAUGH';

/** The people who talk. 'target' is whoever the chapter is about; 'you' is the player (no portrait). */
export type CastId = 'you' | 'biko' | 'halo' | 'ngozi' | 'fola' | 'coker' | 'zainab' | 'gistlord' | 'mbakwe' | 'target';

/** What a choice, a scene or a plot event does to the story. */
export interface StoryEffects {
  trust?: number;        // Biko's Trust, 0 to 10 (starts at 5)
  coker?: number;        // the Inspector's attention, 0 to 10 (starts at 0)
  integrity?: number;    // the reputation number the story already had (-12 to 12)
  flags?: string[];      // facts the story remembers
  clues?: string[];      // clue ids pinned to the Clue Board
}

/** A condition for showing a beat. All the parts given must hold. */
export interface Cond {
  flag?: string; notFlag?: string; clue?: string; notClue?: string;
  trustGte?: number; trustLt?: number; cokerGte?: number; cokerLt?: number;
  choice?: [string, string];      // [choice id, option id] was picked earlier
}

export interface ChoiceOption { id: string; label: string; hint?: string; effects?: StoryEffects }
export interface ChatMsg { from: CastId | string; text: string; time?: string }

type Common = { when?: Cond; shake?: boolean };
export type Beat = Common & (
  | { t: 'cold'; text: string; time?: string }                                  // black screen, one line, a timestamp
  | { t: 'narr'; text: string }                                                 // narration
  | { t: 'say'; who: CastId; text: string; mood?: Mood }                        // a portrait and a line
  | { t: 'chat'; title: string; msgs: ChatMsg[] }                               // a messaging thread, a message at a time
  | { t: 'voice'; from: string; secs: number; text: string }                    // a voice note with a transcript
  | { t: 'news'; channel: string; headline: string; ticker?: string }           // a bulletin
  | { t: 'doc'; kind: 'notes' | 'ledger' | 'email' | 'receipt' | 'court' | 'draft'; title: string; lines: string[]; mark?: number[] }   // lines in `mark` are highlighted
  | { t: 'still'; cam: string; time: string; caption: string; detail?: string } // a CCTV or photo still
  | { t: 'choice'; id: string; prompt: string; options: ChoiceOption[]; timer?: number; fallback?: string }   // a decision (timed if `timer` seconds)
  | { t: 'clue'; id: string }                                                   // pins a clue to the board
  | { t: 'pause'; ms: number }                                                  // a held silence
);

export interface Scene { id: string; beats: Beat[]; onEnd?: StoryEffects }

export interface Clue { id: string; n: number; title: string; kind: 'doc' | 'photo' | 'voice' | 'chat' | 'money' | 'file'; chapter: number; detail: string }

// ---- scripted plot beats inside a match ------------------------------------------------------------------------------------
export interface PlotChoice { id: string; label: string; detail: string; cost?: number; effects: Effect[]; story?: StoryEffects }
export interface PlotEvent { id: string; day: number; stamp: string; headline: string; body: string; archetype?: AlertArchetype; choices: PlotChoice[] }

/** Everything the script says about one chapter. */
export interface ChapterScript {
  pre: Scene;              // before the match: the cold open and the set-up (after the player has chosen who it is, if the chapter is a pair)
  plot?: PlotEvent[];      // decision cards that fire on fixed days during the match
  won: Scene;              // after a win: the reveal, the clue, the cliffhanger
  lost?: Scene;            // after a defeat (short)
}
