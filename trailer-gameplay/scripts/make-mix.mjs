// Builds public/gameplay-mix.wav: music edit + sound effects + voiceover, mixed offline.
//   node scripts/make-mix.mjs
// Every cue is placed from src/timing.ts (the same timeline the picture uses), so sound and image cannot drift.
// Sources live in public/audio (Epidemic Sound files + vo/ clips from make-vo.mjs).
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { decode, ROOT } from './audio-lib.mjs';
import { LINES } from './vo-script.mjs';
import { gs, TOTAL_SEC, T_HOOK, T_TARGET, T_PLANT, T_CHANNELS, T_SPREAD, T_FIGHT, T_DESKS, T_ENDING, T_TITLE, SCENE_SEC } from '../src/timing.ts';

const SR = 44100;
const DUR = TOTAL_SEC;
const N = Math.ceil(SR * (DUR + 1));
const AUD = join(ROOT, 'public/audio');
const dbToGain = (db) => Math.pow(10, db / 20);
const T = (scene, local) => gs(scene, local);

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

/** Cut a clip out of a source: peak-normalised, short fades, optional pitch/speed and reverse. */
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
let seed = 777;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

/* ------------------------------------------------------------------ the sound library (curated hits from the Epidemic packs) */
const SLEDGE = { big: 13.055, big2: 8.635, big3: 23.08, med: 0.135 };
const STAMP = [1.22, 3.255, 4.43];
const PIN = [11.17, 12.35, 8.42, 4.01];
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
const tick = (db, t, b) => put(b, seg('type', KEYS[Math.floor(Math.abs(rnd()) * KEYS.length)] - 0.01, 0.09, { fadeOut: 0.04 }), t, db, rnd() * 0.3);

/* ------------------------------------------------------------------ SFX bus */
const sfx = bus();
const slam = (t, big = false, db = 0) => {
  put(sfx, junk({ rate: big ? 0.8 : 1 }), t, -8 + db);
  put(sfx, sledge(big ? 'big2' : 'med'), t, (big ? -8 : -12) + db);
};
// a scene change is a whip-pan: a whoosh that peaks as the new scene lands
for (const [k, v] of Object.entries(SCENE_SEC)) {
  if (k === 'hook') continue;
  put(sfx, whoosh({ rate: 0.95 }, 1.1), v.from - 0.35, -9);
}

// ---- hook: three lines slam, the map lights, a flash-cut into the case file
[T_HOOK.l1, T_HOOK.l2, T_HOOK.l3].forEach((l, i) => { put(sfx, key(i), T('hook', l), -6); slam(T('hook', l), i === 2, i === 2 ? 1 : -1); });
put(sfx, whooshRev(1.4), T('hook', T_HOOK.glow) - 0.9, -8);
put(sfx, cork(), T('hook', T_HOOK.glow) + 0.55, -9); // the first state ignites
put(sfx, whooshRev(0.9, { rate: 1.2 }), T('hook', T_HOOK.cut) - 0.9, -6);
put(sfx, shutter({ rate: 1.3 }), T('hook', T_HOOK.cut), -4);

// ---- target: the title lands, the tiers flick by, sealed files thunk, a file opens
put(sfx, key(2), T('target', T_TARGET.head + 0.15), -7); slam(T('target', T_TARGET.head + 0.15), false, -4);
[0, 1, 2, 3].forEach((i) => put(sfx, key(i + 1), T('target', T_TARGET.tiers) + 0.55 * i, -13 + i * 0.5, -0.3 + i * 0.2));
put(sfx, stamp(1), T('target', T_TARGET.sealed), -6); // the sealed tier
put(sfx, sledge('med', { rate: 0.7 }), T('target', T_TARGET.sealed), -12);
put(sfx, key(4), T('target', T_TARGET.pick), -10);
put(sfx, book({ rate: 1.1 }), T('target', T_TARGET.file - 0.1), -9);
put(sfx, key(6), T('target', T_TARGET.file + 1.2), -13);

// ---- plant: tap a state, the spark pops, the receipt slams, the clock starts ticking
put(sfx, key(2), T('plant', T_PLANT.head + 0.15), -7); slam(T('plant', T_PLANT.head + 0.15), false, -4);
put(sfx, pin(0), T('plant', T_PLANT.plant + 0.05), -6);
put(sfx, whooshRev(1.1), T('plant', T_PLANT.pop) - 0.9, -10);
put(sfx, cork(), T('plant', T_PLANT.pop), -3);
put(sfx, junk({ rate: 0.9 }), T('plant', T_PLANT.pop), -9);
put(sfx, book(), T('plant', T_PLANT.pop + 1.6), -5); // the ground-zero receipt
for (let i = 0; i < 6; i++) tick(-17 + i * 0.4, T('plant', T_PLANT.clock) + i * 0.5, sfx);

// ---- channels: the board, pin taps, the purchase
put(sfx, key(2), T('channels', T_CHANNELS.head + 0.15), -7); slam(T('channels', T_CHANNELS.head + 0.15), false, -4);
put(sfx, book({ rate: 1.15 }), T('channels', T_CHANNELS.lanes - 0.3), -10);
[0, 1, 2, 3].forEach((i) => put(sfx, pin(i), T('channels', T_CHANNELS.lanes + 0.15 * i + 0.2), -11, (i - 1.5) * 0.3));
put(sfx, pin(1), T('channels', T_CHANNELS.pin), -5);
put(sfx, key(5), T('channels', T_CHANNELS.pin + 0.3), -9);
put(sfx, stamp(0), T('channels', T_CHANNELS.buy), -5);
put(sfx, sledge('med'), T('channels', T_CHANNELS.buy), -11);
put(sfx, cork({ rate: 1.4 }), T('channels', T_CHANNELS.buy + 0.05), -13);

// ---- spread: a rising bed under the bloom, planes whoosh past, the counters tick up
put(sfx, key(2), T('spread', T_SPREAD.head + 0.15), -7); slam(T('spread', T_SPREAD.head + 0.15), false, -4);
{
  const t0 = T('spread', T_SPREAD.run);
  const t1 = T('spread', SCENE_SEC.spread.dur - 0.8);
  for (let t = t0, k = 0; t < t1; k++) { const p = (t - t0) / (t1 - t0); tick(-19 + p * 7, t, sfx); t += 0.42 - 0.3 * p; }
  [T_SPREAD.planes, T_SPREAD.planes + 1.2, T_SPREAD.planes + 2.5, T_SPREAD.hot - 0.6, T_SPREAD.hot + 0.8].forEach((l, i) => put(sfx, whoosh({ rate: 1.3 + (i % 3) * 0.1 }, 1.0), T('spread', l), -13, i % 2 ? 0.6 : -0.6));
  put(sfx, whooshRev(1.3), T('spread', T_SPREAD.hot) - 1.0, -8);
  put(sfx, sledge('big'), T('spread', T_SPREAD.hot + 0.1), -10); // the country turns red
  for (let i = 0; i < 5; i++) put(sfx, cork({ rate: 1.5 + rnd() * 0.4 }), T('spread', T_SPREAD.hot + 0.1) + 0.03 + i * 0.07, -18, rnd());
}

// ---- fight: doubt, the spin alert, the cover-up creeping
put(sfx, key(2), T('fight', T_FIGHT.head + 0.15), -7); slam(T('fight', T_FIGHT.head + 0.15), false, -4);
put(sfx, junk({ rate: 0.8 }), T('fight', T_FIGHT.doubt), -9);
put(sfx, book({ rate: 0.95 }), T('fight', T_FIGHT.spin - 0.1), -6); // the PR alert slams in
put(sfx, sledge('med'), T('fight', T_FIGHT.spin - 0.1), -10);
[0, 1, 2].forEach((i) => put(sfx, cork({ rate: 1.3 + i * 0.12 }), T('fight', T_FIGHT.spin + 0.9 + i * 0.35), -12, (i - 1) * 0.5)); // shattering spin bubbles
put(sfx, whooshRev(1.2, { rate: 0.85 }), T('fight', T_FIGHT.coverup) - 1.0, -9);
put(sfx, sledge('big2'), T('fight', T_FIGHT.coverup), -9);

// ---- desks: three desks, three hits; heat brings the siren
put(sfx, key(2), T('desks', T_DESKS.head + 0.15), -7); slam(T('desks', T_DESKS.head + 0.15), false, -4);
[T_DESKS.evidence, T_DESKS.defense, T_DESKS.heat].forEach((l, i) => {
  put(sfx, stamp(i), T('desks', l), -5);
  put(sfx, book({ rate: 1 + i * 0.05 }), T('desks', l), -9);
  put(sfx, whoosh({ rate: 1.2 }, 0.8), T('desks', l) - 0.3, -14);
});
put(sfx, seg('siren', 0.6, SCENE_SEC.desks.dur - T_DESKS.heat + 1.4, { fadeIn: 0.9, fadeOut: 0.06 }), T('desks', T_DESKS.heat), -20);

// ---- ending: front page wins, then the door comes down
put(sfx, whooshRev(1.2), T('ending', 0) - 1.2, -8);
put(sfx, stamp(1), T('ending', T_ENDING.win + 0.4), -4); // PUBLISHED
put(sfx, book(), T('ending', T_ENDING.win + 0.4), -7);
for (let i = 0; i < 7; i++) put(sfx, cork({ rate: 1.4 + rnd() * 0.5 }), T('ending', T_ENDING.win + 0.7) + i * 0.09, -17, rnd()); // confetti
put(sfx, whooshRev(0.9, { rate: 0.8 }), T('ending', T_ENDING.bust) - 0.9, -6);
put(sfx, sledge('big'), T('ending', T_ENDING.bust), -2);
put(sfx, shutter({ rate: 1.6 }), T('ending', T_ENDING.bust), -5);
put(sfx, junk({ rate: 0.7 }), T('ending', T_ENDING.bust), -5);
put(sfx, seg('siren', 0.6, 2.8, { fadeIn: 0.3, fadeOut: 0.06 }), T('ending', T_ENDING.bust), -19);

// ---- title: four modes, the lock-up
T_TITLE.m.forEach((l, i) => { put(sfx, pin(i), T('title', l), -8, -0.6 + i * 0.4); put(sfx, whoosh({ rate: 1.1 + i * 0.05 }, 0.7), T('title', l) - 0.2, -14); });
put(sfx, whooshRev(1.5, { rate: 0.85 }), T('title', T_TITLE.title) - 1.5, -7);
put(sfx, sledge('big'), T('title', T_TITLE.title), -1);
put(sfx, stamp(0), T('title', T_TITLE.title), -3);
put(sfx, junk({ rate: 0.8 }), T('title', T_TITLE.title), -6);
put(sfx, key(5), T('title', T_TITLE.tag), -9);

/* ------------------------------------------------------------------ voiceover bus */
const vo = bus();
const voWindows = [];
const report = [];
for (const l of LINES) {
  const c = decode(join(AUD, 'vo', `${l.id}.wav`), SR, 2);
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
  const echoed = [new Float32Array(len + Math.floor(0.4 * SR)), new Float32Array(len + Math.floor(0.4 * SR))];
  for (let ch = 0; ch < 2; ch++) {
    let lp = 0;
    for (let i = 0; i < len; i++) {
      echoed[ch][i] += clip[ch][i];
      lp += (clip[ch][i] - lp) * 0.35;
      echoed[ch][i + Math.floor(0.085 * SR)] += lp * 0.2;
      echoed[ch][i + Math.floor(0.19 * SR)] += lp * 0.1;
    }
  }
  put(vo, echoed, l.at, 0);
  const dur = len / SR;
  voWindows.push({ a: l.at - 0.12, b: l.at + dur + 0.2 });
  report.push({ id: l.id, at: l.at, end: +(l.at + dur - 0.12).toFixed(2) });
}
report.sort((a, b) => a.at - b.at);
report.forEach((r, i) => {
  const next = report[i + 1];
  console.log(`${r.id} ${r.at.toFixed(2)}s -> ${r.end.toFixed(2)}s${next && r.end > next.at ? '  <-- OVERLAPS NEXT LINE' : ''}${r.end > DUR ? '  <-- RUNS PAST THE END' : ''}`);
});

/* ------------------------------------------------------------------ music: a steady build, one phrase-aligned jump, the real ending */
const music = bus();
{
  const S0 = 10.25; //       source time where the edit starts (on the track's 5.00s grid, offset 0.25)
  const FINAL_HIT = 126.5; // source time of the track's closing chord
  const stampT = T('title', T_TITLE.title);
  const jumpT = SCENE_SEC.ending.from; // jump on the ending whip-cut: the flash hides the edit
  const SKIP = FINAL_HIT - stampT - S0; // must be a whole number of 5.00s phrases to keep the groove
  console.log(`music: skip ${SKIP.toFixed(2)}s at ${jumpT.toFixed(2)}s (${(SKIP / 5).toFixed(2)} phrases)`);
  const XF = 0.14;
  const m = src('music');
  const mAt = (c, p) => m.ch[c][Math.floor(p * SR)] ?? 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const ga = t < jumpT - XF / 2 ? 1 : t > jumpT + XF / 2 ? 0 : Math.cos(((t - (jumpT - XF / 2)) / XF) * Math.PI * 0.5);
    const gb = t < jumpT - XF / 2 ? 0 : t > jumpT + XF / 2 ? 1 : Math.sin(((t - (jumpT - XF / 2)) / XF) * Math.PI * 0.5);
    const lead = Math.min(1, t / 1.2); // fade up from silence at the very start
    for (let c = 0; c < 2; c++) music[c][i] = (ga > 0 ? mAt(c, S0 + t) : 0) * ga * lead + (gb > 0 ? mAt(c, S0 + SKIP + t) : 0) * gb;
  }
  // the closing chord rings ~2s, then a quiet pad carries the hold on the title so the end is not dead air
  const tailStart = stampT + 2.0;
  for (let i = Math.floor(tailStart * SR); i < N; i++) {
    const g = Math.max(0, 1 - (i / SR - tailStart) / 1.4);
    music[0][i] *= g; music[1][i] *= g;
  }
  for (let i = Math.floor((stampT + 0.6) * SR); i < Math.floor(DUR * SR); i++) {
    const t = i / SR;
    const env = Math.min(1, (t - stampT - 0.6) / 1.5) * Math.min(1, (DUR - t) / 1.2);
    const v = (Math.sin(2 * Math.PI * 55 * t) + 0.55 * Math.sin(2 * Math.PI * 82.4 * t + 1) + 0.3 * Math.sin(2 * Math.PI * 110 * t + 2)) * 0.05 * env * (0.85 + 0.15 * Math.sin(2 * Math.PI * 0.2 * t));
    music[0][i] += v; music[1][i] += v;
  }
}

/* ------------------------------------------------------------------ ducking + final mix */
const duckEnv = new Float32Array(Math.ceil(N / 441) + 2).fill(1);
const DEPTH = 0.5; // -6 dB under the voice
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
const duckAt = (i) => { const x = i / 441; const k = Math.floor(x); return duckEnv[k] * (1 - (x - k)) + duckEnv[k + 1] * (x - k); };

const MUSIC_GAIN = 0.6;
const SFX_GAIN = 0.78;
const VO_GAIN = 1.05;
const out = [new Float32Array(N), new Float32Array(N)];
for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) out[c][i] = music[c][i] * MUSIC_GAIN * duckAt(i) + sfx[c][i] * SFX_GAIN * (0.88 + 0.12 * duckAt(i)) + vo[c][i] * VO_GAIN;

// master: soft limiter, fade the last second, normalise to about -1 dBFS
let peak = 0;
for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[c][i]));
const drive = 1.6 / Math.max(peak, 1e-6);
const frames = Math.floor(SR * DUR);
const pcm = Buffer.alloc(frames * 4);
let after = 0;
for (let i = 0; i < frames; i++) {
  const fade = Math.min(1, (DUR - i / SR) / 1.0);
  for (let c = 0; c < 2; c++) {
    const v = (Math.tanh(out[c][i] * drive) / Math.tanh(1.6)) * 0.89 * fade;
    after = Math.max(after, Math.abs(v));
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 4 + c * 2);
  }
}
const header = Buffer.alloc(44);
header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24); header.writeUInt32LE(SR * 4, 28); header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34);
header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
writeFileSync(join(ROOT, 'public/gameplay-mix.wav'), Buffer.concat([header, pcm]));
console.log(`\ngameplay-mix.wav written: ${DUR}s, ${(pcm.length / 1e6).toFixed(1)} MB, premaster peak ${peak.toFixed(2)}, final peak ${after.toFixed(2)}`);
