# Writing the story (the scene engine)

Season 1 is told with **scenes**: short lists of beats that play full screen. You never touch code to add one.

## Where things live
- `src/engine/season/types.ts`: the beat types, choices, effects, conditions, plot events.
- `src/engine/season/act1.ts` to `act5.ts`: the prologue and all 16 chapters (Act 1: c01-c04, Act 2: c05-c08, Act 3: c09-c11, Act 4: c12-c14, Act 5: c15-c16). `act5.ts` also holds the finale endings. Each act is listed in `script.ts`.
- `src/engine/season/clues.ts`: the 24 clue cards. `src/engine/season/cast.ts`: who talks, and faces for people who are not Targets.
- `src/ui/components/ScenePlayer.tsx` (plays a scene), `ClueBoard.tsx` (the board), `src/ui/screens/StoryScreen.tsx` (hub and chapter flow).

## A chapter script
```ts
const C05: ChapterScript = {
  pre:  { id: 'c05.pre', beats: [ ...cold open and set-up... ] },     // before the match (after the player has picked who, for pair chapters)
  plot: [ { id: 'plot_c05_x', day: 9, stamp, headline, body, choices: [ { id, label, detail, effects: [...], story: {...} } ] } ],   // decision cards that fire on a fixed day inside the match
  won:  { id: 'c05.won',  beats: [ ...the reveal, the clue, the cliffhanger... ] },
  lost: { id: 'c05.lost', beats: [ ...short... ] }
};
```
The existing set-up text, motive and win/lose epilogues in `data/story.ts` still play: `pre` runs first (once), then the motive cards, then the approach pick and the match; after the match
the win/lose text plays, then your `won`/`lost` scene, then the result screen.

## Beats
`cold` (black screen, a line and a timestamp) • `narr` • `say` (portrait and a line; `who` is a cast id or `target`) • `chat` (a thread, a message at a time) • `voice` • `news` • `doc` (notes, ledger, email, receipt, court, draft; `mark` highlights lines) •
`still` (CCTV) • `choice` (`timer` seconds makes it timed; `fallback` is chosen when it runs out) • `clue` (pins a clue) • `pause`. Any beat can have `shake: true` and a `when` condition (flag, clue, Trust, Inspector, an earlier choice).

## Effects
`{ trust, coker, integrity, flags, clues }` on a choice option, a plot choice (`story`) or a scene (`onEnd`). Trust is 0 to 10 (starts at 5), Coker (the Inspector) 0 to 10. A plot choice's effects apply when the chapter is first won.

## Checks
`npm run verify` checks that every clue exists, every flag a beat tests can be set, timed choices have a fallback, plot beats are scheduled on the right Targets and never drawn at random, and that choices apply on a win.

## Plain-words layer (clarity pass)

Story Mode explains itself in `engine/season/guide.ts` and the Story hub:
- **Continue card**: the next chapter, a "Previously…" recap (`RECAPS`, one per finished chapter; add one when you write a chapter), and the mission line (target days come from `dayBudgetFor`).
- **Step strip** (Scene, Briefing, Plan, Case, Aftermath) on every chapter screen.
- **Who's who** lists only people the player has met (anyone who spoke or messaged in a scene already seen); keep each `CAST_ROLE` line spoiler-free.
- **What do these mean?** (`GLOSSARY`) defines Trust, Inspector, Clues and Reputation.
- Choices that change Trust, Inspector attention or Reputation show a one-line toast in the scene.
- The prologue is labelled "A glimpse ahead" (a flash-forward) and ends with "Now, go back."

## The full season (16 chapters)

Chapter ids c01 to c16 (see `docs/STORY_BIBLE.md` for the beats). Three are new set pieces with their own Targets and rules:
- **c08 Lights Out** (`story_security_head`): a day-2 rule card applies the Blackout (Social channels at half power for the whole case, Heat +30), then four scripted nights (days 2, 5, 9, 13). Ends on the Biko reveal and the fire / forgive / use choice.
- **c14 The Owambe** (`story_chief_of_staff`): the heist. A 14-day clock, and the wedding timetable as plot cards (first dance, speeches, spraying, cake): each is a window to act.
- **c15 Six-Oh-Six** (`story_ops_head`): the siege. A 12-day clock, an Evidence Raid every four days, and channels flooded with Spin from day 2.

Other chapters get their rules from Target data: c05 jams the Press and Elite lanes, c06 serves an injunction every six days, c07 freezes your account, c09 starts the SE region doubtful, c10 raids your evidence, c11 has a short clock and a doubtful hometown region, c12 is `evidenceCost: 0.6` and `noForgery: true` (a room of liars), c13 raises Heat 25%, and c16 is the mirror match: an ability with `mirror: true` hits the lane where you own the most channels, and `minBelievers: 50` makes it a second phase.

### Conditions and endings
- A `Cond` can test `flag`, `notFlag`, `flags` (all), `anyFlag`, `clue`, `cluesGte`, `trustGte/Lt`, `cokerGte/Lt` and an earlier `choice`. A choice **option** can carry its own `when`, so it is only offered if the story says so (the finale uses this).
- The finale choice (`c16_finale`) sets one `end_*` flag. `ENDINGS` (act5.ts) maps each flag to an ending scene. Options: Peace and Light and The New Halo always; The Receipts, Public needs `ally_zainab`; Cut the Cord needs `went_alone`; **The Oracle** (hidden) needs 16 clues, Trust 8, `fola_out`, `ngozi_saved` and `ally_coker`. `SIGNATURE` is a hidden coda after any ending but the Oracle if you used Biko and went alone.
- The flags that matter across the season: `biko_fired / biko_forgiven / biko_used` (c08), `fola_protected / fola_exposed` (c05), `fola_out` (c12), `ngozi_saved / ngozi_taken` (c12), `zainab_contact` (c07), `went_undercover / refused_plan` (c13), `ally_coker / ally_zainab / went_alone` (c15).
- Add a recap in `guide.ts` (`RECAPS`) for any chapter you add. `npm run verify` checks that every clue is pinned exactly once in its own chapter, every tested flag can be set, and the finale always offers at least two endings.

## Premium Gist (bonus episodes)
Three bonus episodes live in `PREMIUM_EPISODES` (data/story.ts, with `premium: true` and `requires: '<chapter>'`) and `season/premiumScripts.ts`. They are outside `STORY_CHAPTERS`, so the season is complete without them, they never change your reputation, and they need a Gist Pass (`startStory` refuses them without one). Each opens once its chapter is won (`episodeUnlocked`). Finishing sets a flag (`ep_biko`, `ep_year_zero`, `ep_oracle`) that adds a few lines to Chapter 16 and the endings. "Year Zero" can pin the bonus clue C25 (`isBonusClue`).
