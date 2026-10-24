// Synthesises the trailer's sound bed (no samples, no licences): drone, impacts, risers,
// siren, counter ticks and the flash-bulb. Event times come from src/timing.ts so picture and sound
// cannot drift apart. Node strips the TypeScript types on import.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FPS, SCENES, S4, globalImpacts } from '../src/timing.ts';

const SR = 44100;
const DUR = 30;
const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);
const TAU = Math.PI * 2;
const sec = (frame) => frame / FPS;

let seed = 1337;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

const mix = (i, l, r = l) => {
  if (i < 0 || i >= N) return;
  L[i] += l;
  R[i] += r;
};

// 1. Drone: three detuned low sines that swell across the 30 seconds.
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const swell = 0.07 + 0.11 * (t / DUR);
  const trem = 0.85 + 0.15 * Math.sin(TAU * 0.23 * t);
  const v = (Math.sin(TAU * 55 * t) + 0.6 * Math.sin(TAU * 82.6 * t + 1) + 0.4 * Math.sin(TAU * 110.4 * t + 2)) * swell * trem;
  mix(i, v * 0.9, v * 1.0);
}

// 2. Impacts: pitch-dropping kick + low boom + noise crack.
for (const { t, w } of globalImpacts()) {
  const t0 = Math.floor(sec(t) * SR);
  let lp = 0;
  for (let n = 0; n < SR * 1.1; n++) {
    const x = n / SR;
    const f0 = 38 + 120 * Math.exp(-x * 22);
    const body = Math.sin(TAU * f0 * x) * Math.exp(-x * 4.2) * 0.95;
    const boom = Math.sin(TAU * 31 * x) * Math.exp(-x * 2.4) * 0.5;
    lp += (rnd() - lp) * 0.28;
    const crack = lp * Math.exp(-x * 16) * 0.55;
    const v = (body + boom + crack) * w * 0.8;
    mix(t0 + n, v, v);
  }
}

// 3. Risers into the whip-pan (scene 3) and the flash-bulb (scene 6).
const riser = (endFrame, len, gain) => {
  const end = Math.floor(sec(endFrame) * SR);
  const start = end - Math.floor(len * SR);
  let lp = 0;
  for (let n = 0; n < end - start; n++) {
    const p = n / (end - start);
    const a = 0.02 + 0.55 * p * p;
    const x = rnd();
    lp += (x - lp) * a;
    const hp = x - lp;
    const v = hp * p * p * gain;
    mix(start + n, v, -v * 0.6 + v * 1.0);
  }
};
riser(SCENES.s3.from, 1.3, 0.22);
riser(SCENES.s6.from, 1.8, 0.28);

// 4. DSS siren wail through scene 5, left/right panned in opposition.
{
  const a = Math.floor(sec(SCENES.s5.from) * SR);
  const b = Math.floor(sec(SCENES.s6.from) * SR);
  let ph = 0;
  for (let i = a; i < b; i++) {
    const t = (i - a) / SR;
    const f = 720 + 260 * Math.sin(TAU * 0.85 * t);
    ph += (TAU * f) / SR;
    const env = Math.min(1, t / 0.4) * 0.07;
    const v = (Math.sin(ph) + 0.35 * Math.sin(3 * ph)) * env;
    const pan = 0.5 + 0.5 * Math.sin(TAU * 0.85 * t);
    mix(i, v * (1 - pan * 0.6), v * (0.4 + pan * 0.6));
  }
}

// 5. Counter ticks through scene 4: accelerating clicks that rise in pitch.
{
  let t = sec(SCENES.s4.from + 20);
  const end = sec(SCENES.s4.from + S4.counterLock);
  while (t < end) {
    const p = (t - sec(SCENES.s4.from + 20)) / (end - sec(SCENES.s4.from + 20));
    const f0 = 1400 + 1800 * p;
    const i0 = Math.floor(t * SR);
    for (let n = 0; n < 900; n++) {
      const x = n / SR;
      const v = Math.sin(TAU * f0 * x) * Math.exp(-x * 320) * 0.09;
      mix(i0 + n, v, v);
    }
    t += 0.15 - 0.09 * p;
  }
}

// 6. Flash-bulb pop + ring at the start of scene 6.
{
  const i0 = Math.floor(sec(SCENES.s6.from) * SR);
  for (let n = 0; n < SR * 1.6; n++) {
    const x = n / SR;
    const pop = rnd() * Math.exp(-x * 26) * 0.5;
    const ring = Math.sin(TAU * 3300 * x) * Math.exp(-x * 3.2) * 0.14 + Math.sin(TAU * 4950 * x) * Math.exp(-x * 4) * 0.06;
    mix(i0 + n, pop + ring, pop * 0.9 + ring);
  }
}

// master: soft clip, normalise, 0.4s fade in / 0.6s fade out
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.1);
  R[i] = Math.tanh(R[i] * 1.1);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / (peak || 1);
const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.4) * Math.min(1, (DUR - t) / 0.6);
  pcm.writeInt16LE(Math.round(L[i] * norm * fade * 32767), i * 4);
  pcm.writeInt16LE(Math.round(R[i] * norm * fade * 32767), i * 4 + 2);
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

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'trailer-score.wav'), Buffer.concat([header, pcm]));
console.log(`trailer-score.wav written (${(pcm.length / 1e6).toFixed(1)} MB, ${globalImpacts().length} impacts)`);
