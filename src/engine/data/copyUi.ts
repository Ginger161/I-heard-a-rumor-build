import { pickFrom } from './copy';

// UI-facing copy variants (seed-picked, so a run stays consistent but runs differ).

export const TAGLINES = [
  'Investigative Tabloid Edition. Choose your target.',
  'Gist travels faster than fuel. Choose your target.',
  'Every rumour needs a first whisper. Whose?',
  'The streets are listening. Pick a file.',
  'Receipts, rumours and a very long timeline.',
  'Today\'s news is tomorrow\'s hot gist.',
  'Light a match. Watch the whole country burn.',
  'Somebody is about to have a very bad week.'
];

export const TIPS = [
  'Chain two Press or Elite channels to crack the elite hubs (Lagos, FCT, Ogun, Kaduna).',
  'A stale story makes your channels up to 45% weaker. Leak evidence and buy channels to refresh it.',
  'Shatter Spin bubbles before they detonate: each one adds Doubt and Cover-Up.',
  'Matching a channel to your scandal gives it a ×1.35 bonus.',
  'Check each Target\'s weak lane (×1.25) and resisted lane (×0.75) on the Conspiracy Board.',
  'A SAN Counter-Injunction thaws frozen channels and blocks the next two injunctions.',
  'Golden sparks are rare. Chase them: they pay triple.',
  'Forgeries are cheap and risky. Never gamble when Doubt is above 55%.',
  'The Cover-Up creeps up faster as more people believe. Verified evidence pushes it back.',
  'Heat above 90% brings the vans. Spend on Defense before it gets there.',
  'A Stoic hides its attack until 55% Believers. Keep a reserve of Sparks.',
  'A Crashout melts down early and hands you free Velocity. Use it fast.',
  'Schemers plant fake bombshells. Verify the source before you publish.',
  'Seed a hub like Lagos or Kano for the fastest early spread.',
  'Land-border spread dies in the rain. Check the news climate before you pick a Target.',
  'Tap sparks in quick succession for a combo streak.',
  'Events never force a bad choice: there is always a free option.',
  'Take the Daily Case for a once-a-day bonus, and keep your streak alive.',
  'Stars: win early, stay cool and never get exposed for a perfect three.',
  'Bribe one Informant to peek behind a sealed file, or earn four stars to open the whole tier.',
  'Fresh evidence refreshes the story. Do not sit on a Tier 4 file.',
  'A Distractor drains your Freshness. Counter with new channels.',
  'Paranoid Targets punish genuine evidence with extra Heat. Space your leaks.',
  'Lawyer Up Targets freeze your channels longer. Keep a SAN in reserve.'
];

export const pickTip = (seed: number, salt = ''): string => pickFrom(TIPS, 'tip' + salt, seed);
export const pickTagline = (seed: number): string => pickFrom(TAGLINES, 'tag', seed);

// ---------------- endgame ----------------
export const WIN_HEADLINES = [
  'Target Disgraced! EFCC Arrest & Resignation!',
  'Resign Now! {Short} Out After Nationwide Outrage!',
  'Gist Wins! {Short} Finally Cornered!',
  'It Is Over! {Short} Steps Aside!'
];
export const WIN_BODIES = [
  'After {days} days of whispers, receipts and relentless gist, {Name} has been detained by anti-graft operatives and has tendered a resignation letter. Crowds outside {Short}\'s residence are singing. Motor parks, WhatsApp groups and pulpits agree on one thing: the story was true.',
  '{Name} resigned at dawn after {days} days of mounting pressure. Aides say the final straw was a viral voice note nobody could explain. The motor parks are celebrating.',
  'The silence from {Short}\'s camp lasted exactly eleven minutes before the resignation letter dropped. {days} days, one nation, and zero patience left.',
  'Allies deleted their photos, lawyers stopped answering calls, and by day {days} {Short} had nowhere left to stand.'
];
export const PARODY_WIN_BODIES = [
  'After {days} days of memes, receipts and relentless gist, {Short} has posted a four-minute apology video with soft piano music and announced a "break to reflect". Fans are split. The comment section is not.',
  '{Short} has been cancelled. A statement written by seven people and approved by none says it is "taking time away from the spotlight". The spotlight has not been notified.',
  'By day {days}, {Short} had deleted the posts, un-followed everyone and gone silent. A very vague hiatus has been announced.',
  '{days} days later, {Short} issued a blurry apology filmed in a car. The comment section ratioed it in under a minute.'
];

export const LOSE_HEAT_HEADLINES = [
  'Safehouse Raided! Operatives Seize Laptops & Burner Phones',
  'Knock Knock! DSS Kicks In Your Door',
  'Busted! Hilux Vans Surround Your Hideout'
];
export const LOSE_HEAT_BODIES = [
  'At 04:12, unmarked Hilux vans closed off the street. Your operation against {Short} reached {pct}% belief before Heat hit 100%. Every device in the room is now evidence against you.',
  'The door came off its hinges at dawn. Laptops, burner phones and one very expensive router left in evidence bags. {Short} sent a polite thank-you note.',
  'Three vans, no plates, and a very patient man with a clipboard. You had {pct}% belief when the knock came.'
];
export const LOSE_TIME_HEADLINES = [
  'Rumor Fizzles Out! {Short} Survives the News Cycle',
  'Gist Goes Cold! {Short} Walks Away Smiling',
  'Nobody Cares Anymore! The Story Is Dead'
];
export const LOSE_TIME_BODIES = [
  '{days} days came and went. Only {pct}% of the country was convinced, and the nation has already moved on to a new scandal, a new fuel price and a new football argument. {Name} is back on television, smiling.',
  'The news cycle swallowed the story whole. {pct}% believed it, the rest had already forgotten it. {Short} sent out a cheerful post about gratitude.',
  'By the final day, the timeline was arguing about something else entirely. {Short} had never looked calmer.'
];
export const LOSE_COVERUP_HEADLINES = [
  'Story Spun! {Short} Walks Free',
  '{Short} Declares Total Victory!',
  'Case Closed! The Cover-Up Works'
];
export const LOSE_COVERUP_BODIES = [
  'The cover-up reached 100% on Day {day}. Editors stopped returning calls, the lawyers got their injunctions, and your channels fell silent one by one. The story is dead, and not even you can revive it.',
  'Day {day}: the press conference went perfectly. By evening, every outlet had quietly archived the story. {Short} thanked "the good people of this country".',
  'A single statement, read at noon on Day {day}, closed the matter. It had a flag in the background and no follow-up questions.'
];

export const fillEnd = (text: string, vars: Record<string, string | number>): string =>
  text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m));

// ---------------- street gist, by zone ----------------
export const ZONE_PLACES: Record<string, string[]> = {
  SW: ['the Lagos danfo parks', 'Ibadan markets', 'Abeokuta bus stops'],
  SE: ['Onitsha markets', 'Enugu viewing centres', 'Aba shops'],
  SS: ['Port Harcourt joints', 'Warri motor parks', 'Calabar bus stops'],
  NC: ['Jos markets', 'Abuja gist corners', 'Ilorin motor parks'],
  NE: ['Maiduguri tea stands', 'Bauchi markets', 'Yola motor parks'],
  NW: ['Kano markets', 'Kaduna tea spots', 'Sokoto motor parks']
};

export const GIST = {
  UNAWARE: [
    'Dead silence. Nobody in this state has heard a single whisper yet.',
    'Business as usual in {place}. Not one person has mentioned the story.',
    'Quiet as a Sunday afternoon. This place has no idea yet.'
  ],
  EARLY: [
    'Quiet whispers at {place}. People are asking if it\'s true...',
    'A few people at {place} are leaning in and lowering their voices.',
    'The first rumours are drifting around {place}. Nobody is sure yet.'
  ],
  MID: [
    'Screenshots are flying and everyone has an opinion. The debate is getting louder by the hour.',
    '{place} is buzzing. Everybody has an uncle who "knows somebody".',
    'The gist is everywhere now. Even the people who do not care are pretending to.'
  ],
  CAP: [
    'The streets are calling cap! People think this is a paid political hatchet job without receipts.',
    '{place} is rolling its eyes. "Where is the proof?" is the question of the day.',
    'Doubt is everywhere. People here want receipts, not rumours.'
  ],
  JADED: [
    'Gist fatigue has set in. Citizens are tired of hearing talk with no hard evidence.',
    'People at {place} have heard it all before and have stopped listening.',
    'The excitement has gone flat. Nobody wants to hear it again without proof.'
  ],
  OUTRAGE: [
    'Open outrage across the state! Street debates and radio callers are demanding immediate arrest.',
    '{place} has boiled over. Radio lines are jammed and the whole state wants answers.',
    'Placards are being painted at {place}. This is no longer gossip.'
  ]
} as const;

export const pickGist = (kind: keyof typeof GIST, zone: string, seed: number, stateId: string): string => {
  const place = pickFrom(ZONE_PLACES[zone] ?? ZONE_PLACES.NC, 'place:' + stateId, seed);
  return pickFrom([...GIST[kind]], 'gist:' + kind + stateId, seed).replace(/\{place\}/g, place);
};

export const PARODY_WIN_HEADLINES = [
  'Target Cancelled! Apology Video & Indefinite Hiatus!',
  'Cancelled! {Short} Posts a Very Long Apology',
  'The Internet Has Spoken: {Short} Is Over'
];
