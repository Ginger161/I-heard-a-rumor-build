// What does each kind of pressure do to each plan? Applies one pressure family at a few strengths to a neutral Target.
//   ID=cement_sugar_baron RUNS=16 node node_modules/.cache/familyProbe.cjs
import { play, HUMAN, STRATEGIES } from './botLib';
import { getTarget } from '../src/engine/data/targets';

const id = process.env.ID ?? 'cement_sugar_baron';
const RUNS = Number(process.env.RUNS ?? 16);
const t = getTarget(id);
const base = t.abilities.map(a => ({ ...a }));
const r2 = (n: number) => Math.round(n * 20) / 20;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

const FAMILIES: Record<string, (x: number) => void> = {
  none: () => {},
  force: x => { t.mods.heatRate = r2(0.8 + 0.7 * x); t.mods.counterHeat = Math.round(12 * x); },
  spin: x => { t.mods.coverUpRate = r2(0.8 + 0.7 * x); t.abilities.forEach((a, i) => { if (a.kind === 'COUNTER_STORY') a.strength = clamp(Math.round((base[i].strength || 8) * (0.6 + 1.4 * x)), 4, 16); }); },
  faith: x => { t.mods.doubtFlat = Math.round(20 + 40 * x); },
  clock: x => { t.mods.days = -Math.round(12 * x); t.mods.staleRate = r2(1 + 0.4 * x); },
  lane: x => { t.mods.laneSwing = r2(1 + 2 * x); },
  'force+clock': x => { t.mods.heatRate = r2(0.8 + 0.7 * x); t.mods.counterHeat = Math.round(12 * x); t.mods.days = -Math.round(8 * x); },
  'clock+lane': x => { t.mods.days = -Math.round(8 * x); t.mods.laneSwing = r2(1 + 2 * x); },
  'spin+faith': x => { t.mods.coverUpRate = r2(0.8 + 0.7 * x); t.mods.doubtFlat = Math.round(20 + 40 * x); t.abilities.forEach((a, i) => { if (a.kind === 'COUNTER_STORY') a.strength = clamp(Math.round((base[i].strength || 8) * (0.6 + 1.0 * x)), 4, 16); }); }
};
const pad = (n: number | string, w = 5) => String(n).padStart(w);
console.log(`${id} (tier ${t.tier}, weak ${t.ai.weaknessBranch}, resists ${t.ai.resistanceBranch})   ${STRATEGIES.map(s => s.name.slice(0, 5).padStart(5)).join(' ')}`);
for (const [fam, fn] of Object.entries(FAMILIES).filter(([k]) => !process.env.ONLY || process.env.ONLY.split(',').includes(k) || k === 'none')) {
  for (const x of fam === 'none' ? [0] : [0.5, 0.8, 1]) {
    t.mods = {}; t.abilities.forEach((a, i) => { a.every = base[i].every; a.strength = base[i].strength; });
    fn(x);
    const w = STRATEGIES.map(st => { let k = 0; for (let i = 0; i < RUNS; i++) if (play(id, HUMAN, 5000 + i * 7919, null, st).status === 'WON') k++; return Math.round((k / RUNS) * 100); });
    console.log(`  ${fam.padEnd(6)} x=${x.toFixed(2)}   ${' '.repeat(38)}${w.map(v => pad(v)).join(' ')}`);
  }
}
