// Balance harness. Plays full runs with three bot skill levels and prints win/loss breakdowns per tier.
//   npm run simulate            (RUNS=12 per target by default; TIER=3, VERBOSE=1, BALANCE='{"coverUpBase":2.4}' env overrides)
import { play, SKILLS } from './botLib';
import { TARGETS, TIERS, targetsInTier } from '../src/engine/data/targets';
import { BALANCE } from '../src/engine/balance';

if (process.env.BALANCE) Object.assign(BALANCE, JSON.parse(process.env.BALANCE));
const RUNS = Number(process.env.RUNS ?? 12);
const only = process.env.TIER ? Number(process.env.TIER) : 0;
const verbose = !!process.env.VERBOSE;

console.log(`days ${BALANCE.dayBudget}, ${RUNS} runs per target`);
for (const tier of TIERS) {
  if (only && tier !== only) continue;
  for (const skill of SKILLS) {
    const tally: Record<string, number> = { WON: 0, LOST_HEAT: 0, LOST_TIME: 0, LOST_COVERUP: 0 };
    let n = 0, dayWin = 0, wins = 0, bel = 0, heat = 0, cover = 0, jaded = 0, ev = 0, ch = 0, doubt = 0;
    const perTarget: string[] = [];
    for (const t of targetsInTier(tier)) {
      let tw = 0;
      for (let i = 0; i < RUNS; i++) {
        const r = play(t.id, skill, 1000 + i * 7919 + tier * 31);
        tally[r.status]++; n++;
        bel += r.believers; heat += r.heat; cover += r.coverUp; jaded += r.peakJaded; ev += r.evidence; ch += r.channels; doubt += r.doubt;
        if (r.status === 'WON') { dayWin += r.day; wins++; tw++; }
      }
      perTarget.push(`${t.id}:${Math.round((tw / RUNS) * 100)}`);
    }
    const p = (k: string) => String(Math.round((tally[k] / n) * 100)).padStart(3);
    console.log(
      `T${tier} ${skill.name.padEnd(8)} WON ${p('WON')}%  heat ${p('LOST_HEAT')}%  cover ${p('LOST_COVERUP')}%  time ${p('LOST_TIME')}%` +
      `  | bel ${(bel / n).toFixed(0)}% heat ${(heat / n).toFixed(0)} cover ${(cover / n).toFixed(0)} doubt ${(doubt / n).toFixed(0)} jaded ${(jaded / n).toFixed(1)}% ch ${(ch / n).toFixed(1)} ev ${(ev / n).toFixed(1)}` +
      (wins ? ` winDay ${(dayWin / wins).toFixed(1)}` : '')
    );
    if (verbose) console.log('     ' + perTarget.join('  '));
  }
}
console.log(`targets: ${TARGETS.length}`);
