import { TargetBase, ab, sc } from '../targetTypes';

// TIER 1: NEIGHBOURHOOD BIG MEN. Local power, small stakes, gentle counter-moves.
// Voice: adult and unfiltered (these are invented characters). Entries that are re-skinned by data/parody.ts
// (owambe_dj, skit_king) keep their original text, because those stay comic.
export const TIER_1: TargetBase[] = [
  {
    id: 'iyaloja_general',
    tier: 1,
    fullName: 'Madam Bisi "Iyaloja General" Adegoke',
    shortName: 'Madam Adegoke',
    title: 'Market Association President',
    personality: 'Controls every stall from the pepper section to the bus stop. Nobody sells tomatoes without her blessing, and nobody argues with her bosom.',
    silhouette: 'gele',
    scandals: [
      sc('FINANCIAL', 'Market Levy Money That Never Reached the Association Account, Only Her Gold Teeth'),
      sc('AFFAIR', 'A Secret Second Husband in Ibadan, Twenty Years Younger and Very Thirsty'),
      sc('FAKE_CREDENTIALS', '"Chief" Title Bought From a Roadside Chieftaincy Shop With a Free Wrapper')
    ],
    passiveName: 'Market Loyalty',
    passiveFlavor: 'Traders will defend her until the last wrapper is sold, and then they will defend her from the floor.',
    mods: { tagDoubt: { GRASSROOTS: 8 }, coverUpRate: 1.45 },
    abilities: [
      ab('COUNTER_STORY', 9, 8, 9, 'MARKET SOLIDARITY MARCH', 'Traders March in Her Defence',
        'Hundreds of traders in matching wrappers marched to the secretariat, singing that {Target} is "a mother to us all" and the journalists are "motherless".')
    ]
  },
  {
    id: 'park_chairman',
    tier: 1,
    fullName: 'Alhaji Sule "Owner of the Road" Garba',
    shortName: 'Alhaji Garba',
    title: 'Motor Park Union Chairman',
    personality: 'Collects a daily ticket from every danfo in the state, answers to nobody, and has slapped more conductors than he has paid.',
    silhouette: 'cap',
    scandals: [
      sc('FINANCIAL', 'Daily Ticket Money Vanishing Into a Mansion in Kubwa With a Swimming Pool'),
      sc('LEAKED_MEDIA', 'Video of Him Slapping a Conductor Over ₦200 Goes Viral'),
      sc('FAKE_CREDENTIALS', 'A Union Chairman Certificate Signed by Himself, in Green Ink')
    ],
    passiveName: 'Area Boys',
    passiveFlavor: 'A loyal crowd of young men who can appear in any comment section, usually smelling of last night.',
    mods: { heatRate: 1.6, counterHeat: 12 },
    abilities: [
      ab('BOT_SWARM', 8, 9, 2, 'PARK BOYS ON THE TIMELINE', 'The Park Boys Are Online',
        'Union youths flooded every thread about {Target} with identical praise, identical threats and identical spelling mistakes.')
    ]
  },
  {
    id: 'fire_pastor',
    tier: 1,
    fullName: 'Pastor Gbenga "Fire-Fire" Alade',
    shortName: 'Pastor Alade',
    title: 'Neighbourhood Prophet',
    personality: 'Predicts your breakthrough for a seed of ten thousand naira. His church has no roof but plenty of generators, and plenty of "deliverance" for the choir.',
    silhouette: 'robe',
    scandals: [
      sc('AFFAIR', '"Midnight Prayer Sessions" With the Choir Mistress, and Her Sister, and Her Cousin'),
      sc('FINANCIAL', 'Seed-Sowing Offerings Spent on a Jeep With Tinted Windows'),
      sc('LEAKED_MEDIA', 'A Fake Healing Video Edited in the Vestry; the "Blind Man" Reads a Menu')
    ],
    passiveName: 'Prayer Warriors',
    passiveFlavor: 'The congregation fasts for him, fights for him, and has never once asked where the offering went.',
    mods: { tagDoubt: { GRASSROOTS: 6 }, doubtFlat: 58, doubtRate: 2.15 },
    abilities: [
      ab('DISTRACTION', 8, 7, 12, 'REVIVAL CRUSADE', 'Three-Day Revival Crusade Announced',
        '{Target} announced a "Fire Revival Night" with free rice and free tongues, and the allegations went quiet under the speakers.')
    ]
  },
  {
    id: 'caution_landlord',
    tier: 1,
    fullName: 'Mr. Emeka "Caution Fee" Obiora',
    shortName: 'Mr. Obiora',
    title: 'Estate Landlord',
    personality: 'Owns forty rooms and has never returned a caution fee. Disputes are settled by thugs, and complaints by a very large dog.',
    silhouette: 'glasses',
    scandals: [
      sc('FINANCIAL', 'Caution Fees Never Refunded to 200 Tenants, Who Are Now Sharing One Bucket'),
      sc('FAKE_CREDENTIALS', 'A "C of O" the Land Registry Has Never Seen and the Land Has Never Heard Of'),
      sc('LEAKED_MEDIA', 'A Recording of Him Threatening Tenants: "I Go Put Una For Road Naked"')
    ],
    passiveName: 'Thugs on Retainer',
    passiveFlavor: 'Street-level muscle that can shut a lane of gossip by force, and sometimes a lane of traffic.',
    mods: { heatRate: 1.2, counterHeat: 6 },
    abilities: [
      ab('INJUNCTION', 8, 8, 2, 'STREET INTIMIDATION', 'Landlord’s Boys Shut Down the Street',
        '{Target}’s thugs visited every shop and motor park. By nightfall the street was so quiet you could hear a tenant weeping.', 'STREET')
    ]
  },
  {
    id: 'lga_councillor',
    tier: 1,
    fullName: 'Hon. Ebuka "Constituency Project" Nwosu',
    shortName: 'Hon. Nwosu',
    title: 'Local Government Chairman',
    personality: 'Commissions the same borehole in three different budgets. Loves a ribbon-cutting more than he loves his wife, which is not hard.',
    silhouette: 'suit',
    scandals: [
      sc('FINANCIAL', 'Borehole Projects That Exist Only on Paper, and in His Cousin’s Bank Account'),
      sc('FAKE_CREDENTIALS', 'A WAEC Result With Four F9s "Upgraded" to A1s by a Man Called Kingsley'),
      sc('AFFAIR', 'A Second Wife Registered as "Constituency Aide" With a Very Generous Allowance')
    ],
    passiveName: 'Paper Projects',
    passiveFlavor: 'The local radio station depends on his advertising, and his advertising depends on nobody looking.',
    mods: { coverUpRate: 1.6 },
    abilities: [
      ab('INJUNCTION', 9, 9, 3, 'AIRTIME BOUGHT', 'Local Radio Suddenly Goes Quiet',
        '{Target}’s office paid the stations for "exclusive project coverage". The phone-ins stopped, and one presenter bought a motorbike.', 'PRESS')
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
    mods: { tagDoubt: { HYPER_ONLINE: 8 }, coverUpRate: 1.6 },
    abilities: [
      ab('BOT_SWARM', 8, 8, 3, 'FAN ARMY DEPLOYED', 'Fan Pages Counter-Attack',
        '{Target}\'s fan pages mass-reported every post about the scandal and spammed the comments.')
    ]
  },
  {
    id: 'trials_coach',
    tier: 1,
    fullName: 'Coach Biodun "Next Super Eagle" Alabi',
    shortName: 'Coach Alabi',
    title: 'Football Academy Owner',
    personality: 'Promises every teenager a trial in Europe. The trials are always next month, and the boys are always sleeping on the pitch.',
    silhouette: 'uniform',
    scandals: [
      sc('FINANCIAL', 'Parents Paid Millions for Overseas Trials That Never Happened, to a Man Who Cannot Spell "Visa"'),
      sc('FAKE_CREDENTIALS', 'A CAF Licence From a Football Body That Does Not Exist, With a Stamp From a Chemist'),
      sc('LEAKED_MEDIA', 'A Voice Note Selling Squad Places: "Bring Cash, Not Talent, Oga"')
    ],
    passiveName: 'Grateful Parents',
    passiveFlavor: 'Every family he "helped" will say so on camera, because they have already paid.',
    mods: { tagDoubt: { GRASSROOTS: 4 }, days: -8, staleRate: 1.3, heatRate: 0.85 },
    abilities: [
      ab('DISTRACTION', 9, 8, 16, 'NEW TRIALS ANNOUNCED', 'Open Trials Announced This Weekend',
        '{Target} announced free trials with a "European scout", who turned out to be a cousin in a borrowed blazer. The streets care about football again.')
    ]
  },
  {
    id: 'herbal_doctor',
    tier: 1,
    fullName: 'Dr. "Doctor of Everything" Amadi',
    shortName: 'Dr. Amadi',
    title: 'Herbal Medicine Seller',
    personality: 'Cures malaria, ulcer, and heartbreak with one bottle. His "man-power" bitters have caused three divorces and one very surprised wife.',
    silhouette: 'glasses',
    scandals: [
      sc('FAKE_CREDENTIALS', 'A Medical Degree From the "University of Roadside Anambra"'),
      sc('FINANCIAL', 'Cure-All Bitters Sold at a 400% Markup, Mostly to Men Who Regret It'),
      sc('LEAKED_MEDIA', 'A Video Relabelling Paracetamol as "Ancient Root Extract for Strong Back"')
    ],
    passiveName: 'Miracle Testimonies',
    passiveFlavor: 'A parade of cured customers appears whenever he is in trouble. Several look suspiciously like the same man.',
    mods: { coverUpRate: 1.3 },
    abilities: [
      ab('COUNTER_STORY', 8, 7, 9, 'TESTIMONY MARATHON', 'Cured Customers Line Up',
        'A parade of "miraculously healed" customers swore on live radio that {Target} saved their lives, their marriages and one very tired nether region.')
    ]
  },
  {
    id: 'forex_flexer',
    tier: 1,
    fullName: 'Prince Dele "Forex God" Adeyinka',
    shortName: 'Prince Dele',
    title: 'Instagram Forex Trader',
    personality: 'Rents the car, rents the jet, rents the confidence. Teaches you to trade for ₦150,000 and to cry for free.',
    silhouette: 'hoodie',
    scandals: [
      sc('FINANCIAL', 'An Investment Group That Froze Withdrawals at 3 AM and Then Blocked Everybody'),
      sc('LEAKED_MEDIA', 'A Rented Lamborghini Returned in a Live Video, With the Rental Man Shouting'),
      sc('FAKE_CREDENTIALS', 'A "Certified Trader" Badge Bought for $20 and a Follow-Back')
    ],
    passiveName: 'Flex Culture',
    passiveFlavor: 'The online crowd mistakes rented success for wisdom, and rented girlfriends for a lifestyle.',
    mods: { tagDoubt: { HYPER_ONLINE: 10 }, spinHubs: true, doubtFlat: 59, doubtRate: 2.2, coverUpRate: 1.25 },
    abilities: [
      ab('BOT_SWARM', 7, 8, 3, 'SUCCESS STORIES POSTED', 'Fake Profit Screenshots Flood In',
        '{Target}’s students posted screenshots of staggering profits. Every one used the same template, and the same typo in "withdrawal".')
    ]
  },
  {
    id: 'land_guard',
    tier: 1,
    fullName: 'Oga Kemi "Land Guard" Salami',
    shortName: 'Oga Salami',
    title: 'Omo-Onile Land Grabber',
    personality: 'Sells your plot to you, then to your neighbour, then back to you. Has never been to a funeral he did not profit from.',
    silhouette: 'cap',
    scandals: [
      sc('FINANCIAL', 'The Same Plot Sold to Seven Different Buyers, Each With a Receipt and a Dream'),
      sc('LEAKED_MEDIA', 'A Clip of Thugs Demolishing a Family Compound While He Eats Suya on the Bonnet'),
      sc('FAKE_CREDENTIALS', 'A Forged Family Land Document Stamped by a Surveyor Who Died in 1998')
    ],
    passiveName: 'Omo-Onile Boys',
    passiveFlavor: 'His boys know every informant in the neighbourhood and most of their mothers.',
    mods: { heatRate: 0.9, counterHeat: 2 },
    abilities: [
      ab('HEAT_SURGE', 7, 9, 5, 'THUGS TIP THE POLICE', 'Land Boys Report Your Network',
        '{Target}’s associates named your couriers to a divisional police officer, who is very interested in the "contribution" that followed. Heat is rising.')
    ]
  },
  {
    id: 'slay_queen',
    tier: 1,
    fullName: 'Slay Queen "Soft Life" Amaka',
    shortName: 'Amaka',
    title: 'Lifestyle Influencer',
    personality: 'Posts the soft life from a rented flat, a borrowed car and a very understanding "sponsor" with a wife and four children.',
    silhouette: 'gele',
    scandals: [
      sc('AFFAIR', 'A "Sponsor" Who Turns Out to Be a Married Senator With a Loud Wife'),
      sc('FINANCIAL', 'A Fashion Brand That Never Ships a Single Dress, Only Excuses'),
      sc('LEAKED_MEDIA', 'A Livestream Revealing Her "Mansion" Is a Hotel Lobby and Her Chef Is the Receptionist')
    ],
    passiveName: 'Soft Life Squad',
    passiveFlavor: 'Her followers defend the lifestyle, and screenshot every critic into a group called "Haters (Tag Them)".',
    mods: { tagDoubt: { HYPER_ONLINE: 6 }, doubtFlat: 40, doubtRate: 1.6 },
    abilities: [
      ab('BOT_SWARM', 8, 8, 2, 'SQUAD ACTIVATED', 'The Soft Life Squad Strikes Back',
        '{Target}’s followers are replying to every post with "hater" and a crown emoji. Several have also sent a bucket of toxic DMs.')
    ]
  },
  {
    id: 'forex_signals',
    tier: 1,
    fullName: 'Chukwudi "Forex Signals" Okafor',
    shortName: 'Chukwudi Okafor',
    title: 'Telegram Signals Seller',
    personality: 'Sells winning trade signals for ₦20,000 a month. His own account has never won a single trade, or a single argument.',
    silhouette: 'hoodie',
    scandals: [
      sc('FINANCIAL', 'Paid Signals That Lose Money Every Single Time, Like Clockwork and Gonorrhoea'),
      sc('LEAKED_MEDIA', 'A Screen-Share Showing His Trading Account Is Empty, Next to a Pizza Order'),
      sc('FAKE_CREDENTIALS', 'A "Certified Analyst" Licence From a Facebook Group Called "Wealth Brothers"')
    ],
    passiveName: 'Signal Group Loyalty',
    passiveFlavor: 'His paying members cannot admit they were fooled, because their wives are already asking.',
    mods: { tagDoubt: { HYPER_ONLINE: 6 }, doubtFlat: 60, doubtRate: 2.2, coverUpRate: 1.35 },
    abilities: [
      ab('DISTRACTION', 9, 8, 10, 'FREE SIGNAL DAY', 'A "Free Signal Day" Dominates Telegram',
        '{Target} announced free signals for everyone. The channels are suddenly full of other conversations, and several marriages.')
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
    mods: { tagDoubt: { HYPER_ONLINE: 6 }, days: -2, staleRate: 1.1, heatRate: 0.95 },
    abilities: [
      ab('DISTRACTION', 8, 8, 9, 'NEW SKIT DROPPED', 'A Brand-New Skit Takes Over the Timeline',
        '{Target} dropped a new skit and the entire internet is quoting it. Nobody is talking about anything else.')
    ]
  }
];
