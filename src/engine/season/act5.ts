import type { ChapterScript, Scene } from './types';

// ACT 5: PEACE AND LIGHT (chapters 15 and 16). The finale.
// A siege, an Inspector with a choice to offer, a mentor with your own playbook, and the sentence that was yours from the start.
// Chapter 16's `won` scene ends in the finale choice. Its options are the endings you have earned (see ENDINGS below):
//   Peace and Light • The New Halo • The Receipts, Public (needs Zainab) • Cut the Cord (needs "go alone") •
//   The Oracle (hidden: 16 clues, Trust 8+, Fola out, Ngozi saved, Coker as ally).

// ---------------------------------------------------------------------------------------------------------------------
const C15: ChapterScript = {
  pre: {
    id: 'c15.pre',
    beats: [
      { t: 'cold', text: 'Thursday. 6:06 AM.', time: 'Forty-eight hours to election eve.' },
      { t: 'still', cam: 'THE RECEIPTS  •  LOGIN', time: '06:06:00', caption: 'Your password has been changed. Your two-factor has been rerouted. Your recovery email is now somebody else\'s.', detail: 'A small dove has been added to your profile picture.' },
      { t: 'news', channel: 'THE NATION TODAY', headline: '"THE RECEIPTS HOAXER": Popular Gossip Page Accused of Forging Evidence', ticker: 'Three newspapers. Same calm, confident, beautifully formatted PDF.' },
      { t: 'chat', title: 'FAMILY GROUP 🙏  (112 members)', msgs: [
        { from: 'm1', text: 'We always knew.' },
        { from: 'm2', text: 'Peace and light.' },
        { from: 'm3', text: 'Peace and light.' },
        { from: 'm4', text: 'Peace and light.' }
      ] },
      { t: 'narr', text: 'Your ex. Your boss. Your business partner. Your mother-in-law. Your uncle. Every one of them has posted a new statement in the last hour. Every one of them says you lied. Every one is signed the same way.' },
      { t: 'say', who: 'target', text: 'lol ok. let\'s see how long you last. eleven thousand of us, and one of you. you can rest now. you have done enough.', mood: 'SMUG' },
      { t: 'say', who: 'biko', text: 'Boss. They are coming back for us. All of them. At once.', mood: 'PANIC', when: { notFlag: 'biko_fired' } },
      { t: 'chat', title: 'DM  •  burner number', msgs: [
        { from: 'fola', text: 'It is Segun. It is always Segun. He has the whole floor on the siege.' },
        { from: 'fola', text: 'Do not answer anyone until you have something that cannot be answered.' }
      ], when: { flag: 'biko_fired' } },
      { t: 'choice', id: 'c15_first', prompt: 'Your page is dark. Eleven thousand accounts are typing your name. What is your first move?', timer: 25, fallback: 'proof', options: [
        { id: 'proof', label: 'Say nothing. Collect proof.', hint: 'It looks like silence. It will not be silence for long.', effects: { integrity: 1, flags: ['c15_proof'] } },
        { id: 'loud', label: 'Fight back, loudly, from every account you have.', hint: 'It will be noticed. It might also feed them.', effects: { coker: 1, flags: ['c15_loud'] } }
      ] }
    ]
  },
  plot: [
    {
      id: 'plot_c15_flood', day: 2, archetype: 'SECURITY_WIRE', stamp: 'THE SIEGE', headline: 'Your Channels Are Flooded',
      body: 'Every one of your channels is under water: bot accounts, reply guys, a sea of identical sentences. The siege is not about winning. It is about making sure you cannot be heard until election eve.',
      choices: [
        { id: 'weather', label: 'Weather it', detail: '3 Spin bubbles appear • +4 Freshness', effects: [{ kind: 'spin', count: 3 }, { kind: 'freshness', amount: 4 }], story: {} }
      ]
    },
    {
      id: 'plot_c15_returning', day: 6, archetype: 'TARGET_PR', stamp: 'THEY ARE ALL BACK', headline: 'Everyone You Exposed Goes Live at Once',
      body: 'Your ex. Your boss. Your partner. Your uncle. A split screen of six faces, six lights, six sets of notes. Each says the same sentence, in the same order. Each ends: "Peace and light." You recognise every one of them. You recognise the sentence.',
      choices: [
        { id: 'reply', label: 'Answer each one with their own receipts', detail: '-12 ⚡ • +16% Investigation • +6% Heat', cost: 12, effects: [{ kind: 'investigation', amount: 16 }, { kind: 'heat', amount: 6 }], story: { integrity: 1 } },
        { id: 'ignore', label: 'Do not answer', detail: '+8% Cover-Up • -4% Heat', effects: [{ kind: 'coverUp', amount: 8 }, { kind: 'heat', amount: -4 }], story: {} },
        { id: 'skit', label: 'Let Mr. Macaroony roast the whole thing', detail: '+14 Freshness • +4% Heat', effects: [{ kind: 'freshness', amount: 14 }, { kind: 'heat', amount: 4 }], story: { flags: ['skit_siege'] } }
      ]
    },
    {
      id: 'plot_c15_call', day: 9, archetype: 'INFORMANT_TIP', stamp: 'UNKNOWN NUMBER', headline: 'A Polite Call at 3 AM',
      body: '"Good evening. I would like to meet. Not at my convenience. At yours." Behind the voice you hear a kettle, a ceiling fan and a very small child saying goodnight. It is not what you expected a policeman to sound like.',
      choices: [
        { id: 'answer', label: 'Say you will think about it', detail: '+8% Investigation • -4% Heat', effects: [{ kind: 'investigation', amount: 8 }, { kind: 'heat', amount: -4 }], story: { coker: -1, flags: ['answered_coker'] } },
        { id: 'hang', label: 'Hang up. Change SIMs', detail: '-8% Heat', effects: [{ kind: 'heat', amount: -8 }], story: { coker: 1 } }
      ]
    }
  ],
  won: {
    id: 'c15.won',
    beats: [
      { t: 'cold', text: 'Saturday. 4:00 AM.', time: 'The bots fall silent, one account at a time.' },
      { t: 'doc', kind: 'court', title: 'CASE FILE  •  CYBERCRIME UNIT  •  "THE RECEIPTS"', lines: [
        'Opened:  four months ago',
        'Subject identified:  [YOU]',
        'Status:  Under observation. No arrest recommended.',
        'Reason:  "The subject is being used. The author is above her."',
        'Officer:  Insp. D. Coker'
      ], mark: [0, 2, 3], shake: true },
      { t: 'clue', id: 'C22' },
      { t: 'narr', text: 'Four months. He has known who you are for four months, and he has not arrested you. He did not want the page. He wanted whoever was aiming it.' },
      { t: 'say', who: 'coker', text: 'I have spent my career catching the people who write the statements. I have never once caught the person who dictates them. Until now, I did not know there was one. Help me find him, and I will help you stay out of a cell.', mood: 'NEUTRAL', when: { cokerLt: 8 } },
      { t: 'say', who: 'coker', text: 'I would have liked to help you. You have been very loud, and very careless, and the file has become too heavy for me to lose. I am sorry.', mood: 'WORRIED', when: { cokerGte: 8 } },
      { t: 'choice', id: 'c15_ally', prompt: 'The siege is over. The election is tomorrow. Whom do you trust with what you have?', options: [
        { id: 'coker', label: 'Partner with the Inspector.', hint: 'He has a badge, a warrant and a very small child. He may also have orders.', effects: { coker: -3, trust: 1, flags: ['ally_coker'] }, when: { cokerLt: 8 } },
        { id: 'zainab', label: 'Partner with Zainab and The Ledger.', hint: 'Slow, rigorous, and public. She will not let you lie.', effects: { integrity: 1, flags: ['ally_zainab'] }, when: { anyFlag: ['zainab_contact', 'zainab_witnessed'] } },
        { id: 'alone', label: 'Go alone.', hint: 'You have the files, the page and a bad temper. You do not need anyone.', effects: { integrity: -1, coker: 1, flags: ['went_alone'] } }
      ] },
      { t: 'cold', text: 'Saturday. 6:06 PM.', time: 'Your phone buzzes once.' },
      { t: 'doc', kind: 'draft', title: 'NOTES  •  STATEMENT  •  (unsent)', lines: [
        'I want to address the allegations against Halo.',
        'I have never wished to hurt anyone.',
        'I take full responsibility for everything I am about to do,',
        'and for everyone I am about to hurt.',
        'Peace and light. 🕊️'
      ], mark: [0, 4], shake: true },
      { t: 'narr', text: 'It is in your voice. It is better than anything you could write. It has not been posted yet. It is waiting for you.' }
    ]
  },
  lost: { id: 'c15.lost', beats: [
    { t: 'cold', text: 'Friday. 11:59 PM.', time: 'The page stays dark.' },
    { t: 'narr', text: 'By Friday three newspapers have called you "the Receipts hoaxer". Biko brings tea you did not ask for and says, "We still have the files, boss. We only lost the room."' }
  ] }
};

// ---------------------------------------------------------------------------------------------------------------------
const C16: ChapterScript = {
  pre: {
    id: 'c16.pre',
    beats: [
      { t: 'cold', text: 'Election Eve. 11:00 AM.', time: 'Seven hours before 6:06.' },
      { t: 'narr', text: 'Halo Reputation Partners, the fourteenth floor. The door with no sign is open. Inside, a man in an agbada the colour of dried blood is pouring two cups of tea.' },
      { t: 'say', who: 'halo', text: 'I wondered when you would come for me. I wrote the manual, my dear. Sit. Sit. We have so much to talk about.', mood: 'SMUG' },
      { t: 'say', who: 'halo', text: 'You are very good. I told you that you would be. I did not tell you how good, because good people have to be surprised by their own talent.', mood: 'CONFIDENT' },
      { t: 'narr', text: 'He has never raised his voice. In six years, you have never once heard him raise it. You are standing in a room that smells of cedar and tea, and you are more afraid than you have ever been.' },
      { t: 'chat', title: 'Biko', msgs: [
        { from: 'biko', text: 'boss I am in the car park. I am not going in. I am just here.' },
        { from: 'biko', text: 'whatever you decide, I decided already. I am on your side.' }
      ], when: { trustGte: 7, notFlag: 'biko_fired' } },
      { t: 'chat', title: 'DM  •  burner number', msgs: [
        { from: 'fola', text: 'I am on the floor below. I will not let anyone take the stairs.' }
      ], when: { flag: 'fola_out' } },
      { t: 'say', who: 'halo', text: 'You have seen Block C now. Good. Then you know I never lied to you. I only chose which truth you held.', mood: 'CONFIDENT', when: { flag: 'ep_year_zero' } },
      { t: 'say', who: 'coker', text: 'I am in the lobby, sir. If you need me, I am not very far.', mood: 'NEUTRAL', when: { flag: 'ally_coker' } },
      { t: 'choice', id: 'c16_approach', prompt: 'He is holding out a cup of tea. The case against him is on your phone. How do you begin?', timer: 25, fallback: 'tea', options: [
        { id: 'tea', label: 'Take the tea. Let him talk.', hint: 'He has never been able to stay quiet. That is how he built you.', effects: { flags: ['c16_tea'] } },
        { id: 'push', label: 'Put the file on the desk. Say nothing.', hint: 'It is the one thing he cannot say anything to.', effects: { coker: 1, flags: ['c16_push'] } }
      ] }
    ]
  },
  plot: [
    {
      id: 'plot_c16_lesson', day: 5, archetype: 'BREAKING_FRONT', stamp: 'THE LESSON', headline: '"What I Taught My Greatest Student"',
      body: 'A viral video. Warm. Wise. A little sad. He talks about a gifted apprentice he once loved. He does not name you. Everybody knows. It is the most dangerous thing he has ever posted, because it is almost true.',
      choices: [
        { id: 'answer', label: 'Answer him with the footage', detail: '-10 ⚡ • +12% Investigation • +8% Heat', cost: 10, effects: [{ kind: 'investigation', amount: 12 }, { kind: 'heat', amount: 8 }], story: { integrity: 1 } },
        { id: 'share', label: 'Share the video. Add one line: "He is right."', detail: '+10 Freshness • -5% Cover-Up', effects: [{ kind: 'freshness', amount: 10 }, { kind: 'coverUp', amount: -5 }], story: { flags: ['c16_agreed'] } },
        { id: 'ignore', label: 'Do not engage', detail: '+6% Cover-Up • -4% Heat', effects: [{ kind: 'coverUp', amount: 6 }, { kind: 'heat', amount: -4 }], story: {} }
      ]
    },
    {
      id: 'plot_c16_playbook', day: 10, archetype: 'TARGET_PR', stamp: 'YOUR OWN PLAYBOOK', headline: 'He Reports You Using the Rules He Wrote',
      body: 'Page 6 of the course. Page 9. Page 14. Every platform policy he cites is in your own handwriting, in the margin of your own copy of the manual. He does not need a new trick. He is using every one you ever learned.',
      choices: [
        { id: 'adapt', label: 'Change your approach', detail: '-8% Heat • -6 Freshness', effects: [{ kind: 'heat', amount: -8 }, { kind: 'freshness', amount: -6 }], story: { integrity: 1 } },
        { id: 'double', label: 'Double down on the lane you trust most', detail: '+14 Freshness • +8% Heat', effects: [{ kind: 'freshness', amount: 14 }, { kind: 'heat', amount: 8 }], story: { flags: ['c16_doubled'] } }
      ]
    }
  ],
  won: {
    id: 'c16.won',
    beats: [
      { t: 'cold', text: 'Election Eve. 5:48 PM.', time: 'Eighteen minutes before 6:06.' },
      { t: 'say', who: 'halo', text: 'You think you beat me, my dear? You did not beat me. You beat yourself. You are the best thing I ever made. That is the whole point.', mood: 'CONFIDENT' },
      { t: 'voice', from: 'Halo  •  a recording, six years old', secs: 41, text: '(a younger voice, hoarse, mid-sentence) "…I take full responsibility for everything I did, and for everyone I hurt. I was young. I did not understand the weight of my choices. Healing is a journey, and I am walking it. Peace and light." (a pause. Someone is crying.) "Is that okay? Does that sound sorry enough?"' },
      { t: 'clue', id: 'C23' },
      { t: 'narr', text: 'It is your voice. It is you, at twenty-four. You are dictating an apology to a man you have never met, for a client you have never met, to cover something that you did not do and did not understand. You are crying while you write it.' },
      { t: 'doc', kind: 'draft', title: 'THE FIRST  •  in your handwriting', lines: [
        'Dear friends, family and the public,',
        'I want to address the allegations circulating about me.',
        'I take full responsibility. I ask for privacy.',
        'Peace and light. 🕊️',
        '(the date: six years ago. The initials: yours.)'
      ], mark: [3, 4], shake: true },
      { t: 'clue', id: 'C24' },
      { t: 'say', who: 'halo', text: 'You tried to write a different one that night. I read it. It was not as good. I kept it anyway.', mood: 'SMUG', when: { clue: 'C25' } },
      { t: 'say', who: 'halo', text: 'I did not teach you the line, my dear. I stole it. You wrote it for a man who had done something terrible. It was perfect. It has been the most profitable sentence in Nigeria for six years. I only ever kept it safe.', mood: 'SMUG' },
      { t: 'narr', text: 'Every person you have ever exposed said your sentence back to you. Every apology posted at 6:06 PM was a quotation. You have been listening to yourself, and calling it justice.' },
      { t: 'pause', ms: 1400 },
      { t: 'say', who: 'biko', text: 'Boss. Whatever you decide. I am here.', mood: 'WORRIED', when: { trustGte: 6, notFlag: 'biko_fired' } },
      { t: 'cold', text: '6:04 PM.', time: 'Two minutes. Your thumb is over the post button. What do you write?' },
      { t: 'choice', id: 'c16_finale', prompt: 'The last decision of the season. Halo is waiting. The country is waiting. It is yours.', options: [
        { id: 'peace', label: 'Burn it all. Expose Halo, the plan, and yourself.', hint: 'Everything, including your own authorship. You lose the page.', effects: { integrity: 2, flags: ['end_peace'] } },
        { id: 'newhalo', label: 'Take it over. Run HRP. Write the apologies yourself.', hint: 'You win. You become the one who writes them.', effects: { integrity: -3, flags: ['end_newhalo'] } },
        { id: 'public', label: 'Give everything to Zainab and The Ledger.', hint: 'Slow, rigorous, legitimate. The page closes. Your name is printed.', effects: { integrity: 2, flags: ['end_public'] }, when: { flag: 'ally_zainab' } },
        { id: 'cut', label: 'Sell the page. Take the money. Disappear.', hint: 'The plan goes ahead without you. You will be somewhere with a view.', effects: { integrity: -2, flags: ['end_cut'] }, when: { flag: 'went_alone' } },
        { id: 'oracle', label: 'Call everyone. Every ally you earned. All at once.', hint: 'A coordinated takedown. It is the hardest thing you have ever asked of anyone.', effects: { integrity: 3, flags: ['end_oracle'] }, when: { flags: ['fola_out', 'ngozi_saved', 'ally_coker'], trustGte: 8, cluesGte: 16 } }
      ] }
    ]
  },
  lost: { id: 'c16.lost', beats: [
    { t: 'cold', text: 'Election Eve. 6:06 PM.', time: 'It posts.' },
    { t: 'narr', text: 'A statement goes out under your name. It is not yours, and it is flawless. You have not even been given the dignity of an argument. Halo pours you another cup of tea. "Again, my dear," he says. "From the top."' }
  ] }
};

export const ACT5: Record<string, ChapterScript> = { c15: C15, c16: C16 };

// ---------------------------------------------------------------------------------------------------------------------
// THE ENDINGS. The finale choice sets one `end_*` flag; the ending scene for that flag plays after the chapter's result.
export type EndingId = 'peace' | 'newhalo' | 'public' | 'cut' | 'oracle';

export interface EndingDef { id: EndingId; flag: string; title: string; tagline: string; scene: Scene }

export const ENDINGS: Record<EndingId, EndingDef> = {
  peace: {
    id: 'peace', flag: 'end_peace', title: 'Peace and Light', tagline: 'You told the truth, including the part about you.',
    scene: { id: 'end.peace', beats: [
      { t: 'cold', text: 'Election Eve. 6:06 PM.', time: 'You post it.' },
      { t: 'doc', kind: 'draft', title: 'THE RECEIPTS  •  FINAL POST', lines: [
        'Dear friends, family and the public,',
        'This is the story of a sentence I wrote six years ago.',
        'I wrote it for a man who had done something terrible. It was perfect.',
        'Everything I have exposed since, I exposed with it.',
        'I am sorry. This is what is true.'
      ], mark: [1, 4] },
      { t: 'news', channel: 'EVERY CHANNEL, ALL AT ONCE', headline: 'The Receipts founder confesses: "I wrote the first Peace and Light."', ticker: 'Followers: 412,000 → 38,000.  Replies: 2.1 million.' },
      { t: 'narr', text: 'You lose the page by midnight. You lose most of your followers by dawn. The country believes you for the first time, and for the right reasons.' },
      { t: 'say', who: 'biko', text: 'Boss. I have read it four times. It is the best thing you have ever written. It is also the first thing you have ever written that is entirely true.', mood: 'WORRIED', when: { trustGte: 6, notFlag: 'biko_fired' } },
      { t: 'narr', text: 'He hugs you. Neither of you says anything for a long time.', when: { trustGte: 6, notFlag: 'biko_fired' } },
      { t: 'say', who: 'coker', text: 'I have a cup of coffee and no handcuffs. I thought you might want a witness.', mood: 'NEUTRAL', when: { flag: 'ally_coker' } },
      { t: 'say', who: 'biko', text: 'Lecture Hall 4. I typed it eleven times that night. I should have pressed send the first time.', mood: 'DEFEATED', when: { flag: 'ep_biko', trustGte: 6, notFlag: 'biko_fired' } },
      { t: 'cold', text: 'Peace and light.', time: 'For the first time, you mean it.' }
    ] }
  },
  newhalo: {
    id: 'newhalo', flag: 'end_newhalo', title: 'The New Halo', tagline: 'You won. You are now the one who writes the apologies.',
    scene: { id: 'end.newhalo', beats: [
      { t: 'cold', text: 'Election Eve. 6:06 PM.', time: 'You do not post the receipt. You post a different one.' },
      { t: 'narr', text: 'The fourteenth floor has a new name on the door. It is not a long name. It does not need to be.' },
      { t: 'news', channel: 'CHANNELS TV', headline: 'Halo Reputation Partners announces new leadership. "A seamless transition."', ticker: 'Dr. Adeyemo is "retiring to focus on his health". He has been seen leaving the building with a very large smile.' },
      { t: 'say', who: 'ngozi', text: 'Welcome, darling. I have kept your birthday in the system. Shall I make some tea?', mood: 'CONFIDENT', when: { flag: 'ngozi_taken' } },
      { t: 'narr', text: 'You sit at the desk by the window. Thirty writers look up, and then, very carefully, down.' },
      { t: 'doc', kind: 'draft', title: 'NOTES  •  STATEMENT  •  (client: the new governor)', lines: [
        'Dear friends, family and the public,',
        'I want to address the allegations circulating about my administration.',
        'I take full responsibility.',
        'Peace and light. 🕊️'
      ], mark: [3] },
      { t: 'narr', text: 'It is 6:06 PM. You are the one typing. It is a very good apology. It sounds exactly like someone who is sorry.' },
      { t: 'cold', text: 'Peace and light.', time: 'The last shot is your thumb, over a button.' }
    ] }
  },
  public: {
    id: 'public', flag: 'end_public', title: 'The Receipts, Public', tagline: 'Slow, careful and legitimate. You paid in your anonymity.',
    scene: { id: 'end.public', beats: [
      { t: 'cold', text: 'Sunday. 6:00 AM.', time: 'The Ledger. Front page.' },
      { t: 'news', channel: 'THE LEDGER  •  SPECIAL REPORT', headline: '"PROJECT MIRROR": How a Reputation Firm Built a Gossip Page, and Aimed It', ticker: 'By Zainab Lawal. 11,000 words. Eleven documents. Every one verified.' },
      { t: 'say', who: 'zainab', text: 'I would still prefer to be wrong about gossip pages. But I read your files for nine days, and every one was real. I am not going to say you were right. I am going to say you were useful.', mood: 'NEUTRAL' },
      { t: 'narr', text: 'The Receipts is closed by Tuesday. A profile of you runs in the Sunday magazine, under your real name, with a photograph you did not choose. The first line is a quotation. It is a good line. It is the truth.' },
      { t: 'narr', text: 'Halo\'s firm is dissolved by a judge who has never once been woken for a signature. It takes four months. It takes eleven hearings. It is not exciting. It is done.' },
      { t: 'say', who: 'biko', text: 'Boss. I am still going to call you boss. I have never been prouder of anything in my life.', mood: 'LAUGH', when: { trustGte: 6, notFlag: 'biko_fired' } },
      { t: 'cold', text: 'Peace and light.', time: 'It is on the front page. It is a quotation.' }
    ] }
  },
  cut: {
    id: 'cut', flag: 'end_cut', title: 'Cut the Cord', tagline: 'You sold the page and vanished. The plan went ahead without you.',
    scene: { id: 'end.cut', beats: [
      { t: 'cold', text: 'Wednesday. Three days later.', time: 'A bar in Accra. A television above the bar.' },
      { t: 'narr', text: 'You sold the page to a buyer who did not ask what it was. The money is more than you have ever seen. You have a flat with a view and a phone that does not buzz.' },
      { t: 'news', channel: 'CHANNELS TV  •  ELECTION NIGHT', headline: 'Chief "Unbothered" Mbakwe declared winner by a margin the commission describes as "convincing".', ticker: 'The Chief thanks "the many voices who made this possible".' },
      { t: 'doc', kind: 'draft', title: 'THE RECEIPTS  •  last post  •  under new ownership', lines: [
        'The opposing candidate has stolen from the pension fund of 40,000 retirees.',
        'Here is the proof.',
        'Peace and light. 🕊️'
      ], mark: [2] },
      { t: 'narr', text: 'It posted at 6:06 PM. It is still up. It has four million views. You are watching it on a television above a bar, with a drink you have not touched.' },
      { t: 'say', who: 'biko', text: 'Boss. We could have stopped it.', mood: 'DEFEATED', when: { notFlag: 'biko_fired' } },
      { t: 'cold', text: 'Peace and light.', time: 'Somebody has changed the channel.' }
    ] }
  },
  oracle: {
    id: 'oracle', flag: 'end_oracle', title: 'The Oracle', tagline: 'You were not alone. Everyone you earned showed up.',
    scene: { id: 'end.oracle', beats: [
      { t: 'cold', text: 'Election Eve. 6:06 PM.', time: 'Everyone, all at once.' },
      { t: 'narr', text: 'Madam Ngozi sends the drive to eleven newsrooms. Zainab, or whoever you could reach, has the story. Fola uploads the floor plan with a handwritten note: "Desk 22. Me." Inspector Coker walks into the fourteenth floor with a warrant, a coffee and a very small, very tired smile.' },
      { t: 'news', channel: 'EVERY CHANNEL', headline: 'LIVE: Dr. Bankole "Halo" Adeyemo arrested at the offices of Halo Reputation Partners.', ticker: '6:06 PM. The arrest is live. Somebody has set a timer.' },
      { t: 'say', who: 'halo', text: 'My dear. You did not do this alone, did you? I did not think you had it in you.', mood: 'DEFEATED' },
      { t: 'say', who: 'ngozi', text: 'I kept every birthday card, sir. I kept every one.', mood: 'CONFIDENT' },
      { t: 'say', who: 'biko', text: 'Boss. I decided already. I was on your side the whole time.', mood: 'LAUGH', when: { trustGte: 6, notFlag: 'biko_fired' } },
      { t: 'narr', text: 'You do not escape your past. In the last scene Fola hands you a folded page. It is a draft, in your handwriting, addressed to the man from six years ago, the man the first "Peace and light" was written for. It is the one thing you never wrote: an apology to someone who deserves it.' },
      { t: 'say', who: 'fola', text: 'The first receipt I ever sent was addressed to you. I did not know why. I think it was always going to be you.', mood: 'LAUGH', when: { flag: 'ep_oracle' } },
      { t: 'cold', text: 'Peace and light.', time: 'It is, finally, yours.' },
      { t: 'chat', title: 'DM  •  a number you do not know', msgs: [
        { from: 'm1', text: 'Good evening. Season two is already written.' },
        { from: 'm1', text: 'This time, you would like to know who is writing yours.' }
      ], shake: true }
    ] }
  }
};

/** The hidden ending: after any ending but The Oracle, if you used Biko and went alone, the page continues under a new name. */
export const SIGNATURE: Scene = {
  id: 'end.signature',
  beats: [
    { t: 'cold', text: 'Three months later.', time: 'A new name. A new page. The same six o\'clock.' },
    { t: 'narr', text: 'You did not stop. You could not. Somebody else was always going to hold the pen, so it might as well be you. The page has a new name and a new account and an audience that does not know where it came from.' },
    { t: 'cold', text: '6:06 PM.', time: 'Your phone buzzes once.' },
    { t: 'doc', kind: 'draft', title: 'NOTES  •  STATEMENT  •  (unsent)', lines: [
      'Dear friends, family and the public,',
      'I want to address the allegations circulating about the owner of The Receipts.',
      'I take full responsibility for everything I am about to do.',
      'Peace and light. 🕊️'
    ], mark: [1, 2], shake: true },
    { t: 'narr', text: 'It is in your voice. It is for a story you have not yet told.' }
  ]
};

/** Which ending the player earned, from the flag the finale choice set. */
export const endingFromFlags = (flags: string[]): EndingDef | null => (Object.values(ENDINGS).find(e => flags.includes(e.flag)) ?? null);

/** Does the hidden coda apply? (Used Biko, went alone, and did not take the Oracle ending.) */
export const signatureApplies = (flags: string[]): boolean => flags.includes('biko_used') && flags.includes('went_alone') && !flags.includes('end_oracle');
