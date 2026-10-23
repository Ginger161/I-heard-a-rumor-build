import { GameState } from './types';
import { getTarget } from './data/targets';
import { getClimate } from './data/climates';
import { nationalBelieverPct } from './selectors';

// A Wordle-style result card, built to be pasted into a group chat.
export const shareText = (s: GameState, stars: number): string => {
  const target = getTarget(s.activeTargetId);
  const day = Math.min(s.currentDay, s.dayBudget);
  const won = s.status === 'WON';
  const believers = Math.round(nationalBelieverPct(s.states));

  const bar = (value: number, hot: string, cool: string, cells = 10) => {
    const n = Math.round((Math.max(0, Math.min(100, value)) / 100) * cells);
    return hot.repeat(n) + cool.repeat(cells - n);
  };

  const result = won ? `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)} Taken down Day ${day}/${s.dayBudget}` : `Failed on Day ${day}/${s.dayBudget}`;
  const lines = [
    `I HEARD A RUMOR ${s.dailyKey ? `📅 Daily ${s.dailyKey}` : ''}`.trim(),
    `${target.shortName} (PR ${target.prRating}) ${getClimate(s.climateId).icon}`,
    result,
    `👥 ${bar(believers, '🟥', '⬜')} ${believers}%`,
    `🚨 ${bar(s.peakHeat, '🟧', '⬜')} peak ${Math.round(s.peakHeat)}%`,
    `🕵️ ${bar(s.peakCoverUp, '🟪', '⬜')} cover-up ${Math.round(s.peakCoverUp)}%`
  ];
  return lines.join('\n');
};
