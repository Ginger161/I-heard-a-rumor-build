import { Actions } from '../src/engine/actions';
import { SimulationEngine } from '../src/engine/simulation';
import { nationalBelieverPct, nationalHeardPct, nationalAverageDoubt, computeMasterVariables } from '../src/engine/selectors';
let seed = 42; const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
for (const [label, buy] of [['NO CHANNELS', []], ['whatsapp+agbero only', ['social_whatsapp', 'street_agbero']]] as const) {
  let s = Actions.startMatch('godfather', 'FINANCIAL');
  s = Actions.plantSeed(s, 'kano'); s = Actions.collectSpark(s, 'spark_first_kano'); s = Actions.dismissTopAlert(s);
  s = { ...s, sparks: 1000 }; buy.forEach(b => { s = Actions.buyChannel(s, b); s.notificationQueue = []; });
  console.log('==', label);
  for (let d = 0; d < 20 && s.status === 'PLAYING'; d++) {
    s = SimulationEngine.processTick(s, rng); s.notificationQueue = [];
    const v = computeMasterVariables(s);
    console.log(`day ${s.currentDay} heard ${nationalHeardPct(s.states).toFixed(1)}% bel ${nationalBelieverPct(s.states).toFixed(1)}% doubt ${nationalAverageDoubt(s.states).toFixed(0)} heat ${s.heat.toFixed(0)} V ${v.velocity.toFixed(2)} C ${v.credibility.toFixed(2)}`);
  }
}
