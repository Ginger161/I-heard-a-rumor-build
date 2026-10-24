// Re-orders each tier in scripts/difficultyPlan.ts by the MEASURED difficulty score (scratch/strat_T*.log from `npm run strategies`),
// so the PR rating, which follows the plan order, always matches how hard the Targets really are. Targets whose rating is fixed by
// (The old fixed design-document ratings are no longer used: a rating has to mean difficulty.)
//   node scripts/reorderPlan.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const plan = readFileSync('scripts/difficultyPlan.ts', 'utf8');

let out = plan;
const moved = [];
for (const tier of [1, 2, 3, 4, 5]) {
  const log = `scratch/strat_T${tier}.log`;
  if (!existsSync(log)) { console.log(`no measurements for tier ${tier}`); continue; }
  const D = {};
  for (const line of readFileSync(log, 'utf8').split('\n')) {
    const m = line.match(/^\s+([a-z_0-9]+)\s+(?:\d+\s+){10}\|\s+D\s*(\d+)/);
    if (m) D[m[1]] = Number(m[2]);
  }
  // The tier's line looks like:   N: { easy: .., hard: .., floor: .., order: ['a', 'b', ...] },
  const lineStart = out.indexOf(`\n  ${tier}: {`);
  const open = out.indexOf('order: [', lineStart);
  const close = out.indexOf(']', open);
  const current = out.slice(open + 'order: ['.length, close).split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
  const ranked = current.slice().sort((a, b) => (D[a] ?? 0) - (D[b] ?? 0) || current.indexOf(a) - current.indexOf(b));
  const final = ranked;
  final.forEach((id, i) => { if (current[i] !== id) moved.push(`${id} (T${tier})`); });
  out = out.slice(0, open) + `order: [${final.map(id => `'${id}'`).join(', ')}` + out.slice(close);
}
writeFileSync('scripts/difficultyPlan.ts', out);
console.log(`${moved.length} Targets changed position.`);
