import type { ChapterScript, Scene } from './types';

// ACT 1: THE RECEIPTS (chapters 1 to 4). The hook and the rules of the season.
// Who you are, what you notice, and the first time someone hands you a story you did not ask for.
// (The set-up text and the win/lose epilogues that already existed for each chapter are still played; these scenes sit around them.)

// ---------------------------------------------------------------------------------------------------------------------
export const PROLOGUE: Scene = {
  id: 'prologue',
  beats: [
    { t: 'cold', text: '6:06 PM.', time: 'Lagos. A Tuesday you will remember for the rest of your life.' },
    { t: 'narr', text: 'Your phone buzzes once. Not a call. A screenshot, in the format everyone in this city has learned to recognise.' },
    { t: 'doc', kind: 'draft', title: 'NOTES  •  STATEMENT', lines: [
      'Dear friends, family and the public,',
      'I want to address the allegations circulating about the owner of The Receipts.',
      'I have never wished to hurt anyone. I have only ever wished to be honest.',
      'If I have caused pain, I am deeply sorry. Healing is a journey and I am walking it.',
      'I ask for privacy at this difficult time.',
      'Peace and light. 🕊️'
    ], mark: [5] },
    { t: 'chat', title: 'Biko', msgs: [
      { from: 'biko', text: 'boss' },
      { from: 'biko', text: 'are you seeing this' },
      { from: 'biko', text: 'someone wrote your apology' },
      { from: 'biko', text: 'it hasn\'t been posted anywhere. it came to YOUR phone. from YOUR number.' }
    ] },
    { t: 'say', who: 'biko', text: 'Boss. You haven\'t done anything yet.', mood: 'WORRIED' },
    { t: 'pause', ms: 900 },
    { t: 'doc', kind: 'draft', title: 'NOTES  •  STATEMENT  •  (the rest)', lines: [
      '…and I take full responsibility for everything I am about to do,',
      'and for everyone I am about to hurt.'
    ], mark: [0, 1], shake: true },
    { t: 'narr', text: 'You read it twice. It is good. That is the worst part. It is exactly how you would have written it.' },
    { t: 'choice', id: 'prologue_phone', prompt: 'What do you do with it?', options: [
      { id: 'show', label: 'Show Biko everything', hint: 'He is nineteen. He should know what he is working for.', effects: { trust: 1, flags: ['prologue_shared'] } },
      { id: 'hide', label: 'Delete it. Tell nobody.', hint: 'Some things you keep to yourself.', effects: { trust: -1, flags: ['prologue_hidden'] } },
      { id: 'keep', label: 'Screenshot it. Say nothing.', hint: 'Keep the evidence. Keep the secret.', effects: { flags: ['prologue_kept'] } }
    ] },
    { t: 'cold', text: 'Eleven days earlier.', time: 'Rewind.' }
  ]
};

// ---------------------------------------------------------------------------------------------------------------------
const C01: ChapterScript = {
  pre: {
    id: 'c01.pre',
    beats: [
      { t: 'cold', text: 'Friday. 9:41 PM.', time: 'Detty December. Lagos is on a beach. You are not.' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss are you seeing this' },
        { from: 'biko', text: 'transfer alert. 2.4 million. Dubai' },
        { from: 'biko', text: 'there\'s a cabana. there\'s a watch. there\'s a CABANA' }
      ] },
      { t: 'narr', text: 'Your ex. The ₦2.4 million. The "just till Friday" that became March, then June, then this.' },
      { t: 'chat', title: 'DM  •  @OracleNaija', msgs: [
        { from: 'oracle', text: 'You will want this.' },
        { from: 'oracle', text: '📎 transfer_receipt.pdf' },
        { from: 'you', text: 'who is this?' },
        { from: 'oracle', text: 'Someone who thinks you should win.' }
      ] },
      { t: 'doc', kind: 'receipt', title: 'TRANSFER RECEIPT', lines: ['Amount:  ₦2,400,000', 'From:  •••• 4417', 'To:  •••• 9023', 'Date:  14 March', 'Ref:  7741-HRP-0'], mark: [4], shake: true },
      { t: 'narr', text: 'HRP. You know those three letters better than your own phone number. Halo Reputation Partners. Your old firm. Your old life.' },
      { t: 'clue', id: 'C01' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss? what\'s HRP?' }
      ] },
      { t: 'choice', id: 'c01_hrp', prompt: 'Biko is looking at you. What is HRP?', options: [
        { id: 'truth', label: '"My old firm. Halo\'s."', hint: 'He is the only person you work with.', effects: { trust: 1, flags: ['told_hrp'] } },
        { id: 'lie', label: '"Nothing. A bank thing."', hint: 'Some doors stay shut.', effects: { trust: -1, flags: ['hid_hrp'] } }
      ] },
      { t: 'pause', ms: 700 },
      { t: 'choice', id: 'c01_file', prompt: 'The ex is about to go live. Do you use the Oracle\'s file?', timer: 20, fallback: 'use', options: [
        { id: 'use', label: 'Use it. Right now.', hint: 'Faster. You don\'t know where it came from.', effects: { integrity: -1, flags: ['used_oracle'] } },
        { id: 'verify', label: 'Verify it first.', hint: 'Costs a day you do not have.', effects: { integrity: 1, trust: 1, flags: ['verified_oracle'] } }
      ] }
    ]
  },
  plot: [{
    id: 'plot_c01_oracle', day: 8, stamp: 'DM  •  @ORACLENAIJA', headline: 'The Oracle Sends A Second File',
    body: '"Page two," the message says. "Your ex\'s accountant. His unlisted number." You did not ask. You never asked. Somehow the answer is always already in your inbox.',
    choices: [
      { id: 'take', label: 'Take the number', detail: '+10% Investigation • +4% Heat', effects: [{ kind: 'investigation', amount: 10 }, { kind: 'heat', amount: 4 }], story: { flags: ['oracle_trusted'] } },
      { id: 'trace', label: 'Try to trace the account', detail: '-8 ⚡ • +6% Investigation • Biko helps', cost: 8, effects: [{ kind: 'investigation', amount: 6 }], story: { trust: 1, flags: ['traced_oracle'] } },
      { id: 'ignore', label: 'Ignore it. Trust yourself.', detail: 'Nothing happens', effects: [], story: { integrity: 1, flags: ['ignored_oracle'] } }
    ]
  }],
  won: {
    id: 'c01.won',
    beats: [
      { t: 'cold', text: 'Sunday. 2:14 AM.', time: 'The apology went up at 6:06. You have not slept.' },
      { t: 'chat', title: 'DM  •  @OracleNaija', msgs: [
        { from: 'oracle', text: 'Well done.' },
        { from: 'you', text: 'Who are you?' },
        { from: 'oracle', text: 'The person who read that statement before your ex did.' },
        { from: 'oracle', text: 'It was written at 5:11.' },
        { from: 'oracle', text: 'Chapter two is already written.' }
      ], shake: true },
      { t: 'say', who: 'biko', text: 'Boss. How did it know we would win?', mood: 'WORRIED', when: { flag: 'told_hrp' } },
      { t: 'say', who: 'biko', text: 'Boss. How did it know?', mood: 'WORRIED', when: { notFlag: 'told_hrp' } },
      { t: 'narr', text: 'You open your phone to block the account. Your thumb stops. You are not sure you want it gone.' }
    ]
  },
  lost: { id: 'c01.lost', beats: [
    { t: 'cold', text: 'Not tonight.', time: 'The story did not land.' },
    { t: 'narr', text: 'Your ex\'s apology still goes up at 6:06. Not because they won. Because it was already written, and somebody was waiting for the clock.' },
    { t: 'say', who: 'biko', text: 'We go again, boss. We just go again.', mood: 'CONFIDENT' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
const C02: ChapterScript = {
  pre: {
    id: 'c02.pre',
    beats: [
      { t: 'cold', text: 'Thursday. 6:51 PM.', time: 'Third Mainland Bridge. Traffic. Again.' },
      { t: 'narr', text: 'Every Thursday, "stuck in traffic". Every Thursday, a lie with a beautiful excuse.' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss. I found it.' },
        { from: 'biko', text: 'second phone. glove compartment. I swear I did not go looking.' },
        { from: 'you', text: 'you went looking' },
        { from: 'biko', text: 'a little' }
      ] },
      { t: 'still', cam: 'CAR PARK B', time: '19:02:44', caption: 'A second phone, face down in a glove box.', detail: 'The lock screen is a photo of the sea. Nobody you know.' },
      { t: 'doc', kind: 'notes', title: 'CONTACTS  (1)', lines: ['HRP Ops', 'Last call:  Thursday 5:58 PM', 'Duration:  00:41'], mark: [0], shake: true },
      { t: 'narr', text: 'HRP Ops. The line that used to ring on your own desk, six years ago.' },
      { t: 'clue', id: 'C02' },
      { t: 'say', who: 'biko', text: 'Halo\'s firm? Boss, why is your ex-boss\'s company calling a cheater\'s second phone?', mood: 'WORRIED', when: { flag: 'told_hrp' } },
      { t: 'say', who: 'biko', text: 'HRP again, boss. Are you going to tell me what that is?', mood: 'NEUTRAL', when: { flag: 'hid_hrp' } },
      { t: 'choice', id: 'c02_phone', prompt: 'The phone is in your hand. What now?', options: [
        { id: 'photo', label: 'Photograph everything. Put it back.', hint: 'They never know you were there.', effects: { flags: ['phone_unseen'] } },
        { id: 'take', label: 'Take it.', hint: 'You get the logs. They get a warning.', effects: { coker: 1, flags: ['phone_taken'] } }
      ] }
    ]
  },
  plot: [{
    id: 'plot_c02_alibi', day: 9, stamp: 'THE ALIBI', headline: 'A Perfect Alibi Appears',
    body: 'Three witnesses, a restaurant receipt and a geotagged photo. The Target was "at a church harvest" all along. It is so tidy it looks ironed.',
    choices: [
      { id: 'dismantle', label: 'Take the alibi apart', detail: '-10 ⚡ • +10% Investigation • +10 Freshness', cost: 10, effects: [{ kind: 'investigation', amount: 10 }, { kind: 'freshness', amount: 10 }], story: { integrity: 1 } },
      { id: 'hrp', label: 'Message "HRP Ops" from the second phone', detail: '+14% Investigation • +8% Heat • somebody will notice', effects: [{ kind: 'investigation', amount: 14 }, { kind: 'heat', amount: 8 }], story: { coker: 1, flags: ['pinged_hrp'] } },
      { id: 'ignore', label: 'Let the alibi stand', detail: '+6% Cover-Up', effects: [{ kind: 'coverUp', amount: 6 }], story: {} }
    ]
  }],
  won: {
    id: 'c02.won',
    beats: [
      { t: 'cold', text: 'Saturday. 5:58 PM.', time: 'Six minutes before your post goes live.' },
      { t: 'doc', kind: 'draft', title: 'NOTES  •  saved 5:58 PM', lines: ['Dear friends,', 'I want to address the allegations circulating online.', 'I made a mistake. I am only human.', 'Healing is not linear.', 'Peace and light. 🕊️'], mark: [4] },
      { t: 'narr', text: 'Your post goes live at 6:04. This was saved at 5:58. It was written before there was anything to apologise for.' },
      { t: 'clue', id: 'C03' },
      { t: 'say', who: 'biko', text: 'Boss. They wrote it BEFORE we posted.', mood: 'PANIC' },
      { t: 'narr', text: 'Biko is staring at the second phone\'s contact list. At "HRP Ops". For one beat too long.' },
      { t: 'say', who: 'biko', text: 'Never heard of it, boss.', mood: 'NEUTRAL', when: { notFlag: 'told_hrp' } },
      { t: 'say', who: 'biko', text: 'Halo. It always comes back to Halo, boss.', mood: 'WORRIED', when: { flag: 'told_hrp' }, shake: true }
    ]
  },
  lost: { id: 'c02.lost', beats: [
    { t: 'cold', text: 'Not today.', time: 'The alibi held.' },
    { t: 'narr', text: 'Somewhere in Lekki, a second phone buzzes. Somebody reads the message you did not send, and smiles.' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
const C03: ChapterScript = {
  pre: {
    id: 'c03.pre',
    beats: [
      { t: 'cold', text: 'Friday. 11:48 PM.', time: 'Scandal Season. Every page is hungry.' },
      { t: 'chat', title: 'TEA TIME 🍵  (47 members)', msgs: [
        { from: 'target', text: 'ok so you know who our girl kissed in 2019 in the Quilox bathroom 😭' },
        { from: 'm1', text: 'NO. say it' },
        { from: 'target', text: 'I\'ll say it. And what she cried about after. In the car. In one shoe.' },
        { from: 'm2', text: 'this group is a public service' }
      ] },
      { t: 'narr', text: 'Eleven years. The one person who had a key to your life, and she has made copies.' },
      { t: 'voice', from: 'Your former bestie', secs: 31, text: 'Please don\'t post anything yet. Please. I\'m not who you think I am right now. I\'ll explain. I swear on my mother.' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss there\'s an invoice in the screenshots' },
        { from: 'biko', text: '"Halo Reputation Partners. Narrative Support. 3 clients."' },
        { from: 'biko', text: 'that\'s your mentor\'s company' }
      ] },
      { t: 'say', who: 'you', text: 'You told me you\'d never heard of HRP.', mood: 'NEUTRAL', when: { flag: 'hid_hrp' } },
      { t: 'say', who: 'biko', text: 'I\'m… putting it together now, boss.', mood: 'WORRIED', when: { flag: 'hid_hrp' } },
      { t: 'say', who: 'biko', text: 'Same company as the receipt. Same company as the phone. Boss, that\'s three.', mood: 'WORRIED', when: { flag: 'told_hrp' } },
      { t: 'choice', id: 'c03_call', prompt: 'She is calling. 3:02 AM. Do you pick up?', timer: 15, fallback: 'ring', options: [
        { id: 'pick', label: 'Pick up.', hint: 'Eleven years is eleven years.', effects: { trust: 0, flags: ['bestie_called'] } },
        { id: 'ring', label: 'Let it ring.', hint: 'She chose the group chat.', effects: { integrity: -1, flags: ['bestie_ignored'] } }
      ] }
    ]
  },
  plot: [{
    id: 'plot_c03_leak', day: 8, stamp: 'TEA TIME', headline: 'The Group Chat Leaks Again',
    body: 'Forty-seven members and one of them is selling screenshots by the dozen. A new batch lands on your timeline: your secrets, in your own handwriting, from a notebook you thought you burned.',
    choices: [
      { id: 'own', label: 'Post the story before they do', detail: '+20 Freshness • +6% Heat', effects: [{ kind: 'freshness', amount: 20 }, { kind: 'heat', amount: 6 }], story: { integrity: 1 } },
      { id: 'quiet', label: 'Say nothing. Let them wait', detail: '-5% Heat • -8 Freshness', effects: [{ kind: 'heat', amount: -5 }, { kind: 'freshness', amount: -8 }], story: {} },
      { id: 'mole', label: 'Find who is selling', detail: '-10 ⚡ • +8% Investigation • Biko traces the account', cost: 10, effects: [{ kind: 'investigation', amount: 8 }], story: { trust: 1, flags: ['found_seller'] } }
    ]
  }],
  won: {
    id: 'c03.won',
    beats: [
      { t: 'cold', text: 'Saturday. 3:02 AM.', time: 'She calls. This time you answer.' },
      { t: 'voice', from: 'Your former bestie', secs: 52, text: 'A man at a hotel in Ikoyi showed me a spreadsheet. Eleven names. He said, be kind to the ninth, she is important. I did not know you were the ninth until I saw your name. I swear. I\'m so sorry.' },
      { t: 'chat', title: 'DM  •  your former bestie', msgs: [
        { from: 'target', text: 'We are all on the same list.' },
        { from: 'target', text: '📎 sheet.png' }
      ], shake: true },
      { t: 'clue', id: 'C04' },
      { t: 'doc', kind: 'ledger', title: 'SHEET  •  "MIRROR: PERSONS OF INTEREST"', lines: [
        '1.  A. Fasasi — closed',
        '2.  T. Lawal-Smith — closed',
        '3.  D. Kalu — closed',
        '4.  ■■■■ ■■■■■■ — open',
        '5.  I. Bamidele — closed',
        '6.  ■■■■ ■■■■■ — open',
        '7.  C. Eze — closed',
        '8.  ■■■■ — open',
        '9.  ◆ THE RECEIPTS (admin) — OPEN. "Be kind."',
        '10. ■■■■■■ — open',
        '11. G. PRIME — open'
      ], mark: [8], shake: true },
      { t: 'clue', id: 'C05' },
      { t: 'say', who: 'biko', text: 'Boss. You are ninth on a list that somebody typed before you posted your first story.', mood: 'PANIC' },
      { t: 'narr', text: 'You scroll to number eleven. G. PRIME. You know that name. You have been waiting to meet him for years.' }
    ]
  },
  lost: { id: 'c03.lost', beats: [
    { t: 'cold', text: 'Not yet.', time: 'The chat keeps running.' },
    { t: 'narr', text: 'Forty-seven members. Three thousand words. Your secrets, still going out, one tea at a time.' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
const C04: ChapterScript = {
  pre: {
    id: 'c04.pre',
    beats: [
      { t: 'cold', text: 'Monday. 10:02 AM.', time: 'A slow news week. Nothing is happening, so everybody is looking at you.' },
      { t: 'news', channel: '@GISTLORDPRIME', headline: 'Should I say it? 🤐  (Yes 71%  •  No 29%)', ticker: 'A blurry picture of a lanyard. A poll. A countdown to Friday.' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss he\'s posted a lanyard' },
        { from: 'biko', text: 'it\'s YOUR lanyard. from the old office' },
        { from: 'biko', text: 'he has your real name, doesn\'t he' }
      ] },
      { t: 'say', who: 'target', text: 'Four hundred thousand of you. One of you is going to find out on Friday who has been eating your favourites. And I was trained by the same people, so I know how it tastes.', mood: 'SMUG' },
      { t: 'voice', from: 'Gistlord Prime (private)', secs: 22, text: 'You have until Friday at six. Call me, or I say it. And honey, don\'t bother with the police. I ask them for favours.' },
      { t: 'choice', id: 'c04_deal', prompt: 'Friday, 6 PM. What do you do?', timer: 25, fallback: 'hit', options: [
        { id: 'pay', label: 'Pay him ₦500,000 for his silence', hint: 'It buys a week. It teaches him your price.', effects: { integrity: -2, trust: -1, flags: ['paid_gistlord'] } },
        { id: 'burn', label: 'Burn the page for a week', hint: 'Followers drop. He has nothing left to sell.', effects: { integrity: 1, flags: ['burned_page'] } },
        { id: 'hit', label: 'Hit him first', hint: 'Everything you have on him, now.', effects: { coker: 1, flags: ['hit_first'] } }
      ] }
    ]
  },
  plot: [{
    id: 'plot_c04_unmask', day: 11, stamp: 'THE UNMASKING', headline: '"At 6:06 PM Tonight I Say Her Name"',
    body: 'Gistlord has gone live: a countdown, a sponsor shout-out and a promise. Whatever you have been doing, today is the day it either holds or does not.',
    choices: [
      { id: 'preempt', label: 'Go live first, as yourself (nearly)', detail: '-15 ⚡ • +25 Freshness • +10% Heat', cost: 15, effects: [{ kind: 'freshness', amount: 25 }, { kind: 'heat', amount: 10 }], story: { coker: 1, flags: ['preempted_unmask'] } },
      { id: 'bury', label: 'Bury him in a bigger story', detail: '+15 Freshness • +5% Investigation', effects: [{ kind: 'freshness', amount: 15 }, { kind: 'investigation', amount: 5 }], story: {} },
      { id: 'brace', label: 'Brace. Delete everything', detail: '-8% Heat • -10 Freshness', effects: [{ kind: 'heat', amount: -8 }, { kind: 'freshness', amount: -10 }], story: { integrity: 1 } }
    ]
  }],
  won: {
    id: 'c04.won',
    beats: [
      { t: 'cold', text: 'Friday. 6:06 PM.', time: 'Gistlord does not go live.' },
      { t: 'news', channel: '@GISTLORDPRIME', headline: 'I have been unwell and I am stepping away from the internet. Peace and light. 🕊️', ticker: 'Followers: 412,000 → 0.  This account no longer exists.' , shake: true },
      { t: 'doc', kind: 'ledger', title: 'SUBJECT FILE  •  bought 11 Nov.  •  ₦350,000', lines: ['Legal name:  ██████ ████████', 'Address:  ██ ████ Street, Lagos', 'Next of kin:  ████ (mother)  0803 ███ 4417', 'Employer history:  Halo Reputation Partners  (junior, 2 yrs)'], mark: [3] },
      { t: 'clue', id: 'C06' },
      { t: 'doc', kind: 'receipt', title: 'INVOICE  •  DATA SERVICES', lines: ['Item:  personal data file (1)', 'Paid by:  OTUBU FACILITIES & CLEANING LTD', 'Also serves:  14 Ozumba Mbadiwe — HRP HQ'], mark: [1, 2] },
      { t: 'clue', id: 'C07' },
      { t: 'chat', title: 'EMAIL  •  Insp. D. Coker, Cybercrime Unit', msgs: [
        { from: 'coker', text: 'Dear Sir/Madam,' },
        { from: 'coker', text: 'I would like to meet the owner of The Receipts, at your convenience. Not at mine.' },
        { from: 'coker', text: 'Kind regards. I will wait.' }
      ], shake: true },
      { t: 'say', who: 'biko', text: 'Boss. The police are being POLITE. That is worse.', mood: 'PANIC' },
      { t: 'narr', text: 'Four chapters in, and your page has just become the most interesting story in Lagos. You are no longer sure who is telling it.' }
    ]
  },
  lost: { id: 'c04.lost', beats: [
    { t: 'cold', text: 'Friday. 6:06 PM.', time: 'He says it.' },
    { t: 'narr', text: 'Four hundred thousand people hear your name. By morning your landlord knows. By noon, so does everybody who has ever loved you.' },
    { t: 'say', who: 'biko', text: 'We should have hit him first, boss.', mood: 'DEFEATED' }
  ] }
};

export const ACT1: Record<string, ChapterScript> = { c01: C01, c02: C02, c03: C03, c04: C04 };
