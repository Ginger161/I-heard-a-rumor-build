import { TargetBase, ab, sc } from '../targetTypes';

// TIER 3: NATIONAL HEAVYWEIGHTS. Federal power, big money, and lawyers on speed dial.
// Voice: adult and unfiltered (these are invented characters). Entries re-skinned by data/parody.ts
// (rapper_activist, comedian_king) keep their original text, because those stay comic.
export const TIER_3: TargetBase[] = [
  {
    id: 'minister',
    tier: 3,
    fullName: 'Hon. Musa "Toronto" Danjuma',
    shortName: 'Hon. Danjuma',
    title: 'Federal Minister',
    personality: 'A "Toronto-trained" cabinet minister whose certificate nobody at Toronto can find, and whose lawyers file faster than he talks, or thinks.',
    silhouette: 'suit',
    scandals: [
      sc('FAKE_CREDENTIALS', 'A Forged University Degree and a Ghost NYSC Certificate With a Photo of Someone Else’s Uncle'),
      sc('FINANCIAL', 'Federal Contracts Awarded to His Cousin’s Company, Which Is Also His Wife’s Company'),
      sc('AFFAIR', 'An Official Convoy Used to Visit a Secret Family, With Siren and Suya')
    ],
    passiveName: 'Court Injunction Machine',
    passiveFlavor: 'Every counter-offensive comes with a frivolous defamation suit and a very smug lawyer.',
    mods: { counterHeat: 10 },
    abilities: [
      ab('INJUNCTION', 8, 9, 3, 'EX PARTE ORDER', 'A Court Order Lands on Your Desk',
        'Within hours, {Target}’s lawyers obtained an ex parte order forcing one of your channels to go silent. The judge’s car was new.')
    ]
  },
  {
    id: 'distinguished_senator',
    tier: 3,
    fullName: 'Sen. Dauda "Distinguished" Maikudi',
    shortName: 'Sen. Maikudi',
    title: 'Federal Senator',
    personality: 'Has not been seen in his constituency since the last election, but his allowance never misses, and neither does his tailor.',
    silhouette: 'agbada',
    scandals: [
      sc('FINANCIAL', 'A Constituency Allowance Spent on a Private Stadium and Three Wedding Receptions'),
      sc('FAKE_CREDENTIALS', 'A Certificate Contradicted by His Own Birth Year, Which He Changed Twice'),
      sc('LEAKED_MEDIA', 'Floor-Debate Footage of Him Asleep During the Budget, Snoring in Two Languages')
    ],
    passiveName: 'Immunity of the Chamber',
    passiveFlavor: 'Elite hubs defend the institution, and so do his friends in the press, for a modest fee.',
    mods: { eliteFriction: 0.3 },
    abilities: [
      ab('INJUNCTION', 9, 9, 3, 'PRESS ACCREDITATION REVIEW', 'National Assembly Reviews Press Accreditation',
        'A "routine review" of press accreditation quietly sidelined the outlets running the story. Three reporters were asked to bring their birth certificates.', 'PRESS'),
      ab('COUNTER_STORY', 10, 11, 8, 'SENATE STATEMENT', 'The Senate Issues a Solidarity Statement',
        'Senators from both parties signed a statement calling the allegations "an attack on the legislature". It is the first thing they have agreed on all year.')
    ]
  },
  {
    id: 'subsidy_marketer',
    tier: 3,
    fullName: 'Alhaji Mamman "Subsidy Papa" Tijjani',
    shortName: 'Alhaji Tijjani',
    title: 'Oil Marketer',
    personality: 'Collects subsidy on fuel that, on paper, has crossed the Atlantic six times, and been drunk by nobody.',
    silhouette: 'agbada',
    scandals: [
      sc('FINANCIAL', 'Subsidy Claims for Petrol That Was Never Imported and Never Existed'),
      sc('LEAKED_MEDIA', 'Drone Footage of Tankers at a Ghost Depot; One Is Clearly a Cow'),
      sc('FAKE_CREDENTIALS', 'An Import Licence Issued to a Company That Does Not Exist, Run by a Man Who Does Not Exist')
    ],
    passiveName: 'Regulatory Capture',
    passiveFlavor: 'The regulator reports to him, informally, over expensive dinners.',
    mods: {},
    abilities: [
      ab('HEAT_SURGE', 7, 9, 8, 'REGULATOR WHISPERS', 'Your Domain Is Flagged by the Regulator',
        'A quiet request from {Target} led to a regulator flagging your servers for "suspicious activity". Nobody has defined it. Nobody will.')
    ]
  },
  {
    id: 'telecom_tycoon',
    tier: 3,
    fullName: 'Dr. Chidi "Network Error" Obiakor',
    shortName: 'Dr. Obiakor',
    title: 'Telecom Tycoon',
    personality: 'Controls the pipes your WhatsApp travels through, and knows it. Has never once apologised for your data disappearing.',
    silhouette: 'glasses',
    scandals: [
      sc('FINANCIAL', 'A Data-Expiry Scheme That Quietly Took Billions and Your Last ₦200'),
      sc('LEAKED_MEDIA', 'An Executive Recording Mocking Subscribers: "They’ll Pay for Air If We Tell Them To"'),
      sc('FAKE_CREDENTIALS', 'An Engineering Doctorate From a Mail-Order University With a Very Nice Gown')
    ],
    passiveName: 'Control of the Pipes',
    passiveFlavor: 'He can slow down any platform where the story spreads, and does, usually at 6 PM.',
    mods: { tagDoubt: { HYPER_ONLINE: 6 } },
    abilities: [
      ab('INJUNCTION', 8, 8, 3, 'NETWORK THROTTLED', 'Social Platforms Mysteriously Slow Down',
        'Data speeds collapsed across the networks carrying your Social channels. "Technical difficulties," says {Target}’s company, with a straight face.', 'SOCIAL')
    ]
  },
  {
    id: 'cbn_deputy',
    tier: 3,
    fullName: 'Dr. Folake "Naira Swap" Adeniran',
    shortName: 'Dr. Adeniran',
    title: 'Deputy Governor, Central Bank',
    personality: 'Speaks fluent policy and answers every question with another question about liquidity. Has never once been caught blinking.',
    silhouette: 'glasses',
    scandals: [
      sc('FINANCIAL', 'Exchange-Rate Windows Open Only to Her Friends, Her Cousins and Her Hairdresser'),
      sc('FAKE_CREDENTIALS', 'An Economics Doctorate With a Missing Thesis and a Confused Supervisor'),
      sc('LEAKED_MEDIA', 'A Leaked Memo Admitting the Reserves Were Overstated, With a Note Saying "Delete This"')
    ],
    passiveName: 'Policy Fog',
    passiveFlavor: 'Nobody can explain the story clearly, including you. Forgeries are checked fast.',
    mods: { eliteFriction: 0.3, forgeryRisk: 0.08 },
    abilities: [
      ab('DISTRACTION', 9, 10, 15, 'NEW POLICY ANNOUNCED', 'Surprise Monetary Policy Dominates the News',
        'A dramatic new policy announcement from {Target}’s office has every business desk rewriting its front page. Nobody understands it, and everybody is panicking.')
    ]
  },
  {
    id: 'adjournment_judge',
    tier: 3,
    fullName: 'Hon. Justice Garba "Adjournment" Lawal',
    shortName: 'Justice Lawal',
    title: 'Federal High Court Judge',
    personality: 'Has adjourned the same corruption case forty-one times. Cites "the interest of justice" and means "the interest of my pocket".',
    silhouette: 'robe',
    scandals: [
      sc('FINANCIAL', 'Bail Fees Collected in Brown Envelopes the Size of Pillows'),
      sc('FAKE_CREDENTIALS', 'A Judgment Citing a Law Report That Was Never Printed, by a Judge Who Never Read It'),
      sc('LEAKED_MEDIA', 'A Recorded Phone Call With a Defendant’s Lawyer: "Make It Worth My Stress"')
    ],
    passiveName: 'Bench Immunity',
    passiveFlavor: 'He can silence anything with an order, and the order lasts longer than most marriages.',
    mods: {},
    abilities: [
      ab('INJUNCTION', 9, 9, 4, 'RESTRAINING ORDER', 'Restraining Order Served on Your Channels',
        'A judge who has "heard enough" of the case issued a sweeping order against further publication. He had not heard any of it.')
    ]
  },
  {
    id: 'customs_controller',
    tier: 3,
    fullName: 'Col. (rtd) Yakubu "Rice Pyramid" Danbaba',
    shortName: 'Col. Danbaba',
    title: 'Customs Comptroller',
    personality: 'Seizes containers by day. They are somehow gone by night, and so is his conscience.',
    silhouette: 'uniform',
    scandals: [
      sc('FINANCIAL', 'Seized Containers That Vanished From the Port, Along With the Port Staff’s Memory'),
      sc('LEAKED_MEDIA', 'Dashcam Footage of a Bribe at a Checkpoint: "Oga, Small Something For the Boys"'),
      sc('FAKE_CREDENTIALS', 'A Military Record With Six Missing Years and One Very Convenient Fire')
    ],
    passiveName: 'Uniformed Muscle',
    passiveFlavor: 'Armed officers are good at finding who is behind a leak, and better at finding their wallet.',
    mods: {},
    abilities: [
      ab('HEAT_SURGE', 6, 8, 8, 'DAWN RAID DRILL', 'Armed Officers Question Your Couriers',
        '{Target}’s men detained two of your couriers for "routine questioning" at 4 AM. Heat is climbing, and so is the cost of bail.')
    ]
  },
  {
    id: 'presidency_spokesman',
    tier: 3,
    fullName: 'Mr. Ola "Clarification" Bakare',
    shortName: 'Mr. Bakare',
    title: 'Presidential Spokesman',
    personality: 'Has never once said "we made a mistake". Has issued ten thousand "clarifications", each one worse than the last.',
    silhouette: 'suit',
    scandals: [
      sc('LEAKED_MEDIA', 'An Open Mic Catching Him Mid-Lie: "Just Tell Them It Was Taken Out of Context"'),
      sc('FAKE_CREDENTIALS', 'A Journalism Degree From a Press-Pass Shop in Ikeja'),
      sc('FINANCIAL', 'A Media Slush Fund Disguised as "Public Enlightenment", Mostly Spent on Aso-Ebi')
    ],
    passiveName: 'Spin Doctor',
    passiveFlavor: 'His whole career is making stories go away. PR bubbles are far more common.',
    mods: {},
    abilities: [
      ab('BOT_SWARM', 7, 8, 3, 'CLARIFICATION ISSUED', 'A Clarification Flood Hits Every Platform',
        '{Target} issued a dozen "clarifications" at once, each amplified by a paid network of accounts called "Patriot Pikin".'),
      ab('COUNTER_STORY', 10, 11, 8, 'OFFICIAL STATEMENT', 'The Presidency Issues a Formal Rebuttal',
        'A formal rebuttal from the Presidency calls the allegations "politically motivated, malicious and false". It is four pages long and has no facts.')
    ]
  },
  {
    id: 'igp_everything',
    tier: 3,
    fullName: 'IGP Abubakar "Operation Everything" Gwandu',
    shortName: 'IGP Gwandu',
    title: 'Inspector-General of Police',
    personality: 'Launches a new "Operation" every week and solves none of them. His press conferences are more dangerous than his officers.',
    silhouette: 'uniform',
    scandals: [
      sc('FINANCIAL', 'Police Recruitment Fees Paid Into a Private Account Owned by His Driver'),
      sc('LEAKED_MEDIA', 'Radio Chatter Ordering Officers to "Lose the Evidence" and the Suspect'),
      sc('FAKE_CREDENTIALS', 'A Promotion Letter Signed Three Days After Retirement With a Different Pen')
    ],
    passiveName: 'The Force Behind Him',
    passiveFlavor: 'Every officer in the country is on his side, and on your trail.',
    mods: {},
    abilities: [
      ab('HEAT_SURGE', 7, 8, 9, 'OPERATION LAUNCHED', 'A New Operation Is Announced Against "Mischief Makers"',
        '{Target} launched "Operation Silence". Officers are already asking questions about your network, and your mother’s house.')
    ]
  },
  {
    id: 'cement_sugar_baron',
    tier: 3,
    fullName: 'Alhaji Danladi "Cement & Sugar" Ibrahim',
    shortName: 'Alhaji Danladi',
    title: 'Industrial Baron',
    personality: 'Owns every bag of cement and sugar in the country, and a few ministers besides. His price list is a love letter to greed.',
    silhouette: 'agbada',
    scandals: [
      sc('FINANCIAL', 'Import Waivers Traded for a Monopoly, Sealed With a Goat'),
      sc('LEAKED_MEDIA', 'Boardroom Audio Fixing Prices Across the Nation: "Make Them Cry, Then Charge Extra"'),
      sc('AFFAIR', 'A Secret Second Marriage to a Sugar Heiress Half His Age and Twice His Size in Lawyers')
    ],
    passiveName: 'Bottomless Budget',
    passiveFlavor: 'He can afford the best crisis managers in the country, and the worst ones too, just in case.',
    mods: { coverUpRate: 1.15 },
    abilities: [
      ab('COUNTER_STORY', 8, 9, 8, 'CRISIS FIRM RETAINED', 'A Top Crisis Firm Takes the Lead',
        'A famous crisis-management firm just issued {Target}’s first coordinated response. It was posted at 6:06 PM and signed "peace and light".'),
      ab('DISTRACTION', 11, 12, 12, 'PHILANTHROPY GALA', 'A Charity Gala Fills the News',
        '{Target} donated a hospital wing on live television. The cameras did not show the closed wards.')
    ]
  },
  {
    id: 'televangelist',
    tier: 3,
    fullName: 'Apostle Miracle "Anointed" Chukwu',
    shortName: 'Apostle Chukwu',
    title: 'Mega-Church Televangelist',
    personality: 'Fifty thousand members, a prayer-line empire, and a congregation that believes him over its own eyes, ears and bank alerts.',
    silhouette: 'robe',
    scandals: [
      sc('AFFAIR', 'A Secret Cyprus Villa and Leaked Entanglement Tapes: He Calls It "Laying of Hands"'),
      sc('LEAKED_MEDIA', 'A Staged Miracle Healing Caught From the Back Row; the Cripple Is Doing Zumba'),
      sc('FINANCIAL', 'Tithe Money Funding a Private Jet and a Chef Who Only Cooks for Him')
    ],
    passiveName: 'Flock Immunity',
    passiveFlavor: 'His followers defend him blindly. Every state starts with high Doubt.',
    mods: { doubtFlat: 25 },
    abilities: [
      ab('COUNTER_STORY', 8, 9, 7, 'MIRACLE TESTIMONIES', 'The Flock Testifies',
        'Hundreds of members took to the pulpit to swear {Target} is a man of God and the allegations are demonic. One woman fainted on cue.')
    ]
  },
  {
    id: 'rapper_activist',
    tier: 3,
    fullName: 'Fola "Rapping Activist" Ogundare',
    shortName: 'Fola Ogundare',
    title: 'Activist Rapper',
    personality: 'Raps about the struggle from a studio with excellent air conditioning.',
    silhouette: 'cap',
    scandals: [
      sc('LEAKED_MEDIA', 'A Protest Song Recorded in a Very Comfortable Studio'),
      sc('FINANCIAL', 'Merch Priced for the Revolution, Not the People'),
      sc('FAKE_CREDENTIALS', 'A Law Degree Mostly Used in Music Videos')
    ],
    passiveName: 'Movement Credibility',
    passiveFlavor: 'Students and young voters believe him over most journalists.',
    mods: { tagDoubt: { HYPER_ONLINE: 8 }, forgeryRisk: 0.05 },
    abilities: [
      ab('COUNTER_STORY', 9, 9, 8, 'PROTEST SONG', 'A Protest Song Defends Him',
        '{Target} dropped a protest anthem about "people who attack the movement". Streams are climbing.'),
      ab('INJUNCTION', 10, 11, 3, 'CAMPUS NETWORK', 'The Campus Network Goes Quiet',
        'Student unions announced a boycott of every outlet covering the story.', 'PRESS')
    ]
  },
  {
    id: 'comedian_king',
    tier: 3,
    fullName: 'Basil "King of Comedy" Okeke',
    shortName: 'Basil Okeke',
    title: 'Stand-Up Comedy Legend',
    personality: 'Has been the funniest man in the country for twenty years, according to himself.',
    silhouette: 'mic',
    scandals: [
      sc('LEAKED_MEDIA', 'The Same Joke Told at Four Different Weddings'),
      sc('FINANCIAL', 'Tickets Priced Per Laugh'),
      sc('AFFAIR', 'A Long-Running Feud With a Banana')
    ],
    passiveName: 'Laugh It Off',
    passiveFlavor: 'He turns every attack into a bit, and the crowd always laughs along.',
    mods: { staleRate: 1.15 },
    abilities: [
      ab('DISTRACTION', 8, 9, 14, 'SPECIAL ANNOUNCED', 'A Surprise Comedy Special Drops Tonight',
        '{Target} announced a surprise special. Every entertainment desk dropped everything to cover it.'),
      ab('COUNTER_STORY', 10, 11, 8, 'ROAST OF THE ACCUSERS', 'He Roasts His Accusers on Live TV',
        '{Target} spent twelve minutes on live TV roasting the allegations. The audience gave a standing ovation.')
    ]
  }
];
