import { cyrb53 } from '../engine/scores';
import { getSettings } from './settings';

// ===========================================================================
// THE FOUNDER'S MARK
//
// Ownership is built into the game, and found, not shown. Nothing here appears unless a player discovers it:
//   1. A secret phrase typed into Settings > Redeem a code (you can announce it whenever you decide to).
//   2. The old cheat-code keys on a keyboard: up up down down left right left right B A.
//   3. Tapping the masthead title twelve times in eight seconds (an accident waiting to happen on a phone).
//   4. A very rare mysterious fax on day 3 of a case (about 1 in 300 cases).
//   5. A cryptic note in the browser console, for the curious.
// The phrase itself is not in the source: only a salted SHA-256 of it. To change it, run:  npm run egg:hash -- "NEW PHRASE"
// and paste the result into SECRET_HASH below.
//
// To make ownership public, set CREDITS_PUBLIC to true, or set REVEAL_ON to a date (YYYY-MM-DD): from that day the credits
// are shown in Settings to everyone, with no discovery needed.
// ===========================================================================
// The name is stored encoded, so it does not show up in a text search of the shipped files.
const NAME_B64 = 'R2luZ2VyLUVrZSBDaGllbnllZ29t';
export const OWNER = { name: atob(NAME_B64), year: 2026, title: 'Founder and creator' };
export const CREDITS_PUBLIC = false;
export const REVEAL_ON: string | null = null;

const SALT = 'rumor-founder-v1:';
const SECRET_HASH = 'f33399f4773ba4abd2a3430752d78deee9408ec60dd3052570191572bd9cc5b9';

export const normalizeCode = (s: string): string => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

const sha256Hex = async (text: string): Promise<string | null> => {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch { return null; }
};

export const checkSecret = async (input: string): Promise<boolean> => {
  const norm = normalizeCode(input);
  if (!norm) return false;
  const h = await sha256Hex(SALT + norm);
  return h !== null && h === SECRET_HASH;
};

export const creditsVisible = (): boolean => {
  if (CREDITS_PUBLIC || getSettings().eggFound) return true;
  if (REVEAL_ON) { const d = new Date(REVEAL_ON + 'T00:00:00'); if (!Number.isNaN(d.getTime()) && Date.now() >= d.getTime()) return true; }
  return false;
};

// ---- discovery ----
export type EggSource = 'phrase' | 'konami' | 'taps' | 'fax';
const EVENT = 'rumor-egg';
export const triggerEgg = (source: EggSource) => { try { window.dispatchEvent(new CustomEvent(EVENT, { detail: source })); } catch { /* no window */ } };
export const onEgg = (fn: (source: EggSource) => void): (() => void) => {
  const h = (e: Event) => fn((e as CustomEvent<EggSource>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
};

// 12 taps within 8 seconds on the masthead
const taps: number[] = [];
export const eggTap = () => {
  const now = Date.now();
  taps.push(now);
  while (taps.length && now - taps[0] > 8000) taps.shift();
  if (taps.length >= 12) { taps.length = 0; triggerEgg('taps'); }
};

// the classic code, listened for once for the whole app
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
let konamiAt = 0;
let listening = false;
export const startEggListeners = () => {
  if (typeof window === 'undefined' || listening) return;
  listening = true;
  window.addEventListener('keydown', e => {
    const el = e.target as HTMLElement | null;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
    const k = e.key.toLowerCase();
    konamiAt = k === KONAMI[konamiAt] ? konamiAt + 1 : k === KONAMI[0] ? 1 : 0;
    if (konamiAt === KONAMI.length) { konamiAt = 0; triggerEgg('konami'); }
  });
  // For the curious. It names no one.
  try {
    console.log('%cI HEARD A RUMOR', 'font:900 22px Georgia,serif;color:#8B0000');
    console.log('%cSomebody signed this. The gist remembers who told it first.\nTwelve quick taps on the title, or a very old cheat code, will tell you more.', 'font:13px Georgia,serif;color:#444');
  } catch { /* console unavailable */ }
};

// a rare mysterious fax (once per page load, 1 in 300)
let faxChecked = false;
export const maybeFax = (): boolean => {
  if (faxChecked) return false;
  faxChecked = true;
  if (getSettings().eggFound) return false;
  return Math.random() < 1 / 300;
};
