// Exports day-by-day state of real bot-played games as JSON for the gameplay trailer's 3D map (trailer-gameplay/src/simdata.json).
//   npx esbuild scripts/trailerSim.ts --bundle --platform=node --format=cjs --outfile=node_modules/.cache/trailerSim.cjs --log-level=error && node node_modules/.cache/trailerSim.cjs
import { writeFileSync } from 'node:fs';
import { play, HUMAN } from './botLib';
import { toSvgId } from '../src/engine/data/mapIds';
import type { GameState } from '../src/engine/types';

type Frame = { day: number; heard: Record<string, number>; believers: Record<string, number>; doubt: Record<string, number>; heat: number; coverUp: number; sparks: number; channels: number; freshness: number };
const snap = (s: GameState): Frame => ({
  day: s.currentDay,
  heard: Object.fromEntries(Object.entries(s.states).map(([k, v]) => [toSvgId(k), +((v.heard + v.believers) / v.population).toFixed(3)])),
  believers: Object.fromEntries(Object.entries(s.states).map(([k, v]) => [toSvgId(k), +(v.believers / v.population).toFixed(3)])),
  doubt: Object.fromEntries(Object.entries(s.states).map(([k, v]) => [toSvgId(k), +(v.doubt / 100).toFixed(3)])),
  heat: Math.round(s.heat), coverUp: Math.round(s.coverUp), sparks: Math.round(s.sparks), channels: s.unlockedChannels.length, freshness: Math.round(s.freshness),
});

const run = (target: string, seed: number) => {
  const frames: Frame[] = [];
  const r = play(target, HUMAN, seed, null, undefined, (s) => frames.push(snap(s)));
  return { target, seed, status: r.status, day: r.day, frames };
};

// A run that wins with a long, readable arc (so the map has time to bloom), and one that gets busted.
let win: ReturnType<typeof run> | null = null, lose: ReturnType<typeof run> | null = null;
for (let seed = 1; seed < 400 && (!win || !lose); seed++) {
  for (const t of ['owambe_dj', 'dj_cupcake', 'mr_macaroony']) {
    try {
      const r = run(t, seed);
      if (!win && r.status === 'WON' && r.day >= 20) win = r;
      if (!lose && r.status === 'LOST_HEAT' && r.day >= 14) lose = r;
    } catch { /* unknown id: skip */ }
  }
}
writeFileSync('trailer-gameplay/src/simdata.json', JSON.stringify({ win, lose }));
console.log('win', win && [win.target, win.seed, win.day, win.frames.length], 'lose', lose && [lose.target, lose.seed, lose.day, lose.frames.length]);
