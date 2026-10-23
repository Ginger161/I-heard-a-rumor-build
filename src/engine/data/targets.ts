import { Branch, ScandalCategory } from './channels';
import { TIER_1 } from './targets/tier1';
import { TIER_2 } from './targets/tier2';
import { TIER_3 } from './targets/tier3';
import { TIER_4 } from './targets/tier4';
import { TIER_5 } from './targets/tier5';
import { SPOTLIGHT } from './targets/spotlight';
import { AI_PROFILES } from './aiProfiles';
import { PARODY, USE_PARODY_NAMES } from './parody';
import { GENERATED_RATINGS, RATING_RANGES, SPEC_RATINGS } from './ratings';
import { AbilityDef, Folder, ScandalDef, TargetArchetype, TargetBase, Tier } from './targetTypes';

export type { AbilityDef, Folder, ScandalDef, SilhouetteKind, TargetArchetype, TargetMods, Tier, AiProfile, DefenseStyle, Temperament, TargetKind, CreatorInfo } from './targetTypes';
export type TargetId = string;

const TIER_LISTS: [Tier, TargetBase[]][] = [[1, TIER_1], [2, TIER_2], [3, TIER_3], [4, TIER_4], [5, TIER_5]];
export const SPOTLIGHT_IDS = new Set(SPOTLIGHT.map(t => t.id));

// Fallback rating: spread a folder's Targets across its range in authoring order.
const fallbackRating = (base: TargetBase, siblings: TargetBase[], folder: Folder): number => {
  const [lo, hi] = RATING_RANGES[folder === 'SPOTLIGHT' ? base.tier : folder];
  const i = Math.max(0, siblings.findIndex(s => s.id === base.id));
  return Math.round(lo + ((hi - lo) * i) / Math.max(1, siblings.length - 1));
};

const attach = (base: TargetBase, siblings: TargetBase[], folder: Folder): TargetArchetype => {
  const ai = AI_PROFILES[base.id];
  if (!ai) throw new Error(`Missing AI profile for target "${base.id}"`);
  const p = USE_PARODY_NAMES ? PARODY[base.id] : undefined;
  return {
    ...base,
    fullName: p?.fullName ?? base.fullName,
    shortName: p?.shortName ?? base.shortName,
    title: p?.title ?? base.title,
    personality: p?.personality ?? base.personality,
    scandals: p ? base.scandals.map((s, i) => ({ ...s, title: p.scandals[i] ?? s.title })) : base.scandals,
    parody: !!p,
    folder,
    ai,
    prRating: SPEC_RATINGS[base.id] ?? GENERATED_RATINGS[base.id] ?? fallbackRating(base, siblings, folder)
  };
};

export const TARGETS: TargetArchetype[] = [
  ...SPOTLIGHT.map(t => attach(t, SPOTLIGHT, 'SPOTLIGHT')),
  ...TIER_LISTS.flatMap(([tier, list]) => list.map(t => attach(t, list, tier)))
];

export const TIERS: Tier[] = [1, 2, 3, 4, 5];
export const FOLDERS: Folder[] = ['SPOTLIGHT', 1, 2, 3, 4, 5];

export const FOLDER_INFO: Record<Folder, { name: string; blurb: string }> = {
  SPOTLIGHT: { name: '★ Creator Spotlight', blurb: 'Viral personalities. Always open.' },
  1: { name: 'Neighbourhood Big Men', blurb: 'Local power, small stakes. Learn the ropes.' },
  2: { name: 'State Players', blurb: 'Governors, megastars and money. They hit back.' },
  3: { name: 'National Heavyweights', blurb: 'Federal power, big lawyers, and long arms.' },
  4: { name: 'Titans', blurb: 'Kingmakers and institutions. They fight on every front.' },
  5: { name: 'The Untouchables', blurb: 'Nobody has ever taken one down.' }
};
export const TIER_INFO = FOLDER_INFO as Record<Tier, { name: string; blurb: string }>;

// Targets shown in a folder, easiest first (like a bot ladder).
export const targetsInFolder = (folder: Folder): TargetArchetype[] =>
  TARGETS.filter(t => t.folder === folder && !t.storyOnly).sort((a, b) => a.prRating - b.prRating);
export const targetsInTier = (tier: Tier): TargetArchetype[] => targetsInFolder(tier);

export const isSpotlight = (id: string): boolean => SPOTLIGHT_IDS.has(id);

export const getTarget = (id: TargetId | null | undefined): TargetArchetype =>
  TARGETS.find(t => t.id === id) ?? TARGETS.find(t => t.id === 'godfather') ?? TARGETS[0];

export interface ScandalInfo {
  category: ScandalCategory;
  label: string;
  tagline: string;
}

export const SCANDALS: Record<ScandalCategory, ScandalInfo> = {
  FINANCIAL: { category: 'FINANCIAL', label: 'Financial', tagline: 'Looted billions and a paper trail that ends offshore.' },
  AFFAIR: { category: 'AFFAIR', label: 'Affair', tagline: 'A secret life, a hidden property, and receipts to match.' },
  LEAKED_MEDIA: { category: 'LEAKED_MEDIA', label: 'Leaked Media', tagline: 'A recording the target never wanted the public to hear.' },
  FAKE_CREDENTIALS: { category: 'FAKE_CREDENTIALS', label: 'Fake Credentials', tagline: 'Degrees, certificates and titles that do not exist.' }
};

export const SCANDAL_CATEGORIES: ScandalCategory[] = ['FINANCIAL', 'AFFAIR', 'LEAKED_MEDIA', 'FAKE_CREDENTIALS'];

export const scandalFor = (target: TargetArchetype, category: ScandalCategory): ScandalDef | undefined =>
  target.scandals.find(s => s.category === category);

export const scandalTitleFor = (target: TargetArchetype, category: ScandalCategory): string =>
  scandalFor(target, category)?.title ?? SCANDALS[category].tagline;

// Online hubs that Bot Farm style passives double Spin spawns in.
export const BOT_FARM_HUBS = ['lagos', 'rivers', 'enugu', 'oyo', 'fct'];

// Replaces the {Target} token used by all channel/evidence/alert flavor text.
export const fillTarget = (text: string, target: TargetArchetype): string =>
  text.replace(/\{Target\}/g, target.shortName);

// ---------------------------------------------------------------------------
// Dossier descriptions, generated from the data so they always match the engine.
// ---------------------------------------------------------------------------
const pct = (n: number) => `${Math.round(Math.abs(n - 1) * 100)}%`;
const BRANCH_NAME: Record<Branch, string> = { STREET: 'Street', SOCIAL: 'Social', PRESS: 'Press', ELITE: 'Elite' };

const describeAbility = (a: AbilityDef): string => {
  const cadence = `Every ~${a.every} days`;
  switch (a.kind) {
    case 'INJUNCTION': return `${cadence}: freezes one of your ${a.branch ? a.branch + ' ' : ''}channels for ${a.strength} days.`;
    case 'DISTRACTION': return `${cadence}: a distraction costs your story ${a.strength} Freshness.`;
    case 'HEAT_SURGE': return `${cadence}: security agencies add +${a.strength}% Heat.`;
    case 'COUNTER_STORY': return `${cadence}: a counter-story adds +${a.strength}% Cover-Up.`;
    case 'BOT_SWARM': return `${cadence}: a bot swarm spawns ${a.strength} PR Spin bubbles.`;
  }
};

export const STYLE_TEXT = {
  SPIN_DOCTOR: 'Spin Doctor: PR Spin bubbles are 50% more common, and Heat rises 20% slower.',
  IRON_FIST: 'Iron Fist: Heat rises 40% faster, and PR Spin bubbles are rarer.',
  LAWYER_UP: 'Lawyer Up: injunctions last 1 day longer and come 15% more often. Heat rises 10% slower.',
  DISTRACTOR: 'Distractor: distractions hit 30% harder, Spin bubbles are rarer, and the story goes stale 10% faster.',
  BALANCED: ''
} as const;

export const TEMPERAMENT_TEXT = {
  THE_CRASHOUT: 'The Crashout: rants early at 15% Believers. You gain +10% Velocity for a while, but 2 Spin bubbles appear.',
  THE_STOIC: 'The Stoic: skips the early counter-offensives and saves one massive ambush for 55% Believers.',
  THE_SHOWMAN: 'The Showman: moves come 25% more often, but each hits 25% softer.',
  THE_PARANOID: 'The Paranoid: your genuine evidence costs 50% more Heat, but its Cover-Up grows 15% slower.',
  THE_SCHEMER: 'The Schemer: at 30% Believers it plants a too-good-to-be-true bombshell. Verify it, or pay for it.',
  STEADY: ''
} as const;

export const describeTarget = (t: TargetArchetype): string[] => {
  const m = t.mods;
  const out: string[] = [];
  if (t.ai.temperament !== 'STEADY') out.push(TEMPERAMENT_TEXT[t.ai.temperament]);
  if (t.ai.defenseStyle !== 'BALANCED') out.push(STYLE_TEXT[t.ai.defenseStyle]);
  out.push(`Weak to ${BRANCH_NAME[t.ai.weaknessBranch]} channels (x1.25). Resists ${BRANCH_NAME[t.ai.resistanceBranch]} channels (x0.75).`);
  if (m.doubtFlat !== undefined) out.push(`Every state starts at ${m.doubtFlat}% Doubt.`);
  if (m.doubtAdd) out.push(`Every state starts with +${m.doubtAdd}% Doubt.`);
  if (m.tagDoubt) Object.entries(m.tagDoubt).forEach(([tag, v]) => out.push(`${tag.replace('_', ' ')} states start +${v}% Doubt.`));
  if (m.zoneDoubt) Object.entries(m.zoneDoubt).forEach(([zone, v]) => out.push(`${zone} zone states start +${v}% Doubt.`));
  if (m.eliteFriction !== undefined) out.push(`Elite hubs spread at ${m.eliteFriction}x until you chain 2 Press/Elite channels.`);
  if (m.coverUpRate) out.push(`Cover-Up grows ${pct(m.coverUpRate)} ${m.coverUpRate > 1 ? 'faster' : 'slower'}.`);
  if (m.staleRate) out.push(`The story goes stale ${pct(m.staleRate)} faster.`);
  if (m.spinHubs) out.push('PR Spin bubbles are twice as likely in Lagos, Rivers, Enugu, Oyo and Abuja.');
  if (m.counterHeat) out.push(`Every counter-offensive adds +${m.counterHeat}% Heat (a SAN Counter-Injunction cancels it).`);
  if (m.forgeryRisk) out.push(`Forgeries are ${Math.round(m.forgeryRisk * 100)}% more likely to be exposed.`);
  t.abilities.forEach(a => out.push(describeAbility(a)));
  const last = t.abilities[t.abilities.length - 1];
  if (last) out.push(`Signature move at 50% Believers: a doubled "${last.headline}".`);
  return out.filter(Boolean);
};

// ---- Mechanics resolved from the AI profile ----
export interface StyleMods {
  heat: number;            // Daily Heat
  spin: number;            // PR Spin bubble frequency and counts
  stale: number;           // Freshness decay
  distraction: number;     // DISTRACTION ability strength
  injunctionDays: number;  // Extra days an injunction freezes a channel
  injunctionEvery: number; // Multiplier on days between injunctions (lower = more often)
}
const SM = (o: Partial<StyleMods>): StyleMods => ({ heat: 1, spin: 1, stale: 1, distraction: 1, injunctionDays: 0, injunctionEvery: 1, ...o });
export const STYLE_MULTIPLIERS: Record<'SPIN_DOCTOR' | 'IRON_FIST' | 'LAWYER_UP' | 'DISTRACTOR' | 'BALANCED', StyleMods> = {
  SPIN_DOCTOR: SM({ heat: 0.8, spin: 1.5 }),
  IRON_FIST: SM({ heat: 1.4, spin: 0.6 }),
  LAWYER_UP: SM({ heat: 0.9, injunctionDays: 1, injunctionEvery: 0.85 }),
  DISTRACTOR: SM({ spin: 0.8, stale: 1.1, distraction: 1.3 }),
  BALANCED: SM({})
};

export interface TemperamentMods {
  abilityEvery: number;     // Multiplier on days between abilities (lower = more often)
  abilityStrength: number;  // Multiplier on ability strength
  evidenceHeat: number;     // Multiplier on the Heat your genuine evidence generates
  coverUp: number;          // Multiplier on Cover-Up growth
}
const TM = (o: Partial<TemperamentMods>): TemperamentMods => ({ abilityEvery: 1, abilityStrength: 1, evidenceHeat: 1, coverUp: 1, ...o });
export const TEMPERAMENT_MODS: Record<string, TemperamentMods> = {
  THE_SHOWMAN: TM({ abilityEvery: 0.75, abilityStrength: 0.75 }),
  THE_PARANOID: TM({ evidenceHeat: 1.5, coverUp: 0.85 })
};
export const temperamentMods = (t: TargetArchetype): TemperamentMods => TEMPERAMENT_MODS[t.ai.temperament] ?? TM({});
