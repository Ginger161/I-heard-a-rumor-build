import type { StoryProgress } from '../story';
import { PROLOGUE, scriptFor } from './script';
import { STORY_CHAPTERS } from '../data/story';
import type { CastId, Scene } from './types';
import { CAST_INFO } from './cast';

// THE PLAIN-WORDS LAYER of Story Mode: what happened so far, who is who, and what the three meters mean. Nothing here changes the
// story; it only says it again, simply, so a player who comes back after a week knows where they are. Keep every line spoiler-free:
// each says only what the player has already been shown.

/** Why you are here, shown before the first chapter. */
export const PREMISE = 'You run The Receipts, an anonymous page that exposes liars in Lagos. Biko, 19, is your assistant. Then somebody writes your apology before you have done anything wrong.';

/** What happened in each chapter, in two sentences, shown as "Previously…" when the next one is opened. Chapters without one fall back to the premise. */
export const RECAPS: Record<string, string> = {
  c01: 'You took down the ex who ghosted you and owed you ₦2.4 million. The receipt came from a stranger, @OracleNaija, and carried three letters: HRP, the firm you used to work for.',
  c02: 'A second phone proved the cheater’s lies. It had a contact called “HRP Ops”, and Biko stared at it a beat too long.',
  c03: 'A friend who knew everything had been feeding a group chat about you. Contact number eleven was “G. PRIME”, a name you have waited years to hear.',
  c04: 'A rival page, Gistlord, found out who you are and said so on air. Your page is now the biggest story in Lagos, and you are no longer sure who is telling it.',
  c05: 'The deck your colleague took credit for was written by a ghostwriter at HRP, called R. Folorunsho. She is the Oracle, and her real name is Fola.',
  c06: 'Your boss was told, in writing, to keep you in that job on purpose: "Do not terminate. Instruct." Then Inspector Coker stepped into your lift, very politely.',
  c07: 'Your business partner was paying a monthly retainer out of your own account. A journalist, Zainab Lawal, has noticed. Biko took your phone to "fix the crop", and gave it back smiling.',
  c08: 'In the blackout, a CCTV still showed Biko outside HRP. He has been on their payroll since the first month. You decided what to do about him, and it will follow you for the rest of the season.',
  c09: 'Your mother-in-law has been paid by "H.R.P." for six years, from the month you left Halo. The last page of her notebook lists names with ticks. Yours is the only one without.',
  c10: 'A clause in your marriage papers was added after signing, by a lawyer on HRP’s panel. Your ex told you: "I was told what would happen if I stayed."',
  c11: 'Your uncle’s deed was notarised by the same HRP lawyer, and behind it was a page in Halo’s handwriting: "Project Mirror, Year 4." Everyone you exposed was a step. You were built.',
  c12: 'The apologies are written on HRP’s fourteenth floor by thirty ghostwriters, and Fola is one of them. You took Madam Ngozi’s drive. One folder on it is named CHAPTER 16.',
  c13: 'Chief Mbakwe’s calendar has one line for election eve: "6:06 PM. The Receipt." The plan is to have you post a fabricated receipt, because the public believes you. Halo invited you to the wedding.',
  c14: 'At the wedding you found the file: a fabricated receipt, already written in your voice, and a signed donor list. Then Biko messaged: there is an Inspector at the gate, and he did not call him.',
  c15: 'Inspector Coker has known who you are for four months and has not arrested you. He wanted whoever was aiming the page. At 6:06 a new statement arrived in your voice: "I want to address the allegations against Halo."'
};

/** The recap to show before chapter `idx` (0-based): what the chapter before it left you with. */
export const recapBefore = (idx: number): string => (idx <= 0 ? PREMISE : RECAPS[STORY_CHAPTERS[idx - 1]?.id] ?? PREMISE);

/** One line on who each person is, as far as the player knows. */
export const CAST_ROLE: Record<Exclude<CastId, 'target' | 'you'>, string> = {
  biko: 'Your assistant, 19. A broke, funny student who schedules your posts and asks “is it true, and is it worth it?”',
  halo: 'Dr. Halo, your old mentor. He taught you the trade at Halo Reputation Partners (HRP), the firm you left.',
  ngozi: 'Madam Ngozi, HRP’s fixer. She posts the statements and remembers everybody’s birthday.',
  fola: 'Fola, a young writer inside HRP. She sends you tips through an anonymous account.',
  coker: 'Inspector Coker, Cybercrime Unit. Polite, patient, and trying to find out who owns The Receipts.',
  zainab: 'Zainab Lawal, an investigative journalist at The Ledger. She distrusts gossip pages on principle.',
  gistlord: 'Gistlord Prime, a rival page admin. Loud, vain and clever.',
  mbakwe: 'Chief Mbakwe, a kingmaker and one of HRP’s oldest clients.'
};

const scenesOf = (): Scene[] => [PROLOGUE, ...STORY_CHAPTERS.flatMap(c => { const s = scriptFor(c.id); return s ? [s.pre, s.won, ...(s.lost ? [s.lost] : [])] : []; })];

/** The people the player has met: everyone who has spoken or messaged in a scene they have seen. */
export const castMet = (story: StoryProgress): Exclude<CastId, 'target' | 'you'>[] => {
  const met = new Set<string>();
  scenesOf().filter(s => story.scenesSeen.includes(s.id)).forEach(s => s.beats.forEach(b => {
    if (b.t === 'say') met.add(b.who);
    if (b.t === 'chat') b.msgs.forEach(m => met.add(m.from));
  }));
  return (Object.keys(CAST_INFO) as Exclude<CastId, 'target' | 'you'>[]).filter(id => met.has(id));
};

/** What the three numbers in Story Mode mean. */
export const GLOSSARY = [
  { icon: '🤝', name: 'Biko’s trust', text: 'How much your assistant believes in you. Honest choices raise it, secrets lower it. Some scenes only open when it is high.' },
  { icon: '🕵️', name: 'Inspector Coker', text: 'How close the Cybercrime Unit is to finding you. Loud, sloppy moves bring him closer. The closer he is, the harder the later chapters get.' },
  { icon: '📌', name: 'Clues', text: 'Pieces of the hidden story: who is behind the rumours about you. Scenes pin them to the Clue Board. Find them all to understand the ending.' },
  { icon: '⚖️', name: 'Reputation', text: 'Whether people trust your page. Winning with Receipts Only raises it; forged files and dirty tricks lower it. It changes how much Doubt each new story starts with.' }
];
