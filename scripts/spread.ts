// How different are the Targets inside each tier, really? Plays every Target with the expert and average bots and
// prints, per tier, each Target's win rate and what usually beats the bot (Heat, Cover-Up or the clock), sorted easiest first.
//   RUNS=30 npm run spread        (TIER=2 for one tier; STORY=1 for the Story Mode cast)
import { play, SKILLS } from './botLib';
import { TARGETS, TIERS, targetsInTier } from '../src/engine/data/targets';
import '../src/engine/data/story';

const RUNS = Number(process.env.RUNS ?? 30);
const only = process.env.TIER ? Number(process.env.TIER) : 0;
const use = SKILLS.filter(s => ['expert', 'average', 'sloppy'].includes(s.name));

interface Row { id: string; slo: number; W: number; win: number; exp: number; avg: number; heat: number; cover: number; time: number; bel: number }
const measure = (id: string, seed0: number): Row => {
  const tally = { WON: 0, LOST_HEAT: 0, LOST_COVERUP: 0, LOST_TIME: 0 } as Record<string, number>;
  let exp = 0, avg = 0, slo = 0, bel = 0, n = 0;
  for (const skill of use) {
    let w = 0;
    for (let i = 0; i < RUNS; i++) {
      const r = play(id, skill, seed0 + i * 7919);
      tally[r.status]++; n++; bel += r.believers;
      if (r.status === 'WON') w++;
    }
    if (skill.name === 'expert') exp = w / RUNS; else if (skill.name === 'average') avg = w / RUNS; else slo = w / RUNS;
  }
  return { id, slo, W: (exp + avg + slo) / 3, win: (tally.WON / n), exp, avg, heat: tally.LOST_HEAT / n, cover: tally.LOST_COVERUP / n, time: tally.LOST_TIME / n, bel: bel / n };
};

const pct = (x: number) => String(Math.round(x * 100)).padStart(3);
const tiers = process.env.STORY ? [] : TIERS;
for (const tier of tiers) {
  if (only && tier !== only) continue;
  const rows = targetsInTier(tier).map(t => measure(t.id, 1000 + tier * 31 + Number(process.env.SEED ?? 0))).sort((a, b) => b.W - a.W);
  const avgs = rows.map(r => r.avg), mean = avgs.reduce((a, b) => a + b, 0) / avgs.length;
  const sd = Math.sqrt(avgs.reduce((a, b) => a + (b - mean) ** 2, 0) / avgs.length);
  console.log(`\nTIER ${tier}   average-bot win: min ${pct(Math.min(...avgs))}%  max ${pct(Math.max(...avgs))}%  spread ${pct(Math.max(...avgs) - Math.min(...avgs))}  sd ${(sd * 100).toFixed(0)}`);
  rows.forEach(r => console.log(`  ${r.id.padEnd(24)} D ${pct(r.W)}  slo ${pct(r.slo)}%  avg ${pct(r.avg)}%  exp ${pct(r.exp)}%   lost to: heat ${pct(r.heat)}  cover ${pct(r.cover)}  clock ${pct(r.time)}   final belief ${r.bel.toFixed(0)}%`));
}
