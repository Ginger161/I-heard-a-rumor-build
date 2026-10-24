// THE ARENA: player-made Targets. This file holds what a player has made and collected, the share codes that carry a Target from one
// phone to another, and the points (Brown Envelopes) it costs to publish one. There is no server yet: everything lives on the device.
// A Target from a code is never trusted: it is validated and the bot check is run on it again, so a faked rating means nothing.
import { PACK_SCHEMA_VERSION, TargetDef, builtInIds, registerPack, unregisterPack, validateTargetDef } from './data/targetPacks';
import type { Tier } from './data/targetTypes';
import type { BotReport } from './botCheck';
import { defaultAbility } from './data/arenaPresets';
import { isWiping } from './wipe';

export const ARENA_KEY = 'rumor_arena_v1';
export const MINE_PACK = 'arena_mine';
export const SHELF_PACK = 'arena_shelf';

/** What the bot check said, kept with the Target (the full thirty-plan table is not stored). */
export interface CheckSummary {
  rating: number; difficulty: number; best: number; breadth: number; tier: Tier;
  verdict: BotReport['verdict']; bestPlan: string; tips: string[]; at: number;
}
export interface ArenaEntry {
  def: TargetDef;
  check?: CheckSummary;
  published: boolean;       // passed the bot check as fair and the fee was paid: it can be shared
  createdAt: number;
  updatedAt: number;
}
export interface ArenaResult { plays: number; wins: number; bestDay: number | null; rewarded: boolean }
export interface ArenaData { mine: ArenaEntry[]; shelf: ArenaEntry[]; results: Record<string, ArenaResult> }

export const summarize = (r: BotReport): CheckSummary => ({
  rating: r.rating, difficulty: r.difficulty, best: r.best, breadth: r.breadth, tier: r.tier, verdict: r.verdict, bestPlan: r.bestPlan, tips: r.tips.slice(0, 5), at: Date.now()
});

// ---- points -------------------------------------------------------------------------------------------------------------
/** Brown Envelopes for beating a Target someone else made (once per Target). */
export const ARENA_WIN_REWARD = 8;
/** What publishing costs: a base fee, plus 1 per difficulty point, 5 per power beyond the first and 4 per scheduled event. */
export const BASE_FEE = 20;
export const creationFee = (def: TargetDef, check: Pick<CheckSummary, 'difficulty'> | undefined): number =>
  BASE_FEE + Math.round(check?.difficulty ?? 0) + 5 * Math.max(0, def.abilities.length - 1) + 4 * (def.occurrences?.length ?? 0);

// ---- storage and store --------------------------------------------------------------------------------------------------
const hashString = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

const empty = (): ArenaData => ({ mine: [], shelf: [], results: {} });

const sanitizeEntry = (raw: unknown): ArenaEntry | null => {
  const e = raw as ArenaEntry;
  if (!e || typeof e !== 'object' || !e.def || typeof e.def.id !== 'string') return null;
  return { def: { ...e.def, kind: 'PLAYER', enabled: true }, check: e.check, published: !!e.published, createdAt: Number(e.createdAt) || Date.now(), updatedAt: Number(e.updatedAt) || Date.now() };
};

export const loadArena = (): ArenaData => {
  try {
    const raw = JSON.parse(localStorage.getItem(ARENA_KEY) || 'null') as Partial<ArenaData> | null;
    if (!raw) return empty();
    const clean = (l: unknown) => (Array.isArray(l) ? (l.map(sanitizeEntry).filter(Boolean) as ArenaEntry[]) : []);
    return { mine: clean(raw.mine), shelf: clean(raw.shelf), results: raw.results && typeof raw.results === 'object' ? raw.results : {} };
  } catch { return empty(); }
};

let data: ArenaData = empty();
let loaded = false;
let version = 0;
const listeners = new Set<() => void>();
export const subscribeArena = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const getArenaVersion = () => version;
export const getArena = (): ArenaData => { if (!loaded) { data = loadArena(); loaded = true; } return data; };

const ratedDef = (e: ArenaEntry): TargetDef => ({ ...e.def, kind: 'PLAYER', enabled: true, prRating: e.check?.rating ?? e.def.prRating });

/** Puts the player's own Targets and the shelf into the game's roster, so they can be played like any other Target. */
export const registerArena = () => {
  const d = getArena();
  [[MINE_PACK, d.mine], [SHELF_PACK, d.shelf]].forEach(([packId, list]) => {
    const entries = list as ArenaEntry[];
    if (entries.length === 0) { unregisterPack(packId as string, false); return; }
    registerPack({ schema: PACK_SCHEMA_VERSION, packId: packId as string, name: packId === MINE_PACK ? 'My Arena Targets' : 'Arena shelf', author: 'players', version: 1, targets: entries.map(ratedDef) });
  });
};

export const updateArena = (fn: (d: ArenaData) => ArenaData) => {
  data = fn(getArena());
  if (!isWiping()) try { localStorage.setItem(ARENA_KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
  registerArena();
  version++;
  listeners.forEach(l => l());
};

export const newArenaId = (): string => `a_${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;

export const upsertMine = (entry: ArenaEntry) => updateArena(d => ({ ...d, mine: d.mine.some(e => e.def.id === entry.def.id) ? d.mine.map(e => (e.def.id === entry.def.id ? entry : e)) : [entry, ...d.mine] }));
export const removeEntry = (id: string) => updateArena(d => ({ ...d, mine: d.mine.filter(e => e.def.id !== id), shelf: d.shelf.filter(e => e.def.id !== id) }));
export const findEntry = (id: string): ArenaEntry | undefined => { const d = getArena(); return d.mine.find(e => e.def.id === id) ?? d.shelf.find(e => e.def.id === id); };

/** Records a finished Arena match. Returns the envelopes earned (the first win against each Target only). */
export const recordArenaMatch = (id: string, won: boolean, day: number): number => {
  let reward = 0;
  updateArena(d => {
    const r = d.results[id] ?? { plays: 0, wins: 0, bestDay: null, rewarded: false };
    const first = won && !r.rewarded;
    if (first) reward = ARENA_WIN_REWARD;
    return { ...d, results: { ...d.results, [id]: { plays: r.plays + 1, wins: r.wins + (won ? 1 : 0), bestDay: won ? Math.min(r.bestDay ?? 999, day) : r.bestDay, rewarded: r.rewarded || first } } };
  });
  return reward;
};

// ---- share codes --------------------------------------------------------------------------------------------------------
// A code is the Target as compact JSON (squeezed with the browser's deflate when it has one), in base64url, with a short prefix.
const toB64 = (bytes: Uint8Array): string => { let s = ''; bytes.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const fromB64 = (t: string): Uint8Array => { const b = atob(t.replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, c => c.charCodeAt(0)); };
const pipe = async (bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> => {
  const out = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream as unknown as ReadableWritablePair<Uint8Array, Uint8Array>));
  return new Uint8Array(await out.arrayBuffer());
};
const MAX_CODE = 24_000;

export const encodeTarget = async (def: TargetDef): Promise<string> => {
  const slim: TargetDef = { ...def, kind: 'PLAYER', enabled: true, avatar: { silhouette: def.avatar.silhouette, accent: def.avatar.accent } };
  const bytes = new TextEncoder().encode(JSON.stringify({ v: 1, d: slim }));
  try {
    if (typeof CompressionStream !== 'undefined') return `RUMT1.${toB64(await pipe(bytes, new CompressionStream('deflate-raw')))}`;
  } catch { /* fall back to plain */ }
  return `RUMT0.${toB64(bytes)}`;
};

export interface Decoded { def: TargetDef | null; errors: string[] }

export const decodeTarget = async (input: string): Promise<Decoded> => {
  const m = /RUMT([01])\.([A-Za-z0-9_-]+)/.exec(input.trim().replace(/\s+/g, ''));
  if (!m) return { def: null, errors: ['That does not look like a Target code.'] };
  if (m[2].length > MAX_CODE) return { def: null, errors: ['That code is too long to be a Target.'] };
  try {
    let bytes = fromB64(m[2]);
    if (m[1] === '1') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as { v?: number; d?: TargetDef };
    if (parsed.v !== 1 || !parsed.d) return { def: null, errors: ['This code is from a version of the game I do not understand.'] };
    // The sender's id is never trusted: it comes from the content, so the same Target always gets the same id on any phone.
    const id = `s_${hashString(JSON.stringify({ ...parsed.d, id: '' })).toString(36)}`;
    const def: TargetDef = { ...parsed.d, id, kind: 'PLAYER', enabled: true, avatar: { silhouette: parsed.d.avatar?.silhouette, accent: parsed.d.avatar?.accent } as TargetDef['avatar'] };
    const v = validateTargetDef(def, { builtInIds: builtInIds() });
    if (v.errors.length) return { def: null, errors: v.errors.slice(0, 4) };
    return { def, errors: [] };
  } catch {
    return { def: null, errors: ['That code is damaged or incomplete. Ask your friend to send it again.'] };
  }
};

export const shareLink = (code: string): string => `${window.location.origin}${window.location.pathname}?t=${code}`;

// ---- starting points ----------------------------------------------------------------------------------------------------
export const newArenaDef = (author: string, patch: Partial<TargetDef> = {}): TargetDef => ({
  id: newArenaId(), kind: 'PLAYER', enabled: true, tier: 2, fullName: '', shortName: '', title: '', personality: '', avatar: { silhouette: 'suit' },
  scandals: [{ category: 'FINANCIAL', title: '' }], passiveName: '', passiveFlavor: '', mods: {}, abilities: [defaultAbility('COUNTER_STORY')],
  ai: { defenseStyle: 'BALANCED', temperament: 'STEADY', weaknessBranch: 'SOCIAL', resistanceBranch: 'ELITE', chatter: { onStart: '', onCritical: '' } },
  author, ...patch
});

/** Ready-made starting points, so nobody faces an empty form. Everything in them can be changed. */
export const TEMPLATES: { name: string; blurb: string; make: (author: string) => TargetDef }[] = [
  { name: 'The Pastor', blurb: 'True believers, a private jet and a very loyal choir.', make: a => newArenaDef(a, { fullName: 'Pastor Miracle "Fire Fire" Okonkwo', shortName: 'Pastor Fire', title: 'General Overseer, Prayer Jet Ministries', personality: 'Heals by phone, prays for fuel and has never once been seen in economy class.', avatar: { silhouette: 'robe' }, scandals: [{ category: 'FINANCIAL', title: 'The Tithe Went To A Jet. The Jet Has A Bar.' }, { category: 'AFFAIR', title: 'The Choir Mistress Knows Where The Bodies Are Buried' }], passiveName: 'The Faithful', passiveFlavor: 'They will defend him against a video of him doing the thing.', mods: { doubtFlat: 30, doubtRate: 1.4 }, ai: { defenseStyle: 'SPIN_DOCTOR', temperament: 'THE_SHOWMAN', weaknessBranch: 'SOCIAL', resistanceBranch: 'PRESS', chatter: { onStart: 'Touch not my anointed! Touch not my account number!', onCritical: 'The devil is a liar and so is your blog!' } } }) },
  { name: 'The Senator', blurb: 'Elite hubs, lawyers and a friendly judge on speed dial.', make: a => newArenaDef(a, { fullName: 'Senator Sabi-Sabi "Distinguished" Adeleke', shortName: 'The Senator', title: 'Chairman, Committee On Committees', personality: 'Has been in office since before you could vote and plans to die there.', avatar: { silhouette: 'agbada' }, scandals: [{ category: 'FINANCIAL', title: 'Constituency Projects That Exist Only In The Budget' }, { category: 'FAKE_CREDENTIALS', title: 'A Degree From A University That Is A Church Hall' }], passiveName: 'Friends In High Places', passiveFlavor: 'Every judge in the state went to his daughter’s wedding.', mods: { eliteFriction: 0.25, tagDoubt: { ELITE_HUB: 8 } }, abilities: [defaultAbility('INJUNCTION'), defaultAbility('HEAT_SURGE')], ai: { defenseStyle: 'LAWYER_UP', temperament: 'THE_STOIC', weaknessBranch: 'STREET', resistanceBranch: 'ELITE', chatter: { onStart: 'I have been in this game for forty years, young man.', onCritical: 'My lawyers will be in touch. All forty of them.' } } }) },
  { name: 'The Influencer', blurb: 'An online army, a ring light and a sponsor who regrets it.', make: a => newArenaDef(a, { fullName: 'Tife "Soft Life" Balogun', shortName: 'Tife', title: 'Lifestyle Entrepreneur (Self-Appointed)', personality: 'Sells a course on wealth. The wealth is the course.', avatar: { silhouette: 'glasses' }, scandals: [{ category: 'LEAKED_MEDIA', title: 'The Mansion Is A Rented Hotel Lobby' }, { category: 'FINANCIAL', title: 'The Course Has Been Refunded Four Hundred Times' }], passiveName: 'The Squad', passiveFlavor: 'Fifty thousand followers who all joined on the same day.', mods: { tagDoubt: { HYPER_ONLINE: 14 }, spinHubs: true }, abilities: [defaultAbility('BOT_SWARM'), defaultAbility('DOUBT_WAVE')], ai: { defenseStyle: 'CYBER_SQUAD', temperament: 'THE_CRASHOUT', weaknessBranch: 'PRESS', resistanceBranch: 'SOCIAL', chatter: { onStart: 'Haters will say it is fake. It is NOT fake.', onCritical: 'I am not crying, my ring light is too bright!' } } }) },
  { name: 'The Big Man', blurb: 'Security men, short temper, long memory.', make: a => newArenaDef(a, { fullName: 'Chief Obinna "Bulldozer" Eze', shortName: 'The Bulldozer', title: 'Contractor, Landlord, Local Legend', personality: 'Owns half the road and the men who guard the other half.', avatar: { silhouette: 'cap' }, scandals: [{ category: 'FINANCIAL', title: 'Contracts For Bridges That Cross Nothing' }, { category: 'AFFAIR', title: 'Three Households, One Very Tired Driver' }], passiveName: 'Boys On Standby', passiveFlavor: 'Asking questions is a bad idea. Asking twice is a worse one.', mods: { heatRate: 1.4, counterHeat: 6 }, abilities: [defaultAbility('HEAT_SURGE'), defaultAbility('ACCOUNT_FREEZE')], ai: { defenseStyle: 'IRON_FIST', temperament: 'THE_BULLY', weaknessBranch: 'PRESS', resistanceBranch: 'STREET', chatter: { onStart: 'Who is this small boy typing about me?', onCritical: 'Find that blogger. I want to say hello.' } } }) },
  { name: 'Blank page', blurb: 'Start from nothing and build your own.', make: a => newArenaDef(a) }
];
