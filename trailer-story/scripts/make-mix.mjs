// Builds public/story-mix.wav: a synthesised score + sound design + the processed voiceover, mixed offline.
//   node scripts/make-mix.mjs
// Every cue is derived from src/timing.ts (the same data the picture uses) so sound and image cannot drift.
// Works without a voiceover (it just mixes the score); run `npm run vo` first for the real thing.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, decode } from './audio-lib.mjs';
import * as D from './dsp.mjs';
import { SR } from './dsp.mjs';
import { A, B, Cc, D as DD, E, F, G, VO_AT, TOTAL_SEC, gs } from '../src/timing.ts';

const DUR = TOTAL_SEC + 0.5;
const rnd = D.rng(2024);
const r = (a = 0, b = 1) => a + rnd() * (b - a);

/* buses: dry sfx, dry music, voice, plus mono sends into two shared reverbs */
const SFX = new D.Track(DUR);
const MUS = new D.Track(DUR);
const VOX = new D.Track(DUR);
const sendHall = new Float32Array(D.secToN(DUR));
const sendRoom = new Float32Array(D.secToN(DUR));

const place = (bus, x, t, { g = 1, pan = 0, hall = 0, room = 0 } = {}) => {
  bus.add(x, t, g, pan);
  const at = D.secToN(t);
  if (hall) D.mixInto(sendHall, x, at, hall * g);
  if (room) D.mixInto(sendRoom, x, at, room * g);
};
const sfx = (x, t, o) => place(SFX, x, t, o);
const mus = (x, t, o) => place(MUS, x, t, o);

const N = (f) => Math.pow(2, (f - 69) / 12) * 440; // midi -> Hz
const HZ = { D1: 36.71, D2: 73.42, A2: 110, D3: 146.83, F3: 174.61, A3: 220, C4: 261.63, D4: 293.66, F4: 349.23, A4: 440, C5: 523.25, D5: 587.33, F5: 698.46, A5: 880, C6: 1046.5, D6: 1174.7 };

/* ------------------------------------------------------------------ sound building blocks */
const boom = (dur = 1.6, f0 = 62, f1 = 26) => {
  const body = D.mul(D.osc(dur, (t) => f1 + (f0 - f1) * Math.exp(-t * 7), 'sine'), D.envDecay(dur, 0.002, 3.4));
  const click = D.mul(D.biquad(D.noise(D.secToN(0.06), 3), 'lp', 2400), D.envDecay(0.06, 0.0005, 7));
  const out = new Float32Array(body.length);
  D.mixInto(out, body, 0, 1.1);
  D.mixInto(out, click, 0, 0.5);
  return D.sat(out, 1.8);
};
const crash = (dur = 1.3, seed = 4) => {
  const n = D.noise(D.secToN(dur), seed);
  const s = D.sweep(n, 'lp', (t) => 7000 * Math.exp(-t * 3.2) + 250, 0.7);
  return D.mul(s, D.envDecay(dur, 0.002, 4.2));
};
const metal = (dur = 1.4, base = 190) => {
  const o = new Float32Array(D.secToN(dur));
  [1, 1.51, 2.04, 2.76, 3.7].forEach((m, i) => D.mixInto(o, D.mul(D.osc(dur, base * m, 'sine'), D.envDecay(dur, 0.001, 3 + i)), 0, 0.5 / (i + 1)));
  return o;
};
const impact = (size = 1) => {
  const o = new Float32Array(D.secToN(2.2 * size));
  D.mixInto(o, boom(1.8 * size, 64, 26), 0, 0.95);
  D.mixInto(o, crash(1.2 * size), 0, 0.42);
  D.mixInto(o, metal(1.4 * size, 150), 0, 0.12);
  return o;
};
const riser = (dur, f0 = 220, f1 = 5200, g = 1) => {
  const n = D.noise(D.secToN(dur), 9);
  const body = D.sweep(n, 'bp', (t) => f0 * Math.pow(f1 / f0, t / dur), 2.2);
  const tone = D.osc(dur, (t) => f0 * 0.5 * Math.pow(f1 / f0, (t / dur) ** 1.3), 'saw');
  const toneF = D.sweep(tone, 'lp', (t) => 300 + 5000 * (t / dur) ** 2, 0.8);
  const o = new Float32Array(body.length);
  D.mixInto(o, body, 0, 1.4);
  D.mixInto(o, toneF, 0, 0.22);
  return D.mul(o, D.envSwell(dur, 0.985, 2.4)).map((v) => v * g);
};
const whoosh = (dur = 0.8, f0 = 400, f1 = 3800, peak = 0.5) => D.mul(D.sweep(D.noise(D.secToN(dur), 21 + Math.floor(dur * 100)), 'bp', (t) => f0 * Math.pow(f1 / f0, t / dur), 1.4), D.envSwell(dur, peak, 1.6)).map((v) => v * 1.6);
const click = (f = 3000, g = 1) => D.mul(D.biquad(D.noise(D.secToN(0.012), Math.floor(r(1, 9999))), 'hp', f), D.envDecay(0.012, 0.0004, 6)).map((v) => v * g * 2);
const thock = () => {
  const o = new Float32Array(D.secToN(0.18));
  D.mixInto(o, D.mul(D.biquad(D.noise(D.secToN(0.05), 5), 'lp', 1100), D.envDecay(0.05, 0.0005, 5)), 0, 1.5);
  D.mixInto(o, D.mul(D.osc(0.14, (t) => 240 - t * 700, 'sine'), D.envDecay(0.14, 0.001, 4)), 0, 1.0);
  return o;
};
const slap = () => D.mul(D.biquad(D.noise(D.secToN(0.09), 6), 'bp', 2200, 0.8), D.envDecay(0.09, 0.001, 5)).map((v) => v * 2.2);
const stampThud = () => {
  const o = new Float32Array(D.secToN(0.5));
  D.mixInto(o, D.mul(D.osc(0.5, (t) => 120 - t * 120, 'sine'), D.envDecay(0.5, 0.001, 4.5)), 0, 1.2);
  D.mixInto(o, D.mul(D.biquad(D.noise(D.secToN(0.08), 12), 'lp', 1800), D.envDecay(0.08, 0.0005, 5)), 0, 1.0);
  return o;
};
const buzzMotor = (dur = 0.24) => {
  const carrier = D.osc(dur, 168, 'square');
  const am = D.osc(dur, 52, 'sine').map((v) => 0.55 + 0.45 * v);
  const body = D.sweep(D.mul(carrier, am), 'lp', () => 900, 0.9);
  const grit = D.biquad(D.noise(D.secToN(dur), 14), 'bp', 600, 1.2).map((v) => v * 0.35);
  const o = body.map((v, i) => v + grit[i]);
  return D.mul(D.sat(o, 1.6), D.envSwell(dur, 0.12, 1.2));
};
const pop = (f0 = 520, f1 = 860, g = 1) => D.mul(D.osc(0.09, (t) => f0 + (f1 - f0) * (t / 0.09), 'sine'), D.envDecay(0.09, 0.002, 4)).map((v) => v * g);
const bell = (f, dur = 1.6) => {
  const o = new Float32Array(D.secToN(dur));
  [[1, 1], [2.76, 0.35], [5.4, 0.15]].forEach(([m, a]) => D.mixInto(o, D.mul(D.osc(dur, f * m, 'sine'), D.envDecay(dur, 0.002, 3.4 * m ** 0.5)), 0, a));
  return o;
};
const pluck = (f, dur = 0.7) => D.mul(D.sweep(D.osc(dur, f, 'saw'), 'lp', (t) => f * 7 * Math.exp(-t * 7) + f, 0.9), D.envDecay(dur, 0.002, 5.5));
const tinnitus = (dur = 3, f = 3400) => D.mul(D.osc(dur, (t) => f + Math.sin(t * 5) * 6, 'sine'), D.envDecay(dur, 0.2, 3.2));
const glitch = (dur = 0.35, seed = 30) => {
  const n = D.secToN(dur);
  const o = new Float32Array(n);
  const rr = D.rng(seed);
  let i = 0;
  while (i < n) {
    const seg = Math.floor(rr() * 1800 + 200);
    const hold = Math.floor(rr() * 12 + 1);
    const f = 200 + rr() * 3200;
    const on = rr() > 0.3;
    let h = 0;
    for (let k = 0; k < seg && i + k < n; k++) {
      if (k % hold === 0) h = on ? Math.sign(Math.sin(((i + k) / SR) * f * 6.283)) * 0.6 : (rr() * 2 - 1) * 0.6;
      o[i + k] = h;
    }
    i += seg;
  }
  return D.mul(D.biquad(o, 'hp', 300), D.envDecay(dur, 0.001, 3.4));
};
const heartbeat = () => {
  const o = new Float32Array(D.secToN(0.6));
  D.mixInto(o, D.mul(D.osc(0.28, (t) => 58 - t * 90, 'sine'), D.envDecay(0.28, 0.003, 5)), 0, 1);
  D.mixInto(o, D.mul(D.osc(0.26, (t) => 50 - t * 70, 'sine'), D.envDecay(0.26, 0.003, 5)), D.secToN(0.3), 0.7);
  return o;
};
const drone = (dur, root, open = [120, 700], vib = 0.15) => {
  const mix = new Float32Array(D.secToN(dur));
  [[root, 1], [root * 1.004, 0.8], [root * 0.996, 0.8], [root * 2, 0.35], [root * 1.5, 0.22]].forEach(([f, a]) => D.mixInto(mix, D.osc(dur, (t) => f * (1 + Math.sin(t * 0.7) * vib * 0.004), 'saw'), 0, a * 0.35));
  D.mixInto(mix, D.osc(dur, root / 2, 'sine'), 0, 0.9);
  return D.sweep(mix, 'lp', (t) => open[0] + (open[1] - open[0]) * (t / dur) ** 1.4, 0.9);
};
const pad = (dur, notes, cutoff = 1500, g = 1) => {
  const mix = new Float32Array(D.secToN(dur));
  notes.forEach((f, i) => {
    D.mixInto(mix, D.osc(dur, (t) => f * (1 + Math.sin(t * (0.5 + i * 0.13)) * 0.002), 'saw'), 0, 0.2);
    D.mixInto(mix, D.osc(dur, f * 1.003, 'saw'), 0, 0.14);
  });
  return D.mul(D.sweep(mix, 'lp', (t) => cutoff * (0.6 + 0.4 * Math.sin(t * 0.6)), 0.8), D.envSwell(dur, 0.45, 1.4)).map((v) => v * g);
};

/* ------------------------------------------------------------------ the score, scene by scene */
const hitAt = (t, size = 1, o = {}) => sfx(impact(size), t, { g: 0.85 * size ** 0.3, hall: 0.35, ...o });

// ---------- A: 6:06 (0 - 9)
{
  const S = (l) => gs('a', l);
  // room tone: near silence you can hear
  const tone = D.sweep(D.noise(D.secToN(9), 77), 'lp', () => 160, 0.7);
  sfx(D.mul(tone, D.envSwell(9, 0.9, 1.1)), 0, { g: 0.55 });
  sfx(tinnitus(2.4, 3150), S(0.7), { g: 0.035 });
  // the tick: 5 -> 6
  sfx(click(1800, 1.2), S(A.tick), { g: 0.6 });
  sfx(boom(0.7, 70, 34), S(A.tick), { g: 0.5 });
  sfx(D.mul(D.osc(0.05, 1320, 'square'), D.envDecay(0.05, 0.001, 4)), S(A.tick), { g: 0.12, room: 0.2 });
  sfx(glitch(0.18, 41), S(A.tick), { g: 0.16 });
  // the phone: three buzzes, a wake shimmer
  A.buzz.forEach((b, i) => {
    sfx(buzzMotor(0.24), S(b), { g: 0.5, pan: -0.05, room: 0.15 });
    sfx(boom(0.35, 80, 45), S(b), { g: 0.38 });
  });
  sfx(D.mul(D.osc(0.5, (t) => 880 * (1 + t * 1.6), 'sine'), D.envDecay(0.5, 0.01, 3.5)), S(A.buzz[0]), { g: 0.06, hall: 0.4 });
  // the drone arrives with the screen
  mus(D.mul(drone(6.8, HZ.D1 * 1.0, [90, 650]), D.envSwell(6.8, 0.92, 1.3)), S(A.buzz[0]), { g: 0.5, hall: 0.12 });
  mus(D.mul(pad(6, [HZ.D2, HZ.A2, HZ.F3], 1100), D.envSwell(6, 0.8, 1.6)), S(3.0), { g: 0.14, hall: 0.35 });
  // typing: the apology writes itself
  for (let i = 0; i < 74; i++) sfx(click(2600 + r(0, 1600), r(0.4, 0.9)), S(A.typeStart + (i / 74) * 1.8) + r(0, 0.012), { g: 0.2, pan: r(-0.2, 0.2) });
  for (let i = 0; i < 15; i++) sfx(click(2400 + r(0, 1200), r(0.5, 1)), S(5.1 + (i / 15) * 0.6), { g: 0.22 });
  // pen scratch round the phrase
  sfx(D.mul(D.sweep(D.noise(D.secToN(0.46), 55), 'bp', (t) => 2600 + Math.sin(t * 38) * 900, 1.6), D.envSwell(0.46, 0.35, 1.4)), S(A.circle), { g: 0.28, pan: 0.1 });
  sfx(glitch(0.22, 52), S(A.circle), { g: 0.12 });
  // Biko
  sfx(pop(520, 800), S(A.chat1), { g: 0.34, room: 0.2 });
  sfx(pop(560, 880), S(A.chat2), { g: 0.34, room: 0.2 });
  [0, 0.16, 0.32].forEach((d) => sfx(pop(420 + d * 300, 500 + d * 300, 0.7), S(A.dots + d), { g: 0.18 }));
  // "Before you did anything."
  hitAt(S(A.chat3), 1.25);
  sfx(glitch(0.4, 60), S(A.chat3), { g: 0.3 });
  sfx(tinnitus(1.2, 2900), S(A.chat3), { g: 0.08 });
  // reverse swell into B
  sfx(D.reverse(impact(0.7)), S(8.35), { g: 0.6 });
  sfx(riser(0.75, 400, 6000, 0.7), S(8.25), { g: 0.4 });
}

// ---------- B: the page (9 - 18.5)
{
  const S = (l) => gs('b', l);
  hitAt(S(0), 0.7, { g: 0.5 });
  // Lagos at night: a distant wash of traffic and a pulse
  sfx(D.mul(D.sweep(D.noise(D.secToN(9.5), 81), 'bp', (t) => 500 + Math.sin(t * 0.8) * 250, 0.6), D.envSwell(9.5, 0.2, 1)), S(0), { g: 0.07 });
  for (let i = 0; i < 11; i++) sfx(heartbeat(), S(0.35 + i * 0.83), { g: 0.4 * (0.6 + i * 0.05) });
  mus(D.mul(drone(9.5, HZ.D1, [160, 520]), D.envSwell(9.5, 0.5, 1.2)), S(0), { g: 0.42, hall: 0.1 });
  mus(D.mul(pad(9.5, [HZ.D2, HZ.F3, HZ.A3, HZ.C4], 1500), D.envSwell(9.5, 0.55, 1.5)), S(0), { g: 0.15, hall: 0.4 });
  // sparse bell motif (D minor pentatonic), like a distant Lagos night
  [[0.9, 'D5'], [2.55, 'A4'], [4.1, 'F5'], [5.9, 'D5'], [7.3, 'C5']].forEach(([t, n]) => mus(bell(HZ[n], 1.8), S(t), { g: 0.1, pan: r(-0.4, 0.4), hall: 0.6 }));
  // profile card + the follower count rolling up
  sfx(whoosh(0.7, 300, 2600, 0.4), S(B.card - 0.1), { g: 0.2, pan: -0.2 });
  for (let i = 0; i < 40; i++) sfx(click(3200 + i * 40, 0.6), S(B.countFrom + (i / 40) * (B.countTo - B.countFrom)), { g: 0.16 });
  sfx(bell(HZ.D5, 1.4), S(B.countTo), { g: 0.14, hall: 0.5 });
  // five people cornered: slam, paper, stamp
  B.beats.forEach((b, i) => {
    hitAt(S(b), 0.85 + i * 0.05, { g: 0.6 });
    sfx(slap(), S(b + 0.05), { g: 0.5, pan: (i - 2) * 0.12 });
    sfx(stampThud(), S(b + 14 / 60), { g: 0.55, room: 0.2 });
    sfx(whoosh(0.5, 500, 4200, 0.25), S(b - 0.12), { g: 0.14, pan: i % 2 ? 0.3 : -0.3 });
  });
  // the apologies arrive: notification chimes climbing
  ['D5', 'F5', 'A5', 'C6', 'D6'].forEach((n, i) => {
    const t = S(B.pings[i]);
    sfx(bell(HZ[n], 0.9), t, { g: 0.2, hall: 0.35, pan: -0.3 + i * 0.15 });
    sfx(pop(700 + i * 90, 1000 + i * 90), t, { g: 0.22 });
    sfx(boom(0.4, 70, 40), t, { g: 0.3 });
  });
  sfx(riser(2.1, 250, 7200, 1), S(7.35), { g: 0.5 });
  sfx(D.reverse(impact(0.8)), S(8.55), { g: 0.55 });
}

// ---------- C: the pattern (18.5 - 28.5)
{
  const S = (l) => gs('c', l);
  hitAt(S(0), 1.1, { g: 0.7 });
  sfx(glitch(0.3, 71), S(0.02), { g: 0.28 });
  // unison typing across every phone
  for (let i = 0; i < 120; i++) sfx(click(2300 + r(0, 2200), r(0.4, 1)), S(Cc.typeStart + (i / 120) * (Cc.typeEnd - Cc.typeStart)) + r(0, 0.01), { g: 0.2, pan: r(-0.7, 0.7) });
  // a clock that keeps getting louder
  for (let i = 0; i < 12; i++) {
    const t = S(0.4 + i * 0.5);
    if (t >= S(Cc.minute) - 0.05) break;
    sfx(click(1500, 1), t, { g: 0.2 + i * 0.03 });
    sfx(boom(0.25, 90, 55), t, { g: 0.12 + i * 0.02 });
  }
  // pulling back through the wall
  sfx(whoosh(3.4, 200, 3800, 0.55), S(Cc.pullStart), { g: 0.38 });
  sfx(riser(3.5, 160, 4800, 0.9), S(Cc.pullStart + 0.1), { g: 0.35 });
  mus(D.mul(drone(9.9, HZ.D1, [120, 900]), D.envSwell(9.9, 0.6, 1.2)), S(0.2), { g: 0.52, hall: 0.1 });
  mus(D.mul(pad(9.9, [HZ.D2, HZ.A2, HZ.F3, HZ.A3], 1800), D.envSwell(9.9, 0.6, 1.4)), S(0.2), { g: 0.16, hall: 0.4 });
  // SAME WORDS. / SAME FORMAT. / SAME MINUTE.
  Cc.words.forEach((w, i) => {
    const t = S(w);
    hitAt(t, i === 2 ? 1.5 : 1, { g: 0.78 });
    sfx(metal(1.1, 220 + i * 24), t, { g: 0.2, hall: 0.4 });
    sfx(glitch(0.22, 80 + i), t, { g: 0.22 });
  });
  // the dropout before "minute": all sound stops for a heartbeat, then everything lands at once
  mus(D.reverse(boom(0.5, 60, 30)), S(Cc.minute) - 0.5, { g: 0.0 });
  sfx(tinnitus(1.6, 3700), S(Cc.minute), { g: 0.06 });
  // the sign-off lights up: a choir of saws under the voices
  mus(D.mul(pad(4.3, [HZ.D3, HZ.F3, HZ.A3, HZ.D4], 1700), D.envSwell(4.3, 0.28, 1.2)), S(Cc.signoff - 0.3), { g: 0.34, hall: 0.55 });
  sfx(boom(1.4, 58, 28), S(Cc.signoff), { g: 0.55 });
  sfx(tinnitus(3.2, 3300), S(Cc.signoff + 0.2), { g: 0.04 });
  // out through a reversed swell
  sfx(D.reverse(impact(1)), S(9.2), { g: 0.6 });
  sfx(riser(0.9, 300, 7000, 0.8), S(9.1), { g: 0.4 });
}

// ---------- D: the trail (28.5 - 41.5)
{
  const S = (l) => gs('d', l);
  hitAt(S(0), 0.8, { g: 0.5 });
  // warmer bed: the corkboard, a lamp humming
  sfx(D.mul(D.osc(13, 100, 'sine'), D.envSwell(13, 0.5, 1)), S(0), { g: 0.012 });
  mus(D.mul(pad(13, [HZ.A2, HZ.C4, HZ.F3, HZ.A3], 1300), D.envSwell(13, 0.4, 1.3)), S(0), { g: 0.2, hall: 0.45 });
  mus(D.mul(drone(13, HZ.D1 * 1.335, [100, 500]), D.envSwell(13, 0.5, 1.2)), S(0), { g: 0.38 });
  for (let i = 0; i < 16; i++) sfx(heartbeat(), S(0.2 + i * 0.8), { g: 0.28 + i * 0.012 });
  // each pin: thock into cork, paper slap, a rising sting, red thread swishing across
  const notes = ['D4', 'F4', 'A4', 'C5', 'D5', 'F5'];
  DD.pins.forEach((p, i) => {
    const t = S(p);
    sfx(thock(), t + 0.07, { g: 0.7, room: 0.25, pan: -0.3 + i * 0.12 });
    sfx(slap(), t, { g: 0.45 });
    hitAt(t, 0.55 + i * 0.05, { g: 0.55 });
    sfx(bell(HZ[notes[i]], 1.6), t + 0.02, { g: 0.2, hall: 0.55, pan: -0.3 + i * 0.12 });
    if (i > 0) sfx(D.mul(D.sweep(D.noise(D.secToN(0.4), 90 + i), 'hp', (x) => 3000 + x * 6000, 0.7), D.envSwell(0.4, 0.3, 1.5)), t - 0.07, { g: 0.2 });
    sfx(whoosh(0.55, 300, 2200, 0.35), t - 0.2, { g: 0.13, pan: 0.2 });
  });
  // the wide reveal: the web of strings snaps into view
  sfx(whoosh(1.3, 200, 3200, 0.5), S(7.95), { g: 0.35 });
  sfx(riser(1.0, 300, 6000, 0.7), S(7.85), { g: 0.3 });
  for (let i = 0; i < 6; i++) sfx(slap(), S(8.0 + i * 0.1), { g: 0.2, pan: r(-0.5, 0.5) });
  // Halo's voice note starts: two small blips like a phone, then the music gets out of the way
  [0, 0.09].forEach((d) => sfx(D.mul(D.osc(0.035, 1320, 'sine'), D.envDecay(0.035, 0.001, 3)), S(DD.voice - 0.14 + d), { g: 0.12 }));
  // into the choice
  sfx(riser(1.5, 240, 6500, 0.8), S(11.4), { g: 0.4 });
}

// ---------- E: the choice (41.5 - 48.5)
{
  const S = (l) => gs('e', l);
  hitAt(S(0), 0.7, { g: 0.5 });
  sfx(whoosh(0.7, 300, 2800, 0.4), S(0.0), { g: 0.2 });
  mus(D.mul(drone(7, HZ.D1, [140, 800]), D.envSwell(7, 0.8, 1.2)), S(0), { g: 0.42, hall: 0.1 });
  // the timer: a clock that speeds up
  let t = 0.55;
  let gap = 0.5;
  while (t < E.select - 0.05) {
    sfx(click(1700, 1), S(t), { g: 0.3 });
    sfx(boom(0.22, 100, 60), S(t), { g: 0.16 });
    t += gap;
    gap = Math.max(0.16, gap * 0.9);
  }
  // choosing: a hard, final sound
  hitAt(S(E.select), 1.0, { g: 0.7 });
  sfx(stampThud(), S(E.select), { g: 0.4 });
  // the cost: glass cracks, trust drops
  hitAt(S(E.hurt), 0.9, { g: 0.6 });
  for (let i = 0; i < 4; i++) sfx(D.mul(D.biquad(D.noise(D.secToN(0.05), 140 + i), 'hp', 4200), D.envDecay(0.05, 0.0005, 5)).map((v) => v * 2), S(E.hurt + i * 0.025), { g: 0.35, pan: r(-0.5, 0.5) });
  sfx(D.mul(D.osc(0.9, (x) => 392 * Math.pow(0.5, x * 0.8), 'sine'), D.envDecay(0.9, 0.003, 3)), S(E.hurt), { g: 0.2, hall: 0.5 });
  // the map: the rumor goes national
  sfx(whoosh(0.9, 150, 3000, 0.3), S(E.map - 0.15), { g: 0.4 });
  hitAt(S(E.map), 1.2, { g: 0.75 });
  // 16th-note pulse that climbs
  for (let i = 0; i < 28; i++) {
    const tt = S(E.map + 0.15 + i * 0.125);
    const p = i / 28;
    const f = i % 8 === 7 ? HZ.A2 : i % 4 === 3 ? HZ.F3 / 2 : HZ.D2;
    mus(pluck(f, 0.22), tt, { g: 0.2 + p * 0.28 });
    if (i % 2) sfx(click(5200, 0.8), tt, { g: 0.1 + p * 0.12 });
  }
  mus(D.mul(pad(3.5, [HZ.D3, HZ.F3, HZ.A3], 2200), D.envSwell(3.5, 0.9, 1.4)), S(E.map), { g: 0.2, hall: 0.4 });
  // sparks pop
  E.sparks.forEach((s, i) => {
    sfx(pop(520, 1300, 1), S(s), { g: 0.4, pan: [-0.2, 0.3, 0.1][i], room: 0.3 });
    sfx(D.mul(D.biquad(D.noise(D.secToN(0.2), 160 + i), 'hp', 3600), D.envDecay(0.2, 0.001, 6)).map((v) => v * 1.4), S(s + 0.37), { g: 0.2 });
  });
  hitAt(S(E.flip), 0.8, { g: 0.5 });
  // the wire: telex beeps, then a siren-y drone
  [0, 0.16, 0.32].forEach((d) => sfx(D.mul(D.osc(0.09, 1040, 'square'), D.envDecay(0.09, 0.001, 2)), S(E.wire + d), { g: 0.14 }));
  hitAt(S(E.wire), 1.0, { g: 0.6 });
  sfx(riser(0.6, 400, 6500, 0.9), S(6.35), { g: 0.5 });
}

// ---------- F: aimed (48.5 - 55)
{
  const S = (l) => gs('f', l);
  // everything drops away
  sfx(D.mul(D.sweep(D.noise(D.secToN(6.5), 91), 'lp', () => 140, 0.7), D.envSwell(6.5, 0.5, 1)), S(0), { g: 0.42 });
  mus(D.mul(D.osc(6.5, 36.7, 'sine'), D.envSwell(6.5, 0.3, 1)), S(0), { g: 0.18 });
  sfx(heartbeat(), S(1.0), { g: 0.35 });
  sfx(heartbeat(), S(2.4), { g: 0.4 });
  // the reticle closes: a rising whine and ticks that speed up until they are one tone
  const wn = F.lock - F.reticle;
  sfx(D.mul(D.osc(wn, (x) => 300 * Math.pow(9, (x / wn) ** 1.5) + Math.sin(x * (6 + x * 8)) * 12, 'sine'), D.envSwell(wn, 0.995, 2.0)), S(F.reticle), { g: 0.12, hall: 0.2 });
  let tt = S(F.reticle);
  let g2 = 0.38;
  while (tt < S(F.lock) - 0.03) {
    sfx(click(2600, 1), tt, { g: 0.28 });
    tt += g2;
    g2 = Math.max(0.045, g2 * 0.88);
  }
  sfx(riser(wn, 300, 9000, 0.8), S(F.reticle), { g: 0.3 });
  // the lock
  sfx(D.mul(D.osc(0.01, 100, 'sine'), D.envDecay(0.01)), S(F.lock) - 0.01, { g: 0 });
  hitAt(S(F.lock), 1.9, { g: 1.0 });
  sfx(glitch(0.5, 120), S(F.lock), { g: 0.45 });
  sfx(tinnitus(2.4, 3300), S(F.lock) + 0.05, { g: 0.1 });
  sfx(boom(2.4, 50, 22), S(F.lock), { g: 0.8 });
}

// ---------- G: title (55 - 63)
{
  const S = (l) => gs('g', l);
  sfx(D.mul(D.sweep(D.noise(D.secToN(8), 93), 'lp', () => 150, 0.7), D.envSwell(8, 0.6, 1)), S(0), { g: 0.35 });
  sfx(heartbeat(), S(0.2), { g: 0.22 });
  // one last 6:06 buzz in the dark
  [0, 14 / 60, 28 / 60].forEach((d) => {
    sfx(buzzMotor(0.24), S(G.buzz + d), { g: 0.5 });
    sfx(boom(0.35, 80, 45), S(G.buzz + d), { g: 0.35 });
  });
  sfx(bell(HZ.D5, 1.2), S(G.banner), { g: 0.12, hall: 0.5 });
  // the title: the biggest hit in the piece, and then the pad resolves
  sfx(whoosh(0.9, 200, 3600, 0.6), S(G.title - 0.7), { g: 0.35 });
  sfx(riser(0.8, 250, 6000, 0.8), S(G.title - 0.8), { g: 0.4 });
  hitAt(S(G.title), 2.0, { g: 1.0, hall: 0.55 });
  sfx(boom(2.6, 52, 24), S(G.title), { g: 0.85 });
  mus(D.mul(pad(5.5, [HZ.D2, HZ.A2, HZ.F3, HZ.A3, HZ.D4], 2400), D.envSwell(5.5, 0.12, 1.1)), S(G.title - 0.05), { g: 0.34, hall: 0.6 });
  mus(D.mul(drone(5.6, HZ.D1, [220, 900]), D.envSwell(5.6, 0.2, 1.1)), S(G.title - 0.05), { g: 0.45 });
  [[0.5, 'D5'], [1.3, 'A5'], [2.2, 'F5'], [3.1, 'D6']].forEach(([t, n]) => mus(bell(HZ[n], 2.4), S(G.title + t), { g: 0.12, pan: r(-0.5, 0.5), hall: 0.7 }));
  sfx(glitch(0.4, 150), S(G.title), { g: 0.3 });
  sfx(click(2200, 1), S(G.sub), { g: 0.3 });
  sfx(click(2200, 1), S(G.season), { g: 0.25 });
  // the question types itself out
  for (let i = 0; i < 25; i++) sfx(click(2500 + r(0, 1400), r(0.5, 1)), S(G.tagline + (i / 25) * 1.3), { g: 0.24 });
  // the clock, glitching, and a last heartbeat
  sfx(glitch(0.2, 160), S(G.clock), { g: 0.2 });
  sfx(click(1800, 1), S(G.clock + 0.13), { g: 0.35 });
  sfx(heartbeat(), S(7.0), { g: 0.5 });
}

/* ------------------------------------------------------------------ voiceover */
const voDir = join(ROOT, 'public/audio/vo');
let haveVo = 0;
for (const [id, at] of Object.entries(VO_AT)) {
  const f = join(voDir, `${id}.wav`);
  if (!existsSync(f)) {
    console.warn(`VO missing: ${id} (score only for that line)`);
    continue;
  }
  const c = decode(f, SR, 2);
  const vg = { h1: 3.4, chorus: 3.3, n1b: 2.5, h2: 2.6, n3b: 2.5 }[id] ?? 2.1;
  VOX.addStereo(c.ch[0], c.ch[1], at, vg);
  haveVo++;
}
console.log(`voiceover lines mixed: ${haveVo}/${Object.keys(VO_AT).length}`);

/* ------------------------------------------------------------------ mix */
const n = D.secToN(DUR);
const [hl, hr] = D.reverb(sendHall, { decay: 3.4, damp: 0.55, pre: 0.02 });
const [rl, rr2] = D.reverb(sendRoom, { decay: 0.7, damp: 0.5, pre: 0.006 });

// duck the music (and a little of the effects) under the voice
const env = new Float32Array(n);
{
  let e = 0;
  const a = Math.exp(-1 / (0.03 * SR));
  const rel = Math.exp(-1 / (0.35 * SR));
  for (let i = 0; i < n; i++) {
    const v = Math.max(Math.abs(VOX.L[i]), Math.abs(VOX.R[i]));
    e = v > e ? a * e + (1 - a) * v : rel * e + (1 - rel) * v;
    env[i] = e;
  }
}
const duck = (k, i) => 1 - k * Math.min(1, env[i] / 0.07);

const L = new Float32Array(n);
const R = new Float32Array(n);
for (let i = 0; i < n; i++) {
  const dm = duck(0.78, i);
  const ds = duck(0.55, i);
  L[i] = MUS.L[i] * dm * 1.0 + SFX.L[i] * ds * 1.0 + (hl[i] ?? 0) * 0.62 * dm + (rl[i] ?? 0) * 0.5 + VOX.L[i] * 1.0;
  R[i] = MUS.R[i] * dm * 1.0 + SFX.R[i] * ds * 1.0 + (hr[i] ?? 0) * 0.62 * dm + (rr2[i] ?? 0) * 0.5 + VOX.R[i] * 1.0;
}
// soft-knee limiter, then peak-normalise to -1.2 dBFS
let pk = 0;
for (let i = 0; i < n; i++) {
  L[i] = Math.tanh(L[i] * 0.9) / 0.9 * 0.96;
  R[i] = Math.tanh(R[i] * 0.9) / 0.9 * 0.96;
  pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = D.dbToGain(-1.2) / (pk || 1);
for (let i = 0; i < n; i++) {
  L[i] *= gain;
  R[i] *= gain;
}
const out = join(ROOT, 'public/story-mix.wav');
D.writeWavStereo(out, L, R);

// quick loudness read per second, so a bad mix is obvious without listening
const rows = [];
for (let s = 0; s < Math.floor(DUR); s += 1) {
  let sum = 0;
  for (let i = s * SR; i < (s + 1) * SR; i++) sum += L[i] * L[i];
  rows.push(Math.round(20 * Math.log10(Math.sqrt(sum / SR) + 1e-9)));
}
console.log('rms dB per second:', rows.join(' '));
console.log(`wrote ${out}  peak scaled by ${gain.toFixed(2)}x`);

// voice intelligibility check: voice level vs everything else, per line (want the voice clearly on top)
{
  const rms = (a, b, e, s0, s1) => {
    let sum = 0;
    for (let i = s0; i < s1; i++) sum += (a[i] ?? 0) * (a[i] ?? 0);
    return 20 * Math.log10(Math.sqrt(sum / Math.max(1, s1 - s0)) + 1e-9);
  };
  for (const [id, at] of Object.entries(VO_AT)) {
    const f = join(voDir, `${id}.wav`);
    if (!existsSync(f)) continue;
    const len = decode(f, SR, 1).ch[0].length;
    const s0 = D.secToN(at);
    const s1 = Math.min(n, s0 + len);
    let vs = 0, ms = 0;
    for (let i = s0; i < s1; i++) {
      vs += VOX.L[i] * VOX.L[i] * gain * gain;
      ms += (L[i] - VOX.L[i] * gain) ** 2;
    }
    const vdb = 10 * Math.log10(vs / (s1 - s0) + 1e-12);
    const mdb = 10 * Math.log10(ms / (s1 - s0) + 1e-12);
    console.log(`${id.padEnd(7)} voice ${vdb.toFixed(1)} dB  rest ${mdb.toFixed(1)} dB  margin ${(vdb - mdb).toFixed(1)} dB`);
  }
}

