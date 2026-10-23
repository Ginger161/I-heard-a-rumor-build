import { GameState } from './types';
import { CHANNELS_DATA } from './data/channels';
import { EVIDENCE_DATA } from './data/evidence';
import { getTarget } from './data/targets';

// Rules that must hold for every reachable GameState. Used by the fuzz tests, and by sanitizeState (saveManager.ts) to
// decide whether a loaded save can be trusted. Returns a list of human-readable violations (empty = healthy).
const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

export const checkInvariants = (s: GameState): string[] => {
  const bad: string[] = [];
  const num = (label: string, v: unknown, lo = -Infinity, hi = Infinity) => {
    if (!finite(v)) bad.push(`${label} is not a finite number (${String(v)})`);
    else if (v < lo || v > hi) bad.push(`${label} out of range (${v})`);
  };

  num('currentDay', s.currentDay, 1);
  num('dayBudget', s.dayBudget, 1);
  num('sparks', s.sparks, 0);
  num('heat', s.heat, 0, 100);
  num('peakHeat', s.peakHeat, 0, 100);
  num('coverUp', s.coverUp, 0, 100);
  num('peakCoverUp', s.peakCoverUp, 0, 100);
  num('freshness', s.freshness, 0, 100);
  num('investigationProgress', s.investigationProgress, 0, 100);
  num('backfires', s.backfires, 0);
  num('injunctionShield', s.injunctionShield, 0);

  Object.values(s.states).forEach(n => {
    const label = `state ${n.id}`;
    num(`${label}.unaware`, n.unaware, 0);
    num(`${label}.heard`, n.heard, 0);
    num(`${label}.believers`, n.believers, 0);
    num(`${label}.jaded`, n.jaded, 0);
    num(`${label}.doubt`, n.doubt, 0, 100);
    const total = n.unaware + n.heard + n.believers + n.jaded;
    if (total > n.population + 1) bad.push(`${label} holds more people than its population (${total} > ${n.population})`);
  });

  const ids = new Set(CHANNELS_DATA.map(c => c.id));
  if (new Set(s.unlockedChannels).size !== s.unlockedChannels.length) bad.push('duplicate unlocked channels');
  s.unlockedChannels.forEach(id => { if (!ids.has(id)) bad.push(`unknown channel ${id}`); });
  const evIds = new Set(EVIDENCE_DATA.map(e => e.id));
  if (new Set(s.droppedEvidence).size !== s.droppedEvidence.length) bad.push('duplicate dropped evidence');
  s.droppedEvidence.forEach(id => { if (!evIds.has(id)) bad.push(`unknown evidence ${id}`); });

  s.activeSparks.forEach(sp => { if (!finite(sp.amount) || sp.amount < 1) bad.push(`spark ${sp.id} has a bad amount`); });
  s.timedEffects.forEach(e => { if (!finite(e.mult) || e.mult <= 0) bad.push(`timed effect ${e.id} has a bad multiplier`); });
  Object.entries(s.frozenChannels).forEach(([id, until]) => { if (!ids.has(id) || !finite(until)) bad.push(`bad frozen channel ${id}`); });

  if (s.status !== 'LOBBY') {
    const target = getTarget(s.activeTargetId);
    if (s.abilityNext.length !== target.abilities.length) bad.push('abilityNext length does not match the Target');
  }
  s.notificationQueue.forEach(a => {
    if (!a.id || !a.headline || !a.archetype) bad.push('malformed alert in the queue');
  });
  return bad;
};
