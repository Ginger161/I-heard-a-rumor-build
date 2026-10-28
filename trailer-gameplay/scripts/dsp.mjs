// Small offline DSP toolkit for the story trailer: oscillators, noise, RBJ filters, a Schroeder reverb,
// a compressor, saturation, resampling (pitch) and a stereo track that events are summed onto.
// Everything works on Float32Array mono buffers at SR; Track holds the stereo sum.
import { writeFileSync } from 'node:fs';

export const SR = 44100;
const TAU = Math.PI * 2;
export const dbToGain = (db) => Math.pow(10, db / 20);
export const secToN = (s) => Math.floor(s * SR);

/* ------------------------------------------------------------------ random */
export const rng = (seed = 1) => {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
};
export const noise = (n, seed = 7) => {
  const r = rng(seed);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = r() * 2 - 1;
  return o;
};

/* ------------------------------------------------------------------ envelopes + oscillators */
/** exponential decay from 1 to ~0 over `dur`, with an attack of `atk` seconds */
export const envDecay = (dur, atk = 0.002, curve = 5) => {
  const n = secToN(dur);
  const a = Math.max(1, secToN(atk));
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = (i < a ? i / a : 1) * Math.exp((-curve * i) / n);
  return o;
};
export const envSwell = (dur, peak = 0.7, curve = 2) => {
  const n = secToN(dur);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    o[i] = t < peak ? Math.pow(t / peak, curve) : Math.pow(1 - (t - peak) / (1 - peak), 1.5);
  }
  return o;
};
export const mul = (a, b) => {
  const n = Math.min(a.length, b.length);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = a[i] * b[i];
  return o;
};
export const scale = (a, g) => {
  const o = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) o[i] = a[i] * g;
  return o;
};
export const mixInto = (dst, src, at = 0, g = 1) => {
  for (let i = 0; i < src.length && i + at < dst.length; i++) if (i + at >= 0) dst[i + at] += src[i] * g;
  return dst;
};
/** oscillator with per-sample frequency function f(t seconds) */
export const osc = (dur, freq, shape = 'sine', phase0 = 0) => {
  const n = secToN(dur);
  const o = new Float32Array(n);
  let ph = phase0;
  for (let i = 0; i < n; i++) {
    const fr = typeof freq === 'function' ? freq(i / SR) : freq;
    ph += (fr / SR) * TAU;
    const p = ph % TAU;
    o[i] = shape === 'sine' ? Math.sin(p) : shape === 'saw' ? p / Math.PI - 1 : shape === 'square' ? (p < Math.PI ? 1 : -1) : shape === 'tri' ? 2 * Math.abs(p / Math.PI - 1) - 1 : 0;
  }
  return o;
};
export const sat = (a, drive = 2) => {
  const o = new Float32Array(a.length);
  const k = Math.tanh(drive);
  for (let i = 0; i < a.length; i++) o[i] = Math.tanh(a[i] * drive) / k;
  return o;
};

/* ------------------------------------------------------------------ filters (RBJ biquads) */
const coef = (type, fc, q, gainDb = 0) => {
  const w0 = (TAU * Math.min(fc, SR * 0.45)) / SR;
  const cw = Math.cos(w0);
  const sw = Math.sin(w0);
  const alpha = sw / (2 * q);
  const A = Math.pow(10, gainDb / 40);
  let b0, b1, b2, a0, a1, a2;
  switch (type) {
    case 'lp':
      b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
    case 'hp':
      b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
    case 'bp':
      b0 = alpha; b1 = 0; b2 = -alpha; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; break;
    case 'peak':
      b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * cw; a2 = 1 - alpha / A; break;
    case 'lowshelf': {
      const sq = 2 * Math.sqrt(A) * alpha;
      b0 = A * (A + 1 - (A - 1) * cw + sq); b1 = 2 * A * (A - 1 - (A + 1) * cw); b2 = A * (A + 1 - (A - 1) * cw - sq);
      a0 = A + 1 + (A - 1) * cw + sq; a1 = -2 * (A - 1 + (A + 1) * cw); a2 = A + 1 + (A - 1) * cw - sq; break;
    }
    case 'highshelf': {
      const sq = 2 * Math.sqrt(A) * alpha;
      b0 = A * (A + 1 + (A - 1) * cw + sq); b1 = -2 * A * (A - 1 + (A + 1) * cw); b2 = A * (A + 1 + (A - 1) * cw - sq);
      a0 = A + 1 - (A - 1) * cw + sq; a1 = 2 * (A - 1 - (A + 1) * cw); a2 = A + 1 - (A - 1) * cw - sq; break;
    }
    default: throw new Error(type);
  }
  return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
};
export const biquad = (x, type, fc, q = 0.707, gainDb = 0) => {
  const [b0, b1, b2, a1, a2] = coef(type, fc, q, gainDb);
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
};
/** filter whose cutoff follows fc(t); coefficients refreshed every 32 samples, state carried across */
export const sweep = (x, type, fc, q = 0.8) => {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  let c = coef(type, fc(0), q);
  for (let i = 0; i < x.length; i++) {
    if (i % 32 === 0) c = coef(type, fc(i / SR), q);
    const v = c[0] * x[i] + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
};

/* ------------------------------------------------------------------ dynamics + time */
export const compress = (x, { thresh = -20, ratio = 3, atk = 0.006, rel = 0.12, makeup = 0 } = {}) => {
  const y = new Float32Array(x.length);
  const aA = Math.exp(-1 / (atk * SR));
  const aR = Math.exp(-1 / (rel * SR));
  let env = 0;
  for (let i = 0; i < x.length; i++) {
    const a = Math.abs(x[i]);
    env = a > env ? aA * env + (1 - aA) * a : aR * env + (1 - aR) * a;
    const db = 20 * Math.log10(env + 1e-9);
    const over = db - thresh;
    const gr = over > 0 ? -over * (1 - 1 / ratio) : 0;
    y[i] = x[i] * dbToGain(gr + makeup);
  }
  return y;
};
export const normalize = (x, peakDb = -1) => {
  let pk = 0;
  for (let i = 0; i < x.length; i++) pk = Math.max(pk, Math.abs(x[i]));
  return pk > 0 ? scale(x, dbToGain(peakDb) / pk) : x;
};
/** resample by `rate` (rate < 1 = lower pitch AND longer). Cubic interpolation. */
export const resample = (x, rate) => {
  const n = Math.floor(x.length / rate);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * rate;
    const k = Math.floor(p);
    const f = p - k;
    const a = x[k - 1] ?? x[k], b = x[k], c = x[k + 1] ?? x[k], d = x[k + 2] ?? c;
    y[i] = b + 0.5 * f * (c - a + f * (2 * a - 5 * b + 4 * c - d + f * (3 * (b - c) + d - a)));
  }
  return y;
};
export const fade = (x, inS = 0.004, outS = 0.02) => {
  const y = Float32Array.from(x);
  const a = secToN(inS), b = secToN(outS);
  for (let i = 0; i < a && i < y.length; i++) y[i] *= i / a;
  for (let i = 0; i < b && i < y.length; i++) y[y.length - 1 - i] *= i / b;
  return y;
};
export const reverse = (x) => Float32Array.from(x).reverse();
/** sample-and-hold downsample + bit reduction: the thin, digital "voice note" texture */
export const crush = (x, hold = 4, bits = 9) => {
  const y = new Float32Array(x.length);
  const q = Math.pow(2, bits - 1);
  let h = 0;
  for (let i = 0; i < x.length; i++) {
    if (i % hold === 0) h = Math.round(x[i] * q) / q;
    y[i] = h;
  }
  return y;
};

/* ------------------------------------------------------------------ reverb (Schroeder: 4 combs + 2 allpass, per channel) */
const COMB_L = [1557, 1617, 1491, 1422].map((v) => v / 44100);
const COMB_R = [1580, 1640, 1514, 1445].map((v) => v / 44100);
const AP = [225, 556].map((v) => v / 44100);
const combs = (x, delays, fb, damp) => {
  const out = new Float32Array(x.length);
  for (const d of delays) {
    const n = Math.floor(d * SR);
    const buf = new Float32Array(n);
    let idx = 0, lp = 0;
    for (let i = 0; i < x.length; i++) {
      const v = buf[idx];
      lp = v * (1 - damp) + lp * damp;
      buf[idx] = x[i] + lp * fb;
      idx = (idx + 1) % n;
      out[i] += v;
    }
  }
  return scale(out, 0.25);
};
const allpass = (x, d, g = 0.5) => {
  const n = Math.floor(d * SR);
  const buf = new Float32Array(n);
  const y = new Float32Array(x.length);
  let idx = 0;
  for (let i = 0; i < x.length; i++) {
    const b = buf[idx];
    const v = x[i] + -g * b;
    y[i] = b + g * v;
    buf[idx] = v;
    idx = (idx + 1) % n;
  }
  return y;
};
/** returns [wetL, wetR] for mono input `x`. decay ~ seconds (RT60-ish), damp 0..1 (higher = darker tail) */
export const reverb = (x, { decay = 1.6, damp = 0.35, pre = 0.012, tail = 1.0 } = {}) => {
  const padN = secToN(decay * 1.2 * tail);
  const src = new Float32Array(x.length + padN + secToN(pre));
  src.set(x, secToN(pre));
  const fb = Math.pow(10, (-3 * 0.035) / decay); // per-comb feedback for the target RT60
  const side = (delays) => {
    let w = combs(src, delays, Math.min(0.93, fb), damp);
    for (const a of AP) w = allpass(w, a);
    return w;
  };
  return [side(COMB_L), side(COMB_R)];
};

/* ------------------------------------------------------------------ stereo track */
export class Track {
  constructor(seconds) {
    this.n = secToN(seconds);
    this.L = new Float32Array(this.n);
    this.R = new Float32Array(this.n);
  }
  /** add mono `x` at `t` seconds, linear gain `g`, pan -1..1 */
  add(x, t, g = 1, pan = 0) {
    const at = secToN(t);
    const l = g * Math.cos(((pan + 1) * Math.PI) / 4);
    const r = g * Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = 0; i < x.length; i++) {
      const k = at + i;
      if (k < 0 || k >= this.n) continue;
      this.L[k] += x[i] * l;
      this.R[k] += x[i] * r;
    }
    return this;
  }
  addStereo(l, r, t, g = 1) {
    const at = secToN(t);
    for (let i = 0; i < l.length; i++) {
      const k = at + i;
      if (k < 0 || k >= this.n) continue;
      this.L[k] += l[i] * g;
      this.R[k] += (r[i] ?? 0) * g;
    }
    return this;
  }
  /** send `x` through the reverb and add the wet signal */
  addVerb(x, t, g = 1, opts = {}, pan = 0) {
    const [wl, wr] = reverb(x, opts);
    this.addStereo(wl, wr, t, g * (1 - Math.abs(pan) * 0.3));
    return this;
  }
}

/* ------------------------------------------------------------------ wav out */
export const writeWavStereo = (file, L, R) => {
  const n = L.length;
  const pcm = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), i * 4);
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28);
  h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  writeFileSync(file, Buffer.concat([h, pcm]));
};
export const writeWavMono = (file, x) => writeWavStereo(file, x, x);
