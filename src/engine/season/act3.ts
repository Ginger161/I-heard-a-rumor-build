import type { ChapterScript } from './types';

// ACT 3: HOME (chapters 9 to 11). The betrayals were arranged.
// Your in-laws, your marriage, your family's land. Each one, it turns out, was paid, pressured or placed. By the end of the act
// you hold a page in Halo's own handwriting, and the reason for every person you have ever exposed.
// Biko is written three ways in this act (fired, forgiven, used): lines carry `when` conditions so the chapter reads right for each.

// ---------------------------------------------------------------------------------------------------------------------
const C09: ChapterScript = {
  pre: {
    id: 'c09.pre',
    beats: [
      { t: 'cold', text: 'Saturday. 10:30 AM.', time: 'Detty December, in the village. Fifty relatives. Three generators. One extremely organised woman.' },
      { t: 'narr', text: 'Your wedding is in six weeks. You have not chosen the menu, the colours or the date. The Church Women’s Meeting has chosen all three, and has minuted it.' },
      { t: 'voice', from: 'Aunty Dupe (recording of the Meeting)', secs: 44, text: 'Item four. The bride’s thighs. We are not saying she is fat, we are saying she should be careful before the photographs. Item five. The honeymoon. Cancun is too far. Ibadan has a very nice hotel.' },
      { t: 'chat', title: 'FAMILY GROUP 🙏  (112 members)', msgs: [
        { from: 'm1', text: 'Good morning family. Reminder: the aso-ebi money is due Friday.' },
        { from: 'target', text: 'Please pray for those who are trying to destroy this union. I know who you are.' },
        { from: 'm2', text: 'Amen.' },
        { from: 'm3', text: 'Amen o.' }
      ] },
      { t: 'say', who: 'biko', text: 'Boss, I have been reading the group chat for twenty minutes. She types in full sentences. With commas. She is the most dangerous woman I have ever met.', mood: 'WORRIED', when: { notFlag: 'biko_fired' } },
      { t: 'narr', text: 'The seat next to you is empty. You keep turning to say something to nobody.', when: { flag: 'biko_fired' } },
      { t: 'say', who: 'target', text: 'My child, I am only thinking of the family. You are marrying into a good house. There are rules. They are in the notebook.', mood: 'SMUG' },
      { t: 'choice', id: 'c09_arrive', prompt: 'Fifty relatives are watching you cross the compound. How do you arrive?', timer: 20, fallback: 'greet', options: [
        { id: 'greet', label: 'Greet every elder, one by one. Kneel where required.', hint: 'It buys goodwill. It takes forty minutes.', effects: { integrity: 1, flags: ['c09_greeted'] } },
        { id: 'direct', label: 'Walk straight to her and ask about the notebook.', hint: 'She will deny it. Everybody will hear.', effects: { coker: 1, flags: ['c09_direct'] } }
      ] }
    ]
  },
  plot: [
    {
      id: 'plot_c09_prayer', day: 6, archetype: 'STREET_WHISPER', stamp: 'PRAYER CHAIN', headline: 'A 21-Day Fasting Prayer "Against Gossips" Begins',
      body: 'Forty aunties and one very loud uncle. The message has a purple border, nineteen emojis and your first name spelt wrong, on purpose. The prayer lists the exact things you have done and the exact things you should be ashamed of.',
      choices: [
        { id: 'laugh', label: 'Post a laughing emoji', detail: '+6 Freshness • +4% Heat', effects: [{ kind: 'freshness', amount: 6 }, { kind: 'heat', amount: 4 }], story: { coker: 1 } },
        { id: 'join', label: 'Join the prayer. Quietly record it.', detail: '+12% Investigation • -4% Heat', effects: [{ kind: 'investigation', amount: 12 }, { kind: 'heat', amount: -4 }], story: { integrity: 1, flags: ['joined_prayer'] } },
        { id: 'mute', label: 'Mute the group', detail: '-5% Heat • -6 Freshness', effects: [{ kind: 'heat', amount: -5 }, { kind: 'freshness', amount: -6 }], story: {} }
      ]
    },
    {
      id: 'plot_c09_meeting', day: 11, archetype: 'TARGET_PR', stamp: 'FAMILY MEETING', headline: 'A Family Meeting Is Called for Sunday',
      body: 'Sunday. After church. In the big sitting room. Everyone will be there, and your name is already on the agenda, two lines above "refreshments".',
      choices: [
        { id: 'prepare', label: 'Prepare a short, calm statement', detail: '-10 ⚡ • +8 Freshness • -4% Heat', cost: 10, effects: [{ kind: 'freshness', amount: 8 }, { kind: 'heat', amount: -4 }], story: { integrity: 1 } },
        { id: 'ambush', label: 'Bring the recording to play at the meeting', detail: '+14% Investigation • +6% Heat', effects: [{ kind: 'investigation', amount: 14 }, { kind: 'heat', amount: 6 }], story: { coker: 1, flags: ['planned_ambush'] } },
        { id: 'skip', label: 'Say you are sick', detail: '+5% Cover-Up', effects: [{ kind: 'coverUp', amount: 5 }], story: {} }
      ]
    }
  ],
  won: {
    id: 'c09.won',
    beats: [
      { t: 'cold', text: 'Sunday. 5:40 PM.', time: 'After the family meeting. The generators have gone quiet.' },
      { t: 'narr', text: 'She leaves the sitting room for four minutes to bless the rice. The notebook is on the table. A school exercise book with a cracked blue cover and the words: PRIVATE. NOT FOR CHILDREN.' },
      { t: 'doc', kind: 'ledger', title: 'THE NOTEBOOK  •  page 31  •  "RECEIVED"', lines: [
        'Jan  —  H.R.P.  —  ₦150,000  (for the wedding)',
        'Feb  —  H.R.P.  —  ₦150,000  (for the aso-ebi)',
        'Mar  —  H.R.P.  —  ₦150,000  (for the prayer)',
        '...',
        'Six years. The first entry: the month you left Halo.'
      ], mark: [0, 1, 4], shake: true },
      { t: 'clue', id: 'C13' },
      { t: 'narr', text: 'Not a favour. Not a loan. A salary. For what, exactly, she has not written. She has written the date of every payment, in a neat hand, with the blessing of a woman who would never take a kobo she had not earned.' },
      { t: 'say', who: 'biko', text: 'Boss. H.R.P. Again. She has been on their payroll for six years. Longer than I have.', mood: 'WORRIED', when: { flag: 'biko_forgiven' } },
      { t: 'say', who: 'biko', text: 'Boss. It is the same three letters. I am not going to lie to you again: I am scared.', mood: 'WORRIED', when: { flag: 'biko_used' } },
      { t: 'choice', id: 'c09_notebook', prompt: 'The notebook is in your hands. She is coming back down the corridor.', options: [
        { id: 'confront', label: 'Confront her with it, in front of the family.', hint: 'It will humiliate her. It will make you the villain of the village.', effects: { integrity: -1, coker: 1, flags: ['confronted_in_law'] } },
        { id: 'photo', label: 'Photograph every page. Put it back.', hint: 'She never knows. You keep the receipts.', effects: { integrity: 1, flags: ['photographed_notebook'] } }
      ] },
      { t: 'say', who: 'target', text: 'It is for the family. Dr. Halo is a very generous man. He said you were a bit lost, and that I was to look after you.', mood: 'PANIC', when: { flag: 'confronted_in_law' } },
      { t: 'narr', text: 'You put the notebook back exactly as it was. The corner of the cover slightly turned. The way she likes it.', when: { flag: 'photographed_notebook' } },
      { t: 'doc', kind: 'ledger', title: 'THE NOTEBOOK  •  last page', lines: [
        'Names. Each with a small tick.',
        '✓  A. Fasasi',
        '✓  T. Lawal-Smith',
        '✓  D. Kalu',
        '✓  I. Bamidele',
        '✓  C. Eze',
        '☐  [YOUR NAME]'
      ], mark: [6], shake: true },
      { t: 'narr', text: 'Every name on the list has a tick. Yours is at the bottom. It is not ticked. Whatever she was paid to do, she has not finished.' }
    ]
  },
  lost: { id: 'c09.lost', beats: [
    { t: 'cold', text: 'Not this time.', time: 'The family has spoken.' },
    { t: 'narr', text: 'The meeting votes, with great sorrow, that you are "too stressed". Your wedding menu is changed to jollof, moi-moi and no opinion at all.' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
const C10: ChapterScript = {
  pre: {
    id: 'c10.pre',
    beats: [
      { t: 'cold', text: 'Monday. 9:10 AM.', time: 'Family Court, Ikeja. Everybody here used to love somebody.' },
      { t: 'narr', text: 'Eighteen months of marriage. The divorce was meant to be simple. Then you found out the house, or the savings, had moved to a relative two weeks before the filing.' },
      { t: 'doc', kind: 'court', title: 'IN THE FAMILY COURT OF LAGOS STATE', lines: [
        'Petition No. FC/IKJ/118/24',
        'Petitioner:  [YOU]',
        'Respondent:  [YOUR EX]',
        'Matter:  Dissolution and settlement of property',
        'Adjournment:  3 weeks (at the Respondent\'s request)'
      ], mark: [4] },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss they have a lawyer. a REAL lawyer. his tie has a crest' },
        { from: 'biko', text: 'the email footer says Halo Legal Partners' },
        { from: 'biko', text: 'I\'m not lying to you any more. I\'m telling you what I see.' }
      ], when: { notFlag: 'biko_fired' } },
      { t: 'chat', title: 'WHATSAPP  •  Zainab Lawal', msgs: [
        { from: 'zainab', text: 'I am in Court 4. You are not here, are you?' },
        { from: 'zainab', text: 'The man at the front has a very good tie. The woman beside him has, I think, a hidden camera. Be careful.' }
      ] },
      { t: 'say', who: 'target', text: 'We were two reasonable adults. You made it into a spectacle. I only ever wanted to be fair.', mood: 'SMUG' },
      { t: 'choice', id: 'c10_hearing', prompt: 'The judge looks up. You are asked whether you wish to speak.', timer: 25, fallback: 'speak', options: [
        { id: 'speak', label: 'Speak. Calmly. Facts only.', hint: 'It gives the judge something to remember.', effects: { integrity: 1, flags: ['c10_spoke'] } },
        { id: 'silent', label: 'Say nothing. Let counsel speak.', hint: 'It keeps your voice off the record.', effects: { coker: -1, flags: ['c10_silent'] } }
      ] }
    ]
  },
  plot: [
    {
      id: 'plot_c10_ex_parte', day: 7, archetype: 'TARGET_PR', stamp: 'EX-PARTE ORDER', headline: 'A Motion Lands on a Friday Afternoon',
      body: 'The order is stamped, signed and dated last Thursday. Nobody can find the hearing. It restrains "any person or page" from "publishing material relating to the property". It is nine pages long and very sure of itself.',
      choices: [
        { id: 'comply', label: 'Comply. Take the legal route', detail: '-8% Heat • +6% Investigation', effects: [{ kind: 'heat', amount: -8 }, { kind: 'investigation', amount: 6 }], story: { integrity: 1 } },
        { id: 'challenge', label: 'Have it set aside', detail: '-12 ⚡ • +10% Investigation', cost: 12, effects: [{ kind: 'investigation', amount: 10 }], story: { trust: 1 } },
        { id: 'ignore', label: 'Publish anyway', detail: '+14 Freshness • +10% Heat', effects: [{ kind: 'freshness', amount: 14 }, { kind: 'heat', amount: 10 }], story: { coker: 1, flags: ['ignored_order'] } }
      ]
    }
  ],
  won: {
    id: 'c10.won',
    beats: [
      { t: 'cold', text: 'Thursday. 3:20 PM.', time: 'The judge has adjourned for judgment. The corridor smells of air freshener and regret.' },
      { t: 'doc', kind: 'court', title: 'MARRIAGE SETTLEMENT  •  clause 14(c)', lines: [
        'Signed:  both parties, 12 March',
        'Clause 14(c):  "In the event of a separation, the Petitioner shall publish nothing."',
        'Typeface:  different from the rest of the document',
        'Notarised by:  Barr. T. Adebisi',
        'Panel:  Halo Legal Partners'
      ], mark: [1, 2, 4], shake: true },
      { t: 'clue', id: 'C14' },
      { t: 'narr', text: 'A clause nobody read to you. A sentence that was typed after the signing, in a different font, by a lawyer who works for the man whose sign-off has been following you since the first chapter.' },
      { t: 'say', who: 'zainab', text: 'I have been reporting on that panel for four years. I have never once been able to prove who they work for. You have just handed me a sentence in a different font.', mood: 'NEUTRAL' },
      { t: 'choice', id: 'c10_clause', prompt: 'The clause was a weapon, aimed at you. It is also the only proof that your marriage was part of the plan. What do you do?', options: [
        { id: 'public', label: 'Use the clause in public.', hint: 'The whole country will know. It will humiliate you both.', effects: { integrity: -1, coker: 1, flags: ['clause_public'] } },
        { id: 'private', label: 'Take it to your ex, alone. Offer a way out.', hint: 'It might save them. It might not.', effects: { integrity: 1, trust: 1, flags: ['clause_private'] } }
      ] },
      { t: 'narr', text: 'You stand in an empty corridor with a photocopy of your own marriage and a very bad feeling.' },
      { t: 'say', who: 'target', text: 'I did not leave you. I was told what would happen if I stayed.', mood: 'DEFEATED', shake: true }
    ]
  },
  lost: { id: 'c10.lost', beats: [
    { t: 'cold', text: 'Not this time.', time: 'The settlement is signed.' },
    { t: 'narr', text: 'Your ex gets the house. You get the sofa, the fridge and a letter on very thick paper telling you not to speak of any of it. It is typed in a font that is very slightly too calm.' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
const C11: ChapterScript = {
  pre: {
    id: 'c11.pre',
    beats: [
      { t: 'cold', text: 'Thursday. 4:15 PM.', time: 'Harmattan. Dust in the air, dust in the throat.' },
      { t: 'narr', text: 'The compound where you grew up has a "FOR SALE" board nailed to the gate. Your mother is standing next to it, holding the end of her wrapper like a flag.' },
      { t: 'voice', from: 'Mama', secs: 23, text: 'They said the bulldozers come on Monday. They said your uncle signed the paper. I told them your uncle has never signed anything without a goat. Please come home. Please.' },
      { t: 'still', cam: 'COMPOUND  •  GATE', time: '16:15:02', caption: 'A woman of sixty-three. A gate. A For Sale board with a phone number.', detail: 'The phone number belongs to an agent in Abuja. Not the uncle.' },
      { t: 'say', who: 'target', text: 'I am the family head. The land belongs to the family. The family is me. The paper is signed. The goat has been eaten.', mood: 'SMUG' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss. he has a chieftaincy title. from a village with no chief. I checked.' },
        { from: 'biko', text: 'there\'s a second buyer. same land. same week.' }
      ], when: { notFlag: 'biko_fired' } },
      { t: 'chat', title: 'DM  •  burner number', msgs: [
        { from: 'fola', text: 'There is a second buyer. Same land. Same week.' },
        { from: 'fola', text: 'I\'m only telling you because he is not on the list.' },
        { from: 'fola', text: 'He was added after.' }
      ], when: { flag: 'biko_fired' } },
      { t: 'choice', id: 'c11_elders', prompt: 'The elders have gathered under the mango tree. They will not let you speak unless you kneel.', timer: 25, fallback: 'kneel', options: [
        { id: 'kneel', label: 'Kneel. Greet them properly. Then speak.', hint: 'It costs your pride. It buys you a hearing.', effects: { integrity: 1, flags: ['c11_kneeled'] } },
        { id: 'stand', label: 'Stand. Speak to them as equals.', hint: 'They will remember it. For better or worse.', effects: { coker: 1, flags: ['c11_stood'] } }
      ] }
    ]
  },
  plot: [{
    id: 'plot_c11_elders', day: 5, archetype: 'STREET_WHISPER', stamp: 'THE ELDERS SIT', headline: 'A Kolanut Is Broken',
    body: 'The elders have decided. Whoever speaks of the land again outside the compound walls is "cursed". Your phone goes quiet. The village does not want a scandal. The village wants its goat back.',
    choices: [
      { id: 'respect', label: 'Respect the decision. Work inside the walls', detail: '-6% Heat • +10% Investigation', effects: [{ kind: 'heat', amount: -6 }, { kind: 'investigation', amount: 10 }], story: { integrity: 1 } },
      { id: 'defy', label: 'Speak anyway', detail: '+16 Freshness • +10% Heat', effects: [{ kind: 'freshness', amount: 16 }, { kind: 'heat', amount: 10 }], story: { coker: 1 } },
      { id: 'mother', label: 'Ask your mother to speak', detail: '+8% Investigation • -3% Heat', effects: [{ kind: 'investigation', amount: 8 }, { kind: 'heat', amount: -3 }], story: { trust: 1 } }
    ]
  }],
  won: {
    id: 'c11.won',
    beats: [
      { t: 'cold', text: 'Saturday. 2:00 AM.', time: 'The compound is asleep. Your uncle\'s study is not.' },
      { t: 'doc', kind: 'court', title: 'DEED OF ASSIGNMENT  •  the compound', lines: [
        'Executed:  14 June (backdated)',
        'Seller:  your uncle',
        'Notarised by:  Barr. T. Adebisi',
        'Panel:  Halo Legal Partners'
      ], mark: [0, 2, 3], shake: true },
      { t: 'clue', id: 'C15' },
      { t: 'narr', text: 'The same notary. The same panel. The same font, and the same neat little flourish on the final "e". He is not just on the same list as your ex, your boss and your spouse. He is on the same page.' },
      { t: 'narr', text: 'Behind the deed, taped to the back of a drawer, folded very small: a single page of lined paper. You know the handwriting. You know it better than your own.' },
      { t: 'doc', kind: 'ledger', title: 'LEDGER  •  H.A.  •  page 114', lines: [
        'PROJECT MIRROR  —  YEAR 4',
        'SUBJECT: THE RECEIPTS',
        'Funnel:  [ex] done   [cheater] done   [bestie] done',
        '[colleague] done   [boss] done   [partner] done',
        '[in-law] done   [spouse] done   [uncle] — today',
        'Status:  ON TRACK'
      ], mark: [0, 1, 5], shake: true },
      { t: 'clue', id: 'C16' },
      { t: 'narr', text: 'The Subject. The funnel. Every person you have ever exposed. Every one of them was a step on a staircase somebody built, and you climbed it, thanking them for each rung.' },
      { t: 'say', who: 'biko', text: 'Boss. They did not just watch you. They built you. Everyone you were angry at was a brick.', mood: 'PANIC', when: { notFlag: 'biko_fired' } },
      { t: 'chat', title: 'DM  •  burner number', msgs: [
        { from: 'fola', text: 'I saw that page six months ago.' },
        { from: 'fola', text: 'I did not know what it was. I do now.' },
        { from: 'fola', text: 'I am so sorry.' }
      ], when: { flag: 'biko_fired' } },
      { t: 'pause', ms: 1200 },
      { t: 'doc', kind: 'ledger', title: 'LEDGER  •  H.A.  •  bottom of the page', lines: [
        'In the same handwriting, in a different pen:',
        '"The Subject will find this page first.',
        'That is the point."'
      ], mark: [1, 2], shake: true },
      { t: 'narr', text: 'He knew you would find it. He wanted you to. You are standing in your uncle\'s study, in the dark, holding the proof that somebody loves you very much, and that it is the most frightening thing that has ever happened.' }
    ]
  },
  lost: { id: 'c11.lost', beats: [
    { t: 'cold', text: 'Monday. 6:30 AM.', time: 'The bulldozers arrive.' },
    { t: 'narr', text: 'Your mother stands at the gate with her wrapper in both hands. The elders have announced that the matter is closed. Your uncle sends a goat to the gate, with a note: "For your trouble."' }
  ] }
};

export const ACT3: Record<string, ChapterScript> = { c09: C09, c10: C10, c11: C11 };
