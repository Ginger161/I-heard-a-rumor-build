import type { PlotEvent } from '../season/types';
import { registerPlotEvents } from '../events';

// THE GUIDED FIRST CASE needs its teachable moments to actually happen: the police noticing, an informant's file, the Target's spin bubbles.
// In a real case they come when the game decides; in the guided case (and only there) they arrive on fixed days, as decision cards that
// name what is happening. The tutorial (ui/components/Tutorial.tsx) then shows the matching lesson. They are never drawn at random.
export const TRAINING_PLOT: PlotEvent[] = [
  {
    id: 'plot_tut_heat', day: 5, archetype: 'SECURITY_WIRE', stamp: 'LESSON • HEAT', headline: 'The Police Have Noticed',
    body: 'Every loud move makes Heat climb. Heat is how close the security services are. At 100% you are busted. They are sniffing around right now.',
    choices: [{ id: 'ok', label: 'Understood', detail: '+16% Heat. Next you will learn how to cool it down.', effects: [{ kind: 'heat', amount: 16 }] }]
  },
  {
    id: 'plot_tut_tip', day: 7, archetype: 'INFORMANT_TIP', stamp: 'LESSON • EVIDENCE', headline: 'A Clerk Slips You a File',
    body: 'Real evidence cuts Doubt and pushes the Target’s cover-up back. An informant has just handed you something worth leaking.',
    choices: [{ id: 'take', label: 'Take the file', detail: '+30% Investigation. Evidence is now ready to leak.', effects: [{ kind: 'investigation', amount: 30 }] }]
  },
  {
    id: 'plot_tut_spin', day: 9, archetype: 'TARGET_PR', stamp: 'LESSON • SPIN', headline: 'Their PR Team Strikes Back',
    body: 'The dark bubbles are the Target’s spin. Tap them before they blow up, or Doubt and Cover-Up jump.',
    choices: [{ id: 'ok', label: 'I will pop them', detail: '2 Spin bubbles appear on the map.', effects: [{ kind: 'spin', count: 2 }] }]
  }
];

export const TRAINING_OCCURRENCES = TRAINING_PLOT.map(p => ({ eventId: p.id, day: p.day }));

registerPlotEvents(TRAINING_PLOT);
