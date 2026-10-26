import type { ChapterScript } from './types';

// ACT 2: THE PRICE (chapters 5 to 8). The work, the money and the first betrayal.
// Your day job, your boss, your business partner, and a night with no lights. Somebody is feeding you targets, and somebody is feeding
// HRP your drafts. The act ends on the midpoint: Biko, in a CCTV still, outside the one building he swore he had never heard of.
// (The set-up text and the win/lose epilogues in data/story.ts still play: `pre` runs first, then the motive cards, then the match;
// after the match the win/lose text plays, then the `won`/`lost` scene below.)

// ---------------------------------------------------------------------------------------------------------------------
const C05: ChapterScript = {
  pre: {
    id: 'c05.pre',
    beats: [
      { t: 'cold', text: 'Monday. 9:00 AM.', time: 'Brightwater Group. Recognition Day.' },
      { t: 'narr', text: 'By day you are a communications officer on the fourth floor. By night you are The Receipts. Nobody in this building knows both, and you intend to keep it that way.' },
      { t: 'doc', kind: 'email', title: 'ALL-STAFF  •  Recognition Day', lines: [
        'Dear colleagues,',
        'Please join us in congratulating Dapo on the Q3 Vision Deck.',
        'A special thank-you to "the team" for their "support".',
        'There will be zobo and small chops in the atrium.'
      ], mark: [1, 2] },
      { t: 'say', who: 'target', text: 'The deck was mostly instinct, honestly. You cannot teach that. Some people just see the whole picture.', mood: 'SMUG' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss you\'re doing the face' },
        { from: 'biko', text: 'the one you do right before you post' },
        { from: 'biko', text: 'we have never done an office story' },
        { from: 'biko', text: 'offices have HR. HR has a lawyer. the lawyer has a cousin' }
      ] },
      { t: 'voice', from: 'Halo', secs: 19, text: 'Corporate is a game, darling. The rules are boring and the players are afraid. Win it quietly. And remember to eat something. Peace and light.' },
      { t: 'narr', text: 'He answered in eleven minutes. You had not even told him which office.' },
      { t: 'choice', id: 'c05_meeting', prompt: 'The Monday meeting. Dapo is looking at you across the table. What do you give him?', timer: 20, fallback: 'smile', options: [
        { id: 'smile', label: 'A polite smile. Say nothing.', hint: 'Let him enjoy his plaque. It will cost him later.', effects: { integrity: 1, flags: ['c05_patient'] } },
        { id: 'needle', label: 'Ask one small question about slide nine.', hint: 'He will not be able to answer it, and everybody will see.', effects: { coker: 1, flags: ['c05_needled'] } }
      ] }
    ]
  },
  plot: [{
    id: 'plot_c05_props', day: 7, archetype: 'INFORMANT_TIP', stamp: 'DM  •  @ORACLENAIJA', headline: 'The Oracle Says: Look at the Properties',
    body: '"Right-click the file," the message says. "Don\'t read the slides. Read the details." There is a small dove at the end of it. You have never seen the Oracle use an emoji before.',
    choices: [
      { id: 'open', label: 'Open the file properties', detail: '+12% Investigation • +4% Heat', effects: [{ kind: 'investigation', amount: 12 }, { kind: 'heat', amount: 4 }], story: { flags: ['looked_props'] } },
      { id: 'biko', label: 'Send it to Biko first', detail: '+6% Investigation • Biko checks it twice', effects: [{ kind: 'investigation', amount: 6 }], story: { trust: 1, flags: ['props_to_biko'] } },
      { id: 'ignore', label: 'You do not need her help', detail: 'Nothing happens', effects: [], story: { integrity: 1 } }
    ]
  }],
  won: {
    id: 'c05.won',
    beats: [
      { t: 'cold', text: 'Friday. 4:40 PM.', time: 'The thread has been round every WhatsApp group in the building.' },
      { t: 'doc', kind: 'notes', title: 'FILE PROPERTIES  •  Q3_VISION_FINAL.pptx', lines: [
        'Title:  Q3 Vision',
        'Author:  R. Folorunsho',
        'Last saved by:  D. Alabi',
        'Company:  Halo Reputation Partners',
        'Created:  14 months ago'
      ], mark: [1, 3], shake: true },
      { t: 'clue', id: 'C08' },
      { t: 'narr', text: 'You did not write the best slides in that deck. Neither did he. Somebody he paid for, through somebody else, wrote the whole thing, and the somebody works for the only firm you have been trying not to say out loud.' },
      { t: 'chat', title: 'DM  •  @OracleNaija', msgs: [
        { from: 'oracle', text: 'You found it.' },
        { from: 'oracle', text: 'My name is Fola. R. Folorunsho. I wrote his deck. I wrote his bio. I wrote his thank-you speech.' },
        { from: 'oracle', text: 'Then I wrote his apology, the day you started asking.' }
      ], shake: true },
      { t: 'say', who: 'fola', text: 'I am a ghostwriter. That is all I have ever been. Everybody in your life that you are angry at, somebody wrote the words they say.', mood: 'WORRIED' },
      { t: 'choice', id: 'c05_fola', prompt: 'You know her name. HR would pay a great deal to know who leaked the file. The Receipts would trend for a week if you named her.', options: [
        { id: 'protect', label: 'Protect her. Say nothing.', hint: 'She is the only person who has ever told you the truth.', effects: { integrity: 1, trust: 1, flags: ['fola_protected'] } },
        { id: 'use', label: 'Use her name as leverage.', hint: 'It will get you through the next door. It may close hers.', effects: { integrity: -2, flags: ['fola_exposed'] } }
      ] },
      { t: 'chat', title: 'DM  •  burner number', msgs: [
        { from: 'fola', text: 'Stop using my files.' },
        { from: 'fola', text: 'They will know it is me.' }
      ], when: { flag: 'fola_protected' }, shake: true },
      { t: 'chat', title: 'DM  •  burner number', msgs: [
        { from: 'fola', text: 'You used my name.' },
        { from: 'fola', text: 'They know it is me.' }
      ], when: { flag: 'fola_exposed' }, shake: true },
      { t: 'say', who: 'biko', text: 'Boss. Who is Fola? And why does she know when you are about to post?', mood: 'WORRIED' }
    ]
  },
  lost: { id: 'c05.lost', beats: [
    { t: 'cold', text: 'Not today.', time: 'HR called it a "regrettable misunderstanding".' },
    { t: 'narr', text: 'Dapo gets a bonus. You get a stern email about "communication policy". Somewhere in Ikoyi, someone updates a spreadsheet with a small tick.' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
const C06: ChapterScript = {
  pre: {
    id: 'c06.pre',
    beats: [
      { t: 'cold', text: 'Tuesday. 8:12 AM.', time: 'Fuel Scarcity. The staff are walking. The boss is not.' },
      { t: 'still', cam: 'LOBBY CAM 2', time: '08:12:07', caption: 'A black SUV with a flag. A driver. A second wife in the passenger seat.', detail: 'The SUV has a name painted on the dashboard: "DADDY".' },
      { t: 'narr', text: 'Seven months of salary owed. The Staff Welfare Fund has not welfared anybody since the last government. And still, every Friday, the boss tells you all: "We are a family."' },
      { t: 'doc', kind: 'ledger', title: 'PAYSLIPS  •  anonymous form  •  11 received', lines: [
        'Chinedu O.  —  owed 7 months',
        'Blessing T.  —  owed 7 months',
        'Ibrahim S.  —  owed 6 months',
        'Mrs. Adeyemi  —  owed 7 months, and a pension',
        '...'
      ], mark: [0, 1, 3] },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss this is bigger than you' },
        { from: 'biko', text: 'eleven people trusted a form you didn\'t know you had' },
        { from: 'biko', text: 'please don\'t make it about you' },
        { from: 'biko', text: '(also. the SUV has a NAME. it\'s called DADDY)' }
      ] },
      { t: 'say', who: 'target', text: 'In this house, there are no employees. Only family members who have not yet understood the vision.', mood: 'SMUG' },
      { t: 'choice', id: 'c06_sources', prompt: 'The staff have trusted you with their names. What do you promise them?', options: [
        { id: 'shield', label: 'Nobody will ever know it was you.', hint: 'Safer for them. Slower for you.', effects: { trust: 1, integrity: 1, flags: ['shielded_staff'] } },
        { id: 'front', label: 'Put the names up. Strength in numbers.', hint: 'Louder. They will be fired.', effects: { integrity: -1, coker: 1, flags: ['fronted_staff'] } }
      ] }
    ]
  },
  plot: [{
    id: 'plot_c06_memo', day: 8, archetype: 'SECURITY_WIRE', stamp: 'HR MEMO  •  URGENT', headline: 'Mandatory All-Hands: "A Culture of Trust"',
    body: 'The memo has no author. It has eleven exclamation marks and a subject line in a font that is slightly too calm. Attendance is "strongly encouraged". It ends: "Peace and light."',
    choices: [
      { id: 'attend', label: 'Attend, and film the room', detail: '+10% Investigation • +5% Heat', effects: [{ kind: 'investigation', amount: 10 }, { kind: 'heat', amount: 5 }], story: { coker: 1, flags: ['filmed_allhands'] } },
      { id: 'skip', label: 'Skip it. Work from the café', detail: '-6% Heat • +8 Freshness', effects: [{ kind: 'heat', amount: -6 }, { kind: 'freshness', amount: 8 }], story: {} },
      { id: 'trace', label: 'Trace the memo\'s sender', detail: '-10 ⚡ • +12% Investigation', cost: 10, effects: [{ kind: 'investigation', amount: 12 }], story: { flags: ['traced_memo'] } }
    ]
  }],
  won: {
    id: 'c06.won',
    beats: [
      { t: 'cold', text: 'Thursday. 6:40 PM.', time: 'The Ministry of Labour has called. The staff chat is very quiet.' },
      { t: 'doc', kind: 'email', title: 'HR  •  thread  •  forwarded by a source', lines: [
        'From: Head Office  (no name)',
        'Re: the Communications Officer',
        '"Do NOT terminate. Instruct."',
        '"Keep in post. Keep close. Report quarterly."'
      ], mark: [2, 3], shake: true },
      { t: 'clue', id: 'C09' },
      { t: 'narr', text: 'You read it twice. Not "dismiss". Not "discipline". Instruct. You were not an employee. You were an assignment. Somebody wanted you on the fourth floor, for years, at a salary exactly large enough to stop you leaving.' },
      { t: 'say', who: 'biko', text: 'Boss. Who gets to keep a person in a job on purpose?', mood: 'WORRIED' },
      { t: 'choice', id: 'c06_job', prompt: 'You know the job was a leash. What do you do with it?', options: [
        { id: 'resign', label: 'Resign loudly. Walk out with the evidence.', hint: 'No more leash. No more salary. No more inside view.', effects: { integrity: 1, flags: ['resigned_loud'] } },
        { id: 'stay', label: 'Stay. Become the inside source.', hint: 'Whoever instructed this will be watching. Let them watch a good employee.', effects: { coker: 1, flags: ['stayed_inside'] } }
      ] },
      { t: 'cold', text: 'Friday. 5:00 PM.', time: 'You are in the lift. It stops on three.' },
      { t: 'say', who: 'coker', text: 'Good evening. I am Inspector Coker. I hope you will not mind a small question, about a page I do not suspect you of running.', mood: 'NEUTRAL', when: { flag: 'stayed_inside' } },
      { t: 'say', who: 'coker', text: 'Good evening. I was told you had just left the building. I hope you will not mind a small question, about a page I do not suspect you of running.', mood: 'NEUTRAL', when: { flag: 'resigned_loud' } },
      { t: 'narr', text: 'He is smiling. It is the politest smile you have ever been afraid of.' }
    ]
  },
  lost: { id: 'c06.lost', beats: [
    { t: 'cold', text: 'Not today.', time: 'The staff chat goes quiet.' },
    { t: 'narr', text: 'Two of your sources are fired by Friday. The handbook has a new clause. Biko does not say anything for a long time. "We did that," he says. "Not him. We."' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
const C07: ChapterScript = {
  pre: {
    id: 'c07.pre',
    beats: [
      { t: 'cold', text: 'Wednesday. 11:14 PM.', time: 'Election Year. Everybody is selling something. Mostly a vision.' },
      { t: 'news', channel: 'FOUNDERS WEEKLY', headline: 'Lagos fintech "ELEVATE" raises ₦120M in pre-seed. Co-founder: "We are just getting started."', ticker: 'Photo: your business partner, your logo, your idea, one other person who is not you.' },
      { t: 'narr', text: 'The company was meant to give market women instant loans. It has one customer, a great deal of "sprint planning" and a Head of Growth who is also his girlfriend.' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss are you awake' },
        { from: 'biko', text: 'the company account. look at the March statement' },
        { from: 'biko', text: 'there\'s a payment going out on the 28th. every month. same amount. since you founded it.' }
      ] },
      { t: 'doc', kind: 'ledger', title: 'STATEMENT  •  ELEVATE LTD', lines: [
        '28 Jan   —   RETAINER  —  ₦400,000',
        '28 Feb   —   RETAINER  —  ₦400,000',
        '28 Mar   —   RETAINER  —  ₦400,000',
        'Beneficiary:  ██████████ ███'
      ], mark: [0, 1, 2] },
      { t: 'say', who: 'target', text: 'You are being very negative. Founders are builders. You are a critic. This is why you were not a good fit for the culture.', mood: 'SMUG' },
      { t: 'chat', title: 'EMAIL  •  Zainab Lawal, The Ledger', msgs: [
        { from: 'zainab', text: 'I read your page the way one reads a menu in a restaurant that has failed its inspection.' },
        { from: 'zainab', text: 'I am told you hold the bank statements for Elevate. I am investigating their funding round.' },
        { from: 'zainab', text: 'I do not trust gossip pages. I also do not trust Elevate. I would prefer to be wrong about one of them.' }
      ] },
      { t: 'choice', id: 'c07_zainab', prompt: 'A real journalist at a real paper. She wants the statements.', timer: 30, fallback: 'later', options: [
        { id: 'share', label: 'Send her the statements.', hint: 'She will verify them. She will also read your page differently.', effects: { integrity: 1, flags: ['zainab_contact'] } },
        { id: 'later', label: 'Not yet. Say you will reply.', hint: 'The page is yours. The story is yours.', effects: { flags: ['zainab_deferred'] } }
      ] }
    ]
  },
  plot: [{
    id: 'plot_c07_trail', day: 9, archetype: 'INFORMANT_TIP', stamp: 'THE TRAIL', headline: 'A Second Account Surfaces',
    body: 'A friendly clerk at the bank sends you a screenshot: the company account is not the only one. The retainer goes to a name that has been cropped from every document. You need a day, a favour and a little courage.',
    choices: [
      { id: 'follow', label: 'Follow the money quietly', detail: '+14% Investigation • -4% Heat', effects: [{ kind: 'investigation', amount: 14 }, { kind: 'heat', amount: -4 }], story: { flags: ['followed_money'] } },
      { id: 'leak', label: 'Leak what you have now', detail: '+10 Freshness • +8% Heat', effects: [{ kind: 'freshness', amount: 10 }, { kind: 'heat', amount: 8 }], story: { integrity: -1, flags: ['leaked_money_early'] } },
      { id: 'lawyer', label: 'Hand it to a lawyer', detail: '-10 ⚡ • +8% Investigation • -5% Heat', cost: 10, effects: [{ kind: 'investigation', amount: 8 }, { kind: 'heat', amount: -5 }], story: { integrity: 1 } }
    ]
  }],
  won: {
    id: 'c07.won',
    beats: [
      { t: 'cold', text: 'Friday. 6:40 PM.', time: 'Two investors have withdrawn. A third wants to "hear your side".' },
      { t: 'chat', title: 'WHATSAPP  •  your business partner', msgs: [
        { from: 'target', text: 'did the retainer clear?' },
        { from: 'm1', text: 'It clears Friday.' },
        { from: 'target', text: 'good. same account. same name. keep it off the statements.' }
      ], shake: true },
      { t: 'clue', id: 'C10' },
      { t: 'narr', text: 'A retainer. Out of your startup account. Every month. To somebody he has never once mentioned, on the 28th, in cash that looks like salary.' },
      { t: 'doc', kind: 'ledger', title: 'RETAINER  •  recipient', lines: [
        'Reference:  RET-0328',
        'Paid to:  ███████ ██████',
        '(the rest of the name has been cropped from the screenshot)'
      ], mark: [1] },
      { t: 'say', who: 'zainab', text: 'I have not decided yet whether you are a hero or a hazard. But I know a retainer when I see one. Do not post the recipient\'s name until I have checked it.', mood: 'NEUTRAL', when: { flag: 'zainab_contact' } },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss the name\'s cropped' },
        { from: 'biko', text: 'give me your phone. I\'ll fix the crop.' }
      ] },
      { t: 'narr', text: 'You hand it over. He takes it with both hands, like something that might break. You watch him walk to the window with it.' },
      { t: 'pause', ms: 900 },
      { t: 'narr', text: 'When he gives it back, he is smiling. It is not a smile you have ever seen on him. It is the smile of someone who has just made up his mind.' },
      { t: 'say', who: 'biko', text: 'Fixed it, boss. Nothing there. Just a typo.', mood: 'CONFIDENT' }
    ]
  },
  lost: { id: 'c07.lost', beats: [
    { t: 'cold', text: 'Not yet.', time: 'The pitch deck wins the room.' },
    { t: 'narr', text: 'He announces a "pivot" and a funding round. Your post sinks under the news. Biko says, quietly, "Maybe the lawyer first." He is looking at his phone while he says it.' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
// The midpoint. The whole of Lagos is dark; the page is being followed; the reveal that changes the season.
const C08: ChapterScript = {
  pre: {
    id: 'c08.pre',
    beats: [
      { t: 'cold', text: 'Saturday. 9:12 PM.', time: 'Blackout Week. The whole of Lagos is dark. Your phone is at 9%.' },
      { t: 'narr', text: 'Every generator on your street is screaming. Every window has a candle in it. You have never seen the city so quiet, or heard it so loud.' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss where are you' },
        { from: 'you', text: 'driving' },
        { from: 'biko', text: 'which way' },
        { from: 'biko', text: '...never mind. forget I asked.' }
      ] },
      { t: 'still', cam: 'STREET  •  UNKNOWN', time: '21:12:40', caption: 'A car behind you. No headlights. Six streets now.', detail: 'It is not following the traffic. It is following you.' },
      { t: 'doc', kind: 'notes', title: 'NOTES  •  DRAFT  •  "unposted"', lines: [
        'Draft 4 of 6:  the one about HRP.',
        'Someone has read this. Someone has edited it.',
        'The last line is not yours.'
      ], mark: [1, 2], shake: true },
      { t: 'say', who: 'target', text: 'You wrote four drafts and posted none. And yet I know every word. Do you want me to quote the third?', mood: 'SMUG' },
      { t: 'narr', text: 'Only two people have seen your drafts. You are one of them.' },
      { t: 'choice', id: 'c08_biko_ask', prompt: 'Biko is at the door with a flask of tea and an expression you cannot read.', options: [
        { id: 'ask', label: 'Ask him straight: "Who else reads my drafts?"', hint: 'You may not like the answer.', effects: { flags: ['asked_biko'] } },
        { id: 'wait', label: 'Say nothing. Watch him.', hint: 'You want to see what he does when he thinks you are not looking.', effects: { coker: 1, flags: ['watched_biko'] } }
      ] }
    ]
  },
  plot: [
    {
      id: 'plot_c08_rule', day: 2, archetype: 'SECURITY_WIRE', stamp: 'THE BLACKOUT', headline: 'The Whole City Goes Dark',
      body: 'No power for three days, they say. Social channels run at half power: no data, no towers, no signal worth the name. The Heat starts high, because every man with a generator has a theory about you.',
      choices: [
        { id: 'go', label: 'Work in the dark', detail: 'Social at half power for the whole case • +30% Heat', effects: [{ kind: 'heat', amount: 30 }, { kind: 'timed', effectKind: 'BRANCH_MULT', days: 40, mult: 0.5, label: 'Blackout', branch: 'SOCIAL' }], story: {} }
      ]
    },
    {
      id: 'plot_c08_generator', day: 5, archetype: 'SECURITY_WIRE', stamp: 'GENERATOR HOUSE', headline: 'The Power Cut at the Generator House',
      body: 'A man in an agbada is standing in the generator house behind HRP\'s building. He is looking at a phone. The screen is lit with your page. Biko is nowhere in sight.',
      choices: [
        { id: 'photo', label: 'Photograph him from the car park', detail: '+10% Investigation • +6% Heat', effects: [{ kind: 'investigation', amount: 10 }, { kind: 'heat', amount: 6 }], story: { coker: 1, flags: ['photographed_generator'] } },
        { id: 'wait', label: 'Wait for him to leave', detail: '+6% Investigation • -3% Heat', effects: [{ kind: 'investigation', amount: 6 }, { kind: 'heat', amount: -3 }], story: { flags: ['waited_generator'] } },
        { id: 'leave', label: 'Walk away. Not tonight.', detail: '-5% Heat', effects: [{ kind: 'heat', amount: -5 }], story: { integrity: 1 } }
      ]
    },
    {
      id: 'plot_c08_car', day: 9, archetype: 'STREET_WHISPER', stamp: 'THE CAR', headline: 'A Skit Crew Blocks the Road',
      body: 'The car behind you has been matching your turns for six streets. Then, at a red light, a full crew in matching hoodies pours into the road: a famous skit-maker, Mr. Macaroony, filming a "chase scene" for content. He sees you. He sees the car. He raises one eyebrow and starts the camera.',
      choices: [
        { id: 'lose', label: 'Use the crew to lose the car', detail: '-8% Heat • the clip goes viral', effects: [{ kind: 'heat', amount: -8 }, { kind: 'freshness', amount: 10 }], story: { flags: ['skit_cameo'] } },
        { id: 'confront', label: 'Get out. Face the car.', detail: '+12% Investigation • +8% Heat', effects: [{ kind: 'investigation', amount: 12 }, { kind: 'heat', amount: 8 }], story: { coker: 1, flags: ['faced_the_car'] } },
        { id: 'record', label: 'Record the plate through the windscreen', detail: '+8% Investigation', effects: [{ kind: 'investigation', amount: 8 }], story: { flags: ['got_plate'] } }
      ]
    },
    {
      id: 'plot_c08_door', day: 13, archetype: 'SECURITY_WIRE', stamp: 'THE DOOR', headline: 'A Locked Door With Your Name on It',
      body: 'The back office at HRP is locked from the outside. Somebody has taped a note to it, in handwriting you know better than your own: "I wouldn\'t, boss." You did not tell anyone where you would be.',
      choices: [
        { id: 'force', label: 'Break the lock', detail: '+16% Investigation • +10% Heat', effects: [{ kind: 'investigation', amount: 16 }, { kind: 'heat', amount: 10 }], story: { coker: 1, flags: ['broke_in'] } },
        { id: 'call', label: 'Call Biko', detail: 'No answer. -4% Heat', effects: [{ kind: 'heat', amount: -4 }], story: { flags: ['called_biko'] } },
        { id: 'photo', label: 'Photograph the note and leave', detail: '+8% Investigation • -3% Heat', effects: [{ kind: 'investigation', amount: 8 }, { kind: 'heat', amount: -3 }], story: {} }
      ]
    }
  ],
  won: {
    id: 'c08.won',
    beats: [
      { t: 'cold', text: 'Tuesday. 3:51 AM.', time: 'The lights come back on.' },
      { t: 'still', cam: 'HRP  •  GENERATOR HOUSE  •  CAM 4', time: '21:34:19  (the night of the blackout)', caption: 'A man in an agbada, looking at a phone.', detail: 'The screen is lit with your page. At the edge of the frame, in a hoodie you know very well: Biko.' },
      { t: 'clue', id: 'C12' },
      { t: 'doc', kind: 'receipt', title: 'MONTHLY RETAINER  •  HRP SHELL CO.', lines: [
        'To:  BIKO ADEWALE',
        'Amount:  ₦40,000',
        'Reason:  "Research Support"',
        'Since:  your first month together'
      ], mark: [0, 3], shake: true },
      { t: 'clue', id: 'C11' },
      { t: 'narr', text: 'A hundred and eighty-two payments. Every one on the first of the month. Every one small enough not to matter, and regular enough to buy a nineteen-year-old a year of school fees.' },
      { t: 'say', who: 'biko', text: 'Boss. I can explain.', mood: 'PANIC' },
      { t: 'say', who: 'biko', text: 'It was school fees. They said it was research. They said you would never get hurt. They said you were their best, and they just wanted to watch over you.', mood: 'DEFEATED' },
      { t: 'choice', id: 'c08_biko', prompt: 'He is standing in front of you. He is crying. He has been in your life for three years. What do you do?', options: [
        { id: 'fire', label: 'Fire him.', hint: 'Walk him out. Change every password. Learn to work alone.', effects: { trust: -3, integrity: 1, flags: ['biko_fired'] } },
        { id: 'forgive', label: 'Forgive him. Ask him everything.', hint: 'He knows things nobody else knows. Make him choose a side.', effects: { trust: 3, flags: ['biko_forgiven'] } },
        { id: 'use', label: 'Use him. Feed him stories to carry back.', hint: 'It is cruel. It might also be the cleverest thing you have ever done.', effects: { trust: -1, integrity: -1, coker: 1, flags: ['biko_used'] } }
      ] },
      { t: 'say', who: 'biko', text: 'I never told them anything that hurt you, boss. Until Thursday.', mood: 'DEFEATED', when: { flag: 'biko_forgiven' } },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'I never told them anything that hurt you, boss.' },
        { from: 'biko', text: 'Until Thursday.' }
      ], when: { flag: 'biko_fired' }, shake: true },
      { t: 'say', who: 'biko', text: 'I never told them anything that hurt you, boss. Until Thursday. I\'ll tell them whatever you say. I promise.', mood: 'WORRIED', when: { flag: 'biko_used' }, shake: true },
      { t: 'narr', text: 'Thursday. Four days ago. The day of the draft about HRP. The day somebody started following the car.' }
    ]
  },
  lost: { id: 'c08.lost', beats: [
    { t: 'cold', text: 'Wednesday. 4:00 AM.', time: 'The power comes back, and so does everything he had on you.' },
    { t: 'narr', text: 'The man in the car has your address, your drafts and your mother\'s number. Biko stays up with you until the sun rises. He will not say what he is sorry for.' }
  ] }
};

export const ACT2: Record<string, ChapterScript> = { c05: C05, c06: C06, c07: C07, c08: C08 };
