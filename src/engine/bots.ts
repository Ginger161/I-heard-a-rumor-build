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
import type { Branch } from './data/channels';
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

// A STRATEGY is a plan a human player can actually follow with what the game offers: which channel lanes to build, how
// quiet to stay, whether to lean on the Target's weak lane, when to leak evidence (and whether to forge), how early to buy
// defence, and where to plant the rumour. `play` can follow one on top of a skill level, so we can ask "does ANY real plan
// beat this Target, and which ones?" instead of only "can a better bot beat it?".
export interface Strategy {
  name: string;
  blurb: string;
  lanes: Record<Branch, number>;      // how much the plan favours each channel lane when buying
  quiet: number;                      // 0..1: how strongly it avoids loud (high Notoriety) channels
  exploit: boolean;                   // lean into the Target's weak lane and away from its resistant lane
  evidence: { cover: number; doubt: number; fresh: number; forge: boolean };  // leak when Cover-Up / Doubt is above, or Freshness below
  defend: 'reactive' | 'proactive';
  seed: string;                       // state to plant the rumour in
}

export const STRATEGIES: Strategy[] = [
  { name: 'blitz', blurb: 'Street and Social first: spread as fast as possible, answer problems late.', lanes: { STREET: 2.2, SOCIAL: 1.8, PRESS: 0.5, ELITE: 0.3 }, quiet: 0, exploit: false, evidence: { cover: 55, doubt: 55, fresh: 25, forge: false }, defend: 'reactive', seed: 'kano' },
  { name: 'proof', blurb: 'Press and Elite first, leak real evidence early: slower, but people believe it.', lanes: { STREET: 1, SOCIAL: 0.5, PRESS: 2.2, ELITE: 1.6 }, quiet: 0.3, exploit: false, evidence: { cover: 25, doubt: 40, fresh: 55, forge: false }, defend: 'reactive', seed: 'fct' },
  { name: 'quiet', blurb: 'Stay under the radar: avoid loud channels, buy defence before you need it.', lanes: { STREET: 1.2, SOCIAL: 0.4, PRESS: 1.8, ELITE: 1.4 }, quiet: 0.8, exploit: false, evidence: { cover: 30, doubt: 45, fresh: 50, forge: false }, defend: 'proactive', seed: 'oyo' },
  { name: 'wildfire', blurb: 'Social media first: go viral, accept the Heat, patch Doubt with evidence.', lanes: { STREET: 1.4, SOCIAL: 2.4, PRESS: 0.7, ELITE: 0.4 }, quiet: 0, exploit: false, evidence: { cover: 45, doubt: 40, fresh: 40, forge: false }, defend: 'reactive', seed: 'lagos' },
  { name: 'exploit', blurb: 'Read the dossier: build the lane they are weak to, avoid the lane they resist.', lanes: { STREET: 1, SOCIAL: 1, PRESS: 1, ELITE: 1 }, quiet: 0.2, exploit: true, evidence: { cover: 35, doubt: 45, fresh: 45, forge: false }, defend: 'reactive', seed: 'kano' },
  { name: 'forger', blurb: 'Fast and dirty: forge evidence early to crush Doubt, and risk being exposed.', lanes: { STREET: 1.5, SOCIAL: 1.5, PRESS: 1, ELITE: 0.6 }, quiet: 0, exploit: false, evidence: { cover: 20, doubt: 25, fresh: 50, forge: true }, defend: 'reactive', seed: 'kano' },
  { name: 'stealth', blurb: 'Quiet plus Exploit: stay under the radar AND build the lane they are weak to.', lanes: { STREET: 1, SOCIAL: 0.5, PRESS: 1.4, ELITE: 1.2 }, quiet: 0.7, exploit: true, evidence: { cover: 30, doubt: 45, fresh: 50, forge: false }, defend: 'proactive', seed: 'oyo' },
  { name: 'sprint', blurb: 'Proof plus speed: Street and Press together, real evidence early, defence only when needed.', lanes: { STREET: 1.8, SOCIAL: 0.8, PRESS: 1.8, ELITE: 0.8 }, quiet: 0.2, exploit: false, evidence: { cover: 25, doubt: 40, fresh: 55, forge: false }, defend: 'reactive', seed: 'kano' },
  { name: 'guarded', blurb: 'Blitz plus defence: go loud on Street and Social but buy protection early.', lanes: { STREET: 2, SOCIAL: 1.4, PRESS: 0.8, ELITE: 0.4 }, quiet: 0.25, exploit: false, evidence: { cover: 40, doubt: 50, fresh: 35, forge: false }, defend: 'proactive', seed: 'lagos' },
  { name: 'fortress', blurb: 'Defence first: block every counter-move, then win slowly with Press and Elite.', lanes: { STREET: 1.2, SOCIAL: 0.8, PRESS: 1.5, ELITE: 1.2 }, quiet: 0.5, exploit: false, evidence: { cover: 35, doubt: 45, fresh: 45, forge: false }, defend: 'proactive', seed: 'fct' }
];

// How well a decent human executes a plan (taps most bubbles, reads the event cards).
export const HUMAN: Skill = { name: 'human', pCollect: 0.85, smartBuy: true, evidence: 'late', defend: 'late', smartEvents: true, seedHub: true };

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

export const play = (targetId: string, skill: Skill, seed: number, perkId: string | null = null, strategy?: Strategy) => {
  const rng = mulberry32(seed);
  const target = getTarget(targetId);
  let s: GameState = Actions.startMatch(targetId, target.scandals[0].category, perkId);
  const seedState = strategy ? strategy.seed : skill.seedHub ? 'kano' : ['oyo', 'ekiti', 'benue', 'borno'][seed % 4];
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
    if (strategy || skill.defend !== 'never') {
      const pro = strategy ? strategy.defend === 'proactive' : skill.defend === 'smart';
      const threshold = pro ? (strategy ? 30 : 45) : strategy ? 60 : 70;
      const frozenNow = Object.keys(s.frozenChannels).some(id => isFrozen(s, id));
      for (const d of DEFENSE_DATA) {
        const uses = s.defensePurchases[d.id] ?? 0;
        if (uses >= d.maxUses || s.sparks < d.cost) continue;
        let want = false;
        if (d.id === 'burner_sim') want = s.heat >= threshold;
        else if (d.id === 'proxy_relay') want = pro ? s.currentDay >= (strategy ? 3 : 5) : s.heat >= 60;
        else if (d.id === 'whistleblower') want = pro && s.currentDay >= (strategy ? 3 : 4);
        else if (d.id === 'san_injunction') want = pro || (strategy && strategy.defend === 'reactive') ? frozenNow || s.activeSpinBubbles.length >= (strategy ? 2 : 3) : false;
        else if (d.id === 'safehouse') want = s.heat >= (strategy ? 80 : 85);
        if (want) { s = Actions.buyDefense(s, d.id); drainQueue(); }
      }
    }

    // Evidence
    if (strategy) {
      const ev = strategy.evidence;
      const pressing = s.coverUp > ev.cover || nationalAverageDoubt(s.states) > ev.doubt || s.freshness < ev.fresh;
      const pool = EVIDENCE_DATA.filter(e => (ev.forge ? true : !e.isFabricated) && !s.droppedEvidence.includes(e.id) && (e.isFabricated || s.investigationProgress >= e.requiredInvestigation)).sort((a, b) => (a.isFabricated === b.isFabricated ? b.cost - a.cost : a.isFabricated ? -1 : 1));
      for (const e of pool) if (pressing && s.sparks >= e.cost) { s = Actions.leakEvidence(s, e.id, rng); drainQueue(); }
    } else if (skill.evidence !== 'never') {
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
        .map(c => ({ c, score: (c.velocity + 1.4 * c.credibility) * (c.synergy.includes(s.scandalCategory) ? 1.35 : 1) / c.cost * (strategy ? strategy.lanes[c.branch] * (strategy.exploit ? (c.branch === target.ai.weaknessBranch ? 2.2 : c.branch === target.ai.resistanceBranch ? 0.5 : 1) : 1) * (1 - strategy.quiet * Math.min(1, c.notoriety * 2.2)) : 1) }))
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

