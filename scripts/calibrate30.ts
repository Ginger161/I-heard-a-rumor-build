// Fits the rating curve (src/engine/data/ratingCurve.ts): measures every official Target with all thirty bot plans, then fits a
// rising curve through (difficulty, PR rating). Run it again if the official Targets are re-tuned.
//   npm run calibrate        (RUNS=16 by default; takes a few minutes)
import { writeFileSync, mkdirSync } from 'node:fs';
import { TARGETS } from '../src/engine/data/targets';
import { measureTarget } from '../src/engine/botCheck';

const RUNS = Number(process.env.RUNS ?? 16);
(async () => {
  const rows: { id: string; rating: number; d: number; best: number; breadth: number }[] = [];
  const list = TARGETS.filter(t => !t.storyOnly && !t.packId && !t.id.startsWith('verify_'));
  for (const [i, t] of list.entries()) {
    const m = await measureTarget(t.id, RUNS);
    rows.push({ id: t.id, rating: t.prRating, d: m.difficulty, best: m.best, breadth: Math.round(m.breadth) });
    console.log(`${String(i + 1).padStart(2)}/${list.length} ${t.id.padEnd(26)} rating ${String(t.prRating).padStart(4)}  D ${m.difficulty.toFixed(1).padStart(5)}  best ${String(m.best).padStart(3)}  breadth ${Math.round(m.breadth)}`);
  }
  mkdirSync('scratch', { recursive: true });
  writeFileSync('scratch/calib30.json', JSON.stringify(rows, null, 1));

  // Pool-adjacent-violators: the best rising fit of rating against difficulty.
  const pts = rows.slice().sort((a, b) => a.d - b.d || a.rating - b.rating);
  type Block = { d: number; r: number; n: number };
  const blocks: Block[] = [];
  pts.forEach(p => {
    blocks.push({ d: p.d, r: p.rating, n: 1 });
    while (blocks.length > 1 && blocks[blocks.length - 2].r > blocks[blocks.length - 1].r) {
      const b = blocks.pop()!, a = blocks.pop()!;
      blocks.push({ d: (a.d * a.n + b.d * b.n) / (a.n + b.n), r: (a.r * a.n + b.r * b.n) / (a.n + b.n), n: a.n + b.n });
    }
  });
  // Thin the blocks to about ten knots, always keeping the ends.
  const want = Math.min(10, blocks.length);
  const knots: [number, number][] = [];
  for (let i = 0; i < want; i++) { const b = blocks[Math.round((i * (blocks.length - 1)) / Math.max(1, want - 1))]; knots.push([Math.round(b.d * 10) / 10, Math.round(b.r / 10) * 10]); }
  const uniq = knots.filter((k, i) => i === 0 || (k[0] > knots[i - 1][0] && k[1] >= knots[i - 1][1]));
  // Pin the ends so an easier or harder Target than any official one still gets a sensible rating.
  const lo = uniq[0], hi = uniq[uniq.length - 1];
  const full: [number, number][] = [[0, Math.min(300, lo[1])], ...(lo[0] > 0.5 ? [lo] : []), ...uniq.slice(lo[0] > 0.5 ? 1 : 1), [100, Math.max(3500, hi[1])]];
  const body = `// RATING CURVE: how the bot check turns a Target's measured difficulty (D, 0 = trivial, 100 = impossible, from all thirty bot plans)
// into a PR rating. Fitted to the ${rows.length} official Targets by scripts/calibrate30.ts, so a player-made Target is rated on the
// same ladder as the official ones: a 1,400 Arena Target is about as hard as an official 1,400.
export const RATING_KNOTS: [number, number][] = ${JSON.stringify(full)};

export const ratingFromD = (d: number): number => {
  const k = RATING_KNOTS;
  if (d <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (d <= k[i][0]) {
      const [x0, y0] = k[i - 1], [x1, y1] = k[i];
      return Math.round((y0 + ((y1 - y0) * (d - x0)) / Math.max(1e-9, x1 - x0)) / 10) * 10;
    }
  }
  return k[k.length - 1][1];
};
`;
  writeFileSync('src/engine/data/ratingCurve.ts', body);
  console.log('\nknots:', JSON.stringify(full));
})();
