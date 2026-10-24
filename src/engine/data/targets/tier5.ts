import { TargetBase, ab, sc } from '../targetTypes';

// TIER 5: THE UNTOUCHABLES. Nobody has ever taken one of these down. Every system fights you.
// Voice: adult and unfiltered (these are invented characters). Entries re-skinned by data/parody.ts
// (african_giant, richest_man) keep their original text, because those stay comic.
export const TIER_5: TargetBase[] = [
  {
    id: 'the_landslide',
    tier: 5,
    fullName: 'H.E. Dr. Nuhu "The Landslide" Okonkwo',
    shortName: 'The President',
    title: 'President of the Republic',
    personality: 'Won by a landslide in a country where the votes were counted by candlelight and the candles were also counted twice.',
    silhouette: 'agbada',
    scandals: [
      sc('FINANCIAL', 'A Missing ₦2 Trillion Nobody Can Explain, Including the Man Who Took It'),
      sc('FAKE_CREDENTIALS', 'A School Certificate That Vanished the Day After the Election, Along With the School'),
      sc('LEAKED_MEDIA', 'A Tape of a "Special Arrangement" With the Oil Barons: "Don’t Say My Name, Say Your Share"')
    ],
    passiveName: 'The Full State',
    passiveFlavor: 'Every agency, every court and every broadcaster answers to him, and several bishops too.',
    mods: { coverUpRate: 0.85, heatRate: 1.05, counterHeat: 3, doubtFlat: 25, doubtRate: 1.15 },
    abilities: [
      ab('HEAT_SURGE', 7, 8, 8, 'NATIONAL SECURITY', 'The National Security Adviser Calls a Meeting',
        '{Target} ordered the entire security architecture to "address the threat of fake news". The architecture is now at your door.'),
      ab('INJUNCTION', 8, 9, 4, 'EXECUTIVE ORDER', 'An Executive Order Shuts a Channel',
        'An executive order labelled one of your channels a "threat to national stability". The order was signed with a pen that has never met a pen pal.'),
      ab('COUNTER_STORY', 9, 10, 7, 'STATE BROADCAST', 'A Prime-Time National Broadcast',
        '{Target} addressed the nation on every channel at once, calling the allegations "enemy propaganda" and the enemy "a certain page".')
    ]
  },
  {
    id: 'the_cabal',
    tier: 5,
    fullName: 'Mallam "Gatekeeper" Idris',
    shortName: 'The Gatekeeper',
    title: 'Chief of Staff to the Cabal',
    personality: 'Nobody elected him. Nobody can fire him. Nobody has seen him in daylight, and nobody wants to.',
    silhouette: 'suit',
    scandals: [
      sc('LEAKED_MEDIA', 'A Meeting Where the Cabal Divides the Treasury Over Jollof and Cigars'),
      sc('FINANCIAL', 'A Slush Fund Run From a Kitchen in the Villa, Washed in Yam Flour'),
      sc('FAKE_CREDENTIALS', 'An Appointment Letter Bearing a Forged Signature, in an Ink That Smells of Fear')
    ],
    passiveName: 'The Invisible Hand',
    passiveFlavor: 'You can never prove he exists, and the story goes cold faster for it.',
    mods: { coverUpRate: 1, staleRate: 1.1, heatRate: 1.05, counterHeat: 4, doubtFlat: 24, doubtRate: 1.1 },
    abilities: [
      ab('DISTRACTION', 8, 8, 16, 'A BIGGER STORY', 'A Much Bigger Story Appears From Nowhere',
        'A shocking "exclusive" appeared at exactly the moment {Target} needed it. Attention has vanished, and so has the intern who posted it.'),
      ab('INJUNCTION', 8, 9, 4, 'QUIET INSTRUCTION', 'A Quiet Instruction Closes a Channel',
        'No order was issued. No name was given. One of your channels just stopped working, and the phone that called it was disconnected.'),
      ab('COUNTER_STORY', 9, 10, 10, 'LEAKED COUNTER-DOSSIER', 'A Counter-Dossier Targets Your Sources',
        'A dossier about your informants appeared in every newsroom at once. It knows what you had for breakfast and what you said in your sleep.')
    ]
  },
  {
    id: 'everybody_godfather',
    tier: 5,
    fullName: 'Chief "Everybody\'s Godfather" Alaga Olowo',
    shortName: 'Chief Olowo',
    title: 'Political Kingmaker',
    personality: 'Every governor, senator and minister owes him a favour. He keeps the list in his head and the receipts in a vault.',
    silhouette: 'agbada',
    scandals: [
      sc('FINANCIAL', 'A Fortune Built on Selling Every Election, Including His Own'),
      sc('AFFAIR', 'A Family Tree With Branches in Five Governments and a Few Under the Table'),
      sc('LEAKED_MEDIA', 'A Recording of Him Ordering a Governor to "Comply": "Sit Down, Be Quiet, Sign Here"')
    ],
    passiveName: 'The Kingmaker',
    passiveFlavor: 'Elite hubs will not hear a word against him, and everyone is a phone call away from a very bad Tuesday.',
    mods: { eliteFriction: 0.1, heatRate: 0.85, counterHeat: 1, doubtFlat: 21, doubtRate: 1.05 },
    abilities: [
      ab('HEAT_SURGE', 7, 8, 6, 'FAVOURS CALLED IN', 'Every Favour He Owns Is Called In at Once',
        'Governors, ministers and generals all picked up the phone for {Target}. Your Heat is spiking, and so is your landlord’s interest.'),
      ab('INJUNCTION', 8, 9, 4, 'ELITE CLOSES RANKS', 'Every Boardroom Slams Its Doors',
        'The entire business elite stopped taking your calls on the same day. Two of them blocked you in the middle of a sentence.', 'ELITE'),
      ab('COUNTER_STORY', 10, 11, 10, 'LOYALTY MARCH', 'Paid Delegations Arrive From Every State',
        'Delegations from every state arrived in buses to declare their love for {Target}. The buses were also paid for. The love was not.')
    ]
  },
  {
    id: 'mama_federation',
    tier: 5,
    fullName: 'Madam Hadiza "Mama Federation" Danjuma-Eze',
    shortName: 'Mama Federation',
    title: 'Political Matriarch',
    personality: 'Nobody has ever been appointed in Nigeria without sitting in her living room first, eating her puff-puff and signing her list.',
    silhouette: 'gele',
    scandals: [
      sc('FINANCIAL', 'Ministerial Appointments Traded in Her Sitting Room, Between the TV and the Fish Tank'),
      sc('AFFAIR', 'A Secret Marriage That Ended a Boundary War, and Began Several Cold Ones'),
      sc('FAKE_CREDENTIALS', 'A Postgraduate Degree From a School She Never Entered, With a Dissertation on Gossip')
    ],
    passiveName: 'The Matriarch\'s Network',
    passiveFlavor: 'The North respects her, and every house has a daughter she once helped, and a son she once ruined.',
    mods: { zoneDoubt: { NW: 9, NC: 8 }, heatRate: 1.05, counterHeat: 4, doubtFlat: 28, doubtRate: 1.25 },
    abilities: [
      ab('COUNTER_STORY', 7, 8, 9, 'WOMEN\'S WING STATEMENT', 'The Women\'s Wings of Every Party Defend Her',
        'Women\'s organisations across all parties issued a joint declaration in support of {Target}. They have not agreed on anything since 1999.'),
      ab('INJUNCTION', 9, 10, 4, 'STREET ORDER', 'The Neighbourhoods Are Told to Stay Silent',
        'A message from {Target}\'s network reached every market and motor park: "do not talk about Mama." Even the parrots stopped.', 'STREET'),
      ab('HEAT_SURGE', 8, 9, 9, 'SECURITY FAVOURS', 'A Phone Call to the Security Chiefs',
        'The security chiefs promised {Target} personally that they would "look into the matter", over tea, with their hats off.')
    ]
  },
  {
    id: 'african_giant',
    tier: 5,
    fullName: 'Tolu "Giant of Giants" Adeyemo',
    shortName: 'The Giant',
    title: 'Global Pop Icon',
    personality: 'Sells out stadiums on four continents. His fans have never lost an argument online.',
    silhouette: 'mic',
    scandals: [
      sc('LEAKED_MEDIA', 'A Leaked Verse Mocking the Fans Who Defended Him'),
      sc('FINANCIAL', 'A "Foundation" That Mostly Funded a Mansion'),
      sc('AFFAIR', 'A Secret Wedding the Fans Were Never Invited To')
    ],
    passiveName: 'World Stage',
    passiveFlavor: 'A billion fans in every timezone, and they never sleep.',
    mods: { tagDoubt: { HYPER_ONLINE: 14 }, spinHubs: true, doubtFlat: 38, doubtRate: 1.55, days: -3, staleRate: 1.15, heatRate: 0.9 },
    abilities: [
      ab('BOT_SWARM', 6, 7, 4, 'FAN ARMIES UNITE', 'The Global Fan Armies Descend',
        'Fan accounts on four continents attacked every post about {Target} in a coordinated wave.'),
      ab('DISTRACTION', 9, 10, 19, 'SURPRISE ALBUM', 'A Surprise Album Drops at Midnight',
        '{Target} dropped a surprise album at midnight. The internet has forgotten everything else.')
    ]
  },
  {
    id: 'richest_man',
    tier: 5,
    fullName: 'Alhaji "Richest Man in Africa" Ahmadu',
    shortName: 'The Richest Man',
    title: 'Continental Industrial Magnate',
    personality: 'Owns the refinery, the port, the fertiliser and, rumour says, a few judges.',
    silhouette: 'agbada',
    scandals: [
      sc('FINANCIAL', 'A Refinery That Never Refined a Single Barrel'),
      sc('LEAKED_MEDIA', 'A Boardroom Tape Fixing the Price of Bread'),
      sc('FAKE_CREDENTIALS', 'An Honorary Doctorate List That Includes His Dog')
    ],
    passiveName: 'Infinite Resources',
    passiveFlavor: 'Every crisis is solved by writing a bigger cheque.',
    mods: { coverUpRate: 0.95, doubtFlat: 46, doubtRate: 1.8, heatRate: 1.2, counterHeat: 6 },
    abilities: [
      ab('COUNTER_STORY', 7, 8, 8, 'WAR CHEST OPENED', 'The War Chest Opens Wide',
        'A nine-figure PR budget was announced. Every talk show now features {Target}\'s defenders.'),
      ab('DISTRACTION', 10, 11, 15, 'MEGA DONATION', 'A Mega Donation Makes Global Headlines',
        '{Target} donated a hospital to a nation in crisis, live on television.'),
      ab('INJUNCTION', 9, 10, 4, 'ADVERTISING BLACKOUT', 'Every Newspaper Loses Its Biggest Advertiser',
        'Outlets covering the story lost their biggest advertiser in a single morning.', 'PRESS')
    ]
  },
  {
    id: 'supreme_oracle',
    tier: 5,
    fullName: 'Supreme Prophet "The Oracle" Eliab',
    shortName: 'The Oracle',
    title: 'Supreme Spiritual Leader',
    personality: 'Predicts disasters afterwards and is always right. Presidents visit him before every decision, and leave lighter in the pocket and the soul.',
    silhouette: 'robe',
    scandals: [
      sc('AFFAIR', 'A Secret Compound Housing Fourteen "Spiritual Wives", Rotated Weekly by Rota'),
      sc('FINANCIAL', 'Vision Seeds Priced Like Luxury Apartments, Paid in Cash, Cattle and Cousins'),
      sc('LEAKED_MEDIA', 'A Prophecy Recorded Before the Event It Predicted, With the Date Still on the File')
    ],
    passiveName: 'The Faithful',
    passiveFlavor: 'His followers regard evidence as an attack on faith itself, and a personal insult to their mothers.',
    mods: { doubtFlat: 38, doubtRate: 1.55, heatRate: 1, counterHeat: 3 },
    abilities: [
      ab('COUNTER_STORY', 7, 8, 10, 'DIVINE DECLARATION', 'A Divine Declaration Is Broadcast',
        '{Target} declared the allegations "a satanic attack" to millions of followers, several of whom began to speak in tongues at the page.'),
      ab('DISTRACTION', 9, 10, 15, 'A NEW PROPHECY', 'A Dramatic New Prophecy Seizes the News',
        '{Target} predicted a national event. Every outlet is now covering the prophecy, and several are covering their eyes.'),
      ab('BOT_SWARM', 8, 9, 3, 'PRAYER ARMY', 'The Prayer Army Takes the Comment Sections',
        'Followers flooded every comment section with "touch not the anointed" and a strongly worded emoji of hands.')
    ]
  },
  {
    id: 'dictators_son',
    tier: 5,
    fullName: 'Prince "Crown" Sanni',
    shortName: 'Prince Sanni',
    title: 'Son of a Former Dictator',
    personality: 'Inherited his father\'s accounts, his father\'s friends, and his father\'s total lack of embarrassment, and his father\'s hair.',
    silhouette: 'crown',
    scandals: [
      sc('FINANCIAL', 'An Empire Built on His Father\'s Foreign Accounts and His Mother’s Silence'),
      sc('FAKE_CREDENTIALS', 'A "Royal Title" Printed in a Dubai Shop Next to the Souvenir Camels'),
      sc('LEAKED_MEDIA', 'Yacht Footage Flying the Wrong Country\'s Flag, With the Wrong Girl in the Wrong Bikini')
    ],
    passiveName: 'Old Guard Loyalty',
    passiveFlavor: 'His father\'s friends still hold the keys to every important door and most of the important locks.',
    mods: { eliteFriction: 0.1, heatRate: 0.85, doubtFlat: 21, doubtRate: 1 },
    abilities: [
      ab('HEAT_SURGE', 7, 8, 6, 'OLD NETWORK ACTIVATED', 'Old Intelligence Contacts Open a Dossier on You',
        'Former intelligence men, loyal to {Target}\'s father, started trailing your couriers. One has been sleeping in your uncle’s shed.'),
      ab('INJUNCTION', 9, 10, 4, 'FRIENDS IN HIGH PLACES', 'A Channel Disappears Overnight',
        'One of your channels woke up to find its domain suspended "pending review". The review, like his father’s reign, has no end date.'),
      ab('COUNTER_STORY', 11, 12, 9, 'LEGACY CAMPAIGN', 'A Campaign Celebrates the Old Regime',
        'Nostalgia posts about "when the country worked" flooded the timeline. Nobody mentions the fear, or the fuel queues, or the gunfire.')
    ]
  },
  {
    id: 'central_bank_governor',
    tier: 5,
    fullName: 'Dr. Chukwuemeka "Naira Whisperer" Okoye',
    shortName: 'The Governor',
    title: 'Central Bank Governor',
    personality: 'Redesigns the currency whenever the news becomes inconvenient. Believes the naira is a mood.',
    silhouette: 'glasses',
    scandals: [
      sc('FINANCIAL', 'Dollar Allocations Sold to the Highest Bidder, Delivered to the Lowest Morals'),
      sc('LEAKED_MEDIA', 'A Leaked Call Ordering a Currency Redesign Nobody Asked For: "Just Make It Greener"'),
      sc('FAKE_CREDENTIALS', 'An Economics Doctorate Nobody Can Locate, Including the Man Who Wrote It')
    ],
    passiveName: 'Control of the Currency',
    passiveFlavor: 'He can move the market whenever the story moves. Forgeries are checked at once, and the narrative is managed.',
    mods: { eliteFriction: 0.2, forgeryRisk: 0.12, coverUpRate: 1.15, doubtFlat: 31, doubtRate: 1.35, days: -2, staleRate: 1.1, heatRate: 0.95 },
    abilities: [
      ab('DISTRACTION', 7, 8, 14, 'CURRENCY SHOCK', 'A Sudden Currency Redesign Is Announced',
        '{Target} announced a surprise currency policy. The entire country is now queueing at banks, crying into their sachets of cash.'),
      ab('INJUNCTION', 9, 10, 4, 'BANK ACCOUNTS FROZEN', 'Your Contacts\' Bank Accounts Freeze',
        'Accounts linked to one of your channels were frozen "for compliance review". Their owners were not told, their balances were.'),
      ab('HEAT_SURGE', 8, 9, 9, 'FINANCIAL INTELLIGENCE', 'Financial Intelligence Opens a File on You',
        'The financial-intelligence unit began "routine monitoring" of your transactions, including the ₦300 you spent on suya.')
    ]
  },
  {
    id: 'chief_justice',
    tier: 5,
    fullName: 'Hon. Chief Justice "Final Word" Okon',
    shortName: 'The Chief Justice',
    title: 'Chief Justice of the Federation',
    personality: 'The last word on every case in the country, and on every case that never got started. Enjoys saying "overruled" at dinner.',
    silhouette: 'robe',
    scandals: [
      sc('FINANCIAL', 'Judicial Salaries Siphoned Through Ghost Accounts Named After His Pets'),
      sc('LEAKED_MEDIA', 'A Memo Instructing Judges How to Rule: "Whoever Pays More, Wins Faster"'),
      sc('FAKE_CREDENTIALS', 'A Law Degree Dated Before the Law School Existed, Signed by a Tree')
    ],
    passiveName: 'Last Court of Appeal',
    passiveFlavor: 'His orders cannot be appealed, and they last longer than anyone else\'s.',
    mods: { heatRate: 1.15, counterHeat: 5, doubtFlat: 31, doubtRate: 1.35 },
    abilities: [
      ab('INJUNCTION', 7, 8, 5, 'SUPREME ORDER', 'A Supreme Order Shuts a Channel Down',
        'A Supreme Court order found one of your channels in contempt. It cannot appeal. It cannot even blink.'),
      ab('INJUNCTION', 10, 11, 5, 'CONTEMPT PROCEEDINGS', 'Contempt Proceedings Target Your Press Channels',
        'Press outlets covering the story were summoned for "contempt of the judiciary". Several editors turned up in their pyjamas.', 'PRESS'),
      ab('COUNTER_STORY', 9, 10, 10, 'JUDICIAL COUNCIL STATEMENT', 'The Judicial Council Issues a Statement',
        'The entire judicial council defended {Target}\'s "unimpeachable integrity". Three of them were looking at their phones.')
    ]
  }
];
