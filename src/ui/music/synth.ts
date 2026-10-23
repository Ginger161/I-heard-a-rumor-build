// Instruments for the music library. Everything is synthesised with WebAudio and written against BaseAudioContext, so the
// same code plays live and renders offline (the tests render every track and check it is audible and not clipping).
// Each function schedules one note at time `t` into `out`. Nothing here keeps state.
export type Ctx = BaseAudioContext;

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();
export const noiseBuffer = (ctx: Ctx): AudioBuffer => {
  let b = noiseBuffers.get(ctx);
  if (!b) {
    const len = Math.floor(ctx.sampleRate * 2);
    b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0);
    // Deterministic noise, so offline renders are repeatable.
    let s = 0x9e3779b9;
    for (let i = 0; i < len; i++) { s = (Math.imul(s ^ (s >>> 15), 2246822519) + 0x6d2b79f5) | 0; d[i] = ((s >>> 8) & 0xffff) / 32768 - 1; }
    noiseBuffers.set(ctx, b);
  }
  return b;
};

export const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const env = (g: GainNode, t: number, peak: number, attack: number, decay: number, floor = 0.0001) => {
  g.gain.setValueAtTime(floor, t);
  g.gain.exponentialRampToValueAtTime(Math.max(floor * 2, peak), t + Math.max(0.001, attack));
  g.gain.exponentialRampToValueAtTime(floor, t + attack + decay);
};

const osc = (ctx: Ctx, type: OscillatorType, f: number, t: number, dur: number, slideTo?: number, slideTime?: number): OscillatorNode => {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + (slideTime ?? dur));
  o.start(t);
  o.stop(t + dur + 0.05);
  return o;
};

const noiseHit = (ctx: Ctx, out: AudioNode, t: number, dur: number, vol: number, filter: BiquadFilterType, freq: number, q = 0.8, attack = 0.002) => {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  const f = ctx.createBiquadFilter(); f.type = filter; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain();
  env(g, t, vol, attack, dur);
  src.connect(f).connect(g).connect(out);
  src.start(t, 0.1 + (t % 1) * 0.5);
  src.stop(t + dur + attack + 0.05);
};

// ---- drums -----------------------------------------------------------------
export const kick = (ctx: Ctx, out: AudioNode, t: number, v = 1, deep = false) => {
  const g = ctx.createGain(); env(g, t, 0.95 * v, 0.003, deep ? 0.42 : 0.26); g.connect(out);
  osc(ctx, 'sine', deep ? 130 : 160, t, 0.45, deep ? 38 : 46, 0.12).connect(g);
  noiseHit(ctx, out, t, 0.02, 0.18 * v, 'highpass', 2500);
};
export const snare = (ctx: Ctx, out: AudioNode, t: number, v = 1) => {
  noiseHit(ctx, out, t, 0.17, 0.5 * v, 'bandpass', 1900, 0.7);
  const g = ctx.createGain(); env(g, t, 0.35 * v, 0.002, 0.11); g.connect(out);
  osc(ctx, 'triangle', 200, t, 0.15, 150, 0.1).connect(g);
};
export const clap = (ctx: Ctx, out: AudioNode, t: number, v = 1) => {
  [0, 0.011, 0.022].forEach(d => noiseHit(ctx, out, t + d, 0.05, 0.28 * v, 'bandpass', 1500, 1.1));
  noiseHit(ctx, out, t + 0.03, 0.16, 0.3 * v, 'bandpass', 1400, 0.9);
};
export const hat = (ctx: Ctx, out: AudioNode, t: number, v = 1, open = false) =>
  noiseHit(ctx, out, t, open ? 0.2 : 0.04, (open ? 0.17 : 0.14) * v, 'highpass', open ? 7000 : 8500, 0.6);
export const shaker = (ctx: Ctx, out: AudioNode, t: number, v = 1) =>
  noiseHit(ctx, out, t, 0.06, 0.16 * v, 'bandpass', 6500, 1.2, 0.012);
export const rim = (ctx: Ctx, out: AudioNode, t: number, v = 1) => {
  const g = ctx.createGain(); env(g, t, 0.28 * v, 0.001, 0.04); g.connect(out);
  osc(ctx, 'triangle', 820, t, 0.05).connect(g);
  noiseHit(ctx, out, t, 0.02, 0.1 * v, 'highpass', 4000);
};
export const conga = (ctx: Ctx, out: AudioNode, t: number, v = 1, high = true) => {
  const g = ctx.createGain(); env(g, t, 0.42 * v, 0.002, 0.15); g.connect(out);
  osc(ctx, 'sine', high ? 310 : 215, t, 0.2, high ? 250 : 175, 0.1).connect(g);
  noiseHit(ctx, out, t, 0.015, 0.07 * v, 'bandpass', 2600);
};
export const talkingDrum = (ctx: Ctx, out: AudioNode, t: number, v = 1, f = 260, bend = 1.4) => {
  const g = ctx.createGain(); env(g, t, 0.4 * v, 0.004, 0.32); g.connect(out);
  const o = osc(ctx, 'sine', f, t, 0.4);
  o.frequency.exponentialRampToValueAtTime(f * bend, t + 0.14);
  o.frequency.exponentialRampToValueAtTime(f * 0.9, t + 0.34);
  o.connect(g);
  noiseHit(ctx, out, t, 0.02, 0.08 * v, 'bandpass', 1800);
};

// ---- bass ------------------------------------------------------------------
export const bass = (ctx: Ctx, out: AudioNode, t: number, midi: number, dur: number, v = 1) => {
  const f = mtof(midi);
  const g = ctx.createGain(); env(g, t, 0.5 * v, 0.008, Math.max(0.12, dur)); g.connect(out);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.connect(g);
  osc(ctx, 'triangle', f, t, dur + 0.1).connect(lp);
  const o2 = osc(ctx, 'sine', f / 2, t, dur + 0.1); const g2 = ctx.createGain(); g2.gain.value = 0.5; o2.connect(g2).connect(lp);
};
// The amapiano signature: a pitched, punchy log drum with a quick downward glide and a long tail.
export const logDrum = (ctx: Ctx, out: AudioNode, t: number, midi: number, dur: number, v = 1) => {
  const f = mtof(midi);
  const g = ctx.createGain(); env(g, t, 0.75 * v, 0.004, Math.max(0.2, dur));
  const ws = ctx.createWaveShaper();
  const curve = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = (i / 255) * 2 - 1; curve[i] = Math.tanh(x * 2.2); }
  ws.curve = curve;
  g.connect(ws).connect(out);
  osc(ctx, 'sine', f * 1.7, t, dur + 0.1, f, 0.045).connect(g);
  const o2 = osc(ctx, 'triangle', f * 2, t, 0.18, f * 2, 0.1); const g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2).connect(g);
};
export const sub808 = (ctx: Ctx, out: AudioNode, t: number, midi: number, dur: number, slideTo?: number, v = 1) => {
  const f = mtof(midi);
  const g = ctx.createGain(); env(g, t, 0.8 * v, 0.005, Math.max(0.3, dur));
  const ws = ctx.createWaveShaper();
  const curve = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = (i / 255) * 2 - 1; curve[i] = Math.tanh(x * 1.6); }
  ws.curve = curve; g.connect(ws).connect(out);
  const o = osc(ctx, 'sine', f, t, dur + 0.1);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(mtof(slideTo), t + Math.min(dur, 0.25));
  o.connect(g);
};

// ---- harmony and melody ------------------------------------------------------
export const ePiano = (ctx: Ctx, out: AudioNode, t: number, midi: number, dur: number, v = 1) => {
  const f = mtof(midi);
  const g = ctx.createGain(); env(g, t, 0.17 * v, 0.006, Math.max(0.25, dur)); g.connect(out);
  osc(ctx, 'sine', f, t, dur + 0.2).connect(g);
  const o2 = osc(ctx, 'sine', f * 2, t, 0.5); const g2 = ctx.createGain(); env(g2, t, 0.07 * v, 0.003, 0.35); o2.connect(g2).connect(g);
  const o3 = osc(ctx, 'sine', f * 4.01, t, 0.2); const g3 = ctx.createGain(); env(g3, t, 0.03 * v, 0.002, 0.12); o3.connect(g3).connect(g);
};
export const pluck = (ctx: Ctx, out: AudioNode, t: number, midi: number, dur = 0.25, v = 1, bright = 2600) => {
  const g = ctx.createGain(); env(g, t, 0.2 * v, 0.004, dur);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(bright, t); lp.frequency.exponentialRampToValueAtTime(500, t + dur);
  g.connect(lp).connect(out);
  osc(ctx, 'triangle', mtof(midi), t, dur + 0.1).connect(g);
  const o2 = osc(ctx, 'sawtooth', mtof(midi), t, dur); const g2 = ctx.createGain(); g2.gain.value = 0.25; o2.connect(g2).connect(g);
};
export const guitar = (ctx: Ctx, out: AudioNode, t: number, midi: number, dur = 0.3, v = 1) => pluck(ctx, out, t, midi, dur, 0.9 * v, 3400);
export const bell = (ctx: Ctx, out: AudioNode, t: number, midi: number, dur = 1.1, v = 1) => {
  const f = mtof(midi);
  [[1, 0.16], [2.76, 0.07], [5.4, 0.03]].forEach(([m, a]) => {
    const g = ctx.createGain(); env(g, t, a * v, 0.002, dur / (m > 2 ? 2 : 1)); g.connect(out);
    osc(ctx, 'sine', f * m, t, dur + 0.1).connect(g);
  });
};
export const whistle = (ctx: Ctx, out: AudioNode, t: number, midi: number, dur = 0.4, v = 1) => {
  const g = ctx.createGain(); env(g, t, 0.13 * v, 0.04, dur); g.connect(out);
  const o = osc(ctx, 'sine', mtof(midi), t, dur + 0.1);
  const lfo = osc(ctx, 'sine', 5.5, t, dur + 0.1); const d = ctx.createGain(); d.gain.value = 5; lfo.connect(d).connect(o.frequency);
  o.connect(g);
  noiseHit(ctx, out, t, dur * 0.8, 0.012 * v, 'bandpass', mtof(midi) * 2, 4, 0.05);
};
export const horn = (ctx: Ctx, out: AudioNode, t: number, midi: number, dur = 0.4, v = 1) => {
  const g = ctx.createGain(); env(g, t, 0.13 * v, 0.03, dur);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; g.connect(lp).connect(out);
  [0, 7].forEach(c => { const o = osc(ctx, 'sawtooth', mtof(midi) * 1, t, dur + 0.1); o.detune.value = c ? 6 : -6; o.connect(g); });
};
export const pad = (ctx: Ctx, out: AudioNode, t: number, midis: number[], dur: number, v = 1) => {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.06 * v, t + Math.min(0.5, dur * 0.4));
  g.gain.setValueAtTime(0.06 * v, t + Math.max(0.5, dur - 0.5));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
  g.connect(lp).connect(out);
  midis.forEach(m => [-7, 7].forEach(dt => { const o = osc(ctx, 'sawtooth', mtof(m), t, dur + 0.7); o.detune.value = dt; o.connect(g); }));
};
export const stab = (ctx: Ctx, out: AudioNode, t: number, midis: number[], dur = 0.12, v = 1, type: OscillatorType = 'square') => {
  const g = ctx.createGain(); env(g, t, 0.04 * v, 0.004, dur);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; g.connect(lp).connect(out);
  midis.forEach(m => osc(ctx, type, mtof(m), t, dur + 0.05).connect(g));
};
export const drone = (ctx: Ctx, out: AudioNode, t: number, midi: number, dur: number, v = 1) => {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07 * v, t + 0.4);
  g.gain.setValueAtTime(0.07 * v, t + Math.max(0.4, dur - 0.4)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; g.connect(lp).connect(out);
  osc(ctx, 'sawtooth', mtof(midi), t, dur + 0.4).connect(g);
  osc(ctx, 'sawtooth', mtof(midi) * 1.005, t, dur + 0.4).connect(g);
};
export const riser = (ctx: Ctx, out: AudioNode, t: number, dur = 1.6, v = 1) => {
  const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx);
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(7000, t + dur);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2 * v, t + dur); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.05);
  src.connect(f).connect(g).connect(out); src.start(t, 0.3); src.stop(t + dur + 0.1);
};
