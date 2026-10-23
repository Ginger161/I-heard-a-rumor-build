import {
  Track, TRACKS, chordNotes, getTrack, melodyForBar, noteFromDegree, parseHits
} from './library';
import * as S from './synth';

// Plays the library. A bar at a time is scheduled slightly ahead of the audio clock; changing song waits for the next bar
// and crossfades; changing energy takes effect from the next bar. The same renderBar() drives live play and the offline
// renders used by the tests, so what the tests measure is what players hear.
export const barSeconds = (t: Track) => (60 / t.bpm) * 4;

export const renderBar = (ctx: BaseAudioContext, dest: AudioNode, t: Track, bar: number, energy: number, t0: number) => {
  // Energy also sets the overall level of the bar, so a calm moment really is quieter than a climax.
  const out = ctx.createGain();
  out.gain.value = 0.72 + 0.38 * energy;
  out.connect(dest);
  const stepLen = 60 / t.bpm / 4;
  const at = (s: number) => t0 + s * stepLen + (s % 2 === 1 ? t.swing * stepLen : 0);
  const on = (layer: keyof Track['mins']) => energy >= (t.mins[layer] ?? 0);
  const g = t.gain;
  const fill = bar % 4 === 3 && t.fill;
  const d = { ...t.drums, ...(fill ? t.fill : {}) };
  const chord = t.prog[bar % t.prog.length];
  const rootNote = t.root + chord.r;

  if (on('kick')) parseHits(d.kick).forEach(h => S.kick(ctx, out, at(h.step), h.v * g, t.genre === 'drill' || t.genre === 'victory' ? false : t.bpm < 90));
  if (on('snare')) parseHits(d.snare).forEach(h => S.snare(ctx, out, at(h.step), h.v * g));
  if (on('clap')) parseHits(d.clap).forEach(h => S.clap(ctx, out, at(h.step), h.v * g));
  if (on('hat')) parseHits(d.hat).forEach(h => S.hat(ctx, out, at(h.step), h.v * g * (0.8 + 0.2 * energy)));
  if (on('ohat')) parseHits(d.ohat).forEach(h => S.hat(ctx, out, at(h.step), h.v * g, true));
  if (on('shaker')) parseHits(d.shaker).forEach(h => S.shaker(ctx, out, at(h.step), h.v * g));
  if (on('rim')) parseHits(d.rim).forEach(h => S.rim(ctx, out, at(h.step), h.v * g));
  if (on('congaH')) parseHits(d.congaH).forEach(h => S.conga(ctx, out, at(h.step), h.v * g, true));
  if (on('congaL')) parseHits(d.congaL).forEach(h => S.conga(ctx, out, at(h.step), h.v * g, false));
  if (on('talk')) parseHits(d.talk).forEach((h, i) => S.talkingDrum(ctx, out, at(h.step), h.v * g, i % 2 ? 230 : 300, i % 2 ? 1.25 : 1.5));

  if (t.bass && on('bass')) {
    t.bass.notes.forEach(([step, interval, len, slide]) => {
      const dur = len * stepLen;
      if (t.bass!.kind === 'log') S.logDrum(ctx, out, at(step), rootNote + 12 + interval, dur, g);
      else if (t.bass!.kind === '808') S.sub808(ctx, out, at(step), rootNote + interval, dur, slide !== undefined ? rootNote + slide : undefined, g);
      else S.bass(ctx, out, at(step), rootNote + 12 + interval, dur, g);
    });
  }

  if (t.keys && on('keys')) {
    const notes = chordNotes(t, bar, t.keys.oct);
    t.keys.steps.forEach((step, i) => {
      const len = (t.keys!.len ?? 1) * stepLen;
      switch (t.keys!.kind) {
        case 'epiano': notes.forEach((n, k) => S.ePiano(ctx, out, at(step) + k * 0.006, n, len, g * 0.8)); break;
        case 'stab': S.stab(ctx, out, at(step), notes, 0.11, g); break;
        case 'guitar': S.guitar(ctx, out, at(step), notes[i % notes.length] + 12, 0.28, g); break;
        case 'bell': S.bell(ctx, out, at(step), notes[i % notes.length] + 12, 1.0, g); break;
      }
    });
  }

  if (t.lead && on('lead')) {
    melodyForBar(t, bar).forEach(m => {
      const n = noteFromDegree(t, m.degree);
      const time = at(m.step);
      switch (t.lead!.kind) {
        case 'pluck': S.pluck(ctx, out, time, n, 0.3, g); break;
        case 'bell': S.bell(ctx, out, time, n, 0.9, g); break;
        case 'whistle': S.whistle(ctx, out, time, n, 0.45, g); break;
        case 'horn': S.horn(ctx, out, time, n, 0.35, g); break;
        case 'epiano': S.ePiano(ctx, out, time, n, 0.7, g * 0.9); break;
      }
    });
  }

  if (t.pad && on('pad')) S.pad(ctx, out, t0, chordNotes(t, bar, 2).slice(0, 4), barSeconds(t), g);
  if (t.drone && on('drone')) S.drone(ctx, out, t0, rootNote + 12, barSeconds(t), g);
  if (t.riser && on('riser') && bar % 4 === 3) S.riser(ctx, out, t0 + barSeconds(t) - 1.6, 1.6, g);
};

// The chain every track goes through: a gentle compressor, so a busy track can never clip the master.
export const buildChain = (ctx: BaseAudioContext, out: AudioNode): AudioNode => {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18; comp.knee.value = 10; comp.ratio.value = 6; comp.attack.value = 0.006; comp.release.value = 0.2;
  const trim = ctx.createGain(); trim.gain.value = 0.85;
  // A soft clipper as the last stop: whatever the mix does, the output can never exceed full scale.
  const clip = ctx.createWaveShaper();
  const curve = new Float32Array(1025);
  for (let i = 0; i < curve.length; i++) { const x = (i / 1024) * 2 - 1; curve[i] = (0.97 * Math.tanh(1.4 * x)) / Math.tanh(1.4); }
  clip.curve = curve;
  comp.connect(trim).connect(clip).connect(out);
  return comp;
};

export interface FileTrackDef { id: string; name: string; file: string; genre?: string; mood: Track['mood']; stations: Track['stations']; gain?: number }

export class MusicPlayer {
  private ctx: AudioContext | null = null;
  private chain: AudioNode | null = null;
  private current: { id: string; track?: Track; bus: GainNode; src?: AudioBufferSourceNode } | null = null;
  private pending: { id: string; file?: FileTrackDef } | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextBar = 0;
  private bar = 0;
  private energy = 0.4;
  private targetEnergy = 0.4;
  private files = new Map<string, FileTrackDef>();
  private buffers = new Map<string, AudioBuffer>();
  onChange?: (id: string | null) => void;
  silent = false;

  attach(ctx: AudioContext, out: AudioNode) {
    this.ctx = ctx;
    this.chain = buildChain(ctx, out);
  }

  registerFiles(list: FileTrackDef[]) { list.forEach(f => this.files.set(f.id, f)); }
  fileTracks(): FileTrackDef[] { return [...this.files.values()]; }
  get nowPlaying(): string | null { return this.current?.id ?? this.pending?.id ?? null; }

  setEnergy(e: number) { this.targetEnergy = Math.max(0, Math.min(1, e)); }

  /** Queue a song. It starts on the next bar boundary and crossfades from whatever is playing. */
  play(id: string) {
    if (this.current?.id === id && !this.pending) return;
    if (this.pending?.id === id) return;
    const file = this.files.get(id);
    if (!getTrack(id) && !file) return;
    this.pending = { id, file };
    if (file && !this.buffers.has(file.id)) void this.loadBuffer(file);
    this.ensureTimer();
  }

  stop(fade = 1.2) {
    this.pending = null;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.fadeOut(this.current, fade);
    this.current = null;
    this.onChange?.(null);
  }

  private async loadBuffer(f: FileTrackDef) {
    try {
      const res = await fetch(f.file);
      const data = await res.arrayBuffer();
      this.buffers.set(f.id, await this.ctx!.decodeAudioData(data));
    } catch { this.files.delete(f.id); if (this.pending?.id === f.id) this.pending = null; }
  }

  private fadeOut(c: MusicPlayer['current'], secs: number) {
    if (!c || !this.ctx) return;
    const t = this.ctx.currentTime;
    try { c.bus.gain.cancelScheduledValues(t); c.bus.gain.setValueAtTime(c.bus.gain.value, t); c.bus.gain.linearRampToValueAtTime(0.0001, t + secs); } catch { /* ignore */ }
    setTimeout(() => { try { c.src?.stop(); c.bus.disconnect(); } catch { /* already gone */ } }, (secs + 1.5) * 1000);
  }

  private ensureTimer() {
    if (this.timer || !this.ctx) return;
    this.nextBar = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.tick(), 120);
  }

  private startPending(startAt: number) {
    const ctx = this.ctx!;
    const p = this.pending!;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, startAt);
    bus.gain.linearRampToValueAtTime(1, startAt + (this.current ? 2.2 : 0.8));
    bus.connect(this.chain!);
    this.fadeOut(this.current, 2.2);
    if (p.file) {
      const buf = this.buffers.get(p.file.id);
      if (!buf) return false; // still loading: try again next tick
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const g = ctx.createGain(); g.gain.value = p.file.gain ?? 1; src.connect(g).connect(bus);
      src.start(startAt);
      this.current = { id: p.id, bus, src };
    } else {
      this.current = { id: p.id, track: getTrack(p.id)!, bus };
      this.bar = 0;
    }
    this.pending = null;
    this.onChange?.(p.id);
    return true;
  }

  private tick() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const lookahead = 1.6;
    let guard = 0;
    while (this.nextBar < ctx.currentTime + lookahead && guard++ < 4) {
      // Song changes happen on a bar boundary.
      if (this.pending && !(this.pending.file && !this.buffers.has(this.pending.file.id))) {
        const t0 = Math.max(this.nextBar, ctx.currentTime + 0.05);
        if (!this.startPending(t0)) { /* wait for the file to load */ }
      }
      const cur = this.current;
      if (!cur) { this.nextBar += 1; continue; }
      if (cur.track) {
        this.energy += (this.targetEnergy - this.energy) * 0.5;
        if (!this.silent) renderBar(ctx, cur.bus, cur.track, this.bar, this.energy, this.nextBar);
        this.nextBar += barSeconds(cur.track);
        this.bar++;
      } else {
        this.nextBar = ctx.currentTime + lookahead; // file tracks loop on their own
      }
    }
  }
}

export const trackIds = (): string[] => TRACKS.map(t => t.id);

// Renders a track offline for the tests and returns the raw samples.
export const renderOffline = async (id: string, bars: number, energy: number, sampleRate = 22050): Promise<Float32Array> => {
  const t = getTrack(id)!;
  const secs = bars * barSeconds(t) + 1.5;
  const ctx = new OfflineAudioContext(1, Math.ceil(secs * sampleRate), sampleRate);
  const chain = buildChain(ctx, ctx.destination);
  const bus = ctx.createGain(); bus.connect(chain);
  for (let b = 0; b < bars; b++) renderBar(ctx, bus, t, b, energy, b * barSeconds(t) + 0.05);
  const buf = await ctx.startRendering();
  return buf.getChannelData(0);
};
