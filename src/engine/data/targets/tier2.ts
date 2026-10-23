import { TargetBase, ab, sc } from '../targetTypes';

// TIER 2: STATE PLAYERS. Governors, megastars and money. Real counter-moves begin here.
export const TIER_2: TargetBase[] = [
  {
    id: 'cryptoking',
    tier: 2,
    fullName: 'Tobi "CryptoKing" Adeyemi',
    shortName: 'CryptoKing',
    title: 'Web3 / FinTech Ponzi Founder',
    personality: 'A zero-risk "yield platform" that froze withdrawals overnight, run by a man who still posts from his penthouse.',
    silhouette: 'hoodie',
    scandals: [
      sc('LEAKED_MEDIA', 'A Leaked Voice Note Laughing at Wiped-Out Retail Investors'),
      sc('FINANCIAL', 'Frozen Withdrawals While He Bought a Penthouse'),
      sc('FAKE_CREDENTIALS', 'A Fabricated "Harvard Blockchain" Certificate')
    ],
    passiveName: 'Bot Farm War Chest',
    passiveFlavor: 'A bot army fights for him, especially in the big online cities.',
    mods: { spinHubs: true },
    abilities: [
      ab('BOT_SWARM', 7, 8, 3, 'BOT FARM ACTIVATED', 'Ten Thousand Fake Accounts Wake Up',
        'A bot farm paid by {Target} is replying to every post with "this is FUD". The spin is spreading.')
    ]
  },
  {
    id: 'pothole_commissioner',
    tier: 2,
    fullName: 'Barr. Femi "Pothole Digital" Bello',
    shortName: 'Barr. Bello',
    title: 'State Commissioner for Works',
    personality: 'Has commissioned the same road six times. Every flood is "an act of God".',
    silhouette: 'suit',
    scandals: [
      sc('FINANCIAL', 'A Road Contract Paid in Full Before the First Bag of Cement'),
      sc('FAKE_CREDENTIALS', 'A Call-to-Bar Certificate From a Law School With a Misspelled Name'),
      sc('LEAKED_MEDIA', 'A Video Mocking Residents Stuck in Flood')
    ],
    passiveName: 'Contractor Network',
    passiveFlavor: 'Every contractor in the state owes him a favour, and a billboard.',
    mods: {},
    abilities: [
      ab('INJUNCTION', 8, 9, 3, 'ADVERTS PLACED', 'Newspaper Pages Suddenly Fill With Road Adverts',
        '{Target}\'s contractors bought every available front-page slot to "celebrate infrastructure".', 'PRESS')
    ]
  },
  {
    id: 'nollywood_queen',
    tier: 2,
    fullName: 'Queen Ify "Aso-Ebi" Obi',
    shortName: 'Queen Ify',
    title: 'Nollywood Producer and Actress',
    personality: 'Cries on demand, and has been on every red carpet since 2004. Her followers are loyal and organised.',
    silhouette: 'gele',
    scandals: [
      sc('AFFAIR', 'A Husband Swap Behind the Scenes of Her Own Show'),
      sc('LEAKED_MEDIA', 'A Leaked Rehearsal Insulting Her Own Cast'),
      sc('FINANCIAL', 'A Cast Left Unpaid While She Bought a Jet')
    ],
    passiveName: 'Red Carpet Allies',
    passiveFlavor: 'Half of Nollywood will defend her on camera by evening.',
    mods: { tagDoubt: { HYPER_ONLINE: 6 } },
    abilities: [
      ab('DISTRACTION', 9, 8, 14, 'PREMIERE ANNOUNCED', 'Blockbuster Premiere Announced for Friday',
        '{Target} announced a star-studded premiere. Entertainment blogs dropped everything else.')
    ]
  },
  {
    id: 'afrobeats_star',
    tier: 2,
    fullName: 'Dayo "Wahala Don Come" Akinde',
    shortName: 'Dayo Akinde',
    title: 'Afrobeats Superstar',
    personality: 'Sold out three arenas this year and still owes tax on all of them.',
    silhouette: 'mic',
    scandals: [
      sc('LEAKED_MEDIA', 'Backstage Footage of a Fight With His Own Band'),
      sc('FINANCIAL', 'A Tax Bill Larger Than a Small Town'),
      sc('AFFAIR', 'Three Baby Mamas, Three Cities, One Tour')
    ],
    passiveName: 'Global Fanbase',
    passiveFlavor: 'A billion streams and a fan army that never logs off.',
    mods: { tagDoubt: { HYPER_ONLINE: 10 } },
    abilities: [
      ab('BOT_SWARM', 7, 8, 3, 'FAN ARMY MOBILISED', 'Stan Accounts Take Over the Timeline',
        '{Target}\'s international stans are flooding every thread with coordinated memes.')
    ]
  },
  {
    id: 'vc_result_pending',
    tier: 2,
    fullName: 'Prof. Samuel "Result Pending" Okonkwo',
    shortName: 'Prof. Okonkwo',
    title: 'State University Vice-Chancellor',
    personality: 'Graduates students in six years and publishes in journals that charge by the page.',
    silhouette: 'glasses',
    scandals: [
      sc('FAKE_CREDENTIALS', 'A PhD Thesis Plagiarised From a 1983 Textbook'),
      sc('FINANCIAL', 'Hostel Fees Funding a Private Hotel'),
      sc('LEAKED_MEDIA', 'A Leaked Senate Memo Admitting Results Were Altered')
    ],
    passiveName: 'Senate Loyalty',
    passiveFlavor: 'Professors sign whatever he puts in front of them.',
    mods: { eliteFriction: 0.3 },
    abilities: [
      ab('COUNTER_STORY', 8, 9, 7, 'SENATE RESOLUTION', 'Academic Senate Issues a Defence',
        'The University Senate released a 14-page resolution praising {Target}\'s "integrity and scholarship".')
    ]
  },
  {
    id: 'bank_md',
    tier: 2,
    fullName: 'Mr. Ikenna "Hidden Charges" Eze',
    shortName: 'Mr. Eze',
    title: 'Commercial Bank MD',
    personality: 'Charges you to open your account, to close it, and for the SMS telling you about both.',
    silhouette: 'suit',
    scandals: [
      sc('FINANCIAL', 'Customers Charged for Checking Their Own Balance'),
      sc('LEAKED_MEDIA', 'A Board Recording Plotting New Fees'),
      sc('FAKE_CREDENTIALS', 'An MBA From a Business School With No Campus')
    ],
    passiveName: 'Deep Pockets',
    passiveFlavor: 'His legal team is always one step ahead, and watches for fake receipts.',
    mods: { eliteFriction: 0.3, forgeryRisk: 0.05 },
    abilities: [
      ab('INJUNCTION', 9, 9, 3, 'ADVERTISING BUDGET', 'Bank Adverts Appear Across the Press',
        '{Target}\'s bank pulled its advertising from any outlet that covers the story, and bought double elsewhere.', 'PRESS')
    ]
  },
  {
    id: 'football_chairman',
    tier: 2,
    fullName: 'Engr. Haruna "Super Eagles Contract" Yusuf',
    shortName: 'Engr. Yusuf',
    title: 'Football Federation Chairman',
    personality: 'The national team has not won a trophy in a decade. His mansion has won several.',
    silhouette: 'suit',
    scandals: [
      sc('FINANCIAL', 'World Cup Bonuses That Never Reached the Players'),
      sc('LEAKED_MEDIA', 'A Recording of Him Selling Squad Spots'),
      sc('FAKE_CREDENTIALS', 'A Referee Certificate for a Coach Who Never Refereed')
    ],
    passiveName: 'Stadium Crowd',
    passiveFlavor: 'A beloved national team shields him from the street.',
    mods: { tagDoubt: { GRASSROOTS: 5 } },
    abilities: [
      ab('DISTRACTION', 10, 10, 15, 'SUPER EAGLES WIN', 'Super Eagles Win Their Qualifier!',
        'A last-minute goal gave the nation a reason to celebrate. {Target} is suddenly everyone\'s hero.')
    ]
  },
  {
    id: 'eze_ruler',
    tier: 2,
    fullName: 'HRH Eze Nnamdi "Staff of Office" III',
    shortName: 'Eze Nnamdi',
    title: 'Traditional Ruler',
    personality: 'Presides over a kingdom of three villages and a very busy land registry.',
    silhouette: 'crown',
    scandals: [
      sc('FINANCIAL', 'Community Land Quietly Sold to Developers'),
      sc('AFFAIR', 'Seventeen Wives and Counting'),
      sc('FAKE_CREDENTIALS', 'A Chieftaincy Title Older Than the Kingdom Itself')
    ],
    passiveName: 'Palace Loyalty',
    passiveFlavor: 'The Eastern states revere the throne and refuse to repeat gossip about it.',
    mods: { zoneDoubt: { SE: 10, SS: 6 } },
    abilities: [
      ab('INJUNCTION', 9, 9, 3, 'PALACE DECREE', 'Palace Spokesmen Forbid Market Gossip',
        'A palace decree warned the market women and motor parks against "spreading rumour about the throne".', 'STREET')
    ]
  },
  {
    id: 'afro_bad_boy',
    tier: 2,
    fullName: 'Kazeem "Afro Bad Boy" Olawale',
    shortName: 'Kazeem',
    title: 'Afro-Fusion Bad Boy',
    personality: 'Sold out an arena, started a fight in the same arena, and made the fight a merch line.',
    silhouette: 'mic',
    scandals: [
      sc('AFFAIR', 'A Girlfriend in Every Tour City'),
      sc('LEAKED_MEDIA', 'A Club Brawl Filmed From the VIP Section'),
      sc('FINANCIAL', 'Unpaid Producers and Royalties That Never Arrived')
    ],
    passiveName: 'Bad Boy Brand',
    passiveFlavor: 'Every scandal makes his fans louder, not quieter.',
    mods: { tagDoubt: { HYPER_ONLINE: 8 } },
    abilities: [
      ab('BOT_SWARM', 7, 8, 3, 'FAN WAR', 'The Fan Wars Begin',
        '{Target}\'s fanbase declared war on everyone sharing the story. Spin bubbles are everywhere.'),
      ab('DISTRACTION', 10, 11, 12, 'SURPRISE SINGLE', 'A Surprise Single Drops at Midnight',
        '{Target} dropped a surprise single. The timeline has moved on.')
    ]
  },
  {
    id: 'ngo_queen',
    tier: 2,
    fullName: 'Madam Charity "NGO Queen" Abiodun',
    shortName: 'Madam Abiodun',
    title: 'Foundation Founder',
    personality: 'Runs a foundation that has held more galas than it has built classrooms.',
    silhouette: 'gele',
    scandals: [
      sc('FINANCIAL', 'Donations Spent on a Private Jet "for Aid Delivery"'),
      sc('FAKE_CREDENTIALS', 'A UN "Ambassador" Title Issued by a Fan Club'),
      sc('LEAKED_MEDIA', 'A Photo Shoot Staged at a Camp She Never Visited')
    ],
    passiveName: 'Photo-Op Machine',
    passiveFlavor: 'Elite donors are happy to be seen with her, and happy to defend her.',
    mods: { eliteFriction: 0.3 },
    abilities: [
      ab('COUNTER_STORY', 8, 9, 7, 'ORPHAN PHOTO-OP', 'A Photo-Op With Orphans Floods the Feeds',
        '{Target} was photographed hugging fourteen children in matching T-shirts. The story is shifting.'),
      ab('DISTRACTION', 11, 12, 12, 'CHARITY GALA', 'A Charity Gala Takes Over the Society Pages',
        '{Target} hosted a gala with three governors. The society pages have nothing else to print.')
    ]
  },
  {
    id: 'mavin_mogul',
    tier: 2,
    fullName: 'Don Jay "Label Boss" Ogunyemi',
    shortName: 'Don Jay',
    title: 'Record Label Boss',
    personality: 'Signs a new star every month and has a handshake that doubles as a contract.',
    silhouette: 'suit',
    scandals: [
      sc('FINANCIAL', 'A Record Contract So Long It Needs an Intermission'),
      sc('LEAKED_MEDIA', 'A Hit Beat That Sounds Better Played Backwards'),
      sc('AFFAIR', 'A Secret Passion for Slow Jams')
    ],
    passiveName: 'Label Family',
    passiveFlavor: 'Every artist on his roster posts in his defence on the same afternoon.',
    mods: { tagDoubt: { HYPER_ONLINE: 6 } },
    abilities: [
      ab('BOT_SWARM', 8, 8, 3, 'ROSTER ACTIVATED', 'The Whole Roster Posts in Unison',
        'Every artist signed to {Target} posted the same defence at 4:15 PM. The timeline is buzzing.'),
      ab('DISTRACTION', 11, 11, 12, 'ALBUM DROP', 'A Surprise Compilation Album Drops',
        '{Target} dropped a surprise compilation. The streaming charts have moved on.')
    ]
  },
  {
    id: 'queen_afropop',
    tier: 2,
    fullName: 'Tola "Queen of Afropop" Fashina',
    shortName: 'Tola Fashina',
    title: 'Afropop Queen',
    personality: 'Four albums, six outfit changes per song, and a rider that has its own rider.',
    silhouette: 'gele',
    scandals: [
      sc('LEAKED_MEDIA', 'A Stage Costume With More Sequins Than Stage'),
      sc('AFFAIR', 'A Love Song Written Entirely in Vowels'),
      sc('FINANCIAL', 'A Tour Rider Demanding Exactly Fourteen Pillows')
    ],
    passiveName: 'Queendom',
    passiveFlavor: 'Her fans guard her like a national treasure.',
    mods: { tagDoubt: { HYPER_ONLINE: 8 } },
    abilities: [
      ab('BOT_SWARM', 8, 8, 3, 'QUEENDOM ASSEMBLES', 'The Queendom Assembles',
        '{Target}\'s fan army has quote-posted every critic with a crown emoji. Spin everywhere.'),
      ab('COUNTER_STORY', 10, 10, 7, 'STATEMENT IN SEQUINS', 'A Heartfelt Statement in Sequins',
        '{Target} posted a tearful, beautifully lit statement. The internet is forgiving her already.')
    ]
  }
];
