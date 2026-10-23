import { ChatterPing } from './types';
import { getTarget } from './data/targets';
import { pickChatter, ChatterEvent } from './data/aiProfiles';

let nextId = 1;

// Build a Polaroid speech-bubble ping for the active Target. The UI shows it for BALANCE.chatterMs.
export const chatterPing = (targetId: string | null, event: ChatterEvent, rng: () => number = Math.random): ChatterPing => {
  const target = getTarget(targetId);
  return { id: nextId++, event, text: pickChatter(target.ai, event, rng) };
};
