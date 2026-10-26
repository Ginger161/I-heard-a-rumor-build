// Alert copy variants. Every key maps to 3+ variants; the run's `copySeed` picks one, so a single run reads
// consistently but two runs read differently. Tokens: {Target} {State} {Hub} {HubDesc} {Zone} {Chatter}.
export interface CopyVariant {
  headline: string;
  body: string;
  button?: string;
  stamp?: string;     // Campaign copy: replaces the alert's stamp line
  subtext?: string;   // Campaign copy: replaces the alert's sub-line
}

const v = (headline: string, body: string, button?: string): CopyVariant => ({ headline, body, button });

export const COPY: Record<string, CopyVariant[]> = {
  // ---------------- Ground Zero (seed pop) ----------------
  SEED: [
    v('Loose Lips in {State}', '"An agbero at a motor park in {State} just overheard a wild rumor about {Target}. The conductor is already shouting it to the whole bus..."', 'Fan the Flames'),
    v('Gist Starts in {State}', '"A barber in {State} dropped his clippers mid-fade when a customer whispered {Target}\'s name. By the time the haircut was done, three shops knew."', 'Let It Spread'),
    v('Whispers at the Bus Stop', '"Two women selling pure water in {State} swapped half a sentence about {Target}. Within the hour it had crossed three streets and a mosque."', 'Light the Match'),
    v('The Rumor Is Out', '"A keke driver in {State} took a call, gasped, and told his passenger everything about {Target}. The passenger told her sister. The sister told everybody."', 'Pass It On')
  ],

  // ---------------- Power hubs ----------------
  HUB: [
    v('Rumor Hits {Hub}!', '"The gist has crossed state lines into {Hub}, infiltrating {HubDesc}."', 'Watch It Spread'),
    v('{Hub} Is Talking', '"By lunchtime, {Hub} had {Target}\'s name on every lip. {HubDesc} are already comparing notes."', 'Keep It Moving'),
    v('The Big League Hears It', '"{Hub} just picked it up. When {HubDesc} start repeating a rumor, it stops being a rumor."', 'Here We Go')
  ],

  // ---------------- Regional sweep ----------------
  SWEEP: [
    v('{Zone} Fully Infected!', '"From the first motor park to the last village square, every state in the {Zone} is now talking about {Target}. There is nowhere left to hide in the zone."', 'Sweep the Nation'),
    v('The Whole {Zone} Knows', '"Not one state in the {Zone} is still in the dark. Radio presenters there have started apologising for being late to the story."', 'Next Region'),
    v('{Zone}: Gist Complete', '"Every compound, every market, every WhatsApp group in the {Zone} has now heard about {Target}. The map just changed colour."', 'Onward')
  ],

  // ---------------- National critical mass ----------------
  MASS_25: [
    v('National Conversation', '"One in four Nigerians now believes the dossier. Mainstream TV hosts can no longer ignore the elephant in the room."', 'Press the Advantage'),
    v('A Quarter of the Country', '"A quarter of the country is convinced. Uncles who never post anything just posted about {Target}."', 'Keep Pushing'),
    v('The Story Goes Mainstream', '"Breakfast TV opened with {Target} this morning. The anchor looked like she had not slept."', 'Ride the Wave')
  ],
  MASS_50: [
    v('Half the Country Convinced!', '"50% of the nation is demanding answers. Memes, sermons, and newspaper editorials are all locked on the target."', 'Press the Advantage'),
    v('Fifty Percent Believe It', '"Half the country has made up its mind about {Target}. The other half is still arguing in the comments."', 'Finish the Job'),
    v('The Tipping Point', '"A majority of Nigerians now agree on something for the first time since jollof. {Target} is sweating."', 'Go for the Throat')
  ],
  MASS_80: [
    v('Regime-Shaking Outrage!', '"80% national conviction! Allies are deleting old photos with the target and crisis meetings are happening behind closed doors."', 'Press the Advantage'),
    v('Almost Everyone Believes', '"Eight in ten Nigerians believe it. {Target}\'s friends have started pretending they never met."', 'Close It Out'),
    v('Allies Run for Cover', '"Photos are disappearing. Statements are being drafted. Somebody just changed {Target}\'s name in their phone contacts."', 'Finish It')
  ],

  // ---------------- First state flip ----------------
  FLIP: [
    v('{State} Fully Convinced!', '"Over half the population in {State} now believes the scandal is 100% true. Street debates have turned into open outrage."', 'Domino Effect'),
    v('{State} Has Made Up Its Mind', '"From Monday market to Friday prayers, {State} has decided. Nobody there is giving {Target} the benefit of the doubt."', 'Spread the Word'),
    v('First State Falls', '"{State} is the first to flip. Local radio has stopped taking calls in defence of {Target}."', 'Keep Going')
  ],

  // ---------------- Doubt stagnation ----------------
  HIGH_DOUBT_65: [
    v('The Streets Are Calling Cap!', '"You are pushing talk without receipts! The streets are calling cap. Drop receipts immediately or people will decide this is a paid political hatchet job."', 'Understood'),
    v('Where Are the Receipts?', '"Everybody is asking the same question: where is the proof? Doubt is hardening and the story is starting to sound like noise."', 'Get the Receipts'),
    v('Skepticism Is Winning', '"People are rolling their eyes at the gist. Without hard evidence, you are just another loud account."', 'Fair Point')
  ],

  // ---------------- Clock ----------------
  CLOCK_HALFWAY: [
    v('Attention Span Warning', '"Half the timeline has elapsed. In Nigeria, a scandal only lasts two weeks before the next distraction drops. Escalate now or the story dies."', 'Step on the Gas'),
    v('Halftime', '"The first half is over. Somewhere, a new celebrity breakup is warming up in the wings. Do not let the news cycle move on."', 'Second Half'),
    v('The Clock Is Ticking', '"You are past the halfway mark, and the public never remembers anything for long. Make the next days count."', 'Make It Count')
  ],
  CLOCK_FINAL: [
    v('News Cycle Fading Fast', '"72 hours until the public moves on! Drop your hardest receipts and buy elite press coverage immediately."', 'Final Push'),
    v('Last Three Days', '"Three days left. After that, {Target} will be yesterday\'s story and a new scandal will take over the timeline."', 'All In'),
    v('Final Stretch', '"The deadline is close and the public is already glancing at its phones. Everything you have left, throw it now."', 'Last Dash')
  ],

  // ---------------- Investigation tiers ----------------
  INV_25: [
    v('New Classified Files Unlocked', '"Check your Evidence Locker. A source inside the secretariat just slid a fresh batch of unredacted documents under the door."', 'Open Locker Later'),
    v('A First Folder Arrives', '"A plain brown folder was left at your door with no note. Tier 1 evidence is ready in the locker."', 'Check Later'),
    v('A Source Comes Through', '"Somebody inside has finally decided to talk. The first files are in your Evidence Locker."', 'Noted')
  ],
  INV_50: [
    v('Halfway to the Truth', '"The investigation is half done. Insider memos and a voice note are waiting in your locker."', 'Open Locker Later'),
    v('The Plot Thickens', '"Your sources delivered again. Tier 2 evidence is ready, and it is spicier than the first batch."', 'Noted'),
    v('Deeper Files Unlocked', '"A second, heavier folder arrived in the night. This one has stamps and signatures."', 'Check Later')
  ],
  INV_75: [
    v('The Big File Is Close', '"Footage and forensic audits are now in your locker. One more push and you will have everything."', 'Open Locker Later'),
    v('Forensics Delivered', '"A forensic report landed in your inbox. It is almost too good to be true, and it is true."', 'Noted'),
    v('Three-Quarters Done', '"Your informants whisper that the master file is nearly ready. Tier 3 evidence is available now."', 'Check Later')
  ],
  INV_100: [
    v('The Smoking Gun Is Yours', '"Everything. Every signature, every transfer, every call. The master file is sitting in your Evidence Locker right now."', 'Use It Wisely'),
    v('Case Complete', '"The whole file is finally in your hands. One leak could end this."', 'Open the Locker'),
    v('The Master File', '"After all this time, the master file has arrived. It has signatures. It has dates. It has everything."', 'Drop It')
  ],

  // ---------------- Target counter-offensives ----------------
  TARGET_PR_20: [
    v('"Ignore the Jobless Detractors!"', '"{Target}\'s office has issued a 4-page press statement claiming all allegations are AI-generated deepfakes sponsored by enemies of progress."', 'Counter With Receipts'),
    v('A Firm Denial', '"A statement from {Target}\'s lawyers calls the story "a coordinated campaign of falsehood". They attached a very official letterhead."', 'Answer Back'),
    v('The Machine Warms Up', '"{Target}\'s publicists have begun calling editors. The word "baseless" appears eleven times in one paragraph."', 'Stay Sharp')
  ],
  TARGET_PR_45: [
    v('Paid Influencers Flood Timeline', '"{Target} just wired millions to top PR firms and defensive influencers to trend #StandWithOurLeader and muddy the waters."', 'Expose Them'),
    v('The Hashtag War', '"Overnight, a hundred accounts with the same bio started praising {Target}. Somebody paid for that."', 'Call It Out'),
    v('A War Chest Is Opened', '"{Target}\'s team has hired the best crisis firm in town. Their first move: make everyone doubt everything."', 'Fight Back')
  ],
  TARGET_PR_70: [
    v('Target Spotted in Neck Brace!', '"Cornered by the scandal, {Target} was just photographed being wheeled into a private clinic in London with a sudden \'mystery ailment\' while threatening a ₦10 Billion lawsuit."', 'No Mercy'),
    v('The Sympathy Play', '"Suddenly {Target} is "unwell", "exhausted" and "deeply hurt". A video of them tearfully thanking supporters is already trending."', 'Do Not Blink'),
    v('Lawyers and Tears', '"A ₦10 billion lawsuit has been announced, and {Target} has checked into a hospital with a surprisingly good photographer."', 'Press On')
  ],

  // ---------------- Temperaments ----------------
  CRASHOUT: [
    v('{Target} Loses It on Camera', '"{Chatter}" {Target} was filmed shouting at reporters. The clip is everywhere.', 'Ride the Momentum'),
    v('A Public Meltdown', '"{Chatter}" The video of {Target} is being quoted in every group chat in the country.', 'Use It'),
    v('Caught on Camera', '"{Chatter}" Somebody filmed it from the third row. The internet is already remixing it.', 'Strike Now')
  ],
  STOIC_AMBUSH: [
    v('{Target} Finally Strikes', '"{Chatter}" After weeks of silence, {Target}\'s team released everything at once: lawyers, statements, bots and a very loud press conference.', 'Brace for Impact'),
    v('The Silence Breaks', '"{Chatter}" {Target} waited, and waited, and then hit back with everything on the same afternoon.', 'Hold the Line'),
    v('A Calculated Counter-Strike', '"{Chatter}" It was all planned. Every statement, every cheque, every call, released in a single hour.', 'Take the Hit')
  ],

  // ---------------- Heat / security ----------------
  HEAT_40: [
    v('IP Logs Under Review', '"A formal petition has landed on the desk of the Cybercrime Unit. Analysts have begun logging ISP traffic to trace the origin of the leaks."', 'Acknowledge'),
    v('Somebody Is Watching', '"A new account on the DSS dashboard has your name beside it. It is a very small account, for now."', 'Stay Alert'),
    v('The Net Tightens', '"The Cybercrime Unit has started asking telecoms about "unusual traffic". That unusual traffic is you."', 'Noted')
  ],
  HEAT_70: [
    v('Telecom Throttle & Account Freeze!', '"Authorities are pressuring telecoms to throttle suspicious blog traffic and freezing burner bank accounts connected to anonymous whistleblowers."', 'Tighten Security'),
    v('The Squeeze Begins', '"Two of your burner numbers stopped working this morning. A bank account was "temporarily restricted"."', 'Lock It Down'),
    v('Walls Closing In', '"Your upload speeds have collapsed and a polite email from a regulator has arrived. Heat is getting dangerous."', 'Act Now')
  ],
  HEAT_90: [
    v('Signal Triangulated!', '"Unmarked Hilux vans are parked outside your safehouse! If Heat hits 100%, your door gets kicked in. Open the Defense Desk NOW!"', 'Emergency Protocol'),
    v('The Vans Are Outside', '"Two Hilux vans. No plates. Engines running. They have been there since 4 AM. Do something. Now."', 'Move Fast'),
    v('Last Warning', '"The raid team is on standby. One more leak and they come through the door. Buy time or lose everything."', 'Run')
  ],

  // ---------------- Cover-Up ----------------
  COVER_65: [
    v('The Story Is Being Buried', '"{Target}\'s machine is working overtime: lawyers, publicists and friendly editors. If the cover-up reaches 100%, the story is dead."', 'Fight the Cover-Up'),
    v('Editors Stop Returning Calls', '"Three newsrooms went quiet on the same afternoon. The cover-up is moving faster than you are."', 'Hit Back'),
    v('Sinking Fast', '"{Target}\'s allies are calling in favours across the media. Verified evidence is the best weapon you have."', 'Get the Receipts')
  ],
  COVER_88: [
    v('One Press Conference From Victory', '"{Target} is about to announce that the matter is \'closed\'. After that, no editor will touch the story. Hit them with evidence NOW."', 'Last Chance'),
    v('The Final Statement', '"A statement declaring the matter "settled" is being typed as you read this. This is your last moment."', 'Strike Now'),
    v('Seconds From Silence', '"The lawyers have booked the hall. The cameras are on their way. Unless you hit back, it is over."', 'All Out')
  ]
};

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

// Stable pick: the same run always gets the same variant for a given key.
export const pickIndex = (key: string, seed: number, length: number): number => hash(`${key}:${seed}`) % Math.max(1, length);

export const fillTokens = (text: string, vars: Record<string, string>): string =>
  text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));

export const pickCopy = (key: string, seed: number, vars: Record<string, string>, table: Record<string, CopyVariant[]> = COPY): CopyVariant | null => {
  const pool = table[key];
  if (!pool || pool.length === 0) return null;
  const c = pool[pickIndex(key, seed, pool.length)];
  return { headline: fillTokens(c.headline, vars), body: fillTokens(c.body, vars), button: c.button, stamp: c.stamp ? fillTokens(c.stamp, vars) : undefined, subtext: c.subtext ? fillTokens(c.subtext, vars) : undefined };
};

// Seed-picked choice from any list (alt event bodies, taglines, tips...).
export const pickFrom = <T,>(list: T[], key: string, seed: number): T => list[pickIndex(key, seed, list.length)];
