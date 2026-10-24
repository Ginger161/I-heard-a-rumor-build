import { TargetBase, ab, sc } from '../targetTypes';

// TIER 4: TITANS. Kingmakers, billionaires and institutions. They fight back on several fronts.
// Voice: adult and unfiltered (these are invented characters).
export const TIER_4: TargetBase[] = [
  {
    id: 'general_maradona',
    tier: 4,
    fullName: 'Gen. (rtd) Babale "The Maradona" Adamu',
    shortName: 'Gen. Adamu',
    title: 'Retired General and Kingmaker',
    personality: 'Ruled once by decree, now rules by phone call. Nobody wins an election without visiting his compound and kissing something.',
    silhouette: 'uniform',
    scandals: [
      sc('FINANCIAL', 'Looted Billions Stashed Across Five Countries, Each in a Different Wife’s Name'),
      sc('FAKE_CREDENTIALS', 'A War Record Written After the War Ended, in Better Handwriting'),
      sc('LEAKED_MEDIA', 'A Tape of Him Planning to Overthrow a Government Over Pepper Soup')
    ],
    passiveName: 'The Old Guard',
    passiveFlavor: 'Elite hubs obey him from habit, and the security services still salute, from the bathroom too.',
    mods: { eliteFriction: 0.14, heatRate: 0.8, coverUpRate: 0.8 },
    abilities: [
      ab('HEAT_SURGE', 7, 8, 5, 'OLD GUARD ACTIVATED', 'Retired Officers Open Your Files',
        'Old comrades inside the security services opened a file on you at {Target}’s request. It is thicker than your birth certificate and meaner.'),
      ab('INJUNCTION', 9, 10, 4, 'CALL FROM THE COMPOUND', 'A Phone Call Silences a Channel',
        'One call from {Target}’s compound and one of your channels suddenly decided to stop publishing, wipe its drive and move to Cotonou.')
    ]
  },
  {
    id: 'offshore_chief',
    tier: 4,
    fullName: 'Chief Ebitimi "Offshore" Preye',
    shortName: 'Chief Preye',
    title: 'Oil Mogul',
    personality: 'Allocated himself oil blocks and then sold them to himself at a profit. Calls it "indigenous content".',
    silhouette: 'agbada',
    scandals: [
      sc('FINANCIAL', 'Oil Blocks Allocated to Shell Companies He Owns, Under His Mistress’s Maiden Name'),
      sc('LEAKED_MEDIA', 'A Yacht Party Filmed on a Day of National Mourning; the Champagne Was Pink'),
      sc('AFFAIR', 'A Secret Villa on the French Riviera With a Girlfriend Who Calls Him "Daddy"')
    ],
    passiveName: 'Offshore Lawyers',
    passiveFlavor: 'A legal army in three countries checks every document you leak and bills you for the pleasure.',
    mods: { forgeryRisk: 0.1, coverUpRate: 1, doubtFlat: 46, doubtRate: 1.8, heatRate: 1.15, counterHeat: 5 },
    abilities: [
      ab('COUNTER_STORY', 8, 9, 8, 'LEGAL STATEMENT', 'A Legal Statement in Three Languages',
        'Lawyers in London, Lagos and Dubai issued a joint statement denying everything, in three accents and one font.'),
      ab('INJUNCTION', 10, 11, 4, 'ELITE CLOSES RANKS', 'The Boardrooms Go Quiet',
        'Every banker and golf partner that mattered stopped taking your calls. The elite are closing ranks, and one is closing a door on your fingers.', 'ELITE')
    ]
  },
  {
    id: 'unicorn_founder',
    tier: 4,
    fullName: 'Mr. Tunji "Unicorn" Alabi',
    shortName: 'Mr. Alabi',
    title: 'Tech Billionaire',
    personality: 'Raised half a billion dollars on user numbers that existed only in a spreadsheet, and a very good hoodie.',
    silhouette: 'hoodie',
    scandals: [
      sc('FINANCIAL', 'Inflated User Numbers Used to Raise a Fortune; 60% of the Users Were His Cousins'),
      sc('LEAKED_MEDIA', 'Leaked Slack Messages Calling His Users "Marks" and His Investors "Mugu"'),
      sc('FAKE_CREDENTIALS', 'A Stanford Degree That Was a Summer Short Course He Napped Through')
    ],
    passiveName: 'Silicon Armour',
    passiveFlavor: 'He owns the platforms where the story spreads, and his bots own the comments.',
    mods: { tagDoubt: { HYPER_ONLINE: 12 }, spinHubs: true, days: -6, staleRate: 1.25, heatRate: 0.85, doubtFlat: 30, doubtRate: 1.3 },
    abilities: [
      ab('BOT_SWARM', 6, 7, 4, 'ALGORITHM SHIFT', 'The Algorithm Suddenly Favours the Target',
        'An "algorithm update" buried your posts and surfaced {Target}’s own, including a thirst trap from his board meeting. Spin bubbles are everywhere.'),
      ab('INJUNCTION', 9, 10, 4, 'PLATFORM POLICY', 'A Platform "Policy Violation" Hits Your Channel',
        'One of your Social channels was suspended for "coordinated inauthentic behaviour". The reviewer was his sister.', 'SOCIAL')
    ]
  },
  {
    id: 'prayer_jet_bishop',
    tier: 4,
    fullName: 'Bishop Okoro "Prayer Jet" Nwachukwu',
    shortName: 'Bishop Okoro',
    title: 'Mega-Church General Overseer',
    personality: 'Owns four jets and says each is a "prayer partner". His members cry when he lands, and he cries when the offering is small.',
    silhouette: 'robe',
    scandals: [
      sc('AFFAIR', 'Private Jet Flights With Someone Else’s Spouse, and Someone Else’s Spouse’s Sister'),
      sc('FINANCIAL', 'Land Donated for a Cathedral, Then Quietly Resold to a Brewery'),
      sc('LEAKED_MEDIA', 'Sermon Audio Revealing a "Seed-Faith" Pyramid: "The More You Give, the Less He Hates You"')
    ],
    passiveName: 'Spiritual Shield',
    passiveFlavor: 'The faithful believe him over every receipt you show them, and will fast for his enemies to suffer.',
    mods: { doubtFlat: 39, doubtRate: 1.55, heatRate: 1.05, counterHeat: 3 },
    abilities: [
      ab('COUNTER_STORY', 8, 9, 9, 'NATIONAL PRAYER DAY', 'A National Day of Prayer for the Bishop',
        'Millions of followers were told to pray against "the spirit of slander". Doubt is hardening, and so are the knees.'),
      ab('DISTRACTION', 11, 12, 14, 'HEALING CRUSADE', 'A Televised Healing Crusade Takes Over',
        '{Target} announced a nationwide healing crusade. Attention shifted at once, along with several suspicious limps.')
    ]
  },
  {
    id: 'senate_president',
    tier: 4,
    fullName: 'Sen. Chuka "Order Order" Nwafor',
    shortName: 'Sen. Nwafor',
    title: 'Senate President',
    personality: 'Presides over three hundred votes and has bought most of them. Says "order, order" the way other men say "amen".',
    silhouette: 'agbada',
    scandals: [
      sc('FINANCIAL', 'A National Budget Padded With Phantom Projects, Including a Bridge Over Nothing'),
      sc('FAKE_CREDENTIALS', 'An Age Declared Differently in Three Official Documents, Spanning Thirty-Five Years'),
      sc('LEAKED_MEDIA', 'A Leaked Plot to Rewrite an Anti-Graft Law, Written on the Back of a Menu')
    ],
    passiveName: 'Gavel Authority',
    passiveFlavor: 'He controls the narrative on the floor and on the front page, and bangs the table when he cannot.',
    mods: { eliteFriction: 0.2, heatRate: 1.45, counterHeat: 10, coverUpRate: 1.05 },
    abilities: [
      ab('INJUNCTION', 8, 9, 4, 'COMMITTEE HEARING', 'A Committee Summons Your Press Contacts',
        'A "hearing on press ethics" pulled your Press channels into days of questions about their mothers’ surnames.', 'PRESS'),
      ab('COUNTER_STORY', 9, 10, 9, 'FLOOR RESOLUTION', 'The Chamber Passes a Resolution',
        'The entire chamber voted in support of {Target}. The story now looks like an attack on democracy and on lunch.')
    ]
  },
  {
    id: 'super_agent',
    tier: 4,
    fullName: 'Wale "Transfer Fee" Ajayi',
    shortName: 'Wale Ajayi',
    title: 'Football Super-Agent',
    personality: 'Sells Nigerian teenagers to European clubs for fees nobody has ever seen written down, and takes 30% of the dreams.',
    silhouette: 'suit',
    scandals: [
      sc('FINANCIAL', 'Players Signed on Hidden Commissions, With Mothers Signing Blank Papers'),
      sc('LEAKED_MEDIA', 'A Phone Call Selling a Child Prodigy: "He’s Seventeen, Oga, Don’t Ask Me Which Year"'),
      sc('FAKE_CREDENTIALS', 'A Licence Number That Belongs to a Different Person, a Dentist in Ibadan')
    ],
    passiveName: 'Global Network',
    passiveFlavor: 'Contacts in every capital amplify his defence in real time, mostly by blocking you.',
    mods: { spinHubs: true, days: -6, staleRate: 1.25, heatRate: 0.85, doubtFlat: 31, doubtRate: 1.3 },
    abilities: [
      ab('BOT_SWARM', 7, 8, 3, 'PLAYER ENDORSEMENTS', 'Famous Players Post in His Defence',
        'A handful of famous players posted supportive messages, thanking him "for the opportunity", and a fan army followed.'),
      ab('DISTRACTION', 10, 11, 23, 'TRANSFER WINDOW', 'Transfer Window Frenzy Takes Over',
        'A record-breaking transfer announcement swept every sports and news desk. The player has not been told yet.')
    ]
  },
  {
    id: 'media_owner',
    tier: 4,
    fullName: 'Chief Ojo "The Gist" Oladimeji',
    shortName: 'Chief Oladimeji',
    title: 'Media Group Owner',
    personality: 'Owns six newspapers, three radio stations, and the only TV channel anybody watches. Decides what is news before it happens.',
    silhouette: 'agbada',
    scandals: [
      sc('FINANCIAL', 'A Newsroom Secretly Funded by Government Adverts, with Reporters on Retainer'),
      sc('LEAKED_MEDIA', 'An Editor’s Memo Killing the Biggest Story of the Year: "Too Spicy, Cancel It"'),
      sc('FAKE_CREDENTIALS', 'A Journalism Award From an Organisation That Does Not Exist, Presented by His Nephew')
    ],
    passiveName: 'Owns the Press',
    passiveFlavor: 'Press and elite channels bend toward him, and the story goes stale faster.',
    mods: { eliteFriction: 0.2, staleRate: 1.1, days: -3, heatRate: 0.95, doubtFlat: 32, doubtRate: 1.35 },
    abilities: [
      ab('INJUNCTION', 7, 8, 4, 'EDITORIAL DIRECTIVE', 'An Editorial Directive Silences the Press',
        'Every outlet owned by {Target} dropped the story the same morning, and replaced it with a recipe.', 'PRESS'),
      ab('DISTRACTION', 10, 11, 14, 'FRONT PAGE REPLACED', 'The Front Page Is Replaced',
        'Another "scandal" about a minor celebrity’s nipple filled every front page at once.')
    ]
  },
  {
    id: 'second_term_governor',
    tier: 4,
    fullName: 'Chief Osaze "Second Term" Aigbe',
    shortName: 'Chief Aigbe',
    title: 'Governor Seeking a Third Term',
    personality: 'The constitution says two terms. He has a different reading, and the court agrees, for a fee.',
    silhouette: 'agbada',
    scandals: [
      sc('FINANCIAL', 'A Bailout Fund That Only Bailed Out His Friends, His Church and His Tailor'),
      sc('AFFAIR', 'A State-Funded Mansion for a Girlfriend, Complete With a Pool Boy on the Payroll'),
      sc('FAKE_CREDENTIALS', 'An Age Declaration Older Than His Own Parents, Who Are Both Confused')
    ],
    passiveName: 'State Machinery',
    passiveFlavor: 'The entire state apparatus is a weapon against anyone who looks at him for too long.',
    mods: { heatRate: 1, counterHeat: 3, doubtFlat: 24, doubtRate: 1.1 },
    abilities: [
      ab('HEAT_SURGE', 7, 8, 8, 'STATE SECURITY BRIEFED', 'State Security Is Told to Find You',
        '{Target} ordered the state security service to "look into" the source of the leaks. They are now looking into your mother’s landlord.'),
      ab('COUNTER_STORY', 9, 10, 9, 'STATE DEFENCE RALLY', 'A Rally Fills the State Stadium',
        'Civil servants were given the day off, a bag of rice and a T-shirt to attend a rally defending {Target}. The rice was stale.')
    ]
  },
  {
    id: 'brother_in_law',
    tier: 4,
    fullName: 'Mr. Kelechi "Brother-in-Law" Nnadi',
    shortName: 'Mr. Nnadi',
    title: 'Presidential In-Law and Financier',
    personality: 'Wins contracts nobody else can bid for because of who his sister married. Introduces himself as "family".',
    silhouette: 'suit',
    scandals: [
      sc('FINANCIAL', 'Contracts Awarded Because of Who He Married Into, and Who He Will Marry Next'),
      sc('LEAKED_MEDIA', 'A Recording That Mentions "the Oga at the Top" and Where He Hides the Bodies of Tenders'),
      sc('FAKE_CREDENTIALS', 'An Accountancy Qualification Sat in His Wife’s Name by a Very Obedient Examiner')
    ],
    passiveName: 'Family Shield',
    passiveFlavor: 'Everyone in the story is related to someone who can end it.',
    mods: { coverUpRate: 1.05, heatRate: 1.5, counterHeat: 11 },
    abilities: [
      ab('COUNTER_STORY', 8, 9, 9, 'FAMILY STATEMENT', 'The First Family Issues a Statement',
        'A statement "on behalf of the family" called the allegations a personal attack, and a threat to Christmas.'),
      ab('INJUNCTION', 10, 11, 4, 'A FRIENDLY CALL', 'A Friendly Call Closes a Channel',
        'Somebody in a very big office asked one of your channels to "reconsider". The channel reconsidered immediately.')
    ]
  },
  {
    id: 'diaspora_investor',
    tier: 4,
    fullName: 'Dr. Ayo "Diaspora Investor" Coker',
    shortName: 'Dr. Coker',
    title: 'Diaspora Real-Estate Mogul',
    personality: 'Sells the same tower in Lekki to every Nigerian abroad with a pension, and visits each of them to cry about it.',
    silhouette: 'glasses',
    scandals: [
      sc('FINANCIAL', 'A Real-Estate Scheme That Sold the Same Tower Twice, and the Same Penthouse Nine Times'),
      sc('LEAKED_MEDIA', 'A Zoom Call Admitting the Whole Thing Was a Pyramid: "It’s Fine, They’re Abroad"'),
      sc('FAKE_CREDENTIALS', 'A London Professorship That Turned Out to Be a Rented Office Above a Kebab Shop')
    ],
    passiveName: 'Offshore Reach',
    passiveFlavor: 'Lawyers abroad pick apart anything you leak, in a posher accent than yours.',
    mods: { forgeryRisk: 0.1, doubtFlat: 39, doubtRate: 1.55, days: -4, staleRate: 1.2, heatRate: 0.9 },
    abilities: [
      ab('BOT_SWARM', 7, 8, 3, 'DIASPORA GROUP CHATS', 'Diaspora WhatsApp Groups Rally Behind Him',
        'A thousand diaspora group chats suddenly agreed {Target} is a victim of "jealousy at home". All of them have the same typo.'),
      ab('DISTRACTION', 11, 12, 17, 'PHILANTHROPY TOUR', 'A Charity Tour Dominates the Diaspora News',
        '{Target} announced a scholarship fund and a hospital wing in one week, both paid for by the people he cheated.')
    ]
  },
  {
    id: 'godfather',
    tier: 4,
    fullName: 'Chief Obafemi "The Godfather" Adebayo',
    shortName: 'Chief Adebayo',
    title: 'Governor / Political Titan',
    personality: 'Three terms in Government House, a private jet fleet, and a friend in every agency. Believes in democracy the way a wolf believes in sheep.',
    silhouette: 'agbada',
    scandals: [
      sc('FINANCIAL', 'The Vanished ₦85B Ecological Fund, Spent on a Mansion in Maryland and a Pony Named Justice'),
      sc('AFFAIR', 'A Secret Second Family in a Maryland Suburb, With a Cat Named Obafemi'),
      sc('FAKE_CREDENTIALS', 'An Honorary Doctorate From a University That Does Not Exist, Awarded by a Dog')
    ],
    passiveName: 'Federal Might',
    passiveFlavor: 'Elite hubs barely listen to street gossip, and the security agencies take his calls, and his wives’ calls too.',
    mods: { eliteFriction: 0.18, heatRate: 0.9, counterHeat: 1, doubtFlat: 22, doubtRate: 1.05 },
    abilities: [
      ab('HEAT_SURGE', 8, 10, 5, 'AGENCIES ACTIVATED', 'Security Agencies Receive a Phone Call',
        'A call from {Target}’s office to "the right people" put your network on three different watchlists, one of them for a crime you have not thought of yet.')
    ]
  }
];
