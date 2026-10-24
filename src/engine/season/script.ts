import type { ChapterScript, PlotEvent, Scene, StoryEffects } from './types';
import { ACT1, PROLOGUE as ACT1_PROLOGUE } from './act1';

// The whole season's script in one place: the prologue, and what happens around each chapter.
export const PROLOGUE: Scene = ACT1_PROLOGUE;
export const SCRIPTS: Record<string, ChapterScript> = { ...ACT1 };

export const scriptFor = (chapterId: string): ChapterScript | undefined => SCRIPTS[chapterId];
export const allPlotEvents = (): PlotEvent[] => Object.values(SCRIPTS).flatMap(s => s.plot ?? []);

/** What a plot-beat choice does to the story (the events carry it, the finished match applies it). */
export const plotChoiceStory = (eventId: string, choiceId: string): StoryEffects | undefined =>
  allPlotEvents().find(p => p.id === eventId.split(':')[0])?.choices.find(c => c.id === choiceId)?.story;

/** The plot events a chapter schedules: [{ eventId, day }]. */
export const plotOccurrences = (chapterId: string): { eventId: string; day: number }[] => (SCRIPTS[chapterId]?.plot ?? []).map(p => ({ eventId: p.id, day: p.day }));
