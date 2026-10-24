// Builds public/trailer-mix.wav: music edit + sound effects + voiceover, mixed offline.
//   node scripts/make-mix.mjs
// Every cue is derived from src/timing.ts (same frames the picture uses) so sound and image cannot drift.
// Sources live in public/audio (Epidemic Sound files + vo/ clips from make-vo.mjs).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { decode, ROOT } from './audio-lib.mjs';
import { LINES } from './vo-script.mjs';
import { FPS, SCENES, S1, S2, S3, S4, S5, S6, touchdowns } from '../src/timing.ts';

const SR = 44100;
const DUR = 30;
const N = Math.ceil(SR * (DUR + 1));
const AUD = join(ROOT, 'public/audio');
const f2s = (f) => f / FPS;
const at = (scene, f) => f2s(SCENES[scene].from + f);
const dbToGain = (db) => Math.pow(10, db / 20);

/* ------------------------------------------------------------------ sources */
const FILES = {
  shutter: 'ES_Communications, Camera, Nikon D7200, Digital Camera, Shutter, Without Flash - Epidemic Sound.mp3',
  type: 'ES_Communications, Typewriter, Old, Typewriter, Hermes, Typing 03 - Epidemic Sound.mp3',
  junk: 'ES_Designed, Impact, Weird Junk Impact, Heavy, Very Short - Epidemic Sound.mp3',
  cork: 'ES_Food & Drink, Glassware, Bottle, Champagne, Cork Pop, Outside - Epidemic Sound.mp3',
  sledge: 'ES_Metal, Impact, Heavy, Sledgehammer, Box, Plate, Medium Hit - Epidemic Sound.mp3',
  book: 'ES_Objects, Book, Slam On Table, Pages Flap, Paperback - Epidemic Sound - 1788-2412.wav',
  stamp: 'ES_Objects, Office, Office Supplies, Stamp, Trodat Printy 4912 - Epidemic Sound.mp3',
  music: 'ES_Only the Brave - Bonnie Grace.mp3',
  whoosh: 'ES_Swooshes, Whoosh, Airy 02 - Epidemic Sound.mp3',
  hammer: 'ES_Tools, Hand, Hammer, Nail Into Mesh Sheet Metal - Epidemic Sound.mp3',
  siren: 'ES_Vehicles, Siren, Police Siren, Close - Epidemic Sound.mp3',
};
const cache = {};
const src = (k) => (cache[k] ??= decode(join(AUD, FILES[k]), SR, 2));

/* ------------------------------------------------------------------ primitives */
const mono = (c) => c.ch[0].map((v, i) => (v + c.ch[1][i]) / 2);

/** Where does the sound that starts at `start` die away (seconds)? Caps at `max`. */
const ringOut = (k, start, max, floor = 0.035) => {
  const m = mono(src(k));
  const s0 = Math.floor(start * SR);
  const w = Math.floor(SR * 0.02);
  let pk = 0;
  for (let i = s0; i < Math.min(m.length, s0 + Math.floor(max * SR)); i++) pk = Math.max(pk, Math.abs(m[i]));
  let end = 0.12;
  for (let t = 0.12; t < max; t += 0.02) {
    let mx = 0;
    for (let i = s0 + Math.floor(t * SR); i < s0 + Math.floor(t * SR) + w && i < m.length; i++) mx = Math.max(mx, Math.abs(m[i]));
    if (mx > pk * floor) end = t + 0.02;
  }
  return Math.min(end + 0.04, max);
};

/** Cut a clip out of a source: peak-normalised, short fade-in/out, optional pitch/speed and reverse. */
const seg = (k, start, dur, { rate = 1, rev = false, fadeIn = 0.003, fadeOut = 0.03 } = {}) => {
  const a = src(k);
  const s0 = Math.floor(start * SR);
  const len = Math.floor(dur * SR);
  const outLen = Math.floor(len / rate);
  const out = [new Float32Array(outLen), new Float32Array(outLen)];
  let pk = 1e-6;
  for (let c = 0; c < 2; c++) {
    for (let i = 0; i < outLen; i++) {
      const p = s0 + i * rate;
      const j = Math.floor(p);
      const fr = p - j;
      const v = (a.ch[c][j] ?? 0) * (1 - fr) + (a.ch[c][j + 1] ?? 0) * fr;
      out[c][i] = v;
      pk = Math.max(pk, Math.abs(v));
    }
  }
  const fi = Math.floor(fadeIn * SR);
  const fo = Math.floor(fadeOut * SR);
  for (let c = 0; c < 2; c++) {
    for (let i = 0; i < outLen; i++) {
      let g = 1 / pk;
      if (i < fi) g *= i / fi;
      if (i > outLen - fo) g *= (outLen - i) / fo;
      out[c][i] *= g;
    }
    if (rev) out[c].reverse();
  }
  return out;
};
/** A hit from a multi-sound pack: starts a hair before the onset, ends where it rings out. */
const hit = (k, onset, max, opts = {}) => seg(k, Math.max(0, onset - 0.012), ringOut(k, onset, max) + 0.012, opts);

const bus = () => [new Float32Array(N), new Float32Array(N)];
const put = (b, clip, t, db = 0, pan = 0) => {
  const g = dbToGain(db);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2 * g;
  const gr = Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2 * g;
  const i0 = Math.floor(t * SR);
  for (let i = 0; i < clip[0].length; i++) {
    const j = i0 + i;
    if (j < 0 || j >= N) continue;
    b[0][j] += clip[0][i] * gl;
    b[1][j] += clip[1][i] * gr;
  }
};
let seed = 90210;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

/* ------------------------------------------------------------------ the sound library (picks per visual) */
// Sledgehammer pack: six separate heavy hits. Loudest/longest ring = "big", others scale down.
const SLEDGE = { big: 13.055, big2: 8.635, big3: 23.08, med: 0.135 };
// Stamp pack: 1.22 and 3.255 are the two cleanest stamp thumps.
const STAMP = [1.22, 3.255, 4.43];
// Nail-in-sheet-metal pack: single clean taps, used as pushpin hits.
const PIN = [11.17, 12.35, 8.42, 4.01];
// Typewriter: strongest isolated keystrokes.
const KEYS = [0.11, 0.44, 2.355, 3.175, 3.705, 4.215, 4.745, 5.055];

const sledge = (which, o) => hit('sledge', SLEDGE[which], which === 'med' ? 2.2 : 3.4, o);
const stamp = (i = 0, o) => hit('stamp', STAMP[i % STAMP.length], 0.7, o);
const pin = (i, o) => hit('hammer', PIN[i % PIN.length], 0.7, o);
const key = (i, o) => seg('type', KEYS[i % KEYS.length] - 0.01, 0.2, o);
const book = (o) => seg('book', 0, 0.6, o);
const junk = (o) => seg('junk', 0, 0.55, o);
const cork = (o) => seg('cork', 0, 0.8, o);
const shutter = (o) => seg('shutter', 0, 0.74, o);
const whoosh = (o, d = 1.5) => seg('whoosh', 0.07, d, { fadeOut: 0.25, ...o });
const whooshRev = (d = 1.1, o) => seg('whoosh', 0.07, d, { rev: true, fadeIn: 0.2, fadeOut: 0.01, ...o });

/* ------------------------------------------------------------------ SFX bus */
const sfx = bus();

// ---- Scene 1: the classified drop
{
  const c = touchdowns(S1.dropCfg, S1.dropDelay);
  const t0 = c[0] / FPS;
  put(sfx, whoosh({ rate: 0.8 }, 1.2), t0 - 0.62, -8);
  put(sfx, sledge('big'), t0, -4);
  put(sfx, book(), t0, -2);
  if (c[1]) {
    put(sfx, book({ rate: 1.12 }), c[1] / FPS, -9);
    put(sfx, sledge('med'), c[1] / FPS, -15);
  }
  if (c[2]) put(sfx, book({ rate: 1.25 }), c[2] / FPS, -15);
  put(sfx, stamp(0), (c[0] + 10) / FPS, -3); // CLASSIFIED
  // lamp coming on: a few electrical ticks as it flickers
  [8, 9, 20, 21, 27].forEach((f, i) => put(sfx, seg('shutter', 0.02, 0.07, { fadeOut: 0.03 }), f / FPS, -26 + (i % 2) * 3, rnd() * 0.5));
  // kinetic type: a key per word, an impact on each phrase, a heavy one for the last word
  S1.words.forEach((f, i) => put(sfx, key(i), f / FPS, -6, rnd() * 0.4));
  [S1.words[0], S1.words[2], S1.words[4]].forEach((f, i) => put(sfx, junk({ rate: 0.9 - i * 0.05 }), f / FPS, -9 + i));
  put(sfx, sledge('big2'), S1.words[6] / FPS, -6);
  put(sfx, key(7), (226 + 2) / FPS, -10); // dymo tag
}

// ---- Scene 2: ground zero & shatter
{
  const s = (f) => at('s2', f);
  put(sfx, whoosh({ rate: 0.7 }, 2.2), s(0), -9);
  put(sfx, cork(), s(S2.sparkPop), -4); // bubble pops in
  put(sfx, whooshRev(1.0, { rate: 1 }), s(S2.shatter) - 1.0, -9);
  put(sfx, junk({ rate: 0.8 }), s(S2.shatter), -5);
  put(sfx, sledge('big'), s(S2.shatter), -10);
  for (let i = 0; i < 7; i++) put(sfx, cork({ rate: 1.5 + rnd() * 0.5 }), s(S2.shatter) + 0.03 + i * 0.045, -15 - i * 0.6, rnd());
  put(sfx, whoosh({ rate: 1.15 }, 0.9), s(S2.cardSlam) - 0.5, -8);
  put(sfx, book(), s(S2.cardSlam), -2);
  put(sfx, sledge('big2'), s(S2.cardSlam), -6);
}

// ---- Scene 3: the conspiracy board
{
  const s = (f) => at('s3', f);
  put(sfx, whooshRev(1.1, { rate: 0.9 }), s(0) - 1.1, -9); // riser into the whip-pan
  put(sfx, whoosh({ rate: 1.0 }, 1.1), s(0) - 0.05, -2);
  S3.pins.forEach((f, i) => {
    put(sfx, pin(i), s(f), -3, (i - 1.5) * 0.25);
    put(sfx, junk({ rate: 1.1 + i * 0.05 }), s(f), -16);
    put(sfx, key(i + 2), s(f + 8), -9);
    put(sfx, whoosh({ rate: 1.4 }, 0.7), s(f + 12), -20); // yarn zipping out
  });
  put(sfx, book({ rate: 1.05 }), s(S3.pins[3] + 50), -7); // the target's polaroid
  put(sfx, whoosh({ rate: 0.8 }, 1.8), s(300), -10); // pull-back
}

// ---- Scene 4: nationwide contagion
{
  const s = (f) => at('s4', f);
  S4.arcs.forEach((f, i) => put(sfx, whoosh({ rate: 1.5 + i * 0.05 }, 0.8), s(f), -15, -0.6 + i * 0.4));
  [50, 100, 150, 200, 245, 285].forEach((f, i) => put(sfx, whoosh({ rate: 0.9 + (i % 3) * 0.12 }, 1.2), s(f + 52), -11, i % 2 ? 0.55 : -0.55));
  // the counter: ticks that speed up and rise in pitch
  let t = s(20);
  const end = s(S4.counterLock);
  while (t < end) {
    const p = (t - s(20)) / (end - s(20));
    put(sfx, seg('type', KEYS[Math.floor(p * 40) % KEYS.length] - 0.01, 0.1, { rate: 1.3 + p * 0.8, fadeOut: 0.04 }), t, -17 + p * 5);
    t += 0.17 - 0.1 * p;
  }
  put(sfx, sledge('big'), s(S4.counterLock), -3);
  put(sfx, stamp(1), s(S4.counterLock), -4); // MAJORITY
}

// ---- Scene 5: DSS heat & the smoking gun
{
  const s = (f) => at('s5', f);
  // siren bed runs the whole scene and is cut by the flash-bulb
  const sirenStart = 1.0;
  const sirenLen = 5.0;
  const siren = seg('siren', sirenStart, sirenLen, { fadeIn: 0.7, fadeOut: 0.05 });
  put(sfx, siren, s(0), -19);
  put(sfx, shutter({ rate: 1.6 }), s(S5.wire), -9);
  put(sfx, book(), s(S5.wire), -4);
  for (let i = 1; i < 9; i++) put(sfx, seg('shutter', 0.02, 0.07, { fadeOut: 0.03 }), s(S5.wire + i * 6), -22); // strobing wire
  for (let i = 0; i < 5; i++) put(sfx, cork({ rate: 1.25 + i * 0.09 }), s(56 + i * 6), -14, -0.6 + i * 0.3);
  put(sfx, whoosh({ rate: 0.75 }, 1.4), s(S5.stamp) - 0.7, -7);
  put(sfx, sledge('big2'), s(S5.stamp), -1);
  put(sfx, stamp(0), s(S5.stamp), -3);
  put(sfx, junk({ rate: 0.85 }), s(S5.stamp), -7);
  for (let i = 0; i < 9; i++) put(sfx, cork({ rate: 1.7 + rnd() * 0.5 }), s(S5.stamp) + 0.02 + i * 0.04, -19, rnd());
  put(sfx, stamp(1, { rate: 1.1 }), s(S5.stamp + 4), -10); // -65% DOUBT
}

// ---- Scene 6: front page & CTA
{
  const s = (f) => at('s6', f);
  put(sfx, whooshRev(1.3, { rate: 0.85 }), s(0) - 1.3, -8);
  put(sfx, shutter(), s(0), -2);
  put(sfx, sledge('med'), s(0), -6);
  put(sfx, sledge('big'), s(S6.stamp), -1);
  put(sfx, stamp(1), s(S6.stamp), -2);
  put(sfx, book({ rate: 0.9 }), s(S6.stamp), -6);
  put(sfx, junk({ rate: 0.8 }), s(S6.stamp), -6);
  put(sfx, key(5), s(S6.stamp + 50), -11);
}

/* ------------------------------------------------------------------ voiceover bus */
const vo = bus();
const voWindows = [];
const report = [];
for (const l of LINES) {
  const c = decode(join(AUD, 'vo', `${l.id}.mp3`), SR, 2);
  const m = mono(c);
  let pk = 0;
  for (const v of m) pk = Math.max(pk, Math.abs(v));
  let on = 0;
  while (on < m.length && Math.abs(m[on]) < pk * 0.04) on++;
  on = Math.max(0, on - Math.floor(0.012 * SR));
  let off = m.length - 1;
  while (off > on && Math.abs(m[off]) < pk * 0.02) off--;
  const len = off - on + Math.floor(0.12 * SR);
  const clip = [new Float32Array(len), new Float32Array(len)];
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < len; i++) clip[ch][i] = ((c.ch[ch][on + i] ?? 0) / pk) * 0.85;
  const fo = Math.floor(0.08 * SR);
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < fo; i++) clip[ch][len - 1 - i] *= i / fo;
  // trailer-voice depth: two short, darker echoes
  const withEcho = [new Float32Array(len + Math.floor(0.4 * SR)), new Float32Array(len + Math.floor(0.4 * SR))];
  for (let ch = 0; ch < 2; ch++) {
    let lp = 0;
    for (let i = 0; i < len; i++) {
      withEcho[ch][i] += clip[ch][i];
      lp += (clip[ch][i] - lp) * 0.35;
      const d1 = i + Math.floor(0.085 * SR);
      const d2 = i + Math.floor(0.19 * SR);
      withEcho[ch][d1] += lp * 0.2;
      withEcho[ch][d2] += lp * 0.1;
    }
  }
  put(vo, withEcho, l.at, 0);
  const dur = len / SR;
  voWindows.push({ a: l.at - 0.12, b: l.at + dur + 0.2 });
  report.push({ id: l.id, at: l.at, end: +(l.at + dur).toFixed(2), text: l.text });
}
report.forEach((r, i) => {
  const next = report[i + 1];
  const warn = next && r.end > next.at - 0.05 ? '  <-- OVERLAPS NEXT LINE' : '';
  const late = r.end > DUR - 0.05 ? '  <-- RUNS PAST THE END' : '';
  console.log(`${r.id} ${r.at.toFixed(2)}s -> ${r.end.toFixed(2)}s  ${r.text}${warn}${late}`);
});

/* ------------------------------------------------------------------ music: opening downbeat, rebuild, real ending */
const music = bus();
{
  const A = 80.25; // source time of the big downbeat that opens the breakdown
  const FINAL_HIT = 126.5; // source time of the track's closing chord
  const stampT = at('s6', S6.stamp);
  const flashT = at('s6', S6.flash);
  const B = FINAL_HIT - stampT; // source time that plays at trailer t=0 once we jump to the ending
  const XF = 0.25;
  const m = src('music');
  const mAt = (c, p) => m.ch[c][Math.floor(p * SR)] ?? 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const ga = t < flashT - XF / 2 ? 1 : t > flashT + XF / 2 ? 0 : Math.cos(((t - (flashT - XF / 2)) / XF) * Math.PI * 0.5);
    const gb = t < flashT - XF / 2 ? 0 : t > flashT + XF / 2 ? 1 : Math.sin(((t - (flashT - XF / 2)) / XF) * Math.PI * 0.5);
    for (let c = 0; c < 2; c++) {
      const a = ga > 0 ? mAt(c, A + t) : 0;
      const b = gb > 0 ? mAt(c, B + t) : 0;
      music[c][i] = a * ga + b * gb;
    }
  }
  // the last chord rings out; fade the tail so the file ends clean
  const tailStart = DUR - 1.0;
  for (let i = Math.floor(tailStart * SR); i < N; i++) {
    const g = Math.max(0, 1 - (i / SR - tailStart) / 1.0);
    music[0][i] *= g;
    music[1][i] *= g;
  }
  // build in over the first 0.0s is intentionally hard: the downbeat IS the opening hit
}

/* ------------------------------------------------------------------ ducking + final mix */
const duckEnv = new Float32Array(Math.ceil(N / 441) + 2).fill(1);
const DEPTH = 0.5; // -6 dB
for (let k = 0; k < duckEnv.length; k++) {
  const t = k / 100;
  let target = 1;
  for (const w of voWindows) {
    if (t >= w.a && t <= w.b) target = DEPTH;
    else if (t < w.a && t > w.a - 0.12) target = Math.min(target, 1 - (1 - DEPTH) * (1 - (w.a - t) / 0.12));
    else if (t > w.b && t < w.b + 0.35) target = Math.min(target, DEPTH + (1 - DEPTH) * ((t - w.b) / 0.35));
  }
  duckEnv[k] = target;
}
const duckAt = (i) => {
  const x = i / 441;
  const k = Math.floor(x);
  return duckEnv[k] * (1 - (x - k)) + duckEnv[k + 1] * (x - k);
};

const MUSIC_GAIN = 0.62;
const SFX_GAIN = 0.8;
const VO_GAIN = 1.0;
const out = [new Float32Array(N), new Float32Array(N)];
for (let c = 0; c < 2; c++) {
  for (let i = 0; i < N; i++) out[c][i] = music[c][i] * MUSIC_GAIN * duckAt(i) + sfx[c][i] * SFX_GAIN * (0.9 + 0.1 * duckAt(i) / 1) + vo[c][i] * VO_GAIN;
}

// master: soft limiter, fade out the last 0.6s, normalise to -1 dBFS
let peak = 0;
for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[c][i]));
const drive = 1.6 / Math.max(peak, 1e-6);
const pcm = Buffer.alloc(Math.floor(SR * DUR) * 4);
let after = 0;
for (let i = 0; i < Math.floor(SR * DUR); i++) {
  const t = i / SR;
  const fade = Math.min(1, (DUR - t) / 0.6);
  for (let c = 0; c < 2; c++) {
    const v = (Math.tanh(out[c][i] * drive) / Math.tanh(1.6)) * 0.89 * fade;
    after = Math.max(after, Math.abs(v));
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 4 + c * 2);
  }
}
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(pcm.length, 40);
writeFileSync(join(ROOT, 'public/trailer-mix.wav'), Buffer.concat([header, pcm]));
console.log(`\ntrailer-mix.wav written: ${(pcm.length / 1e6).toFixed(1)} MB, premaster peak ${peak.toFixed(2)}, final peak ${after.toFixed(2)}`);
