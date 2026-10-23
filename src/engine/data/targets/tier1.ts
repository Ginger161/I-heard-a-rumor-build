import { TargetBase, ab, sc } from '../targetTypes';

// TIER 1: NEIGHBOURHOOD BIG MEN. Local power, small stakes, gentle counter-moves.
export const TIER_1: TargetBase[] = [
  {
    id: 'iyaloja_general',
    tier: 1,
    fullName: 'Madam Bisi "Iyaloja General" Adegoke',
    shortName: 'Madam Adegoke',
    title: 'Market Association President',
    personality: 'Controls every stall from the pepper section to the bus stop. Nobody sells tomatoes without her blessing.',
    silhouette: 'gele',
    scandals: [
      sc('FINANCIAL', 'Market Levy Money That Never Reached the Association Account'),
      sc('AFFAIR', 'A Secret Second Husband in Ibadan'),
      sc('FAKE_CREDENTIALS', '"Chief" Title Bought From a Roadside Chieftaincy Shop')
    ],
    passiveName: 'Market Loyalty',
    passiveFlavor: 'Traders will defend her until the last wrapper is sold.',
    mods: { tagDoubt: { GRASSROOTS: 8 } },
    abilities: [
      ab('COUNTER_STORY', 9, 8, 6, 'MARKET SOLIDARITY MARCH', 'Traders March in Her Defence',
        'Hundreds of traders in matching wrappers marched to the state secretariat singing that {Target} is "a mother to us all".')
    ]
  },
  {
    id: 'park_chairman',
    tier: 1,
    fullName: 'Alhaji Sule "Owner of the Road" Garba',
    shortName: 'Alhaji Garba',
    title: 'Motor Park Union Chairman',
    personality: 'Collects a daily ticket from every danfo in the state and answers to nobody.',
    silhouette: 'cap',
    scandals: [
      sc('FINANCIAL', 'Daily Ticket Money Vanishing Into a Mansion in Kubwa'),
      sc('LEAKED_MEDIA', 'Video of Him Slapping a Conductor Goes Viral'),
      sc('FAKE_CREDENTIALS', 'Union Chairman Certificate Signed by Himself')
    ],
    passiveName: 'Area Boys',
    passiveFlavor: 'A loyal crowd of young men who can appear in any comment section.',
    mods: {},
    abilities: [
      ab('BOT_SWARM', 8, 9, 2, 'PARK BOYS ON THE TIMELINE', 'The Park Boys Are Online',
        'Union youths flooded every thread about {Target} with identical praise and threats.')
    ]
  },
  {
    id: 'fire_pastor',
    tier: 1,
    fullName: 'Pastor Gbenga "Fire-Fire" Alade',
    shortName: 'Pastor Alade',
    title: 'Neighbourhood Prophet',
    personality: 'Predicts your breakthrough for a seed of ten thousand naira. His church has no roof but plenty of generators.',
    silhouette: 'robe',
    scandals: [
      sc('AFFAIR', 'Midnight Prayer Sessions With the Choir Mistress'),
      sc('FINANCIAL', 'Seed-Sowing Offerings Spent on a Jeep'),
      sc('LEAKED_MEDIA', 'Fake Healing Video Edited in the Vestry')
    ],
    passiveName: 'Prayer Warriors',
    passiveFlavor: 'The congregation fasts for him and fights for him.',
    mods: { tagDoubt: { GRASSROOTS: 6 } },
    abilities: [
      ab('DISTRACTION', 8, 7, 12, 'REVIVAL CRUSADE', 'Three-Day Revival Crusade Announced',
        '{Target} announced a "Fire Revival Night" with free rice, pulling attention away from the allegations.')
    ]
  },
  {
    id: 'caution_landlord',
    tier: 1,
    fullName: 'Mr. Emeka "Caution Fee" Obiora',
    shortName: 'Mr. Obiora',
    title: 'Estate Landlord',
    personality: 'Owns forty rooms and has never returned a caution fee. Disputes are settled by thugs.',
    silhouette: 'glasses',
    scandals: [
      sc('FINANCIAL', 'Caution Fees Never Refunded to 200 Tenants'),
      sc('FAKE_CREDENTIALS', 'A "C of O" the Land Registry Has Never Seen'),
      sc('LEAKED_MEDIA', 'Recording of Him Threatening Tenants With Thugs')
    ],
    passiveName: 'Thugs on Retainer',
    passiveFlavor: 'Street-level muscle that can shut a lane of gossip by force.',
    mods: {},
    abilities: [
      ab('INJUNCTION', 8, 8, 2, 'STREET INTIMIDATION', 'Landlord\'s Boys Shut Down the Street',
        '{Target}\'s thugs visited the shops and motor parks. Street talk went quiet overnight.', 'STREET')
    ]
  },
  {
    id: 'lga_councillor',
    tier: 1,
    fullName: 'Hon. Ebuka "Constituency Project" Nwosu',
    shortName: 'Hon. Nwosu',
    title: 'Local Government Chairman',
    personality: 'Commissions the same borehole in three different budgets. Loves a ribbon-cutting.',
    silhouette: 'suit',
    scandals: [
      sc('FINANCIAL', 'Borehole Projects That Exist Only on Paper'),
      sc('FAKE_CREDENTIALS', 'WAEC Result With Four F9s "Upgraded" to A1s'),
      sc('AFFAIR', 'A Second Wife Registered as "Constituency Aide"')
    ],
    passiveName: 'Paper Projects',
    passiveFlavor: 'The local radio station depends on his advertising.',
    mods: {},
    abilities: [
      ab('INJUNCTION', 9, 9, 3, 'AIRTIME BOUGHT', 'Local Radio Suddenly Goes Quiet',
        '{Target}\'s office paid the radio stations for "exclusive project coverage". The phone-ins stopped.', 'PRESS')
    ]
  },
  {
    id: 'owambe_dj',
    tier: 1,
    fullName: 'DJ Kpokpo "Owambe Emperor" Salako',
    shortName: 'DJ Kpokpo',
    title: 'Party DJ and Influencer',
    personality: 'Hypes every wedding in Lagos and has the follower count to prove it.',
    silhouette: 'mic',
    scandals: [
      sc('LEAKED_MEDIA', 'Backstage Rant Insulting His Own Fans'),
      sc('FINANCIAL', 'Collected Deposits for 40 Weddings and Showed Up to None'),
      sc('AFFAIR', 'A Secret Marriage Contradicting His "Single and Free" Brand')
    ],
    passiveName: 'Fan Army',
    passiveFlavor: 'His followers argue for free and never sleep.',
    mods: { tagDoubt: { HYPER_ONLINE: 8 } },
    abilities: [
      ab('BOT_SWARM', 8, 8, 2, 'FAN ARMY DEPLOYED', 'Fan Pages Counter-Attack',
        '{Target}\'s fan pages mass-reported every post about the scandal and spammed the comments.')
    ]
  },
  {
    id: 'trials_coach',
    tier: 1,
    fullName: 'Coach Biodun "Next Super Eagle" Alabi',
    shortName: 'Coach Alabi',
    title: 'Football Academy Owner',
    personality: 'Promises every teenager a trial in Europe. The trials are always next month.',
    silhouette: 'uniform',
    scandals: [
      sc('FINANCIAL', 'Parents Paid Millions for Overseas Trials That Never Happened'),
      sc('FAKE_CREDENTIALS', 'A CAF Licence From a Football Body That Does Not Exist'),
      sc('LEAKED_MEDIA', 'Voice Note Selling Squad Places to the Highest Bidder')
    ],
    passiveName: 'Grateful Parents',
    passiveFlavor: 'Every family he "helped" will say so on camera.',
    mods: { tagDoubt: { GRASSROOTS: 4 } },
    abilities: [
      ab('DISTRACTION', 9, 8, 10, 'NEW TRIALS ANNOUNCED', 'Open Trials Announced This Weekend',
        '{Target} announced free trials with a "European scout". The streets suddenly care about football again.')
    ]
  },
  {
    id: 'herbal_doctor',
    tier: 1,
    fullName: 'Dr. "Doctor of Everything" Amadi',
    shortName: 'Dr. Amadi',
    title: 'Herbal Medicine Seller',
    personality: 'Cures malaria, ulcer, and heartbreak with one bottle. Has a PhD in nothing in particular.',
    silhouette: 'glasses',
    scandals: [
      sc('FAKE_CREDENTIALS', 'A Medical Degree From the "University of Roadside Anambra"'),
      sc('FINANCIAL', 'Cure-All Bitters Sold at a 400% Markup'),
      sc('LEAKED_MEDIA', 'Video Relabelling Paracetamol as "Ancient Root Extract"')
    ],
    passiveName: 'Miracle Testimonies',
    passiveFlavor: 'A parade of cured customers appears whenever he is in trouble.',
    mods: {},
    abilities: [
      ab('COUNTER_STORY', 8, 7, 7, 'TESTIMONY MARATHON', 'Cured Customers Line Up',
        'A parade of "miraculously healed" customers swore on live radio that {Target} saved their lives.')
    ]
  },
  {
    id: 'forex_flexer',
    tier: 1,
    fullName: 'Prince Dele "Forex God" Adeyinka',
    shortName: 'Prince Dele',
    title: 'Instagram Forex Trader',
    personality: 'Rents the car, rents the jet, rents the confidence. Teaches you to trade for ₦150,000.',
    silhouette: 'hoodie',
    scandals: [
      sc('FINANCIAL', 'An Investment Group That Froze Withdrawals at 3 AM'),
      sc('LEAKED_MEDIA', 'Rented Lamborghini Returned in a Live Video'),
      sc('FAKE_CREDENTIALS', 'A "Certified Trader" Badge Bought for $20')
    ],
    passiveName: 'Flex Culture',
    passiveFlavor: 'The online crowd mistakes rented success for wisdom.',
    mods: { tagDoubt: { HYPER_ONLINE: 10 }, spinHubs: true },
    abilities: [
      ab('BOT_SWARM', 7, 8, 2, 'SUCCESS STORIES POSTED', 'Fake Profit Screenshots Flood In',
        '{Target}\'s students posted screenshots of staggering profits. Every one used the same template.')
    ]
  },
  {
    id: 'land_guard',
    tier: 1,
    fullName: 'Oga Kemi "Land Guard" Salami',
    shortName: 'Oga Salami',
    title: 'Omo-Onile Land Grabber',
    personality: 'Sells your plot to you, then to your neighbour, then back to you.',
    silhouette: 'cap',
    scandals: [
      sc('FINANCIAL', 'The Same Plot Sold to Seven Different Buyers'),
      sc('LEAKED_MEDIA', 'Clip of Thugs Demolishing a Family Compound'),
      sc('FAKE_CREDENTIALS', 'A Forged Family Land Document Stamped by a Dead Surveyor')
    ],
    passiveName: 'Omo-Onile Boys',
    passiveFlavor: 'His boys know every informant in the neighbourhood.',
    mods: {},
    abilities: [
      ab('HEAT_SURGE', 7, 9, 6, 'THUGS TIP THE POLICE', 'Land Boys Report Your Network',
        '{Target}\'s associates named your couriers to a divisional police officer. Heat is rising.')
    ]
  },
  {
    id: 'slay_queen',
    tier: 1,
    fullName: 'Slay Queen "Soft Life" Amaka',
    shortName: 'Amaka',
    title: 'Lifestyle Influencer',
    personality: 'Posts the soft life from a rented flat, a borrowed car and a very understanding "sponsor".',
    silhouette: 'gele',
    scandals: [
      sc('AFFAIR', 'A "Sponsor" Who Turns Out to Be a Married Senator'),
      sc('FINANCIAL', 'A Fashion Brand That Never Ships a Single Dress'),
      sc('LEAKED_MEDIA', 'A Livestream Revealing Her Mansion Is a Hotel Lobby')
    ],
    passiveName: 'Soft Life Squad',
    passiveFlavor: 'Her followers defend the lifestyle, and screenshot every critic.',
    mods: { tagDoubt: { HYPER_ONLINE: 6 } },
    abilities: [
      ab('BOT_SWARM', 8, 8, 2, 'SQUAD ACTIVATED', 'The Soft Life Squad Strikes Back',
        '{Target}\'s followers are replying to every post with "hater" and a crown emoji.')
    ]
  },
  {
    id: 'forex_signals',
    tier: 1,
    fullName: 'Chukwudi "Forex Signals" Okafor',
    shortName: 'Chukwudi Okafor',
    title: 'Telegram Signals Seller',
    personality: 'Sells winning trade signals for ₦20,000 a month. His own account has never won a single trade.',
    silhouette: 'hoodie',
    scandals: [
      sc('FINANCIAL', 'Paid Signals That Lose Money Every Single Time'),
      sc('LEAKED_MEDIA', 'A Screen-Share Showing His Trading Account Is Empty'),
      sc('FAKE_CREDENTIALS', 'A "Certified Analyst" Licence From a Facebook Group')
    ],
    passiveName: 'Signal Group Loyalty',
    passiveFlavor: 'His paying members cannot admit they were fooled.',
    mods: { tagDoubt: { HYPER_ONLINE: 6 } },
    abilities: [
      ab('DISTRACTION', 9, 8, 10, 'FREE SIGNAL DAY', 'A "Free Signal Day" Dominates Telegram',
        '{Target} announced free signals for everyone. The channels are suddenly full of other conversations.')
    ]
  },
  {
    id: 'skit_king',
    tier: 1,
    fullName: 'Mr. Chuckles "Skit King" Adeoye',
    shortName: 'Mr. Chuckles',
    title: 'Skit Maker',
    personality: 'Turns every life lesson into a four-minute skit, and every skit into a sponsored post.',
    silhouette: 'hoodie',
    scandals: [
      sc('LEAKED_MEDIA', 'A Skit Where Everyone Forgot the Punchline'),
      sc('FINANCIAL', 'Sponsored Content for Sponsors Who Sponsor Sponsors'),
      sc('FAKE_CREDENTIALS', 'A Certificate in Comic Timing That Arrived Late')
    ],
    passiveName: 'Skit Universe',
    passiveFlavor: 'His fans quote him in every comment section, and they never run out of reaction GIFs.',
    mods: { tagDoubt: { HYPER_ONLINE: 6 } },
    abilities: [
      ab('DISTRACTION', 8, 8, 10, 'NEW SKIT DROPPED', 'A Brand-New Skit Takes Over the Timeline',
        '{Target} dropped a new skit and the entire internet is quoting it. Nobody is talking about anything else.')
    ]
  }
];
