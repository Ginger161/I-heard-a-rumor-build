import type { ChapterScript } from './types';

// ACT 4: THE FACTORY (chapters 12 to 14). The plan.
// A floor of thirty young writers, a Chief with a calendar and a wedding with eight hundred guests and one safe. The reversal of the act:
// The Receipts is not a target. It is the weapon. By the end of Chapter 14 you hold a fabricated receipt, already written, in your voice.

// ---------------------------------------------------------------------------------------------------------------------
const C12: ChapterScript = {
  pre: {
    id: 'c12.pre',
    beats: [
      { t: 'cold', text: 'Monday. 10:00 AM.', time: 'Ikoyi. Blackout Week has ended. The office has not noticed.' },
      { t: 'chat', title: 'DM  •  burner number', msgs: [
        { from: 'fola', text: 'There is a visitor pass at the front desk in your name.' },
        { from: 'fola', text: 'Ask for Mrs. Okeke\'s three o\'clock. She will tell you she has been expecting you.' },
        { from: 'fola', text: 'Do not touch the printers. Do not use your phone. Do not make eye contact with the third desk by the window.' }
      ] },
      { t: 'narr', text: 'Fourteen Ozumba Mbadiwe. Fourteen floors. Thirteen of them are exactly what the brochure says they are. The fourteenth has a door with no sign on it, and a smell of fresh coffee and old fear.' },
      { t: 'still', cam: '14TH FLOOR  •  CORRIDOR', time: '14:58:11', caption: 'A glass door. Behind it: thirty desks, thirty phones, thirty people typing.', detail: 'Nobody looks up. Nobody speaks. A printer somewhere is running, steadily, like a pulse.' },
      { t: 'say', who: 'ngozi', text: 'Come in, come in. Have you eaten? Sit. Your birthday is the fourteenth of March, isn\'t it? I always remember. It is one of my gifts.', mood: 'SMUG' },
      { t: 'narr', text: 'Madam Ngozi Okeke does not look like the woman who has deleted ten thousand apologies. She looks like your favourite aunt, if your favourite aunt had a very good filing system and a view of the lagoon.' },
      { t: 'say', who: 'ngozi', text: 'I know why you are here. I would be disappointed if you were not. But you must understand, darling, I am not your enemy. I am only the person who makes the tea for people who have done bad things.', mood: 'CONFIDENT' },
      { t: 'choice', id: 'c12_offer', prompt: 'She slides a contract across the desk. A very good salary. A corner office. A window.', timer: 25, fallback: 'decline', options: [
        { id: 'pretend', label: 'Take the pen. Say you will think about it.', hint: 'It buys you a week inside. She will know you are lying. She will let you.', effects: { coker: 1, flags: ['c12_pretended'] } },
        { id: 'decline', label: 'Push it back. Politely.', hint: 'It costs you the door. It costs her nothing.', effects: { integrity: 1, flags: ['c12_declined'] } }
      ] }
    ]
  },
  plot: [
    {
      id: 'plot_c12_printer', day: 6, archetype: 'INFORMANT_TIP', stamp: 'THE 6:06 PRINTER', headline: 'The Printer Jams on Page One',
      body: 'Somebody has put the day\'s statements on the wrong tray. For eleven minutes the printer is yours. The paper is warm. The font is a very calm one. The sign-off, on every page, is the same.',
      choices: [
        { id: 'copy', label: 'Photograph every page', detail: '+14% Investigation • +6% Heat', effects: [{ kind: 'investigation', amount: 14 }, { kind: 'heat', amount: 6 }], story: { coker: 1, flags: ['photographed_printer'] } },
        { id: 'swap', label: 'Swap one page for a blank', detail: '+8% Investigation • -4% Heat', effects: [{ kind: 'investigation', amount: 8 }, { kind: 'heat', amount: -4 }], story: { flags: ['swapped_page'] } },
        { id: 'leave', label: 'Walk away. Do not touch it', detail: '-6% Heat', effects: [{ kind: 'heat', amount: -6 }], story: { integrity: 1 } }
      ]
    },
    {
      id: 'plot_c12_window', day: 11, archetype: 'SECURITY_WIRE', stamp: 'THE THIRD DESK', headline: 'Fola Slides a Folder Across the Floor',
      body: 'At the desk by the window a young woman is typing very fast, with her head down, and very slowly sliding a slim blue folder with her left foot towards your chair. If anyone sees it, she loses everything. If you pick it up, so do you.',
      choices: [
        { id: 'take', label: 'Take the folder', detail: '+14% Investigation • +8% Heat', effects: [{ kind: 'investigation', amount: 14 }, { kind: 'heat', amount: 8 }], story: { trust: 1, flags: ['took_fola_folder'] } },
        { id: 'refuse', label: 'Do not touch it', detail: '-4% Heat', effects: [{ kind: 'heat', amount: -4 }], story: { integrity: 1 } }
      ]
    }
  ],
  won: {
    id: 'c12.won',
    beats: [
      { t: 'cold', text: 'Friday. 4:48 PM.', time: 'Twelve minutes before the staff go home.' },
      { t: 'doc', kind: 'notes', title: 'FLOOR PLAN  •  14TH FLOOR  •  STAFF', lines: [
        '30 desks.  30 writers.  1 supervisor.',
        'Desk 1:  statements, Politics',
        'Desk 7:  statements, Business',
        'Desk 14:  statements, Private (Mirror)',
        'Desk 22:  R. FOLORUNSHO  (window)'
      ], mark: [3, 4] },
      { t: 'clue', id: 'C17' },
      { t: 'narr', text: 'Thirty writers. Thirty desks. Every one of them writing the apology a powerful person will post when they are caught. The Oracle was never a hacker. She was an employee, and she has been writing your enemies\' lines since the day she was hired.' },
      { t: 'still', cam: '14TH FLOOR  •  MADAM NGOZI\'S OFFICE', time: '16:49:30', caption: 'An old external drive in a drawer, in a sandwich bag, labelled "BIRTHDAYS".', detail: 'Every apology ever written in this building is on it. There is a folder named CHAPTER 16.' },
      { t: 'clue', id: 'C18' },
      { t: 'say', who: 'ngozi', text: 'It is a very old drive, darling. It only has birthday lists.', mood: 'WORRIED' },
      { t: 'choice', id: 'c12_ngozi', prompt: 'Madam Ngozi is standing between you and the door. She is not holding anything. She is only waiting.', options: [
        { id: 'take', label: 'Take the drive. Take her with it.', hint: 'She will be a witness whether she likes it or not.', effects: { integrity: -1, coker: 1, flags: ['ngozi_taken'] } },
        { id: 'spare', label: 'Take the drive. Leave her a way out.', hint: 'She keeps her job, her flat and her conscience. She may also keep a copy.', effects: { integrity: 1, trust: 1, flags: ['ngozi_saved'] } }
      ] },
      { t: 'say', who: 'ngozi', text: 'I hate what I have become. Do you know that? I have hated it for nine years. I only wanted somebody to ask me to stop.', mood: 'DEFEATED', when: { flag: 'ngozi_saved' } },
      { t: 'say', who: 'ngozi', text: 'You are making a mistake. You are making an enemy of the only person in this building who has ever baked you a birthday cake.', mood: 'ANGRY', when: { flag: 'ngozi_taken' } },
      { t: 'narr', text: 'On the far side of the room, at the desk by the window, a young woman has stopped typing. She is looking at you. The security guard has stopped at the end of her row.' },
      { t: 'choice', id: 'c12_fola', prompt: 'Four minutes before the raid. Fola is at her desk. If you leave without her, they will know who sent the Oracle\'s files.', timer: 20, fallback: 'out', options: [
        { id: 'out', label: 'Get her out. Now.', hint: 'You will have to walk through the front door with her.', effects: { trust: 1, flags: ['fola_out'] } },
        { id: 'stay', label: 'Leave her. Stay low.', hint: 'You cannot save everyone. You can try to save the file.', effects: { integrity: -1, flags: ['fola_left'] } }
      ] },
      { t: 'chat', title: 'DM  •  burner number', msgs: [
        { from: 'fola', text: 'Thank you.' },
        { from: 'fola', text: 'I thought you would use my name.' }
      ], when: { flag: 'fola_out' } },
      { t: 'doc', kind: 'notes', title: 'THE DRIVE  •  folders', lines: [
        'CHAPTER 01',
        'CHAPTER 02',
        '...',
        'CHAPTER 15',
        'CHAPTER 16   ← created: six years ago'
      ], mark: [4], shake: true },
      { t: 'narr', text: 'There is a folder for every chapter of your life, and the last one was created six years ago, on the night you stopped being a junior at HRP.' }
    ]
  },
  lost: { id: 'c12.lost', beats: [
    { t: 'cold', text: 'Friday. 5:01 PM.', time: 'You are escorted out of the building.' },
    { t: 'narr', text: 'The visitor pass is taken. Madam Ngozi wishes you a safe journey home, and tells you not to forget your umbrella. It has not rained in eleven days.' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
const C13: ChapterScript = {
  pre: {
    id: 'c13.pre',
    beats: [
      { t: 'cold', text: 'Wednesday. 7:00 PM.', time: 'Election Year. Every billboard in Lagos has the same smiling face.' },
      { t: 'news', channel: 'CHANNELS TV  •  PRIME', headline: 'Chief "Unbothered" Mbakwe: "I have never lost an election, an argument or a witness."', ticker: 'The Chief is the frontrunner for the governorship, by a margin the polls describe as "regrettable".' },
      { t: 'narr', text: 'The folder CHAPTER 16 has taken a week to open. Before that, the drive offers a lot of folders you did not expect: twenty years of apologies, signed and filed. Each one is for the same man.' },
      { t: 'doc', kind: 'ledger', title: 'DRIVE  •  /MBAKWE/', lines: [
        '14 scandals.  9 inquiries.  2 witnesses (relocated).',
        'Apologies written:  31',
        'Signed:  "Peace and light."',
        'Retainer:  paid in full, twenty years, in cash'
      ], mark: [1, 2] },
      { t: 'say', who: 'mbakwe', text: 'My son. My daughter. Whichever you are. Do you know who I am? Do you know who I know? Sit. Eat something. There are three kinds of rice.', mood: 'SMUG' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss this is not an ex. this is not a boss.' },
        { from: 'biko', text: 'if you do this you don\'t get to be anonymous after' }
      ], when: { notFlag: 'biko_fired' } },
      { t: 'chat', title: 'DM  •  burner number', msgs: [
        { from: 'fola', text: 'He has a judge. He has a pastor. He has a Hilux. Please be careful.' }
      ], when: { flag: 'biko_fired' } },
      { t: 'choice', id: 'c13_lunch', prompt: 'The Chief\'s office has called. A "lunch". The invitation has a crest on it. It is not a request.', timer: 25, fallback: 'go', options: [
        { id: 'go', label: 'Go to lunch. Smile. Eat the rice.', hint: 'You will learn what he fears. He will learn what you look like.', effects: { coker: 1, flags: ['c13_lunch'] } },
        { id: 'refuse', label: 'Send your regrets. Stay hidden.', hint: 'It insults him. It protects you.', effects: { integrity: 1, flags: ['c13_refused'] } }
      ] }
    ]
  },
  plot: [{
    id: 'plot_c13_raid', day: 12, archetype: 'SECURITY_WIRE', stamp: 'SCHEDULED RAID', headline: 'The Chief\'s Security Comes at Noon',
    body: 'Twelve men in matching jackets. A van with no plate. A court order with a signature that is a little too fluid. They are not here for you. They are here for everything you have.',
    choices: [
      { id: 'hide', label: 'Hide the drives. Hand over decoys', detail: '-8 ⚡ • -10% Heat', cost: 8, effects: [{ kind: 'heat', amount: -10 }], story: { flags: ['hid_drives'] } },
      { id: 'lawyer', label: 'Call Zainab. Ask her to witness', detail: '+8% Investigation • -6% Heat', effects: [{ kind: 'investigation', amount: 8 }, { kind: 'heat', amount: -6 }], story: { trust: 1, flags: ['zainab_witnessed'] } },
      { id: 'run', label: 'Slip out the back', detail: '-4% Heat • -8% Investigation', effects: [{ kind: 'heat', amount: -4 }, { kind: 'investigation', amount: -8 }], story: { coker: 1 } }
    ]
  }],
  won: {
    id: 'c13.won',
    beats: [
      { t: 'cold', text: 'Monday. 11:20 PM.', time: 'The Chief has gone on live television to "forgive his enemies".' },
      { t: 'doc', kind: 'notes', title: 'CAMPAIGN CALENDAR  •  the Chief\'s private copy', lines: [
        'Mon:  Rally, Ikeja',
        'Tue:  Thanksgiving, Mainland',
        'Sat:  Daughter\'s wedding, Ikoyi',
        'Election Eve:  6:06 PM  —  "THE RECEIPT"',
        '(no name next to it. There is a page.)'
      ], mark: [3, 4], shake: true },
      { t: 'clue', id: 'C19' },
      { t: 'narr', text: 'There is no name next to the entry. There is a page. It is the only thing on the calendar that is not a person, a place or a prayer. You read it four times and then you understand it.' },
      { t: 'narr', text: 'The plan is not to expose a rival. It is to have you post a fabricated receipt about the Chief\'s opponent, on election eve, at 6:06 PM, from the most credible gist page in Nigeria. They have spent six years making you credible. Today is the day they spend it.' },
      { t: 'say', who: 'biko', text: 'Boss. You are the weapon. You were always the weapon.', mood: 'PANIC', when: { notFlag: 'biko_fired' } },
      { t: 'choice', id: 'c13_plan', prompt: 'You are holding the plan. Halo is waiting for an answer. What do you do?', options: [
        { id: 'undercover', label: 'Pretend to cooperate. Go undercover.', hint: 'You get inside the wedding. You also get a leash.', effects: { coker: 1, trust: -1, flags: ['went_undercover'] } },
        { id: 'run', label: 'Refuse. Burn it. Run.', hint: 'You keep your hands clean. You lose your seat at the table.', effects: { integrity: 1, flags: ['refused_plan'] } }
      ] },
      { t: 'cold', text: 'Midnight.', time: 'A voice note arrives.' },
      { t: 'voice', from: 'Halo', secs: 17, text: 'I knew you would find it, my dear. I always know. Come to the wedding. We should be in the same room for this. Peace and light.' },
      { t: 'narr', text: 'His voice is as warm as it has ever been. You have heard it a thousand times. You have never once been afraid of it before.' }
    ]
  },
  lost: { id: 'c13.lost', beats: [
    { t: 'cold', text: 'Not tonight.', time: 'A judge has been found.' },
    { t: 'narr', text: 'The court order lands at 2 AM. It has a very large seal. It was signed by a man who was woken for the purpose and has not yet stopped smiling. Biko says, quietly, "He has a judge. He always had a judge."' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
// The heist. A timetable: every scene of the wedding is a window to act, and a guard stands in each of them.
const C14: ChapterScript = {
  pre: {
    id: 'c14.pre',
    beats: [
      { t: 'cold', text: 'Saturday. 6:00 PM.', time: 'Detty December, Ikoyi. Chief Mbakwe\'s daughter is getting married.' },
      { t: 'narr', text: 'Eight hundred guests. Three bands. A marquee the size of a football pitch. A safe in the groom\'s father\'s study. A timetable pinned to every door, in a font that is a little too steady.' },
      { t: 'still', cam: 'IKOYI  •  THE MARQUEE', time: '18:00:00', caption: 'Eight hundred phones in the air. One of them is yours.', detail: 'DJ Cupcake is filming the dance floor. He films everything. He will film the exact thing that matters, and he will not know it.' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss I am in the car. flask of tea. engine running.' },
        { from: 'biko', text: 'the first dance is at nine. the safe is on the left of the study. there are four men with earpieces.' },
        { from: 'biko', text: 'whatever you do, don\'t be the one who knocks over the cake.' }
      ], when: { notFlag: 'biko_fired' } },
      { t: 'chat', title: 'DM  •  burner number', msgs: [
        { from: 'fola', text: 'The first dance is at nine. The safe is on the left of the study.' },
        { from: 'fola', text: 'Do not trust anyone with an earpiece. Do not trust anyone without one either.' }
      ], when: { flag: 'biko_fired' } },
      { t: 'say', who: 'target', text: 'Welcome, welcome. Please enjoy the wedding. Please do not enjoy it too much. Every door has a time, and every time has a door.', mood: 'SMUG' },
      { t: 'say', who: 'halo', text: 'You came. Of course you came. Walk with me. We have so much to catch up on.', mood: 'CONFIDENT', when: { flag: 'went_undercover' } },
      { t: 'narr', text: 'You have never seen Halo in person. You have only ever heard him. He is smaller than you expected. He is wearing an agbada the colour of dried blood.', when: { flag: 'went_undercover' } },
      { t: 'narr', text: 'Somewhere in the crowd, a pastor with a very good lawyer is laughing at a joke. An afrobeats star is signing a napkin. A football chairman is arguing with the DJ about the playlist. It is a wedding. It is the most dangerous room in Nigeria.' },
      { t: 'choice', id: 'c14_entry', prompt: 'Eight hundred guests. One study. How do you get inside?', timer: 25, fallback: 'catering', options: [
        { id: 'catering', label: 'Go in with the catering staff.', hint: 'Invisible, and carrying a tray.', effects: { flags: ['c14_catering'] } },
        { id: 'guest', label: 'Walk in as a guest. Smile. Dance.', hint: 'Everybody sees you. Nobody questions you.', effects: { coker: 1, flags: ['c14_guest'] } }
      ] }
    ]
  },
  plot: [
    {
      id: 'plot_c14_dance', day: 3, archetype: 'SECURITY_WIRE', stamp: '9:00 PM  •  THE FIRST DANCE', headline: 'The First Dance Is Also a Sweep',
      body: 'The bride and groom spin under a single light. Eight men in matching suits spin faster around the edge. For four minutes every eye in the room is on the middle. Every guard is on the edge. The study is on the left.',
      choices: [
        { id: 'slip', label: 'Slip into the study', detail: '+14% Investigation • +10% Heat', effects: [{ kind: 'investigation', amount: 14 }, { kind: 'heat', amount: 10 }], story: { coker: 1 } },
        { id: 'watch', label: 'Watch the guards. Learn the pattern', detail: '+8% Investigation • -3% Heat', effects: [{ kind: 'investigation', amount: 8 }, { kind: 'heat', amount: -3 }], story: {} },
        { id: 'dance', label: 'Dance. Be forgettable', detail: '-6% Heat', effects: [{ kind: 'heat', amount: -6 }], story: {} }
      ]
    },
    {
      id: 'plot_c14_speeches', day: 6, archetype: 'STREET_WHISPER', stamp: '10:15 PM  •  THE SPEECHES', headline: 'Forty Minutes of Speeches',
      body: 'The pastor speaks first. He thanks God, then the Chief, then the Chief\'s lawyer, in that order. A long blessing follows. Mr. Macaroony is on the second table, filming a skit about the pastor\'s speech. Everybody is laughing. Nobody is looking at the study.',
      choices: [
        { id: 'copy', label: 'Photograph the safe\'s keypad', detail: '+12% Investigation • +6% Heat', effects: [{ kind: 'investigation', amount: 12 }, { kind: 'heat', amount: 6 }], story: {} },
        { id: 'skit', label: 'Ask Mr. Macaroony to "improvise"', detail: '+10 Freshness • -6% Heat', effects: [{ kind: 'freshness', amount: 10 }, { kind: 'heat', amount: -6 }], story: { flags: ['skit_distraction'] } },
        { id: 'wait', label: 'Wait for the money', detail: '-4% Heat', effects: [{ kind: 'heat', amount: -4 }], story: {} }
      ]
    },
    {
      id: 'plot_c14_spray', day: 9, archetype: 'VIRAL_RECEIPT', stamp: '11:40 PM  •  THE SPRAYING', headline: 'The Spraying of Money Begins',
      body: 'Naira notes rain down on the dance floor. A famous afrobeats star leaps onto a table. An influencer livestreams it. A football chairman starts a fight over a note. Every eye in the marquee is on the floor. The safe is on the left.',
      choices: [
        { id: 'open', label: 'Open the safe', detail: '+20% Investigation • +14% Heat', effects: [{ kind: 'investigation', amount: 20 }, { kind: 'heat', amount: 14 }], story: { coker: 1, flags: ['opened_safe'] } },
        { id: 'clone', label: 'Clone the file, do not take it', detail: '+14% Investigation • +6% Heat', effects: [{ kind: 'investigation', amount: 14 }, { kind: 'heat', amount: 6 }], story: { flags: ['cloned_file'] } },
        { id: 'help', label: 'Help the DJ with the playlist', detail: '+8 Freshness • -6% Heat', effects: [{ kind: 'freshness', amount: 8 }, { kind: 'heat', amount: -6 }], story: { flags: ['dj_helped'] } }
      ]
    },
    {
      id: 'plot_c14_cake', day: 12, archetype: 'SECURITY_WIRE', stamp: '12:30 AM  •  THE CAKE', headline: 'The Cake Is Cut. The Doors Close.',
      body: 'The Chief stands up, microphone in hand. "Please remain seated." Eight men move to the doors. Barrister Ugwu raises one finger. The music stops. Everybody in the marquee has the same idea at once: "who has the key?"',
      choices: [
        { id: 'run', label: 'Slip out through the kitchen', detail: '-8% Heat • -6% Investigation', effects: [{ kind: 'heat', amount: -8 }, { kind: 'investigation', amount: -6 }], story: {} },
        { id: 'stay', label: 'Stay in your seat. Look surprised', detail: '-4% Heat', effects: [{ kind: 'heat', amount: -4 }], story: {} },
        { id: 'toast', label: 'Stand and propose a toast', detail: '+10 Freshness • +8% Heat', effects: [{ kind: 'freshness', amount: 10 }, { kind: 'heat', amount: 8 }], story: { coker: 1 } }
      ]
    }
  ],
  won: {
    id: 'c14.won',
    beats: [
      { t: 'cold', text: 'Sunday. 1:12 AM.', time: 'The cake is in pieces. The safe is open.' },
      { t: 'doc', kind: 'draft', title: 'THE FILE  •  "THE RECEIPT"  •  scheduled', lines: [
        'POST AT:  Election Eve, 6:06 PM',
        'FROM:  @TheReceipts',
        '"The opposing candidate has stolen from the pension fund of 40,000 retirees. Here is the proof."',
        '(proof: fabricated. signed: your name.)',
        'Peace and light. 🕊️'
      ], mark: [0, 3, 4], shake: true },
      { t: 'clue', id: 'C20' },
      { t: 'narr', text: 'It is in your voice. It has your commas, your rhythm, the slightly sarcastic way you open a paragraph. It is better than anything you have written. It has been waiting in a safe, in a wedding, for six years.' },
      { t: 'doc', kind: 'ledger', title: 'DONOR LIST  •  signed', lines: [
        'Chief "Unbothered" Mbakwe  —  ₦900,000,000',
        'Pastor Fire  —  ₦120,000,000  (jet)',
        'Chairman Offside  —  ₦60,000,000  (stadium)',
        'Halo Reputation Partners  —  logistics'
      ], mark: [1, 3] },
      { t: 'clue', id: 'C21' },
      { t: 'say', who: 'halo', text: 'You see? I said you would be wonderful. You wrote it before you even knew it was yours.', mood: 'SMUG', when: { flag: 'went_undercover' } },
      { t: 'choice', id: 'c14_donors', prompt: 'You have the fabricated receipt, and you have the donor list. You can only use one tonight.', options: [
        { id: 'leak', label: 'Leak the donor list now.', hint: 'A public scandal at once. The plan will simply go ahead through another page.', effects: { integrity: 1, coker: 1, flags: ['leaked_donors'] } },
        { id: 'hold', label: 'Hold the donor list. Keep it for the real fight.', hint: 'The plan goes on. So does your leverage.', effects: { flags: ['held_donors'] } }
      ] },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss' },
        { from: 'biko', text: 'there is an inspector at the gate with me' },
        { from: 'biko', text: 'I did not call him' },
        { from: 'biko', text: 'run' }
      ], when: { notFlag: 'biko_fired' }, shake: true },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss' },
        { from: 'biko', text: 'I know you said I should not message you' },
        { from: 'biko', text: 'there is an inspector at the gate. I saw him. I did not call him' },
        { from: 'biko', text: 'run' }
      ], when: { flag: 'biko_fired' }, shake: true },
      { t: 'say', who: 'coker', text: 'Good evening. I believe you have something of mine.', mood: 'NEUTRAL' }
    ]
  },
  lost: { id: 'c14.lost', beats: [
    { t: 'cold', text: 'Sunday. 2:00 AM.', time: 'The guards find the study before you find the safe.' },
    { t: 'narr', text: 'You are escorted to the gate with a bag of jollof and a very warm smile. The Chief shakes your hand. "Come back when you have been invited," he says. Behind him, Halo is laughing.' }
  ] }
};

export const ACT4: Record<string, ChapterScript> = { c12: C12, c13: C13, c14: C14 };
