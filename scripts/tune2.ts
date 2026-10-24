// Play-style tuner. Every Target has one or two pressure families (src/engine/data/playStyles.ts). This turns the Target's overall
// strength S until its difficulty score D (see dOf below) lands in the Target's slot in its tier, and makes sure at least one
// plan still wins reliably (a Target that no plan beats is unfair).
// Start from the original numbers first:  node scripts/bake.mjs originals
//   TIER=3 RUNS=12 node node_modules/.cache/tune2.cjs     (one process per tier; they are independent)
import { writeFileSync, mkdirSync } from 'node:fs';
import { play, HUMAN, STRATEGIES } from './botLib';
import { getTarget } from '../src/engine/data/targets';
import { BALANCE } from '../src/engine/balance';
import { PLAY_STYLES, Family } from '../src/engine/data/playStyles';
import { PLAN, PROTECT, TUNE_WITH } from './difficultyPlan';

const tier = Number(process.env.TIER ?? 0);
const RUNS = Number(process.env.RUNS ?? 12);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const r2 = (n: number) => Math.round(n * 20) / 20;

type Snap = { mods: Record<string, unknown>; abilities: { kind: string; every: number; start: number; strength: number }[] };
const snaps: Record<string, Snap> = {};
const snap = (id: string): Snap => (snaps[id] ??= (() => {
  const t = getTarget(id);
  return { mods: JSON.parse(JSON.stringify(t.mods)), abilities: t.abilities.map(a => ({ kind: a.kind, every: a.every, start: a.start, strength: a.strength })) };
})());

// One family at strength x (0..1) on top of the Target's original numbers.
const layer = (id: string, fam: Family, x: number) => {
  const t = getTarget(id), s = snap(id);
  const each = (kind: string, fn: (a: (typeof t.abilities)[number], b: Snap['abilities'][number]) => void) => t.abilities.forEach((a, i) => { if (a.kind === kind) fn(a, s.abilities[i]); });
  switch (fam) {
    case 'FORCE':
      t.mods.heatRate = r2(0.8 + 1.0 * x);
      t.mods.counterHeat = Math.round(15 * x);
      each('HEAT_SURGE', (a, b) => { a.strength = clamp(Math.round(b.strength * (0.6 + 1.4 * x)), 4, 18); });
      break;
    case 'SPIN':
      t.mods.coverUpRate = r2(0.8 + 0.8 * x);
      each('COUNTER_STORY', (a, b) => { a.strength = clamp(Math.round(b.strength * (0.6 + 1.2 * x)), 4, 16); });
      each('BOT_SWARM', (a, b) => { a.strength = clamp(Math.round(b.strength * (0.7 + 1.0 * x)), 1, 6); });
      break;
    case 'CLOCK':
      t.mods.days = -Math.round(x * Math.min(14, 0.4 * BALANCE.tier.days[t.tier - 1]));
      t.mods.staleRate = r2(1 + 0.5 * x);
      t.mods.heatRate = r2((t.mods.heatRate ?? 1) * (1 - 0.25 * x));   // a short memory also means less scrutiny: loud, fast plans can win
      each('DISTRACTION', (a, b) => { a.strength = clamp(Math.round(b.strength * (0.6 + 1.8 * x)), 5, 30); });
      break;
    case 'FAITH':
      t.mods.doubtFlat = Math.round(20 + 40 * x);
      t.mods.doubtRate = r2(1 + 1.2 * x);
      break;
  }
};

const set = (id: string, S: number) => {
  const t = getTarget(id), s = snap(id);
  t.mods = JSON.parse(JSON.stringify(s.mods));
  t.abilities.forEach((a, i) => { a.every = s.abilities[i].every; a.strength = s.abilities[i].strength; });
  (TUNE_WITH[id] ?? PLAY_STYLES[id] ?? []).forEach(([f, w]) => layer(id, f, clamp(S * w, 0, 1)));
  if (PROTECT[id]) Object.assign(t.mods, JSON.parse(JSON.stringify(PROTECT[id])));
  // Zero-valued dials are the same as no dial: keep the data clean.
  (['days', 'counterHeat'] as const).forEach(k => { if (t.mods[k] === 0) delete t.mods[k]; });
};

// Every plan gets its own random games: if they shared games their results would move together and the average would be much noisier.
const winsOf = (id: string, st: (typeof STRATEGIES)[number], seed0: number, runs: number) => { const k = STRATEGIES.indexOf(st); let w = 0; for (let i = 0; i < runs; i++) if (play(id, HUMAN, seed0 + k * 104729 + i * 7919, null, st).status === 'WON') w++; return Math.round((w / runs) * 100); };
// Breadth (the average over the plans) and the best plan. The best plan is picked on one set of games and then re-played on a
// different set, so picking the best of ten noisy results does not make the Target look fairer than it is.
const measure = (id: string, seed0: number, runs = RUNS) => {
  const wins = STRATEGIES.map(st => winsOf(id, st, seed0, runs));
  const k = wins.indexOf(Math.max(...wins));
  const best = winsOf(id, STRATEGIES[k], seed0 + 500000, Math.max(24, runs));
  return { M: wins.reduce((a, b) => a + b, 0) / wins.length, best, wins };
};

// CURVE=id1,id2: print how the plans respond as the pressure rises, instead of tuning.
if (process.env.CURVE) {
  const names = STRATEGIES.map(s => s.name.slice(0, 5).padStart(5)).join(' ');
  for (const id of process.env.CURVE.split(',')) {
    console.log(`${id}  ${names}   M  best`);
    for (let k = 0; k <= 10; k++) { set(id, k / 10); const m = measure(id, 1000 + getTarget(id).tier * 31, 16); console.log(`  S=${(k / 10).toFixed(1)}  ${m.wins.map(w => String(w).padStart(5)).join(' ')}  ${String(Math.round(m.M)).padStart(3)}  ${String(m.best).padStart(3)}`); }
  }
  process.exit(0);
}

// DIFFICULTY SCORE D (0 = trivial, 100 = impossible): half "how many plans fail" (100 - breadth), half "how hard is even the best plan" (100 - best).
const dOf = (m: { M: number; best: number }) => 0.5 * (100 - m.best) + 0.5 * (100 - m.M);

const tiers = tier ? [tier] : [1, 2, 3, 4, 5];
for (const tr of tiers) {
  const plan = PLAN[tr];
  const n = plan.order.length;
  const out: Record<string, unknown> = {};
  const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
  plan.order.forEach((id, i) => {
    if (only && !only.has(id)) return;
    const want = plan.easy + ((plan.hard - plan.easy) * i) / (n - 1);
    const seed0 = 1000 + tr * 31;
    // Search S in [0, 1] by bisection (D only rises with the pressure), remembering every point tried. The answer is the tried point
    // closest to the slot among those where the best plan still wins reliably (a Target no plan can beat is unfair).
    const tried: { S: number; D: number; best: number }[] = [];
    const probe = (x: number, runs: number) => { set(id, x); const m = measure(id, seed0, runs); const D = dOf(m); tried.push({ S: x, D, best: m.best }); return { ...m, D }; };
    const gentle = probe(0, 16);
    const harsh = probe(1, 16);
    let lo = 0, hi = 1;
    if (want > gentle.D && want < harsh.D) {
      for (let k = 0; k < 8; k++) {
        const x = (lo + hi) / 2;
        const m = probe(x, k < 4 ? 16 : 24);
        if (m.D < want) lo = x; else hi = x;
      }
    }
    const ok = tried.filter(p => p.best >= plan.floor);
    const pick = (ok.length ? ok : tried.filter(p => p.S === 0)).reduce((a, b) => (Math.abs(b.D - want) < Math.abs(a.D - want) ? b : a));
    let S = pick.S;
    const eased = ok.length > 0 ? Math.abs(pick.D - want) > 6 : true;
    // Correct on fresh games: the search fits the games it plays, so re-measure on a different set and nudge S until the fresh score
    // is within about 2 of the slot and the best plan is still fair. (The slope comes from the points already tried.)
    const byS = tried.slice().sort((a, b) => a.S - b.S);
    const localSlope = (x: number) => {
      const below = byS.filter(p => p.S <= x).pop() ?? byS[0], above = byS.find(p => p.S > x) ?? byS[byS.length - 1];
      return Math.max(15, (above.D - below.D) / Math.max(0.02, above.S - below.S));
    };
    for (let k = 0; k < 3; k++) {
      set(id, S);
      const m = measure(id, seed0 + 300000, 64);
      const bad = m.best < plan.floor;
      if (Math.abs(dOf(m) - want) <= 2 && !bad) break;
      const step = bad ? -0.06 : clamp((want - dOf(m)) / localSlope(S), -0.12, 0.12);
      S = clamp(S + step, 0, 1);
    }
    // Fairness is a hard rule: keep easing until a real plan clearly beats this Target (measured on games the search never saw).
    for (let k = 0; k < 16 && S > 0; k++) {
      set(id, S);
      if (measure(id, seed0 + 300000, 64).best >= plan.floor) break;
      S = Math.max(0, S - 0.04);
    }
    // Polish: if the fresh score is still more than 4 off (the response can be bumpy near a cliff), scan nearby values on fresh games and
    // keep the closest one where a real plan still clearly wins.
    set(id, S);
    const cur = measure(id, seed0 + 300000, 64);
    if (Math.abs(dOf(cur) - want) > 4) {
      let bestS = S, bestErr = Math.abs(dOf(cur) - want) + (cur.best < plan.floor ? 100 : 0);
      for (let k = -5; k <= 5; k++) {
        const x = clamp(S + k * 0.035, 0, 1);
        if (k === 0) continue;
        set(id, x);
        const m = measure(id, seed0 + 300000, 48);
        const err = Math.abs(dOf(m) - want) + (m.best < plan.floor ? 100 : 0);
        if (err < bestErr) { bestErr = err; bestS = x; }
      }
      S = bestS;
    }
    set(id, S);
    const fin = measure(id, seed0 + 300000, 64);
    const t = getTarget(id);
    out[id] = { S: Number(S.toFixed(3)), want: Math.round(want), D: Math.round(dOf(fin)), M: Math.round(fin.M), best: fin.best, wins: fin.wins, mods: t.mods, abilities: t.abilities.map(a => [a.kind, a.every, a.start, a.strength]) };
    console.log(`T${tr} ${String(i + 1).padStart(2)}/${n} ${id.padEnd(24)} want D ${String(Math.round(want)).padStart(2)}  got D ${String(Math.round(dOf(fin))).padStart(2)}  (breadth ${String(Math.round(fin.M)).padStart(2)}, best ${String(fin.best).padStart(3)})  S=${S.toFixed(2)}${eased ? '  [eased for fairness]' : ''}  (range D ${Math.round(gentle.D)}..${Math.round(harsh.D)})`);
  });
  mkdirSync('scratch', { recursive: true });
  writeFileSync(`scratch/${process.env.OUT ?? 'tuned2'}_T${tr}.json`, JSON.stringify(out, null, 1));
}
