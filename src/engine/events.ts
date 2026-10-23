import { AlertArchetype, AlertChoice, GameAlert, GameState } from './types';
import { Effect } from './effects';
import { ZONE_IDS, ZONE_NAMES, ZoneId } from './data/zones';
import { fillTarget, getTarget } from './data/targets';
import { Rng } from './effects';
import { pickFrom } from './data/copy';

// Nigerian world events and informant tips. Every event is a decision card: the clock stays stopped
// until the player picks an option, and the option's effects are applied then.

export interface EventChoice {
  id: string;
  label: string;
  detail: string;   // Shown under the button
  cost?: number;    // Sparks
  effects: Effect[];
}

export interface EventDef {
  id: string;
  archetype: AlertArchetype;
  stamp: string;
  headline: string;   // {Target} and {zone} are substituted
  body: string;
  minDay?: number;
  weight: number;
  zoned?: boolean;    // Picks a random geopolitical zone at spawn
  requires?: (s: GameState) => boolean;
  choices: (zone?: ZoneId) => EventChoice[];
}

const ownsBranch = (s: GameState, branch: string) =>
  s.unlockedChannels.some(id => id.startsWith(branch.toLowerCase() + '_'));

export const EVENTS: EventDef[] = [
  {
    id: 'power_outage',
    archetype: 'STREET_WHISPER',
    stamp: 'UP NEPA? NOT TODAY',
    headline: 'Blackout Hits the {zone}',
    body: 'The grid collapsed again. Phones are dying, viewing centres are dark, and nobody in the {zone} is talking about anything but light.',
    weight: 3,
    zoned: true,
    choices: zone => [
      { id: 'ride', label: 'Wait for the light', detail: 'The {zone} spreads at 60% speed for 4 days', effects: [{ kind: 'timed', effectKind: 'ZONE_FRICTION', days: 4, mult: 0.6, label: 'Blackout', zone }] },
      { id: 'generators', label: 'Power the viewing centres', detail: '-12 ⚡ • Spread slows only to 85% for 2 days • +8 Freshness', cost: 12, effects: [
        { kind: 'timed', effectKind: 'ZONE_FRICTION', days: 2, mult: 0.85, label: 'Blackout', zone }, { kind: 'freshness', amount: 8 }] }
    ]
  },
  {
    id: 'fuel_protests',
    archetype: 'STREET_WHISPER',
    stamp: 'FUEL PRICE HIKE',
    headline: 'Fuel Price Jumps Overnight',
    body: 'Petrol went up again and the streets are angry. Everyone is looking for someone to blame, and {Target} is the easiest name to shout.',
    minDay: 4,
    weight: 3,
    choices: () => [
      { id: 'join', label: 'Join the protest hashtag', detail: '+25 Freshness • +8% Heat', effects: [{ kind: 'freshness', amount: 25 }, { kind: 'heat', amount: 8 }] },
      { id: 'stay', label: 'Stay out of it', detail: '+6 Freshness', effects: [{ kind: 'freshness', amount: 6 }] }
    ]
  },
  {
    id: 'detty_december',
    archetype: 'STREET_WHISPER',
    stamp: 'DETTY DECEMBER',
    headline: 'The Travel Rush Begins',
    body: 'Half of Lagos is on the road to the village. Motor parks are packed, and every passenger carries gist in their pocket.',
    minDay: 5,
    weight: 2,
    choices: () => [
      { id: 'ride', label: 'Ride the traffic', detail: 'Land-border spread doubles for 4 days', effects: [{ kind: 'timed', effectKind: 'HIGHWAY_MULT', days: 4, mult: 2, label: 'Travel rush' }] },
      { id: 'sponsor', label: 'Sponsor "gist buses"', detail: '-15 ⚡ • Spread doubles for 5 days • +10 Freshness', cost: 15, effects: [
        { kind: 'timed', effectKind: 'HIGHWAY_MULT', days: 5, mult: 2, label: 'Travel rush' }, { kind: 'freshness', amount: 10 }] }
    ]
  },
  {
    id: 'asuu_strike',
    archetype: 'BREAKING_FRONT',
    stamp: 'ASUU DECLARES STRIKE',
    headline: 'Lecturers Down Tools Again',
    body: 'Universities have closed and thousands of students are at home with phones in hand and time to read.',
    minDay: 5,
    weight: 2,
    choices: () => [
      { id: 'back', label: 'Back the lecturers', detail: '-8 ⚡ • +20 Freshness • -5% Doubt • +4% Heat', cost: 8, effects: [
        { kind: 'freshness', amount: 20 }, { kind: 'doubtAll', amount: -5 }, { kind: 'heat', amount: 4 }] },
      { id: 'stay', label: 'Stay out of it', detail: '+8 Freshness', effects: [{ kind: 'freshness', amount: 8 }] }
    ]
  },
  {
    id: 'network_outage',
    archetype: 'STREET_WHISPER',
    stamp: 'NETWORK DOWN',
    headline: 'Network Outage Across the Country',
    body: 'Calls fail, data crawls, and WhatsApp stops delivering. Your Social channels are struggling.',
    minDay: 4,
    weight: 2,
    requires: s => ownsBranch(s, 'SOCIAL'),
    choices: () => [
      { id: 'wait', label: 'Wait it out', detail: 'Social channels at 50% for 3 days', effects: [{ kind: 'timed', effectKind: 'BRANCH_MULT', days: 3, mult: 0.5, label: 'Outage', branch: 'SOCIAL' }] },
      { id: 'sms', label: 'Send a bulk SMS blast', detail: '-10 ⚡ • Social channels at 85% for 3 days', cost: 10, effects: [{ kind: 'timed', effectKind: 'BRANCH_MULT', days: 3, mult: 0.85, label: 'Outage', branch: 'SOCIAL' }] }
    ]
  },
  {
    id: 'platform_ban',
    archetype: 'BREAKING_FRONT',
    stamp: 'PLATFORM BAN THREAT',
    headline: 'Government Threatens a Social Platform Ban',
    body: 'Officials announced that a major platform "will be suspended for the sake of national security". Your followers are panicking.',
    minDay: 8,
    weight: 1,
    requires: s => ownsBranch(s, 'SOCIAL'),
    choices: () => [
      { id: 'accept', label: 'Accept it', detail: 'Social channels at 60% for 4 days', effects: [{ kind: 'timed', effectKind: 'BRANCH_MULT', days: 4, mult: 0.6, label: 'Platform ban', branch: 'SOCIAL' }] },
      { id: 'vpn', label: 'Share VPN tutorials', detail: '-10 ⚡ • Social channels at 90% for 4 days • +4% Heat', cost: 10, effects: [
        { kind: 'timed', effectKind: 'BRANCH_MULT', days: 4, mult: 0.9, label: 'Platform ban', branch: 'SOCIAL' }, { kind: 'heat', amount: 4 }] }
    ]
  },
  {
    id: 'celebrity_wedding',
    archetype: 'BREAKING_FRONT',
    stamp: 'CELEBRITY WEDDING',
    headline: 'A Celebrity Wedding Hijacks the Timeline',
    body: 'A famous couple just got married in a ceremony with sixteen outfit changes. Nobody is asking about {Target} anymore.',
    minDay: 6,
    weight: 2,
    choices: () => [
      { id: 'hijack', label: 'Hijack the wedding hashtag', detail: '-15 ⚡ • +8 Freshness', cost: 15, effects: [{ kind: 'freshness', amount: 8 }] },
      { id: 'pass', label: 'Let it pass', detail: '-15 Freshness', effects: [{ kind: 'freshness', amount: -15 }] }
    ]
  },
  {
    id: 'election_season',
    archetype: 'SECURITY_WIRE',
    stamp: 'ELECTION SEASON',
    headline: 'Campaign Season Is Heating Up',
    body: 'Rallies, billboards, and a security services on high alert. The country is listening to gossip like never before, and so is DSS.',
    minDay: 7,
    weight: 2,
    choices: () => [
      { id: 'rally', label: 'Piggyback on the rallies', detail: '+6% Heat • Spark bubbles pay 50% more for 4 days • +10 Freshness', effects: [
        { kind: 'heat', amount: 6 }, { kind: 'timed', effectKind: 'SPARK_BOUNTY', days: 4, mult: 1.5, label: 'Rally season' }, { kind: 'freshness', amount: 10 }] },
      { id: 'lowlow', label: 'Lay low', detail: '-5% Heat', effects: [{ kind: 'heat', amount: -5 }] }
    ]
  },
  {
    id: 'comedian_skit',
    archetype: 'VIRAL_RECEIPT',
    stamp: 'SKIT GOES VIRAL',
    headline: 'A Comedian Mocks {Target}',
    body: 'A popular skit maker just dropped a two-minute parody of {Target}, and the internet cannot stop quoting it.',
    minDay: 4,
    weight: 2,
    choices: () => [
      { id: 'amplify', label: 'Amplify the skit', detail: '-6 ⚡ • +30 Freshness', cost: 6, effects: [{ kind: 'freshness', amount: 30 }] },
      { id: 'enjoy', label: 'Enjoy the ride', detail: '+15 Freshness • +6 ⚡', effects: [{ kind: 'freshness', amount: 15 }, { kind: 'sparks', amount: 6 }] }
    ]
  },
  {
    id: 'court_adjourns',
    archetype: 'TARGET_PR',
    stamp: 'COURT ADJOURNS',
    headline: 'Court Adjourns "Indefinitely"',
    body: 'A court quietly adjourned a case against {Target} with no date. Supporters are calling it a vindication.',
    minDay: 8,
    weight: 2,
    choices: () => [
      { id: 'protest', label: 'Stage a protest outside the court', detail: '-10 ⚡ • +10 Freshness • +5% Heat', cost: 10, effects: [{ kind: 'freshness', amount: 10 }, { kind: 'heat', amount: 5 }] },
      { id: 'absorb', label: 'Absorb it', detail: '+6% Cover-Up', effects: [{ kind: 'coverUp', amount: 6 }] }
    ]
  },
  {
    id: 'tip_clerk',
    archetype: 'INFORMANT_TIP',
    stamp: 'INFORMANT // CLERK',
    headline: 'A Records Clerk Has a Certified Copy',
    body: 'A clerk at a government registry says she can get you a stamped certified copy of the one document {Target} would rather keep buried.',
    minDay: 4,
    weight: 3,
    choices: () => [
      { id: 'pay', label: 'Pay the clerk', detail: '-12 ⚡ • +12% Investigation', cost: 12, effects: [{ kind: 'investigation', amount: 12 }] },
      { id: 'photocopy', label: 'Photocopy it yourself', detail: '+5% Investigation • +5% Heat', effects: [{ kind: 'investigation', amount: 5 }, { kind: 'heat', amount: 5 }] },
      { id: 'decline', label: 'Decline', detail: 'Nothing happens', effects: [] }
    ]
  },
  {
    id: 'tip_rival',
    archetype: 'INFORMANT_TIP',
    stamp: 'INFORMANT // RIVAL',
    headline: 'A Rival Offers to Leak Against {Target}',
    body: 'A rival of {Target} slid a note under your door offering to feed you information. Their motives are unclear, and so is their trustworthiness.',
    minDay: 6,
    weight: 2,
    choices: () => [
      { id: 'accept', label: 'Accept the help', detail: '-8% Cover-Up • +6% Heat', effects: [{ kind: 'coverUp', amount: -8 }, { kind: 'heat', amount: 6 }] },
      { id: 'decline', label: 'Decline', detail: 'Nothing happens', effects: [] }
    ]
  },
  {
    id: 'tip_driver',
    archetype: 'INFORMANT_TIP',
    stamp: 'INFORMANT // DRIVER',
    headline: '{Target}\'s Former Driver Wants to Talk',
    body: 'A man who drove {Target} for nine years was fired last week. He says he has heard everything, and he is ready to repeat it.',
    minDay: 5,
    weight: 2,
    choices: () => [
      { id: 'meet', label: 'Meet him properly', detail: '-8 ⚡ • +10% Investigation • +10 Freshness', cost: 8, effects: [{ kind: 'investigation', amount: 10 }, { kind: 'freshness', amount: 10 }] },
      { id: 'record', label: 'Record him in secret', detail: '+6% Investigation • +4% Heat', effects: [{ kind: 'investigation', amount: 6 }, { kind: 'heat', amount: 4 }] }
    ]
  },
  {
    id: 'owambe_season',
    archetype: 'STREET_WHISPER',
    stamp: 'OWAMBE SEASON',
    headline: 'Every Weekend Is a Wedding',
    body: 'Aso-ebi, jollof and gossip. Every party in the country is full of people with nothing to do but talk.',
    minDay: 4,
    weight: 2,
    choices: () => [
      { id: 'dance', label: 'Send gist to the parties', detail: 'Street channels at 140% for 4 days', effects: [{ kind: 'timed', effectKind: 'BRANCH_MULT', days: 4, mult: 1.4, label: 'Owambe season', branch: 'STREET' }] }
    ]  },
  {
    id: 'jollof_wars',
    archetype: 'STREET_WHISPER',
    stamp: 'JOLLOF WARS',
    headline: 'The Jollof Wars Break Out Again',
    body: 'Nigeria and Ghana are arguing about rice again, and the entire internet has picked a side. Nobody has mentioned {Target} in nine hours.',
    minDay: 5,
    weight: 2,
    choices: () => [
      { id: 'join', label: 'Join the debate (carefully)', detail: '+18 Freshness • +3% Heat', effects: [{ kind: 'freshness', amount: 18 }, { kind: 'heat', amount: 3 }] },
      { id: 'stay', label: 'Stay on message', detail: '+4% Investigation', effects: [{ kind: 'investigation', amount: 4 }] }
    ]
  },
  {
    id: 'fake_news_panic',
    archetype: 'TARGET_PR',
    stamp: 'FAKE NEWS WARNING',
    headline: 'Officials Warn Against "Fake News"',
    body: 'A government spokesman went on air to warn that "mischievous elements" are spreading falsehoods. He did not say which. He did not have to.',
    minDay: 7,
    weight: 2,
    choices: () => [
      { id: 'pause', label: 'Go quiet for a day', detail: '-4% Heat • -6 Freshness', effects: [{ kind: 'heat', amount: -4 }, { kind: 'freshness', amount: -6 }] },
      { id: 'double', label: 'Double down publicly', detail: '+12 Freshness • +6% Heat', effects: [{ kind: 'freshness', amount: 12 }, { kind: 'heat', amount: 6 }] }
    ]
  },
  {
    id: 'viral_voice_note',
    archetype: 'VIRAL_RECEIPT',
    stamp: 'VOICE NOTE GOES VIRAL',
    headline: 'A Four-Minute Voice Note Is Everywhere',
    body: '"Good morning my people, I have something to tell you about {Target}..." It is forty-seven seconds in and already forwarded to every family group in the country.',
    minDay: 5,
    weight: 2,
    choices: () => [
      { id: 'forward', label: 'Forward it everywhere', detail: '+20 Freshness • A Spin bubble appears', effects: [{ kind: 'freshness', amount: 20 }, { kind: 'spin', count: 1 }] },
      { id: 'check', label: 'Fact-check it first', detail: '-6 ⚡ • +8% Investigation • +8 Freshness', cost: 6, effects: [{ kind: 'investigation', amount: 8 }, { kind: 'freshness', amount: 8 }] },
      { id: 'skip', label: 'Leave it alone', detail: 'Nothing happens', effects: [] }
    ]
  },
  {
    id: 'owambe_overheard',
    archetype: 'STREET_WHISPER',
    stamp: 'OVERHEARD AT AN OWAMBE',
    headline: 'A Guest Overhears Something at an Owambe',
    body: 'Between the third plate of jollof and the fourth song of the night, a guest overheard two aides discussing {Target}. She is telling everyone.',
    minDay: 4,
    weight: 2,
    choices: () => [
      { id: 'take', label: 'Thank her for the gist', detail: '+8 ⚡ • +6 Freshness', effects: [{ kind: 'sparks', amount: 8 }, { kind: 'freshness', amount: 6 }] }
    ]
  },
  {
    id: 'radio_callin',
    archetype: 'STREET_WHISPER',
    stamp: 'LIVE ON AIR',
    headline: 'A Caller Goes Off on Live Radio',
    body: 'A caller on a morning show spent six minutes on {Target}. The presenter tried to stop her twice. The producer gave up and turned up the volume.',
    minDay: 5,
    weight: 2,
    choices: () => [
      { id: 'amplify', label: 'Clip it and share it', detail: 'Press channels at 130% for 3 days', effects: [{ kind: 'timed', effectKind: 'BRANCH_MULT', days: 3, mult: 1.3, label: 'Radio buzz', branch: 'PRESS' }] }
    ]
  },
  {
    id: 'accidental_trend',
    archetype: 'VIRAL_RECEIPT',
    stamp: 'ACCIDENTALLY TRENDING',
    headline: 'A Hashtag Starts Trending by Accident',
    body: 'Nobody planned it. A random post about {Target} got ten thousand quote-tweets and now the hashtag is fourth in the country.',
    minDay: 5,
    weight: 2,
    requires: s => ownsBranch(s, 'SOCIAL'),
    choices: () => [
      { id: 'push', label: 'Push it harder', detail: '-8 ⚡ • Social channels at 140% for 4 days • +3% Heat', cost: 8, effects: [{ kind: 'timed', effectKind: 'BRANCH_MULT', days: 4, mult: 1.4, label: 'Trending', branch: 'SOCIAL' }, { kind: 'heat', amount: 3 }] },
      { id: 'ride', label: 'Let it ride', detail: 'Social channels at 120% for 2 days', effects: [{ kind: 'timed', effectKind: 'BRANCH_MULT', days: 2, mult: 1.2, label: 'Trending', branch: 'SOCIAL' }] }
    ]
  },
  {
    id: 'okada_ban',
    archetype: 'STREET_WHISPER',
    stamp: 'OKADA BAN',
    headline: 'The City Bans Okada Overnight',
    body: 'The state government banned motorcycles from the main roads. Commuters are stranded, furious, and extremely willing to talk.',
    minDay: 6,
    weight: 1,
    choices: () => [
      { id: 'wait', label: 'Wait it out', detail: 'Land-border spread at 70% for 3 days', effects: [{ kind: 'timed', effectKind: 'HIGHWAY_MULT', days: 3, mult: 0.7, label: 'Okada ban' }] },
      { id: 'keke', label: 'Sponsor a keke fleet', detail: '-12 ⚡ • Land-border spread at 90% for 3 days • +8 Freshness', cost: 12, effects: [{ kind: 'timed', effectKind: 'HIGHWAY_MULT', days: 3, mult: 0.9, label: 'Okada ban' }, { kind: 'freshness', amount: 8 }] }
    ]
  },
  {
    id: 'heatwave_gist',
    archetype: 'STREET_WHISPER',
    stamp: 'HEATWAVE',
    headline: 'A Heatwave Drives Everyone Outside',
    body: 'It is too hot to stay indoors. Compounds, shopfronts and verandas are packed with people who have nothing to do but talk.',
    minDay: 4,
    weight: 2,
    choices: () => [
      { id: 'sit', label: 'Join the veranda gist', detail: 'Street channels at 125% for 3 days', effects: [{ kind: 'timed', effectKind: 'BRANCH_MULT', days: 3, mult: 1.25, label: 'Heatwave', branch: 'STREET' }] }
    ]
  },
  {
    id: 'consultancy_offer',
    archetype: 'TARGET_PR',
    stamp: 'A "CONSULTANCY" OFFER',
    headline: 'The Target\'s Camp Offers You a "Consultancy"',
    body: 'A smiling man in a very clean agbada delivered an envelope. It contains a generous retainer from {Target}\'s friends, and a very short contract.',
    minDay: 8,
    weight: 2,
    choices: () => [
      { id: 'reject', label: 'Reject it loudly, on camera', detail: '+15 Freshness • +4% Heat', effects: [{ kind: 'freshness', amount: 15 }, { kind: 'heat', amount: 4 }] },
      { id: 'take', label: 'Take the money', detail: '+30 ⚡, but +10% Cover-Up and -10 Freshness', effects: [{ kind: 'sparks', amount: 30 }, { kind: 'coverUp', amount: 10 }, { kind: 'freshness', amount: -10 }] },
      { id: 'ignore', label: 'Pretend you never saw it', detail: 'Nothing happens', effects: [] }
    ]
  },
  {
    id: 'dance_challenge',
    archetype: 'VIRAL_RECEIPT',
    stamp: 'DANCE CHALLENGE',
    headline: 'Your Story Becomes a Dance Challenge',
    body: 'Someone set the audio from the {Target} story to an Afrobeats instrumental. Now thousands of people are doing a coordinated shoulder move to it.',
    minDay: 6,
    weight: 1,
    choices: () => [
      { id: 'dance', label: 'Do the dance', detail: '+22 Freshness • +4 ⚡', effects: [{ kind: 'freshness', amount: 22 }, { kind: 'sparks', amount: 4 }] }
    ]
  }
];



// Alternate wordings: the run's copySeed picks one, so events read differently across runs.
const ALT_BODIES: Record<string, string[]> = {
  power_outage: ['NEPA has struck again. Generators are roaring, fuel is scarce, and nobody in the {zone} can charge a phone.', 'The lights went out across the {zone} at dinner time. By candlelight, everyone has an opinion.'],
  fuel_protests: ['Pump prices jumped overnight. Okada riders are parking in protest, and {Target} makes a perfect scapegoat.', 'Queues stretch for kilometres. People are angry, tired, and very open to a story about {Target}.'],
  detty_december: ['Lagos is emptying. Every bus is full and every passenger has something to say about {Target}.', 'The festive rush has started. Motor parks are overflowing with travellers carrying gist.'],
  asuu_strike: ['Lecturers have downed tools. Thousands of idle students are scrolling, and they love a good scandal.', 'Another strike, another semester lost. The campuses are quiet, and the group chats are not.'],
  network_outage: ['A national outage has knocked out calls and data. Your Social channels are going nowhere fast.', 'The network is down across the country. Even the group chats have gone silent.'],
  platform_ban: ['Officials are threatening to switch off a major platform. Your followers are scrambling for VPNs.', 'A platform ban looms. Everybody is downloading workarounds, and your reach is wobbling.'],
  celebrity_wedding: ['A celebrity wedding just ate the internet. The guest list alone has its own hashtag.', 'The entire timeline is arguing about a bride\'s third outfit. {Target} has vanished from the conversation.'],
  election_season: ['Posters on every pole and security on every road. Campaign season has made everyone nervous and curious.', 'Rallies are everywhere. Crowds are huge, informants are nervous, and DSS is paying attention.'],
  comedian_skit: ['A skit maker just turned {Target} into a four-minute comedy sketch. It has two million views.', 'Someone in a wig and a fake agbada is impersonating {Target}. The internet cannot stop quoting it.'],
  court_adjourns: ['The judge adjourned {Target}\'s matter to "a date to be communicated". Supporters are already celebrating.', 'A hearing ended in seven minutes with no date set. {Target}\'s lawyers are smiling.'],
  tip_clerk: ['A clerk at a government registry whispered that she can copy one specific file about {Target}. She wants it done quickly.', 'Someone behind a registry counter slid a note across: "I have what you need on {Target}."'],
  tip_rival: ['A rival of {Target} got in touch through a friend of a friend. He is offering "help", for reasons of his own.', 'An old enemy of {Target} offered to share what he knows. His motives are anything but pure.'],
  tip_driver: ['{Target}\'s former driver was dismissed last week. He is now very talkative, and very bitter.', 'A man who spent nine years behind {Target}\'s wheel wants to meet. He says he has seen everything.'],
  owambe_season: ['It is wedding season, and every party has a gist corner. Aunties are already talking about {Target}.', 'Aso-ebi everywhere. Every party table is a rumor mill about {Target}.']
};

const subst = (text: string, s: GameState, zone?: ZoneId): string => {
  const target = getTarget(s.activeTargetId);
  const zoneName = zone ? ZONE_NAMES[zone] : '';
  return fillTarget(text, target).replace(/\{zone\}/g, zoneName);
};

// Event ids carry their zone parameter, e.g. "power_outage:SW".
export const parseEventId = (eventId: string): { id: string; zone?: ZoneId } => {
  const [id, zone] = eventId.split(':');
  return { id, zone: zone as ZoneId | undefined };
};

// Not in the random pool: only THE_SCHEMER plants it (see alerts.ts).
export const SCHEMER_EVENT: EventDef = {
  id: 'schemer_honeypot',
  archetype: 'INFORMANT_TIP',
  stamp: 'INFORMANT // TOO GOOD TO BE TRUE',
  headline: 'A Bombshell Lands in Your Inbox',
  body: 'An anonymous source just sent the "smoking gun" on {Target}: a timestamp, a screenshot, and a very urgent request to publish tonight. It looks perfect. That is exactly what worries you.',
  weight: 0,
  choices: () => [
    { id: 'verify', label: 'Verify the source first', detail: '-10 ⚡ • +8% Investigation • +5 Freshness', cost: 10, effects: [{ kind: 'investigation', amount: 8 }, { kind: 'freshness', amount: 5 }] },
    { id: 'run', label: 'Run it live right now', detail: '+25 Freshness, but it was a plant: +12% Cover-Up, +6% Heat', effects: [{ kind: 'freshness', amount: 25 }, { kind: 'coverUp', amount: 12 }, { kind: 'heat', amount: 6 }] },
    { id: 'bin', label: 'Bin it and move on', detail: 'Nothing happens', effects: [] }
  ]
};

export const getEventDef = (id: string): EventDef | undefined => [...EVENTS, SCHEMER_EVENT].find(e => e.id === id);

export const findChoice = (eventId: string, choiceId: string): EventChoice | undefined => {
  const { id, zone } = parseEventId(eventId);
  return getEventDef(id)?.choices(zone).find(c => c.id === choiceId);
};

// Picks an unused, eligible event for this tick (or none).
export const pickEvent = (s: GameState, rng: Rng, chance: number, cooldown: number, minDay: number): { def: EventDef; zone?: ZoneId } | null => {
  if (s.currentDay < minDay || s.currentDay - s.lastEventDay < cooldown) return null;
  if (rng() >= chance) return null;
  const eligible = EVENTS.filter(e => !s.usedEvents.some(u => u.split(':')[0] === e.id)
    && (e.minDay ?? 0) <= s.currentDay && (!e.requires || e.requires(s)));
  if (eligible.length === 0) return null;
  const total = eligible.reduce((a, e) => a + e.weight, 0);
  let roll = rng() * total;
  let def = eligible[eligible.length - 1];
  for (const e of eligible) { roll -= e.weight; if (roll <= 0) { def = e; break; } }
  const zone = def.zoned ? ZONE_IDS[Math.floor(rng() * ZONE_IDS.length)] : undefined;
  return { def, zone };
};

export const buildEventAlert = (def: EventDef, s: GameState, zone?: ZoneId): GameAlert => {
  const eventId = zone ? `${def.id}:${zone}` : def.id;
  const choices: AlertChoice[] = def.choices(zone).map(c => ({
    id: c.id,
    label: c.label,
    detail: subst(c.detail, s, zone),
    cost: c.cost
  }));
  return {
    id: `event_${eventId}_${s.currentDay}`,
    eventId,
    choices,
    archetype: def.archetype,
    stampText: def.stamp,
    headline: subst(def.headline, s, zone),
    body: subst(pickFrom([def.body, ...(ALT_BODIES[def.id] ?? [])], 'evbody:' + def.id, s.copySeed), s, zone),
    subtext: 'Decision needed',
    buttonText: 'Decide',
    priority: 45
  };
};
