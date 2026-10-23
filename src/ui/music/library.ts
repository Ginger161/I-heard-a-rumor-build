// THE MUSIC LIBRARY. Pure data: no audio code here, so tracks can be validated and tested in Node.
// Every track is a loop of 16-step bars described by patterns ("x" = hit, "o" = soft hit, "." = rest), a chord progression
// and a few layers. A track also says at what energy each layer comes in (`mins`), so one track can grow from sparse to full
// as a case heats up, without switching songs.
export type Genre = 'calm' | 'lofi' | 'afrosoul' | 'amapiano' | 'afrobeats' | 'highlife' | 'street' | 'drill' | 'tense' | 'victory' | 'defeat';
export type Mood = 'calm' | 'chill' | 'medium' | 'high' | 'tense' | 'triumph' | 'sad';
export type Station = 'afrobeats' | 'amapiano' | 'chill' | 'street';
export type Layer = 'kick' | 'snare' | 'clap' | 'hat' | 'ohat' | 'shaker' | 'rim' | 'congaH' | 'congaL' | 'talk' | 'bass' | 'keys' | 'lead' | 'pad' | 'drone' | 'riser';

export const CHORD_Q: Record<string, number[]> = {
  maj: [0, 4, 7], min: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], m9: [0, 3, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14], sus2: [0, 2, 7], dim: [0, 3, 6], '6': [0, 4, 7, 9]
};
export const SCALES: Record<string, number[]> = {
  minorPent: [0, 3, 5, 7, 10], majorPent: [0, 2, 4, 7, 9], dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10], minor: [0, 2, 3, 5, 7, 8, 10]
};

export interface Chord { r: number; q: keyof typeof CHORD_Q }
export type DrumPatterns = Partial<Record<'kick' | 'snare' | 'clap' | 'hat' | 'ohat' | 'shaker' | 'rim' | 'congaH' | 'congaL' | 'talk', string>>;
// [step, semitones above the chord root, length in steps, optional slide target in semitones above the root]
export type BassNote = [number, number, number, number?];

export interface Track {
  id: string;
  name: string;
  blurb: string;
  genre: Genre;
  mood: Mood;
  stations: Station[];
  bpm: number;
  swing: number;                 // 0-0.3: delays every second 16th
  root: number;                  // MIDI note of the key's root, in the bass octave
  scale: keyof typeof SCALES;
  prog: Chord[];                 // one chord per bar; 4 or 8 bars
  drums: DrumPatterns;
  fill?: DrumPatterns;           // replaces the pattern on the last bar of every 4
  bass?: { kind: 'bass' | 'log' | '808'; notes: BassNote[]; oct?: number };
  keys?: { kind: 'epiano' | 'stab' | 'guitar' | 'bell'; steps: number[]; oct: number; len?: number };
  lead?: { kind: 'pluck' | 'bell' | 'whistle' | 'horn' | 'epiano'; density: number; oct: number };
  pad?: boolean;
  drone?: boolean;
  riser?: boolean;
  mins: Partial<Record<Layer, number>>;   // energy (0-1) at which each layer comes in; missing = always on
  gain: number;                  // overall level trim
}

const P = (id: string, name: string, blurb: string, genre: Genre, mood: Mood, stations: Station[], bpm: number, swing: number, root: number, scale: keyof typeof SCALES, prog: Chord[], rest: Partial<Track>): Track =>
  ({ id, name, blurb, genre, mood, stations, bpm, swing, root, scale, prog, drums: {}, mins: {}, gain: 1, ...rest });
const C = (r: number, q: keyof typeof CHORD_Q): Chord => ({ r, q });

export const TRACKS: Track[] = [
  // ------------------------------------------------------------------ CALM
  P('harmattan_morning', 'Harmattan Morning', 'Dusty light and slow bells. No drums, just air.', 'calm', 'calm', ['chill', 'afrobeats', 'amapiano', 'street'], 68, 0, 38, 'dorian',
    [C(0, 'm9'), C(8, 'maj7'), C(5, 'm9'), C(7, 'sus2')], {
      pad: true, lead: { kind: 'bell', density: 0.22, oct: 3 }, keys: { kind: 'bell', steps: [0], oct: 3, len: 2 }, mins: { lead: 0, keys: 0.3 }, gain: 1.05
    }),

  // ------------------------------------------------------------------ CHILL
  P('mainland_lofi', 'Mainland Lo-Fi', 'Late-night keys, a soft knock, rain on the louvres.', 'lofi', 'chill', ['chill'], 78, 0.2, 41, 'minorPent',
    [C(0, 'm9'), C(8, 'maj7'), C(3, 'maj7'), C(7, '7')], {
      drums: { kick: 'x.....x..x......', rim: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
      bass: { kind: 'bass', notes: [[0, 0, 4], [6, 0, 2], [10, 7, 3]] },
      keys: { kind: 'epiano', steps: [0, 6, 10], oct: 2, len: 3 }, lead: { kind: 'epiano', density: 0.18, oct: 3 }, pad: true,
      mins: { hat: 0.35, lead: 0.4, pad: 0, rim: 0.15 }, gain: 1.1
    }),
  P('afrosoul_evenings', 'Afro-Soul Evenings', 'Warm bass, a lazy conga and a whistled hook.', 'afrosoul', 'chill', ['chill', 'afrobeats'], 84, 0.12, 36, 'minorPent',
    [C(0, 'm9'), C(8, 'maj7'), C(5, 'm9'), C(7, '7')], {
      drums: { kick: 'x.....x...x.....', rim: '....o.......o...', congaH: '..x..x...x..x...', shaker: 'xoxoxoxoxoxoxoxo' },
      bass: { kind: 'bass', notes: [[0, 0, 3], [4, 7, 1], [6, 0, 2], [10, 0, 2], [13, 7, 2]] },
      keys: { kind: 'epiano', steps: [0, 7, 10], oct: 2, len: 3 }, lead: { kind: 'whistle', density: 0.3, oct: 3 },
      mins: { shaker: 0.3, congaH: 0.2, lead: 0.25 }
    }),
  P('private_school', 'Private School', 'Jazzy chords over a soft log drum. Amapiano after midnight.', 'amapiano', 'chill', ['amapiano', 'chill'], 108, 0.05, 33, 'dorian',
    [C(0, 'm9'), C(8, 'maj9'), C(5, 'm9'), C(7, '7')], {
      drums: { kick: 'o...o...o...o...', clap: '....o.......o...', shaker: 'xoxoxoxoxoxoxoxo' },
      bass: { kind: 'log', notes: [[0, 0, 3], [3, 0, 1], [6, 7, 2], [8, 0, 2], [11, 0, 1], [14, 5, 2]] },
      keys: { kind: 'epiano', steps: [0, 2, 6, 8, 11, 14], oct: 2, len: 1 }, lead: { kind: 'bell', density: 0.2, oct: 3 }, pad: true,
      mins: { shaker: 0.15, clap: 0.35, lead: 0.4, pad: 0.1 }
    }),

  // ------------------------------------------------------------------ MEDIUM
  P('third_mainland_cruise', 'Third Mainland Cruise', 'Classic afrobeats groove. Windows down, bridge traffic.', 'afrobeats', 'medium', ['afrobeats'], 102, 0.08, 33, 'minorPent',
    [C(0, 'm7'), C(8, 'maj7'), C(5, 'm7'), C(7, '7')], {
      drums: { kick: 'x......x..x.....', snare: '....x.......x...', hat: 'xoxoxoxoxoxoxoxo', shaker: 'oxoxoxoxoxoxoxox', rim: '..o...o...o...o.', congaH: '.x..x..x.x..x...' },
      fill: { snare: '....x.....x.xxxx' },
      bass: { kind: 'bass', notes: [[0, 0, 3], [3, 0, 1], [6, 0, 2], [10, 0, 2], [12, 0, 1], [15, 7, 1]] },
      keys: { kind: 'stab', steps: [2, 5, 10, 13], oct: 2 }, lead: { kind: 'pluck', density: 0.3, oct: 3 },
      mins: { hat: 0.15, shaker: 0, snare: 0.1, rim: 0.4, congaH: 0.5, lead: 0.5, keys: 0.25 }
    }),
  P('owambe_highlife', 'Owambe Highlife', 'Shuffling guitars and congas. Aso-ebi optional.', 'highlife', 'medium', ['afrobeats'], 98, 0.2, 43, 'majorPent',
    [C(0, 'maj'), C(5, 'maj'), C(0, 'maj'), C(7, '7')], {
      drums: { kick: 'x.......x.......', rim: 'o.x.o.x.o.x.o.x.', congaH: '..x..x..x..x..x.', congaL: 'x.....x.........', shaker: 'xoxoxoxoxoxoxoxo' },
      fill: { congaH: 'x.x.x.xxxxxxxxxx' },
      bass: { kind: 'bass', notes: [[0, 0, 2], [4, 7, 2], [8, 0, 2], [12, 7, 2]] },
      keys: { kind: 'guitar', steps: [2, 3, 6, 7, 10, 11, 14, 15], oct: 2 }, lead: { kind: 'pluck', density: 0.32, oct: 3 },
      mins: { rim: 0.1, congaH: 0.25, congaL: 0.4, shaker: 0.1, keys: 0, lead: 0.55 }, gain: 1.05
    }),
  P('log_drum_nights', 'Log Drum Nights', 'Amapiano mid-tempo: log drum, piano riff, shaker on every step.', 'amapiano', 'medium', ['amapiano'], 112, 0.04, 42, 'minorPent',
    [C(0, 'm7'), C(8, 'maj7'), C(5, 'm7'), C(7, '7')], {
      drums: { kick: 'x...x...x...x...', clap: '....x.......x...', shaker: 'xoxoxoxoxoxoxoxo', hat: 'ox.xox.xox.xox.x', ohat: '..o...o...o...o.' },
      fill: { clap: '....x.....x.x.xx' },
      bass: { kind: 'log', notes: [[0, 0, 2], [2, 0, 1], [3, 12, 1], [6, 0, 2], [8, 0, 1], [10, 7, 1], [11, 0, 2], [14, 12, 1]] },
      keys: { kind: 'epiano', steps: [0, 3, 6, 10, 12], oct: 2, len: 1 }, lead: { kind: 'bell', density: 0.3, oct: 3 },
      mins: { shaker: 0, hat: 0.3, ohat: 0.4, clap: 0.1, lead: 0.5, keys: 0.15 }
    }),

  // ------------------------------------------------------------------ HIGH ENERGY
  P('yanos_party', 'Yanos Party', 'Busy log drums, claps and a bell hook. Everybody is up.', 'amapiano', 'high', ['amapiano'], 116, 0.03, 38, 'minorPent',
    [C(0, 'm7'), C(8, 'maj7'), C(5, 'm7'), C(7, '7')], {
      drums: { kick: 'x...x...x...x...', clap: '....x.......x...', shaker: 'xxxxxxxxxxxxxxxx', hat: 'ox.xox.xox.xox.x', ohat: '..o...o...o...o.', congaH: '..x...x...x...x.' },
      fill: { clap: '....x...x.x.xxxx' },
      bass: { kind: 'log', notes: [[0, 0, 1], [1, 0, 1], [3, 12, 1], [4, 0, 1], [6, 7, 1], [8, 0, 1], [9, 0, 1], [11, 12, 1], [12, 0, 1], [14, 7, 1]] },
      keys: { kind: 'stab', steps: [0, 3, 6, 8, 11, 14], oct: 2 }, lead: { kind: 'bell', density: 0.45, oct: 3 },
      mins: { shaker: 0, hat: 0.1, ohat: 0.2, clap: 0, congaH: 0.3, lead: 0.3, keys: 0 }, gain: 0.95
    }),
  P('detty_december', 'Detty December', 'Bright, loud and a little reckless. Horns up.', 'afrobeats', 'high', ['afrobeats'], 110, 0.07, 36, 'majorPent',
    [C(0, 'maj7'), C(9, 'm7'), C(5, 'maj7'), C(7, '7')], {
      drums: { kick: 'x..x..x...x..x..', clap: '....x.......x...', hat: 'xoxoxoxoxoxoxoxo', ohat: '..o...o...o...o.', shaker: 'oxoxoxoxoxoxoxox', congaH: '.x.x..x..x.x..x.', congaL: 'x..x..........x.' },
      fill: { clap: '....x...x.x.xxxx' },
      bass: { kind: 'bass', notes: [[0, 0, 2], [3, 0, 1], [5, 7, 1], [6, 0, 2], [10, 0, 1], [12, 7, 2], [15, 0, 1]] },
      keys: { kind: 'stab', steps: [2, 5, 8, 10, 13, 15], oct: 2 }, lead: { kind: 'horn', density: 0.4, oct: 3 },
      mins: { hat: 0.1, ohat: 0.25, congaH: 0.2, congaL: 0.4, lead: 0.4, keys: 0.1 }, gain: 0.95
    }),
  P('konko_street_pop', 'Konko Street Pop', 'Talking drums and a hard kick. Danfo energy.', 'street', 'high', ['street', 'afrobeats'], 118, 0.06, 40, 'minorPent',
    [C(0, 'min'), C(8, 'maj'), C(10, 'maj'), C(7, '7')], {
      drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x..x', talk: '..x.....x.x.....', hat: 'xxxxxxxxxxxxxxxx', congaH: '.x.x.x..x.x.x...' },
      fill: { snare: '....x...x.x.xxxx' },
      bass: { kind: 'bass', notes: [[0, 0, 1], [2, 0, 1], [3, 12, 1], [6, 0, 1], [8, 0, 1], [10, 7, 1], [12, 0, 2], [15, 12, 1]] },
      keys: { kind: 'stab', steps: [0, 3, 6, 10, 12], oct: 2 }, lead: { kind: 'pluck', density: 0.3, oct: 3 },
      mins: { talk: 0.15, hat: 0.1, congaH: 0.3, lead: 0.5, keys: 0.05 }, gain: 0.95
    }),

  // ------------------------------------------------------------------ TENSION
  P('ikoyi_drill', 'Ikoyi Drill', 'Half-time snare, sliding 808 and dark bells.', 'drill', 'tense', ['street'], 142, 0, 41, 'phrygian',
    [C(0, 'min'), C(8, 'maj'), C(0, 'min'), C(7, 'maj')], {
      drums: { kick: 'x.........x...x.', snare: '........x.......', clap: '........x.......', hat: 'x.xxx.xx.xxx.xxx', ohat: '.......o........' },
      fill: { hat: 'xxxxxxxxxxxxxxxx' },
      bass: { kind: '808', notes: [[0, 0, 5, 0], [6, 0, 3], [10, 7, 4, 0]] },
      keys: { kind: 'bell', steps: [0, 3, 6, 10], oct: 3 }, lead: { kind: 'bell', density: 0.22, oct: 3 },
      mins: { hat: 0, ohat: 0.3, clap: 0.2, lead: 0.4, keys: 0.1 }, gain: 0.95
    }),
  P('dss_on_your_tail', 'DSS On Your Tail', 'A heartbeat, a low drone and a ticking clock.', 'tense', 'tense', ['chill', 'afrobeats', 'amapiano', 'street'], 96, 0, 37, 'phrygian',
    [C(0, 'min'), C(1, 'maj'), C(0, 'min'), C(6, 'dim')], {
      drums: { kick: 'x.x.............', hat: 'o...o...o...o...', rim: '............o...' },
      bass: { kind: 'bass', notes: [[0, 0, 8]] },
      keys: { kind: 'stab', steps: [0], oct: 3 }, lead: { kind: 'bell', density: 0.12, oct: 3 }, drone: true, riser: true,
      mins: { hat: 0.1, rim: 0.4, keys: 0.35, lead: 0.2, riser: 0.5 }, gain: 1.05
    }),
  P('safehouse_critical', 'Safehouse Critical', 'The vans are outside. Everything is moving at once.', 'tense', 'tense', ['chill', 'afrobeats', 'amapiano', 'street'], 128, 0, 37, 'phrygian',
    [C(0, 'min'), C(1, 'maj'), C(0, 'min'), C(6, 'dim')], {
      drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', rim: 'o.o.o.o.o.o.o.o.' },
      fill: { snare: '....x...x.x.xxxx' },
      bass: { kind: 'bass', notes: [[0, 0, 1], [2, 0, 1], [4, 0, 1], [6, 0, 1], [8, 0, 1], [10, 0, 1], [12, 0, 1], [14, 0, 1]] },
      keys: { kind: 'stab', steps: [0, 3, 6, 10], oct: 3 }, drone: true, riser: true,
      mins: { snare: 0.2, rim: 0.3, keys: 0.1, riser: 0.2 }, gain: 0.95
    }),

  // ------------------------------------------------------------------ ENDINGS
  P('front_page_glory', 'Front Page Glory', 'Horns, claps and a victory lap down Awolowo Road.', 'victory', 'triumph', ['afrobeats', 'amapiano', 'chill', 'street'], 110, 0.06, 36, 'majorPent',
    [C(0, 'maj'), C(7, 'maj'), C(9, 'min'), C(5, 'maj')], {
      drums: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'xoxoxoxoxoxoxoxo', shaker: 'oxoxoxoxoxoxoxox', congaH: '.x.x..x..x.x..x.' },
      bass: { kind: 'bass', notes: [[0, 0, 2], [3, 0, 1], [6, 0, 2], [10, 0, 1], [12, 7, 2]] },
      keys: { kind: 'stab', steps: [0, 3, 6, 10, 12], oct: 2 }, lead: { kind: 'horn', density: 0.5, oct: 3 }, pad: true,
      mins: {}, gain: 0.95
    }),
  P('dead_air', 'Dead Air', 'A slow piano in an empty newsroom.', 'defeat', 'sad', ['chill', 'afrobeats', 'amapiano', 'street'], 60, 0, 38, 'minor',
    [C(0, 'min'), C(8, 'maj'), C(3, 'maj'), C(7, 'maj')], {
      pad: true, keys: { kind: 'epiano', steps: [0, 8], oct: 2, len: 6 }, lead: { kind: 'epiano', density: 0.28, oct: 3 }, mins: {}, gain: 1.05
    })
];

export const getTrack = (id: string | null | undefined): Track | undefined => TRACKS.find(t => t.id === id);
export const tracksByMood = (mood: Mood): Track[] => TRACKS.filter(t => t.mood === mood);

// ---- helpers shared by the player and the tests ----
export const parseHits = (p: string | undefined): { step: number; v: number }[] => {
  const out: { step: number; v: number }[] = [];
  if (!p) return out;
  for (let i = 0; i < p.length; i++) { const c = p[i]; if (c === 'x') out.push({ step: i, v: 1 }); else if (c === 'o') out.push({ step: i, v: 0.5 }); }
  return out;
};

// A small deterministic generator so a track's melody is the same every time it plays.
export const rngFor = (seed: string, salt: number): (() => number) => {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = (Math.imul(h ^ (h >>> 15), 2246822519) + 0x6d2b79f5) | 0; return ((h >>> 0) % 100000) / 100000; };
};

// The melody for one bar: a 2-bar motif that repeats, with an occasional variation, so it sounds written, not random.
export const melodyForBar = (t: Track, bar: number): { step: number; degree: number }[] => {
  if (!t.lead) return [];
  const scale = SCALES[t.scale];
  const motifRng = rngFor(t.id, Math.floor(bar / 2) % 2); // two different 2-bar motifs, alternating
  const out: { step: number; degree: number }[] = [];
  let deg = Math.floor(scale.length / 2);
  for (let s = 0; s < 32; s++) {
    const play = motifRng() < t.lead.density * (s % 4 === 0 ? 1.6 : s % 2 === 0 ? 1 : 0.5);
    const move = Math.floor(motifRng() * 5) - 2;
    if (play) { deg = Math.max(0, Math.min(scale.length * 2 - 1, deg + move)); if (s >= (bar % 2) * 16 && s < (bar % 2) * 16 + 16) out.push({ step: s - (bar % 2) * 16, degree: deg }); }
  }
  // every fourth repetition changes one note, for variety
  if (Math.floor(bar / 4) % 2 === 1 && out.length) { const k = Math.floor(rngFor(t.id, 99 + bar)() * out.length); out[k] = { ...out[k], degree: Math.min(scale.length * 2 - 1, out[k].degree + 1) }; }
  return out;
};

export const noteFromDegree = (t: Track, degree: number): number => {
  const scale = SCALES[t.scale];
  return t.root + 12 * (t.lead?.oct ?? 3) + scale[degree % scale.length] + 12 * Math.floor(degree / scale.length);
};

export const chordNotes = (t: Track, bar: number, oct: number): number[] => {
  const ch = t.prog[bar % t.prog.length];
  return CHORD_Q[ch.q].map(i => t.root + ch.r + 12 * oct + i);
};

export const validateTrack = (t: Track): string[] => {
  const e: string[] = [];
  if (!/^[a-z][a-z0-9_]+$/.test(t.id)) e.push('bad id');
  if (t.bpm < 55 || t.bpm > 150) e.push('bpm out of range');
  if (t.swing < 0 || t.swing > 0.3) e.push('swing out of range');
  if (![4, 8].includes(t.prog.length)) e.push('progression must be 4 or 8 bars');
  if (t.prog.some(c => !CHORD_Q[c.q])) e.push('unknown chord quality');
  const all = { ...t.drums, ...(t.fill ?? {}) };
  Object.entries(all).forEach(([k, p]) => { if (p && (p.length !== 16 || /[^xo.]/.test(p))) e.push(`pattern ${k} must be 16 chars of x, o, .`); });
  t.bass?.notes.forEach(n => { if (n[0] < 0 || n[0] > 15 || n[2] < 1) e.push('bass note out of range'); });
  t.keys?.steps.forEach(s => { if (s < 0 || s > 15) e.push('keys step out of range'); });
  if (!SCALES[t.scale]) e.push('unknown scale');
  if (t.gain <= 0 || t.gain > 1.3) e.push('gain out of range');
  if (t.stations.length === 0) e.push('needs a station');
  return e;
};
