# The Arena (player-made Targets)

Players build their own Targets and play each other's. This is step 1: everything works on the device, with no server.

## What a player can do
- **Create a Target** (Dossier > Arena > Create). Six guided steps: Who (names, scandals, look, the words they say), Pressure (baseline tier, 12 play styles,
  fine-tune dials), Fighting style (8 combat styles, 8 temperaments, weak and resisted lanes), Powers (up to 3 of 11 moves), World (news climate and up to 4
  scheduled "natural occurrences"), Test.
- **Test it any time** with the bot check. Nobody has to approve a Target.
- **Publish it** once it is fair. Publishing costs Brown Envelopes: `20 + difficulty + 5 per extra power + 4 per scheduled event` (updating a published Target is free).
- **Share it** as a code or a link (`?t=RUMT1....`). A friend who opens it gets it on their shelf after the bot check has run on their own phone.
- **Play** their own and shelf Targets. No perks, no stars, nothing towards unlocking tiers. The first win against each Target pays 8 envelopes.

The words are the player's own: names, scandals and text are not filtered (only their length is). Only the structure is validated.

## The bot check (`src/engine/botCheck.ts`)
Thirty bots (`STRATEGIES_30` in `bots.ts`: the original ten plus twenty more, each with a one-line tip in `STRATEGY_TIPS`) play the Target 12 times each, then the
best plan is replayed on fresh games so it is not flattered by luck. Result:
- difficulty `D = 0.5 * (100 - best plan win%) + 0.5 * (100 - average win%)`,
- PR rating = `ratingFromD(D)` on the same ladder as the official Targets (see calibration), and the tier it falls in,
- a verdict: **too hard** (best plan wins under 45%: it cannot be published), **trivial** (D under 3: allowed, lowest rating), or **fair**,
- tips from the plans that won, plus which families of plan work or fail (viral, proof, quiet, forgery, street) and the weak and resisted lanes,
- for a too-hard Target, **Make it fair for me**: it tries 15%, 30%, 45%, 60% and 75% gentler versions (the last also lowers the tier and calms the style) and offers
  the first fair one, with the list of changes. If even that fails, the player is told what to rethink.

It runs on the main thread in short slices (about 400 games, a few seconds), so it works the same in the browser, the installed app and the offline file.

### Calibration
`npm run calibrate` measures all official Targets with the thirty bots and refits `src/engine/data/ratingCurve.ts`. Run it again after re-tuning the official Targets
or adding bots. The 45% floor admits everything up to about the hardest official Target (the hardest has a best plan around 46%).

## Engine additions
- Moves: Smear Wave, Evidence Raid, Account Freeze, Roadblocks, Channel Jam, Region Lockdown (plus the original five).
- Combat styles: Cyber Squad, Old Money, Street Army. Temperaments: The Bully, The Ghost.
- `occurrences` (scheduled news events, fire on or after their day) and `climateId` on a Target.
- `kind: 'PLAYER'`: free text, no real-name or accusation checks, played from the Arena (hidden from the Dossier folders).

## Step 2 (needs the server): what is missing
Nothing can be trusted on the device, so ratings and results are only as honest as the players. With Supabase the plan is:
accounts, stored Targets, results verified by replaying the match on the server (see `docs/SECURITY.md`), a bot check re-run on upload, designer ratings from how Targets
fare against real players, live leaderboards, and the public site. The SQL for the tables will come with that step.
