// Bot players: play full runs through the same pure functions the UI uses. Shared by `npm run simulate`, `npm run rate`
// and the Target Studio's balance test.
import { Actions } from './actions';
import { SimulationEngine } from './simulation';
import { CHANNELS_DATA } from './data/channels';
import { EVIDENCE_DATA } from './data/evidence';
import { DEFENSE_DATA } from './data/defense';
import { getTarget } from './data/targets';
import { findChoice } from './events';
import {
  channelAvailable, isFrozen, nationalAverageDoubt, nationalBelieverPct, nationalJadedPct
} from './selectors';
import type { Effect } from './effects';
import type { GameState } from './types';

const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export interface Skill {
  name: string;
  pCollect: number;      // chance to tap each spark / spin bubble in time
  smartBuy: boolean;     // buys by efficiency (else random)
  evidence: 'eager' | 'late' | 'never';
  defend: 'smart' | 'late' | 'never';
  smartEvents: boolean;
  seedHub: boolean;
}

export const SKILLS: Skill[] = [
  { name: 'expert', pCollect: 0.92, smartBuy: true, evidence: 'eager', defend: 'smart', smartEvents: true, seedHub: true },
  { name: 'average', pCollect: 0.7, smartBuy: true, evidence: 'late', defend: 'late', smartEvents: false, seedHub: false },
  { name: 'sloppy', pCollect: 0.45, smartBuy: false, evidence: 'never', defend: 'never', smartEvents: false, seedHub: false }
];

const scoreEffects = (effects: Effect[], cost: number): number => {
  let s = -cost * 0.5;
  effects.forEach(e => {
    if (e.kind === 'freshness') s += e.amount * 0.25;
    if (e.kind === 'investigation') s += e.amount * 0.4;
    if (e.kind === 'coverUp') s -= e.amount * 0.8;
    if (e.kind === 'heat') s -= e.amount * 0.4;
    if (e.kind === 'sparks') s += e.amount * 0.5;
    if (e.kind === 'doubtAll') s -= e.amount * 0.3;
    if (e.kind === 'timed') s += e.effectKind === 'HIGHWAY_MULT' ? 3 : e.effectKind === 'SPARK_BOUNTY' ? 3 : (e.mult - 1) * 6;
  });
  return s;
};

export const play = (targetId: string, skill: Skill, seed: number, perkId: string | null = null) => {
  const rng = mulberry32(seed);
  const target = getTarget(targetId);
  let s: GameState = Actions.startMatch(targetId, target.scandals[0].category, perkId);
  const seedState = skill.seedHub ? 'kano' : ['oyo', 'ekiti', 'benue', 'borno'][seed % 4];
  s = Actions.plantSeed(s, seedState);
  s = Actions.collectSpark(s, `spark_first_${seedState}`);
  s = Actions.dismissTopAlert(s);
  let peakJaded = 0;

  const drainQueue = () => {
    let guard = 0;
    while (s.notificationQueue.length > 0 && guard++ < 20) {
      const top = s.notificationQueue[0];
      if (top.choices && top.eventId) {
        const options = top.choices.filter(c => !c.cost || c.cost <= s.sparks);
        let pick = options[0] ?? top.choices[top.choices.length - 1];
        if (skill.smartEvents) {
          let best = -1e9;
          options.forEach(o => {
            const ch = findChoice(top.eventId!, o.id);
            const sc = ch ? scoreEffects(ch.effects, ch.cost ?? 0) : 0;
            if (sc > best) { best = sc; pick = o; }
          });
        } else if (rng() < 0.5) {
          pick = options[Math.floor(rng() * options.length)] ?? pick;
        }
        const before = s;
        s = Actions.chooseOption(s, pick.id, rng);
        if (s === before) s = { ...s, notificationQueue: s.notificationQueue.slice(1) };
      } else {
        s = Actions.dismissTopAlert(s);
      }
    }
  };

  const act = () => {
    s.activeSparks.forEach(sp => { if (rng() < skill.pCollect) s = Actions.collectSpark(s, sp.id); });
    s.activeSpinBubbles.forEach(b => { if (rng() < skill.pCollect) s = Actions.popSpin(s, b.id); });

    // Defense
    if (skill.defend !== 'never') {
      const threshold = skill.defend === 'smart' ? 45 : 70;
      const frozenNow = Object.keys(s.frozenChannels).some(id => isFrozen(s, id));
      for (const d of DEFENSE_DATA) {
        const uses = s.defensePurchases[d.id] ?? 0;
        if (uses >= d.maxUses || s.sparks < d.cost) continue;
        let want = false;
        if (d.id === 'burner_sim') want = s.heat >= threshold;
        else if (d.id === 'proxy_relay') want = skill.defend === 'smart' ? s.currentDay >= 5 : s.heat >= 60;
        else if (d.id === 'whistleblower') want = skill.defend === 'smart' && s.currentDay >= 4;
        else if (d.id === 'san_injunction') want = skill.defend === 'smart' ? frozenNow || s.activeSpinBubbles.length >= 3 : false;
        else if (d.id === 'safehouse') want = s.heat >= 85;
        if (want) { s = Actions.buyDefense(s, d.id); drainQueue(); }
      }
    }

    // Evidence
    if (skill.evidence !== 'never') {
      const verified = EVIDENCE_DATA.filter(e => !e.isFabricated && !s.droppedEvidence.includes(e.id) && s.investigationProgress >= e.requiredInvestigation).sort((a, b) => b.cost - a.cost);
      const pressing = s.coverUp > (skill.evidence === 'eager' ? 25 : 55) || nationalAverageDoubt(s.states) > 45 || s.freshness < (skill.evidence === 'eager' ? 55 : 30);
      for (const e of verified) {
        if (pressing && s.sparks >= e.cost) { s = Actions.leakEvidence(s, e.id, rng); drainQueue(); }
      }
    }

    // Channels
    for (let g = 0; g < 6; g++) {
      const options = CHANNELS_DATA
        .filter(c => !s.unlockedChannels.includes(c.id) && channelAvailable(s, c) && s.sparks >= c.cost)
        .map(c => ({ c, score: (c.velocity + 1.4 * c.credibility) * (c.synergy.includes(s.scandalCategory) ? 1.35 : 1) / c.cost }))
        .sort((a, b) => (skill.smartBuy ? b.score - a.score : rng() - 0.5));
      if (!options.length) break;
      s = Actions.buyChannel(s, options[0].c.id);
      drainQueue();
    }
    drainQueue();
  };

  let guard = 0;
  while (s.status === 'PLAYING' && guard++ < 60) {
    act();
    s = SimulationEngine.processTick(s, rng);
    drainQueue();
    peakJaded = Math.max(peakJaded, nationalJadedPct(s.states));
  }
  return {
    status: s.status, day: s.currentDay, believers: nationalBelieverPct(s.states), heat: s.heat,
    coverUp: s.coverUp, channels: s.unlockedChannels.length, peakJaded, evidence: s.droppedEvidence.length,
    doubt: nationalAverageDoubt(s.states)
  };
};

