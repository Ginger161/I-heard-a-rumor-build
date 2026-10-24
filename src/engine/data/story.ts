import { registerPack, TargetDef, TargetPack } from './targetPacks';
import type { AbilityDef, AbilityKind } from './targetTypes';
import type { Branch } from './channels';
import type { StoryApproach } from './perks';
import { allPlotEvents, plotOccurrences } from '../season/script';
import { registerPlotEvents } from '../events';

// ===========================================================================
// STORY MODE, SEASON 1: "THE RECEIPTS"
//
// One city (Lagos), one cast, three years, one conspiracy. You run an anonymous gist page called The Receipts. Your
// nineteen-year-old intern Biko (a 200-level student who sleeps in lecture halls) schedules the posts and asks the awkward
// question: is it true, and is it worth it? Every chapter is a person from your own life, and every one of them, when
// cornered, reaches for the SAME defence: a tearful statement in the Notes app, posted at 6:06 PM, signed "Peace and light."
// The signature belongs to your mentor, Dr. Bankole "Halo" Adeyemo, who taught you the trade and runs Halo Reputation
// Partners, the firm that sells that playbook to anyone with money and a secret. Act 1 plants the clue, Act 2 and 3 follow
// it through your job, your business and your family, and Act 4 walks up the ladder to the man himself.
//
// Thirteen chapters, four acts, one thread. Each chapter has a motive (why you are doing this), a pace (a tier-sized clock)
// and a repercussion (your reputation, "integrity", carries forward). Chapters that offer a choice of person (the ghost,
// the cheater, the spouse) stay neutral in later chapters ("your ex", "your spouse"), so the story reads the same either
// way. This is an adults' game: the gossip is crude and the language is rude. Every character is invented.
// ===========================================================================

const A = (kind: AbilityKind, every: number, start: number, strength: number, stamp: string, headline: string, line: string, branch?: Branch): AbilityDef =>
  ({ kind, every, start, strength, stamp, headline, line, branch });

const story = (d: Omit<TargetDef, 'kind' | 'enabled' | 'storyOnly' | 'mods'> & { mods?: TargetDef['mods'] }): TargetDef =>
  ({ kind: 'STORY', enabled: true, storyOnly: true, mods: {}, ...d });

const CAST: TargetDef[] = [
  // ------------------------------------------------------------------ ACT 1: HEARTBREAK SEASON
  story({
    id: 'story_ex_boyfriend', tier: 1, fullName: 'Your Ex-Boyfriend', shortName: 'Your Ex', title: 'Borrowed Your Money, Your Charger and Your Dignity',
    personality: 'Charming on Friday, "network problem" by Monday. He borrows money like it is foreplay, then loses interest the second you ask for it back.',
    avatar: { silhouette: 'hoodie', accent: '#B45309' },
    scandals: [
      { category: 'FINANCIAL', title: 'Owes You ₦2.4 Million and Has Blocked You on Four Apps' },
      { category: 'LEAKED_MEDIA', title: 'A Voice Note Telling His Boys You "Pay Bills Like a Sugar Mummy"' },
      { category: 'AFFAIR', title: 'A "Cousin" in Every Photo, and in His Boxers Once' }
    ],
    passiveName: 'Ghost Mode', passiveFlavor: 'He has dodged bills for years. Dodging a rumour is the same cardio.',
    mods: { staleRate: 1.1 },
    abilities: [
      A('DISTRACTION', 8, 6, 10, 'GYM SELFIE', 'A Shirtless Gym Post Hijacks the Timeline', 'Nobody remembers the debt now. Ten thousand people are typing "Daddy 🔥" under {Target}’s abs.'),
      A('BOT_SWARM', 9, 8, 2, 'THE MUTUALS RALLY', 'His Mutuals Rush to Defend Him', '"He is a good guy, you don’t know the full story," say fourteen accounts made last Tuesday. Two of them have no pants in the profile picture.')
    ],
    ai: { defenseStyle: 'BALANCED', temperament: 'THE_CRASHOUT', weaknessBranch: 'SOCIAL', resistanceBranch: 'STREET', chatter: { onStart: 'Who is lying on me? I have receipts too, and yours are embarrassing!', onCritical: 'You people are destroying a good man over a small loan! Small!' } }
  }),
  story({
    id: 'story_ex_girlfriend', tier: 1, fullName: 'Your Ex-Girlfriend', shortName: 'Your Ex', title: 'Healer, Hoarder, Last-Word Collector',
    personality: 'A self-declared "healing coach" who still has your PlayStation, your laptop, your good hoodie and the last word.',
    avatar: { silhouette: 'gele', accent: '#7C3AED' },
    scandals: [
      { category: 'FINANCIAL', title: 'Still Holds Your Laptop, Your PlayStation and Your Deposit' },
      { category: 'FAKE_CREDENTIALS', title: 'A "Certified Life Coach" Badge From a Site That No Longer Exists' },
      { category: 'LEAKED_MEDIA', title: 'A Group Chat Scoring Every Ex’s Performance Out of Ten' }
    ],
    passiveName: 'Story Time', passiveFlavor: 'She can turn any argument into a tearful video with soft piano music.',
    mods: { coverUpRate: 1.05 },
    abilities: [
      A('COUNTER_STORY', 9, 7, 5, 'TEARFUL STORY TIME', 'A Teary Video With Soft Piano Appears', '{Target} posts a ten-minute "my truth" video. Fourteen thousand people have reposted it. Nobody has watched past minute two.'),
      A('HEAT_SURGE', 11, 9, 5, 'COUSIN THE LAWYER', 'A Lawyer Cousin Sends a Strongly Worded Letter', 'The letter has seventeen "heretofores", one threat, and your name spelt wrong.')
    ],
    ai: { defenseStyle: 'SPIN_DOCTOR', temperament: 'THE_SHOWMAN', weaknessBranch: 'PRESS', resistanceBranch: 'SOCIAL', chatter: { onStart: 'I healed from you a long time ago. So why are you posting, babe?', onCritical: 'I am choosing peace. Please stop making me choose violence.' } }
  }),
  story({
    id: 'story_cheating_girlfriend', tier: 1, fullName: 'Your Cheating Girlfriend', shortName: 'Your Girlfriend', title: 'Stuck in Traffic Every Thursday',
    personality: 'Sweet to your face, "stuck in traffic" for six hours at a time, and completely sure nobody checks tagged photos.',
    avatar: { silhouette: 'gele', accent: '#BE123C' },
    scandals: [
      { category: 'AFFAIR', title: 'Candlelit Dinners With Your Roommate, Followed by a Very Long "Traffic Jam"' },
      { category: 'LEAKED_MEDIA', title: 'A Birthday Video Where She Forgot the Camera Was Rolling' },
      { category: 'FINANCIAL', title: 'Your Transfers Paid for Their Weekend in Ibadan' }
    ],
    passiveName: 'Plausible Deniability', passiveFlavor: 'Everything has an innocent explanation. She keeps three of them ready, and one is crying.',
    mods: { doubtAdd: 10, coverUpRate: 1.25 },
    abilities: [
      A('DISTRACTION', 8, 6, 12, 'WHO TOLD YOU?', 'She Turns It Into a Trust Issue', 'The conversation is suddenly about how YOU "never trusted her", and the timeline loves a plot twist.'),
      A('COUNTER_STORY', 10, 8, 5, 'JUST FRIENDS', 'A Statement: "We Are Just Friends"', '{Target} posts a carousel titled "Men and their imaginations." Twelve slides, no evidence, one very smug emoji.')
    ],
    ai: { defenseStyle: 'SPIN_DOCTOR', temperament: 'THE_SCHEMER', weaknessBranch: 'STREET', resistanceBranch: 'PRESS', chatter: { onStart: 'Whoever is gossiping, I will find out. I always find out.', onCritical: 'Okay, fine, we were at dinner. Dinner is not a crime, you psycho!' } }
  }),
  story({
    id: 'story_cheating_boyfriend', tier: 1, fullName: 'Your Cheating Boyfriend', shortName: 'Your Boyfriend', title: 'Owner of Two Phones and Zero Shame',
    personality: 'Owns a "work phone" that is only ever answered in the bathroom, and a tragic number of "cousins". Apologises without ever saying what for.',
    avatar: { silhouette: 'suit', accent: '#1D4ED8' },
    scandals: [
      { category: 'AFFAIR', title: 'A Second Phone He Calls His "Work Line" and Three Hearts at Midnight' },
      { category: 'FINANCIAL', title: 'Three Girlfriends, One Joint Account, Zero Explanations' },
      { category: 'LEAKED_MEDIA', title: 'A Wedding Guest Video Where He Is Definitely Not "Just Friends"' }
    ],
    passiveName: 'Smooth Talker', passiveFlavor: 'He can apologise for forty minutes and never once say what he is sorry for.',
    abilities: [
      A('BOT_SWARM', 9, 7, 2, 'THE BOYS ARE ONLINE', 'His Friends Flood the Comments', '"Bro is a good guy," say eleven men who have also been to that wedding and also left early with someone.'),
      A('HEAT_SURGE', 10, 9, 5, 'THREATENING DMS', 'He Starts Sending You Long Voice Notes', 'The voice notes are calm and very long, and someone has noticed your address is on file.')
    ],
    ai: { defenseStyle: 'BALANCED', temperament: 'THE_PARANOID', weaknessBranch: 'SOCIAL', resistanceBranch: 'ELITE', chatter: { onStart: 'Who told you? Was it Tunde? It was Tunde, wasn’t it?', onCritical: 'I am deleting everything. EVERYTHING. Please!' } }
  }),
  story({
    id: 'story_former_bestie', tier: 2, fullName: 'Your Former Best Friend', shortName: 'Your Former Bestie', title: 'Knows Every Secret You Have',
    personality: 'Cried at your birthday, borrowed your business account, and has told a group of forty-one people exactly what you said when drunk.',
    avatar: { silhouette: 'glasses', accent: '#0F766E' },
    scandals: [
      { category: 'FINANCIAL', title: 'Your Shared Business Money Became Her Dubai Trip' },
      { category: 'LEAKED_MEDIA', title: 'Screenshots of Your Worst Nights in a Group Called "Tea Time"' },
      { category: 'FAKE_CREDENTIALS', title: 'A "Business Degree" That Never Left the Admission Letter' }
    ],
    passiveName: 'Knows Where You Hide the Bodies', passiveFlavor: 'She was at every party. She remembers who said what, who kissed whom, and whose mother cried.',
    mods: { tagDoubt: { HYPER_ONLINE: 6 }, doubtAdd: 5, coverUpRate: 1.1 },
    abilities: [
      A('COUNTER_STORY', 8, 7, 7, 'THE LONG POST', 'An Emotional "I Gave Her My Everything" Post', 'Three thousand words, nine emojis, and one sad throwback photo from 2019 where you both look hot.'),
      A('DISTRACTION', 8, 9, 12, 'TAG A FRIEND', 'A Viral Challenge Takes Over', '{Target} joins a trending challenge. Your story is buried under sponsored smiles and one aggressively wiggling bum.'),
      A('BOT_SWARM', 10, 9, 3, 'THE SQUAD STEPS IN', 'Her Entire Friend Group Responds at Once', 'A coordinated wall of "we love you, babe" appears under every post about {Target}.')
    ],
    ai: { defenseStyle: 'DISTRACTOR', temperament: 'THE_SCHEMER', weaknessBranch: 'PRESS', resistanceBranch: 'SOCIAL', chatter: { onStart: 'I know everything about you. Everything. Remember that.', onCritical: 'I never wanted it to come to this. I really, really did not.' } }
  }),
  story({
    id: 'story_rival', tier: 3, fullName: 'Gistlord Prime', shortName: 'Gistlord', title: 'Rival Page Admin and Professional Blackmailer',
    personality: 'Runs the biggest rival gist page in town, sells "deletions" for ₦150,000 a post, and has just found out who you are.',
    avatar: { silhouette: 'mic', accent: '#0E7490' },
    scandals: [
      { category: 'FINANCIAL', title: 'Charges ₦150,000 to Delete a Post, Then Reposts It to the Next Client' },
      { category: 'AFFAIR', title: 'Slides Into Every Commenter’s DMs, Then Posts the Rejections' },
      { category: 'LEAKED_MEDIA', title: 'A Call Recording Selling the Same "Exclusive" to Both Sides of a Breakup' }
    ],
    passiveName: 'Receipts on the Receipts', passiveFlavor: 'He keeps a folder on every page admin in Lagos. Yours has your real name in it.',
    mods: { doubtAdd: 4, coverUpRate: 1.15 },
    abilities: [
      A('BOT_SWARM', 9, 7, 3, 'THE REPLY GUYS', 'A Hundred Blue Ticks Say "Who Is This Page Anyway?"', 'A wall of accounts with names like "TruthBro" and "Alpha Gist" ask whether anybody has seen your face. Their mothers have not.'),
      A('DISTRACTION', 10, 9, 10, 'EXCLUSIVE', 'He Drops a Bigger Rumour About Somebody Else', 'A celebrity’s alleged side-chick scandal drops at the exact minute your post goes live. It is, suspiciously, free.'),
      A('HEAT_SURGE', 11, 10, 6, 'THE UNMASKING', 'He Teases Your Real Name in a Story Poll', '"Should I say it?" asks {Target}, above a blurry photo of a lanyard. Forty thousand people vote yes.')
    ],
    ai: { defenseStyle: 'DISTRACTOR', temperament: 'THE_SHOWMAN', weaknessBranch: 'PRESS', resistanceBranch: 'SOCIAL', chatter: { onStart: 'Welcome to the big leagues, sweetheart. Say hi to your mother for me.', onCritical: 'I will say your name! I will say it on live! Don’t push me!' } }
  }),

  // ------------------------------------------------------------------ ACT 2: HUSTLE AND GRIND
  story({
    id: 'story_colleague', tier: 3, fullName: 'Your Colleague', shortName: 'Your Colleague', title: 'Presents Your Work as His Own',
    personality: 'Presents your work as his own, in a slightly bigger font, and thanks "the whole team" for your idea. Sleeps with the finance intern and the finance intern’s budget.',
    avatar: { silhouette: 'suit', accent: '#475569' },
    scandals: [
      { category: 'LEAKED_MEDIA', title: 'An Email Thread Where He Takes Credit for Your Entire Quarter' },
      { category: 'FAKE_CREDENTIALS', title: 'A CV With Three Certificates That Have No Serial Numbers' },
      { category: 'AFFAIR', title: 'Hotel Receipts With the Finance Intern, Coded as "Client Entertainment"' }
    ],
    passiveName: 'HR Is My Friend', passiveFlavor: 'He sends HR a coffee every Friday. It has never been mentioned. It never will be.',
    mods: { eliteFriction: 0.3, coverUpRate: 1.25 },
    abilities: [
      A('INJUNCTION', 12, 9, 2, 'HR HOLD', 'HR Quietly "Reviews" One of Your Channels', 'An "internal communications policy" appears overnight. Nobody can say who wrote it. It ends with "Peace and light."', 'SOCIAL'),
      A('DISTRACTION', 10, 9, 7, 'COMPANY ANNOUNCEMENT', 'A Big Company Announcement Drops', 'The whole office is talking about the new coffee machine, and the story goes quiet.'),
      A('COUNTER_STORY', 12, 11, 5, 'EMPLOYEE OF THE MONTH', 'He Wins "Employee of the Month"', 'The plaque has a flattering photo, and the all-staff email is eleven paragraphs long.')
    ],
    ai: { defenseStyle: 'LAWYER_UP', temperament: 'THE_STOIC', weaknessBranch: 'STREET', resistanceBranch: 'ELITE', chatter: { onStart: 'Let us keep this professional. Please route all questions through HR.', onCritical: 'I have forwarded this thread to legal. Twice. With a sad face.' } }
  }),
  story({
    id: 'story_boss', tier: 3, fullName: 'Your Boss', shortName: 'Your Boss', title: 'Calls the Staff a Family',
    personality: 'Calls the staff "a family" while owing them seven months of salary. His SUV is new and shiny, and so is his second wife.',
    avatar: { silhouette: 'agbada', accent: '#1F2937' },
    scandals: [
      { category: 'FINANCIAL', title: 'Seven Months of Unpaid Salaries and a Brand-New SUV' },
      { category: 'FAKE_CREDENTIALS', title: 'An MBA From a University That Has Only a P.O. Box' },
      { category: 'LEAKED_MEDIA', title: 'An All-Hands Recording Calling Staff "Replaceable Furniture"' }
    ],
    passiveName: 'We Are a Family', passiveFlavor: 'Fear and loyalty hold the office together. The family part is only on the poster.',
    mods: { eliteFriction: 0.25, coverUpRate: 1.2 },
    abilities: [
      A('INJUNCTION', 9, 7, 3, 'NDA ENFORCED', 'The Staff Handbook Suddenly Has a Gag Clause', 'Every employee is reminded of Clause 14(b). Several channels go very quiet, and a few people cry in the toilet.'),
      A('HEAT_SURGE', 10, 9, 8, 'SECURITY REVIEW', 'Security Is "Reviewing" Your Access Badge', 'A polite man in the lobby has taken a photo of your face, just in case.'),
      A('COUNTER_STORY', 12, 11, 8, 'GRATEFUL STAFF', '"Grateful Staff" Post a Thank-You Video', 'Eight employees in matching shirts, reading from the same paper, thank the boss for "the opportunity". One is blinking in Morse code.')
    ],
    ai: { defenseStyle: 'LAWYER_UP', temperament: 'THE_STOIC', weaknessBranch: 'SOCIAL', resistanceBranch: 'ELITE', chatter: { onStart: 'I built this company with my bare hands. Who are you?', onCritical: 'The disciplinary committee sits tonight. Everybody is invited.' } }
  }),
  story({
    id: 'story_business_partner', tier: 4, fullName: 'Your Business Partner', shortName: 'Your Partner', title: 'Sells the Vision, Spends the Money',
    personality: 'Sells "the vision" to anyone with a phone. The company account is empty, his Instagram is very full, and his girlfriend’s title is Head of Growth.',
    avatar: { silhouette: 'mic', accent: '#C2410C' },
    scandals: [
      { category: 'FINANCIAL', title: 'The Company Account Is Empty and His Instagram Is Not' },
      { category: 'FAKE_CREDENTIALS', title: 'A "30 Under 30" Badge Made in a Free Design App' },
      { category: 'AFFAIR', title: 'Hired His Girlfriend as "Head of Growth" and Paid Her Rent With Your Money' }
    ],
    passiveName: 'The Vision Deck', passiveFlavor: 'Nobody has ever checked the numbers. They have only ever clapped at the slides.',
    mods: { doubtAdd: 0 },
    abilities: [
      A('DISTRACTION', 8, 6, 12, 'FUNDRAISE ANNOUNCEMENT', 'A Surprise "Funding Round" Is Announced', '{Target} tweets "excited to share." The investors, if they exist, are also excited.'),
      A('BOT_SWARM', 10, 8, 3, 'COMMUNITY BUILDERS', 'The "Community" Shows Up', 'A hundred accounts called "growth ninja" and "web3 sage" pile into the replies. None have ever bought anything.'),
      A('HEAT_SURGE', 11, 10, 6, 'LEGAL THREAT', 'A Letter About "Reputational Harm" Arrives', 'The firm has a very long name and a quiet address in Lekki. Its letterhead ends with "Peace and light."')
    ],
    ai: { defenseStyle: 'SPIN_DOCTOR', temperament: 'THE_SHOWMAN', weaknessBranch: 'PRESS', resistanceBranch: 'STREET', chatter: { onStart: 'Haters are a sign the vision is working.', onCritical: 'Everyone, please send me love. I need it right now, in the group.' } }
  }),

  // ------------------------------------------------------------------ ACT 3: HOME AND LEGACY
  story({
    id: 'story_in_law', tier: 3, fullName: 'Your Mother-in-Law', shortName: 'Your Mother-in-Law', title: 'Keeper of the Notebook',
    personality: 'Believes no one in the family can cook, dress, pray or make a baby without her review. She keeps a notebook, and you are on page nine.',
    avatar: { silhouette: 'gele', accent: '#9D174D' },
    scandals: [
      { category: 'LEAKED_MEDIA', title: 'A Church Women’s Meeting Where She Plans Your Wedding Night, in Detail' },
      { category: 'FINANCIAL', title: 'Collected the Bride-Price Twice' },
      { category: 'AFFAIR', title: 'Secretly Behind Two Earlier Break-Ups in the Family' }
    ],
    passiveName: 'The Aunties Network', passiveFlavor: 'Her phone tree reaches every market, church and WhatsApp group in four states.',
    mods: { tagDoubt: { GRASSROOTS: 3 }, coverUpRate: 1.2 },
    abilities: [
      A('BOT_SWARM', 8, 6, 3, 'THE AUNTIES ASSEMBLE', 'Every Auntie in Four States Starts Typing', 'A forwarded message with a hundred prayer emojis and a sharp paragraph about "respect". Somebody has already booked a deliverance.'),
      A('COUNTER_STORY', 10, 8, 6, 'PRAYER AND FASTING', 'A Prayer Chain Against "Gossips" Begins', 'A twenty-one day fasting prayer is announced "for the one who is destroying this family". Your name is not mentioned. It is in all caps.'),
      A('INJUNCTION', 11, 10, 2, 'FAMILY MEETING', 'A Family Meeting Silences a Channel', 'An uncle drives in from Enugu, and the group chat goes silent for three days.', 'STREET')
    ],
    ai: { defenseStyle: 'IRON_FIST', temperament: 'STEADY', weaknessBranch: 'PRESS', resistanceBranch: 'STREET', chatter: { onStart: 'Who is this child that is gossiping? Whose child is it?', onCritical: 'I did not raise anybody to disrespect me. Not in this family.' } }
  }),
  story({
    id: 'story_ex_husband', tier: 4, fullName: 'Your Ex-Husband', shortName: 'Your Ex-Husband', title: 'Reads Every Clause but One',
    personality: 'A lawyer who reads every clause except the one about being honest, and who loves a long, pointless footnote. Best at ruining people politely.',
    avatar: { silhouette: 'glasses', accent: '#374151' },
    scandals: [
      { category: 'FINANCIAL', title: 'Moved the House to His Mother Two Weeks Before the Divorce' },
      { category: 'AFFAIR', title: 'A "Research Assistant" Who Was Never Seen in the Office, Only in His Shirts' },
      { category: 'LEAKED_MEDIA', title: 'A Recorded Call Coaching a Witness Before the Hearing' }
    ],
    passiveName: 'Home Court Advantage', passiveFlavor: 'He knows every judge, every clerk and every adjournment date in the state.',
    mods: { eliteFriction: 0.3, forgeryRisk: 0.05, coverUpRate: 1.25 },
    abilities: [
      A('INJUNCTION', 8, 6, 3, 'EX-PARTE ORDER', 'An Ex-Parte Order Lands on One of Your Channels', 'The order is stamped, signed and dated last Friday. Nobody has seen the hearing.'),
      A('HEAT_SURGE', 10, 8, 7, 'DEFAMATION SUIT', 'A ₦50 Million Defamation Suit Is Filed', 'A long document arrives. The word "malicious" appears eleven times, and "bitter" twice.'),
      A('COUNTER_STORY', 11, 10, 7, 'CHARACTER WITNESSES', 'A Procession of Character Witnesses Speaks Up', 'Five men in the same blue suit declare that {Target} is "a gentleman of impeccable honour". Three of them have slept with his wife.')
    ],
    ai: { defenseStyle: 'LAWYER_UP', temperament: 'THE_STOIC', weaknessBranch: 'SOCIAL', resistanceBranch: 'ELITE', chatter: { onStart: 'I will respond in writing. Through counsel. Eventually.', onCritical: 'This is contempt, and I will say so, loudly, in open court.' } }
  }),
  story({
    id: 'story_ex_wife', tier: 4, fullName: 'Your Ex-Wife', shortName: 'Your Ex-Wife', title: 'Hosts the Brunch, Hides the Statement',
    personality: 'Hosts a "Women in Wealth" brunch every month and has never once let anybody see her bank statement, or the man who pays for the mimosas.',
    avatar: { silhouette: 'gele', accent: '#6D28D9' },
    scandals: [
      { category: 'FINANCIAL', title: 'Moved the Joint Savings to an Account in Her Sister’s Name' },
      { category: 'FAKE_CREDENTIALS', title: 'A "Chartered Accountant" Title She Never Earned' },
      { category: 'AFFAIR', title: 'A "Business Mentor" Who Always Pays for Dinner and Stays for Breakfast' }
    ],
    passiveName: 'Women in Wealth', passiveFlavor: 'Her brunch circle includes two board chairs and a very quiet judge.',
    mods: { eliteFriction: 0.3, coverUpRate: 1.3 },
    abilities: [
      A('COUNTER_STORY', 8, 6, 6, 'WOMEN IN WEALTH STATEMENT', 'The Brunch Circle Issues a Joint Statement', 'Fourteen women in white sign a letter about "toxic narratives that hurt strong women". Four of them are her ex’s exes.'),
      A('DISTRACTION', 9, 8, 12, 'CHARITY GALA', 'A Surprise Charity Gala Fills Every Feed', 'Tickets sold out in an hour. Nobody is talking about the story now. They are all picking outfits.'),
      A('HEAT_SURGE', 11, 10, 6, 'REGULATOR’S LETTER', 'A Regulator Opens a File on Your Page', 'A friend at the commission has "just checked in" on the legality of your account. He sounded drunk and thorough.')
    ],
    ai: { defenseStyle: 'SPIN_DOCTOR', temperament: 'THE_SCHEMER', weaknessBranch: 'STREET', resistanceBranch: 'ELITE', chatter: { onStart: 'Darling, I have had this conversation before. I won it.', onCritical: 'I am a private person. I am about to become a very public one.' } }
  }),
  story({
    id: 'story_uncle', tier: 3, fullName: 'Your Uncle, the Landlord', shortName: 'Your Uncle', title: 'Sold the Family Land Twice and Pocketed Both',
    personality: 'The family’s "head", a big-bellied elder who calls every decision a tradition, every theft a loan, and every question a disrespect.',
    avatar: { silhouette: 'agbada', accent: '#78350F' },
    scandals: [
      { category: 'FINANCIAL', title: 'Sold the Family Compound to Two Different Buyers in One Week' },
      { category: 'FAKE_CREDENTIALS', title: 'A Chieftaincy Title Bought From a Village With No Chief' },
      { category: 'AFFAIR', title: 'A "Second Wife" Younger Than His Eldest Grandchild' }
    ],
    passiveName: 'Elders’ Council', passiveFlavor: 'Four old men who owe him favours can end any argument by clearing their throats.',
    mods: { eliteFriction: 0.3, tagDoubt: { GRASSROOTS: 3 }, coverUpRate: 1.1 },
    abilities: [
      A('INJUNCTION', 10, 7, 3, 'THE ELDERS SIT', 'The Elders Forbid Anyone From Talking', 'A kolanut is broken and a decision is announced. Whoever speaks of the land again is "cursed". Your phone goes quiet.', 'STREET'),
      A('COUNTER_STORY', 11, 9, 7, 'THE TITLE', 'He Is Crowned "Chief of Chiefs" on Live TV', 'A purple robe, a long staff and a grave voice. {Target} is now officially beyond question, according to himself.'),
      A('HEAT_SURGE', 12, 10, 7, 'BOYS AT THE GATE', 'Some Young Men Visit Your Mother’s House', 'They only came to "greet". They stayed four hours, ate everything, and left your mother’s gate hanging open.')
    ],
    ai: { defenseStyle: 'IRON_FIST', temperament: 'STEADY', weaknessBranch: 'SOCIAL', resistanceBranch: 'STREET', chatter: { onStart: 'Who is this small child, and who is her father?', onCritical: 'I will curse this whole lineage! I will! Bring the kolanut!' } }
  }),

  // ------------------------------------------------------------------ ACT 4: HALO
  story({
    id: 'story_fixer', tier: 4, fullName: 'Madam Ngozi, Halo’s Fixer', shortName: 'Madam Ngozi', title: 'Posts the Statements, Deletes the Evidence',
    personality: 'Halo’s chief of operations. She decides which apology goes live at 6:06 PM, which blogger gets paid, and which witness suddenly relocates to Ghana.',
    avatar: { silhouette: 'glasses', accent: '#4C1D95' },
    scandals: [
      { category: 'LEAKED_MEDIA', title: 'The Master Schedule of Every "Spontaneous" Apology She Has Ever Posted' },
      { category: 'FINANCIAL', title: 'A Black Account Paying Fourteen Bloggers to Say "Peace and Light"' },
      { category: 'FAKE_CREDENTIALS', title: 'A Law Licence She Has Not Renewed Since the Last Government' }
    ],
    passiveName: 'The 6:06 Machine', passiveFlavor: 'Twenty interns, one Notes-app template, and a pre-written tear for every occasion.',
    mods: { coverUpRate: 1.2, doubtAdd: 2, forgeryRisk: 0.03 },
    abilities: [
      A('COUNTER_STORY', 8, 6, 7, 'THE 6:06 STATEMENT', 'A Tearful Notes-App Statement Drops at 6:06 PM', 'Four paragraphs, no names, "Peace and light." It has been posted by nine accounts at once, each convinced it wrote it first.'),
      A('BOT_SWARM', 10, 8, 3, 'NOTES-APP ARMY', 'Twenty Interns Hit Reply at the Same Time', 'Twenty phones, one script. "I’m praying for her," they all type, each to a different timestamp and the same typo.'),
      A('DISTRACTION', 9, 9, 12, 'SCHEDULED SCANDAL', 'A Bigger Scandal Drops Right On Cue', 'Some other poor soul’s nudes "leak" at the exact minute your post lands. The timing is almost professional.')
    ],
    ai: { defenseStyle: 'SPIN_DOCTOR', temperament: 'THE_SCHEMER', weaknessBranch: 'STREET', resistanceBranch: 'SOCIAL', chatter: { onStart: 'Sweetheart, I deleted worse than you before breakfast.', onCritical: 'Who gave you the schedule? WHO GAVE YOU THE SCHEDULE?' } }
  }),
  story({
    id: 'story_client', tier: 4, fullName: 'Chief "Unbothered" Mbakwe', shortName: 'Chief Mbakwe', title: 'Halo’s Oldest, Dirtiest and Most Loyal Client',
    personality: 'A kingmaker who has never lost an election, an argument, or a witness. Calls everyone "my son" and means "my property".',
    avatar: { silhouette: 'crown', accent: '#7F1D1D' },
    scandals: [
      { category: 'FINANCIAL', title: 'A Road Contract That Paid for Everything Except the Road' },
      { category: 'AFFAIR', title: 'Three Households, Two Churches and One Very Confused Driver' },
      { category: 'FAKE_CREDENTIALS', title: 'A PhD in "Strategic Leadership" From a Man Called Kingsley' }
    ],
    passiveName: 'Never Loses', passiveFlavor: 'Twenty years of Halo’s statements have turned every scandal into a thanksgiving service.',
    mods: { eliteFriction: 0.3, coverUpRate: 1.15, doubtAdd: 2, counterHeat: 1 },
    abilities: [
      A('INJUNCTION', 9, 7, 3, 'COURT ORDER AT 2 AM', 'A Court Order Lands in the Middle of the Night', 'The judge was woken for it, and signed it with a pen from the Chief’s own shop. The hearing, naturally, is in Kano.', 'PRESS'),
      A('HEAT_SURGE', 10, 9, 8, 'DSS INVITATION', 'A Polite Letter Invites You for "A Chat"', 'Please bring a toothbrush. The letter is signed by a man who has never been seen in daylight.'),
      A('COUNTER_STORY', 12, 11, 8, 'THANKSGIVING SERVICE', 'A Thanksgiving Service for His "Vindication" Fills the Cathedral', 'Three bishops, one choir and a goat. The sermon is about "the persecution of the righteous". The goat is also persecuted.')
    ],
    ai: { defenseStyle: 'IRON_FIST', temperament: 'THE_STOIC', weaknessBranch: 'STREET', resistanceBranch: 'ELITE', chatter: { onStart: 'My son, do you know who I am? Do you know who I know?', onCritical: 'Call Halo. Call Halo NOW. Why is he not picking up?' } }
  }),
  story({
    id: 'story_mentor', tier: 5, fullName: 'Your Mentor, Dr. "Halo" Adeyemo', shortName: 'Your Mentor', title: 'The One Who Taught You Everything',
    personality: 'The man who taught you to turn a rumour into a weapon, and never mentioned that he writes the other side’s apology too. Signs every message "Peace and light."',
    avatar: { silhouette: 'robe', accent: '#111827' },
    scandals: [
      { category: 'FAKE_CREDENTIALS', title: 'A Doctorate From a Diploma Mill, Printed on Gold Paper' },
      { category: 'FINANCIAL', title: 'Sold 3,000 People a "Rumour Mastery" Course That Only Teaches His Brand' },
      { category: 'LEAKED_MEDIA', title: 'A Recorded Class Teaching You to Burn People for Clicks (and Bury the Ones Who Pay)' }
    ],
    passiveName: 'He Knows Your Method', passiveFlavor: 'You learned every trick from him. He knows exactly what you will do next, because he wrote it.',
    mods: { coverUpRate: 1.3, doubtAdd: 4, eliteFriction: 0.3 },
    abilities: [
      A('INJUNCTION', 9, 7, 3, 'CEASE AND DESIST', 'He Sends a Cease-and-Desist on Letterhead You Designed', 'The letterhead is the logo you made for his workshop in 2021. It looks very good. It ends with "Peace and light."'),
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
  version: 2,
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

export type Act = 1 | 2 | 3 | 4;

export interface StoryChapter {
  id: string;
  act: Act;
  title: string;
  kicker: string;
  pairPrompt?: string;
  variants: StoryVariant[];
}

export const ACTS: Record<Act, { name: string; blurb: string }> = {
  1: { name: 'Heartbreak Season', blurb: 'Love, loyalty and the people who knew your password.' },
  2: { name: 'Hustle and Grind', blurb: 'Offices, partners and the slow theft of credit.' },
  3: { name: 'Home and Legacy', blurb: 'Family, courtrooms and a compound full of liars.' },
  4: { name: 'Peace and Light', blurb: 'Everyone had the same script. Time to meet the author.' }
};

export const STORY_PROLOGUE: string[] = [
  'You run The Receipts: an anonymous gist page in Lagos with 41,000 followers, one strict rule about screenshots, and a very short fuse.',
  'Your nineteen-year-old intern Biko is a 200-level student who schedules your posts between lectures. He asks the awkward questions. "Is it true? And is it worth it?"',
  'Your mentor taught you everything: how to find a story, how to time a post, how to make a liar cry on cue. Dr. Bankole Adeyemo, whom the whole industry calls Halo. He answers every message within the hour. He signs them all the same way.',
  'Thirteen stories. All of them are personal, all of them have receipts, and every one of them, when cornered, will say the same thing. How you tell them is up to you, and people are watching how you do it.'
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

// Chapter ids are new in this version (c01..c13): progress saved under the old nine-chapter season (ch1..ch9) is ignored.
export const STORY_CHAPTERS: StoryChapter[] = [
  // ------------------------------------------------------------------ ACT 1
  {
    id: 'c01', act: 1, title: 'The Ghost', kicker: 'The one who vanished', pairPrompt: 'Who ghosted you?',
    variants: [
      v('story_ex_boyfriend', 'My ex-boyfriend', 'He borrowed money, a charger and your whole personality.', 'DETTY_DECEMBER',
        'Detty December in Lagos. Every feed is a beach party. Yours is a bank alert with a very sad balance, and a screenshot of him in Dubai in a cabana.',
        ['He said "just till Friday". That was March. It is now December, he is in a cabana, and he has a new watch that costs more than your rent.',
         'Your mentor writes: "Heard you had a rough one. Take your time with it. Peace and light."',
         'Your intern slides your phone back to you. "You have the transfer receipts, the voice notes and a screenshot of him saying he is \'broke\'. In Dubai. In a cabana. Boss. Hit publish."'],
        ['Every receipt, in order, with the dates. Biko is oddly proud.', 'A bit of drama for engagement. Who is going to fact-check a feeling?', 'One short post, no names, just the dates. Let people connect the dots.'],
        ['The post lands at 9 PM. By midnight forty people have tagged him. By morning he has transferred ₦600,000 "as a gesture". It is not the whole sum, but it is a start.',
         'At 6:06 PM his apology drops: three paragraphs in the Notes app, a tear emoji and "Peace and light." Your intern frowns at it. "Boss, he can’t write a sentence. Somebody wrote this for him."'],
        'He is still out there, posting gym selfies. The debt is still there too. Biko says, quietly, "Next time, we get more receipts."'),
      v('story_ex_girlfriend', 'My ex-girlfriend', 'She kept your laptop, your PlayStation and your last nerve.', 'DETTY_DECEMBER',
        'Detty December in Lagos. Every feed is a beach party. Yours is a picture of an empty desk where a laptop used to be.',
        ['She said she would "drop it off later". That was March. It is now December and she has launched a coaching programme called "Healing Season", on your laptop.',
         'Your mentor writes: "Heard you had a rough one. Take your time with it. Peace and light."',
         'Your intern slides your phone back to you. "You have the receipts, the chat history and a very weak PDF of her certificate. Also her group chat rating exes out of ten. You got a six. Boss, hit publish."'],
        ['Every receipt, in order, with the dates. Biko is oddly proud.', 'A bit of drama for engagement. Who is going to fact-check a feeling?', 'One short post, no names, just the dates. Let people connect the dots.'],
        ['The post lands at 9 PM. By midnight fifty people have asked her about the certificate. By morning your laptop is on your doorstep with a sticky note: "Be happy."',
         'At 6:06 PM her apology drops: a tearful video with soft piano and the caption "Peace and light." Your intern frowns. "She can’t even spell \'healing\'. Somebody wrote that for her."'],
        'She posts a ten-minute video about "protecting your peace". Fourteen thousand people agree. Biko says, quietly, "Next time, we get more receipts."')
    ]
  },
  {
    id: 'c02', act: 1, title: 'Two Phones', kicker: 'The one who lied', pairPrompt: 'Who cheated?',
    variants: [
      v('story_cheating_girlfriend', 'My girlfriend', 'Dinner with your roommate. Of course.', 'RAINY_SEASON',
        'Six months later. Rainy season. The power is off and your phone is at 12%. A friend sends a tagged photo she has definitely never seen before.',
        ['You dated again, because loneliness is stupid. She has been "stuck in traffic" every Thursday for two months. Tonight she is tagged at a candlelit dinner. With your roommate. His hand is not on the table.',
         'Your intern whispers, "This is personal. Are you sure you want to use the page for this?"',
         'You are not sure. But you are very, very angry, and the screenshots are very, very clear.'],
        ['Only the timeline and the tagged photos. Nothing you cannot prove.', 'Make it unforgettable. The page has never cared about fairness.', 'Share only what is needed, and spare the roommate’s mother.'],
        ['Her statement comes first, then her apology, then a very awkward moving-out day. Your roommate sends a "bro, I am sorry" voice note. You do not play it.',
         'The apology drops at exactly 6:06 PM, signed "Peace and light." Biko checks the other one on his phone. "Same time. Same sign-off. Same font. Boss, that’s two."'],
        'She tells everyone you "never trusted her" and the story turns on you. Biko says, quietly, "We should have waited for more proof."'),
      v('story_cheating_boyfriend', 'My boyfriend', 'A second phone. A lot of cousins.', 'RAINY_SEASON',
        'Six months later. Rainy season. The power is off and your phone is at 12%. His second phone buzzes in the bathroom. Again.',
        ['You dated again, because loneliness is stupid. He calls it his "work line". Work has never called at midnight, and work has never sent three hearts and a peach.',
         'Your intern whispers, "This is personal. Are you sure you want to use the page for this?"',
         'You are not sure. But you are very, very angry, and the screenshots are very, very clear.'],
        ['Only the timeline and the proof. Nothing you cannot prove.', 'Make it unforgettable. The page has never cared about fairness.', 'Share only what is needed, and spare the other people involved.'],
        ['His statement comes first, then his apology, then a very awkward "I will pick up my things on Saturday". He leaves the second phone. It rings twice while you pack his stuff.',
         'The apology drops at exactly 6:06 PM, signed "Peace and light." Biko checks the other one on his phone. "Same time. Same sign-off. Same font. Boss, that’s two."'],
        'He tells everyone you "have trust issues" and the story turns on you. Biko says, quietly, "We should have waited for more proof."')
    ]
  },
  {
    id: 'c03', act: 1, title: 'Tea Time', kicker: 'The one who knew everything',
    variants: [
      v('story_former_bestie', 'Your former best friend', 'She had a key to your life and your account.', 'SCANDAL_SEASON',
        'Scandal Season. Every page is hunting a story, and your best friend of eleven years has just started a "Tea Time" group chat with your secrets in it.',
        ['She borrowed your business account for "two weeks". That was fourteen months ago. She went to Dubai in April. She posted from a hot tub.',
         'A mutual sends you screenshots of the group chat. Things you only ever told her, drunk, in a bathroom, in 2019. Who you kissed. Who you cried over. The whole thing.',
         'Your intern says, "This is the hardest one yet. You know her better than anyone. She knows you too. Also, boss, there is an invoice in the screenshots. \'Halo Reputation Partners, Narrative Support, 3 clients.\' That’s your mentor’s company."'],
        ['Only the money, and the dates it left your account.', 'She knows your secrets. Fight fire with fire: make her secrets louder.', 'Keep it about the money, and leave her family and her past out of it.'],
        ['She calls you at 3 AM, crying. You listen for a very long minute. Then you ask for the money back. It arrives in six instalments. Neither of you ever says "sorry".',
         'Your mentor texts: "Proud of how you handled that. He consults for half of Lagos, Biko. Peace and light." You say it is nothing. Biko says nothing back for a long time.'],
        'She posts a three-thousand-word story about "betrayal by someone I loved". It is very good. Biko says, quietly, "She learned from the best. You."')
    ]
  },
  {
    id: 'c04', act: 1, title: 'Unmasked', kicker: 'The one who found out who you are',
    variants: [
      v('story_rival', 'Gistlord Prime', 'He sells deletions. He has your real name.', 'SLOW_NEWS',
        'A slow news week. Nothing is happening, which means everybody is looking at you. Gistlord Prime has posted a blurry picture of a lanyard and a poll that reads: "Should I say it?"',
        ['He runs the biggest rival page in Lagos. He charges ₦150,000 to delete a post, then reposts it to the next client. You have never liked him. He is the reason you started.',
         'He got your name from the Tea Time chat. Somebody in it sold your identity for a starter pack of followers. You can guess the exact amount.',
         'Your intern says, "If he says it, the page is dead. Your job is dead. Your landlord finds out. Boss, you’re going to have to say his first."'],
        ['Every deletion invoice, with the dates and the names of the paying victims.', 'Leak his DMs, the rejections folder and every "deleted" post. Let him taste his own product.', 'Show the racket, but leave the victims’ names out of it.'],
        ['The invoices land at noon. By three, nine of his "deleted" clients have confirmed it. Gistlord goes quiet for eleven hours, which for him is a coma.',
         'His last post before going dark: "You think you’re the only one he trained?" Then nothing. Biko reads it twice. "Boss. He trained all of us. Did you know that?"'],
        'He says your name on live. Four hundred thousand people hear it. Biko says, quietly, "We should have hit him first."')
    ]
  },

  // ------------------------------------------------------------------ ACT 2
  {
    id: 'c05', act: 2, title: 'Slide Deck', kicker: 'The one who took the credit',
    variants: [
      v('story_colleague', 'Your colleague', 'He presented your work. In a bigger font.', 'STRIKE_SEASON',
        'Year Two. Strike Season. By day you are a communications officer at Brightwater Group, the day job that pays your rent. Today is the Monday meeting about "recognition". You get a thank-you for "the team". He gets a plaque.',
        ['He turned six months of your work into one slide with his name on it. Then he started dating the finance intern, and expensing it as "client entertainment".',
         'You have the email thread, the version history and the hotel receipts. You also have a manager who "does not want drama before the audit".',
         'Your mentor writes: "Corporate is a game, darling. Win it quietly. Peace and light." Your intern says, "The page has never done an office story. Boss, are we sure about this?"'],
        ['Version history, timestamps and the hotel receipts, in that order.', 'Make it viral. The office needs a lesson, and a very loud one.', 'Keep it professional. Name the work, not the man or his lover.'],
        ['The thread goes round every WhatsApp group in the building. HR calls it "a regrettable misunderstanding" and quietly credits you on the project. He transfers to the Abuja office. You get a small desk by a large window.',
         'The HR email goes out at 6:06 PM. It ends: "Peace and light." Biko stares at the screen. "Boss. That is not an HR sign-off. That is a signature."'],
        'HR rules that you "violated the communications policy". He gets a bonus. Biko slides over a resignation template, jokingly. You almost take it.')
    ]
  },
  {
    id: 'c06', act: 2, title: 'The Family', kicker: 'The one who owed everyone',
    variants: [
      v('story_boss', 'Your boss', 'Seven months of salary and one very new SUV.', 'FUEL_SCARCITY',
        'Fuel Scarcity. Staff walk to work. The boss arrives in a brand-new SUV with a driver, a flag, and his second wife in the passenger seat wearing earrings that cost your annual pay.',
        ['Your boss has called the staff "a family" for six years. He has paid them nothing for seven months, and the "Staff Welfare Fund" has not welfared anybody since the last government.',
         'Eleven coworkers have sent you their payslips anonymously through a form you didn’t know you had.',
         'Your intern says, "This is bigger than you. People are counting on this page. Please do not make this about you. Also the SUV has a name. It’s called Daddy."'],
        ['Payslips, bank dates and the MBA records, verified one by one.', 'Name the SUV. Name the driver. Name the wife. Make him feel it.', 'Focus on the unpaid salaries. Protect the staff who shared with you.'],
        ['The payslips go viral by midday. The Ministry of Labour calls the office. Three weeks later, salaries are paid in full. Your boss resigns "to spend time with his family". It is the first time anyone has believed him.',
         'The resignation letter goes live at 6:06 PM. It closes with: "Peace and light." Biko says, "Boss. I counted. That’s four. Four different people. One sign-off. Who is doing this?"'],
        'The company shuts down the staff chat and fires two of your sources. Biko is quiet for a long time. "We did that," he says. "Not him. We."')
    ]
  },
  {
    id: 'c07', act: 2, title: 'The Vision', kicker: 'The one who ran with the money',
    variants: [
      v('story_business_partner', 'Your business partner', 'The company account is empty. His Instagram is not.', 'ELECTION_YEAR',
        'Election Year. Everyone is selling a vision. After the Brightwater mess you took your severance and started a company with someone you trusted. He is selling your vision now, with his face on it.',
        ['The company was supposed to give market women instant loans. It has one customer, a lot of "sprint planning" and a Head of Growth who is also his girlfriend.',
         'He tells every investor you "left". You didn’t leave. You were locked out of the shared drive on a Tuesday, mid-sentence.',
         'Your intern says, "You have the bank statements and a lawyer’s number. Which one do we use first? Also the pitch deck has a design watermark. \'Halo Studio\'. Boss, Halo made his deck."'],
        ['The bank statements, the invoices and the drive logs, published in order.', 'Leak everything, including the girlfriend’s rent. Burn it down.', 'Share the financial facts only. Let the lawyers handle the rest.'],
        ['The statements spread through every founders’ group. Two investors withdraw before lunch. A third calls you "to hear your side". The company is dissolved. You walk away with a third of what you put in, and a quiet week.',
         'His farewell post goes live at 6:06 PM: "Wishing everyone peace and light." Biko lines up the posts on the table. "Five. Five people. Same hour. Same words. Boss, somebody is running a factory."'],
        'He announces a "pivot" and a funding round. Your post is buried under the news. Biko says, quietly, "Maybe the lawyer first."')
    ]
  },

  // ------------------------------------------------------------------ ACT 3
  {
    id: 'c08', act: 3, title: 'The Aunties', kicker: 'The one who ran the family',
    variants: [
      v('story_in_law', 'Your mother-in-law', 'She keeps a notebook on everyone, and you are on page nine.', 'DETTY_DECEMBER',
        'Detty December again, this time in the village. Fifty relatives, three generators and one extremely organised mother-in-law. You and your spouse are getting married. She has not asked you a single question.',
        ['Your mother-in-law has planned your wedding menu, your honeymoon, your children’s names, and how soon you should have them. She says it in front of everyone, in the voice she uses for hymns.',
         'An aunt sends you a recording of the Church Women’s Meeting where the plan is discussed. It is long, specific and unbelievably funny. There is a section about your thighs.',
         'Your mentor writes: "Weddings are the real war, darling. Choose your battles. Peace and light." Your intern says, "This one is... a lot of fun, honestly. But it is also family."'],
        ['Only the recording, uncut, and let her words speak.', 'Make it viral. The aunties started this, and the aunties can finish it.', 'Keep it light and funny, and keep the family out of the comments.'],
        ['The recording spreads across four states in an afternoon. She calls it "a misunderstanding of tone". The menu is changed. At the wedding there is jollof and a surprisingly warm toast. She does not speak to you for a week. Then she asks for the recipe.',
         'The family statement lands at 6:06 PM: "We forgive all and hold no grudges. Peace and light." Biko goes very still. "She has a pastor, boss. Not a publicist. Why does she have the sign-off?"'],
        'She calls a family meeting. You are not invited, but your name is on the agenda. Biko says, quietly, "Maybe we should have called her first."')
    ]
  },
  {
    id: 'c09', act: 3, title: 'Fine Print', kicker: 'The one who left', pairPrompt: 'Who was your spouse?',
    variants: [
      v('story_ex_husband', 'My ex-husband', 'A lawyer who read every clause but one.', 'SCANDAL_SEASON',
        'Eighteen months of marriage later. The Family Court is full of people who used to love each other. You wait in the corridor with a folder of receipts and a bad feeling about the air conditioner.',
        ['The divorce was supposed to be simple. Then you found out the house had moved to his mother two weeks before filing. She cried at the wedding. She cried the loudest.',
         'Your ex-husband has an adjournment for every date and a witness for every blank space. His "research assistant" has never been seen in the research office, only in his shirts.',
         'Your intern says, "This is the biggest story we have ever had. You have to be careful. This time, they have lawyers. Also, boss, his lawyer’s email footer says \'Halo Legal Partners\'."'],
        ['Only the property records and the court filings, verified by a second source.', 'Burn it all. Include the "research assistant." Include everything.', 'Stick to the property. Keep the personal life out of it.'],
        ['The property records go viral. A judge raises her eyebrows at the next hearing, and the house goes back into the estate. You leave the courtroom with half of everything and a strong urge to sleep for a week.',
         'His statement goes live at 6:06 PM, outside the courthouse: "I wish her only peace and light." Biko sets his phone on the steps. "Six. Boss, it’s always the same hour. It’s not a coincidence. It’s a clock."'],
        'The defamation suit lands the same week. You settle. It costs more than the house. Biko says, quietly, "We needed a better lawyer."'),
      v('story_ex_wife', 'My ex-wife', 'A brunch circle and a very quiet bank account.', 'SCANDAL_SEASON',
        'Eighteen months of marriage later. The Family Court is full of people who used to love each other. You wait in the corridor with a folder of receipts and a bad feeling about the air conditioner.',
        ['The divorce was supposed to be simple. Then you found out the joint savings had moved to her sister’s account three weeks before filing. She said "I love you" on the way to the bank.',
         'Your ex-wife has a brunch circle that includes two board chairs and a quiet judge. Her "business mentor" always pays for dinner and has a toothbrush in her bathroom.',
         'Your intern says, "This is the biggest story we have ever had. You have to be careful. This time, they have lawyers. Also, boss, the brunch invitations have a logo. \'Halo Events\'."'],
        ['Only the transfer records and the court filings, verified by a second source.', 'Burn it all. Include the "mentor". Include everything.', 'Stick to the money. Keep the personal life out of it.'],
        ['The transfer records go viral. A judge raises her eyebrows at the next hearing, and the savings go back into the joint estate. You leave the courtroom with half of everything and a strong urge to sleep for a week.',
         'Her statement goes live at 6:06 PM, outside the courthouse: "I wish him only peace and light." Biko sets his phone on the steps. "Six. Boss, it’s always the same hour. It’s not a coincidence. It’s a clock."'],
        'The regulator’s letter lands the same week. You settle. It costs more than the savings. Biko says, quietly, "We needed a better lawyer."')
    ]
  },
  {
    id: 'c10', act: 3, title: 'The Compound', kicker: 'The one who sold home',
    variants: [
      v('story_uncle', 'Your uncle', 'He sold the family land twice and pocketed both.', 'HARMATTAN',
        'Harmattan. Dust in the air, dust in the throat, and a "For Sale" board nailed to the gate of the compound where you grew up. Your mother is standing next to it, holding her wrapper.',
        ['Your uncle is the family head. He sold the compound to two different buyers in one week and has now gone to "seek the ancestors" in a hotel in Abuja. Both buyers have bulldozers.',
         'Your mother has lived in that house for forty-one years. You post one clip of her crying at the gate and it gets two million views. Everyone wants to know who the man in the purple robe is.',
         'Your mentor writes: "Family is where the real scandals live, darling. Tread gently. Peace and light." Biko says, "Boss, he has a chieftaincy title. From a village with no chief. I checked."'],
        ['Both sale agreements, the survey plans and the title records, side by side.', 'Go for the second wife and the title. Humiliate him in front of the elders.', 'Protect your mother. Focus on the land, and let the elders save face.'],
        ['The agreements spread. One buyer pulls out; the other discovers he bought a very expensive swamp. The elders summon your uncle, who arrives in a purple robe and leaves in a taxi. The compound is saved, and your mother puts the board in the kitchen as a chopping board.',
         'His public apology goes up at 6:06 PM: "I ask the family for peace and light." Biko turns the screen so you can see it. "Boss, he can’t read. He needs the lines read to him. Someone sent him this. Someone with a schedule."'],
        'The elders announce that the matter is "closed". Your phone goes quiet. Biko says, quietly, "We underestimated the kolanut."')
    ]
  },

  // ------------------------------------------------------------------ ACT 4
  {
    id: 'c11', act: 4, title: 'The Factory', kicker: 'The one who posts at 6:06',
    variants: [
      v('story_fixer', 'Halo’s fixer', 'She runs the Notes-app factory.', 'BLACKOUT_WEEK',
        'Blackout Week. No power, no light, no signal, except a single office in Ikoyi where twenty interns are typing the same four paragraphs on twenty identical phones.',
        ['Biko has tracked the sign-off to a firm: Halo Reputation Partners. Same template, same hour, same typo in the word "forgiveness". The face behind the schedule is Madam Ngozi, Halo’s chief of operations.',
         'Every ex, every colleague, every partner, every uncle. Every single one of them used the factory. You were in the room the whole time. You were in the course.',
         'Your intern says, "She doesn’t post for you, boss. She posts against you. She has been writing your enemies’ apologies since the day you started. Why would your mentor sell the other side your strategy?"'],
        ['The master schedule, the invoices and the payments to fourteen bloggers, in order.', 'Leak the entire interns’ chat. Include the \'sad piano\' folder.', 'Show the machine, and protect the interns. They’re students, not villains.'],
        ['The schedule goes live on every page that will take it. Fourteen bloggers delete their posts and three of them post apologies, at 6:06 PM, without being asked. Madam Ngozi resigns by SMS.',
         'Her last message to you: "He keeps files on everyone, you know. Even you. Ask him about the Hilux." Then she turns off her phone for the first time in nine years.'],
        'The factory posts a statement calling the schedule "fabricated by a bitter former associate". It goes up at 6:06 PM. Biko says, quietly, "They’re faster than us. They always have been."')
    ]
  },
  {
    id: 'c12', act: 4, title: 'The Client', kicker: 'The one Halo protects',
    variants: [
      v('story_client', 'Chief Mbakwe', 'Halo’s oldest, dirtiest and most loyal client.', 'ELECTION_YEAR',
        'Election Year. Every billboard in Lagos has the same smiling face: Chief "Unbothered" Mbakwe, a man who has never lost an election, an argument or a witness.',
        ['The schedule led to a name. Halo’s oldest client has paid for twenty years of "reputation management": fourteen scandals, nine inquiries, two dead witnesses and one very confused driver. Halo wrote the apology for every one.',
         'The files you need are in Halo’s safe. The only way to open it is to put the client on the front page. The Chief’s people know. So does the DSS.',
         'Your intern says, "Boss. This is not an ex. This is not a boss. This is the real thing. If you do this, you don’t get to be anonymous afterwards. Are you sure?"'],
        ['Every contract, every payment and every witness statement, verified by a second source and a third.', 'Burn it down. The Chief has never been gentle with anyone, and he has earned none.', 'Tell it plainly and leave his family out of it. They are not the story.'],
        ['The contracts spread, the opposition seizes them, and by midnight the Chief’s own party is calling for a "full investigation". He cancels a thanksgiving service. Three bishops resign from the programme.',
         'His statement goes up at 6:06 PM, and for the first time it goes out late. It is signed "Peace and light." Under it, in the comments, somebody has typed: "Halo wrote this." Ten thousand people agree.'],
        'The Chief’s lawyers get a court order in the middle of the night. Biko says, quietly, "He has a judge. He always had a judge."')
    ]
  },
  {
    id: 'c13', act: 4, title: 'Peace and Light', kicker: 'The one who made you',
    variants: [
      v('story_mentor', 'Your mentor', 'He taught you everything. He kept the receipts on you.', 'SCANDAL_SEASON',
        'Scandal Season. Your page is now one of the biggest in the country. Its founder, your mentor, has just sent you a very polite email. The subject line is "We should talk." It ends with a smiley face.',
        ['Your mentor taught you how to find a story, how to time a post and how to turn a rumour into a weapon. He taught the people you took down the same lesson. For a fee.',
         'What he never taught you: that his doctorate is from a diploma mill, that his course is a funnel, and that the recordings of your first classes, the ones where you say terrible things about real people, are very incriminating.',
         'Your intern says, "This is the last one. The one that decides what The Receipts really is. A page that tells the truth, or a page that wins."'],
        ['Only what you can prove: the doctorate, the funnel, the recordings. Let the truth be the weapon.', 'He taught you to play dirty. Use all of it, including his own tricks.', 'Tell it with mercy. He made you, and he made mistakes too.'],
        ['The post lands at dawn, and at 6:06 PM nothing posts at all, for the first time in twenty years. Your mentor’s course is refunded to three thousand people by noon. His last message to you: "Proud of you. And terrified."',
         'You close the laptop. Biko hands you tea. You look at the 41,000 people who followed the whole story, and the new ones who showed up for the last chapter, and wonder what they will think of you next.'],
        'Your mentor posts a video called "What I Taught My Greatest Student". It is warm, wise and devastating. Biko says, "He was always better at this than us. For now."')
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
    body: ['People forward your posts without checking, because they know you already did. "Peace and light" is now a meme, used mostly to mean "I’m lying".', 'A journalist asks to interview you for a profile called "The Honest Page". Biko says, "You can say no." You say yes. You are nervous. You are very proud.']
  };
  if (integrity <= -4) return {
    id: 'cautionary_tale', title: 'The Page Everybody Fears',
    body: ['Your posts are still shared, but the comments have changed: "Is this one true?" "Who will she go after next?" "Is he the new Halo?"', 'Somebody has started a page called "The Receipts on The Receipts". Biko stares at it for a long time. "We taught them how," he says.']
  };
  return {
    id: 'gist_royalty', title: 'Everybody Reads You',
    body: ['You are one of the biggest pages in the country. People read you with a mix of delight and fear, which, Biko says, is also called "being famous".', 'There is a message in your inbox from a new name. A very short one. "I have a story for you." You can almost hear the music start.']
  };
};

// The chapters' scripted plot beats: registered as decision cards and scheduled on the Targets they belong to.
registerPlotEvents(allPlotEvents());
STORY_CHAPTERS.forEach(ch => ch.variants.forEach(v => {
  const def = CAST.find(d => d.id === v.targetId);
  const occ = plotOccurrences(ch.id);
  if (def && occ.length) def.occurrences = occ;
}));

registerPack(STORY_PACK);
