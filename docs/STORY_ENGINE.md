# Writing the story (the scene engine)

Season 1 is told with **scenes**: short lists of beats that play full screen. You never touch code to add one.

## Where things live
- `src/engine/season/types.ts`: the beat types, choices, effects, conditions, plot events.
- `src/engine/season/act1.ts`: the prologue and chapters 1 to 4. Add `act2.ts` etc. the same way and list them in `script.ts`.
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
