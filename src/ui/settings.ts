import { useSyncExternalStore } from 'react';

// Player settings: one persisted object, one subscribe-able store. Everything here is a preference
// (never game state), so a corrupt or missing value just falls back to the default.
export const SETTINGS_KEY = 'rumor_settings_v1';

export type TextSize = 'S' | 'M' | 'L';
export type LayoutPref = 'auto' | 'mobile' | 'desktop';
export type MusicStyle = 'auto' | 'afrobeats' | 'amapiano' | 'chill' | 'street';
const MUSIC_STYLES: MusicStyle[] = ['auto', 'afrobeats', 'amapiano', 'chill', 'street'];

export interface Settings {
  master: number;        // 0..1
  music: number;
  sfx: number;
  ambient: number;
  playerName: string;      // shown on leaderboards
  crew: string;            // state, school or estate for crew boards
  layout: LayoutPref;      // 'auto' picks the desktop or mobile design by window size
  musicStyle: MusicStyle;  // which station the soundtrack draws from ('auto' follows the case)
  muted: boolean;
  haptics: boolean;
  reduceMotion: boolean; // no shake, confetti or pulsing overlays
  shake: boolean;
  vignette: boolean;     // heat/stale mood overlay
  highContrast: boolean;
  textSize: TextSize;
  hints: boolean;        // one-time contextual tips
  assist: boolean;       // Assist Mode: slower clock, capped rewards
  tutorialDone: boolean;
  seenHints: string[];
  reminders: boolean;      // the player opted in to daily reminders (push)
  remindersInterest: boolean; // asked to hear when reminders open
  eggFound: boolean;       // the founder's mark has been discovered on this device
}

export const DEFAULT_SETTINGS: Settings = {
  master: 0.8,
  music: 0.55,
  sfx: 0.9,
  ambient: 0.5,
  playerName: '',
  crew: '',
  layout: 'auto',
  musicStyle: 'auto',
  muted: false,
  haptics: true,
  reduceMotion: false,
  shake: true,
  vignette: true,
  highContrast: false,
  textSize: 'M',
  hints: true,
  assist: false,
  tutorialDone: false,
  seenHints: [],
  reminders: false,
  remindersInterest: false,
  eggFound: false
};

const unit = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);

export const sanitizeSettings = (raw: unknown): Settings => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof Settings, unknown>>;
  const d = DEFAULT_SETTINGS;
  return {
    master: unit(r.master, d.master),
    music: unit(r.music, d.music),
    sfx: unit(r.sfx, d.sfx),
    ambient: unit(r.ambient, d.ambient),
    playerName: typeof r.playerName === 'string' ? r.playerName.replace(/[\u0000-\u001f<>]/g, '').slice(0, 20) : '',
    crew: typeof r.crew === 'string' ? r.crew.replace(/[\u0000-\u001f<>]/g, '').slice(0, 20) : '',
    layout: r.layout === 'mobile' || r.layout === 'desktop' ? r.layout : 'auto',
    musicStyle: MUSIC_STYLES.find(m => m === r.musicStyle) ?? 'auto',
    muted: bool(r.muted, d.muted),
    haptics: bool(r.haptics, d.haptics),
    reduceMotion: bool(r.reduceMotion, d.reduceMotion),
    shake: bool(r.shake, d.shake),
    vignette: bool(r.vignette, d.vignette),
    highContrast: bool(r.highContrast, d.highContrast),
    textSize: r.textSize === 'S' || r.textSize === 'L' ? r.textSize : 'M',
    hints: bool(r.hints, d.hints),
    assist: bool(r.assist, d.assist),
    tutorialDone: bool(r.tutorialDone, d.tutorialDone),
    reminders: bool(r.reminders, d.reminders),
    remindersInterest: bool(r.remindersInterest, d.remindersInterest),
    eggFound: bool(r.eggFound, d.eggFound),
    seenHints: Array.isArray(r.seenHints) ? r.seenHints.filter((x): x is string => typeof x === 'string').slice(0, 200) : []
  };
};

const load = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return sanitizeSettings(JSON.parse(raw));
    // Migrate the old standalone mute flag.
    return { ...DEFAULT_SETTINGS, muted: localStorage.getItem('rumor_sfx_muted') === '1' };
  } catch { return { ...DEFAULT_SETTINGS }; }
};

let current: Settings = load();
const listeners = new Set<() => void>();

export const getSettings = (): Settings => current;

export const updateSettings = (patch: Partial<Settings>) => {
  current = sanitizeSettings({ ...current, ...patch });
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(current)); } catch { /* storage unavailable */ }
  applyToDocument(current);
  listeners.forEach(l => l());
};

export const resetSettings = () => updateSettings({ ...DEFAULT_SETTINGS, tutorialDone: current.tutorialDone, seenHints: current.seenHints, eggFound: current.eggFound, reminders: current.reminders, remindersInterest: current.remindersInterest, playerName: current.playerName, crew: current.crew });

export const subscribeSettings = (l: () => void): (() => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};

export const useSettings = (): Settings => useSyncExternalStore(subscribeSettings, getSettings, getSettings);

// Hints: each one shows once.
export const markHintSeen = (id: string) => {
  if (!current.seenHints.includes(id)) updateSettings({ seenHints: [...current.seenHints, id] });
};
export const shouldShowHint = (id: string): boolean => current.hints && current.tutorialDone && !current.seenHints.includes(id);

// Accessibility switches are CSS-driven, via attributes on <html>.
export function applyToDocument(s: Settings) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  el.dataset.motion = s.reduceMotion ? 'reduced' : 'full';
  el.dataset.text = s.textSize;
  el.dataset.contrast = s.highContrast ? 'high' : 'normal';
}
applyToDocument(current);

// The progress code lets a player move their profile between devices without any account.
export const exportProgressCode = (profileJson: string): string => {
  try { return btoa(unescape(encodeURIComponent(profileJson))); } catch { return ''; }
};
export const parseProgressCode = (code: string): unknown | null => {
  try { return JSON.parse(decodeURIComponent(escape(atob(code.trim())))); } catch { return null; }
};
