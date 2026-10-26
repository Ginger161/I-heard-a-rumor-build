# Campaigns: spread something good

Not every rumour has to be a scandal. A **campaign** runs on the same contagion engine as a case, pointed at something people can use: a health drive, a civic drive, a product launch, a myth-buster. The channels, bubbles, proof, protection, events and map are all the same. What changes is the enemy and the words.

## The five kinds (three campaigns each, gentle to tough)
| Kind | Campaigns | The opposition |
|---|---|---|
| Health | Wash Your Hands, Naija • Sleep Under a Net • Immunise Every Child | Apathy, myths about the nets, a (fictional) clinic hoax |
| Awareness | Clear the Gutters • Girls Back to School • Slow Down, Get Home | Business as usual, the old excuses, overconfidence |
| Political (civic) | Collect Your PVC • Know the Issues • Peaceful Elections | Voter apathy, the sharing-rice brigade, the rumour mill |
| Marketing | Zobo Fizz • Agbero Express • The Naija Jollof Festival | A big drink brand, an incumbent app, a rival festival |
| Myth-busting | Garri Is Not a Cure • Think Before You Tap • The Tower Is Not the Fever | A harmless hoax, a scam link, a (fictional) mast myth |

Everything in a campaign is invented: no real brand, party, candidate, product or person. **In myth-busting campaigns the player spreads the correction; the hoax is the opponent.** Political campaigns are about taking part (registering, comparing issues, keeping the peace), never about a side. The risky shortcut in every campaign is **exaggeration** (a bolder claim than the evidence supports): it spreads fast and can backfire when checked, exactly like a forged file in a scandal.

## How the numbers are renamed (the rules are unchanged)
| Scandal case | Campaign |
|---|---|
| Believers (75% wins) | Adopters: "hand-washers", "registered voters", "customers" (each campaign names its own) |
| Doubt | Skepticism |
| Cover-Up | Opposition |
| Heat | Backlash (regulators, critics, platforms) |
| Evidence desk / forgeries | Proof Desk / hype and exaggeration |
| Defense desk (Burner SIM, Darknet Relay, SAN, Whistleblower, Safehouse) | Protection Desk (Volunteer Network, Community Radio Partnership, Pro Bono Legal Counsel, Insider Champion, Pause and Reset) |
| Spin bubbles | Hoax bubbles |

A campaign is lost the same three ways: Backlash reaches 100%, the Opposition reaches 100%, or time runs out.

## Where it lives
- `engine/data/campaigns.ts`: the 15 campaigns. Each is a `TargetDef` of kind `CAMPAIGN` with a `campaign` block (type, cause, slogan, adopter, goal, opposition). The Target IS the opposition. A campaign has four **angles** (the four scandal categories, renamed), which decide which channels work 35% harder.
- `engine/campaigns.ts`: the dictionary (`vocabFor`, `campaignize`) and the type metadata. `campaignize` re-voices the engine's stock words in any text.
- `engine/data/campaignCopy.ts`: the voice: alert wording (same keys as `COPY`), proof and protection items, channel lines per kind, and the end screens.
- `engine/events.ts`: informant tips and court dates are `scandalOnly` (never drawn in a campaign); six community moments are `campaignOnly` (radio call-in, joint endorsement, volunteers, a hoax about the campaign, schools, a donor with strings).
- `ui/screens/CampaignsScreen.tsx`: the hub (a fresh green look, `data-mode='campaign'`). Campaigns pay envelopes and stars like any other case, and are kept out of the arcade difficulty ladder.

## Adding a campaign
Add a `CampaignSpec` to `SPECS` in `campaigns.ts` (3 abilities at most, each a move the opposition makes), add a `LOOKS` entry for its id, then run `npm run simulate:campaigns` and tune `mods` until the bots land where you want (Gentle: ~95%+, Steady: 70-90%, Tough: 40-65%). `npm run verify` checks that no campaign text talks about scandals, guilt or arrests.
