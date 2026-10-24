import type { Branch, ScandalCategory } from './channels';
import { buildAiProfile } from './aiProfiles';
import { RATING_RANGES } from './ratings';
import { SCANDAL_CATEGORIES, SPOTLIGHT_IDS, TARGETS } from './targets';
import type {
  AbilityDef, AbilityKind, ChatterLines, CreatorInfo, DefenseStyle, Folder, ScandalDef, SilhouetteKind,
  TargetArchetype, TargetKind, TargetMods, Temperament, Tier
} from './targetTypes';

// ---------------------------------------------------------------------------
// TARGET PACKS: the content pipeline.
//
// A pack is plain JSON. Anyone on the team can author one (in the in-app Target Studio, or by hand), validate it, and
// ship it by dropping the file into public/target-packs/ and listing it in index.json. No code change and no rebuild
// of the engine. Built-in content (the Story Mode cast) uses exactly the same format.
// ---------------------------------------------------------------------------
export const PACK_SCHEMA_VERSION = 1;

export interface TargetDef {
  id: string;                     // snake_case, unique across the whole game
  kind: TargetKind;               // FICTIONAL | PARODY | CREATOR (a real person, with permission) | STORY
  enabled: boolean;               // false = kept in the pack but not playable (soft unpublish)
  tier: Tier;                     // Mechanics: which tier baseline (days, Heat, Doubt, Cover-Up) applies
  folder?: Folder;                // Where it is listed in the Dossier (default: its tier). 'SPOTLIGHT' = always open
  storyOnly?: boolean;            // Hidden from the Dossier folders (played through Story Mode)
  fullName: string;
  shortName: string;              // Replaces {Target} in all flavour text
  title: string;
  personality: string;
  avatar: { silhouette: SilhouetteKind; imageUrl?: string; accent?: string };
  scandals: ScandalDef[];         // 1 to 4, one per category
  passiveName: string;
  passiveFlavor: string;
  mods: TargetMods;
  abilities: AbilityDef[];        // 1 to 3
  ai: {
    defenseStyle: DefenseStyle;
    temperament: Temperament;
    weaknessBranch: Branch;
    resistanceBranch: Branch;
    chatter: Partial<ChatterLines> & Pick<ChatterLines, 'onStart' | 'onCritical'>;
  };
  prRating?: number;              // Optional manual difficulty rating; otherwise estimated from the tier and power
  creator?: CreatorInfo;          // Required for kind CREATOR: written permission on record
  tags?: string[];
}

export interface TargetPack {
  schema: number;
  packId: string;
  name: string;
  author: string;
  version: number;
  targets: TargetDef[];
}

export const SILHOUETTES: SilhouetteKind[] = ['agbada', 'suit', 'cap', 'gele', 'robe', 'hoodie', 'uniform', 'crown', 'mic', 'glasses'];
export const DEFENSE_STYLES: DefenseStyle[] = ['BALANCED', 'SPIN_DOCTOR', 'IRON_FIST', 'LAWYER_UP', 'DISTRACTOR'];
export const TEMPERAMENTS: Temperament[] = ['STEADY', 'THE_CRASHOUT', 'THE_STOIC', 'THE_SHOWMAN', 'THE_PARANOID', 'THE_SCHEMER'];
export const BRANCHES: Branch[] = ['STREET', 'SOCIAL', 'PRESS', 'ELITE'];
export const ABILITY_KINDS: AbilityKind[] = ['INJUNCTION', 'DISTRACTION', 'HEAT_SURGE', 'COUNTER_STORY', 'BOT_SWARM'];
export const TARGET_KINDS: TargetKind[] = ['FICTIONAL', 'PARODY', 'CREATOR', 'STORY'];

// What each ability strength means, and the range a Target may use (keeps authors inside the tested envelope).
export const ABILITY_RANGE: Record<AbilityKind, { min: number; max: number; unit: string }> = {
  INJUNCTION: { min: 1, max: 5, unit: 'days a channel is frozen' },
  DISTRACTION: { min: 5, max: 30, unit: 'Freshness lost' },
  HEAT_SURGE: { min: 4, max: 18, unit: '% Heat added' },
  COUNTER_STORY: { min: 4, max: 16, unit: '% Cover-Up added' },
  BOT_SWARM: { min: 1, max: 6, unit: 'Spin bubbles spawned' }
};

const MOD_RANGE: Record<string, [number, number]> = {
  doubtFlat: [0, 60], doubtAdd: [0, 20], coverUpRate: [0.7, 2], eliteFriction: [0.1, 0.8],
  counterHeat: [0, 15], heatRate: [0.7, 2], doubtRate: [0.8, 2.2], days: [-14, 6], forgeryRisk: [0, 0.4], staleRate: [0.8, 1.5]
};

const ID_RE = /^[a-z][a-z0-9_]{2,40}$/;
const HEX_RE = /^#[0-9a-f]{6}$/i;
// Real people must never be paired with believable accusations. Creators and parodies get comic scandals only.
const ACCUSATORY = /loot|stole|steal|fraud|launder|offshore|bribe|affair|mistress|side-chick|forged|fake degree|billion|scam|abuse|assault|criminal|arrest/i;
const KNOWN_REAL = ['Dangote', 'Davido', 'Wizkid', 'Burna Boy', 'Aliko', 'Tinubu', 'Buhari', 'Obasanjo', 'Peter Obi', 'Oyedepo', 'Adeboye', 'Hushpuppi', 'Tiwa Savage', 'Don Jazzy', 'Banky W', 'Mr Macaroni', 'Basketmouth'];

export interface Validation { errors: string[]; warnings: string[] }

const inRange = (n: unknown, lo: number, hi: number): n is number => typeof n === 'number' && Number.isFinite(n) && n >= lo && n <= hi;
const text = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

// A rough measure of how hard a Target hits: used to warn when a Target sits in the wrong tier, and to estimate a rating.
export const threatScore = (def: Pick<TargetDef, 'abilities' | 'mods' | 'ai'>): number => {
  let s = 0;
  def.abilities.forEach(a => {
    const per = a.strength * (a.kind === 'INJUNCTION' ? 3 : a.kind === 'BOT_SWARM' ? 2.5 : a.kind === 'DISTRACTION' ? 0.5 : 1);
    s += per / Math.max(3, a.every);
  });
  const m = def.mods;
  s += ((m.coverUpRate ?? 1) - 1) * 6 + (m.doubtAdd ?? 0) * 0.05 + (m.counterHeat ?? 0) * 0.1 + (m.forgeryRisk ?? 0) * 3;
  if (m.eliteFriction !== undefined) s += (0.4 - m.eliteFriction) * 2;
  if (def.ai.defenseStyle === 'IRON_FIST' || def.ai.temperament === 'THE_STOIC') s += 0.4;
  return Math.round(s * 100) / 100;
};

export const estimateRating = (def: TargetDef): number => {
  const folder = def.folder === 'SPOTLIGHT' || !def.folder ? def.tier : def.folder;
  const [lo, hi] = RATING_RANGES[folder];
  const t = Math.max(0, Math.min(1, threatScore(def) / 4));
  return Math.round(lo + (hi - lo) * t);
};

export const validateTargetDef = (def: TargetDef, opts: { builtInIds?: Set<string> } = {}): Validation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const e = (m: string) => errors.push(m);
  const w = (m: string) => warnings.push(m);

  if (!ID_RE.test(def.id ?? '')) e('id must be snake_case (3-41 characters, lowercase letters, digits, underscores).');
  if (opts.builtInIds?.has(def.id)) e(`id "${def.id}" is already used by built-in content.`);
  if (!TARGET_KINDS.includes(def.kind)) e('kind must be FICTIONAL, PARODY, CREATOR or STORY.');
  if (!inRange(def.tier, 1, 5) || !Number.isInteger(def.tier)) e('tier must be a whole number from 1 to 5.');
  if (def.folder !== undefined && def.folder !== 'SPOTLIGHT' && !(inRange(def.folder, 1, 5) && Number.isInteger(def.folder))) e('folder must be SPOTLIGHT or 1-5.');

  if (!text(def.fullName, 70)) e('fullName is required (max 70 characters).');
  if (!text(def.shortName, 28)) e('shortName is required (max 28 characters). It replaces {Target} in flavour text.');
  if (!text(def.title, 70)) e('title is required (max 70 characters).');
  if (!text(def.personality, 240)) e('personality is required (max 240 characters).');
  if (!text(def.passiveName, 40)) e('passiveName is required (max 40 characters).');
  if (!text(def.passiveFlavor, 180)) e('passiveFlavor is required (max 180 characters).');

  const av = def.avatar;
  if (!av || !SILHOUETTES.includes(av.silhouette)) e('avatar.silhouette must be one of: ' + SILHOUETTES.join(', ') + '.');
  if (av?.accent && !HEX_RE.test(av.accent)) e('avatar.accent must be a hex colour like #8B0000.');
  if (av?.imageUrl) {
    const u = av.imageUrl;
    if (!(u.startsWith('https://') || /^data:image\/(png|jpeg|webp);base64,/.test(u))) e('avatar.imageUrl must be an https:// URL or a PNG/JPEG/WebP data URL (no SVG).');
    if (u.startsWith('data:') && u.length > 280_000) e('avatar image is too large (keep it under ~200 KB; the Studio resizes uploads automatically).');
  }

  // Scandals
  if (!Array.isArray(def.scandals) || def.scandals.length < 1 || def.scandals.length > 4) e('Add 1 to 4 scandals.');
  else {
    const seen = new Set<string>();
    def.scandals.forEach((s, i) => {
      if (!SCANDAL_CATEGORIES.includes(s.category as ScandalCategory)) e(`Scandal ${i + 1}: unknown category.`);
      if (seen.has(s.category)) e(`Scandal ${i + 1}: each category may be used once.`);
      seen.add(s.category);
      if (!text(s.title, 100)) e(`Scandal ${i + 1}: a headline is required (max 100 characters).`);
    });
  }

  // Playstyle
  const ai = def.ai;
  if (!ai) e('ai (playstyle) is required.');
  else {
    if (!DEFENSE_STYLES.includes(ai.defenseStyle)) e('ai.defenseStyle is invalid.');
    if (!TEMPERAMENTS.includes(ai.temperament)) e('ai.temperament is invalid.');
    if (!BRANCHES.includes(ai.weaknessBranch) || !BRANCHES.includes(ai.resistanceBranch)) e('weaknessBranch and resistanceBranch must be STREET, SOCIAL, PRESS or ELITE.');
    else if (ai.weaknessBranch === ai.resistanceBranch) e('weaknessBranch and resistanceBranch must differ.');
    if (!text(ai.chatter?.onStart, 140)) e('chatter.onStart is required (max 140 characters).');
    if (!text(ai.chatter?.onCritical, 140)) e('chatter.onCritical is required (max 140 characters).');
    (['onChannelBought', 'onEvidenceDropped', 'onBackfire'] as const).forEach(k => {
      const v = ai.chatter?.[k];
      if (v !== undefined && v !== '' && !text(v, 140)) e(`chatter.${k} must be 140 characters or fewer.`);
    });
  }

  // Mods
  const mods = (def.mods ?? {}) as Record<string, unknown>;
  Object.entries(MOD_RANGE).forEach(([k, [lo, hi]]) => {
    if (mods[k] !== undefined && !inRange(mods[k], lo, hi)) e(`mods.${k} must be between ${lo} and ${hi}.`);
  });
  (['tagDoubt', 'zoneDoubt'] as const).forEach(k => {
    const m = mods[k] as Record<string, unknown> | undefined;
    if (m) Object.entries(m).forEach(([key, v]) => { if (!inRange(v, 0, 30)) e(`mods.${k}.${key} must be between 0 and 30.`); });
  });

  // Abilities
  if (!Array.isArray(def.abilities) || def.abilities.length < 1 || def.abilities.length > 3) e('Add 1 to 3 abilities.');
  else def.abilities.forEach((a, i) => {
    const n = `Ability ${i + 1}`;
    if (!ABILITY_KINDS.includes(a.kind)) { e(`${n}: unknown kind.`); return; }
    const r = ABILITY_RANGE[a.kind];
    if (!inRange(a.strength, r.min, r.max)) e(`${n}: strength must be ${r.min}-${r.max} (${r.unit}).`);
    if (!inRange(a.every, 3, 14)) e(`${n}: "every" must be 3-14 days.`);
    if (!inRange(a.start, 3, 20)) e(`${n}: "start" must be day 3-20.`);
    if (a.branch !== undefined && !BRANCHES.includes(a.branch)) e(`${n}: branch is invalid.`);
    if (a.branch && a.kind !== 'INJUNCTION') w(`${n}: branch only applies to injunctions.`);
    if (!text(a.stamp, 36)) e(`${n}: stamp text is required (max 36 characters).`);
    if (!text(a.headline, 70)) e(`${n}: headline is required (max 70 characters).`);
    if (!text(a.line, 220)) e(`${n}: body line is required (max 220 characters).`);
  });

  // People: permission and safety
  if (def.kind === 'CREATOR') {
    const c = def.creator;
    if (!c || !text(c.handle, 60) || !text(c.consentRef, 160) || !/^\d{4}-\d{2}-\d{2}$/.test(c.approvedOn ?? '')) {
      e('A CREATOR needs creator.handle, creator.consentRef (where the written permission is kept) and creator.approvedOn (YYYY-MM-DD).');
    }
  }
  if ((def.kind === 'CREATOR' || def.kind === 'PARODY') && Array.isArray(def.scandals)) {
    def.scandals.forEach((s, i) => { if (ACCUSATORY.test(s.title ?? '')) e(`Scandal ${i + 1}: real or real-inspired people only get comic scandals (no crimes, fraud or affairs).`); });
    if (def.kind === 'CREATOR') [def.personality, def.passiveFlavor, ...(def.abilities ?? []).map(a => a.line)].forEach(t => { if (ACCUSATORY.test(t ?? '')) e('Creator text must not contain accusatory wording.'); });
  }
  if (def.kind === 'FICTIONAL' || def.kind === 'STORY') {
    const full = `${def.fullName} ${def.shortName}`;
    KNOWN_REAL.forEach(r => { if (full.toLowerCase().includes(r.toLowerCase())) e(`The name contains "${r}", a real person. Use kind PARODY or CREATOR, or rename.`); });
  }

  // Balance hints
  if (errors.length === 0) {
    const folder = def.folder === 'SPOTLIGHT' || !def.folder ? def.tier : def.folder;
    const score = threatScore(def);
    const band: Record<number, [number, number]> = { 1: [0, 1.6], 2: [0.4, 2.4], 3: [0.9, 3.2], 4: [1.4, 4], 5: [2, 6] };
    const [lo, hi] = band[def.tier];
    if (score < lo) w(`Looks gentle for tier ${def.tier} (threat ${score}); consider a lower tier or stronger abilities.`);
    if (score > hi) w(`Looks harsh for tier ${def.tier} (threat ${score}); consider a higher tier or softer abilities.`);
    if (def.prRating !== undefined && !inRange(def.prRating, RATING_RANGES[folder][0], RATING_RANGES[folder][1])) w(`prRating is outside the ${RATING_RANGES[folder][0]}-${RATING_RANGES[folder][1]} range of its folder.`);
    if (def.abilities.length === 1 && def.tier >= 3) w('Tier 3+ Targets usually have 2-3 abilities.');
    if (def.kind === 'CREATOR' && def.tier > 3) w('Featured creators work best as Spotlight or tiers 1-3 so new players meet them.');
  }
  return { errors, warnings };
};

export const validatePack = (pack: TargetPack, builtInIds: Set<string>): Validation & { perTarget: Record<string, Validation> } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const perTarget: Record<string, Validation> = {};
  if (!pack || typeof pack !== 'object') return { errors: ['Not a pack.'], warnings, perTarget };
  if (pack.schema !== PACK_SCHEMA_VERSION) errors.push(`Unsupported schema version ${pack.schema} (expected ${PACK_SCHEMA_VERSION}).`);
  if (!/^[a-z][a-z0-9_-]{2,40}$/.test(pack.packId ?? '')) errors.push('packId must be lowercase letters, digits, - or _ (3-41 characters).');
  if (!text(pack.name, 80)) errors.push('Pack name is required.');
  if (!Array.isArray(pack.targets)) { errors.push('targets must be a list.'); return { errors, warnings, perTarget }; }
  const ids = new Set<string>();
  pack.targets.forEach(def => {
    const v = validateTargetDef(def, { builtInIds });
    if (ids.has(def?.id)) v.errors.push('Duplicate id inside the pack.');
    ids.add(def?.id);
    perTarget[def?.id ?? '?'] = v;
    v.errors.forEach(m => errors.push(`${def?.id ?? '?'}: ${m}`));
    v.warnings.forEach(m => warnings.push(`${def?.id ?? '?'}: ${m}`));
  });
  return { errors, warnings, perTarget };
};

// ---------------------------------------------------------------------------
// Conversion and registry
// ---------------------------------------------------------------------------
const BUILT_IN_COUNT = TARGETS.length;
export const builtInIds = (): Set<string> => new Set(TARGETS.slice(0, BUILT_IN_COUNT).map(t => t.id));

export const defToArchetype = (def: TargetDef, packId: string): TargetArchetype => {
  const folder: Folder = def.folder ?? def.tier;
  const ai = buildAiProfile(def.ai.defenseStyle, def.ai.temperament, def.ai.weaknessBranch, def.ai.resistanceBranch, def.ai.chatter.onStart, def.ai.chatter.onCritical, def.ai.chatter);
  return {
    id: def.id,
    tier: def.tier,
    fullName: def.fullName,
    shortName: def.shortName,
    title: def.title,
    personality: def.personality,
    silhouette: def.avatar.silhouette,
    scandals: def.scandals.map(s => ({ category: s.category, title: s.title })),
    passiveName: def.passiveName,
    passiveFlavor: def.passiveFlavor,
    mods: { ...def.mods },
    abilities: def.abilities.map(a => ({ ...a })),
    kind: def.kind,
    storyOnly: !!def.storyOnly,
    avatar: { imageUrl: def.avatar.imageUrl, accent: def.avatar.accent },
    creator: def.creator,
    packId,
    // Personal-life, parody and creator Targets use the comic gist voice and comic endings, never arrests.
    parody: def.kind !== 'FICTIONAL',
    folder,
    ai,
    prRating: def.prRating ?? estimateRating(def)
  };
};

type RosterListener = () => void;
const listeners = new Set<RosterListener>();
let rosterVersion = 0;
const notify = () => { rosterVersion++; listeners.forEach(l => l()); };
export const subscribeRoster = (l: RosterListener) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const getRosterVersion = () => rosterVersion;

const loadedPacks = new Map<string, TargetPack>();
export const getLoadedPacks = (): TargetPack[] => [...loadedPacks.values()];

export interface RegisterReport { ok: boolean; registered: string[]; skipped: string[]; errors: string[]; warnings: string[] }

// Registers every valid, enabled Target in the pack. Invalid ones are skipped and reported; one bad Target never blocks the rest.
export const registerPack = (pack: TargetPack): RegisterReport => {
  const report: RegisterReport = { ok: true, registered: [], skipped: [], errors: [], warnings: [] };
  const builtIns = builtInIds();
  const v = validatePack(pack, builtIns);
  if (pack?.schema !== PACK_SCHEMA_VERSION || !Array.isArray(pack?.targets) || !/^[a-z][a-z0-9_-]{2,40}$/.test(pack?.packId ?? '')) {
    return { ...report, ok: false, errors: v.errors, warnings: v.warnings };
  }
  unregisterPack(pack.packId, false);
  pack.targets.forEach(def => {
    const tv = v.perTarget[def.id];
    if (tv && tv.errors.length) { report.skipped.push(def.id); return; }
    if (def.enabled === false) { report.skipped.push(def.id); return; }
    // An id owned by another pack is refused: first come, first served.
    const clash = TARGETS.find(t => t.id === def.id);
    if (clash) { report.skipped.push(def.id); report.errors.push(`${def.id}: id already used by ${clash.packId ?? 'built-in content'}.`); return; }
    const t = defToArchetype(def, pack.packId);
    TARGETS.push(t);
    if (def.folder === 'SPOTLIGHT') SPOTLIGHT_IDS.add(def.id);
    report.registered.push(def.id);
  });
  loadedPacks.set(pack.packId, pack);
  report.errors.push(...v.errors);
  report.warnings.push(...v.warnings);
  report.ok = v.errors.length === 0;
  notify();
  return report;
};

export const unregisterPack = (packId: string, announce = true) => {
  for (let i = TARGETS.length - 1; i >= 0; i--) {
    if (TARGETS[i].packId === packId) { SPOTLIGHT_IDS.delete(TARGETS[i].id); TARGETS.splice(i, 1); }
  }
  loadedPacks.delete(packId);
  if (announce) notify();
};

// ---------------------------------------------------------------------------
// Where packs come from
//   1. public/target-packs/index.json: { "packs": ["story-season-1.json", ...] } (shipped content, any team member can add)
//   2. This browser's own drafts (saved from the Studio), for playtesting before publishing
// ---------------------------------------------------------------------------
export const DRAFTS_KEY = 'rumor_target_drafts_v1';

export const loadDraftPacks = (): TargetPack[] => {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    const list = raw ? (JSON.parse(raw) as TargetPack[]) : [];
    return Array.isArray(list) ? list.filter(p => p && typeof p.packId === 'string' && Array.isArray(p.targets)) : [];
  } catch { return []; }
};
export const saveDraftPack = (pack: TargetPack) => {
  try {
    const rest = loadDraftPacks().filter(p => p.packId !== pack.packId);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify([...rest, pack]));
  } catch { /* storage unavailable */ }
};
export const deleteDraftPack = (packId: string) => {
  try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(loadDraftPacks().filter(p => p.packId !== packId))); } catch { /* ignore */ }
  unregisterPack(packId);
};

export const loadAllPacks = async (baseUrl = './target-packs/'): Promise<RegisterReport[]> => {
  const reports: RegisterReport[] = [];
  try {
    const res = await fetch(baseUrl + 'index.json', { cache: 'no-cache' });
    if (res.ok) {
      const idx = (await res.json()) as { packs?: string[] };
      for (const file of idx.packs ?? []) {
        try {
          const r = await fetch(baseUrl + file, { cache: 'no-cache' });
          if (r.ok) reports.push(registerPack((await r.json()) as TargetPack));
        } catch { /* a missing or broken file must never break the game */ }
      }
    }
  } catch { /* offline or no packs published */ }
  loadDraftPacks().forEach(p => reports.push(registerPack(p)));
  return reports;
};

export const newBlankDef = (): TargetDef => ({
  id: 'new_target',
  kind: 'FICTIONAL',
  enabled: true,
  tier: 1,
  fullName: 'New Target',
  shortName: 'New Target',
  title: 'Job Title',
  personality: 'One or two lines on who they are and why people love to talk about them.',
  avatar: { silhouette: 'suit' },
  scandals: [{ category: 'FINANCIAL', title: 'A headline for the scandal' }],
  passiveName: 'Passive Name',
  passiveFlavor: 'A line on what makes this Target hard to shift.',
  mods: {},
  abilities: [{ kind: 'COUNTER_STORY', every: 8, start: 7, strength: 6, stamp: 'COUNTER STORY', headline: 'A Counter-Story Appears', line: '{Target} fires back with a counter-story.' }],
  ai: { defenseStyle: 'BALANCED', temperament: 'STEADY', weaknessBranch: 'SOCIAL', resistanceBranch: 'ELITE', chatter: { onStart: 'Who is saying my name?', onCritical: 'This has gone too far!' } }
});
