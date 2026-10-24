import { TargetBase, ab, sc } from '../targetTypes';

// CREATOR SPOTLIGHT: viral personalities, always unlocked. Their `tier` sets how hard they play;
// the Spotlight folder only decides where they are shown. Names are deliberate parodies, and every
// scandal is invented. Rename freely: nothing else in the code depends on these strings.
export const SPOTLIGHT: TargetBase[] = [
  {
    id: 'lord_lambo',
    tier: 2,
    fullName: 'Cruise Sam "The Deck Master" Oyelowo',
    shortName: 'Cruise Sam',
    title: 'Cruise-Life Content Creator',
    personality: 'Has been "about to retire" from content since 2019 and live-streams every minute in between.',
    silhouette: 'glasses',
    scandals: [
      sc('LEAKED_MEDIA', 'A Cruise-Deck Livestream Where He Forgot the Mic Was On'),
      sc('FINANCIAL', 'A Luxury Giveaway That Never Gave Anything Away'),
      sc('AFFAIR', 'Two Different "Honeymoon" Videos in One Month')
    ],
    passiveName: 'Viral Armour',
    passiveFlavor: 'Millions of followers who think any rumour about him is engagement farming.',
    mods: { tagDoubt: { HYPER_ONLINE: 8 }, spinHubs: true, doubtFlat: 51, doubtRate: 1.95 },
    abilities: [
      ab('BOT_SWARM', 7, 8, 3, 'CRUISE CREW ONLINE', 'The Cruise Crew Floods the Comments',
        '{Target}\'s followers are quote-posting every critic with a yacht emoji. Spin is everywhere.'),
      ab('DISTRACTION', 10, 11, 12, 'GIVEAWAY ANNOUNCED', 'A Mega Giveaway Takes Over the Timeline',
        '{Target} announced a "final giveaway of the decade". Nobody is talking about anything else.')
    ]
  },
  {
    id: 'daddy_freeze_frame',
    tier: 3,
    fullName: 'Uncle Referee "The Radio Moralist" Bamidele',
    shortName: 'Uncle Referee',
    title: 'Radio Host and Self-Appointed Moral Referee',
    personality: 'Spends every morning lecturing the nation about other people\'s money, and has an answer ready for everything.',
    silhouette: 'mic',
    scandals: [
      sc('FINANCIAL', 'A "Free Giveaway" Charity Account That Funded His Own Studio'),
      sc('LEAKED_MEDIA', 'An Off-Air Rant Contradicting Everything He Preaches'),
      sc('FAKE_CREDENTIALS', 'A "Certified Financial Coach" Badge Printed at a Roadside Shop')
    ],
    passiveName: 'Morning Show Authority',
    passiveFlavor: 'Calm, quotable and impossible to rattle on air. He lets you swing first.',
    mods: { eliteFriction: 0.3, coverUpRate: 1.4 },
    abilities: [
      ab('COUNTER_STORY', 8, 9, 12, 'LIVE ON AIR', 'A Calm On-Air Rebuttal Goes Viral',
        '{Target} spent forty calm minutes on air dismantling the allegations one by one. Clips are everywhere.'),
      ab('INJUNCTION', 10, 11, 3, 'GUESTS PULLED', 'Your Press Contacts Are Mysteriously Unavailable',
        'Every journalist you pitched suddenly had a scheduling conflict.', 'PRESS')
    ]
  }
];
