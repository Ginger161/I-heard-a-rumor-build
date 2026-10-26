import { registerPack, TargetDef, TargetPack } from './targetPacks';
import type { AbilityDef, AbilityKind, CampaignType, DefenseStyle, Temperament, TargetMods, Tier } from './targetTypes';
import type { Branch, ScandalCategory } from './channels';

// ===========================================================================
// CAMPAIGNS: spread something good, or useful, instead of a scandal.
//
// Fifteen campaigns in five kinds (health, awareness, political, marketing, myth-busting), three of each, from gentle to hard. A campaign
// runs on the same contagion engine as everything else: the "Target" is the OPPOSITION (apathy, a hoax, a rival brand), the player's
// aim is to get 75% of the country on board, and the four Believer/Doubt/Cover-Up/Heat numbers keep their rules but change their names
// (adopters, skepticism, opposition, backlash: see engine/campaigns.ts). The words the game uses are in data/campaignCopy.ts.
//
// Every campaign is invented. Hoaxes are fictional and harmless; no real brand, party, candidate, product or person appears.
// In myth-busting campaigns the player spreads the CORRECTION; the hoax is the opposition. The risky shortcut in every campaign is
// exaggeration (a bolder claim than the evidence supports), which can backfire when it is checked.
// ===========================================================================

const A = (kind: AbilityKind, every: number, start: number, strength: number, stamp: string, headline: string, line: string, branch?: Branch): AbilityDef =>
  ({ kind, every, start, strength, stamp, headline, line, branch });

interface CampaignSpec {
  id: string; tier: Tier; type: CampaignType; cause: string; slogan: string; adopter: string; goal: string; opposition: string;
  oppFull: string; oppShort: string; oppTitle: string; personality: string;
  angles: [string, string, string, string];                // FINANCIAL, AFFAIR, LEAKED_MEDIA, FAKE_CREDENTIALS
  passive: [string, string]; mods?: TargetMods; abilities: AbilityDef[];
  style: DefenseStyle; temper: Temperament; weak: Branch; resist: Branch; chatter: [string, string]; climate?: string; silhouette: TargetDef['avatar']['silhouette']; accent: string;
}

const CATS: ScandalCategory[] = ['FINANCIAL', 'AFFAIR', 'LEAKED_MEDIA', 'FAKE_CREDENTIALS'];

const campaign = (c: CampaignSpec): TargetDef => ({
  id: c.id, kind: 'CAMPAIGN', enabled: true, storyOnly: true, tier: c.tier, fullName: c.oppFull, shortName: c.oppShort, title: c.oppTitle,
  personality: c.personality, avatar: { silhouette: c.silhouette, accent: c.accent },
  scandals: c.angles.map((title, i) => ({ category: CATS[i], title })),
  passiveName: c.passive[0], passiveFlavor: c.passive[1], mods: c.mods ?? {}, abilities: c.abilities,
  ai: { defenseStyle: c.style, temperament: c.temper, weaknessBranch: c.weak, resistanceBranch: c.resist, chatter: { onStart: c.chatter[0], onCritical: c.chatter[1] } },
  climateId: c.climate,
  campaign: { type: c.type, cause: c.cause, slogan: c.slogan, adopter: c.adopter, goal: c.goal, opposition: c.opposition }
});

const SPECS: CampaignSpec[] = [
  // ------------------------------------------------------------------ HEALTH
  {
    id: 'camp_handwash', tier: 1, type: 'HEALTH', cause: 'Wash Your Hands, Naija', slogan: 'Soap. Water. Twenty seconds. Before you eat.', adopter: 'hand-washers',
    goal: 'Get 75% of Nigeria washing their hands with soap before the rains peak.', opposition: 'Apathy and a very short attention span',
    oppFull: 'Apathy', oppShort: 'Apathy', oppTitle: 'The Big Shrug', personality: 'Not an enemy, exactly. A huge, warm, tired shrug: "I have been fine for forty years."',
    angles: ['Soap is cheaper than a clinic visit', 'Protect the people you love most', 'The handwashing dance everyone will copy', 'A doctor explains it in plain Pidgin'],
    passive: ['Forty Years Without Soap', 'People who have been fine all their lives are very hard to move.'], mods: { coverUpRate: 1.15 },
    abilities: [
      A('DISTRACTION', 9, 7, 8, 'THE BIG MATCH', 'A Big Match Takes Over Every Feed', 'Nobody is thinking about soap. Everybody has a very strong opinion about the referee.'),
      A('COUNTER_STORY', 10, 9, 4, 'MY UNCLE NEVER WASHED', '"My Uncle Never Washed and He Is 94"', 'A viral voice note, delivered with great conviction. It has helped nobody and convinced everybody.')
    ],
    style: 'BALANCED', temper: 'STEADY', weak: 'STREET', resist: 'ELITE', chatter: ['I have been fine for forty years, you know.', 'Okay, okay. Maybe a little soap.'], climate: 'RAINY_SEASON', silhouette: 'agbada', accent: '#0F766E'
  },
  {
    id: 'camp_nets', tier: 2, type: 'HEALTH', cause: 'Sleep Under a Net', slogan: 'One net per bed. Every night. No exceptions.', adopter: 'net users',
    goal: 'Get 75% of Nigeria sleeping under a treated net before the mosquito season peaks.', opposition: 'Myths about the nets',
    oppFull: 'The Net Myths', oppShort: 'The Net Myths', oppTitle: 'It Is Too Hot, It Smells Funny, It Is Poison', personality: 'A pile of half-remembered stories: that the net is poisoned, that it is too hot, that it gives you dreams.',
    angles: ['A net costs less than one night of malaria', 'Keep the children safe tonight', 'The "net challenge" that goes viral', 'The malaria doctor explains the nets'],
    passive: ['The Smelly Net', 'Every household has a cousin with a story about a net.'], mods: { doubtAdd: 4, tagDoubt: { GRASSROOTS: 4 }, coverUpRate: 1.1 },
    abilities: [
      A('BOT_SWARM', 9, 6, 3, 'THE FORWARDED VOICE NOTE', 'A Voice Note Says the Nets Are Poisoned', 'It is two minutes long, it has no source and it has been forwarded eight hundred thousand times.'),
      A('COUNTER_STORY', 10, 8, 5, 'TOO HOT TO SLEEP', '"I Tried It. I Could Not Breathe."', 'A man in a vest holds up his net like a dead fish. It is the funniest clip of the week and a real setback.'),
      A('LANE_JAM', 12, 10, 3, 'NO DATA', 'The Data Bundles Run Out', 'Half of rural Nigeria hits the end of its data on the same Thursday.', 'SOCIAL')
    ],
    style: 'DISTRACTOR', temper: 'STEADY', weak: 'PRESS', resist: 'SOCIAL', chatter: ['They gave my cousin a net and he got a rash.', 'Fine. But I am not sleeping in it.'], climate: 'RAINY_SEASON', silhouette: 'hoodie', accent: '#0F766E'
  },
  {
    id: 'camp_immunise', tier: 3, type: 'HEALTH', cause: 'Immunise Every Child', slogan: 'Free. Safe. At your local clinic. This week.', adopter: 'immunised families',
    goal: 'Get 75% of Nigerian families to take their children for their free immunisation.', opposition: 'A fictional hoax about the vaccine',
    oppFull: 'The Clinic Hoax', oppShort: 'The Clinic Hoax', oppTitle: 'A Rumour With Excellent Distribution', personality: 'A made-up story that travels faster than the truth: it has a catchy phrase, a scary photograph and no author.',
    angles: ['Free care saves a fortune later', 'The healthiest start for your children', 'The nurse everyone trusts, on video', 'The paediatrician answers every question'],
    passive: ['A Scary Photograph', 'It does not need to be true. It only needs to be shared before breakfast.'], mods: { doubtAdd: 7, tagDoubt: { HYPER_ONLINE: 6 }, coverUpRate: 1.3, days: -4 },
    abilities: [
      A('DOUBT_WAVE', 9, 6, 6, 'A WAVE OF FEAR', 'A Scary Forwarded Message Hits Every Group', 'The photograph is not from this country. The caption is not from this decade. It has already reached everybody.'),
      A('BOT_SWARM', 8, 8, 3, 'EXPERT COMMENTATORS', 'Hundreds of "Concerned Parents" Appear', 'Their profile pictures are all from stock photos. Their concern is, somehow, perfectly coordinated.'),
      A('HEAT_SURGE', 11, 10, 7, 'A COMPLAINT TO THE REGULATOR', 'A Complaint Calls the Campaign "Misleading"', 'The letter has seventeen exclamation marks and a legal-looking stamp, and it has to be answered properly.')
    ],
    style: 'SPIN_DOCTOR', temper: 'THE_SCHEMER', weak: 'PRESS', resist: 'SOCIAL', chatter: ['They do not want you to know. Share before they delete it.', 'You are trying to hide the real story.'], silhouette: 'mic', accent: '#0F766E'
  },

  // ------------------------------------------------------------------ AWARENESS
  {
    id: 'camp_gutters', tier: 1, type: 'AWARENESS', cause: 'Clear the Gutters', slogan: 'A clean gutter is the cheapest flood defence in Nigeria.', adopter: 'clean-up volunteers',
    goal: 'Get 75% of Nigeria clearing their gutters before the first big rain.', opposition: 'Business as usual',
    oppFull: 'Business As Usual', oppShort: 'Business As Usual', oppTitle: 'It Has Always Been Like This', personality: 'A comfortable, sensible-sounding voice that has never once cleared a drain: "Government will do it."',
    angles: ['It costs nothing and saves a fortune in repairs', 'Keep your own family dry this year', 'The gutter-cleaning challenge, filmed in slow motion', 'The engineer shows how a blocked drain floods a street'],
    passive: ['Government Will Do It', 'Everybody agrees it is a good idea, and everybody expects somebody else to do it.'], mods: { coverUpRate: 1.15 },
    abilities: [
      A('DISTRACTION', 9, 7, 8, 'THE FUEL PRICE', 'The Fuel Price Takes the Whole Conversation', 'Nobody has the energy for gutters when the pump price has changed again.'),
      A('COUNTER_STORY', 10, 9, 4, 'LOCAL GOVERNMENT SAYS', 'The Council Says It Will "Look Into It"', 'It will not look into it. It will say it will look into it, which is exactly as effective.')
    ],
    style: 'OLD_MONEY', temper: 'STEADY', weak: 'STREET', resist: 'PRESS', chatter: ['Government will do it. They always do it.', 'Well. Maybe just the one in front of my house.'], climate: 'RAINY_SEASON', silhouette: 'suit', accent: '#B45309'
  },
  {
    id: 'camp_girls', tier: 2, type: 'AWARENESS', cause: 'Girls Back to School', slogan: 'Every girl enrolled. Every girl staying.', adopter: 'enrolled girls\' families',
    goal: 'Get 75% of Nigerian families to commit to keeping every girl in school this term.', opposition: 'The old excuses',
    oppFull: 'The Old Excuses', oppShort: 'The Old Excuses', oppTitle: 'Fees, Chores and "She Will Marry Anyway"', personality: 'A chorus of tired, polite reasons that have stopped sounding like reasons and started sounding like habits.',
    angles: ['An educated girl earns more for her whole family', 'The daughters we want everybody to be proud of', 'The mother-and-daughter video that stops the scroll', 'The headteacher explains the scholarship'],
    passive: ['She Will Marry Anyway', 'People repeat the old line without hearing it any more.'], mods: { doubtAdd: 4, tagDoubt: { GRASSROOTS: 3 }, coverUpRate: 1.3, days: -3 },
    abilities: [
      A('COUNTER_STORY', 9, 7, 5, 'THE CHORES', 'A Respected Elder Says It Is "Not the Time"', 'The elder is kind, well-loved and wrong. Every clip of him is shared with a prayer emoji.'),
      A('REGION_LOCK', 12, 9, 3, 'THE HARVEST', 'The Harvest Season Empties the Villages', 'Half the north is in the fields from dawn. Nobody has time for anything else.'),
      A('BOT_SWARM', 10, 10, 2, 'COMMENT SECTION', 'The Comment Section Fills With "Experts"', 'They have strong views on what girls should do. None of them has ever met one.')
    ],
    style: 'BALANCED', temper: 'THE_STOIC', weak: 'ELITE', resist: 'SOCIAL', chatter: ['This is how it has always been, my daughter.', 'Maybe the little one can go. Maybe.'], silhouette: 'robe', accent: '#B45309'
  },
  {
    id: 'camp_road', tier: 2, type: 'AWARENESS', cause: 'Slow Down, Get Home', slogan: 'Nothing on this road is worth a funeral.', adopter: 'careful drivers',
    goal: 'Get 75% of Nigerian drivers and passengers to commit to driving, and demanding, safely.', opposition: 'Overconfidence',
    oppFull: 'Overconfidence', oppShort: 'Overconfidence', oppTitle: 'I Have Driven This Road for Thirty Years', personality: 'A loud, friendly voice with a horn: "I have never had an accident." (He has had four.)',
    angles: ['A crash costs more than any fine', 'Come home to the people who are waiting', 'A dashcam clip that nobody can stop watching', 'The traffic officer explains what actually kills people'],
    passive: ['Thirty Years Without a Scratch', 'Experienced drivers are the hardest to persuade.'], mods: { doubtAdd: 5, coverUpRate: 1.3, days: -4 },
    abilities: [
      A('DISTRACTION', 8, 6, 8, 'THE CLIP', 'A Dashcam Clip of a Narrow Escape Goes Viral', 'It is celebrated as a triumph of skill, rather than a warning. The comments are all "legend".'),
      A('COUNTER_STORY', 10, 8, 5, 'MY CAR, MY RULES', 'A Popular Driver Posts: "Fear Is for Passengers"', 'It has ninety thousand likes and no sources. It will outlive all of us, or none.'),
      A('INJUNCTION', 11, 10, 2, 'THE UNION', 'The Drivers\' Union Declines to Endorse', 'Politely, and with a very long statement, which quietly shuts a channel.', 'ELITE')
    ],
    style: 'STREET_ARMY', temper: 'THE_SHOWMAN', weak: 'SOCIAL', resist: 'ELITE', chatter: ['I know this road like my own palm.', 'Okay, okay. I will put the belt on.'], silhouette: 'cap', accent: '#B45309'
  },

  // ------------------------------------------------------------------ POLITICAL (civic: taking part, not taking sides)
  {
    id: 'camp_pvc', tier: 1, type: 'POLITICAL', cause: 'Collect Your PVC', slogan: 'You cannot vote with a card you have not collected.', adopter: 'card holders',
    goal: 'Get 75% of registered voters to collect their voter cards before election day.', opposition: 'Voter apathy',
    oppFull: 'Voter Apathy', oppShort: 'Voter Apathy', oppTitle: 'It Does Not Matter Anyway', personality: 'A sigh. A bored shoulder-shrug with a whole lot of reasons and none of them wrong enough to dismiss.',
    angles: ['Nothing else gets you a say for four years', 'Your family\'s future is on that little card', 'The funny "my card is ready" video', 'The electoral officer explains how to collect it in five minutes'],
    passive: ['It Does Not Matter Anyway', 'The hardest person to persuade is the one who has already given up.'], mods: { doubtAdd: 3, coverUpRate: 1.15 },
    abilities: [
      A('DISTRACTION', 9, 7, 8, 'THE LONG QUEUE', 'A Photograph of a Four-Hour Queue Goes Viral', 'It is a real queue, from another city, on another day. It still does enormous damage.'),
      A('COUNTER_STORY', 10, 9, 4, 'THEY ALL THE SAME', 'A Cynical Joke About Politicians Trends', 'It is very funny. It is also, by coincidence, the best argument for staying home.')
    ],
    style: 'BALANCED', temper: 'STEADY', weak: 'STREET', resist: 'ELITE', chatter: ['They are all the same. What will one card change?', 'Fine. I will go on Saturday. Maybe.'], climate: 'ELECTION_YEAR', silhouette: 'suit', accent: '#1D4ED8'
  },
  {
    id: 'camp_issues', tier: 2, type: 'POLITICAL', cause: 'Know the Issues', slogan: 'Vote on what they will do, not on what they will share.', adopter: 'informed voters',
    goal: 'Get 75% of voters to learn where every candidate stands on five issues before voting.', opposition: 'The sharing-rice brigade',
    oppFull: 'The Sharing-Rice Brigade', oppShort: 'The Rice Brigade', oppTitle: 'A Free Bag of Rice and a Very Short Memory', personality: 'A procession of vans, caps and very large bags of rice, arriving three days before the vote and leaving three days after.',
    angles: ['Know what each plan costs you', 'The future of your children is not for sale', 'The side-by-side comparison that everybody shares', 'The economist explains each promise, plainly'],
    passive: ['Three Days Before the Vote', 'Generosity that appears right before an election and vanishes right after.'], mods: { doubtAdd: 5, zoneDoubt: { NW: 4 }, coverUpRate: 1.25, days: -3 },
    abilities: [
      A('BOT_SWARM', 9, 6, 3, 'RICE AND JINGLES', 'The Jingle Vans Are Everywhere', 'A catchy tune, a very short slogan and a man in a branded cap handing out something delicious.'),
      A('DISTRACTION', 9, 8, 9, 'THE CELEBRITY ARRIVES', 'A Famous Singer Joins the Rally', 'The crowd is enormous and enchanted. The policy paper is eleven pages long and in a drawer.'),
      A('ACCOUNT_FREEZE', 12, 10, 12, 'THE LEVY', 'A Sudden "Registration Levy" Hits Your Volunteers', 'An official collects a small fee from every table. It is a small fee, and a very large nuisance.')
    ],
    style: 'STREET_ARMY', temper: 'THE_SHOWMAN', weak: 'PRESS', resist: 'STREET', chatter: ['Take the rice, my friend. Take the rice.', 'Everybody does this. Everybody.'], climate: 'ELECTION_YEAR', silhouette: 'cap', accent: '#1D4ED8'
  },
  {
    id: 'camp_peace', tier: 3, type: 'POLITICAL', cause: 'Peaceful Elections', slogan: 'Vote. Go home. Accept the result.', adopter: 'peace pledgers',
    goal: 'Get 75% of Nigerians to sign the peace pledge before election week.', opposition: 'The rumour mill',
    oppFull: 'The Rumour Mill', oppShort: 'The Rumour Mill', oppTitle: 'Every Rumour Is a Little Bit of Smoke', personality: 'A thousand small whispers with no author, each one slightly more frightening than the last.',
    angles: ['Peace is cheaper than every alternative', 'Everybody wants to get home safely', 'The community leaders\' joint video', 'The retired general explains why peace holds'],
    passive: ['A Little Bit of Smoke', 'Every rumour of trouble makes the next one sound more plausible.'], mods: { doubtAdd: 5, tagDoubt: { HYPER_ONLINE: 5 }, coverUpRate: 1.1, heatRate: 0.8 },
    abilities: [
      A('DOUBT_WAVE', 9, 6, 6, 'A RUMOUR OF TROUBLE', 'A Rumour About "Trouble in the North" Spreads', 'It has no source and a very convincing photograph. It is, somehow, also in three different languages.'),
      A('BOT_SWARM', 8, 8, 3, 'THE PANIC ACCOUNTS', 'New Accounts Repeat the Same Warning', 'It reads like a public service announcement. It is not a public service, and it is not an announcement.'),
      A('HEAT_SURGE', 11, 10, 7, 'A SHARP LETTER', 'A Sharp Letter Questions the Campaign\'s Funding', 'It asks who paid for the pledge forms. The honest answer is complicated, and has to be given.')
    ],
    style: 'CYBER_SQUAD', temper: 'THE_SCHEMER', weak: 'ELITE', resist: 'SOCIAL', chatter: ['Did you hear what they are planning? I would not go out on Saturday.', 'I am only saying what everybody is saying.'], climate: 'ELECTION_YEAR', silhouette: 'agbada', accent: '#1D4ED8'
  },

  // ------------------------------------------------------------------ MARKETING
  {
    id: 'camp_zobo', tier: 1, type: 'MARKETING', cause: 'Zobo Fizz', slogan: 'Real hibiscus. Real fizz. Real cold.', adopter: 'customers',
    goal: 'Get 75% of Nigeria to try, and keep buying, a brand-new bottled zobo.', opposition: 'The big fizzy-drink brand',
    oppFull: 'Big Fizz', oppShort: 'Big Fizz', oppTitle: 'Every Fridge Already Has One', personality: 'A giant, friendly logo on every fridge, every umbrella and every roadside table in the country.',
    angles: ['Cheaper than the fizzy one, and better for you', 'A drink for the whole family at the table', 'The unboxing clip everybody copies', 'The nutritionist explains what is actually in it'],
    passive: ['Every Fridge Has One', 'It is hard to be the new drink when the old drink has had forty years of free fridges.'], mods: { coverUpRate: 1.15 },
    abilities: [
      A('DISTRACTION', 8, 6, 9, 'THE BIG AD', 'Big Fizz Launches a Huge Football Campaign', 'It is on every channel, at every hour. Nobody can remember what Zobo Fizz was called.'),
      A('COUNTER_STORY', 10, 8, 4, 'THE SHELF SPACE', 'Shops Quietly Move You to the Bottom Shelf', 'A very kind shopkeeper explains that the top shelf is "reserved". For whom, he cannot say.')
    ],
    style: 'OLD_MONEY', temper: 'STEADY', weak: 'STREET', resist: 'ELITE', chatter: ['Every fridge in the country has one of ours.', 'Hm. People actually like the new one?'], silhouette: 'suit', accent: '#9D174D'
  },
  {
    id: 'camp_agbero', tier: 2, type: 'MARKETING', cause: 'Agbero Express', slogan: 'A danfo at your door. A fair price. A seat, guaranteed.', adopter: 'riders',
    goal: 'Get 75% of city commuters to book a ride on a brand-new danfo-hailing app.', opposition: 'The established taxi app',
    oppFull: 'The Incumbent App', oppShort: 'The Incumbent App', oppTitle: 'Already on Every Phone', personality: 'A big, well-funded app with a green icon on every home screen and a very good reason for every price.',
    angles: ['A fairer fare, every ride', 'Get home to your family safely', 'The "my driver is a legend" clip that spreads', 'The transport expert explains the safety checks'],
    passive: ['The Green Icon', 'Everyone already has it. Nobody has a reason to delete it.'], mods: { doubtAdd: 2, tagDoubt: { HYPER_ONLINE: 4 } },
    abilities: [
      A('DISTRACTION', 8, 6, 9, 'FREE RIDE WEEK', 'The Incumbent Gives Away Free Rides', 'Everybody tries it. Everybody loves it. Nobody remembers to try the new one.'),
      A('LANE_JAM', 10, 8, 3, 'EXCLUSIVE DEALS', 'The Incumbent Signs the Biggest Influencers', 'Overnight, the best-loved faces on the timeline are all wearing the same green T-shirt.', 'SOCIAL'),
      A('HEAT_SURGE', 11, 10, 6, 'THE LICENCE QUESTION', 'A Letter Asks Whether You Are Licensed', 'You are. The paperwork is somewhere. Everybody has to find it by Friday.')
    ],
    style: 'CYBER_SQUAD', temper: 'THE_BULLY', weak: 'STREET', resist: 'SOCIAL', chatter: ['We have eleven million users. How many do you have?', 'Who told them about the danfo thing?'], silhouette: 'hoodie', accent: '#9D174D'
  },
  {
    id: 'camp_jollof', tier: 3, type: 'MARKETING', cause: 'The Naija Jollof Festival', slogan: 'One weekend. One hundred pots. Everybody is invited.', adopter: 'festival-goers',
    goal: 'Get 75% of Nigeria to put the festival weekend in their diary.', opposition: 'A rival festival on the same weekend',
    oppFull: 'The Rival Festival', oppShort: 'The Rival Festival', oppTitle: 'Bigger Posters, Louder Speakers, Same Weekend', personality: 'A glossy, well-funded event that has booked every famous DJ and every good tent for the same two days.',
    angles: ['A weekend of food for the price of a lunch', 'Bring the whole family and a very big appetite', 'The pot-stirring challenge everybody joins', 'The celebrity chef explains the secret'],
    passive: ['Same Weekend, Louder Speakers', 'There are only so many weekends, and the rival has booked all the good tents.'], mods: { doubtAdd: 5, coverUpRate: 1.25, days: -3 },
    abilities: [
      A('DISTRACTION', 8, 6, 10, 'THE HEADLINER', 'The Rival Announces a Surprise Headliner', 'It is the most famous singer in the country. It has all the posters. Your festival has a very good pot.'),
      A('BOT_SWARM', 9, 8, 3, 'THE REVIEWERS', 'Dozens of "Local Foodies" Say the Other One Is Better', 'Their reviews are glowing and suspiciously similar. They also appear to share a keyboard.'),
      A('ACCOUNT_FREEZE', 12, 10, 14, 'THE VENUE FEE', 'The Venue Suddenly Doubles the Fee', 'A very polite man explains that this is "the normal price". It is a normal price for a different festival.')
    ],
    style: 'SPIN_DOCTOR', temper: 'THE_SHOWMAN', weak: 'PRESS', resist: 'STREET', chatter: ['We have the best DJs and the best tents. Good luck.', 'People are choosing the jollof? Over us?'], silhouette: 'gele', accent: '#9D174D'
  },

  // ------------------------------------------------------------------ MYTH-BUSTING (you spread the correction; the hoax is the opposition)
  {
    id: 'camp_garri', tier: 1, type: 'MYTHBUST', cause: 'Garri Is Not a Cure', slogan: 'It is a lovely meal. It is not medicine.', adopter: 'informed families',
    goal: 'Get 75% of Nigerian families to know that a certain popular meal does not cure illnesses.', opposition: 'A harmless-sounding hoax',
    oppFull: 'The Garri Hoax', oppShort: 'The Garri Hoax', oppTitle: 'Everybody Knows Somebody Who Swears by It', personality: 'A cheerful, harmless-sounding story, delivered by a beloved aunt: "Eat it with groundnut and you will never be sick."',
    angles: ['Real medicine saves money and time', 'Keep your family safe with real care', 'The "myth or fact" game everybody plays', 'The doctor explains why the story is false'],
    passive: ['Everybody Knows Somebody', 'The hoax is carried by the people you trust most.'], mods: { coverUpRate: 1.15 },
    abilities: [
      A('BOT_SWARM', 9, 6, 2, 'THE AUNTIES', 'Four Hundred Aunties Forward It at Once', 'It arrives with a rose emoji and a prayer, and it is very hard to argue with.'),
      A('COUNTER_STORY', 10, 8, 4, 'MY GRANDMOTHER', '"My Grandmother Lived to 102"', 'A touching photograph and a sentence nobody can disprove. It is not evidence. It is wonderful.')
    ],
    style: 'BALANCED', temper: 'STEADY', weak: 'PRESS', resist: 'SOCIAL', chatter: ['My own grandmother swore by it, you know.', 'Hm. I will ask the doctor.'], silhouette: 'gele', accent: '#7C3AED'
  },
  {
    id: 'camp_datalink', tier: 2, type: 'MYTHBUST', cause: 'Think Before You Tap', slogan: 'If it promises free data, it wants something from you.', adopter: 'protected users',
    goal: 'Get 75% of phone users to recognise, and ignore, a fake "free data" link.', opposition: 'A fictional scam link',
    oppFull: 'The Free Data Link', oppShort: 'The Free Data Link', oppTitle: '"Click Here for 50GB Free"', personality: 'A shiny, urgent message with a countdown timer and a misspelt bank name. It comes with a friend\'s name on it.',
    angles: ['A scam costs far more than any bundle', 'Protect the person who forwards you things', 'The "spot the scam" challenge that goes round', 'The cybersecurity expert shows how it works'],
    passive: ['A Friend\'s Name on It', 'It arrives from someone you trust, because their account was the first to go.'], mods: { doubtAdd: 5, tagDoubt: { HYPER_ONLINE: 5 }, coverUpRate: 1.25, days: -3 },
    abilities: [
      A('BOT_SWARM', 8, 5, 3, 'THE FORWARDS', 'Your Friends Start Forwarding It', 'Most of them have no idea. All of them mean well. That is how it works.'),
      A('DOUBT_WAVE', 10, 7, 5, 'A CONVINCING COUNTDOWN', 'The New Version Has a Better Logo', 'The scammers read the correction, fixed the typos and relaunched with a real-looking page.'),
      A('LANE_JAM', 11, 10, 3, 'NO SIGNAL', 'The Network Drops in Three Cities', 'It is a coincidence. It is also, for a day, the only thing anyone can talk about.', 'SOCIAL')
    ],
    style: 'CYBER_SQUAD', temper: 'THE_SCHEMER', weak: 'PRESS', resist: 'SOCIAL', chatter: ['Only twelve minutes left. Click now.', 'A new link. Same price. Totally different.'], silhouette: 'hoodie', accent: '#7C3AED'
  },
  {
    id: 'camp_tower', tier: 3, type: 'MYTHBUST', cause: 'The Tower Is Not the Fever', slogan: 'Phone masts do not make people ill. Mosquitoes do.', adopter: 'informed communities',
    goal: 'Get 75% of communities to know the facts about phone masts, so the real cause gets treated.', opposition: 'A fictional hoax about phone masts',
    oppFull: 'The Tower Myth', oppShort: 'The Tower Myth', oppTitle: 'A Neat Story About a Tall Thing', personality: 'A confident, scientific-sounding story with a graph that goes the wrong way and a hero who "used to work at a laboratory".',
    angles: ['Treating the real cause costs less than fighting a mast', 'Protect your children from the real danger', 'The "myth or fact" cartoon that goes viral', 'The telecom engineer shows what a mast actually does'],
    passive: ['A Graph Going the Wrong Way', 'A confident chart can do more damage than a hundred facts.'], mods: { doubtAdd: 8, tagDoubt: { GRASSROOTS: 4 }, coverUpRate: 1.3, days: -3 },
    abilities: [
      A('DOUBT_WAVE', 9, 6, 6, 'THE GRAPH', 'A Very Official-Looking Graph Goes Viral', 'It has axes, a legend and a logo. It does not have a source, a date or a single true number.'),
      A('BOT_SWARM', 8, 8, 3, 'CONCERNED NEIGHBOURS', 'Whole Communities Sign a Petition', 'The signatures look real. About a third of them are.'),
      A('REGION_LOCK', 12, 10, 3, 'THE COMMUNITY MEETING', 'A Town Hall Votes to Disbelieve You', 'The meeting is loud, long and decisive. The vote was held before the facts were read.')
    ],
    style: 'SPIN_DOCTOR', temper: 'THE_STOIC', weak: 'ELITE', resist: 'SOCIAL', chatter: ['I used to work at a laboratory, you know.', 'Do not let them tell you what to think.'], silhouette: 'glasses', accent: '#7C3AED'
  }
];

export const CAMPAIGN_DEFS: TargetDef[] = SPECS.map(campaign);

export const CAMPAIGN_PACK: TargetPack = { schema: 1, packId: 'campaigns-v1', name: 'Campaigns: spread something good', author: 'I Heard A Rumor team', version: 1, targets: CAMPAIGN_DEFS };

registerPack(CAMPAIGN_PACK);

export const CAMPAIGN_IDS = SPECS.map(s => s.id);
