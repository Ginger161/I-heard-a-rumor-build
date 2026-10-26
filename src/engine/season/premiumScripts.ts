import type { ChapterScript } from './types';

// PREMIUM GIST: three bonus episodes (Gist Pass). None is needed to understand the ending; each makes it richer.
//   px1 "Lecture Hall 4"  Biko's night, during Chapter 8's blackout (opens after Chapter 8).
//   px2 "Year Zero"       You at 24, the night of Block C: the first "Peace and light" (opens after Chapter 11). Hides the bonus clue C25.
//   px3 "The Oracle"      Fola, the desk by the window, the night she sent the first receipt (opens after Chapter 12).
// Finishing each sets a flag (ep_biko, ep_year_zero, ep_oracle) that adds a few lines to the finale and the endings.

// ---------------------------------------------------------------------------------------------------------------------
const PX1: ChapterScript = {
  pre: {
    id: 'px1.pre',
    beats: [
      { t: 'cold', text: 'Saturday. 8:50 PM.', time: 'Lecture Hall 4. You are nineteen. This is your side of the night.' },
      { t: 'narr', text: 'Two hundred students, one generator, three working sockets. Somebody is revising for a test they will fail. Somebody is eating a whole roasted corn without sharing. You are at the back, on the bench nobody wants, with your boss\'s drafts on one phone and your handler\'s number on the other.' },
      { t: 'doc', kind: 'receipt', title: 'FIRST PAYMENT  •  three years ago', lines: [
        'To:  BIKO ADEWALE',
        'Amount:  ₦40,000',
        'Reason:  "Research Support"',
        'Balance of your school fees:  ₦0'
      ], mark: [1, 3] },
      { t: 'narr', text: 'That was the day the bursar\'s queue was four hours long. A man in a very clean shirt said he could "help". You said yes before you understood what you were saying yes to.' },
      { t: 'say', who: 'target', text: 'Biko. It is nine o\'clock. Anything we should know?', mood: 'SMUG' },
      { t: 'chat', title: 'Boss', msgs: [
        { from: 'you', text: 'boss where are you' },
        { from: 'biko', text: '(you typed it. you have not sent it.)' },
        { from: 'biko', text: '(you have typed it eleven times tonight.)' }
      ] },
      { t: 'narr', text: 'Eleven times. You have the whole sentence in your thumbs: "Boss, I need to tell you something." You have never sent it. Tonight, the lights are out, the city is dark, and nobody can see your screen.' },
      { t: 'choice', id: 'px1_call', prompt: 'The call comes in. Everybody in the row can hear it buzz.', timer: 20, fallback: 'answer', options: [
        { id: 'answer', label: 'Step outside. Pick up.', hint: 'It is what you always do. It is also what he is counting on.', effects: { flags: ['px1_answered'] } },
        { id: 'decline', label: 'Decline the call. For the first time in three years.', hint: 'He will notice. You do not yet know what he does when he notices.', effects: { coker: 1, flags: ['px1_declined'] } }
      ] }
    ]
  },
  plot: [
    {
      id: 'plot_px1_rule', day: 2, archetype: 'SECURITY_WIRE', stamp: 'THE BLACKOUT', headline: 'The Hostels Go Dark',
      body: 'No power in the hostels, no data on the campus network. Social channels run at half power for the whole case, and every call you take outside is one more person who sees you take it.',
      choices: [
        { id: 'go', label: 'Work from the lecture hall', detail: 'Social at half power • +15% Heat', effects: [{ kind: 'heat', amount: 15 }, { kind: 'timed', effectKind: 'BRANCH_MULT', days: 40, mult: 0.5, label: 'Blackout', branch: 'SOCIAL' }], story: {} }
      ]
    },
    {
      id: 'plot_px1_call', day: 6, archetype: 'INFORMANT_TIP', stamp: 'THE CALL', headline: 'He Asks a Second Question',
      body: '"Anything we should know?" he says. And then, very gently: "About the draft. The one with the Compound in it. We would like to see it before she posts." You have it on your phone. It is in your hand.',
      choices: [
        { id: 'lie', label: 'Lie. Say there is no such draft', detail: '-6% Heat • +6% Investigation', effects: [{ kind: 'heat', amount: -6 }, { kind: 'investigation', amount: 6 }], story: { flags: ['px1_lied'] } },
        { id: 'half', label: 'Send him a harmless old draft', detail: '+10% Investigation • +4% Heat', effects: [{ kind: 'investigation', amount: 10 }, { kind: 'heat', amount: 4 }], story: { flags: ['px1_decoy'] } },
        { id: 'truth', label: 'Send him the real one', detail: '+14 Freshness • +10% Heat', effects: [{ kind: 'freshness', amount: 14 }, { kind: 'heat', amount: 10 }], story: { integrity: -1, flags: ['px1_sent_real'] } }
      ]
    },
    {
      id: 'plot_px1_bursar', day: 10, archetype: 'VIRAL_RECEIPT', stamp: 'THE BURSAR\'S RECEIPT', headline: 'A Friend in the Bursar\'s Office',
      body: 'A girl from your faculty works the bursar\'s window. She has just found the ledger of everyone on a "research support" list: forty-one names, three years of ₦40,000. Yours is the first.',
      choices: [
        { id: 'take', label: 'Take the ledger', detail: '+16% Investigation • +8% Heat', effects: [{ kind: 'investigation', amount: 16 }, { kind: 'heat', amount: 8 }], story: {} },
        { id: 'leave', label: 'Ask her to forget she saw it', detail: '-6% Heat', effects: [{ kind: 'heat', amount: -6 }], story: {} }
      ]
    }
  ],
  won: {
    id: 'px1.won',
    beats: [
      { t: 'cold', text: 'Sunday. 6:00 AM.', time: 'The generator has stopped. The hall is empty. You are still on the bench.' },
      { t: 'narr', text: 'Forty-one names, and every one of them is a student, and every one of them took the same small, quiet money for the same small, quiet reason. You are not the only one he rang at nine. You were just the one he rang first.' },
      { t: 'chat', title: 'Boss', msgs: [
        { from: 'biko', text: 'boss' },
        { from: 'biko', text: 'I need to tell you something' },
        { from: 'biko', text: '(typing...)' }
      ] },
      { t: 'choice', id: 'px1_tell', prompt: 'Your thumb is over the send button. You have typed this sentence eleven times. This is the twelfth.', options: [
        { id: 'send', label: 'Send it.', hint: 'Tell her everything. Right now. Before the sun comes up.', effects: { trust: 1, flags: ['px1_sent'] } },
        { id: 'hold', label: 'Put the phone away. Not tonight.', hint: 'You will tell her. You will definitely tell her. Soon.', effects: { trust: -1, flags: ['px1_held'] } }
      ] },
      { t: 'narr', text: 'You send it. The delivery tick is grey. It stays grey for a long time. Then the sun comes up and she is, apparently, awake.', when: { flag: 'px1_sent' } },
      { t: 'narr', text: 'You put the phone away. It is the correct decision, you tell yourself. It will be the most expensive decision of your life.', when: { flag: 'px1_held' } },
      { t: 'say', who: 'biko', text: 'I almost told her that night. I really did. I typed it. I just never pressed the button.', mood: 'DEFEATED' },
      { t: 'narr', text: 'On Thursday, four days later, he will. Just not to her.' }
    ],
    onEnd: { flags: ['ep_biko'] }
  },
  lost: { id: 'px1.lost', beats: [
    { t: 'cold', text: 'Sunday. 3:00 AM.', time: 'The generator cuts out.' },
    { t: 'narr', text: 'The phone rings at nine, as it has every night for three years. You pick up. "Anything we should know?" "No," you say. Your voice does not sound like yours.' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
const PX2: ChapterScript = {
  pre: {
    id: 'px2.pre',
    beats: [
      { t: 'cold', text: 'Six years ago.', time: 'The fourteenth floor. A Tuesday afternoon. You are twenty-four.' },
      { t: 'news', channel: 'CHANNELS TV  •  BREAKING', headline: 'BLOCK C COLLAPSES IN LEKKI. Residents trapped. Rescue ongoing.', ticker: 'The estate was not yet occupied. It was nearly occupied. Eleven people were inside.' },
      { t: 'narr', text: 'You are the best junior in the building. You have been at Halo Reputation Partners for fourteen months. You are very proud of this. Your desk is by the window, and you can see the lagoon, and you have never once looked at it.' },
      { t: 'say', who: 'halo', text: 'It is a terrible thing, my dear. A very terrible thing. The client is devastated. We must help him, and we must help the people who are grieving. Come, sit.', mood: 'CONFIDENT' },
      { t: 'say', who: 'ngozi', text: 'You have not eaten. I have put a plate on your desk. You will feel better when there is rice in you.', mood: 'WORRIED' },
      { t: 'doc', kind: 'notes', title: 'THE BLOCK C FILE  •  your notes', lines: [
        'Client:  owns the land, the permits, the contractor.',
        'Contractor:  Mr. Kayode Alabi.  Poured to spec.',
        'Spec:  changed on a Thursday. By the client. Saves ₦400M.',
        'Public:  looking for a name.'
      ], mark: [2, 3] },
      { t: 'say', who: 'halo', text: 'We are not lying, my dear. We are choosing which truth the public gets to hold. There is a contractor. There is a foundation. There is a building that fell. That is all true. What shall we say first?', mood: 'SMUG' },
      { t: 'narr', text: 'You are twenty-four. You think this is what the job is. You think the job is to be very, very good at the thing you were hired to do. You do not yet know that you are very good at it because it is very easy.' },
      { t: 'choice', id: 'px2_first', prompt: 'Halo is looking at you. The file is on your desk. Where do you start?', timer: 25, fallback: 'cement', options: [
        { id: 'cement', label: 'Start with the cement. It is simple and visual.', hint: 'It writes itself. It is also the lie of omission that will follow you for six years.', effects: { flags: ['px2_cement'] } },
        { id: 'thursday', label: 'Ask about the Thursday.', hint: 'It is the question you were not hired to ask.', effects: { integrity: 1, flags: ['px2_asked_thursday'] } }
      ] }
    ]
  },
  plot: [
    {
      id: 'plot_px2_press', day: 5, archetype: 'BREAKING_FRONT', stamp: 'A REPORTER CALLS', headline: 'A Reporter Asks About the Thursday',
      body: 'A young reporter at a small paper has noticed that the spec was revised. She calls you directly, not Halo. She sounds exactly like you. She is twenty-six and has never had a corner office.',
      choices: [
        { id: 'deflect', label: 'Deflect. Offer her an exclusive on the contractor', detail: '+10 Freshness • +6% Heat', effects: [{ kind: 'freshness', amount: 10 }, { kind: 'heat', amount: 6 }], story: { flags: ['px2_deflected'] } },
        { id: 'hold', label: 'Say you will call back. Do not', detail: '-4% Heat • +4% Cover-Up', effects: [{ kind: 'heat', amount: -4 }, { kind: 'coverUp', amount: 4 }], story: {} },
        { id: 'tell', label: 'Tell her to keep looking', detail: '+12% Investigation • +8% Heat', effects: [{ kind: 'investigation', amount: 12 }, { kind: 'heat', amount: 8 }], story: { integrity: 1, flags: ['px2_tipped_reporter'] } }
      ]
    },
    {
      id: 'plot_px2_wife', day: 9, archetype: 'STREET_WHISPER', stamp: 'HIS WIFE', headline: 'The Contractor\'s Wife Goes Quiet',
      body: 'She stands in the doorway of their house, with the children behind her, and says four sentences into a phone camera. She does not ask for anything. She does not accuse anybody. It is the most effective thing anybody has said all week.',
      choices: [
        { id: 'drown', label: 'Bury it under a bigger story', detail: '-8 ⚡ • +14 Freshness', cost: 8, effects: [{ kind: 'freshness', amount: 14 }], story: {} },
        { id: 'watch', label: 'Watch it. Say nothing', detail: '+6% Cover-Up • -4% Heat', effects: [{ kind: 'coverUp', amount: 6 }, { kind: 'heat', amount: -4 }], story: { integrity: 1 } }
      ]
    }
  ],
  won: {
    id: 'px2.won',
    beats: [
      { t: 'cold', text: 'Friday. 5:12 PM.', time: 'The contractor has stopped answering his phone.' },
      { t: 'narr', text: 'By the following week, a quiet clerk will tell a quiet newspaper that he has left the country. His wife will move to her mother\'s. His daughters will change schools. The estate will be rebuilt, by a different contractor, on a different spec, at a much higher cost, and nobody will ask why.' },
      { t: 'say', who: 'halo', text: 'You have done very well. Now, the client needs a statement. Something calm. Something sorry. Something the public can forgive. You write beautifully, my dear. I would like it by six.', mood: 'CONFIDENT' },
      { t: 'narr', text: 'It is 5:12 PM. You open a blank page on your phone. You are crying, and you do not know when you started.' },
      { t: 'choice', id: 'px2_write', prompt: 'You have fifty-four minutes. The cursor is blinking.', options: [
        { id: 'sign', label: 'Write the statement Halo asked for. Sign it.', hint: 'It will be perfect. It will be the best thing you have ever written.', effects: { integrity: -1, flags: ['px2_signed'] } },
        { id: 'refuse', label: 'Write the truth first. Then the statement.', hint: 'You will send the second one. You will keep the first one in a place only you know.', effects: { integrity: 1, flags: ['px2_refused'] } }
      ] },
      { t: 'doc', kind: 'draft', title: 'NOTES  •  saved 5:14 PM  •  (unsent)', lines: [
        'I cannot sign this.',
        'The building did not fall because of him.',
        'It fell because of a Thursday.',
        '(You do not send this. You do not delete it either.)'
      ], mark: [0, 2], shake: true, when: { flag: 'px2_refused' } },
      { t: 'clue', id: 'C25', when: { flag: 'px2_refused' } },
      { t: 'doc', kind: 'draft', title: 'NOTES  •  saved 6:06 PM  •  SENT', lines: [
        'Dear friends, family and the public,',
        'I want to address the allegations circulating about the Block C collapse.',
        'I take full responsibility. I ask for privacy at this difficult time.',
        'Peace and light. 🕊️'
      ], mark: [3], shake: true },
      { t: 'narr', text: 'It is the best thing you have ever written. It is posted at 6:06 PM, because that is when the client\'s driver will be at the door of the TV station. It is read by four million people before midnight. Four million people forgive a man who did not apologise.' },
      { t: 'narr', text: 'Nobody asks who wrote it. For the next six years, nobody asks.' }
    ],
    onEnd: { flags: ['ep_year_zero'] }
  },
  lost: { id: 'px2.lost', beats: [
    { t: 'cold', text: 'Monday. 9:00 AM.', time: 'The press has found the Thursday.' },
    { t: 'narr', text: 'The client is furious. Halo is calm, which is worse. "Again," he says. "Better this time." You do not sleep. You do not eat the rice.' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
const PX3: ChapterScript = {
  pre: {
    id: 'px3.pre',
    beats: [
      { t: 'cold', text: 'Thursday. 11:40 PM.', time: 'The fourteenth floor. Twenty-nine desks are empty. Yours is the thirtieth.' },
      { t: 'narr', text: 'There is a ringing in your left ear. You have not told anybody. It started when you were nineteen and it is the reason you type so fast: you cannot hear what you are not typing.' },
      { t: 'still', cam: '14TH FLOOR  •  THE ARCHIVE', time: '23:41:07', caption: 'A steel drawer marked "PRIOR STATEMENTS, A TO Z". The lock is, as always, not locked.', detail: 'Nobody has ever opened it for any reason except to find a template.' },
      { t: 'doc', kind: 'draft', title: 'THE FIRST STATEMENT  •  archive, drawer 1, folder 1', lines: [
        'Dear friends, family and the public,',
        'I want to address the allegations circulating about me.',
        'I take full responsibility. I ask for privacy.',
        'Peace and light. 🕊️',
        '(a date six years old. A set of initials. Not Halo\'s.)'
      ], mark: [3, 4], shake: true },
      { t: 'narr', text: 'It is the sentence you have been writing for two years. You thought Halo invented it. You are looking at the original, and the initials on it are not his.' },
      { t: 'say', who: 'ngozi', text: 'You are working late again, Fola. Eat something. I will bring you tea. And do not stay past midnight, darling, Ms. Fashola does the round.', mood: 'WORRIED' },
      { t: 'narr', text: 'Ms. Fashola walks the floor at midnight, with a torch. She has never caught anyone. She does not need to. She just arrives, and people stop.' },
      { t: 'choice', id: 'px3_take', prompt: 'The drawer is open. Your phone is in your hand. It is 11:44. What do you take?', timer: 25, fallback: 'photo', options: [
        { id: 'photo', label: 'Photograph the first statement. Put it back.', hint: 'Quick. Quiet. Reversible.', effects: { flags: ['px3_photo'] } },
        { id: 'folder', label: 'Take the whole folder.', hint: 'There is more in it. There is also nowhere to hide it.', effects: { coker: 1, flags: ['px3_folder'] } }
      ] }
    ]
  },
  plot: [
    {
      id: 'plot_px3_round', day: 5, archetype: 'SECURITY_WIRE', stamp: 'THE MIDNIGHT ROUND', headline: 'The Torch Is On the Fourteenth Floor',
      body: 'The lift opens. A beam of light moves slowly along the desks. It reaches yours. It lingers on the drawer. It does not move on.',
      choices: [
        { id: 'hide', label: 'Slide under the desk. Hold your breath', detail: '-8% Heat • -4% Investigation', effects: [{ kind: 'heat', amount: -8 }, { kind: 'investigation', amount: -4 }], story: {} },
        { id: 'work', label: 'Keep typing as if nothing is wrong', detail: '+8% Investigation • +6% Heat', effects: [{ kind: 'investigation', amount: 8 }, { kind: 'heat', amount: 6 }], story: { flags: ['px3_bold'] } }
      ]
    },
    {
      id: 'plot_px3_ngozi', day: 9, archetype: 'INFORMANT_TIP', stamp: 'MADAM NGOZI', headline: 'A Cup of Tea at Your Desk',
      body: 'Madam Ngozi has put a cup of tea on your desk, with two sugars, and a note: "I know you are doing something. I do not want to know what. Please be careful." She does not wait for an answer.',
      choices: [
        { id: 'thank', label: 'Drink the tea. Thank her with your eyes', detail: '+10% Investigation • -4% Heat', effects: [{ kind: 'investigation', amount: 10 }, { kind: 'heat', amount: -4 }], story: { trust: 1, flags: ['px3_ngozi_knew'] } },
        { id: 'ignore', label: 'Leave it to go cold', detail: '-4% Heat', effects: [{ kind: 'heat', amount: -4 }], story: {} }
      ]
    }
  ],
  won: {
    id: 'px3.won',
    beats: [
      { t: 'cold', text: 'Friday. 4:12 AM.', time: 'The first light is on the lagoon. You have not slept.' },
      { t: 'narr', text: 'You are in a danfo, going nowhere in particular. You have a scan of the first statement, a transfer receipt that was in the same drawer by accident, and a feeling in your chest that you have never had before. You do not know what it is. You think it might be your own opinion.' },
      { t: 'doc', kind: 'receipt', title: 'TRANSFER RECEIPT  •  ₦2,400,000', lines: [
        'From:  •••• 4417',
        'To:  •••• 9023',
        'Date:  14 March',
        'Ref:  7741-HRP-0'
      ], mark: [3] },
      { t: 'narr', text: 'It is the receipt for a man who owes a stranger a great deal of money, and who is about to be asked, very publicly, to give it back. You do not know the stranger. You know their page. You have read it every night for a year.' },
      { t: 'choice', id: 'px3_send', prompt: 'The account is called @TheReceipts. You have never messaged them. You are twenty-three, you are not brave, and your thumb is shaking.', options: [
        { id: 'send', label: 'Send it. Write: "You will want this."', hint: 'It is the first thing you have ever done that nobody asked for.', effects: { trust: 1, flags: ['px3_sent'] } },
        { id: 'wait', label: 'Not yet. Wait one more day.', hint: 'You will send it. You always send it. Just not today.', effects: { flags: ['px3_waited'] } }
      ] },
      { t: 'chat', title: 'DM  •  @TheReceipts', msgs: [
        { from: 'oracle', text: 'You will want this.' },
        { from: 'oracle', text: '📎 transfer_receipt.pdf' },
        { from: 'you', text: 'who is this?' },
        { from: 'oracle', text: 'Someone who thinks you should win.' }
      ], shake: true, when: { flag: 'px3_sent' } },
      { t: 'narr', text: 'You wait a day. Then, because waiting was never going to work, you send it. You still write: "You will want this."', when: { flag: 'px3_waited' } },
      { t: 'say', who: 'fola', text: 'I did not know who you were. I knew you were angry in the right direction. That was enough.', mood: 'NEUTRAL' },
      { t: 'narr', text: 'Years from now, in a room full of people who would not have been in the room without her, she will be handed a folded page. It is a draft, in your handwriting, addressed to a man you wronged six years ago. She will have found it herself. She will have kept it safe.' }
    ],
    onEnd: { flags: ['ep_oracle'] }
  },
  lost: { id: 'px3.lost', beats: [
    { t: 'cold', text: 'Friday. 12:02 AM.', time: 'The torch finds you.' },
    { t: 'narr', text: 'Ms. Fashola does not shout. She takes your pass and says: "Go home, Fola. I will tell Madam Ngozi you were tired." You are not sure whether that was kindness.' }
  ] }
};

export const PREMIUM_SCRIPTS: Record<string, ChapterScript> = { px1: PX1, px2: PX2, px3: PX3 };
