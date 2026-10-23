// Syndicate Perks: permanent pre-game loadout items bought with Brown Envelopes. One may be equipped per run.
export interface PerkEffects {
  seedSpark?: number;        // First Whisper (seed) spark value
  heatMult?: number;         // Multiplies daily Heat
  startInvestigation?: number; // Investigation % on Day 1
  forgeryRiskMult?: number;  // Multiplies forgery backfire probability
  staleMult?: number;        // Multiplies Freshness decay
  startShield?: number;      // Injunctions the match starts shielded against
  startSparks?: number;      // Sparks in hand on Day 1
  doubtDelta?: number;       // Added to every state's starting Doubt (negative = people trust you)
}

export interface PerkDef {
  id: string;
  name: string;
  cost: number;
  blurb: string;
  effectText: string;
  effects: PerkEffects;
}

export const PERKS: PerkDef[] = [
  {
    id: 'motor_park_boss',
    name: 'Motor Park Union Boss',
    cost: 75,
    blurb: 'A friend who can get a rumour onto every danfo by lunch.',
    effectText: 'Your first Whisper spark is worth 22 ⚡ instead of 15 ⚡.',
    effects: { seedSpark: 22 }
  },
  {
    id: 'burner_rig',
    name: 'Encrypted Burner Rig',
    cost: 100,
    blurb: 'Three phones, two VPNs and a very quiet landlord.',
    effectText: 'Daily Heat rises 20% slower.',
    effects: { heatMult: 0.8 }
  },
  {
    id: 'press_club',
    name: 'Press Club Membership',
    cost: 110,
    blurb: 'Editors return your calls, and the story lingers on their desks.',
    effectText: 'Story Freshness decays 25% slower.',
    effects: { staleMult: 0.75 }
  },
  {
    id: 'secretariat_mole',
    name: 'Inside Secretariat Mole',
    cost: 125,
    blurb: 'A director with a conscience and a key to the records room.',
    effectText: 'Investigation starts at 25% on Day 1, so Tier 1 Evidence is ready immediately.',
    effects: { startInvestigation: 25 }
  },
  {
    id: 'bailiff_friend',
    name: 'Court Bailiff on the Payroll',
    cost: 130,
    blurb: 'He loses paperwork for a living.',
    effectText: 'The first injunction against your channels is blocked.',
    effects: { startShield: 1 }
  },
  {
    id: 'fact_check_immunity',
    name: 'Fact-Check Immunity',
    cost: 150,
    blurb: 'Your forgeries come with a very convincing metadata trail.',
    effectText: 'Fabricated evidence is 50% less likely to be exposed.',
    effects: { forgeryRiskMult: 0.5 }
  }
];

export const getPerk = (id: string | null | undefined): PerkDef | undefined =>
  id ? PERKS.find(p => p.id === id) : undefined;

// ---- Story Mode approaches ----
// A chapter is played with one of three approaches, plus a modifier from your reputation (integrity) so far. They are
// encoded in the match's perkId as "story:<approach>:<band>" so the engine needs no extra state and a save stays valid.
export type StoryApproach = 'truth' | 'whatever' | 'mercy';
export type RepBand = 'low' | 'mid' | 'high';

export const APPROACH_EFFECTS: Record<StoryApproach, PerkEffects> = {
  truth: { startInvestigation: 30, doubtDelta: -3 },
  whatever: { startSparks: 30, forgeryRiskMult: 0.6, seedSpark: 24 },
  mercy: { heatMult: 0.8, staleMult: 0.85, startShield: 1 }
};
export const REP_EFFECTS: Record<RepBand, PerkEffects> = {
  low: { doubtDelta: 5 },       // "People know you embellish"
  mid: {},
  high: { doubtDelta: -2, startSparks: 10 } // "A trusted source"
};

export const storyPerkId = (approach: StoryApproach, band: RepBand): string => `story:${approach}:${band}`;
export const parseStoryPerk = (id: string | null | undefined): { approach: StoryApproach; band: RepBand } | null => {
  const m = /^story:(truth|whatever|mercy):(low|mid|high)$/.exec(id ?? '');
  return m ? { approach: m[1] as StoryApproach, band: m[2] as RepBand } : null;
};

const mergeEffects = (a: PerkEffects, b: PerkEffects): PerkEffects => ({
  ...a, ...b,
  startSparks: (a.startSparks ?? 0) + (b.startSparks ?? 0) || undefined,
  doubtDelta: (a.doubtDelta ?? 0) + (b.doubtDelta ?? 0) || undefined,
  heatMult: a.heatMult !== undefined || b.heatMult !== undefined ? (a.heatMult ?? 1) * (b.heatMult ?? 1) : undefined
});

export const perkEffects = (id: string | null | undefined): PerkEffects => {
  const story = parseStoryPerk(id);
  if (story) return mergeEffects(APPROACH_EFFECTS[story.approach], REP_EFFECTS[story.band]);
  return getPerk(id)?.effects ?? {};
};
