import type { CopyVariant } from './copy';
import type { Branch } from './channels';
import type { CampaignType } from './targetTypes';

// THE VOICE OF CAMPAIGNS. When the thing being spread is a message people can use (a health drive, a voter drive, a product launch, a
// myth-buster), the game talks about adopters, skepticism, the opposition and backlash instead of believers, doubt, cover-ups and heat.
// Same keys as COPY (data/copy.ts), so the alert engine swaps one table for the other. Tokens: {Cause} the campaign, {Target} the
// opposition, {Adopters} what people who have come round are called, {State} {Hub} {HubDesc} {Zone} {Chatter}.
const v = (headline: string, body: string, button?: string, stamp?: string, subtext?: string): CopyVariant => ({ headline, body, button, stamp, subtext });

export const CAMPAIGN_COPY: Record<string, CopyVariant[]> = {
  SEED: [
    v('The First Conversation in {State}', '"A market woman in {State} just heard about {Cause} from her niece. She told the woman at the next stall. By evening three compounds knew."', 'Keep It Going'),
    v('Word Reaches {State}', '"A teacher in {State} read the {Cause} message out at assembly. The children told their parents, who told the pastor. Nobody was asked to."', 'Let It Spread')
  ],
  HUB: [
    v('It Reaches {Hub}', '"{Cause} has crossed into {Hub}, where {HubDesc} are already picking it up."', 'Watch It Grow'),
    v('{Hub} Joins In', '"By lunchtime {Hub} was talking about {Cause}. {HubDesc} are passing it on."', 'Keep It Moving')
  ],
  SWEEP: [
    v('{Zone}: Everyone Has Heard', '"Every state in the {Zone} has now heard about {Cause}. Radio presenters there are reading it out between songs."', 'Next Region'),
    v('The Whole {Zone} Is Talking', '"From the first village to the last market, the {Zone} knows what {Cause} is asking. Now it has to act on it."', 'Onward')
  ],
  MASS_25: [
    v('A Quarter of Nigeria Is On Board', '"One in four Nigerians is now counted among the {Adopters}. TV hosts are asking about {Cause} on air."', 'Keep Pushing'),
    v('The Message Goes Mainstream', '"A quarter of the country is with you. Uncles who never post anything just shared {Cause}."', 'Ride the Wave')
  ],
  MASS_50: [
    v('Half the Country Has Come Round', '"Half of Nigeria is now among the {Adopters}. The other half is still arguing about it in the comments."', 'Finish the Job'),
    v('The Tipping Point', '"A majority of Nigerians agree on something for the first time since jollof. {Cause} is no longer a campaign, it is a habit."', 'Go the Distance')
  ],
  MASS_80: [
    v('Almost Everyone Is On Board', '"Eight in ten Nigerians are now among the {Adopters}. {Target} has gone very quiet."', 'Close It Out'),
    v('The Last Holdouts', '"Only the most stubborn are left. Community leaders are knocking on their doors with {Cause} in one hand and zobo in the other."', 'Finish It')
  ],
  FLIP: [
    v('{State} Has Come Round', '"More than half of {State} is now with {Cause}. What began as a whisper is becoming a habit."', 'Domino Effect'),
    v('First State Turns', '"{State} is the first to tip. Local radio has stopped taking calls against {Cause}."', 'Keep Going')
  ],
  HIGH_DOUBT_65: [
    v('People Are Not Convinced', '"The streets are asking where the proof is. Without clear, checkable proof, {Cause} will be dismissed as hype. Bring out your evidence."', 'Understood', 'SKEPTICISM SPIKE // 65%', 'Share proof to bring skepticism down'),
    v('Where Is the Proof?', '"Everybody is asking the same question. Skepticism is hardening, and a good slogan will not soften it. Show people the evidence."', 'Understood', 'SKEPTICISM SPIKE // 65%', 'Share proof to bring skepticism down')
  ],
  CLOCK_HALFWAY: [
    v('Halfway Through the Window', '"Half of the time is gone. In Nigeria a news cycle is two weeks, then the next story arrives. Step it up now or {Cause} fades."', 'Step on the Gas'),
    v('The Clock Is Moving', '"Halfway there. Attention is already drifting to the next headline. Bring in your strongest channels."', 'Push Harder')
  ],
  CLOCK_FINAL: [
    v('Three Days Left', '"Three days until the window closes. Bring in your strongest proof and your biggest channels now."', 'Final Push'),
    v('The Window Is Closing', '"72 hours. Whatever you have been saving, spend it now."', 'Final Push')
  ],
  INV_25: [v('New Proof Is Ready', '"Your volunteers have gathered the first solid records. Check the Proof Desk."', 'Open Desk Later', 'FIELD REPORT // TIER 1'), v('Records From the Field', '"A small, careful batch of records has arrived. It is not glamorous, and it is exactly what skeptics ask for."', 'Open Desk Later', 'FIELD REPORT // TIER 1')],
  INV_50: [v('Testimonies on Tape', '"People who have already adopted {Cause} are willing to say so on tape. That is worth more than any slogan."', 'Open Desk Later', 'FIELD REPORT // TIER 2'), v('First-Hand Stories', '"Recordings from the first adopters have landed in the Proof Desk. They are warm, specific and very hard to argue with."', 'Open Desk Later', 'FIELD REPORT // TIER 2')],
  INV_75: [v('An Independent Report', '"A respected independent body has agreed to publish its findings on {Cause}. The Proof Desk has a new file."', 'Open Desk Later', 'FIELD REPORT // TIER 3'), v('The Experts Weigh In', '"A professional association has put its name to a short, clear report. Check the Proof Desk."', 'Open Desk Later', 'FIELD REPORT // TIER 3')],
  INV_100: [v('The Full Study Is In', '"Everything is ready: the complete data, signed and independently checked. It is in the Proof Desk now."', 'Open Desk Later', 'FIELD REPORT // TIER 4'), v('The Complete Picture', '"The whole body of proof is finally in one place. Use it when skepticism is at its loudest."', 'Open Desk Later', 'FIELD REPORT // TIER 4')],
  TARGET_PR_20: [
    v('The Opposition Responds', '"{Target} has issued a statement calling {Cause} “unnecessary” and ”foreign-funded”. It is already trending."', 'Answer With Proof', 'OPPOSITION MOVE // FIRST REPLY', undefined),
    v('A Statement From {Target}', '"{Target} calls the campaign “a distraction from real problems”. It does not name a single real problem."', 'Answer With Proof', 'OPPOSITION MOVE // FIRST REPLY', undefined)
  ],
  TARGET_PR_45: [
    v('The Counter-Campaign Arrives', '"{Target} has put real money behind a counter-message: influencers, forwarded voice notes and a very catchy hashtag."', 'Counter It', 'OPPOSITION MOVE // WAR CHEST', undefined),
    v('Paid Voices Flood the Timeline', '"Overnight, a hundred accounts started repeating the same four sentences about {Cause}. None of them have met anyone it affects."', 'Counter It', 'OPPOSITION MOVE // WAR CHEST', undefined)
  ],
  TARGET_PR_70: [
    v('A Desperate Last Push', '"{Target} is pulling every lever at once: the loudest voices, the oldest rumours and a threat of legal action against your volunteers."', 'Hold the Line', 'OPPOSITION MOVE // LAST PUSH', undefined),
    v('Everything at Once', '"Lawyers, bots and a very loud press conference. {Target} wants {Cause} gone before the weekend."', 'Hold the Line', 'OPPOSITION MOVE // LAST PUSH', undefined)
  ],
  CRASHOUT: [
    v('{Target} Loses Its Cool', '"{Chatter}" The clip is everywhere. People are asking who is really being unreasonable.', 'Ride the Moment', 'OPPOSITION MELTDOWN // ON CAMERA'),
    v('A Very Public Wobble', '"{Chatter}" Reporters caught every word. The campaign gains a little breathing room.', 'Ride the Moment', 'OPPOSITION MELTDOWN // ON CAMERA')
  ],
  STOIC_AMBUSH: [
    v('{Target} Strikes Back', '"{Chatter}" After weeks of silence, {Target} released everything at once: statements, bots, rumours and a press conference.', 'Brace for Impact', 'THE AMBUSH // WEEKS IN THE MAKING'),
    v('The Quiet Is Over', '"{Chatter}" A full counter-campaign has launched overnight. It looks expensive, and it looks planned.', 'Brace for Impact', 'THE AMBUSH // WEEKS IN THE MAKING')
  ],
  HEAT_40: [
    v('Questions From the Regulator', '"A formal letter wants to know who is behind {Cause}, who pays for it and who approved the wording."', 'Acknowledge', 'REGULATOR // QUERY', 'Backlash at 40% • Keep your paperwork in order'),
    v('Someone Is Asking Who You Are', '"A local official has asked, politely and on the record, who is running {Cause} and what the funding source is."', 'Acknowledge', 'REGULATOR // QUERY', 'Backlash at 40% • Keep your paperwork in order')
  ],
  HEAT_70: [
    v('Platforms Throttle Your Reach', '"Complaints are piling up. Platforms are limiting how far your posts travel, and an official has called a press conference about “misleading campaigns”."', 'Tighten Up', 'BACKLASH // 70%', 'Backlash at 70% • Protect the campaign soon'),
    v('The Pressure Is Real', '"A coalition of critics has filed a joint complaint. Your best channels are suddenly harder to reach."', 'Tighten Up', 'BACKLASH // 70%', 'Backlash at 70% • Protect the campaign soon')
  ],
  HEAT_90: [
    v('Shutdown Notice', '"A notice says the campaign has 48 hours to stop or face a ban. If Backlash hits 100%, {Cause} is shut down. Open the Protect Desk NOW."', 'Emergency Plan', 'CRITICAL // SHUTDOWN NOTICE', 'DANGER: 90% BACKLASH'),
    v('Final Warning', '"You have one last letter, one last deadline and one last chance. Protect the campaign before it is switched off."', 'Emergency Plan', 'CRITICAL // SHUTDOWN NOTICE', 'DANGER: 90% BACKLASH')
  ],
  COVER_65: [
    v('The Counter-Message Is Winning', '"{Target} is everywhere now. If the opposition reaches 100%, the message is dead. Share proof and pop the hoax bubbles."', 'Fight Back', 'OPPOSITION AT 65%', 'Share proof and pop hoax bubbles to push it back'),
    v('{Target} Is Gaining', '"The other side has a louder megaphone this week. Without a strong answer, {Cause} will be forgotten."', 'Fight Back', 'OPPOSITION AT 65%', 'Share proof and pop hoax bubbles to push it back')
  ],
  COVER_88: [
    v('One Headline From Defeat', '"{Target} is about to declare victory. After that, no editor will touch {Cause}. Bring in your best proof NOW."', 'Last Chance', 'THE OPPOSITION IS NEARLY THERE', 'Opposition at 88%'),
    v('Last Chance', '"The other side is one announcement away from making the whole thing look finished. Do not let them."', 'Last Chance', 'THE OPPOSITION IS NEARLY THERE', 'Opposition at 88%')
  ]
};

// What the Evidence desk calls things in a campaign. Verified files are PROOF; forged files are HYPE (an exaggerated claim that can backfire).
export const CAMPAIGN_EVIDENCE: Record<string, { name: string; flavor: string }> = {
  ev_tier1_wire: { name: 'Field Records', flavor: 'Careful records from the ground: who, where and how many. Not glamorous, and exactly what skeptics ask for.' },
  ev_tier2_voice_memo: { name: 'Testimonies on Tape', flavor: 'People who have already come round say so, in their own voices. It is worth more than any slogan.' },
  ev_tier3_footage: { name: 'An Independent Report', flavor: 'A respected outside body has checked the claims for {Cause} and published its findings.' },
  ev_tier4_smoking_gun: { name: 'The Full Study', flavor: 'The complete data, signed and independently verified. When skepticism is at its loudest, this is what you reach for.' },
  ev_fake_whatsapp: { name: 'A Punchier Claim', flavor: 'It is a little bit more than the evidence supports, and it will travel much faster. It might also be caught.' },
  ev_deepfake_audio: { name: 'A Celebrity "Endorsement"', flavor: 'A famous voice that never actually said it. It will light up the timeline, and the moment anyone checks, the campaign pays for it.' }
};

// What the Defense desk calls things in a campaign: PROTECT.
export const CAMPAIGN_DEFENSE: Record<string, { name: string; effectText: string; alertBody: string }> = {
  burner_sim: { name: 'Volunteer Network', effectText: 'Cuts Backlash right away. Repeatable up to 3 times, a little less each time.', alertBody: '"A hundred volunteers now carry the message in their own words. Complaints have nobody to point at."' },
  proxy_relay: { name: 'Community Radio Partnership', effectText: 'Immediate Backlash cut. Permanently reduces daily Backlash by 25% and halves the opposition\'s surges.', alertBody: '"Three trusted local stations now carry the message in six languages. It is much harder to call it foreign."' },
  san_injunction: { name: 'Pro Bono Legal Counsel', effectText: 'Immediate Backlash cut. Clears every hoax bubble, restores blocked channels and blocks the next 2 bans.', alertBody: '"A senior lawyer, doing it for free, has had the ban notice set aside before the tea went cold."' },
  whistleblower: { name: 'Insider Champion', effectText: 'Immediate Backlash cut. Proof arrives almost twice as fast.', alertBody: '"A respected insider has agreed to open doors. New proof will reach your desk much faster."' },
  safehouse: { name: 'Pause and Reset', effectText: 'Immediate big Backlash cut. The panic button for when a shutdown looks close.', alertBody: '"You stand the campaign down for a few days, say thank you, change the wording and come back with a cooler head."' }
};

// One line per lane per campaign type (the channel inspector and the channel alert read these). {Cause} is the campaign's name.
export const CAMPAIGN_CHANNEL_LINES: Record<CampaignType, Record<Branch, string[]>> = {
  HEALTH: {
    STREET: ['The motor-park chairman announces {Cause} between two bus calls, and every conductor repeats it.', 'Market women pin the {Cause} poster next to the price list. It is the most-read page in the market.'],
    SOCIAL: ['A nurse posts a thirty-second clip about {Cause}. It is shared in every family group by Sunday.', 'The WhatsApp aunties have forwarded {Cause} many times, and for once it is correct.'],
    PRESS: ['The morning radio doctor spends ten minutes on {Cause} and takes calls from worried mothers.', 'A health reporter publishes a plain-language explainer. Editors keep it on the front page.'],
    ELITE: ['The Ministry of Health puts its logo on {Cause}, and the logo opens doors.', 'The medical association issues a one-paragraph statement of support. It is quoted for weeks.']
  },
  AWARENESS: {
    STREET: ['Youth corps members walk compound to compound with {Cause} leaflets, singing.', 'The area-boys\' union adopts {Cause} as its slogan for the season. Nobody is more surprised than they are.'],
    SOCIAL: ['A skit about {Cause} goes viral. Nobody remembers who made it, everybody knows the punchline.', 'A hashtag starts in one school group chat and is trending nationwide by morning.'],
    PRESS: ['A talk show devotes its Friday slot to {Cause}, with a very good guest and a very bad pun.', 'The newspaper columnist who is never impressed writes a column on {Cause} that is, grudgingly, impressed.'],
    ELITE: ['A foundation funds a national roll-out of {Cause} in every secondary school.', 'Three state governors announce their own versions of {Cause} in the same week.']
  },
  POLITICAL: {
    STREET: ['Party-neutral volunteers set up tables at motor parks with {Cause} and a Biro for everybody.', 'The union leader makes {Cause} the first item on the agenda, ahead of the food.'],
    SOCIAL: ['A young influencer explains {Cause} in plain Pidgin. It has more views than the last three press conferences.', 'The group chat that argues about everything finally agrees on one thing: {Cause}.'],
    PRESS: ['A national daily runs a full-page explainer on {Cause} and how to take part.', 'The morning TV show hosts two opposing candidates on {Cause}. It is, shockingly, civil.'],
    ELITE: ['The electoral officers\' association endorses {Cause} as a model of how it should be done.', 'A civil society coalition adds its name, its lawyers and its very good PR to {Cause}.']
  },
  MARKETING: {
    STREET: ['Keke riders wear {Cause} caps for a week in exchange for a free lunch. It is the cheapest billboard in Lagos.', 'Samples are handed out at the bus stop. The queue is longer than the one for the bus.'],
    SOCIAL: ['A meme-page features {Cause} and, for once, does not bury the joke under the ad.', 'Every influencer in Lekki receives a box. Forty post about it. Three admit they paid for it.'],
    PRESS: ['A lifestyle supplement runs a four-page spread on {Cause}. Half of it is an advert, honestly labelled.', 'A radio jingle for {Cause} is stuck in the whole country\'s head and nobody can say why.'],
    ELITE: ['A major retailer gives {Cause} an entire shelf at eye level. The shelf is the real campaign.', 'A business magazine names the founders of {Cause} among the "ones to watch".']
  },
  MYTHBUST: {
    STREET: ['The market gossip who spread the hoax now spreads the correction, with the same energy and a better source.', 'A neighbourhood meeting reads the real facts aloud, line by line, and the questions are good ones.'],
    SOCIAL: ['A fact-check thread explains in six tweets why the hoax is wrong. It outperforms the hoax by lunchtime.', 'A voice note debunking the myth is forwarded as fast as the myth was.'],
    PRESS: ['A radio phone-in spends a full hour on the myth, with an expert and a very patient host.', 'A weekend newspaper traces the hoax back to its first post, and prints the screenshot.'],
    ELITE: ['The professional body publishes a one-page correction that is short enough to be shared and strong enough to be quoted.', 'A university department issues a joint statement. It is dry, careful and, finally, believed.']
  }
};

// What the end screens say for a campaign. Win and loss, by type. {Cause} is the campaign; {Adopters} what people become.
export const CAMPAIGN_ENDINGS: Record<CampaignType, { win: string; winBody: string; lost: Record<'LOST_HEAT' | 'LOST_COVERUP' | 'LOST_TIME', { head: string; body: string }> }> = {
  HEALTH: {
    win: 'A HEALTHIER NIGERIA!', winBody: '{Cause} has reached three out of four people. Clinics report longer queues, shorter excuses and a sudden shortage of leaflets.',
    lost: {
      LOST_HEAT: { head: 'CAMPAIGN SUSPENDED', body: 'Backlash became a regulator\'s order. {Cause} was paused while people argued about its paperwork. Protect the campaign earlier next time.' },
      LOST_COVERUP: { head: 'THE MYTH WON', body: '{Target} drowned the message. People went back to doing what they were doing before. Proof, early and often, is what turns a myth around.' },
      LOST_TIME: { head: 'THE WINDOW CLOSED', body: '{Cause} reached many people but not enough. The season ended before the habit could stick. Bigger channels earlier, and keep the proof coming.' }
    }
  },
  AWARENESS: {
    win: 'EVERYBODY IS TALKING ABOUT IT!', winBody: '{Cause} is on the radio, in the market and in the school assembly. The hardest part, getting people to care, is done.',
    lost: {
      LOST_HEAT: { head: 'CAMPAIGN BLOCKED', body: 'Backlash grew faster than support. {Cause} was shut down before it could take root.' },
      LOST_COVERUP: { head: 'APATHY WON', body: '{Target} won again: a big shrug, a bigger distraction and a very short attention span.' },
      LOST_TIME: { head: 'THE NEWS CYCLE MOVED ON', body: 'Nigeria has a two-week news cycle and {Cause} used it up. Next time, spread faster.' }
    }
  },
  POLITICAL: {
    win: 'THE PEOPLE HAVE SPOKEN!', winBody: 'Three out of four Nigerians are on board with {Cause}. Politicians who never answered a call are returning every one.',
    lost: {
      LOST_HEAT: { head: 'CAMPAIGN BANNED', body: 'The backlash became an official complaint. {Cause} was ordered to stop. A better paper trail, and earlier protection, would have saved it.' },
      LOST_COVERUP: { head: 'THE OTHER SIDE WON THE ROOM', body: '{Target} out-shouted {Cause} and nobody had enough proof to answer. Next time bring receipts of your own.' },
      LOST_TIME: { head: 'ELECTION DAY CAME TOO SOON', body: '{Cause} was too slow. The vote went ahead, and many of the people you were trying to reach did not know it mattered.' }
    }
  },
  MARKETING: {
    win: 'SOLD OUT!', winBody: '{Cause} is the thing everybody is asking for. Shops cannot keep it on the shelf and the jingle is stuck in everybody\'s head.',
    lost: {
      LOST_HEAT: { head: 'PULLED FROM THE SHELVES', body: 'Backlash turned into a regulator\'s warning and a recall. {Cause} was off the shelves before it could take off.' },
      LOST_COVERUP: { head: 'THE RIVAL TOOK THE MARKET', body: '{Target} owns the conversation now. {Cause} is a footnote in somebody else\'s campaign.' },
      LOST_TIME: { head: 'THE LAUNCH FIZZLED', body: 'The launch window closed with plenty of people curious and not enough with {Cause} in their hands.' }
    }
  },
  MYTHBUST: {
    win: 'THE MYTH IS BUSTED!', winBody: 'Three out of four Nigerians now know the truth about {Cause}. The hoax is still out there, but nobody is forwarding it.',
    lost: {
      LOST_HEAT: { head: 'THE CORRECTION WAS REPORTED', body: 'Backlash grew until platforms limited the correction. {Target} was still going strong. Protect the message earlier.' },
      LOST_COVERUP: { head: 'THE HOAX WON', body: '{Target} spread faster than the truth. It nearly always does, unless the proof arrives first.' },
      LOST_TIME: { head: 'TOO LITTLE, TOO LATE', body: 'The correction reached many people, but the hoax had a head start. Next time, move earlier.' }
    }
  }
};
