import { Branch } from './channels';

// ---------------------------------------------------------------------------
// ADULT GIST VOICE
//
// Story Mode's cast is invented, and so is everyone in it, so their gist can be crude, rude and expressive: the language
// real adults and students actually use on a group chat at 2 AM. This is used for channel flavour and evidence copy for
// story-only Targets, in place of the polite comic pool in parody.ts. That pool still protects the Targets that wink at
// real, recognisable people, so none of this text is ever attached to them (they stay comic, never sexual or criminal).
// ---------------------------------------------------------------------------
export const STORY_CHANNEL_LINES: Record<Branch, string[]> = {
  STREET: [
    'Agbero at the motor park: "Na {Target} dem dey talk about? Abeg, tell am make e pay the money wey e collect, e don tire me."',
    'Two okada riders at the junction are arguing about {Target}’s love life with the energy of a Premier League post-match show.',
    'At the buka, a woman slaps her ladle on the pot: "If {Target} was my child, I would have returned him to sender."',
    'The barbers on the street have a new haircut called "The {Target}". It is bald, with regret.',
    'Danfo conductor, mid-sentence, to the whole bus: "Oga, {Target} chop that person’s money, e still dey smile!"',
    'A keke driver is offering free rides to anyone who will repeat the {Target} story to his wife.'
  ],
  SOCIAL: [
    'A group chat called "Everything About {Target}" has hit 60,000 members. The first rule is: no fighting. The second rule is also no fighting. Nobody follows either.',
    'Some guy with 11 followers just posted the {Target} receipts. They have 1.2 million views and zero shame.',
    'Twitter: "I need someone to explain how {Target} is still allowed outside." 88,000 retweets. One reply: "Jail wasn’t built for pretty liars."',
    'The comment section under {Target}’s last picture has become a stand-up show, an MMA fight and a funeral, in that order.',
    'TikTok has made a sound out of {Target}’s voice note. It is already the number one sound for being lied to.',
    'A campus gossip page posted the {Target} story with the caption "Another one." Two hundred students replied "Who?" and then "OH."'
  ],
  PRESS: [
    'A morning-show host spent twelve minutes on {Target}, then apologised for the thirteenth with a very stiff face.',
    'The front page of the tabloid is just a picture of {Target} and the word "ALLEGEDLY" in a font that says otherwise.',
    'A radio phone-in about {Target} has run three hours past its slot. The caller from Ikorodu is crying. The caller from Ajah is shouting. Both are correct.',
    'An editor-in-chief says on live TV: "We are not saying {Target} did it. We are just saying we have seen the pictures."',
    'A columnist wrote 1,400 words on {Target} without using the word "alleged" once, and has already booked a lawyer.',
    'The newspaper’s lawyer reviewed the {Target} story, laughed, and signed with a flourish.'
  ],
  ELITE: [
    'At a Lekki dinner, someone loudly asks, "Has anyone seen what {Target} did now?" Forty forks stop in the air at once.',
    'A board chairman forwarded the {Target} story to his wife with the words "see what I told you". She replied with a single gif of a cup of tea.',
    'The country club has put {Target} on "an indefinite waiting list" and a golf cart has been seen reversing slowly away.',
    'Two retired generals at the polo field are comparing notes on {Target} the way men compare old war wounds.',
    'The people who never get involved have, for once, asked their assistants to "just look into it quietly".',
    'A senior pastor mentioned {Target} in his sermon without naming names. The whole congregation turned and looked at the same pew.'
  ]
};

export interface StoryEvidence { name: string; flavor: string }
export const STORY_EVIDENCE: Record<string, StoryEvidence> = {
  ev_tier1_wire: { name: 'The Transfer Receipt & Call Log', flavor: 'Dates, amounts, and a 3 AM call that lasted eleven minutes. {Target} says it was "a wrong number". You know the number.' },
  ev_tier2_voice_memo: { name: 'The Voice Note That Cannot Be Unheard', flavor: 'Forty seconds of {Target} saying something unprintable about someone who trusted them. The laugh at the end is the worst part.' },
  ev_tier3_footage: { name: 'The Unedited Footage', flavor: 'No filter, no angle, no caption. Just {Target}, doing exactly what everybody said they did, with a face that says "oh no".' },
  ev_tier4_smoking_gun: { name: 'The Master Folder', flavor: 'Every message, receipt, recording and selfie, in one folder labelled "DO NOT OPEN". {Target}’s hands are visibly shaking.' },
  ev_fake_whatsapp: { name: 'A "Totally Real" Screenshot', flavor: 'The font is a bit off, the battery is at 69%, and nobody has noticed the phone model was not released yet. Please do not ask questions.' },
  ev_deepfake_audio: { name: 'An AI Voice Note, Allegedly', flavor: 'It sounds exactly like {Target} saying something {Target} would never say. Which is why it is so convincing, and so risky.' }
};
