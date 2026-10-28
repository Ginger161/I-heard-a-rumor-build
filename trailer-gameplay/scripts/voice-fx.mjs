// Voice processing chains for the story trailer: deepening, EQ, compression, room, and the per-character
// effects (narrator, narrator close-up, Halo's phone voice note, Halo up close).
import { join } from 'node:path';
import { mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { ROOT, FF, decode } from './audio-lib.mjs';
import * as D from './dsp.mjs';

const takeDir = join(ROOT, 'out/vo-takes');
mkdirSync(takeDir, { recursive: true });

/** pitch-preserving tempo change through ffmpeg's atempo (0.5..2 per pass) */
const atempo = (x, tempo) => {
  const a = join(takeDir, '_tmp-in.wav');
  const b = join(takeDir, '_tmp-out.wav');
  D.writeWavMono(a, x);
  const r = spawnSync(FF, ['-v', 'error', '-y', '-i', a, '-af', `atempo=${tempo}`, '-c:a', 'pcm_s16le', '-ar', String(D.SR), b]);
  if (r.status !== 0) throw new Error(`atempo failed: ${r.stderr}`);
  const c = decode(b, D.SR, 1);
  rmSync(a, { force: true });
  rmSync(b, { force: true });
  return c.ch[0];
};

/* ------------------------------------------------------------------ voice processing */
// Deepening: resample down by `rate` (lower pitch AND formants = a bigger, darker voice, and longer),
// then atempo back toward the original pace (`pace` 1 = same duration as the raw read; <1 = slower).
export const deepen = (x, rate, pace) => atempo(D.resample(x, rate), 1 / (rate * pace));

export const CHAINS = {
  // the narrator, speaking: dark, close, controlled
  bill: (x) => {
    let y = D.biquad(x, 'hp', 70);
    y = deepen(y, 0.9, 0.98);
    y = D.biquad(y, 'lowshelf', 150, 0.7, 4.5);
    y = D.biquad(y, 'peak', 2800, 1.1, 2.2);
    y = D.biquad(y, 'peak', 280, 1.0, -1.8); // clear the mud the pitch-drop adds
    y = D.compress(y, { thresh: -24, ratio: 3.2, makeup: 4 });
    y = D.sat(y, 1.35);
    return { dry: y, send: 0.07, room: { decay: 0.55, damp: 0.5 }, delay: 0 };
  },
  // the narrator, inner voice: slower, breathier, more space
  'bill-close': (x) => {
    let y = D.biquad(x, 'hp', 80);
    y = deepen(y, 0.925, 0.93);
    y = D.biquad(y, 'lowshelf', 160, 0.7, 3.5);
    y = D.biquad(y, 'highshelf', 6200, 0.7, 3.2); // breath
    y = D.biquad(y, 'peak', 3000, 1.0, 2.0);
    y = D.compress(y, { thresh: -26, ratio: 3.6, makeup: 6 });
    y = D.sat(y, 1.25);
    return { dry: y, send: 0.17, room: { decay: 1.15, damp: 0.55 }, delay: 0.12 };
  },
  // Halo's voice note: a phone speaker, a little crushed, with room hiss
  'halo-note': (x) => {
    let y = D.resample(x, 0.95);
    y = D.biquad(y, 'hp', 380, 0.9);
    y = D.biquad(y, 'lp', 3300, 0.9);
    y = D.biquad(y, 'peak', 1500, 1.2, 4);
    y = D.crush(y, 3, 11);
    y = D.sat(y, 2.4);
    const hiss = D.biquad(D.noise(y.length, 11), 'hp', 3500);
    y = y.map((v, i) => v + hiss[i] * 0.012);
    y = D.compress(y, { thresh: -22, ratio: 4, makeup: 6 });
    return { dry: y, send: 0.05, room: { decay: 0.28, damp: 0.7 }, delay: 0 };
  },
  // Halo up close: warm, gentle, much too calm
  'halo-close': (x) => {
    let y = D.biquad(x, 'hp', 75);
    y = deepen(y, 0.93, 0.92);
    y = D.biquad(y, 'lowshelf', 170, 0.7, 3.5);
    y = D.biquad(y, 'peak', 3400, 1.0, 1.8);
    y = D.compress(y, { thresh: -25, ratio: 3, makeup: 5 });
    return { dry: y, send: 0.14, room: { decay: 1.3, damp: 0.5 }, delay: 0.09 };
  },
};

export const finish = ({ dry, send, room, delay }, peakDb = -2.5) => {
  const n = dry.length + D.secToN(2.2);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  D.mixInto(L, dry, 0, 1);
  D.mixInto(R, dry, 0, 1);
  const [wl, wr] = D.reverb(dry, room);
  D.mixInto(L, wl, 0, send * 3.2);
  D.mixInto(R, wr, 0, send * 3.2);
  if (delay) {
    // soft ping-pong echo: two repeats, darker each time
    for (let k = 1; k <= 2; k++) {
      const echo = D.biquad(dry, 'lp', 3600 / k);
      D.mixInto(k % 2 ? L : R, echo, D.secToN(delay * 2 * k), 0.22 / k);
    }
  }
  // trim trailing silence
  let end = n;
  while (end > 0 && Math.abs(L[end - 1]) < 0.0008 && Math.abs(R[end - 1]) < 0.0008) end--;
  const l = L.subarray(0, Math.min(n, end + D.secToN(0.05)));
  const r = R.subarray(0, l.length);
  let pk = 0;
  for (let i = 0; i < l.length; i++) pk = Math.max(pk, Math.abs(l[i]), Math.abs(r[i]));
  const g = D.dbToGain(peakDb) / (pk || 1);
  return [l.map((v) => v * g), r.map((v) => v * g)];
};

