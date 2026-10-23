import { registerPack, TargetDef, TargetPack } from './targetPacks';
import type { AbilityDef, AbilityKind } from './targetTypes';
import type { Branch } from './channels';
import type { StoryApproach } from './perks';

// ===========================================================================
// STORY MODE, SEASON 1: "THE RECEIPTS"
//
// You are the anonymous admin of a gist page called The Receipts. Your intern runs the schedule and keeps
// asking the awkward question: is it true, and is it worth it? Nine chapters, three acts. Every chapter has a motive
// (why you are doing this), a pace (a tier-sized clock) and a repercussion (your reputation, "integrity", carries
// forward and changes how much people trust the next story). All characters are invented. The cast is a normal
// content pack, in exactly the format the Target Studio exports.
// ===========================================================================

const A = (kind: AbilityKind, every: number, start: number, strength: number, stamp: string, headline: string, line: string, branch?: Branch): AbilityDef =>
  ({ kind, every, start, strength, stamp, headline, line, branch });

const story = (d: Omit<TargetDef, 'kind' | 'enabled' | 'storyOnly' | 'mods'> & { mods?: TargetDef['mods'] }): TargetDef =>
  ({ kind: 'STORY', enabled: true, storyOnly: true, mods: {}, ...d });

const CAST: TargetDef[] = [
  // ------------------------------------------------------------------ ACT 1: HEARTBREAK SEASON
  story({
    id: 'story_ex_boyfriend', tier: 1, fullName: 'Your Ex-Boyfriend', shortName: 'Your Ex', title: 'Borrowed Everything, Returned Nothing',
    personality: 'Charming on a Friday, unreachable by Monday. He borrows money like it is a love language.',
    avatar: { silhouette: 'hoodie', accent: '#B45309' },
    scandals: [
      { category: 'FINANCIAL', title: 'Owes You ₦2.4 Million and Has Blocked You on Four Apps' },
      { category: 'LEAKED_MEDIA', title: 'A Voice Note Calling Your Love "a Solid Investment"' },
      { category: 'AFFAIR', title: 'A Sudden "Cousin" Who Appears in Every Single Photo' }
    ],
    passiveName: 'Ghost Mode', passiveFlavor: 'He has been dodging bills for years. Dodging a rumour is the same muscle.',
    mods: { staleRate: 1.1 },
    abilities: [
      A('DISTRACTION', 8, 6, 10, 'GYM SELFIE', 'A Shirtless Gym Post Hijacks the Timeline', 'Nobody remembers the debt now. They are all commenting fire emojis under {Target}\'s abs.'),
      A('BOT_SWARM', 9, 8, 2, 'THE MUTUALS RALLY', 'His Mutuals Rush to Defend Him', '"He is a good guy, you do not know the full story," say fourteen accounts created last Tuesday.')
    ],
    ai: { defenseStyle: 'BALANCED', temperament: 'THE_CRASHOUT', weaknessBranch: 'SOCIAL', resistanceBranch: 'STREET', chatter: { onStart: 'Who is spreading lies about me? I have receipts too!', onCritical: 'You people are ruining a good man over a small loan!' } }
  }),
  story({
    id: 'story_ex_girlfriend', tier: 1, fullName: 'Your Ex-Girlfriend', shortName: 'Your Ex', title: 'Healer, Hoarder, Last-Word Collector',
    personality: 'A self-declared "healing coach" who still has your PlayStation, your laptop and the last word.',
    avatar: { silhouette: 'gele', accent: '#7C3AED' },
    scandals: [
      { category: 'FINANCIAL', title: 'Still Holds Your Laptop, Your PlayStation and Your Deposit' },
      { category: 'FAKE_CREDENTIALS', title: 'A "Certified Life Coach" Badge From a Site That No Longer Exists' },
      { category: 'LEAKED_MEDIA', title: 'A Group Chat Rating Everyone\'s Birthday Gifts Out of Ten' }
    ],
    passiveName: 'Story Time', passiveFlavor: 'She can turn any argument into a tearful video with soft piano music.',
    mods: { coverUpRate: 1.05 },
    abilities: [
      A('COUNTER_STORY', 9, 7, 5, 'TEARFUL STORY TIME', 'A Teary Video With Soft Piano Appears', '{Target} posts a ten-minute "my truth" video. Fourteen thousand people have reposted it already.'),
      A('HEAT_SURGE', 11, 9, 5, 'COUSIN THE LAWYER', 'A Lawyer Cousin Sends a Strongly Worded Letter', 'The letter has seventeen "heretofores" and one spelling mistake in the Target\'s name.')
    ],
    ai: { defenseStyle: 'SPIN_DOCTOR', temperament: 'THE_SHOWMAN', weaknessBranch: 'PRESS', resistanceBranch: 'SOCIAL', chatter: { onStart: 'I healed from you a long time ago, so why are you posting?', onCritical: 'I am choosing peace. Please stop making me choose violence.' } }
  }),
  story({
    id: 'story_cheating_girlfriend', tier: 1, fullName: 'Your Cheating Girlfriend', shortName: 'Your Girlfriend', title: 'Stuck in Traffic Every Thursday',
    personality: 'Sweet to your face, "stuck in traffic" for six hours at a time, and absolutely sure nobody checks tagged photos.',
    avatar: { silhouette: 'gele', accent: '#BE123C' },
    scandals: [
      { category: 'AFFAIR', title: 'Dinner Dates With Your Own Roommate' },
      { category: 'LEAKED_MEDIA', title: 'A Birthday Video Where She Forgot the Camera Was Rolling' },
      { category: 'FINANCIAL', title: 'Your Transfers Paid for Their Weekend in Ibadan' }
    ],
    passiveName: 'Plausible Deniability', passiveFlavor: 'Everything has an innocent explanation, and she keeps three of them ready.',
    mods: { doubtAdd: 10, coverUpRate: 1.25 },
    abilities: [
      A('DISTRACTION', 8, 6, 12, 'WHO TOLD YOU?', 'She Turns It Into a Trust Issue', 'The conversation is suddenly about how YOU "never trusted her", and the timeline loves a plot twist.'),
      A('COUNTER_STORY', 10, 8, 5, 'JUST FRIENDS', 'A Statement: "We Are Just Friends"', '{Target} posts a carousel titled "Men and their imaginations." It has twelve slides and no evidence.')
    ],
    ai: { defenseStyle: 'SPIN_DOCTOR', temperament: 'THE_SCHEMER', weaknessBranch: 'STREET', resistanceBranch: 'PRESS', chatter: { onStart: 'Whoever is gossiping, I will find out. I always find out.', onCritical: 'Okay, fine, we were at dinner. Dinner is not a crime!' } }
  }),
  story({
    id: 'story_cheating_boyfriend', tier: 1, fullName: 'Your Cheating Boyfriend', shortName: 'Your Boyfriend', title: 'Owner of Two Phones',
    personality: 'Owns a "work phone" that is only ever answered in the bathroom, and a tragic number of "cousins".',
    avatar: { silhouette: 'suit', accent: '#1D4ED8' },
    scandals: [
      { category: 'AFFAIR', title: 'A Second Phone He Calls His "Work Line"' },
      { category: 'FINANCIAL', title: 'Three Girlfriends, One Joint Account, Zero Explanations' },
      { category: 'LEAKED_MEDIA', title: 'A Wedding Guest Video Where He Is Definitely Not "Just Friends"' }
    ],
    passiveName: 'Smooth Talker', passiveFlavor: 'He can apologise without ever saying what he is sorry for.',
    abilities: [
      A('BOT_SWARM', 9, 7, 2, 'THE BOYS ARE ONLINE', 'His Friends Flood the Comments', '"Bro is a good guy," say eleven men who have also been to that wedding.'),
      A('HEAT_SURGE', 10, 9, 5, 'THREATENING DMS', 'He Starts Sending You Long Voice Notes', 'The voice notes are very calm and very long, and somebody has noticed your address is on file.')
    ],
    ai: { defenseStyle: 'BALANCED', temperament: 'THE_PARANOID', weaknessBranch: 'SOCIAL', resistanceBranch: 'ELITE', chatter: { onStart: 'Who told you? Was it Tunde? It was Tunde, wasn\'t it?', onCritical: 'I am deleting everything. Everything! Please!' } }
  }),
  story({
    id: 'story_former_bestie', tier: 2, fullName: 'Your Former Best Friend', shortName: 'Your Former Bestie', title: 'Knows Every Secret You Have',
    personality: 'Cried at your birthday, borrowed your business account, and has told everyone you "changed".',
    avatar: { silhouette: 'glasses', accent: '#0F766E' },
    scandals: [
      { category: 'FINANCIAL', title: 'Your Shared Business Money Became Her Dubai Trip' },
      { category: 'LEAKED_MEDIA', title: 'Screenshots of Your Secrets in a Group Called "Tea Time"' },
      { category: 'FAKE_CREDENTIALS', title: 'A "Business Degree" That Never Left the Admission Letter' }
    ],
    passiveName: 'Knows Where You Hide the Bodies', passiveFlavor: 'She was at every party. She remembers who said what, and to whom.',
    mods: { tagDoubt: { HYPER_ONLINE: 6 }, doubtAdd: 5, coverUpRate: 1.1 },
    abilities: [
      A('COUNTER_STORY', 8, 7, 7, 'THE LONG POST', 'An Emotional "I Gave Her My Everything" Post', 'Three thousand words, nine emojis, and one very sad throwback photo from 2019.'),
      A('DISTRACTION', 8, 9, 12, 'TAG A FRIEND', 'A Viral Challenge Takes Over', '{Target} joins a trending challenge. Your story is buried in a flood of sponsored smiles.'),
      A('BOT_SWARM', 10, 9, 3, 'THE SQUAD STEPS IN', 'Her Entire Friend Group Responds at Once', 'A coordinated wall of "we love you, babe" appears under every post about the Target.')
    ],
    ai: { defenseStyle: 'DISTRACTOR', temperament: 'THE_SCHEMER', weaknessBranch: 'PRESS', resistanceBranch: 'SOCIAL', chatter: { onStart: 'I know everything about you. Everything. Remember that.', onCritical: 'I never wanted it to come to this. I really, really did not.' } }
  }),

  // ------------------------------------------------------------------ ACT 2: HUSTLE AND GRIND
  story({
    id: 'story_colleague', tier: 3, fullName: 'Your Colleague', shortName: 'Your Colleague', title: 'Presents Your Work as His Own',
    personality: 'Presents your work as his own, always in a slightly bigger font, and thanks "the whole team" for your idea.',
    avatar: { silhouette: 'suit', accent: '#475569' },
    scandals: [
      { category: 'LEAKED_MEDIA', title: 'An Email Thread Where He Takes Credit for Your Entire Quarter' },
      { category: 'FAKE_CREDENTIALS', title: 'A CV With Three Certificates That Have No Serial Numbers' },
      { category: 'FINANCIAL', title: 'Taxi Receipts for Trips He Never Took' }
    ],
    passiveName: 'HR Is My Friend', passiveFlavor: 'He sends HR a coffee every Friday. It has never been mentioned. It never will be.',
    mods: { eliteFriction: 0.3, coverUpRate: 1.25 },
    abilities: [
      A('INJUNCTION', 12, 9, 2, 'HR HOLD', 'HR Quietly "Reviews" One of Your Channels', 'An "internal communications policy" appears overnight. Nobody can say who wrote it.', 'SOCIAL'),
      A('DISTRACTION', 10, 9, 7, 'COMPANY ANNOUNCEMENT', 'A Big Company Announcement Drops', 'The whole office is talking about the new coffee machine, and the story goes quiet.'),
      A('COUNTER_STORY', 12, 11, 5, 'EMPLOYEE OF THE MONTH', 'He Wins "Employee of the Month"', 'The plaque has a very flattering photo, and the all-staff email is eleven paragraphs long.')
    ],
    ai: { defenseStyle: 'LAWYER_UP', temperament: 'THE_STOIC', weaknessBranch: 'STREET', resistanceBranch: 'ELITE', chatter: { onStart: 'Let us keep this professional. Please route all questions through HR.', onCritical: 'I have forwarded this thread to the legal department. Twice.' } }
  }),
  story({
    id: 'story_business_partner', tier: 4, fullName: 'Your Business Partner', shortName: 'Your Partner', title: 'Sells the Vision, Spends the Money',
    personality: 'Sells "the vision" to anyone with a phone. The company account is empty and his Instagram is very, very full.',
    avatar: { silhouette: 'mic', accent: '#C2410C' },
    scandals: [
      { category: 'FINANCIAL', title: 'The Company Account Is Empty and His Instagram Is Not' },
      { category: 'FAKE_CREDENTIALS', title: 'A "30 Under 30" Badge Made in a Free Design App' },
      { category: 'AFFAIR', title: 'Hired His Girlfriend as "Head of Growth" With Your Money' }
    ],
    passiveName: 'The Vision Deck', passiveFlavor: 'Nobody has ever checked the numbers. They have only ever clapped at the slides.',
    mods: { doubtAdd: 0 },
    abilities: [
      A('DISTRACTION', 8, 6, 12, 'FUNDRAISE ANNOUNCEMENT', 'A Surprise "Funding Round" Is Announced', '{Target} tweets "excited to share." The investors, if they exist, are also excited.'),
      A('BOT_SWARM', 10, 8, 3, 'COMMUNITY BUILDERS', 'The "Community" Shows Up', 'A hundred accounts called "growth ninja" and "web3 sage" pile into the replies.'),
      A('HEAT_SURGE', 11, 10, 6, 'LEGAL THREAT', 'A Letter About "Reputational Harm" Arrives', 'The firm has a very long name, and a very quiet address in Lekki.')
    ],
    ai: { defenseStyle: 'SPIN_DOCTOR', temperament: 'THE_SHOWMAN', weaknessBranch: 'PRESS', resistanceBranch: 'STREET', chatter: { onStart: 'Haters are a sign that the vision is working.', onCritical: 'Everyone, please send me your support. I need it right now, in the group.' } }
  }),
  story({
    id: 'story_boss', tier: 3, fullName: 'Your Boss', shortName: 'Your Boss', title: 'Calls the Staff a Family',
    personality: 'Calls the staff "a family" while owing them seven months of salary. His SUV is very new and very shiny.',
    avatar: { silhouette: 'agbada', accent: '#1F2937' },
    scandals: [
      { category: 'FINANCIAL', title: 'Seven Months of Unpaid Salaries and a Brand-New SUV' },
      { category: 'FAKE_CREDENTIALS', title: 'An MBA From a University That Has Only a P.O. Box' },
      { category: 'LEAKED_MEDIA', title: 'An All-Hands Recording Calling Staff "Replaceable Furniture"' }
    ],
    passiveName: 'We Are a Family', passiveFlavor: 'Fear and loyalty hold the office together. The family part is only on the poster.',
    mods: { eliteFriction: 0.25, coverUpRate: 1.2 },
    abilities: [
      A('INJUNCTION', 9, 7, 3, 'NDA ENFORCED', 'The Staff Handbook Suddenly Has a Gag Clause', 'Every employee is reminded of Clause 14(b). Several channels go very quiet.'),
      A('HEAT_SURGE', 10, 9, 8, 'SECURITY REVIEW', 'Security Is "Reviewing" Your Access Badge', 'A very polite man in the lobby has taken a photo of your face, just in case.'),
      A('COUNTER_STORY', 12, 11, 8, 'GRATEFUL STAFF', '"Grateful Staff" Post a Thank-You Video', 'Eight employees in matching shirts, reading from the same paper, thank the boss for "the opportunity".')
    ],
    ai: { defenseStyle: 'LAWYER_UP', temperament: 'THE_STOIC', weaknessBranch: 'SOCIAL', resistanceBranch: 'ELITE', chatter: { onStart: 'I built this company with my bare hands. Who are you?', onCritical: 'The disciplinary committee will sit tonight. Everybody is invited.' } }
  }),

  // ------------------------------------------------------------------ ACT 3: HOME AND LEGACY
  story({
    id: 'story_in_law', tier: 3, fullName: 'Your Mother-in-Law', shortName: 'Your Mother-in-Law', title: 'Keeper of the Notebook',
    personality: 'Believes no one in the family can cook, dress or parent without her review. She keeps a notebook.',
    avatar: { silhouette: 'gele', accent: '#9D174D' },
    scandals: [
      { category: 'LEAKED_MEDIA', title: 'A Church Women\'s Meeting Where She Plans Your Wedding Menu Without You' },
      { category: 'FINANCIAL', title: 'Collected the Bride-Price Twice' },
      { category: 'AFFAIR', title: 'Secretly Behind Two Earlier Break-Ups in the Family' }
    ],
    passiveName: 'The Aunties Network', passiveFlavor: 'Her phone tree reaches every market, church and WhatsApp group in four states.',
    mods: { tagDoubt: { GRASSROOTS: 3 }, coverUpRate: 1.2 },
    abilities: [
      A('BOT_SWARM', 8, 6, 3, 'THE AUNTIES ASSEMBLE', 'Every Auntie in Four States Starts Typing', 'A forwarded message with a hundred prayer emojis and a sharp paragraph about "respect".'),
      A('COUNTER_STORY', 10, 8, 6, 'PRAYER AND FASTING', 'A Prayer Chain Against "Gossips" Begins', 'A twenty-one day fasting prayer is announced "for the one who is destroying this family".'),
      A('INJUNCTION', 11, 10, 2, 'FAMILY MEETING', 'A Family Meeting Silences a Channel', 'An uncle drives in from Enugu, and the group chat goes silent for three days.', 'STREET')
    ],
    ai: { defenseStyle: 'IRON_FIST', temperament: 'STEADY', weaknessBranch: 'PRESS', resistanceBranch: 'STREET', chatter: { onStart: 'Who is this child that is gossiping? Whose child is it?', onCritical: 'I did not raise anybody to disrespect me. Not in this family.' } }
  }),
  story({
    id: 'story_ex_husband', tier: 4, fullName: 'Your Ex-Husband', shortName: 'Your Ex-Husband', title: 'Reads Every Clause but One',
    personality: 'A lawyer who reads every clause except the one about being honest, and who loves a long, pointless footnote.',
    avatar: { silhouette: 'glasses', accent: '#374151' },
    scandals: [
      { category: 'FINANCIAL', title: 'Moved the House to His Mother Two Weeks Before the Divorce' },
      { category: 'AFFAIR', title: 'A "Research Assistant" Who Was Never Seen in the Office' },
      { category: 'LEAKED_MEDIA', title: 'A Recorded Call Coaching a Witness Before the Hearing' }
    ],
    passiveName: 'Home Court Advantage', passiveFlavor: 'He knows every judge, every clerk and every adjournment date in the state.',
    mods: { eliteFriction: 0.3, forgeryRisk: 0.05, coverUpRate: 1.25 },
    abilities: [
      A('INJUNCTION', 8, 6, 3, 'EX-PARTE ORDER', 'An Ex-Parte Order Lands on One of Your Channels', 'The order is stamped, signed and dated last Friday. Nobody has seen the hearing.'),
      A('HEAT_SURGE', 10, 8, 7, 'DEFAMATION SUIT', 'A ₦50 Million Defamation Suit Is Filed', 'A long document arrives. The word "malicious" appears eleven times.'),
      A('COUNTER_STORY', 11, 10, 7, 'CHARACTER WITNESSES', 'A Procession of Character Witnesses Speaks Up', 'Five men in the same blue suit declare that {Target} is "a gentleman of impeccable honour".')
    ],
    ai: { defenseStyle: 'LAWYER_UP', temperament: 'THE_STOIC', weaknessBranch: 'SOCIAL', resistanceBranch: 'ELITE', chatter: { onStart: 'I will respond in writing. Through counsel. Eventually.', onCritical: 'This is contempt, and I intend to say so, loudly, in open court.' } }
  }),
  story({
    id: 'story_ex_wife', tier: 4, fullName: 'Your Ex-Wife', shortName: 'Your Ex-Wife', title: 'Hosts the Brunch, Hides the Statement',
    personality: 'Hosts a "Women in Wealth" brunch every month and has never once let anybody see her bank statement.',
    avatar: { silhouette: 'gele', accent: '#6D28D9' },
    scandals: [
      { category: 'FINANCIAL', title: 'Moved the Joint Savings to an Account in Her Sister\'s Name' },
      { category: 'FAKE_CREDENTIALS', title: 'A "Chartered Accountant" Title She Never Earned' },
      { category: 'AFFAIR', title: 'A "Business Mentor" Who Always Pays for Dinner' }
    ],
    passiveName: 'Women in Wealth', passiveFlavor: 'Her brunch circle includes two board chairs and a very quiet judge.',
    mods: { eliteFriction: 0.3, coverUpRate: 1.3 },
    abilities: [
      A('COUNTER_STORY', 8, 6, 6, 'WOMEN IN WEALTH STATEMENT', 'The Brunch Circle Issues a Joint Statement', 'Fourteen women in white sign a letter about "toxic narratives that hurt strong women".'),
      A('DISTRACTION', 9, 8, 12, 'CHARITY GALA', 'A Surprise Charity Gala Fills Every Feed', 'Tickets sold out in an hour. Nobody is talking about the story now. They are all picking outfits.'),
      A('HEAT_SURGE', 11, 10, 6, 'REGULATOR\'S LETTER', 'A Regulator Opens a File on Your Page', 'A friend at the commission has "just checked in" on the legality of your account.')
    ],
    ai: { defenseStyle: 'SPIN_DOCTOR', temperament: 'THE_SCHEMER', weaknessBranch: 'STREET', resistanceBranch: 'ELITE', chatter: { onStart: 'Darling, I have had this conversation before. I won it.', onCritical: 'I am a private person. I am about to become a very public one.' } }
  }),
  story({
    id: 'story_mentor', tier: 5, fullName: 'Your Mentor', shortName: 'Your Mentor', title: 'The One Who Taught You Everything',
    personality: 'The man who taught you how to turn a rumour into a weapon, and never mentioned that he keeps the receipts on you.',
    avatar: { silhouette: 'robe', accent: '#111827' },
    scandals: [
      { category: 'FAKE_CREDENTIALS', title: 'A Doctorate From a Diploma Mill, Printed on Gold Paper' },
      { category: 'FINANCIAL', title: 'Sold 3,000 People a "Rumour Mastery" Course That Only Teaches His Brand' },
      { category: 'LEAKED_MEDIA', title: 'A Recorded Class Where He Teaches You to Burn People for Clicks' }
    ],
    passiveName: 'He Knows Your Method', passiveFlavor: 'You learned every trick from him. He knows exactly what you will do next.',
    mods: { coverUpRate: 1.3, doubtAdd: 4, eliteFriction: 0.3 },
    abilities: [
      A('INJUNCTION', 9, 7, 3, 'CEASE AND DESIST', 'He Sends a Cease-and-Desist on Letterhead You Designed', 'The letterhead is the logo you made for his workshop in 2021. It looks very good.'),
      A('HEAT_SURGE', 11, 9, 6, 'YOUR OWN PLAYBOOK', 'He Reports You Using the Rules He Wrote', 'Every platform policy he cites was in the course you took. Page 6.'),
      A('COUNTER_STORY', 12, 11, 7, 'THE LESSON', 'A Viral Video: "What I Taught My Greatest Student"', 'It is warm, wise and a little sad, and it is the most dangerous thing he has ever posted.')
    ],
    ai: { defenseStyle: 'SPIN_DOCTOR', temperament: 'THE_STOIC', weaknessBranch: 'SOCIAL', resistanceBranch: 'ELITE', chatter: { onStart: 'I wondered when you would come for me. I wrote the manual.', onCritical: 'You are only good because I made you. Everything you do, I taught.' } }
  })
];

export const STORY_PACK: TargetPack = {
  schema: 1,
  packId: 'story-season-1',
  name: 'Story Mode: Season 1, The Receipts',
  author: 'I Heard A Rumor team',
  version: 1,
  targets: CAST
};

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------
export interface StoryVariant {
  targetId: string;
  label: string;                                  // Choice label on the pair prompt
  teaser: string;                                 // One line on the choice card
  climateId: string;
  setting: string;                                // Scene-setting beat
  motive: string[];                               // Why you are doing this (shown as cards)
  approachNotes: Record<StoryApproach, string>;   // A line of colour under each approach for this chapter
  win: string[];                                  // Epilogue beats on victory
  lose: string;                                   // Epilogue on defeat
}

export interface StoryChapter {
  id: string;
  act: 1 | 2 | 3;
  title: string;
  kicker: string;
  pairPrompt?: string;
  variants: StoryVariant[];
}

export const ACTS: Record<1 | 2 | 3, { name: string; blurb: string }> = {
  1: { name: 'Heartbreak Season', blurb: 'Love, loyalty and the people who knew your password.' },
  2: { name: 'Hustle and Grind', blurb: 'Offices, partnerships and the slow theft of credit.' },
  3: { name: 'Home and Legacy', blurb: 'Family, courtrooms, and the man who made you.' }
};

export const STORY_PROLOGUE: string[] = [
  'You run The Receipts: an anonymous gist page with 41,000 followers and a very strict rule about screenshots.',
  'Your nineteen-year-old intern schedules the posts and asks the awkward questions. "Is it true? And is it worth it?"',
  'Nine stories. Every one of them is personal. Every one of them has receipts. How you tell them is up to you, and people are watching how you do it.'
];

export const APPROACHES: { id: StoryApproach; name: string; icon: string; blurb: string; effect: string; integrity: number }[] = [
  { id: 'truth', name: 'Receipts Only', icon: '🧾', blurb: 'Only what you can prove. Slower, but people believe you.', effect: 'Investigation starts at 30%. People start with 3% less Doubt.', integrity: 2 },
  { id: 'whatever', name: 'Whatever Works', icon: '🔥', blurb: 'Win first, explain later. Forgeries are easier to slip through.', effect: '+30 ⚡ to start, a bigger first spark, and forgeries are 40% less likely to be exposed.', integrity: -2 },
  { id: 'mercy', name: 'Soft Landing', icon: '🕊️', blurb: 'Keep it measured. Less heat, less drama, fewer enemies.', effect: 'Heat rises 20% slower, the story stays fresh longer, and the first injunction is blocked.', integrity: 1 }
];

const v = (
  targetId: string, label: string, teaser: string, climateId: string, setting: string, motive: string[],
  approachNotes: [string, string, string], win: string[], lose: string
): StoryVariant => ({ targetId, label, teaser, climateId, setting, motive, approachNotes: { truth: approachNotes[0], whatever: approachNotes[1], mercy: approachNotes[2] }, win, lose });

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'ch1', act: 1, title: 'The Ghost', kicker: 'The one who vanished', pairPrompt: 'Who ghosted you?',
    variants: [
      v('story_ex_boyfriend', 'My ex-boyfriend', 'He borrowed money and a few promises.', 'DETTY_DECEMBER',
        'Detty December in Lagos. Every feed is a party. Yours is a screenshot of a bank alert with a very sad balance.',
        ['He said "just till Friday". That was in March. It is now December and he has posted a new watch.',
         'Your intern slides your phone back to you. "You have the transfer receipts, the voice notes and a screenshot of him saying he is \'broke\'. In Dubai."',
         'You could ignore it. You could also hit publish.'],
        ['Every receipt, in order, with the dates. Your intern is oddly proud.', 'A bit of drama for engagement. Who is going to fact-check a feeling?', 'One short post, no names, just the dates. Let people connect the dots.'],
        ['The post lands at 9 PM. By midnight, forty people have tagged him. By morning, he has transferred ₦600,000 "as a gesture".', 'It is not the whole sum, but it is a start. He has blocked you on a fifth app. You are surprisingly fine with it.'],
        'He is still out there, posting gym selfies. The debt is still there too. Your intern says, quietly, "Next time, we get more receipts."'),
      v('story_ex_girlfriend', 'My ex-girlfriend', 'She kept your laptop and your last nerve.', 'DETTY_DECEMBER',
        'Detty December in Lagos. Every feed is a party. Yours is a screenshot of an empty desk where a laptop used to be.',
        ['She said she would "drop it off later". That was in March. It is now December and she has launched a coaching programme called "Healing Season".',
         'Your intern slides your phone back to you. "You have the receipts, the chat history and a very weak PDF of her certificate."',
         'You could ignore it. You could also hit publish.'],
        ['Every receipt, in order, with the dates. Your intern is oddly proud.', 'A bit of drama for engagement. Who is going to fact-check a feeling?', 'One short post, no names, just the dates. Let people connect the dots.'],
        ['The post lands at 9 PM. By midnight, fifty people have asked her about the certificate. By morning, your laptop is on your doorstep with a sticky note: "Be happy."', 'It is the closest thing to an apology you will get. You decide to take it and let it go.'],
        'She posts a ten-minute video about "protecting your peace". Fourteen thousand people agree. Your intern says, quietly, "Next time, we get more receipts."')
    ]
  },
  {
    id: 'ch2', act: 1, title: 'Two Phones', kicker: 'The one who lied', pairPrompt: 'Who cheated?',
    variants: [
      v('story_cheating_girlfriend', 'My girlfriend', 'Dinner with your roommate. Of course.', 'RAINY_SEASON',
        'Rainy season. The power is off and your phone is at 12%. A friend sends you a tagged photo that she has definitely never seen before.',
        ['She has been "stuck in traffic" every Thursday for two months. Tonight she is tagged at a candlelit dinner. With your roommate.',
         'Your intern whispers, "This is personal. Are you sure you want to use the page for this?"',
         'You are not sure. But you are very, very angry, and the screenshots are very, very clear.'],
        ['Only the timeline and the tagged photos. Nothing you cannot prove.', 'Make it unforgettable. The page has never cared about fairness.', 'Share only what is needed, and spare the roommate\'s mother.'],
        ['Her statement comes first, then her apology, then a very awkward moving-out day. Your roommate sends you a "bro, I am sorry" voice note you decide not to play.', 'It is over. Your intern makes you tea and says nothing, which is the kindest thing anyone has done all year.'],
        'She tells everyone you "never trusted her" and the story turns on you. Your intern says, quietly, "We should have waited for more proof."'),
      v('story_cheating_boyfriend', 'My boyfriend', 'A second phone. A lot of cousins.', 'RAINY_SEASON',
        'Rainy season. The power is off and your phone is at 12%. His second phone buzzes in the bathroom. Again.',
        ['He calls it his "work line". Work has never called at midnight, and work has never sent three hearts.',
         'Your intern whispers, "This is personal. Are you sure you want to use the page for this?"',
         'You are not sure. But you are very, very angry, and the screenshots are very, very clear.'],
        ['Only the timeline and the proof. Nothing you cannot prove.', 'Make it unforgettable. The page has never cared about fairness.', 'Share only what is needed, and spare the other people involved.'],
        ['His statement comes first, then his apology, then a very awkward "I will pick up my things on Saturday". He leaves the second phone.', 'It is over. Your intern makes you tea and says nothing, which is the kindest thing anyone has done all year.'],
        'He tells everyone you "have trust issues" and the story turns on you. Your intern says, quietly, "We should have waited for more proof."')
    ]
  },
  {
    id: 'ch3', act: 1, title: 'Tea Time', kicker: 'The one who knew everything',
    variants: [
      v('story_former_bestie', 'Your former best friend', 'She had a key to your life and your account.', 'SCANDAL_SEASON',
        'Scandal Season. Every page is hunting for a story, and your best friend of eleven years has just started a "Tea Time" group chat with your secrets in it.',
        ['She borrowed your business account for "two weeks". That was fourteen months ago. She went to Dubai in April.',
         'A mutual sends you screenshots from her group chat. They include things you only ever told her, in a bathroom, in tears, in 2019.',
         'Your intern says, "This is the hardest one yet. You know her better than anyone. She knows you too."'],
        ['Only the money, and the dates it left your account.', 'She knows your secrets. Fight fire with fire: make her secrets louder.', 'Keep it about the money, and leave her family and her past out of it.'],
        ['She calls you at 3 AM, crying. You listen for a very long minute. Then you ask for the money back.', 'It arrives in six instalments. Neither of you ever says "sorry". It is, somehow, enough.'],
        'She posts a three-thousand-word story about "betrayal by someone I loved". It is very good. Your intern says, quietly, "She learned from the best. You."')
    ]
  },
  {
    id: 'ch4', act: 2, title: 'Slide Deck', kicker: 'The one who took the credit',
    variants: [
      v('story_colleague', 'Your colleague', 'He presented your work. In a bigger font.', 'STRIKE_SEASON',
        'Strike Season. The office is half-empty and the Monday meeting is about "recognition". You get a thank-you for "the team". He gets a plaque.',
        ['He has turned your six months of work into a single slide with his name on it.',
         'You have the email thread. You have the version history. You also have a manager who "does not want drama before the audit".',
         'Your intern says, "The page has never done an office story. Are we sure about this?"'],
        ['Version history, timestamps and the CV discrepancy, in that order.', 'Make it viral. The office needs a lesson.', 'Keep it professional. Name the work, not the man.'],
        ['The thread goes round every WhatsApp group in the building. HR calls it "a regrettable misunderstanding" and quietly credits you on the project.', 'He transfers to the Abuja office. You are given a very small desk by a very large window.'],
        'HR rules that you "violated the communications policy". He gets a bonus. Your intern slides over a resignation template, jokingly. You almost take it.')
    ]
  },
  {
    id: 'ch5', act: 2, title: 'The Vision', kicker: 'The one who ran with the money',
    variants: [
      v('story_business_partner', 'Your business partner', 'The company account is empty. His Instagram is not.', 'ELECTION_YEAR',
        'Election Year. Everyone is selling a vision. Your partner is selling yours.',
        ['You and your partner founded the company together. Eight months later the account is empty, the "Head of Growth" is his girlfriend, and he has a new car.',
         'He tells every investor you "left". You did not leave. You were locked out of the shared drive on a Tuesday.',
         'Your intern says, "You have the bank statements. You also have a lawyer\'s phone number. Which one do we use first?"'],
        ['The bank statements, the invoices and the drive logs, published in order.', 'Leak everything, including the girlfriend. Burn it all down.', 'Share the financial facts only. Let the lawyers handle the rest.'],
        ['The statements spread through every founders\' group. Two investors withdraw before lunch. A third calls you "to hear your side."', 'The company is dissolved. You walk away with a third of what you put in, and a surprisingly peaceful week.'],
        'He announces a "pivot" and a funding round. Your post is buried under the news. Your intern says, quietly, "Maybe the lawyer first."')
    ]
  },
  {
    id: 'ch6', act: 2, title: 'The Family', kicker: 'The one who owed everyone',
    variants: [
      v('story_boss', 'Your boss', 'Seven months of salary and one very new SUV.', 'FUEL_SCARCITY',
        'Fuel Scarcity. Staff walk to work. The boss arrives in a brand-new SUV with a driver and three flags.',
        ['Your boss has called the staff "a family" for six years. He has paid them for none of the last seven months.',
         'Eleven coworkers have sent you their payslips, anonymously, through a form you never knew you had.',
         'Your intern says, "This is bigger than you. People are counting on this page. Please do not make it about you."'],
        ['Payslips, bank dates and the MBA records, verified one by one.', 'Name the SUV. Name the driver. Name the aunt. Make him feel it.', 'Focus on the unpaid salaries. Protect the staff who shared with you.'],
        ['The payslips are in a viral thread by midday. The Ministry of Labour calls the office. Three weeks later, salaries are paid in full.', 'Your boss resigns "to spend time with his family". It is the first time anyone has believed him.'],
        'The company shuts down the staff chat and fires two of your sources. Your intern is quiet for a long time. "We did that," he says. "Not him. We."')
    ]
  },
  {
    id: 'ch7', act: 3, title: 'The Aunties', kicker: 'The one who ran the family',
    variants: [
      v('story_in_law', 'Your mother-in-law', 'She keeps a notebook on everyone.', 'DETTY_DECEMBER',
        'December at the village. Fifty relatives, three generators and one very organised mother-in-law.',
        ['Your mother-in-law has planned your wedding menu, your honeymoon and your children\'s names. She has not asked you once.',
         'An aunt sends you a recording of the "Church Women\'s Meeting" where the plan is discussed. It is long, very specific and slightly hilarious.',
         'Your intern says, "This one is... a lot of fun, honestly. But it is also family."'],
        ['Only the recording, uncut, and let her words speak.', 'Make it viral. The aunties started this, and the aunties can finish it.', 'Keep it light and funny, and keep the family out of the comments.'],
        ['The recording is shared across four states in an afternoon. She calls it "a misunderstanding of tone". The menu is changed.', 'At the wedding, there is jollof rice and a surprisingly warm toast. She does not speak to you for a week. Then she asks for the recipe.'],
        'She calls a family meeting. You are not invited, but your name is on the agenda. Your intern says, quietly, "Maybe we should have called her first."')
    ]
  },
  {
    id: 'ch8', act: 3, title: 'Fine Print', kicker: 'The one who left', pairPrompt: 'Who was your spouse?',
    variants: [
      v('story_ex_husband', 'My ex-husband', 'A lawyer who read every clause but one.', 'SCANDAL_SEASON',
        'The Family Court is full of people who used to love each other. You wait in the corridor with a folder of receipts.',
        ['The divorce was supposed to be simple. Then you found out the house had moved to his mother two weeks before filing.',
         'Your ex-husband has an adjournment for every date and a witness for every blank space.',
         'Your intern says, "This is the biggest story we have ever had. And you have to be careful. This time, they have lawyers."'],
        ['Only the property records and the court filings, verified by a second source.', 'Burn it all. Include the "research assistant." Include everything.', 'Stick to the property. Keep the personal life out of it.'],
        ['The property records go viral. A judge raises her eyebrows at the next hearing, and the house goes back into the estate.', 'You leave the courtroom with half of everything and a strong urge to sleep for a week.'],
        'The defamation suit lands the same week. You settle. It costs more than the house. Your intern says, quietly, "We needed an even better lawyer."'),
      v('story_ex_wife', 'My ex-wife', 'A brunch circle and a very quiet bank account.', 'SCANDAL_SEASON',
        'The Family Court is full of people who used to love each other. You wait in the corridor with a folder of receipts.',
        ['The divorce was supposed to be simple. Then you found out the joint savings had moved to her sister\'s account three weeks before filing.',
         'Your ex-wife has a brunch circle that includes two board chairs and a quiet judge.',
         'Your intern says, "This is the biggest story we have ever had. And you have to be careful. This time, they have lawyers."'],
        ['Only the transfer records and the court filings, verified by a second source.', 'Burn it all. Include the "mentor." Include everything.', 'Stick to the money. Keep the personal life out of it.'],
        ['The transfer records go viral. A judge raises her eyebrows at the next hearing, and the savings go back into the joint estate.', 'You leave the courtroom with half of everything and a strong urge to sleep for a week.'],
        'The regulator\'s letter lands the same week. You settle. It costs more than the savings. Your intern says, quietly, "We needed an even better lawyer."')
    ]
  },
  {
    id: 'ch9', act: 3, title: 'The Mentor', kicker: 'The one who made you',
    variants: [
      v('story_mentor', 'Your mentor', 'He taught you everything. He kept the receipts on you.', 'SCANDAL_SEASON',
        'Scandal Season. Your page is now one of the biggest in the country. Its founder, your mentor, has just sent you a very polite email.',
        ['Your mentor taught you how to find a story, how to time a post and how to turn a rumour into a weapon.',
         'What he never taught you: that his doctorate is from a diploma mill, that his course is a funnel, and that the recordings of your first classes are very, very incriminating.',
         'Your intern says, "This is the last one. The one that decides what The Receipts really is. A page that tells the truth, or a page that wins."'],
        ['Only what you can prove: the doctorate, the funnel, the recordings. Let the truth be the weapon.', 'He taught you to play dirty. Use all of it, including his own tricks.', 'Tell the story with mercy. He made you, and he made mistakes too.'],
        ['The post lands at dawn. Your mentor\'s course is refunded to three thousand people by noon. He sends one final message: "Proud of you. And terrified."', 'You close the laptop. Your intern hands you a tea. You look at the 41,000 people who have been following the whole story, and you wonder what they will think of you next.'],
        'Your mentor posts a video called "What I Taught My Greatest Student". It is warm, wise and devastating. Your intern says, "He was always better at this than us. For now."')
    ]
  }
];

export const getChapter = (id: string): StoryChapter | undefined => STORY_CHAPTERS.find(c => c.id === id);
export const chapterIndex = (id: string): number => STORY_CHAPTERS.findIndex(c => c.id === id);

// The season's ending, decided by the reputation you built (integrity).
export interface SeasonEnding { id: string; title: string; body: string[] }
export const seasonEnding = (integrity: number): SeasonEnding => {
  if (integrity >= 5) return {
    id: 'folk_hero', title: 'The Receipts Were Real',
    body: ['People forward your posts without checking, because they know you already did.', 'A journalist asks to interview you for a profile called "The Honest Page". Your intern says, "You can say no." You say yes. You are very nervous. You are very proud.']
  };
  if (integrity <= -4) return {
    id: 'cautionary_tale', title: 'The Page Everybody Fears',
    body: ['Your posts are still shared, but the comments have changed: "Is this one true?" "Who will she go after next?"', 'Somebody has started a page called "The Receipts on The Receipts". Your intern stares at it for a long time. "We taught them how," he says.']
  };
  return {
    id: 'gist_royalty', title: 'Everybody Reads You',
    body: ['You are one of the biggest pages in the country. People read you with a mix of delight and fear, which, your intern says, is also called "being famous".', 'There is a message in your inbox from a new name. A very short one. "I have a story for you." You can almost hear the music start.']
  };
};

registerPack(STORY_PACK);
