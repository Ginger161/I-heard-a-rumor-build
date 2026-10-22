import { writeFileSync } from 'fs';
import { Actions } from '../src/engine/actions';
import { SimulationEngine } from '../src/engine/simulation';
import { AlertFactory } from '../src/engine/alerts';
import { getTarget } from '../src/engine/data/targets';
import { EVIDENCE_DATA } from '../src/engine/data/evidence';
import { DEFENSE_DATA } from '../src/engine/data/defense';
import type { GameState } from '../src/engine/types';
let seed = 7; const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const out = process.argv[2];
const base = (t: any, c: any) => { let s = Actions.startMatch(t, c); s = Actions.plantSeed(s, 'kano'); s = Actions.collectSpark(s, 'spark_first_kano'); return Actions.dismissTopAlert(s); };
// mid game: buy a few channels, advance 8 ticks
let mid = base('cryptoking', 'LEAKED_MEDIA'); mid = { ...mid, sparks: 400 };
for (const c of ['social_whatsapp', 'street_agbero', 'press_dialect_fm', 'social_baidasoj']) { mid = Actions.buyChannel(mid, c); mid = { ...mid, notificationQueue: [] }; }
const flights: any[] = [];
for (let i = 0; i < 9; i++) { mid = SimulationEngine.processTick(mid, rng); if (mid.flightEvents.length) flights.push(...mid.flightEvents); mid = { ...mid, notificationQueue: [], sparks: Math.max(mid.sparks, 300) }; }
// force a few spin bubbles + a jaded state for visuals
const ids = Object.values(mid.states).filter(s => s.heard + s.believers > 0).map(s => s.id);
mid.activeSpinBubbles = ids.slice(0, 2).map((id, i) => ({ id: 'spin_t' + i, stateId: id, doubtPenalty: 15, offsetX: 5, offsetY: -5, ticksRemaining: 3 }));
const jid = ids[0]; mid.states[jid] = { ...mid.states[jid], jaded: Math.floor(mid.states[jid].population * 0.3), heard: Math.floor(mid.states[jid].population * 0.3) };
mid.investigationProgress = 60; mid.heat = 72; mid.peakHeat = 72; mid.isPaused = false;
const t = getTarget(mid.activeTargetId);
const queue = [
  AlertFactory.createSeedAlert('Kano', t),
  AlertFactory.createChannelAlert('social_baidasoj', 'LEAKED_MEDIA', t)!,
  AlertFactory.createChannelAlert('press_front_page', 'FINANCIAL', t)!,
  AlertFactory.createEvidenceAlert(EVIDENCE_DATA[4], true, 'LEAKED_MEDIA', t),
  AlertFactory.createDefenseAlert(DEFENSE_DATA[0]),
  { id: 'tip', archetype: 'INFORMANT_TIP' as const, stampText: 'INSIDER DROP // TIER 2', headline: 'New Classified Files Unlocked', body: '"Check your Evidence Locker."', subtext: 'Investigation at 50%', buttonText: 'Open Locker Later', priority: 60 },
];
const saves: Record<string, GameState> = {
  mid, alerts: { ...mid, notificationQueue: queue },
  won: { ...mid, status: 'WON', isPaused: true, currentDay: 13, peakHeat: 66 } as GameState,
  heat: { ...mid, status: 'LOST_HEAT', isPaused: true, heat: 100, peakHeat: 100 } as GameState,
  time: { ...mid, status: 'LOST_TIME', isPaused: true, currentDay: 21 } as GameState,
};
writeFileSync(out + '/saves.json', JSON.stringify({ saves, flights }));
console.log('infected states:', ids.length, 'flights seen:', flights.length);
