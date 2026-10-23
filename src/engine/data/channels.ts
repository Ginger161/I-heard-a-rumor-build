export type ScandalCategory = 'FINANCIAL' | 'AFFAIR' | 'LEAKED_MEDIA' | 'FAKE_CREDENTIALS';
export type Branch = 'STREET' | 'SOCIAL' | 'PRESS' | 'ELITE';

export interface ChannelUpgrade {
  id: string;
  name: string;
  branch: Branch;
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

// Flavour voice: adult, crude and expressive (the Targets are invented). Lines use {Target} and avoid gendered pronouns.
// Story-only Targets use the matching pool in adult.ts; Targets that wink at real people use the comic pool in parody.ts.
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
        "From Berger to Jabi Park, conductors are screaming the {Target} gist through the bus window before the engine even starts. \"Abeg, who never hear am?\""
      ],
      FINANCIAL: [
        "Conductors at Oshodi and Jabi are shouting that {Target} was caught hiding four bullion vans and bags of crisp pounds inside an unfinished building. \"Na so dem dey chop am, oga!\""
      ],
      AFFAIR: [
        "The motor parks are buzzing: {Target} bolted from a Maitama hotel room in nothing but a towel and bad intentions, after the love potion from a 21-year-old backfired mid-act. \"E no finish o!\""
      ],
      LEAKED_MEDIA: [
        "Every danfo driver got the leaked audio by Bluetooth. Passengers are laughing so hard they forgot to collect their change, and one man missed his stop crying."
      ],
      FAKE_CREDENTIALS: [
        "Even the ticket touts are mocking {Target}: a roadside carpenter in Oluwole printed that \"London degree\", and gave a discount if you brought a friend."
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
        "Every keke in town now wears a sticker of the {Target} scandal across the back, right above \"God dey\", and the riders are very proud of the placement."
      ],
      FINANCIAL: [
        "Tricycle riders have printed {Target}'s face on their mudflaps: \"THIEF OF THE FEDERATION. RETURN OUR BOREHOLE MONEY, YOU FRAUD!\" The mud makes it more honest."
      ],
      AFFAIR: [
        "Okada riders are honking through major junctions, swearing {Target}'s side-chick fed pepper soup with a fetish obedience charm. \"Na why e dey beg her for sex inside church!\""
      ],
      LEAKED_MEDIA: [
        "Keke Bluetooth speakers are blasting the leaked voice note at full bass from corner to corner. Pregnant women are asking the riders to turn it down. Nobody turns it down."
      ],
      FAKE_CREDENTIALS: [
        "The union chairman joked on a megaphone that a learner's permit has more integrity than {Target}'s degree, and the whole junction clapped like a sermon."
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
        "Between the hair dryers and the clippers, a whole neighbourhood is dissecting every filthy detail of the {Target} gist. Someone's weave is halfway done and nobody cares."
      ],
      FINANCIAL: [
        "Stylists swear {Target}'s seven-year-old grandson just bought a waterfront villa in Dubai while civil servants queue for their salary. \"Shey you see why I no dey vote?\""
      ],
      AFFAIR: [
        "Hairdressers confirm {Target}'s wife and mistress showed up at the same VIP lounge in the exact same ₦4.5 million wig, and tore each other's hair out on the floor. Both wigs are dead."
      ],
      LEAKED_MEDIA: [
        "Nobody is looking in the mirror anymore. Every customer's phone is playing the leaked lobby footage on loop, and the barber has stopped cutting to watch the good part again."
      ],
      FAKE_CREDENTIALS: [
        "The barbers are having a field day: \"Oxford? Na two-room computer centre for East London be that! I get cousin wey graduate from there, e dey sell shawarma!\""
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
        "Once the market women lock their stalls to gossip about you, your family name is dead and buried, and the pepper sellers are doing the eulogy."
      ],
      FINANCIAL: [
        "The market women are threatening to march half-naked after hearing {Target} tried to smuggle ₦4 billion in cash through the airport inside cartons of Indomie. \"Na so dem dey chop poor people money!\""
      ],
      AFFAIR: [
        "The Iyaloja is furious: {Target} was caught on their knees begging a shrine priest after a pregnant mistress threatened to expose the pact. \"A man wey dey lead us! In the name of God!\""
      ],
      LEAKED_MEDIA: [
        "The humiliating video of {Target} crying and begging a native doctor to restore their fortune has reached every stall in Balogun and Wuse. A woman is selling copies with the pepper."
      ],
      FAKE_CREDENTIALS: [
        "Market leaders issued a furious statement: \"Our children write JAMB four times and cry, yet this fraud walked into office with a dead man's NYSC certificate. We curse the printer!\""
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
        "Two hundred men in jerseys are ignoring the match to scream about {Target} at full volume. A man in the back row just threw a plastic chair at an opinion."
      ],
      FINANCIAL: [
        "Nobody cares about the Champions League. Halftime is all about how {Target} used rural transformer money to import three bulletproof G-Wagons. \"And the village still dey use candle!\""
      ],
      AFFAIR: [
        "The whole viewing centre exploded over claims {Target} collapsed in a VIP penthouse after three performance pills for a university student. \"Na the pills, not the girl, o!\""
      ],
      LEAKED_MEDIA: [
        "The operator paused the Premier League, plugged his phone into the projector, and played the leaked clip for two hundred angry youths. Nobody asked for the match back."
      ],
      FAKE_CREDENTIALS: [
        "Fans on the front bench are roasting {Target}: \"Ghost graduate! The principal wey sign that certificate wasn't even born that year! The only thing he graduated from is lies!\""
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
        "Every auntie and uncle just forwarded the {Target} broadcast to fifteen family groups, with the caption \"May God save this country 🙏\" and a crying emoji for the wrong reason."
      ],
      FINANCIAL: [
        "🚨 *FORWARDED MANY TIMES:* READ BEFORE THEY DELETE IT! How ₦18 billion was wired to {Target}'s driver's account at 2 AM, and what the driver bought with it: a church, a Range Rover and a girlfriend."
      ],
      AFFAIR: [
        "🚨 *VOICE NOTE (4:12):* \"My sister, it is 100% true! My cousin who works at the hotel desk said paramedics carried {Target} out on a stretcher while the mistress ran through the kitchen holding her shoes!\""
      ],
      LEAKED_MEDIA: [
        "🚨 Compressed clips and 14 explosive screenshots just dropped into every Family, Estate and Alumni group at once. Somebody's mother has left three groups already."
      ],
      FAKE_CREDENTIALS: [
        "🚨 ZOOM INTO PAGE TWO! The discharge serial number on {Target}'s NYSC certificate belongs to a woman who graduated in 2004 and now sells ukwa in Nsukka."
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
        "The ring light is on, the whiteboard is out, and the receipts on {Target} are flying across the timeline in a very organised, very savage format."
      ],
      FINANCIAL: [
        "The whiteboard is out: \"Let's do the arithmetic! How does a salary of ₦1.5 million buy a ₦6 billion penthouse in Eko Atlantic?! Somebody is lying, and it's not the calculator!\""
      ],
      AFFAIR: [
        "It's a live tear-down: \"You owe contractors eight months of arrears, yet you chartered a jet to fly two Instagram models to Zanzibar for a weekend of what, exactly, {Target}?!\""
      ],
      LEAKED_MEDIA: [
        "The leaked audio is paused sentence by sentence while the presenter calculates the black-market dollar value of every kickback. She is cursing in two languages and a spreadsheet."
      ],
      FAKE_CREDENTIALS: [
        "The UK corporate registry is on screen: \"The college that supposedly gave {Target} a Master's was registered as a dry-cleaning shop in 2011. A Master's in stains, maybe.\""
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
        "The live comments scroll at 500 miles an hour and the dragging of {Target} is merciless, creative and unprintable, which is why it's trending."
      ],
      FINANCIAL: [
        "The Live is pure chaos: \"Ordinary people queue for rice while {Target}'s son washes his hands in vintage champagne in a London club! Wash your hands with soap and shame!\""
      ],
      AFFAIR: [
        "A two-hour Live hits 45,000 viewers. Three of {Target}'s alleged mistresses join the guest box, dropping wire receipts and room numbers. One brings a pillow with a stain."
      ],
      LEAKED_MEDIA: [
        "The leaked clip gets stitched with a megaphone filter and a rude sound effect. 1.2 million views in forty minutes. Somebody's child is already dancing to it at a wedding."
      ],
      FAKE_CREDENTIALS: [
        "Gen-Z has turned {Target}'s misspelled, forged diploma into a transition sound. Over four hundred thousand people have lip-synced \"I am a graduate\" while falling down stairs."
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
        "🚨 GIST LOVERS: A prominent heavyweight is sweating bullets in an air-conditioned mansion as {Target}'s dirty secrets spill across the internet! Swipe for all the explosive details 👉"
      ],
      FINANCIAL: [
        "🚨 EFCC RADAR: An anonymous insider leaks raw bank statements showing how billions vanished into shell companies in Panama and Dubai, with {Target}'s fingerprints on every one! Swipe 👉"
      ],
      AFFAIR: [
        "🚨 ENTANGLEMENT DRAMA: {Target}'s secret third wife fights Abuja's \"special friend\" in a private airport lounge. Security staff are holding wigs and shoes. Swipe for photos 👉"
      ],
      LEAKED_MEDIA: [
        "🚨 CAUGHT IN 4K: Uncensored audio and video hits the timeline despite a desperate ₦50 million hush offer to blog admins. The admins took the money and posted anyway! Swipe 👉"
      ],
      FAKE_CREDENTIALS: [
        "🚨 FORGERY ALERT: The foreign registrar officially disowns {Target}'s diploma in a scathing public letter that ends with \"Please stop using our name.\" Swipe to read it 👉"
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
        "The activist callout video just went nuclear, tagging every agency and demanding {Target}'s prosecution in 24 hours. The comment section is a war zone and a prayer meeting."
      ],
      FINANCIAL: [
        "A furious ring-light rant hits 500k views: \"Don't play with us! You have 24 hours to publish the audit for that missing allocation, {Target}, or I'm marching to the anti-graft office myself!\""
      ],
      AFFAIR: [
        "The callout is brutal: \"You preach morality on TV every week, {Target}, and you use state escorts to spirit mistresses in and out of presidential suites? Hypocrite! Hypocrite!\""
      ],
      LEAKED_MEDIA: [
        "The raw leaked audio plays straight into the mic. \"Police, come and arrest {Target} before sunset or I will come for your own boss next!\""
      ],
      FAKE_CREDENTIALS: [
        "The forged certificate is held up to the camera: \"Look at the font! Look at the signature! Who cleared this blatant fraud, who? Who?!\""
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
        "The meme syndicates on X have taken over the trending table: numbers 1 through 8 are brutal edits of {Target}, and number 9 is a prayer for {Target}'s mother."
      ],
      FINANCIAL: [
        "Meme accounts photoshopped {Target}'s face onto heist-movie posters. 80,000 retweets in two hours. The best one has a goat in a getaway car."
      ],
      AFFAIR: [
        "Every frame of the hotel scandal is now a high-definition reaction meme. \"Me leaving the room when my wife calls\" is {Target}'s face at 3 AM."
      ],
      LEAKED_MEDIA: [
        "Trap remixes of {Target}'s leaked voice note are topping the viral charts. The hook is just the loudest, ugliest sob."
      ],
      FAKE_CREDENTIALS: [
        "Users are generating hilarious certificates from Harvard, NASA and \"The University of Jollof\" with {Target}'s portrait, and flooding the replies with them."
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
        "University hostels from UNILAG to UNN have turned the {Target} scandal into a viral skit. Even the lecturers are laughing in class and pretending they aren't."
      ],
      FINANCIAL: [
        "Campus creators are filming skits where they swallow billions of naira like {Target}'s \"accounting department\", complete with fake belching and a very real ₦200 note."
      ],
      AFFAIR: [
        "Students recreated the hotel-room escape in a viral hostel skit, with a bedsheet toga and a roommate yelling \"Oga, your wife is downstairs!\" A lecturer shared it."
      ],
      LEAKED_MEDIA: [
        "The exact audio of {Target} pleading on the leaked tape is the #1 trending sound on every campus. Someone is using it as a ringtone, and the exam hall hates it."
      ],
      FAKE_CREDENTIALS: [
        "Final-year students are posting sarcastic clips of themselves tearing up their textbooks: \"If forged certificates pay better, why am I paying school fees?\""
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
        "A chaotic street livestream has drawn a thousand unruly youths chanting {Target}'s name and burning an effigy that looks suspiciously like their principal."
      ],
      FINANCIAL: [
        "Shirtless streamers stand in front of pothole-riddled roads and scream about the billions {Target} stashed offshore. One is standing in an actual pothole, on purpose."
      ],
      AFFAIR: [
        "Street-pop hype men already dropped an explicit club freestyle about {Target}'s love triangle. It has a chorus. The chorus is a moan. The moan is trending."
      ],
      LEAKED_MEDIA: [
        "Loudspeakers on the back of pickup trucks replay the leaked audio outside {Target}'s estate gate, all night, at a volume that violates several treaties."
      ],
      FAKE_CREDENTIALS: [
        "Street comedians are handing out fake cardboard diplomas to passers-by in mockery of {Target}. One boy got a first-class in Pure Nonsense and cried."
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
        "The self-appointed relationship guru is hosting a three-hour X Space dissecting the psychological dysfunction around {Target}. Seventeen divorced people are crying in the listener tab."
      ],
      FINANCIAL: [
        "The relationship panel is exposing how {Target} washed stolen millions through boutiques owned by secret lovers. \"Red flag! Red flag! The flag is on fire!\""
      ],
      AFFAIR: [
        "30,000 people tune in as insiders expose the bitter war between {Target}'s wife and the mistresses. One mistress calls in crying. Another calls in to say she's the real one."
      ],
      LEAKED_MEDIA: [
        "Every toxic quote from the leaked recording is dissected by a panel of brutal relationship commentators. Verdict: {Target} is a walking red flag with a bad voice."
      ],
      FAKE_CREDENTIALS: [
        "Commentators reveal that {Target} even lied about age and academic history to the in-laws, who are now sharpening the family machete in the kitchen."
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
        "From a flat abroad at 1 AM, the shock-jock is naming every accomplice in the {Target} scandal and laughing at Nigerian libel law in a robe and no slippers."
      ],
      FINANCIAL: [
        "Unredacted wire routing numbers appear on his late-night broadcast, and he dares {Target}'s lawyers to sue him abroad. \"I'm in a country where your friends can't reach me!\""
      ],
      AFFAIR: [
        "He names names, reads passport numbers and hotel receipts from {Target}'s secret trysts, and rates the room service. \"Two stars. Nice robes. Terrible taste in people.\""
      ],
      LEAKED_MEDIA: [
        "He plays the uncut director's cut of the leaked tape that local blogs were too terrified to post, including the part after the part where {Target} thought the call had ended."
      ],
      FAKE_CREDENTIALS: [
        "He calls the foreign registrar live: \"Hello? Yes. Does a {Target} exist in your records? No? Thank you, ma'am. Everyone, did you hear that? Nothing exists!\""
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
        "The early-morning phone-in lines are jammed: retirees, taxi drivers and civil servants calling in non-stop to demand {Target}'s head, in three dialects and a lot of swear words."
      ],
      FINANCIAL: [
        "A retired headmaster sobs on air: \"I've not seen my pension in four years and {Target} just bought a fourth house! God will judge, but let the EFCC go first!\""
      ],
      AFFAIR: [
        "A caller named \"Mama Chidera\" hijacks the line to describe, in detail, what she saw {Target} doing behind the church in 2017. The presenter cannot find the cut-off button."
      ],
      LEAKED_MEDIA: [
        "The station plays the leaked clip in full, then the phone lines melt. A man in Ibadan calls to say he's sold his radio, his wife, and his respect for {Target}."
      ],
      FAKE_CREDENTIALS: [
        "A caller announces he used to type certificates for a living: \"I know that font. That's my font. Ah! Oga {Target}, I am so sorry. I should have stuck to wedding invitations.\""
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
        "An 18-tweet thread with archived PDFs, timestamps and satellite imagery just dismantled every line of {Target}'s defence. The last tweet is just a skull."
      ],
      FINANCIAL: [
        "Tweet 7 of 18 has the audit trail. Tweet 11 has the shell company. Tweet 18 has {Target}'s cousin's birthday photo, wearing the exact watch from the invoice."
      ],
      AFFAIR: [
        "Tweet 9: the hotel's own check-in logs. Tweet 10: the car's GPS. Tweet 12: a photograph of {Target}'s shoes outside a room that was not theirs."
      ],
      LEAKED_MEDIA: [
        "The thread syncs the leaked audio to the wall clock in the background. The date doesn't lie. {Target}'s denial, posted six minutes later, does."
      ],
      FAKE_CREDENTIALS: [
        "The thread overlays {Target}'s certificate on the original template. The only difference is the name. And the quality. And the shame."
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
        "72-point crimson headlines across every national daily at the newsstand: \"THE ANATOMY OF A COVER-UP: INSIDE {Target}'S CRUMBLING EMPIRE.\" The vendors are fighting over copies."
      ],
      FINANCIAL: [
        "\"₦85 BILLION BLOWN\" screams the front page, over a photo of {Target} smiling at a ribbon-cutting. Under the photo, in small print: \"The ribbon was also stolen.\""
      ],
      AFFAIR: [
        "The tabloid's centre spread is a blurred picture of {Target}'s hotel balcony with arrows. One arrow just says \"HERE\". It has been sold out since 7 AM."
      ],
      LEAKED_MEDIA: [
        "The paper prints a full transcript of the leaked recording, bleeped by its lawyers, the bleeps visibly longer than the words."
      ],
      FAKE_CREDENTIALS: [
        "The cover story is a side-by-side of {Target}'s \"degree\" and a real one. The editor's note reads: \"We are not saying it's fake. We are saying the paper is.\""
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
        "The morning anchor just ambushed {Target}'s spokesperson live: \"Stop evading! Is that or is that not your principal's signature on this wire?! Look at the camera and say yes or no!\""
      ],
      FINANCIAL: [
        "The anchor slaps the table: \"Four hundred million in a car park, {Target}'s spokesman! Whose car? Whose park? Whose money? Don't give me 'no comment'!\""
      ],
      AFFAIR: [
        "The anchor adjusts his tie: \"Your principal denies the hotel. Fine. Explain this receipt for two breakfasts and a champagne bucket the night the wife was abroad.\""
      ],
      LEAKED_MEDIA: [
        "The anchor plays the leaked clip on a studio monitor while the guest sweats through a $2,000 suit. \"Is that your boss's voice? Say 'no' and I'll play it again.\""
      ],
      FAKE_CREDENTIALS: [
        "The anchor holds up the diploma: \"Page four has a typo in the university's own name. Was your principal absent that day?\" The producer is laughing in the control room."
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
        "A calm, objective, devastatingly polite breakdown of the evidence has convinced even the most sceptical middle-class professionals that {Target} is, in the doctor's words, \"statistically not a good person\"."
      ],
      FINANCIAL: [
        "Slide 3 shows how {Target}'s declared income and visible lifestyle don't overlap even in a Venn diagram. The doctor adds: \"I've seen healthier numbers on a corpse.\""
      ],
      AFFAIR: [
        "The doctor doesn't gossip; he lists. \"Fact one: {Target} was seen. Fact two: {Target} lied. Fact three: the lie had a lipstick stain.\""
      ],
      LEAKED_MEDIA: [
        "The doctor checks the audio's metadata and spectrogram, then types a single sentence: \"It is real. I'm sorry. I really wanted it to be fake.\""
      ],
      FAKE_CREDENTIALS: [
        "The doctor calls the university and posts the transcript of the call. The registrar says, in a very tired voice, \"We have no such student. We have a goat, though.\""
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
        "A 4,000-word exposé complete with whistle-blower testimony and registry filings sent shockwaves through the diplomatic community. Three embassies stopped taking {Target}'s calls."
      ],
      FINANCIAL: [
        "Section 4 names the shell company, section 6 names the director, section 9 names the director's lover. Footnote 41 names {Target}'s dog as a signatory."
      ],
      AFFAIR: [
        "The exposé includes two sources, three receipts and a former housekeeper who \"has seen things\". It quotes her: \"{Target} is not a good man. {Target} is also not a quiet one.\""
      ],
      LEAKED_MEDIA: [
        "The newsletter publishes the full chain of custody for the leaked clip, signed by a notary. {Target}'s lawyer calls it \"unfair\". The notary calls it \"Tuesday\"."
      ],
      FAKE_CREDENTIALS: [
        "The investigation traces {Target}'s degree to a print shop in Surulere that has produced eleven hundred \"alumni\" of one nonexistent college."
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
        "London and Washington correspondents have picked up the dossier. Foreign embassies are reviewing {Target}'s visa and overseas assets, and a Swiss banker has gone to lunch for six years."
      ],
      FINANCIAL: [
        "A London paper's headline: \"NIGERIAN OFFICIAL'S £40M MAYFAIR PORTFOLIO BOUGHT WITH A SALARY OF £28,000.\" The comments section is mostly the word \"Wow\"."
      ],
      AFFAIR: [
        "A global tabloid runs {Target}'s secret overseas romance on page three, with the headline \"AFRICAN SCANDAL: PASSPORT, PASSION AND A VERY LARGE BILL\"."
      ],
      LEAKED_MEDIA: [
        "A major broadcaster airs the leaked tape with subtitles. Millions of foreigners learn a new Pidgin phrase, and it is not polite."
      ],
      FAKE_CREDENTIALS: [
        "A famous university issues a formal statement: \"We have never heard of this person. We do not teach the subject. We did not issue this certificate.\" It's the shortest statement in its history."
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
        "Directors inside the ministries are quietly photocopying memos and distancing themselves from {Target} before the anti-graft raid begins. The photocopier has never worked this hard."
      ],
      FINANCIAL: [
        "A permanent secretary leaks the real budget to a trusted junior over lunch. The junior goes pale. \"But sir, this means {Target} approved the road twice and built none.\""
      ],
      AFFAIR: [
        "The secretariat's canteen is buzzing: {Target}'s \"personal assistant\" has a salary, a flat and an office with a door that locks from inside."
      ],
      LEAKED_MEDIA: [
        "A leaked internal memo ricochets between floors with the subject line \"URGENT: Please delete everything about {Target} (and delete this message too)\"."
      ],
      FAKE_CREDENTIALS: [
        "An HR clerk quietly slides the real personnel file across the desk. The photo on the CV is {Target}. The face on the certificate is someone else's uncle."
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
        "From Friday sermons to Sunday altars, preachers are delivering blistering, thinly veiled homilies about \"wicked leaders who stash stolen billions in septic tanks\". Everyone turns to look at {Target}'s pew."
      ],
      FINANCIAL: [
        "A cleric thunders: \"You can steal from the poor, but you cannot bribe the Almighty! That sound you hear, {Target}, is your own offering plate crying!\""
      ],
      AFFAIR: [
        "A bishop preaches on Potiphar's wife, Samson's hair and \"people who have been visiting a certain hotel on Tuesdays\". The congregation chants \"Amen\" at the wrong moments."
      ],
      LEAKED_MEDIA: [
        "The imam says \"hear no evil\" then plays the leaked audio from a phone behind the pulpit, just for the evidence. The first row is crying with laughter and with shame."
      ],
      FAKE_CREDENTIALS: [
        "The pastor holds up a Bible: \"This one is real. The certificate {Target} showed the committee? Real fake. Amen? Amen!\""
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
        "Over single malt at the Ikoyi and IBB clubs, the power brokers have quietly agreed that {Target} is a liability and must be cut loose, preferably before dessert."
      ],
      FINANCIAL: [
        "At the 19th hole, a banker whispers: \"His accounts are in more countries than my ex-wife's lawyers.\" The other men nod and order a second round of regret."
      ],
      AFFAIR: [
        "The club's concierge, who has seen everything, quietly tells a member that {Target}'s room has been paid by the hour for the last three years. He didn't even say which hour."
      ],
      LEAKED_MEDIA: [
        "A waiter discreetly forwards a recording from the members' lounge. {Target}'s own best friend is heard saying, \"Honestly, he deserves it.\""
      ],
      FAKE_CREDENTIALS: [
        "A retired professor at the club peers over his glasses: \"I taught at that university for thirty years. I have never met {Target}. I would remember. I'd have failed them.\""
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
        "Lecturers' unions and student coalitions issue a joint 48-hour ultimatum: prosecute {Target} immediately or they will block every highway in the country with bodies and banners."
      ],
      FINANCIAL: [
        "The students' union president thunders through a megaphone: \"You owe our lecturers eight months! You owe our hostels water! You owe us an apology, and a bucket!\""
      ],
      AFFAIR: [
        "A student-led \"Nobody Is Above the Law\" march carries a ten-foot cardboard bed with {Target}'s face on the pillow. The police are not arresting anyone because they are laughing."
      ],
      LEAKED_MEDIA: [
        "The students blast the leaked clip through the campus PA system between lectures. The Dean demands it be stopped, then asks for a copy."
      ],
      FAKE_CREDENTIALS: [
        "A final-year student's placard reads: \"I STUDIED FOR 5 YEARS. {Target} PRINTED FOR 5 MINUTES.\" It goes viral by lunch and sells as a T-shirt by dinner."
      ]
    }
  }
];
