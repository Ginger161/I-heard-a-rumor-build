// Plays every Campaign with the bots, to check each is winnable and the ladder ramps up within each kind.
//   RUNS=24 npm run simulate:campaigns        (ONLY=camp_handwash,camp_nets to pick some)
import '../src/engine/data/campaigns';
import { CAMPAIGN_DEFS } from '../src/engine/data/campaigns';
import { play, SKILLS, STRATEGIES, HUMAN } from './botLib';

const RUNS = Number(process.env.RUNS ?? 24);
const only = (process.env.ONLY ?? '').split(',').filter(Boolean);
const skills = SKILLS.filter(s => s.name !== 'sloppy');
CAMPAIGN_DEFS.filter(d => only.length === 0 || only.includes(d.id)).forEach(d => {
  const tot: Record<string, { won: number; n: number }> = { expert: { won: 0, n: 0 }, average: { won: 0, n: 0 } };
  const by: Record<string, number> = {};
  skills.forEach(sk => { for (let c = 0; c < 4; c++) for (let i = 0; i < RUNS; i++) { const r = play(d.id, sk, 300 + c * 977 + i, null); tot[sk.name].n++; if (r.status === 'WON') tot[sk.name].won++; else by[r.status] = (by[r.status] ?? 0) + 1; } });
  // and the ten named plans, as a human would play them
  let pw = 0, pn = 0; STRATEGIES.forEach((st, k) => { for (let i = 0; i < 8; i++) { pn++; if (play(d.id, HUMAN, 700 + k * 131 + i, null, st).status === 'WON') pw++; } });
  const e = Math.round((tot.expert.won / tot.expert.n) * 100), g = Math.round((tot.average.won / tot.average.n) * 100);
  console.log(`${d.id.padEnd(16)} T${d.tier} ${(d.campaign?.type ?? '').padEnd(9)} expert ${String(e).padStart(3)}%  average ${String(g).padStart(3)}%  ten plans ${String(Math.round(pw / pn * 100)).padStart(3)}%  losses ${JSON.stringify(by)}`);
});
