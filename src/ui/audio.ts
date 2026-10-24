import { useCallback, useSyncExternalStore } from 'react';
import { getSettings, subscribeSettings, updateSettings, useSettings, Settings } from './settings';
import { MusicContext, Pick, chooseTrack, energyFor } from './music/director';
import { MusicPlayer, FileTrackDef } from './music/player';
import { getTrack } from './music/library';

// Zero-asset audio, all synthesised with WebAudio: sound effects, a library of adaptive music (see ui/music) and ambient
// street / weather beds. Nothing here can throw into the game: every call is guarded and browsers that block or lack
// audio simply stay silent. Real recorded tracks can be added by listing them in public/music/index.json.
export type Sound = 'pop' | 'golden' | 'buy' | 'alert' | 'stamp' | 'warn' | 'win' | 'lose' | 'tick' | 'click' | 'combo' | 'whoosh' | 'hint' | 'step';
export type AmbientKind = 'street' | 'rain' | 'wind' | 'generator' | 'party' | 'queue';

type Ctor = typeof AudioContext;

const CLIMATE_AMBIENT: Record<string, AmbientKind> = {
  RAINY_SEASON: 'rain', HARMATTAN: 'wind', BLACKOUT_WEEK: 'generator', DETTY_DECEMBER: 'party', FUEL_SCARCITY: 'queue'
};
export const ambientForClimate = (climateId: string | null | undefined): AmbientKind => CLIMATE_AMBIENT[climateId ?? ''] ?? 'street';

const MIN_DWELL_MS = 45_000; // a song plays at least this long before a non-urgent change

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private ambBus!: GainNode;
  private noiseBuf: AudioBuffer | null = null;

  private ambient: AmbientKind | null = null;
  private activeAmbient: AmbientKind | null = null;
  private stopAmbient: (() => void) | null = null;
  private lastGestureHook = false;
  private gamePaused = false;

  readonly music = new MusicPlayer();
  private musicCtx: MusicContext | null = null;
  private musicSalt = 0;
  private lastScreen: string | null = null;
  private lastSwitch = 0;
  private audition: string | null = null;
  private lastStyle = getSettings().musicStyle;
  private listeners = new Set<() => void>();
  private manifestLoaded = false;

  constructor() {
    subscribeSettings(() => {
      this.applyVolumes();
      const style = getSettings().musicStyle;
      const changed = style !== this.lastStyle;
      this.lastStyle = style;
      this.updateMusic(changed);
    });
    this.music.onChange = () => this.listeners.forEach(l => l());
    this.hookGesture();
  }

  get muted(): boolean { return getSettings().muted; }
  get nowPlaying(): string | null { return this.music.nowPlaying; }
  subscribe(l: () => void) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }

  // ---- context ------------------------------------------------------------
  private hookGesture() {
    if (this.lastGestureHook || typeof window === 'undefined') return;
    this.lastGestureHook = true;
    const unlock = () => { this.ensure(); this.sync(true); };
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.visibilityState === 'hidden') void this.ctx.suspend();
      else if (!getSettings().muted && !this.gamePaused) void this.ctx.resume();
    });
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const C: Ctor | undefined = window.AudioContext || (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
        if (!C) return null;
        this.ctx = new C();
        this.master = this.ctx.createGain();
        this.sfxBus = this.ctx.createGain();
        this.musicBus = this.ctx.createGain();
        this.ambBus = this.ctx.createGain();
        this.sfxBus.connect(this.master);
        this.musicBus.connect(this.master);
        this.ambBus.connect(this.master);
        this.master.connect(this.ctx.destination);
        this.music.attach(this.ctx, this.musicBus);
        this.applyVolumes();
        void this.loadManifest();
      }
      if (this.ctx.state === 'suspended' && !this.gamePaused) void this.ctx.resume();
      return this.ctx;
    } catch { return null; }
  }

  private live(): AudioContext | null {
    if (getSettings().muted) return null;
    const ctx = this.ensure();
    return ctx && ctx.state === 'running' ? ctx : null;
  }

  private applyVolumes() {
    if (!this.ctx) return;
    const s: Settings = getSettings();
    const t = this.ctx.currentTime;
    const set = (g: GainNode, v: number) => { try { g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(v, t, 0.05); } catch { /* ignore */ } };
    set(this.master, s.muted ? 0 : s.master);
    set(this.sfxBus, s.sfx);
    set(this.musicBus, s.music * 0.7);
    set(this.ambBus, s.ambient * 0.5);
    this.music.silent = s.muted || s.music <= 0;
  }

  // ---- sound effects ------------------------------------------------------
  private tone(freq: number, dur: number, type: OscillatorType, vol: number, delay = 0, slideTo?: number, bus?: GainNode) {
    const ctx = this.live();
    if (!ctx) return;
    try {
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(bus ?? this.sfxBus);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch { /* audio unavailable */ }
  }

  private noiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuf) {
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    }
    return this.noiseBuf;
  }

  private noise(dur: number, vol: number, freq = 1200, delay = 0, bus?: GainNode) {
    const ctx = this.live();
    if (!ctx) return;
    try {
      const t0 = ctx.currentTime + delay;
      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      filter.type = 'bandpass';
      filter.frequency.value = freq;
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.buffer = this.noiseBuffer(ctx);
      src.connect(filter).connect(gain).connect(bus ?? this.sfxBus);
      src.start(t0, Math.random());
      src.stop(t0 + dur + 0.02);
    } catch { /* audio unavailable */ }
  }

  play(sound: Sound, level = 0) {
    switch (sound) {
      case 'pop': this.tone(700, 0.09, 'sine', 0.16, 0, 1500); this.noise(0.04, 0.05, 3000); break;
      case 'golden': [880, 1175, 1480, 1760].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.14, i * 0.06)); break;
      case 'buy': this.tone(520, 0.07, 'square', 0.07); this.tone(780, 0.12, 'square', 0.07, 0.07); break;
      case 'alert': this.noise(0.18, 0.12, 900); this.tone(330, 0.1, 'sine', 0.08, 0.02); break;
      case 'whoosh': this.noise(0.22, 0.09, 600); break;
      case 'stamp': this.tone(110, 0.16, 'sine', 0.28, 0, 60); this.noise(0.05, 0.12, 500); break;
      case 'warn': [440, 330, 440, 330].forEach((f, i) => this.tone(f, 0.11, 'square', 0.07, i * 0.13)); break;
      case 'win': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.14, i * 0.11)); break;
      case 'lose': [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.24, 'sawtooth', 0.09, i * 0.2)); break;
      case 'tick': this.tone(220, 0.03, 'sine', 0.04); break;
      case 'click': this.tone(900, 0.025, 'square', 0.05); break;
      case 'combo': this.tone(600 + Math.min(level, 8) * 110, 0.1, 'triangle', 0.14); break;
      case 'hint': this.tone(660, 0.08, 'sine', 0.09); this.tone(990, 0.12, 'sine', 0.09, 0.07); break;
      case 'step': this.tone(784, 0.07, 'triangle', 0.1); this.tone(1175, 0.14, 'triangle', 0.1, 0.06); break;
    }
  }

  /** The game is paused: everything (music, ambience, effects) stops where it is, and carries on from there when play resumes. */
  setGamePaused(paused: boolean) {
    if (this.gamePaused === paused) return;
    this.gamePaused = paused;
    const ctx = this.ctx;
    if (!ctx) return;
    if (paused) { void ctx.suspend(); return; }
    if (getSettings().muted) return;
    void ctx.resume().then(() => { this.updateMusic(false); this.sync(); });
  }

  // ---- music ----------------------------------------------------------------
  /** Tell the engine what is happening; it chooses the song and the intensity. Safe to call before the first user gesture. */
  setMusic(c: MusicContext, salt = 0) {
    this.musicCtx = c;
    this.musicSalt = salt;
    this.updateMusic(false);
  }

  private async loadManifest() {
    if (this.manifestLoaded) return;
    this.manifestLoaded = true;
    try {
      const res = await fetch('./music/index.json', { cache: 'no-cache' });
      if (!res.ok) return;
      const json = (await res.json()) as { tracks?: FileTrackDef[] };
      const list = (json.tracks ?? []).filter(t => t && typeof t.id === 'string' && typeof t.file === 'string' && !getTrack(t.id)).map(t => ({ ...t, file: './music/' + t.file.replace(/^\.?\/?/, '') }));
      this.music.registerFiles(list);
    } catch { /* no recorded tracks published: the synthesised library carries on */ }
  }

  // A recorded track of the same mood (and station) replaces the synthesised pick about half the time.
  private resolve(pick: Pick): string {
    const synth = getTrack(pick.trackId);
    if (!synth) return pick.trackId;
    const style = getSettings().musicStyle;
    const files = this.music.fileTracks().filter(f => f.mood === synth.mood && (style === 'auto' || f.stations.includes(style)));
    if (files.length && this.musicSalt % 2 === 0) return files[this.musicSalt % files.length].id;
    return pick.trackId;
  }

  private updateMusic(force: boolean) {
    const c = this.musicCtx;
    const ctx = this.ctx;
    if (!c || !ctx || ctx.state !== 'running' || this.audition) return;
    const pick = chooseTrack(c, getSettings().musicStyle, this.musicSalt);
    const id = this.resolve(pick);
    const urgent = this.lastScreen !== c.screen || ['critical', 'danger', 'victory', 'defeat'].includes(pick.reason);
    const now = Date.now();
    if (id !== this.music.nowPlaying && (urgent || force || now - this.lastSwitch > MIN_DWELL_MS)) {
      this.music.play(id);
      this.lastSwitch = now;
    }
    this.lastScreen = c.screen;
    this.music.setEnergy(energyFor(c));
  }

  /** Jukebox: play one song regardless of the game. Pass null to hand control back to the director. */
  auditionTrack(id: string | null) {
    this.ensure();
    this.audition = id;
    if (id) { this.music.setEnergy(0.8); this.music.play(id); }
    else { this.lastScreen = null; this.updateMusic(true); }
    this.listeners.forEach(l => l());
  }
  get auditioning(): string | null { return this.audition; }

  // ---- ambient beds -----------------------------------------------------------
  private buildAmbient(kind: AmbientKind): (() => void) | null {
    const ctx = this.ctx;
    if (!ctx) return null;
    const nodes: AudioScheduledSourceNode[] = [];
    const timers: ReturnType<typeof setInterval>[] = [];
    const out = ctx.createGain();
    out.gain.value = 0.0001;
    out.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
    out.connect(this.ambBus);

    const loopNoise = (type: BiquadFilterType, freq: number, gain: number, q = 0.7) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(ctx);
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.value = gain;
      src.connect(f).connect(g).connect(out);
      src.start();
      nodes.push(src);
      return f;
    };
    const osc = (type: OscillatorType, freq: number, gain: number, lowpass = 400) => {
      const o = ctx.createOscillator();
      o.type = type; o.frequency.value = freq;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lowpass;
      const g = ctx.createGain(); g.gain.value = gain;
      o.connect(f).connect(g).connect(out);
      o.start();
      nodes.push(o);
      return o;
    };

    // Every bed has the distant city under it.
    loopNoise('lowpass', 380, 0.5);
    const murmur = setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      this.noise(0.5 + Math.random() * 0.6, 0.12, 500 + Math.random() * 700, 0, out);
    }, 1800);
    timers.push(murmur);
    if (kind === 'street' || kind === 'queue') {
      timers.push(setInterval(() => { // distant horn
        if (Math.random() < 0.35) this.tone(300 + Math.random() * 120, 0.22, 'square', 0.03, 0, undefined, out);
      }, 5200));
    }
    if (kind === 'rain') loopNoise('highpass', 3200, 0.45);
    if (kind === 'wind') {
      const f = loopNoise('bandpass', 700, 0.6, 1.2);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
      const depth = ctx.createGain(); depth.gain.value = 380;
      lfo.connect(depth).connect(f.frequency); lfo.start(); nodes.push(lfo);
    }
    if (kind === 'generator') {
      osc('sawtooth', 48, 0.5, 300);
      const o2 = osc('square', 96, 0.12, 240);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 3.1;
      const depth = ctx.createGain(); depth.gain.value = 2;
      lfo.connect(depth).connect(o2.frequency); lfo.start(); nodes.push(lfo);
    }
    if (kind === 'queue') osc('sawtooth', 38, 0.3, 200);
    if (kind === 'party') {
      timers.push(setInterval(() => this.tone(75, 0.2, 'sine', 0.35, 0, 40, out), 60000 / 118));
    }

    return () => {
      try {
        out.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25);
        timers.forEach(clearInterval);
        setTimeout(() => nodes.forEach(n => { try { n.stop(); } catch { /* already stopped */ } }), 1200);
      } catch { /* ignore */ }
    };
  }

  /** Which ambient bed to play (null for none). */
  setAmbient(kind: AmbientKind | null) { this.ambient = kind; this.sync(); }

  private sync(force = false) {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    this.updateMusic(force);
    if (this.activeAmbient !== this.ambient) {
      this.stopAmbient?.();
      this.stopAmbient = null;
      this.activeAmbient = this.ambient;
      if (this.ambient) this.stopAmbient = this.buildAmbient(this.ambient);
    }
  }

  /** For the settings sliders: play a short sample on the channel being adjusted. */
  preview(channel: 'sfx' | 'music' | 'ambient') {
    this.ensure();
    if (channel === 'sfx') this.play('pop');
    else if (channel === 'music') [57, 60, 64].forEach((n, i) => this.tone(440 * Math.pow(2, (n - 69) / 12), 0.3, 'triangle', 0.2, i * 0.08, undefined, this.musicBus));
    else this.noise(0.6, 0.35, 700, 0, this.ambBus);
  }

  setMuted(muted: boolean) { updateSettings({ muted }); }
}

export const sfx = new AudioEngine();

export const haptic = (pattern: number | number[]) => {
  try {
    if (!getSettings().haptics || typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    // Browsers block vibration until the user has interacted with the page; skip quietly until then.
    const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (activation && !activation.hasBeenActive) return;
    navigator.vibrate(pattern);
  } catch { /* vibration unavailable */ }
};

// React binding for the mute toggle (kept for the quick-mute buttons).
export const useSfxMuted = (): [boolean, (muted: boolean) => void] => {
  const { muted } = useSettings();
  const set = useCallback((m: boolean) => updateSettings({ muted: m }), []);
  return [muted, set];
};

// React binding for "now playing" (the Jukebox).
export const useNowPlaying = (): { id: string | null; auditioning: string | null } => {
  const id = useSyncExternalStore(l => sfx.subscribe(l), () => sfx.nowPlaying, () => null);
  const auditioning = useSyncExternalStore(l => sfx.subscribe(l), () => sfx.auditioning, () => null);
  return { id, auditioning };
};

// Dev-only handle for browser tests.
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __sfx?: AudioEngine }).__sfx = sfx;
