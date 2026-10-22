// Headless balance harness. Plays full runs through the same pure functions the UI uses.
//   npx esbuild scripts/simulate.ts --bundle --platform=node --format=cjs --outfile=<tmp>/sim.cjs && node <tmp>/sim.cjs
import { Actions } from '../src/engine/actions';
import { SimulationEngine } from '../src/engine/simulation';
import { CHANNELS_DATA } from '../src/engine/data/channels';
import { EVIDENCE_DATA } from '../src/engine/data/evidence';
import { DEFENSE_DATA } from '../src/engine/data/defense';
import { TARGETS, SCANDAL_CATEGORIES } from '../src/engine/data/targets';
import { channelAvailable, nationalAverageDoubt, nationalBelieverPct } from '../src/engine/selectors';
import { BALANCE } from '../src/engine/balance';
import type { GameState } from '../src/engine/types';

const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

interface Strategy { name: string; randomBuy?: boolean; noEvidence?: boolean; credWeight: number; velWeight: number; pCollect: number; defend: boolean; forge: boolean; seedState: string }

const play = (targetId: typeof TARGETS[number]['id'], category: typeof SCANDAL_CATEGORIES[number], strat: Strategy, seed: number) => {
  const rng = mulberry32(seed);
  let s: GameState = Actions.startMatch(targetId, category);
  s = Actions.plantSeed(s, strat.seedState);
  s = Actions.collectSpark(s, `spark_first_${strat.seedState}`);
  s = Actions.dismissTopAlert(s);
  let peakSparks = 0;
  let earned = 15;

  const act = () => {
    // collect sparks / pop spins
    s.activeSparks.forEach(sp => { if (rng() < strat.pCollect) { s = Actions.collectSpark(s, sp.id); earned += sp.amount; } });
    s.activeSpinBubbles.forEach(b => { if (rng() < strat.pCollect) s = Actions.popSpin(s, b.id); });
    // defense
    if (strat.defend) {
      for (const d of [...DEFENSE_DATA].sort((a, b) => b.heatReduction / b.cost - a.heatReduction / a.cost)) {
        const uses = s.defensePurchases[d.id] ?? 0;
        const want = d.emergency ? s.heat >= 80 : s.heat >= 45 || (d.id === 'proxy_relay' && s.currentDay >= 4) || (d.id === 'whistleblower' && s.currentDay >= 3);
        if (want && uses < d.maxUses && s.sparks >= d.cost) { s = Actions.buyDefense(s, d.id); s = Actions.dismissTopAlert(s); }
      }
    }
    // evidence: highest tier first
    const verified = EVIDENCE_DATA.filter(e => !e.isFabricated && !s.droppedEvidence.includes(e.id) && s.investigationProgress >= e.requiredInvestigation).sort((a, b) => b.cost - a.cost);
    for (const e of strat.noEvidence ? [] : verified) {
      if (s.sparks >= e.cost && nationalAverageDoubt(s.states) > 20) { s = Actions.leakEvidence(s, e.id, rng); s.notificationQueue = []; }
    }
    if (strat.forge && nationalAverageDoubt(s.states) > 45) {
      for (const e of EVIDENCE_DATA.filter(x => x.isFabricated && !s.droppedEvidence.includes(x.id))) {
        if (s.sparks >= e.cost) { s = Actions.leakEvidence(s, e.id, rng); s.notificationQueue = []; }
      }
    }
    // channels: best score per cost
    for (let guard = 0; guard < 6; guard++) {
      const options = CHANNELS_DATA
        .filter(c => !s.unlockedChannels.includes(c.id) && channelAvailable(s, c) && s.sparks >= c.cost)
        .map(c => ({ c, score: (c.velocity * strat.velWeight * (c.synergy.includes(category) ? 1.35 : 1) + c.credibility * strat.credWeight * (c.synergy.includes(category) ? 1.35 : 1)) / c.cost }))
        .sort((a, b) => strat.randomBuy ? rng() - 0.5 : b.score - a.score);
      if (!options.length) break;
      s = Actions.buyChannel(s, options[0].c.id);
      s.notificationQueue = [];
    }
    s.notificationQueue = [];
    peakSparks = Math.max(peakSparks, s.sparks);
  };

  let guard = 0;
  while (s.status === 'PLAYING' && guard++ < 60) {
    act();
    s = SimulationEngine.processTick(s, rng);
    s.notificationQueue = [];
  }
  return { status: s.status, day: s.currentDay, believers: nationalBelieverPct(s.states), heat: s.heat, channels: s.unlockedChannels.length, earned };
};

const strategies: Strategy[] = [
  { name: 'balanced', credWeight: 1.5, velWeight: 1, pCollect: 0.85, defend: true, forge: false, seedState: 'kano' },
  { name: 'viral', credWeight: 0.7, velWeight: 1.5, pCollect: 0.85, defend: true, forge: true, seedState: 'lagos' },
  { name: 'casual', credWeight: 1.5, velWeight: 1, pCollect: 0.5, defend: true, forge: false, seedState: 'oyo' },
  { name: 'sloppy', randomBuy: true, noEvidence: true, credWeight: 1, velWeight: 1, pCollect: 0.6, defend: false, forge: false, seedState: 'ekiti' },
  { name: 'reckless', credWeight: 1.5, velWeight: 1, pCollect: 0.85, defend: false, forge: true, seedState: 'kano' }
];

const RUNS = Number(process.env.RUNS ?? 40);
if (process.env.BALANCE) Object.assign(BALANCE, JSON.parse(process.env.BALANCE));
console.log('BALANCE', JSON.stringify(BALANCE));
for (const t of TARGETS) {
  for (const st of strategies) {
    const tally: Record<string, number> = { WON: 0, LOST_HEAT: 0, LOST_TIME: 0 };
    let bel = 0, heat = 0, ch = 0, earned = 0, dayWin = 0;
    for (let i = 0; i < RUNS; i++) {
      const r = play(t.id, t.defaultScandal, st, 1000 + i * 7919);
      tally[r.status] = (tally[r.status] ?? 0) + 1;
      bel += r.believers; heat += r.heat; ch += r.channels; earned += r.earned;
      if (r.status === 'WON') dayWin += r.day;
    }
    console.log(
      `${t.id.padEnd(14)} ${st.name.padEnd(9)} WON ${String(Math.round(tally.WON / RUNS * 100)).padStart(3)}%  HEAT ${String(Math.round(tally.LOST_HEAT / RUNS * 100)).padStart(3)}%  TIME ${String(Math.round(tally.LOST_TIME / RUNS * 100)).padStart(3)}%` +
      `  | avg bel ${(bel / RUNS).toFixed(0)}%  heat ${(heat / RUNS).toFixed(0)}  chans ${(ch / RUNS).toFixed(1)}  sparks earned ${(earned / RUNS).toFixed(0)}` +
      (tally.WON ? `  win day ${(dayWin / tally.WON).toFixed(1)}` : '')
    );
  }
}
