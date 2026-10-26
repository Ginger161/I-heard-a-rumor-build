// Runs every voice chain on a synthetic "voice" (harmonic buzz with syllable-like envelope) to prove the DSP
// works end to end without an API key. Writes out/vo-selftest/<chain>.wav.
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { ROOT } from './audio-lib.mjs';
import * as D from './dsp.mjs';
import { CHAINS, finish } from './voice-fx.mjs';

const out = join(ROOT, 'out/vo-selftest');
mkdirSync(out, { recursive: true });
const dur = 2.2;
const n = D.secToN(dur);
const x = new Float32Array(n);
for (let i = 0; i < n; i++) {
  const t = i / D.SR;
  const f0 = 120 + 18 * Math.sin(t * 3.1);
  let v = 0;
  for (let h = 1; h <= 14; h++) v += Math.sin(2 * Math.PI * f0 * h * t) / h;
  const syl = Math.max(0, Math.sin(t * 2 * Math.PI * 3.2)) ** 0.6; // ~3 syllables a second
  x[i] = v * syl * 0.25;
}
for (const [name, chain] of Object.entries(CHAINS)) {
  const t0 = Date.now();
  const [l, r] = finish(chain(x));
  D.writeWavStereo(join(out, `${name}.wav`), l, r);
  let pk = 0;
  for (let i = 0; i < l.length; i++) pk = Math.max(pk, Math.abs(l[i]));
  console.log(`${name.padEnd(11)} in ${dur.toFixed(2)}s -> out ${(l.length / D.SR).toFixed(2)}s, peak ${pk.toFixed(2)}, ${Date.now() - t0}ms`);
}
