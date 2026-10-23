import type { GameState } from './types';
import { getTarget, TARGETS, SCANDAL_CATEGORIES } from './data/targets';
import { CLIMATES } from './data/climates';
import type { ScandalCategory } from './data/channels';

// ===========================================================================
// OFFLINE LEADERBOARDS AND CHALLENGES
//
// There is no server. A score is a small signed code (or a link carrying it). Players pass codes around WhatsApp, X or
// Instagram; opening a link or pasting a code adds the score to the board on that device. Board codes carry a whole
// board, so a group's board spreads from phone to phone. A "challenge" is the same idea for a case: the code holds the
// Target, scandal, climate and random seed, so a friend plays the identical case and tries to beat the score.
//
// Honest limits: the signature stops casual editing, but anyone willing to read this source can forge a code. A
// tamper-proof global board needs a server that re-checks results; the ScoreStore interface below is where one would plug in.
// ===========================================================================
const SECRET = 'rumor-v1|gist-travels-faster-than-fuel';

export const cyrb53 = (str: string, seed = 0): number => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
const sign = (payload: string): string => cyrb53(payload + SECRET).toString(36);

const b64 = {
  enc: (s: string): string => {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  dec: (s: string): string => {
    const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
    const bin = atob(pad);
    return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
  }
};

export type ScoreKind = 'daily' | 'challenge' | 'run' | 'story';

export interface ScoreEntry {
  pid: string;        // player id (random, per device)
  name: string;
  crew: string;       // state, school, estate... shown on crew boards
  kind: ScoreKind;
  key: string;        // daily date, or challenge id, or ''
  targetId: string;
  target: string;     // display name at the time
  score: number;
  stars: number;
  day: number;
  budget: number;
  heat: number;
  backfires: number;
  assisted: boolean;
  at: number;         // ms
  sig: string;
}

const clean = (s: unknown, max: number): string =>
  String(s ?? '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);

const core = (e: Omit<ScoreEntry, 'sig'>): string =>
  [e.pid, e.name, e.crew, e.kind, e.key, e.targetId, e.score, e.stars, e.day, e.budget, e.heat, e.backfires, e.assisted ? 1 : 0, e.at].join('|');

export const entryId = (e: ScoreEntry): string => e.sig;

// One number to rank by: faster, cooler and cleaner is better. Assist Mode counts for half, so it can never top a fair run.
export const computeScore = (s: GameState, stars: number): number => {
  if (s.status !== 'WON') return 0;
  const day = Math.min(s.currentDay, s.dayBudget);
  const raw = stars * 1000 + Math.round((1 - day / s.dayBudget) * 800) + Math.round((100 - Math.min(100, s.peakHeat)) * 4) - s.backfires * 150;
  return Math.max(0, Math.min(9999, Math.round(s.assisted ? raw * 0.5 : raw)));
};

export const makeEntry = (s: GameState, stars: number, who: { pid: string; name: string; crew: string }): ScoreEntry => {
  const target = getTarget(s.activeTargetId);
  const kind: ScoreKind = s.dailyKey ? 'daily' : s.challenge ? 'challenge' : s.storyId ? 'story' : 'run';
  const base: Omit<ScoreEntry, 'sig'> = {
    pid: clean(who.pid, 24), name: clean(who.name, 20) || 'Anonymous', crew: clean(who.crew, 20), kind,
    key: s.dailyKey ?? s.challenge?.id ?? '', targetId: target.id, target: clean(target.shortName, 40),
    score: computeScore(s, stars), stars, day: Math.min(s.currentDay, s.dayBudget), budget: s.dayBudget,
    heat: Math.round(s.peakHeat), backfires: s.backfires, assisted: s.assisted, at: Date.now()
  };
  return { ...base, sig: sign(core(base)) };
};

export const verifyEntry = (e: unknown): e is ScoreEntry => {
  const x = e as Partial<ScoreEntry> | null;
  if (!x || typeof x !== 'object') return false;
  if (typeof x.pid !== 'string' || typeof x.name !== 'string' || typeof x.crew !== 'string' || typeof x.key !== 'string' || typeof x.targetId !== 'string' || typeof x.target !== 'string' || typeof x.sig !== 'string') return false;
  if (!['daily', 'challenge', 'run', 'story'].includes(x.kind as string)) return false;
  const n = (v: unknown, lo: number, hi: number) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
  if (!n(x.score, 0, 9999) || !n(x.stars, 0, 3) || !n(x.day, 1, 99) || !n(x.budget, 1, 99) || !n(x.heat, 0, 100) || !n(x.backfires, 0, 99) || !n(x.at, 1e12, 4e12)) return false;
  if (typeof x.assisted !== 'boolean' || x.name.length > 20 || x.crew.length > 20 || x.pid.length > 24 || x.target.length > 40) return false;
  const { sig, ...rest } = x as ScoreEntry;
  return sign(core(rest)) === sig;
};

// ---- codes and links ----
export const encodeEntry = (e: ScoreEntry): string => 'RUM1.' + b64.enc(JSON.stringify(e));
export const encodeBoard = (list: ScoreEntry[]): string => 'RUMB.' + b64.enc(JSON.stringify(list.slice(0, 25)));

// Accepts a code, or a whole link containing ?s=CODE. Returns only entries whose signature checks out.
export const decodeScores = (input: string): ScoreEntry[] => {
  try {
    let code = input.trim();
    const m = /[?&]s=([^&#\s]+)/.exec(code);
    if (m) code = decodeURIComponent(m[1]);
    if (code.startsWith('RUM1.')) { const e = JSON.parse(b64.dec(code.slice(5))); return verifyEntry(e) ? [e] : []; }
    if (code.startsWith('RUMB.')) { const arr = JSON.parse(b64.dec(code.slice(5))); return Array.isArray(arr) ? arr.slice(0, 25).filter(verifyEntry) : []; }
  } catch { /* not a code */ }
  return [];
};

// ---- challenges ----
export interface Challenge {
  t: string;               // target id
  k: ScandalCategory;
  c: string;               // climate id
  s: number;               // random seed
  by: string;              // who set it
  sc: number;              // score to beat
  st: number;              // stars they got
  d: number;               // days they took
  sig: string;
}
const chCore = (c: Omit<Challenge, 'sig'>): string => [c.t, c.k, c.c, c.s, c.by, c.sc, c.st, c.d].join('|');

export const makeChallenge = (s: GameState, stars: number, by: string): Challenge | null => {
  if (s.status !== 'WON' || s.seed === null || s.training) return null;
  const base: Omit<Challenge, 'sig'> = { t: s.activeTargetId!, k: s.scandalCategory, c: s.climateId, s: s.seed, by: clean(by, 20) || 'A friend', sc: computeScore(s, stars), st: stars, d: Math.min(s.currentDay, s.dayBudget) };
  return { ...base, sig: sign(chCore(base)) };
};
export const encodeChallenge = (c: Challenge): string => 'RUMC.' + b64.enc(JSON.stringify(c));
export const challengeId = (c: Challenge): string => cyrb53(c.sig).toString(36);

export const decodeChallenge = (input: string): Challenge | null => {
  try {
    let code = input.trim();
    const m = /[?&]c=([^&#\s]+)/.exec(code);
    if (m) code = decodeURIComponent(m[1]);
    if (!code.startsWith('RUMC.')) return null;
    const c = JSON.parse(b64.dec(code.slice(5))) as Challenge;
    const target = TARGETS.find(t => t.id === c.t);
    const n = (v: unknown, lo: number, hi: number) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
    if (!target || !SCANDAL_CATEGORIES.includes(c.k) || !target.scandals.some(sd => sd.category === c.k)) return null;
    if (!CLIMATES.some(cl => cl.id === c.c) || !n(c.s, 0, 2147483647) || !Number.isInteger(c.s) || !n(c.sc, 0, 9999) || !n(c.st, 0, 3) || !n(c.d, 1, 99)) return null;
    if (typeof c.by !== 'string' || c.by.length > 20 || typeof c.sig !== 'string') return null;
    const { sig, ...rest } = c;
    return sign(chCore(rest)) === sig ? c : null;
  } catch { return null; }
};

// ---- boards ----
export interface Ranked { rank: number; entry: ScoreEntry }

const rankList = (list: ScoreEntry[]): Ranked[] =>
  [...list].sort((a, b) => b.score - a.score || a.at - b.at).map((entry, i) => ({ rank: i + 1, entry }));

// One line per player: their best score in the set.
export const bestPerPlayer = (list: ScoreEntry[]): ScoreEntry[] => {
  const best = new Map<string, ScoreEntry>();
  list.forEach(e => { const cur = best.get(e.pid); if (!cur || e.score > cur.score || (e.score === cur.score && e.at < cur.at)) best.set(e.pid, e); });
  return [...best.values()];
};

export const dailyBoard = (all: ScoreEntry[], dateKey: string): Ranked[] => rankList(bestPerPlayer(all.filter(e => e.kind === 'daily' && e.key === dateKey && e.score > 0)));
export const challengeBoard = (all: ScoreEntry[], id: string): Ranked[] => rankList(bestPerPlayer(all.filter(e => e.kind === 'challenge' && e.key === id && e.score > 0)));
export const weekBoard = (all: ScoreEntry[], now = Date.now()): Ranked[] => rankList(bestPerPlayer(all.filter(e => now - e.at < 7 * 86400000 && e.score > 0)));
export const allTimeBoard = (all: ScoreEntry[]): Ranked[] => rankList(bestPerPlayer(all.filter(e => e.score > 0)));

export interface CrewRow { crew: string; players: number; score: number }
// A crew's score is the average of its best players (up to five), so a big crew cannot win just by being big.
export const crewBoard = (all: ScoreEntry[]): CrewRow[] => {
  const byCrew = new Map<string, ScoreEntry[]>();
  bestPerPlayer(all.filter(e => e.score > 0 && e.crew)).forEach(e => { const k = e.crew.toLowerCase(); byCrew.set(k, [...(byCrew.get(k) ?? []), e]); });
  return [...byCrew.values()].map(list => {
    const top = list.sort((a, b) => b.score - a.score).slice(0, 5);
    return { crew: top[0].crew, players: list.length, score: Math.round(top.reduce((a, e) => a + e.score, 0) / top.length) };
  }).sort((a, b) => b.score - a.score);
};

// ---- storage, behind an interface so a server can replace it later ----
export interface ScoreStore { load(): ScoreEntry[]; add(list: ScoreEntry[]): { added: number; entries: ScoreEntry[] } }

const KEY = 'rumor_scores_v1';
const MAX_ENTRIES = 600;

export const localScoreStore: ScoreStore = {
  load: () => {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter(verifyEntry) : [];
    } catch { return []; }
  },
  add: list => {
    const cur = localScoreStore.load();
    const seen = new Set(cur.map(entryId));
    const fresh = list.filter(e => verifyEntry(e) && !seen.has(e.sig));
    const next = [...cur, ...fresh].sort((a, b) => b.at - a.at).slice(0, MAX_ENTRIES);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
    return { added: fresh.length, entries: next };
  }
};

export const PID_KEY = 'rumor_player_id';
export const playerId = (): string => {
  try {
    let id = localStorage.getItem(PID_KEY);
    if (!id) { id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); localStorage.setItem(PID_KEY, id); }
    return id;
  } catch { return 'anon'; }
};
