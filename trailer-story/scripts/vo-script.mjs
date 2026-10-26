// Voiceover script for the story trailer. Each TAKE is read in one go (so intonation carries across the
// sentences) and is then sliced into LINES at its longest pauses. Placement in the picture comes from
// src/timing.ts (VO_AT), so words land on the same beats the visuals are cut to.
//
// ElevenLabs v3 audio tags ([whispering], [pause], [lower]...) steer delivery and are not spoken.
// Narrator is Bill, as requested. Halo and the whispering chorus use different premade voices
// (never Adam / Brian, which are overused). IDs are resolved by NAME from /v1/voices first, with these
// premade ids as the fallback.
export const VOICES = {
  bill: { name: 'Bill', id: 'pqHfZKP75CvOlQylNhV4' }, //   narrator: "you", the inner voice
  daniel: { name: 'Daniel', id: 'onwK4e9ZLuTAKqWW03F9' }, // Halo: deep, calm, courteous menace
  george: { name: 'George', id: 'JBFqnCBsd6RMkjVDRZzb' }, // chorus
  roger: { name: 'Roger', id: 'CwhRBWXzGAHq8TQ4Fs17' }, //   chorus
  eric: { name: 'Eric', id: 'cjVigY5qzO86Huf0OWal' }, //   chorus
  chris: { name: 'Chris', id: 'iP95p4xoKVk53GoZ742B' }, //   chorus
};

export const MODEL = 'eleven_v3';
export const FALLBACK_MODEL = 'eleven_multilingual_v2';
export const STABILITY = { creative: 0.3, natural: 0.5 }; // lower = more expressive, more variation

// fx: which processing chain (see make-vo.mjs). parts = sentences in the take that belong to the line.
export const TAKES = [
  {
    id: 'n1', voice: 'bill', stability: 'creative',
    text: "[low, matter-of-fact, quietly proud] I don't make up gist. [pause] [slower, a flat, cold edge] I bring receipts.",
    lines: [['n1a', 1, 'bill'], ['n1b', 1, 'bill-close']],
  },
  {
    id: 'n2', voice: 'bill', stability: 'creative',
    text: '[clipped, cold, building unease] Same words. [pause] Same format. [pause] [lower, tightening, almost a whisper] Same minute.',
    lines: [['n2a', 1, 'bill'], ['n2b', 1, 'bill'], ['n2c', 1, 'bill-close']],
  },
  {
    id: 'h1', voice: 'daniel', stability: 'creative',
    text: '[warm, unhurried, faintly amused] I knew you would find it. [pause] [softer, almost fond] Come to the wedding.',
    lines: [['h1', 2, 'halo-note']],
  },
  {
    id: 'n3', voice: 'bill', stability: 'creative',
    text: '[steady, grave] Every case ends in a choice. [pause] [lower, bitter, final] And someone always gets hurt.',
    lines: [['n3a', 1, 'bill'], ['n3b', 1, 'bill-close']],
  },
  {
    id: 'n4', voice: 'bill', stability: 'creative',
    text: '[hushed, haunted, almost to himself, a beat of disbelief] I thought I was exposing them.',
    lines: [['n4', 1, 'bill-close']],
  },
  {
    id: 'h2', voice: 'daniel', stability: 'creative',
    text: '[calm, gentle, chilling, almost sympathetic] You were being aimed.',
    lines: [['h2', 1, 'halo-close']],
  },
  {
    id: 'n5', voice: 'bill', stability: 'creative',
    text: '[whispering, uneasy, a question that frightens him] Who writes the apologies?',
    lines: [['n5', 1, 'bill-close']],
  },
];

// "Peace and light." in many voices, stacked and pitched apart. The sound of everyone saying the same thing.
export const CHORUS = {
  id: 'chorus',
  text: '[whispering, hollow, rehearsed] Peace and light.',
  layers: [
    { voice: 'bill', rate: 0.88, delay: 0.0, pan: -0.15, gain: 1.0 },
    { voice: 'george', rate: 0.94, delay: 0.07, pan: -0.6, gain: 0.85 },
    { voice: 'roger', rate: 1.0, delay: 0.13, pan: 0.55, gain: 0.8 },
    { voice: 'eric', rate: 0.9, delay: 0.19, pan: 0.2, gain: 0.8 },
    { voice: 'chris', rate: 1.04, delay: 0.25, pan: -0.35, gain: 0.7 },
    { voice: 'daniel', rate: 0.86, delay: 0.31, pan: 0.7, gain: 0.7 },
  ],
};
