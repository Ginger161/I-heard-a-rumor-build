// DIFFICULTY SCORE D (0 = trivial, 100 = impossible) = half 'how many plans fail' (100 - breadth) + half 'how hard is even the best plan' (100 - best).
// Which plans beat which Targets? Every named strategy (see STRATEGIES in src/engine/bots.ts) plays every Target as a decently
// skilled human would. A Target that no plan beats is unfair; a Target that every plan beats has no puzzle in it.
//   TIER=2 RUNS=20 node node_modules/.cache/strategies.cjs
import { play, HUMAN, STRATEGIES } from './botLib';
import { TIERS, targetsInTier } from '../src/engine/data/targets';

const RUNS = Number(process.env.RUNS ?? 16);
const only = process.env.TIER ? Number(process.env.TIER) : 0;
const SEED = Number(process.env.SEED ?? 0);
const pad = (n: number | string, w = 4) => String(n).padStart(w);

for (const tier of TIERS) {
  if (only && tier !== only) continue;
  console.log(`\nTIER ${tier}   ${STRATEGIES.map(s => s.name.slice(0, 5).padStart(5)).join(' ')}   | beaten by (>=50%)`);
  const sums = STRATEGIES.map(() => 0);
  const list = targetsInTier(tier);
  for (const t of list) {
    const wins = STRATEGIES.map((st, k) => {
      let w = 0;
      for (let i = 0; i < RUNS; i++) if (play(t.id, HUMAN, 1000 + tier * 31 + SEED + k * 104729 + i * 7919, null, st).status === 'WON') w++;
      return Math.round((w / RUNS) * 100);
    });
    wins.forEach((w, i) => { sums[i] += w; });
    const beat = STRATEGIES.filter((_, i) => wins[i] >= 50).map(s => s.name);
    // The best plan is picked on the games above and then re-played on different games, so choosing the best of ten noisy results
    // does not make a Target look fairer than it is.
    const kBest = wins.indexOf(Math.max(...wins));
    let wb = 0;
    for (let i = 0; i < RUNS; i++) if (play(t.id, HUMAN, 1000 + tier * 31 + SEED + 700000 + kBest * 104729 + i * 7919, null, STRATEGIES[kBest]).status === 'WON') wb++;
    const bestFair = Math.round((wb / RUNS) * 100);
    const m10 = Math.round(wins.reduce((a, b) => a + b, 0) / wins.length);
    const D = Math.round(0.5 * (100 - bestFair) + 0.5 * (100 - m10));
    console.log(`  ${t.id.padEnd(24)} ${wins.map(w => pad(w, 5)).join(' ')}  | D${pad(D, 3)} M${m10} best ${bestFair}  ${beat.length ? beat.join(',') : '(nothing)'}`);
  }
  console.log(`  ${'AVERAGE'.padEnd(24)} ${sums.map(x => pad(Math.round(x / list.length), 5)).join(' ')}`);
}
