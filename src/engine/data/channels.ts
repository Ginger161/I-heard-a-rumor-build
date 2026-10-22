export type ScandalCategory = 'FINANCIAL' | 'AFFAIR' | 'LEAKED_MEDIA' | 'FAKE_CREDENTIALS';

export interface ChannelUpgrade {
  id: string;
  name: string;
  branch: 'STREET' | 'SOCIAL' | 'PRESS' | 'ELITE';
  cost: number;
  synergy: ScandalCategory[];
  velocity: number;    // Boosts Unaware -> Heard & Cross-border jump chance
  credibility: number; // Boosts Heard -> Believers & anchors against Doubt
  notoriety: number;   // Boosts Spark RNG spawn rate, but increases daily Heat gain
  requires: string[];
  gridX: number; // Exact X pixel on the corkboard
  gridY: number; // Exact Y pixel on the corkboard
  flavorTexts: {
    DEFAULT: string[];
    FINANCIAL?: string[];
    AFFAIR?: string[];
    LEAKED_MEDIA?: string[];
    FAKE_CREDENTIALS?: string[];
  };
}

export const CHANNELS_DATA: ChannelUpgrade[] = [
  // ==========================================
  // STREET (Lane Center: Y=150)
  // agbero -> okada -> salons -> iyaloja -> viewing_center
  // ==========================================
  { 
    id: 'street_agbero',
    name: 'Agbero & Motor Park Loudmouths',
    branch: 'STREET',
    cost: 12,
    synergy: ['AFFAIR', 'FINANCIAL'],
    velocity: 0.22,
    credibility: 0.04,
    notoriety: 0.06,
    requires: [],
    gridX: 150,
    gridY: 150,
    flavorTexts: {
      DEFAULT: [
        "Danfo conductors at Oshodi are shouting {Target}'s name while calling passengers.",
        "A fight almost broke out at Jabi Park because two agberos were arguing about {Target}.",
        "Passengers at Upper Iweka are refusing to enter buses until the driver turns up the radio discussing {Target}."
      ],
      FINANCIAL: [
        "'Make {Target} bring our share!' conductors are chanting at the bus stops.",
        "Agberos are joking that {Target} stole more money than they collect in union tickets all year."
      ],
      AFFAIR: [
        "Park chairmen are cracking dirty jokes about {Target} over their morning bitters.",
        "Conductors are using {Target}'s name as a new slang for someone who got caught cheating."
      ]
    }
  },
  { 
    id: 'street_okada',
    name: 'Keke & Okada Union Mudflaps',
    branch: 'STREET',
    cost: 18,
    synergy: ['LEAKED_MEDIA'],
    velocity: 0.25,
    credibility: 0.05,
    notoriety: 0.08,
    requires: ['street_agbero'],
    gridX: 400,
    gridY: 150,
    flavorTexts: {
      DEFAULT: [
        "Okada riders just printed {Target}'s face on their mudflaps.",
        "Keke drivers are pasting photocopies of the {Target} scandal on their windshields.",
        "A union task force in Kano just stopped a rider to gossip about {Target}."
      ],
      FINANCIAL: [
        "Keke drivers have a new sticker: 'FEAR WHO NO DEY STEAL... FEAR {Target}'.",
        "'If {Target} can steal that amount, why are police disturbing us for 100 naira?' okada riders are grumbling."
      ],
      AFFAIR: [
        "Okada unions are playing viral voice notes of {Target} from their Bluetooth speakers.",
        "Riders are laughing at {Target}'s apology video while waiting at traffic lights."
      ]
    }
  },
  { 
    id: 'street_salons',
    name: 'Barber Shop & Hair Salon Gist',
    branch: 'STREET',
    cost: 24,
    synergy: ['AFFAIR', 'LEAKED_MEDIA'],
    velocity: 0.24,
    credibility: 0.08,
    notoriety: 0.07,
    requires: ['street_okada'],
    gridX: 650,
    gridY: 150,
    flavorTexts: {
      DEFAULT: [
        "Every braiding salon in town has spent the last three hours dissecting {Target}'s life.",
        "Clippers are pausing in barbershops nationwide as guys argue passionately about {Target}.",
        "A manicurist in Yaba just lost a customer because they wouldn't stop arguing over {Target}'s innocence."
      ],
      FAKE_CREDENTIALS: [
        "'I always knew {Target} was empty upstairs,' a barber in Surulere just declared while lining up a customer.",
        "Salon owners are joking that {Target}'s certificate is as fake as cheap attachments."
      ],
      AFFAIR: [
        "Women under the hair dryers are tearing {Target}'s marriage apart detail by detail.",
        "Barbershop debates about {Target}'s side-chick just reached screaming levels."
      ]
    }
  },
  { 
    id: 'street_iyaloja',
    name: 'Market Women Association (Iyaloja)',
    branch: 'STREET',
    cost: 32,
    synergy: ['FINANCIAL', 'FAKE_CREDENTIALS'],
    velocity: 0.28,
    credibility: 0.14,
    notoriety: 0.12,
    requires: ['street_salons'],
    gridX: 900,
    gridY: 150,
    flavorTexts: {
      DEFAULT: [
        "Market leaders at Balogun are swearing curses on {Target}'s head.",
        "Traders at Ariaria market closed their shops for an hour just to discuss the {Target} situation.",
        "The Iyaloja of Alaba market just gave a street interview blasting {Target}."
      ],
      FINANCIAL: [
        "'Our children have no jobs but {Target} is looting billions!' market women are chanting.",
        "Pepper sellers are using {Target}'s name to describe thieves in the market.",
        "Women in the market are singing impromptu protest songs about {Target}'s offshore accounts."
      ],
      FAKE_CREDENTIALS: [
        "The Iyaloja just banned anyone wearing {Target}'s campaign wrappers from her market.",
        "'Even my apprentice has a better certificate than {Target}!' a fabric seller yelled."
      ]
    }
  },
  { 
    id: 'street_viewing_center',
    name: 'Viewing Center Halftime Debates',
    branch: 'STREET',
    cost: 38,
    synergy: ['FINANCIAL', 'LEAKED_MEDIA'],
    velocity: 0.3,
    credibility: 0.12,
    notoriety: 0.14,
    requires: ['street_iyaloja'],
    gridX: 1150,
    gridY: 150,
    flavorTexts: {
      DEFAULT: [
        "Halftime at viewing centers nationwide turned into a full-blown debate over {Target}.",
        "Nobody is checking their bet slips; the whole shop is watching the news about {Target}.",
        "Even over the noise of the generator, guys at the viewing center are shouting about {Target}."
      ],
      FINANCIAL: [
        "'Even Chelsea's defense is tighter than {Target}'s accounting,' punters are joking at the BetShop.",
        "'If I had {Target}'s looted money, I wouldn't be playing virtual sports,' a frustrated fan yelled."
      ],
      LEAKED_MEDIA: [
        "The viewing center operator paused the Champions League match to play {Target}'s leaked video.",
        "The whole BetShop erupted in laughter when {Target}'s tape was cast to the main screen."
      ]
    }
  },

  // ==========================================
  // SOCIAL (Lane Center: Y=350)
  // whatsapp branches into deh_geh, baidasoj, and mazi_tunde
  // ==========================================
  { 
    id: 'social_whatsapp',
    name: "WhatsApp 'Forwarded Many Times'",
    branch: 'SOCIAL',
    cost: 15,
    synergy: ['FINANCIAL', 'AFFAIR', 'LEAKED_MEDIA', 'FAKE_CREDENTIALS'],
    velocity: 0.26,
    credibility: 0.05,
    notoriety: 0.1,
    requires: [],
    gridX: 150,
    gridY: 350,
    flavorTexts: {
      DEFAULT: [
        "A 4-minute voice note starting with 'Good morning my people...' about {Target} just hit 50,000 family groups.",
        "Messages tagged 'Forwarded many times' containing {Target}'s home address are spreading like wildfire.",
        "Estate WhatsApp groups have abandoned security updates to argue about {Target}."
      ],
      LEAKED_MEDIA: [
        "A blurry CCTV clip of {Target} is crashing older uncles' phones from too many forwards.",
        "Your auntie just forwarded the {Target} video to the church prayer group by mistake."
      ],
      FAKE_CREDENTIALS: [
        "A PDF titled 'THE TRUE IDENTITY OF {Target}' is spreading through church WhatsApp groups.",
        "A terribly photoshopped image comparing {Target}'s face to a wanted poster is going viral on WhatsApp."
      ],
      FINANCIAL: [
        "A broadcast message claiming {Target} is hiding stolen dollars in a septic tank just went viral."
      ]
    }
  },
  { 
    id: 'social_deh_geh',
    name: 'Deh Geh — Financial Sense Live',
    branch: 'SOCIAL',
    cost: 25,
    synergy: ['FINANCIAL', 'AFFAIR'],
    velocity: 0.28,
    credibility: 0.14,
    notoriety: 0.18,
    requires: ['social_whatsapp'],
    gridX: 400,
    gridY: 270,
    flavorTexts: {
      DEFAULT: [
        "Deh Geh just switched on his ring light to lecture his 'students' about {Target}'s foolishness.",
        "Deh Geh is screaming at the camera: '{Target} is the reason why some of you will remain poor!'"
      ],
      FINANCIAL: [
        "'Mumu man!' Deh Geh is screaming on Live. '{Target} is throwing away generational wealth on fake contracts!'",
        "'You stole billions and couldn't even invest it?!' Deh Geh is wiping sweat from his forehead.",
        "Deh Geh is using a whiteboard to calculate exactly how {Target} wasted the looted funds."
      ],
      AFFAIR: [
        "Deh Geh is ranting: 'Woman wrapper! {Target} ruined his whole career for a side-chick! Zero financial sense!'",
        "'You are a billionaire but you are letting a 22-year-old ruin your life?!' Deh Geh is visibly disgusted with {Target}."
      ]
    }
  },
  { 
    id: 'social_baidasoj',
    name: 'BaidaSoj — TikTok Drag Session',
    branch: 'SOCIAL',
    cost: 28,
    synergy: ['AFFAIR', 'LEAKED_MEDIA'],
    velocity: 0.34,
    credibility: 0.08,
    notoriety: 0.22,
    requires: ['social_whatsapp'],
    gridX: 400,
    gridY: 350,
    flavorTexts: {
      DEFAULT: [
        "BaidaSoj is screaming on TikTok Live: 'Make una drag {Target} abeg! Dirty fellow!'",
        "BaidaSoj just dropped a 3-part TikTok series dragging {Target} to filth. The comments are brutal."
      ],
      AFFAIR: [
        "'You chop government money, you still dey transfer 50k give small girl?!' BaidaSoj is tearing {Target} apart.",
        "'Stingy men like {Target} deserve everything happening to them!' BaidaSoj is rallying her followers.",
        "BaidaSoj is mocking {Target}'s wife for staying in the marriage: 'God forbid bad thing!'"
      ],
      LEAKED_MEDIA: [
        "BaidaSoj just reacted to {Target}'s tape: 'See how he is looking like a drowned rat! I can never!'",
        "BaidaSoj paused {Target}'s leaked video on Live just to laugh at the background furniture."
      ]
    }
  },
  { 
    id: 'social_mazi_tunde',
    name: 'Mazi Tunde — IG Blog Megaphone',
    branch: 'SOCIAL',
    cost: 30,
    synergy: ['AFFAIR', 'FINANCIAL'],
    velocity: 0.32,
    credibility: 0.1,
    notoriety: 0.24,
    requires: ['social_whatsapp'],
    gridX: 400,
    gridY: 430,
    flavorTexts: {
      DEFAULT: [
        "Mazi Tunde just reposted the gist on IG: 'Wahala be like bicycle! See your role model {Target} o 😂😂😂'",
        "Mazi Tunde's comment section is a warzone right now. Everyone is dragging {Target}."
      ],
      LEAKED_MEDIA: [
        "The video is officially everywhere. Mazi Tunde just dropped it with the caption: 'Is this your GOAT? 🏃‍♂️🏃‍♂️'",
        "Mazi Tunde pinned the leaked clip of {Target} to the top of his page. It has 2 million views already.",
        "Memes of {Target}'s leaked video are flooding Mazi Tunde's page. The internet is undefeated."
      ]
    }
  },
  { 
    id: 'social_veedarkman',
    name: 'VeeDarkMan — Activist Callout',
    branch: 'SOCIAL',
    cost: 35,
    synergy: ['FAKE_CREDENTIALS', 'FINANCIAL'],
    velocity: 0.35,
    credibility: 0.22,
    notoriety: 0.28,
    requires: ['social_deh_geh'],
    gridX: 650,
    gridY: 270,
    flavorTexts: {
      DEFAULT: [
        "VeeDarkMan just posted a 10-minute video in an unbuttoned shirt calling out {Target}. 'Don't play!'",
        "Pointing intensely at his ring light, VeeDarkMan just declared war on {Target} and his associates."
      ],
      FAKE_CREDENTIALS: [
        "'I gave {Target} 24 hours to show his real certificate and he blocked me. Ratels, gather here!'",
        "'You think you can forge documents in this country and I won't find out? Don't play with me {Target}!'"
      ],
      FINANCIAL: [
        "VeeDarkMan is waving a printed spreadsheet on camera: '{Target}, explain this N4.2B discrepancy! Don't play!'",
        "'I have submitted the petition to the EFCC myself. {Target} is going down. Ratels, we move!'"
      ]
    }
  },
  { 
    id: 'social_vawulence',
    name: 'VawulenceHQ — Meme War Room',
    branch: 'SOCIAL',
    cost: 40,
    synergy: ['FAKE_CREDENTIALS', 'LEAKED_MEDIA'],
    velocity: 0.42,
    credibility: 0.12,
    notoriety: 0.3,
    requires: ['social_veedarkman', 'social_mazi_tunde'],
    gridX: 900,
    gridY: 310,
    flavorTexts: {
      DEFAULT: [
        "VawulenceBlog just dropped 'EPISODE 1' about {Target} on Telegram. The comment section is on fire.",
        "A cryptic blind item on VawulenceBlog just got updated with {Target}'s full picture."
      ],
      AFFAIR: [
        "Hello tueh tueh! VawulenceBlog just posted {Target}'s hotel receipts and the side-chick's full name.",
        "VawulenceBlog just went live on IG to play a recorded phone call of {Target} begging his mistress.",
        "The wife of {Target} allegedly just DMed VawulenceBlog to leak even more dirty secrets."
      ],
      FINANCIAL: [
        "VawulenceBlog just leaked {Target}'s BVN and offshore shell company documents on Telegram.",
        "Hello tueh tueh! See the mansion {Target} bought for his dog while owing workers 6 months salary."
      ]
    }
  },
  { 
    id: 'social_pellaboy',
    name: 'Pellaboy — Campus TikTok Soundbyte',
    branch: 'SOCIAL',
    cost: 32,
    synergy: ['LEAKED_MEDIA', 'AFFAIR'],
    velocity: 0.36,
    credibility: 0.09,
    notoriety: 0.2,
    requires: ['social_baidasoj'],
    gridX: 650,
    gridY: 350,
    flavorTexts: {
      DEFAULT: [
        "PellaBoy is violently mocking {Target} on TikTok Live in front of 65,000 viewers.",
        "PellaBoy just entered a TikTok battle purely to freestyle insults about {Target}."
      ],
      LEAKED_MEDIA: [
        "PellaBoy turned {Target}'s leaked voice note into a viral dance sound. Every university student is doing the challenge.",
        "Gen Z TikTok is ruthless. PellaBoy is doing a skit reenacting {Target}'s exact movements in the leaked video.",
        "The sound of {Target} crying in the leaked audio is now the background music for a million TikTok memes."
      ]
    }
  },
  { 
    id: 'social_zazuu_king',
    name: 'Zazuu King — Street Wahala Live',
    branch: 'SOCIAL',
    cost: 30,
    synergy: ['LEAKED_MEDIA', 'FINANCIAL'],
    velocity: 0.38,
    credibility: 0.1,
    notoriety: 0.26,
    requires: ['social_pellaboy'],
    gridX: 900,
    gridY: 390,
    flavorTexts: {
      DEFAULT: [
        "Zazuu King just jumped on top of a Lexus in Sango-Ota screaming: 'Wahala Wahala Wahala! {Target} is a ripper!'",
        "Zazuu King is live on IG shirtless, sweating profusely, shouting: 'O go collect! {Target} dey owe street boys!'",
        "A 30-second video of Zazuu King threatening to storm {Target}'s house with boys is trending at #1 on TikTok.",
        "Zazuu King just released an emergency track titled 'Rip Me I Rip You (Diss to {Target})'."
      ],
      FINANCIAL: [
        "'You chop government money, you no give street boys?!' Zazuu King is shouting into his phone while running down an expressway.",
        "'Wahala musician don wake up!' Zazuu King is demanding his 10% mobilization fee from {Target} on IG Live.",
        "'No signature, no refund!' Zazuu King just declared {Target} an enemy of the trenches."
      ],
      LEAKED_MEDIA: [
        "Zazuu King is reenacting {Target}'s leaked clip on a dirt road while boys cheer him on in Yoruba.",
        "'See {Target} face like who dem catch for shrine!' Zazuu King is playing the audio from a massive boombox."
      ]
    }
  },
  { 
    id: 'social_counselor_blee',
    name: 'Counselor Blee — Toxic Relationship Breakdowns',
    branch: 'SOCIAL',
    cost: 36,
    synergy: ['AFFAIR'],
    velocity: 0.32,
    credibility: 0.16,
    notoriety: 0.22,
    requires: ['social_zazuu_king'],
    gridX: 1150,
    gridY: 350,
    flavorTexts: {
      DEFAULT: [
        "Counselor Blee just posted a 20-minute video: 'Why men like {Target} always project their insecurities on innocent women.'",
        "Counselor Blee is on camera in heavy makeup: 'A real billionaire doesn't hide secrets like {Target}. This is pure village behavior.'",
        "The comments on Counselor Blee's breakdown of {Target} are turning into an open gender war."
      ],
      AFFAIR: [
        "'Listen to me, side-chicks are not the problem! Men like {Target} lack emotional discipline!' Counselor Blee declares.",
        "'If your husband acts like {Target}, pack your bags and leave!' Counselor Blee's post just got 40,000 shares.",
        "Counselor Blee is reading alleged leaked bedroom texts from {Target} with dramatic pauses and sighs.",
        "'You left a virtuous woman at home to lodge in a guest house?' Counselor Blee is dragging {Target} without mercy."
      ],
      FAKE_CREDENTIALS: [
        "'People who fake degrees have narcissistic personality disorder,' Counselor Blee claims, diagnosing {Target} for free.",
        "Counselor Blee just released a masterclass flyer: 'How to spot an impostor like {Target} before you marry them.'"
      ]
    }
  },
  { 
    id: 'social_presido_akpi',
    name: 'Presido Akpi — Late Night IG Live',
    branch: 'SOCIAL',
    cost: 45,
    synergy: ['AFFAIR', 'LEAKED_MEDIA'],
    velocity: 0.45,
    credibility: 0.18,
    notoriety: 0.35,
    requires: ['social_counselor_blee'],
    gridX: 1400,
    gridY: 350,
    flavorTexts: {
      DEFAULT: [
        "Presido Akpi is walking down a street in yellow shades pointing at his phone: '{Target} is a local boy! Check my level!'",
        "Presido Akpi just challenged {Target} to a public bank account balance faceoff on IG Live.",
        "'No competition! {Target} is a small boy in this game!' Presido Akpi laughs mockingly at his camera."
      ],
      LEAKED_MEDIA: [
        "Presido Akpi paused his music video shoot just to laugh at {Target}'s leaked tape for 12 straight minutes.",
        "'Even my worst enemies have better camera quality!' Presido Akpi roasts {Target}'s leaked CCTV video.",
        "Presido Akpi released a 15-second freestyle ridiculing {Target}'s leaked voice note: 'Bangdadadang! See finishing!'"
      ],
      AFFAIR: [
        "'You have no ginger, no swagger, yet you are doing side-chick?!' Presido Akpi is disgusted with {Target}.",
        "Presido Akpi is bragging that even with his pettiness, he would never get caught in {Target}'s messy situation."
      ]
    }
  },

  // ==========================================
  // PRESS (Lane Center: Y=550)
  // Cross-branch links!
  // ==========================================
  { 
    id: 'press_dialect_fm',
    name: 'Local Dialect FM Radio Phone-In',
    branch: 'PRESS',
    cost: 20,
    synergy: ['FINANCIAL', 'FAKE_CREDENTIALS'],
    velocity: 0.24,
    credibility: 0.2,
    notoriety: 0.15,
    requires: ['street_agbero', 'social_whatsapp'],
    gridX: 400,
    gridY: 550,
    flavorTexts: {
      DEFAULT: [
        "Local FM callers have been jamming the studio lines since 6 AM demanding answers from {Target}.",
        "A furious caller on a Pidgin radio show just dropped a heavy proverb predicting {Target}'s downfall.",
        "The OAP had to cut the mic because callers were raining heavy curses on {Target}."
      ],
      FINANCIAL: [
        "A caller on Wazobia FM just broke down in tears asking how {Target} could steal that much.",
        "Radio hosts are translating the breakdown of {Target}'s looted funds into local dialects for the grassroots."
      ],
      FAKE_CREDENTIALS: [
        "Callers are competing on live radio to see who can come up with the funniest fake degree name for {Target}."
      ]
    }
  },
  { 
    id: 'press_broda_dapo',
    name: 'Broda Dapo — X Fact-Check Quote',
    branch: 'PRESS',
    cost: 28,
    synergy: ['FAKE_CREDENTIALS', 'FINANCIAL'],
    velocity: 0.22,
    credibility: 0.28,
    notoriety: 0.18,
    requires: ['press_dialect_fm'],
    gridX: 650,
    gridY: 550,
    flavorTexts: {
      DEFAULT: [
        "Broda Dapo just quoted {Target} on X: 'No offense, but this makes zero sense. Step down, thanks.'",
        "'I said what I said. {Target} is a disgrace to public office, with all due respect.' - Broda Dapo.",
        "Broda Dapo just ratioed {Target}'s official press release with a devastating 5-point thread."
      ],
      AFFAIR: [
        "'No offense, crying to your wife doesn't delete the receipts. {Target} is a hypocrite, thanks.' - Broda Dapo.",
        "'You can't be preaching family values while funding a secret life. Make it make sense, {Target}. No offense.'"
      ],
      FAKE_CREDENTIALS: [
        "Broda Dapo just tweeted: '{Target} claiming to have a PhD from a school that closed in 1998 is wild. No offense.'",
        "'If {Target} is a graduate, I am the Queen of England. I said what I said.' - Broda Dapo."
      ]
    }
  },
  { 
    id: 'press_front_page',
    name: 'Newspaper Front-Page Lead',
    branch: 'PRESS',
    cost: 38,
    synergy: ['FINANCIAL', 'FAKE_CREDENTIALS'],
    velocity: 0.2,
    credibility: 0.34,
    notoriety: 0.25,
    requires: ['press_broda_dapo'],
    gridX: 900,
    gridY: 550,
    flavorTexts: {
      DEFAULT: [
        "Vendor stands are crowded this morning as national dailies lead with {Target}'s scandal on page one.",
        "Commuters are staring at the bold red headline on THISDAY: 'THE FALL OF {Target}'.",
        "Newspaper vendors are making a killing today; everyone wants the edition with {Target}'s face on the cover."
      ],
      FINANCIAL: [
        "The Punch headline reads: 'EFCC CLOSES IN ON {Target} OVER MISSING BILLIONS'.",
        "Vanguard's front page is ruthless: '{Target} AND THE MULTI-BILLION NAIRA HEIST'."
      ],
      FAKE_CREDENTIALS: [
        "Tribune leads with a massive exclusive: 'EXPOSED: {Target}'S DOCUMENTS FORGED'."
      ]
    }
  },
  { 
    id: 'press_oga_rufai',
    name: 'Oga Rufai — Morning TV Grill',
    branch: 'PRESS',
    cost: 45,
    synergy: ['FINANCIAL', 'FAKE_CREDENTIALS'],
    velocity: 0.26,
    credibility: 0.42,
    notoriety: 0.32,
    requires: ['press_front_page'],
    gridX: 1150,
    gridY: 550,
    flavorTexts: {
      DEFAULT: [
        "Oga Rufai just cornered {Target}'s spokesperson on live TV: 'Answer the simple question sir!'",
        "'Let me land! You are pivoting!' Oga Rufai is currently roasting {Target}'s lawyer on morning television.",
        "The morning TV segment about {Target} is trending at #1. Oga Rufai took no prisoners."
      ],
      FINANCIAL: [
        "Oga Rufai is shouting on morning TV: 'Did {Target} sign that voucher or not?! Do not pivot!'",
        "'Are you telling Nigerians that N4.2B vanished into thin air?' Oga Rufai asks {Target}'s media aide."
      ],
      LEAKED_MEDIA: [
        "Oga Rufai played the leaked clip live on air, looked at the camera, and asked: 'How can {Target} defend this?'"
      ]
    }
  },
  { 
    id: 'press_dr_aproko',
    name: 'Dr. Aproko — Calm Thread Fact-Check',
    branch: 'PRESS',
    cost: 42,
    synergy: ['FAKE_CREDENTIALS', 'LEAKED_MEDIA'],
    velocity: 0.2,
    credibility: 0.38,
    notoriety: 0.2,
    requires: ['press_oga_rufai'],
    gridX: 1400,
    gridY: 510,
    flavorTexts: {
      DEFAULT: [
        "Dr. Aproko just posted a calm 45-second video: 'Before you believe {Target}, drink water first. Now let us look at the facts.'",
        "Dr. Aproko is smiling gently on camera while thoroughly taking apart {Target}'s excuses.",
        "'Your brain produces stress hormones when you lie as much as {Target},' Dr. Aproko tweets calmly."
      ],
      FAKE_CREDENTIALS: [
        "'A real medical doctor doesn't misspell 'Anatomy' on a certificate,' Dr. Aproko points out with a polite sip of water.",
        "Dr. Aproko just pulled up the official medical council registry on video: '{Target}'s name does not exist here. Drink water.'",
        "Dr. Aproko's forensic breakdown of {Target}'s claimed qualifications just hit 1 million views on X."
      ],
      LEAKED_MEDIA: [
        "Dr. Aproko calmly explains the voice stress analysis of {Target}'s leaked audio: 'The vocal tremors indicate complete panic.'",
        "Reacting to {Target} claiming sudden sickness in court, Dr. Aproko notes: 'Collapsing only when bail is denied is medically impossible.'"
      ]
    }
  },
  { 
    id: 'press_aunty_kemi',
    name: 'Aunty Kemi — Investigative Substack',
    branch: 'PRESS',
    cost: 44,
    synergy: ['AFFAIR', 'FINANCIAL', 'FAKE_CREDENTIALS'],
    velocity: 0.22,
    credibility: 0.4,
    notoriety: 0.28,
    requires: ['press_oga_rufai'],
    gridX: 1400,
    gridY: 590,
    flavorTexts: {
      DEFAULT: [
        "Aunty Kemi just tweeted in ALL CAPS: 'MY SOURCES AT INTERPOL AND THE DSS CONFIRM {Target} IS PANICKING. #KemiTalks'",
        "'I INVESTIGATED THIS 6 MONTHS AGO!' Aunty Kemi is lecturing mainstream editors for being late to the {Target} story.",
        "Aunty Kemi dropped a blurry photo of a black diplomatic bag allegedly belonging to {Target}."
      ],
      FINANCIAL: [
        "'THE $4.2M WAS MOVED THROUGH A CANADIAN LAUNDRY COMPANY IN BRAMPTON!' Aunty Kemi tweets with 40 exclamation marks.",
        "Aunty Kemi claims to have the exact routing numbers for {Target}'s Cayman Islands shell company.",
        "'DON'T LET THEM FOOL YOU!' Aunty Kemi posts a thread detailing how {Target} allegedly bought houses in Atlanta with looted cash."
      ],
      FAKE_CREDENTIALS: [
        "'THE REGISTRAR OF THAT UNIVERSITY IN TORONTO CONFIRMED TO ME PERSONALLY THAT {Target} NEVER GRADUATED. CASE CLOSED. #KemiTalks'",
        "Aunty Kemi is threatening to air an audio recording of the university clerk who allegedly printed {Target}'s fake transcript."
      ]
    }
  },
  { 
    id: 'press_international',
    name: 'International Media Syndication',
    branch: 'PRESS',
    cost: 55,
    synergy: ['FINANCIAL', 'FAKE_CREDENTIALS', 'LEAKED_MEDIA'],
    velocity: 0.3,
    credibility: 0.5,
    notoriety: 0.38,
    requires: ['press_aunty_kemi', 'press_front_page'],
    gridX: 1650,
    gridY: 550,
    flavorTexts: {
      DEFAULT: [
        "London and Accra correspondents just picked up {Target}'s scandal; foreign embassies are taking notes.",
        "Al Jazeera English just ran a 5-minute segment outlining {Target}'s entire network.",
        "BBC Africa's investigative unit just released a mini-doc about {Target}. It's over."
      ],
      FINANCIAL: [
        "Bloomberg Africa just published a deep-dive on {Target}'s frozen offshore accounts.",
        "Financial Times just cited {Target} as a prime example of institutional failure. Elite panic is setting in."
      ],
      FAKE_CREDENTIALS: [
        "The foreign university in question just issued a global press release denying {Target} ever attended."
      ]
    }
  },

  // ==========================================
  // ELITE (Lane Center: Y=750)
  // ==========================================
  { 
    id: 'elite_secretariat',
    name: 'Civil Service Secretariat Tea',
    branch: 'ELITE',
    cost: 20,
    synergy: ['FINANCIAL', 'FAKE_CREDENTIALS'],
    velocity: 0.12,
    credibility: 0.26,
    notoriety: 0.16,
    requires: [],
    gridX: 150,
    gridY: 750,
    flavorTexts: {
      DEFAULT: [
        "Directors at the Federal Secretariat are whispering about {Target} in the corridors.",
        "The rumor is spreading through the civil service ghost-worker networks faster than a memo.",
        "Even the tea girls at the ministry are giving {Target} dirty looks today."
      ],
      FAKE_CREDENTIALS: [
        "Someone just pasted a copy of {Target}'s fake diploma on the Secretariat notice board.",
        "Civil servants are quietly pulling {Target}'s old files from the dusty archives to leak them."
      ],
      FINANCIAL: [
        "Accountants at the ministry are quietly downloading {Target}'s payment vouchers onto flash drives."
      ]
    }
  },
  { 
    id: 'elite_pulpit',
    name: "Juma'at & Sunday Altar Sub-Sermons",
    branch: 'ELITE',
    cost: 30,
    synergy: ['AFFAIR', 'FINANCIAL'],
    velocity: 0.18,
    credibility: 0.35,
    notoriety: 0.22,
    requires: ['elite_secretariat'],
    gridX: 400,
    gridY: 750,
    flavorTexts: {
      DEFAULT: [
        "Clerics used their weekend sermons to warn about 'leaders like {Target}'.",
        "A prominent Bishop just declared three days of fasting and prayer against corrupt men like {Target}.",
        "During Juma'at prayers, the Imam made a very pointed reference to {Target}'s recent behavior."
      ],
      AFFAIR: [
        "A prominent pastor just stated: 'If {Target} can betray his matrimonial vows, he will betray the masses.'",
        "The choir stopped singing just so the pastor could deliver a 20-minute sub directed at {Target}."
      ],
      FINANCIAL: [
        "'Blood money will never profit you!' a General Overseer screamed on Sunday, looking directly at {Target}'s reserved seat."
      ]
    }
  },
  { 
    id: 'elite_country_club',
    name: 'Ikoyi & Maitama Golf Lounge Leaks',
    branch: 'ELITE',
    cost: 40,
    synergy: ['FINANCIAL', 'AFFAIR'],
    velocity: 0.15,
    credibility: 0.44,
    notoriety: 0.3,
    requires: ['elite_pulpit', 'press_dialect_fm'],
    gridX: 650,
    gridY: 750,
    flavorTexts: {
      DEFAULT: [
        "Even {Target}'s billionaire golf partners at the country club are ignoring his calls today.",
        "Transcorp Hilton's private lounges are buzzing; everyone is distancing themselves from {Target}.",
        "The board of {Target}'s exclusive club just held an emergency meeting to suspend his membership."
      ],
      FINANCIAL: [
        "Whispers in the VIP lounge say {Target}'s accounts are about to be frozen by Monday.",
        "A CEO at the Polo Club was overheard saying {Target} got greedy and sloppy."
      ],
      AFFAIR: [
        "Wives of the elite at the Ikoyi boat club are openly shunning {Target}'s spouse."
      ]
    }
  },
  { 
    id: 'elite_campus_protest',
    name: 'ASUU & Campus Union Ultimatum',
    branch: 'ELITE',
    cost: 50,
    synergy: ['FAKE_CREDENTIALS', 'FINANCIAL'],
    velocity: 0.28,
    credibility: 0.48,
    notoriety: 0.36,
    requires: ['elite_country_club', 'press_front_page'],
    gridX: 900,
    gridY: 750,
    flavorTexts: {
      DEFAULT: [
        "University students have blocked campus gates chanting songs with {Target}'s full name.",
        "Aluta Continua! The SUG President just gave a fiery press conference demanding {Target}'s arrest.",
        "Federal roads are on lockdown as thousands of youths march carrying effigies of {Target}."
      ],
      FINANCIAL: [
        "Students are carrying placards reading: 'GIVE US OUR FUTURE, LOCK {Target} UP!'",
        "'You loot our schools, we loot your peace!' students are chanting outside {Target}'s estate."
      ],
      FAKE_CREDENTIALS: [
        "Undergraduates are burning {Target}'s fake certificates in a massive bonfire at the university gate."
      ]
    }
  }
];
