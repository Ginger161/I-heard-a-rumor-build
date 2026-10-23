import { Branch } from './channels';

// ---------------------------------------------------------------------------
// PARODY LAYER
//
// Base Targets carry safe, generic, fictional names. When USE_PARODY_NAMES is true, the Targets listed in PARODY
// are re-skinned with parody names that wink at a famous Nigerian persona. Because a recognisable name must never be
// paired with a believable accusation, parody Targets ALSO switch to comic scandals, comic channel flavor and comic
// evidence copy (see below). Flip the flag to go back to the generic roster. Nothing else in the code depends on it.
//
// Rules for adding to this file (also see CLAUDE.md §12):
//   - No sitting or former politicians or officeholders by name. Offices stay generic ("The President").
//   - Scandal titles must be absurd or comic, never a plausible allegation of a crime or sexual misconduct.
//   - Get legal review before launch. Nigerian cybercrime law has been used against online satire.
// ---------------------------------------------------------------------------
export const USE_PARODY_NAMES = true;

// In-game "this is fiction" notices are switched off. Flip this to true to show them again (for example for a store review).
export const SHOW_DISCLAIMER = false;

export const PARODY_DISCLAIMER =
  'Every character is a fictional parody. Nobody in this game is accused of anything real.';

export interface ParodyOverride {
  fullName: string;
  shortName: string;
  title?: string;
  personality?: string;
  scandals: [string, string, string]; // Titles, in the same order as the base Target's scandals
}

export const PARODY: Record<string, ParodyOverride> = {
  // ---------------- Spotlight (design-doc names) ----------------
  lord_lambo: {
    fullName: 'Lord Lambo "The Cruise Master"',
    shortName: 'Lord Lambo',
    scandals: [
      'A Cruise-Deck Livestream Where He Forgot the Mic Was On',
      'A Giveaway Where the Grand Prize Was a Follow-Back',
      'A Honeymoon Video Filmed Entirely From the Buffet'
    ]
  },
  daddy_freeze_frame: {
    fullName: 'Daddy Freeze-Frame "The Tithe Collector"',
    shortName: 'Daddy Freeze-Frame',
    scandals: [
      'A "Free Giveaway" That Only Gave Away Opinions',
      'An Off-Air Rant Where He Argues With Himself and Loses',
      'A "Certified Moral Referee" Badge He Printed Himself'
    ]
  },
  afro_bad_boy: {
    fullName: 'Burna-Lite "Afro Bad Boy" Kazeem',
    shortName: 'Burna-Lite',
    scandals: [
      'A Different Playlist for Every Tour City',
      'A Dramatic Entrance That Blocked the Entire Car Park',
      'A Gold Chain Heavier Than His Verse'
    ]
  },

  // ---------------- Entertainers and influencers ----------------
  afrobeats_star: {
    fullName: 'Davi-Dough "OBO of Everything" Adelakin',
    shortName: 'Davi-Dough',
    personality: 'Sold out three arenas this year, and has a chain for every outfit and a chorus for every occasion.',
    scandals: [
      'A Backstage Clip of Him Rehearsing His "Spontaneous" Tears',
      'Charged ₦5,000 Per Selfie at His Own Concert',
      'A Love Song With a Different Name in Every Verse'
    ]
  },
  african_giant: {
    fullName: 'Wizz-Kidd "Starboy of Starboys" Ayokunle',
    shortName: 'Wizz-Kidd',
    personality: 'Sells out stadiums on four continents, replies to messages in four business days, and is always "on his way".',
    scandals: [
      'A Leaked Voice Note Where He Says "I Dey Come" and Does Not Come',
      'A "Foundation" Whose Biggest Project Is One Very Large Chain',
      'Spotted at Three Different Concerts at the Same Time'
    ]
  },
  nollywood_queen: {
    fullName: 'Mercy-Full "Queen of Tears" Johnsun',
    shortName: 'Mercy-Full',
    scandals: [
      'A Dramatic Slap in a Scene That Was Not in the Script',
      'A Rehearsal Where She Cries on Cue and Then Asks for Snacks',
      'A Gele Budget Larger Than the Film Budget'
    ]
  },
  owambe_dj: {
    fullName: 'DJ Cupcake "Spin Princess" Salako',
    shortName: 'DJ Cupcake',
    scandals: [
      'A Wedding Set Where She Played the Same Song for Four Hours',
      'A Booking Fee Quoted in Dollars and Paid in Jollof',
      'A Secret Crush on Her Own Sound Engineer'
    ]
  },
  skit_king: {
    fullName: 'Mr. Macaroony "Skit Overlord"',
    shortName: 'Mr. Macaroony',
    personality: 'Turns every life lesson into a four-minute skit, and every skit into a sponsored post for jollof rice.',
    scandals: [
      'A Skit Where Everyone Forgot the Punchline, Including Him',
      'Sponsored Content for Sponsors Who Sponsor Other Sponsors',
      'A Certificate in "Comedic Timing" That Arrived Very Late'
    ]
  },
  mavin_mogul: {
    fullName: 'Don Jazzier "Mavin of Mavins" Michaels',
    shortName: 'Don Jazzier',
    scandals: [
      'A Record Contract So Long It Needs an Intermission',
      'A Hit Beat That Sounds Better Played Backwards',
      'A Secret Passion for Slow Jams'
    ]
  },
  queen_afropop: {
    fullName: 'Tiwa Savagery "Queen of Afropop-ish"',
    shortName: 'Tiwa Savagery',
    scandals: [
      'A Stage Costume With More Sequins Than Stage',
      'A Love Song Written Entirely in Vowels',
      'A Tour Rider Demanding Exactly Fourteen Pillows'
    ]
  },
  rapper_activist: {
    fullName: 'Falsz "The Activist Rapper"',
    shortName: 'Falsz',
    scandals: [
      'A Protest Song Recorded in a Very Comfortable Studio',
      'Merch Priced for the Revolution, Not for the People',
      'A Law Degree He Mostly Uses in Music Videos'
    ]
  },
  comedian_king: {
    fullName: 'Basket-Mouth-Full "King of Jokes"',
    shortName: 'Basket-Mouth-Full',
    scandals: [
      'The Same Joke Told at Four Different Weddings',
      'Tickets Priced Per Laugh',
      'A Long-Running Feud With a Banana'
    ]
  },

  // ---------------- Business persona ----------------
  richest_man: {
    fullName: 'Alhaji Dan-Goat "Richest Man in the Barn"',
    shortName: 'Dan-Goat',
    personality: 'Owns every bag of cement in the country and cannot find his own car keys.',
    scandals: [
      'Owns Every Bag of Cement but Not One Spare Key',
      'A Boardroom Tape Where He Haggles Over a ₦50 Sachet',
      'An Honorary Doctorate From a University Run by His Goat'
    ]
  }
};

// ---------------------------------------------------------------------------
// Comic copy used instead of the standard accusatory flavor whenever the Target is a parody.
// ---------------------------------------------------------------------------
export const PARODY_CHANNEL_LINES: Record<Branch, string[]> = {
  STREET: [
    'Danfo conductors are doing impressions of {Target} to keep passengers calm in traffic.',
    'A bus-stop debate about {Target} just ended in a standing ovation and one missing shoe.',
    'Market women are arguing about {Target}\'s latest outfit like it is a national budget.',
    'Okada riders gave {Target} a new nickname. It cannot be printed.'
  ],
  SOCIAL: [
    'A group chat just renamed itself "Everything About {Target}". It has 40,000 members and three rules.',
    'Somebody turned {Target}\'s last interview into a dance challenge. It is already on its fourth remix.',
    'The comment section under {Target}\'s newest post has become a stand-up special.',
    'An account with 12 followers just posted a thread about {Target}. It has 900,000 views.'
  ],
  PRESS: [
    'Every newspaper front page today is a different pun about {Target}.',
    'A morning-show host spent nine minutes on {Target} and one minute on the actual news.',
    'A radio phone-in about {Target} has run three hours past its time slot.',
    'A columnist wrote 1,200 words about {Target} without once using the word "allegedly".'
  ],
  ELITE: [
    'A senior figure was overheard at a dinner asking, "Has anybody seen what {Target} did now?"',
    'Boardrooms are quietly forwarding the same meme about {Target} to each other.',
    'A prestigious club is "reviewing the vibes" around {Target}.',
    'The people who never get involved just got a little bit involved with {Target}.'
  ]
};

export interface ParodyEvidence { name: string; flavor: string }
export const PARODY_EVIDENCE: Record<string, ParodyEvidence> = {
  ev_tier1_wire: { name: 'A Suspiciously Specific Voice Note', flavor: 'A twelve-second clip in which {Target} says "I never said that" before anyone asked.' },
  ev_tier2_voice_memo: { name: 'The Group Chat Screenshot', flavor: 'A screenshot from a very private group chat. The seen-by list is very, very long.' },
  ev_tier3_footage: { name: 'The Unedited Behind-the-Scenes Reel', flavor: 'Raw footage of {Target} rehearsing a "spontaneous" moment nine times.' },
  ev_tier4_smoking_gun: { name: 'The Master Folder of Embarrassment', flavor: 'Every awkward take, every cut scene, every "this stays between us". One folder. Zero mercy.' },
  ev_fake_whatsapp: { name: 'A Totally Real Screenshot', flavor: 'A screenshot that looks right until you notice the battery icon is from 2014.' },
  ev_deepfake_audio: { name: 'An AI Voice Note, Allegedly', flavor: 'A voice that sounds exactly like {Target} saying something {Target} would obviously never say.' }
};

// Endgame copy for parody Targets: no arrests, just cancellation.
export const PARODY_WIN = {
  headline: 'Target Cancelled! Apology Video & Indefinite Hiatus!',
  body: (days: number, target: string) =>
    `After ${days} days of memes, receipts and relentless gist, ${target} has posted a four-minute apology video with soft piano music and announced a "break to reflect". Fans are split. The comment section is not.`
};
