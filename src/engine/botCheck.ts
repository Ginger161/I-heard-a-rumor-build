// THE BOT CHECK. Anyone who builds a Target in the Arena can test it at any time, with no one to ask. Thirty bots, each following a
// different human plan (see STRATEGIES_30 in bots.ts), play the Target many times. From their results we get:
//   - a difficulty score and a PR rating on the same ladder as the official Targets,
//   - whether it is fair (a Target that no plan can beat is "too hard" and cannot be published),
//   - tips on how to beat it, taken from the plans that did, and
//   - if it is too hard, an eased version that is fair, as a suggestion the player can accept.
// It runs on the main thread in short slices, so it works the same in the browser, the installed app and the offline file.
import { HUMAN, STRATEGIES_30, STRATEGY_TIPS, play } from './bots';
import { ratingFromD } from './data/ratingCurve';
import { RATING_RANGES } from './data/ratings';
import { ABILITY_RANGE, TargetDef, registerPack, unregisterPack, validateTargetDef, builtInIds } from './data/targetPacks';
import type { Tier } from './data/targetTypes';

export const CHECK_PACK = 'arena_check';
export const CHECK_ID = 'arena_check_target';

/** A Target whose best plan wins less often than this is "too hard" and is dropped, not published. */
export const FAIR_FLOOR = 45;
/** Below this difficulty a Target is flagged as trivial (it can still be published, but earns the lowest rating). */
export const TRIVIAL_D = 3;

export interface PlanResult { name: string; blurb: string; tip: string; win: number }
export interface BotReport {
  ok: boolean;
  errors: string[];                     // validation errors (when ok is false nothing was played)
  runs: number;
  games: number;
  plans: PlanResult[];                  // all thirty, best first
  bestPlan: string;
  best: number;                         // win % of the best plan, re-measured on games it was not picked on
  breadth: number;                      // average win % over all thirty plans
  beatenBy: number;                     // how many plans win at least half the time
  difficulty: number;                   // 0 trivial .. 100 impossible
  rating: number;
  tier: Tier;
  verdict: 'ok' | 'too_hard' | 'trivial';
  tips: string[];
}

const sleep0 = () => new Promise<void>(r => setTimeout(r, 0));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const tierForRating = (rating: number): Tier => {
  const tiers: Tier[] = [1, 2, 3, 4, 5];
  let pick: Tier = 1;
  for (const t of tiers) if (rating >= RATING_RANGES[t][0] - 25) pick = t;
  return pick;
};

// Which kind of plan beats this Target? Averages over families of plans turn thirty numbers into a sentence a player can use.
const FAMILIES: { name: string; plans: string[]; wins: string; loses: string }[] = [
  { name: 'viral', plans: ['blitz', 'wildfire', 'social_storm', 'forger_blitz', 'gambler', 'exploit_viral'], wins: 'Going loud and viral works here.', loses: 'Going viral backfires here: the Heat and Doubt punish loud plans.' },
  { name: 'proof', plans: ['proof', 'press_baron', 'early_proof', 'elite_whisper', 'exploit_proof', 'forger_press'], wins: 'Press, Elite and early evidence are the way in.', loses: 'Slow proof-first plans run out of time here.' },
  { name: 'quiet', plans: ['quiet', 'stealth', 'turtle', 'forger_quiet', 'fortress'], wins: 'Staying quiet and guarded works best.', loses: 'Hiding does not work here: the clock beats the careful.' },
  { name: 'forgery', plans: ['forger', 'forger_press', 'forger_quiet', 'forger_blitz', 'gambler'], wins: 'Forged evidence pays off here.', loses: 'Forgeries get exposed here: stick to real evidence.' },
  { name: 'street', plans: ['street_king', 'border_run', 'northern_push', 'eastern_wave'], wins: 'Street channels carry this Target.', loses: 'Street channels alone are not enough here.' }
];

const makeTips = (plans: PlanResult[], best: number, def: TargetDef): string[] => {
  const tips: string[] = [];
  const winners = plans.filter(p => p.win >= 50);
  const pool = winners.length ? winners : plans.slice(0, 3).filter(p => p.win >= 25);
  const seenTips = new Set<string>();
  for (const p of pool) {
    if (tips.length >= 3) break;
    if (seenTips.has(p.tip)) continue;
    seenTips.add(p.tip);
    tips.push(`${p.tip} (${p.win}% of bots following this plan won)`);
  }
  if (!pool.length) tips.push('No plan beat this Target reliably. Players will need real skill and luck.');
  const avg = (names: string[]) => { const rs = plans.filter(p => names.includes(p.name)); return rs.reduce((a, p) => a + p.win, 0) / Math.max(1, rs.length); };
  const overall = plans.reduce((a, p) => a + p.win, 0) / plans.length;
  const fam = FAMILIES.map(f => ({ f, v: avg(f.plans) })).sort((a, b) => b.v - a.v);
  if (fam[0].v - overall >= 12 && fam[0].v >= 30) tips.push(fam[0].f.wins);
  const worst = fam[fam.length - 1];
  if (overall - worst.v >= 12) tips.push(worst.f.loses);
  const ai = def.ai;
  tips.push(`Their weak lane is ${ai.weaknessBranch.toLowerCase()} (+25% effect); they resist ${ai.resistanceBranch.toLowerCase()} (-25%).`);
  if (best < 60) tips.push('Expect a close fight: even the best plan loses often.');
  return tips.slice(0, 5);
};

/** The core measurement, for any registered Target id (also used to calibrate the rating curve against the built-in Targets). */
export const measureTarget = async (targetId: string, runs: number, onProgress?: (fraction: number) => void): Promise<{ wins: number[]; top: number; best: number; breadth: number; difficulty: number }> => {
  const seed0 = 7777;
  const winsOf = async (k: number, seedBase: number, n: number): Promise<number> => {
    let w = 0;
    for (let i = 0; i < n; i++) if (play(targetId, HUMAN, seedBase + k * 104729 + i * 7919, null, STRATEGIES_30[k]).status === 'WON') w++;
    return Math.round((w / n) * 100);
  };
  const steps = STRATEGIES_30.length + 1;
  const wins: number[] = [];
  for (let k = 0; k < STRATEGIES_30.length; k++) {
    wins.push(await winsOf(k, seed0, runs));
    onProgress?.((k + 1) / steps);
    await sleep0();
  }
  // The best of thirty noisy numbers is flattered by luck, so the leading plan is replayed on games it was not picked on.
  const top = wins.indexOf(Math.max(...wins));
  const best = await winsOf(top, seed0 + 500000, Math.max(24, runs));
  onProgress?.(1);
  const breadth = wins.reduce((a, b) => a + b, 0) / wins.length;
  return { wins, top, best, breadth, difficulty: Math.round((0.5 * (100 - best) + 0.5 * (100 - breadth)) * 10) / 10 };
};

let running = false;

/** Plays the Target against all thirty plans. `runs` games per plan (12 is about 400 games in total, a few seconds on a phone). */
export const runBotCheck = async (def: TargetDef, opts: { runs?: number; onProgress?: (fraction: number) => void } = {}): Promise<BotReport> => {
  const runs = opts.runs ?? 12;
  const empty = (errors: string[]): BotReport => ({ ok: false, errors, runs, games: 0, plans: [], bestPlan: '', best: 0, breadth: 0, beatenBy: 0, difficulty: 100, rating: 0, tier: 1, verdict: 'too_hard', tips: [] });
  const check: TargetDef = { ...def, id: CHECK_ID, kind: 'PLAYER', enabled: true };
  const v = validateTargetDef(check, { builtInIds: builtInIds() });
  if (v.errors.length) return empty(v.errors);
  if (running) return empty(['A check is already running.']);
  running = true;
  try {
    const reg = registerPack({ schema: 1, packId: CHECK_PACK, name: 'Arena check', author: 'arena', version: 1, targets: [check] });
    if (!reg.registered.includes(CHECK_ID)) return empty(reg.errors.length ? reg.errors : ['Could not set up the test.']);

    const { wins, top, best, breadth, difficulty } = await measureTarget(CHECK_ID, runs, opts.onProgress);

    const plans: PlanResult[] = STRATEGIES_30.map((s, i) => ({ name: s.name, blurb: s.blurb, tip: STRATEGY_TIPS[s.name] ?? s.blurb, win: wins[i] })).sort((a, b) => b.win - a.win);
    const rating = ratingFromD(difficulty);
    const verdict: BotReport['verdict'] = best < FAIR_FLOOR ? 'too_hard' : difficulty < TRIVIAL_D ? 'trivial' : 'ok';
    return {
      ok: true, errors: [], runs, games: STRATEGIES_30.length * runs + Math.max(24, runs), plans, bestPlan: STRATEGIES_30[top].name, best,
      breadth: Math.round(breadth), beatenBy: wins.filter(w => w >= 50).length, difficulty, rating, tier: tierForRating(rating), verdict, tips: makeTips(plans, best, def)
    };
  } finally {
    unregisterPack(CHECK_PACK, false);
    running = false;
  }
};

// ---------------------------------------------------------------------------
// Easing: how to turn a too-hard Target into a fair one
// ---------------------------------------------------------------------------
/** Scales every harsh number toward neutral. f = 1 leaves it alone, 0.5 halves how much it hurts. */
export const easeDef = (def: TargetDef, f: number): TargetDef => {
  const toward1 = (x: number | undefined, lo: number, hi: number) => (x === undefined ? undefined : Math.round(clamp(1 + (x - 1) * f, lo, hi) * 20) / 20);
  const m = def.mods;
  const scaleMap = <T extends string>(o: Partial<Record<T, number>> | undefined) => (o ? (Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round((v as number) * f)])) as Partial<Record<T, number>>) : undefined);
  const mods = {
    ...m,
    doubtFlat: m.doubtFlat === undefined ? undefined : Math.round(m.doubtFlat * f),
    doubtAdd: m.doubtAdd === undefined ? undefined : Math.round(m.doubtAdd * f),
    counterHeat: m.counterHeat === undefined ? undefined : Math.round(m.counterHeat * f),
    forgeryRisk: m.forgeryRisk === undefined ? undefined : Math.round(m.forgeryRisk * f * 100) / 100,
    heatRate: toward1(m.heatRate, 0.7, 2), coverUpRate: toward1(m.coverUpRate, 0.7, 2), doubtRate: toward1(m.doubtRate, 0.8, 2.2), staleRate: toward1(m.staleRate, 0.8, 1.5),
    days: m.days === undefined ? undefined : Math.round(m.days * f),
    tagDoubt: scaleMap(m.tagDoubt), zoneDoubt: scaleMap(m.zoneDoubt)
  };
  Object.keys(mods).forEach(k => { if ((mods as Record<string, unknown>)[k] === undefined) delete (mods as Record<string, unknown>)[k]; });
  const abilities = def.abilities.map(a => {
    const r = ABILITY_RANGE[a.kind];
    return { ...a, strength: clamp(Math.round(a.strength * f), r.min, r.max), every: clamp(Math.round(a.every / Math.max(0.3, f)), 3, 14) };
  });
  // Gentler still: a lower baseline (clock, Heat, Doubt, Cover-Up), and at the extreme a calmer style.
  const drop = f <= 0.25 ? 3 : f <= 0.4 ? 2 : f <= 0.7 ? 1 : 0;
  const tier = clamp(def.tier - drop, 1, 5) as TargetDef['tier'];
  const ai = f <= 0.25 ? { ...def.ai, defenseStyle: 'BALANCED' as const, temperament: 'STEADY' as const } : def.ai;
  return { ...def, tier, ai, mods, abilities };
};

export interface EaseSuggestion { factor: number; def: TargetDef; report: BotReport }

/** Tries gentler and gentler versions until one is fair. Returns null if even the gentlest is not (the idea itself needs rethinking). */
export const suggestEase = async (def: TargetDef, onProgress?: (fraction: number, label: string) => void): Promise<EaseSuggestion | null> => {
  const factors = [0.85, 0.7, 0.55, 0.4, 0.25];
  for (let i = 0; i < factors.length; i++) {
    const eased = easeDef(def, factors[i]);
    const report = await runBotCheck(eased, { runs: 8, onProgress: p => onProgress?.((i + p) / factors.length, `Trying ${Math.round((1 - factors[i]) * 100)}% gentler`) });
    if (report.ok && report.verdict !== 'too_hard' && report.best >= FAIR_FLOOR + 8) return { factor: factors[i], def: eased, report };
  }
  return null;
};

/** Plain-English list of what changed between two versions of a Target. */
export const describeChanges = (a: TargetDef, b: TargetDef): string[] => {
  const out: string[] = [];
  if (a.tier !== b.tier) out.push(`Baseline pressure: tier ${a.tier} → tier ${b.tier}`);
  if (a.ai.defenseStyle !== b.ai.defenseStyle || a.ai.temperament !== b.ai.temperament) out.push(`Style: ${a.ai.defenseStyle} / ${a.ai.temperament} → ${b.ai.defenseStyle} / ${b.ai.temperament}`);
  a.abilities.forEach((x, i) => {
    const y = b.abilities[i];
    if (y && (x.strength !== y.strength || x.every !== y.every)) out.push(`${x.headline}: strength ${x.strength} → ${y.strength}, every ${x.every} → ${y.every} days`);
  });
  (Object.keys(a.mods) as (keyof TargetDef['mods'])[]).forEach(k => {
    const x = a.mods[k], y = b.mods[k];
    if (JSON.stringify(x) !== JSON.stringify(y)) out.push(`${String(k)}: ${JSON.stringify(x)} → ${JSON.stringify(y)}`);
  });
  return out;
};

