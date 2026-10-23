import { Branch } from './channels';
import { AiProfile, ChatterLines, DefenseStyle, Temperament } from './targetTypes';

// One row per Target:
//   [defenseStyle, temperament, weaknessBranch (x1.25), resistanceBranch (x0.75), onStart, onCritical]
// The other three chatter beats (channel bought, evidence dropped, backfire) come from the temperament pools below,
// so a Crashout and a Stoic sound different even when the Target has no custom line for the moment.
type Row = [DefenseStyle, Temperament, Branch, Branch, string, string];

const ROWS: Record<string, Row> = {
  // ---------------- SPOTLIGHT ----------------
  lord_lambo: ['SPIN_DOCTOR', 'THE_CRASHOUT', 'PRESS', 'SOCIAL', 'Who is this? I am on a cruise. Follow me for the vibes.', 'You people have ruined my holiday. Blocked, blocked, blocked!'],
  daddy_freeze_frame: ['SPIN_DOCTOR', 'THE_STOIC', 'STREET', 'PRESS', 'Good morning, Nigeria. I have a short answer for the rumour. Wait for it.', 'Let me calmly say this. I have never been this calm in my life.'],

  // ---------------- TIER 1 ----------------
  skit_king: ['DISTRACTOR', 'THE_CRASHOUT', 'PRESS', 'SOCIAL', 'Cut! Cut! Who leaked the raw footage?', 'This is not part of the bit! This is NOT part of the bit!'],
  iyaloja_general: ['BALANCED', 'STEADY', 'PRESS', 'STREET', 'Who is saying my name in my market? Come and say it to my face.', 'My traders will shut the whole market. Try me.'],
  park_chairman: ['SPIN_DOCTOR', 'THE_CRASHOUT', 'SOCIAL', 'STREET', 'Na who dey talk? My boys will find you before sunrise.', 'You are playing with fire. Ask anybody at the park!'],
  fire_pastor: ['DISTRACTOR', 'THE_SHOWMAN', 'SOCIAL', 'ELITE', 'The Lord has told me about this. Anyone who touches the anointed will dry up!', 'I decree failure upon every tongue speaking against me!'],
  caution_landlord: ['BALANCED', 'THE_PARANOID', 'PRESS', 'STREET', 'It is my house. Nobody refunds caution fee in this estate.', 'Every tenant has been served a quit notice. Let us see who talks now.'],
  lga_councillor: ['BALANCED', 'THE_SCHEMER', 'SOCIAL', 'PRESS', 'I have commissioned ninety-nine projects. Check the budget.', 'The boreholes are real. They are just underground.'],
  owambe_dj: ['SPIN_DOCTOR', 'THE_SHOWMAN', 'PRESS', 'SOCIAL', 'Hype man, hype man! Who is dragging DJ Kpokpo? Play the next track!', 'You are killing my brand. I will cancel every one of you.'],
  trials_coach: ['DISTRACTOR', 'THE_SHOWMAN', 'PRESS', 'STREET', 'My boys will be in Europe by next month, I swear.', 'Parents, do not listen to them! The trial is Saturday!'],
  herbal_doctor: ['BALANCED', 'THE_CRASHOUT', 'PRESS', 'STREET', 'Whatever you have, I have a bitter root for it. Including this wahala.', 'These people are jealous of my cures. Ask the customers!'],
  forex_flexer: ['SPIN_DOCTOR', 'THE_CRASHOUT', 'PRESS', 'SOCIAL', 'Another day, another $500 profit. Follow the God of Forex.', 'The market is manipulated against me. Send more money to recover.'],
  land_guard: ['IRON_FIST', 'THE_PARANOID', 'PRESS', 'STREET', 'This land has been in my family since Adam. Move.', 'My boys are already at your address. Delete everything!'],
  slay_queen: ['SPIN_DOCTOR', 'THE_CRASHOUT', 'PRESS', 'SOCIAL', 'Soft life is a lifestyle, babes. Haters will hate.', 'Block, mute, report! This is cyber-bullying, I will sue everyone!'],
  forex_signals: ['SPIN_DOCTOR', 'THE_CRASHOUT', 'PRESS', 'SOCIAL', 'Signals dropping at 9 AM. VIP members only.', 'My lawyer is typing. Everyone in this group is getting removed.'],

  // ---------------- TIER 2 ----------------
  pothole_commissioner: ['BALANCED', 'THE_SCHEMER', 'SOCIAL', 'PRESS', 'The roads are in excellent condition. The potholes are a matter of perspective.', 'The contractor has been informed. The contractor is my cousin.'],
  nollywood_queen: ['DISTRACTOR', 'THE_SHOWMAN', 'PRESS', 'SOCIAL', 'Darlings, I will cry on camera if I must. But the truth is the truth.', 'This is a smear campaign! My cast will speak tonight!'],
  afrobeats_star: ['DISTRACTOR', 'THE_CRASHOUT', 'PRESS', 'SOCIAL', 'Wahala don come, but I no dey run. Stream the new single.', 'I have a billion streams. Who are you?'],
  vc_result_pending: ['LAWYER_UP', 'THE_STOIC', 'SOCIAL', 'ELITE', 'The Senate will issue a statement in due course. Results are pending.', 'I have been a professor for forty years. I will not dignify this.'],
  bank_md: ['LAWYER_UP', 'THE_SCHEMER', 'STREET', 'PRESS', 'Our fees are transparent and available on our website. In small print.', 'Every charge was disclosed. Our legal team has been notified.'],
  football_chairman: ['DISTRACTOR', 'STEADY', 'PRESS', 'STREET', 'We are focused on the next qualifier. All other matters are distractions.', 'The Federation has nothing to hide. The audit is pending.'],
  eze_ruler: ['BALANCED', 'THE_SHOWMAN', 'PRESS', 'STREET', 'One does not discuss palace matters in the market.', 'The elders have been informed. Be careful, young man.'],
  afro_bad_boy: ['SPIN_DOCTOR', 'THE_CRASHOUT', 'PRESS', 'SOCIAL', 'Bad boy no dey fear gist. Make una talk.', 'I will leave the country. I swear on my mother!'],
  ngo_queen: ['SPIN_DOCTOR', 'THE_SCHEMER', 'STREET', 'ELITE', 'Our foundation is dedicated to serving humanity. We welcome scrutiny.', 'Our children are the victims of this smear campaign!'],
  mavin_mogul: ['DISTRACTOR', 'THE_SHOWMAN', 'PRESS', 'SOCIAL', 'Everything is in the contract. Page 214, paragraph nine.', 'The roster has been briefed. Every single one of them.'],
  queen_afropop: ['DISTRACTOR', 'THE_SHOWMAN', 'PRESS', 'SOCIAL', 'Darlings, sequins do not lie.', 'I am cancelling the tour. And the sequins.'],
  cryptoking: ['SPIN_DOCTOR', 'THE_CRASHOUT', 'PRESS', 'SOCIAL', 'Number go up. This is FUD from short sellers. HODL.', 'You are about to crash the market. My bots are already moving.'],

  // ---------------- TIER 3 ----------------
  minister: ['LAWYER_UP', 'THE_STOIC', 'SOCIAL', 'PRESS', 'I hold a Toronto degree. Every one of you is welcome to apply for a visa.', 'My lawyers have already filed. Four suits. Before breakfast.'],
  distinguished_senator: ['LAWYER_UP', 'THE_STOIC', 'STREET', 'ELITE', 'I will not respond to rumours. I represent the people.', 'I will invoke the privileges of the Senate. Careful.'],
  subsidy_marketer: ['IRON_FIST', 'THE_PARANOID', 'SOCIAL', 'PRESS', 'Our records are with the regulator. Ask the regulator.', 'The regulator is a friend. A very close friend.'],
  telecom_tycoon: ['BALANCED', 'THE_PARANOID', 'PRESS', 'SOCIAL', 'Our network is performing optimally. Kindly restart your phone.', 'We are investigating suspicious traffic on our platform.'],
  cbn_deputy: ['LAWYER_UP', 'THE_SCHEMER', 'STREET', 'ELITE', 'The rate window is a matter of policy. I cannot discuss policy.', 'Speculation is damaging to the currency. Please stop.'],
  adjournment_judge: ['LAWYER_UP', 'THE_STOIC', 'SOCIAL', 'PRESS', 'The matter is adjourned to a date to be communicated.', 'This conduct is contempt. I will hold it in abeyance. For now.'],
  customs_controller: ['IRON_FIST', 'THE_PARANOID', 'SOCIAL', 'STREET', 'Every container was inspected. Every one. By hand.', 'My officers are tracing your sources. We always find them.'],
  presidency_spokesman: ['SPIN_DOCTOR', 'THE_SCHEMER', 'STREET', 'PRESS', 'Let me clarify. And then clarify my clarification.', 'I have no further clarifications. I only have denials.'],
  igp_everything: ['IRON_FIST', 'THE_PARANOID', 'SOCIAL', 'STREET', 'Operation Silence has commenced. Mischief makers will be arrested.', 'We are close. Very close. We know where you live.'],
  cement_sugar_baron: ['BALANCED', 'THE_SCHEMER', 'STREET', 'ELITE', 'The market sets the price. I merely own the market.', 'Our crisis team has been mobilised. Expect a statement.'],
  rapper_activist: ['BALANCED', 'STEADY', 'STREET', 'PRESS', 'The movement is bigger than any rumour.', 'They are afraid of a rapper with a microphone and a plan.'],
  comedian_king: ['DISTRACTOR', 'THE_SHOWMAN', 'STREET', 'SOCIAL', 'I have been roasted by better. Next question.', 'Stop laughing. This is serious. Okay, it is a little funny.'],
  televangelist: ['BALANCED', 'THE_STOIC', 'PRESS', 'STREET', 'Touch not the anointed, and do my prophets no harm.', 'My flock will pray against you. Millions of them. In unison.'],

  // ---------------- TIER 4 ----------------
  general_maradona: ['IRON_FIST', 'THE_PARANOID', 'SOCIAL', 'ELITE', 'I have seen wars. This is not a war. It is noise.', 'Retired generals do not retire from everything. Remember that.'],
  offshore_chief: ['LAWYER_UP', 'THE_SCHEMER', 'STREET', 'ELITE', 'My lawyers in London will respond. In due course. At their rates.', 'Every account is legal. In at least one jurisdiction.'],
  unicorn_founder: ['SPIN_DOCTOR', 'THE_SCHEMER', 'PRESS', 'SOCIAL', 'We are building the future. Critics are building a blog.', 'Our trust and safety team has noticed coordinated behaviour.'],
  prayer_jet_bishop: ['DISTRACTOR', 'THE_SHOWMAN', 'PRESS', 'STREET', 'The jet is a tool of the ministry. Like the pulpit.', 'This is spiritual warfare, and we have the bigger prayer army.'],
  senate_president: ['LAWYER_UP', 'THE_STOIC', 'SOCIAL', 'PRESS', 'Order, order. This house will not be distracted.', 'The privileges of this chamber are inviolable. Remember that.'],
  super_agent: ['SPIN_DOCTOR', 'THE_SCHEMER', 'STREET', 'SOCIAL', 'Every transfer was legitimate. I have the paperwork in Dubai.', 'My clients will be told not to speak to you. Ever.'],
  media_owner: ['SPIN_DOCTOR', 'THE_SCHEMER', 'SOCIAL', 'PRESS', 'My newspapers report the news. I own the newspapers. No conflict.', 'Pull the story. Pull the entire section if you must.'],
  second_term_governor: ['IRON_FIST', 'THE_SHOWMAN', 'PRESS', 'STREET', 'I have two terms. I intend to have a third. Constitution notwithstanding.', 'The state security will see you. Personally.'],
  brother_in_law: ['BALANCED', 'THE_PARANOID', 'STREET', 'ELITE', 'I am a businessman. My family is my family. These are unrelated.', 'I will make one phone call. Only one.'],
  diaspora_investor: ['SPIN_DOCTOR', 'THE_SCHEMER', 'STREET', 'PRESS', 'My investors abroad believe in me. You should too.', 'Our lawyers in London have been briefed. All of them.'],
  godfather: ['IRON_FIST', 'THE_STOIC', 'SOCIAL', 'ELITE', 'I have survived three governments. This is a Tuesday.', 'It has been a pleasure knowing you. Now I will make some calls.'],

  // ---------------- TIER 5 ----------------
  the_landslide: ['IRON_FIST', 'THE_STOIC', 'SOCIAL', 'PRESS', 'The Presidency does not respond to rumours. It responds to results.', 'Security chiefs to my office. Immediately.'],
  the_cabal: ['IRON_FIST', 'THE_PARANOID', 'STREET', 'ELITE', 'There is no cabal. There never was. Who told you about the cabal?', 'The matter will go away. Matters always go away.'],
  everybody_godfather: ['IRON_FIST', 'THE_SCHEMER', 'SOCIAL', 'ELITE', 'Every governor in this country owes me a favour. Do you wish to count them?', 'Make the calls. All of them. Tonight.'],
  mama_federation: ['IRON_FIST', 'THE_SCHEMER', 'SOCIAL', 'STREET', 'Nobody is appointed in this country without sitting in my living room.', 'My sons and daughters in every ministry have been informed.'],
  african_giant: ['DISTRACTOR', 'THE_SHOWMAN', 'PRESS', 'SOCIAL', 'Giant of Giants does not respond to small noise.', 'I sold out four continents. Who are you to question me?'],
  richest_man: ['BALANCED', 'THE_STOIC', 'STREET', 'ELITE', 'I employ a hundred thousand people. What do you employ?', 'There is a cheque for every problem. Even you.'],
  supreme_oracle: ['DISTRACTOR', 'THE_STOIC', 'PRESS', 'STREET', 'I foresaw this gossip last year. It is already in the prophecy.', 'The spirits have turned against your channel. Be warned.'],
  dictators_son: ['IRON_FIST', 'THE_PARANOID', 'SOCIAL', 'ELITE', 'My father ruled this country. I will not be questioned by bloggers.', 'My father\'s men have not retired. Neither have their files.'],
  central_bank_governor: ['BALANCED', 'THE_STOIC', 'STREET', 'ELITE', 'The currency is stable. Please ignore the queues.', 'A new policy is being announced. Everyone will be too busy to talk.'],
  chief_justice: ['LAWYER_UP', 'THE_STOIC', 'SOCIAL', 'PRESS', 'The judiciary speaks through judgments. Not through rumours.', 'Contempt proceedings have commenced. All of you.']
};

// ---- Temperament pools: reactive one-liners for the beats without a custom line ----
type Pool = Pick<ChatterLines, 'onChannelBought' | 'onEvidenceDropped' | 'onBackfire'>;
export type ChatterEvent = keyof ChatterLines;

const POOLS: Record<Temperament, Record<keyof Pool, string[]>> = {
  THE_CRASHOUT: {
    onChannelBought: ['Who gave them a microphone?!', 'Delete that! Delete it now!', 'They are everywhere. EVERYWHERE!', 'I will sue that channel. And its mother.', 'Somebody switch off that radio!'],
    onEvidenceDropped: ['That is fake! That is totally fake!', 'Where did they get that?! WHO LEAKED IT?!', 'It is edited! Everybody knows it is edited!', 'I am not sweating. You are sweating.', 'My lawyer is typing! He is typing right now!'],
    onBackfire: ['HA! Fake receipts! I told you!', 'Look at them now! Caught lying!', 'I told you all it was a smear campaign!', 'Hahaha! Now who is the fraud?', 'Screenshot this! Screenshot THIS!']
  },
  THE_STOIC: {
    onChannelBought: ['Noted.', 'Let them speak. Time is on my side.', 'A new voice. How tedious.', 'I have seen louder campaigns than this.', 'Let them tire themselves out.'],
    onEvidenceDropped: ['Impressive. Not impressive enough.', 'I expected this. Continue.', 'My lawyers will respond. Eventually.', 'Hm. Interesting document.', 'Everything has a context. Wait for it.'],
    onBackfire: ['Careless. Very careless.', 'You should have checked. I always check.', 'An amateur error. Thank you.', 'The file was forged. How unfortunate for you.', 'Patience always pays. Today it paid me.']
  },
  THE_SHOWMAN: {
    onChannelBought: ['Ladies and gentlemen, a new critic has entered the arena!', 'More cameras! I love it. Keep them rolling.', 'Another channel? The more the merrier!', 'Nobody tells my story better than me.', 'Is this being streamed? It should be.'],
    onEvidenceDropped: ['A plot twist! Wonderful. Wait for the sequel.', 'You call that a bombshell? I have bigger bombshells for breakfast.', 'Cue the dramatic music. I will respond with a song.', 'The audience will decide, darling.', 'Let me adjust my lighting before I answer.'],
    onBackfire: ['And THAT, ladies and gentlemen, is how it is done!', 'Applause, please. I accept your applause.', 'The truth has a beautiful sense of timing.', 'Cut! Print! That one is going in the highlight reel.', 'They really handed me the finale.']
  },
  THE_PARANOID: {
    onChannelBought: ['Who is behind this one? WHO?', 'They are coordinating. I can feel it.', 'Check the phones. Check every phone.', 'Somebody in this room is leaking.', 'Change the passwords. All of them. Twice.'],
    onEvidenceDropped: ['How did they GET that? Who is talking?', 'We have a mole. I knew we had a mole.', 'Trace the upload! Trace it NOW!', 'Lock the office. Nobody goes home.', 'They have been in my files. In my FILES.'],
    onBackfire: ['I KNEW it was a trap. I knew it!', 'See? They plant things. They always plant things.', 'Good. Now we know who to watch.', 'Their forger left fingerprints. Everywhere.', 'This proves everything I have been saying.']
  },
  THE_SCHEMER: {
    onChannelBought: ['Excellent. Let them build the stage.', 'Every new voice is one more thing I can use.', 'Interesting. I will send them a gift basket.', 'One more thread to pull, when the time comes.', 'Smile. They are watching.'],
    onEvidenceDropped: ['Just as planned. Carry on.', 'They found it. How kind of them.', 'This was always going to be the question. I have the answer ready.', 'Let them think they are winning.', 'Everything has a price. Even this.'],
    onBackfire: ['Oh, did the forgery not hold? What a shame.', 'The plant bloomed beautifully.', 'I only needed one wrong step. Thank you.', 'And so the trap closes.', 'Never trust a perfect document.']
  },
  STEADY: {
    onChannelBought: ['Another channel. They keep multiplying.', 'This is getting noisy.', 'Somebody is paying for this. Who?', 'They have friends in the press now.', 'Things are getting louder.'],
    onEvidenceDropped: ['That document is out of context.', 'They are throwing everything at me.', 'I need to speak to my lawyers.', 'This is harder than I thought.', 'We will get through this. We always do.'],
    onBackfire: ['Their evidence is fake. I knew it.', 'They have been exposed!', 'See? They are not credible.', 'A forged file. What did I say?', 'Finally, some sense.']
  }
};

const STYLE_FALLBACK = 'Nigerian politics is not for the faint of heart.';

// Builds a full profile from the short form. Content packs use this too: an author only has to write the opening and
// critical lines, and may override any of the other three.
export const buildAiProfile = (
  defenseStyle: DefenseStyle, temperament: Temperament, weaknessBranch: Branch, resistanceBranch: Branch,
  onStart: string, onCritical: string, overrides: Partial<ChatterLines> = {}
): AiProfile => {
  const pool = POOLS[temperament];
  return {
    defenseStyle,
    temperament,
    weaknessBranch,
    resistanceBranch,
    chatter: {
      onStart,
      onCritical,
      onChannelBought: overrides.onChannelBought || pool.onChannelBought[0],
      onEvidenceDropped: overrides.onEvidenceDropped || pool.onEvidenceDropped[0],
      onBackfire: overrides.onBackfire || pool.onBackfire[0]
    }
  };
};

export const AI_PROFILES: Record<string, AiProfile> = Object.fromEntries(
  Object.entries(ROWS).map(([id, [style, temper, weak, resist, onStart, onCritical]]) => [id, buildAiProfile(style, temper, weak, resist, onStart, onCritical)])
);

// Pick a line for an event. Beats with a pool vary; start and critical are per-Target.
export const pickChatter = (profile: AiProfile, event: ChatterEvent, rng: () => number = Math.random): string => {
  if (event === 'onStart' || event === 'onCritical') return profile.chatter[event] || STYLE_FALLBACK;
  const lines = POOLS[profile.temperament][event];
  return lines[Math.floor(rng() * lines.length)] ?? profile.chatter[event];
};
