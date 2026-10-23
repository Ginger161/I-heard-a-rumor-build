# Commissioned portraits (optional)

The game draws every Target's face in code (gender, age, region and an emotion), so it needs no art files. To use real
illustrations for a Target instead:

1. Make one PNG per emotion, ideally 400 x 500 px, transparent background, head and shoulders:
   `neutral.png`, `confident.png`, `smug.png`, `angry.png`, `worried.png`, `panic.png`, `defeated.png`, `laugh.png`
2. Put them in `public/avatars/<targetId>/` (for example `public/avatars/story_boss/neutral.png`).
3. Add the id to `index.json`: `{ "targets": ["story_boss"] }`.

Only `neutral.png` is required: a missing emotion falls back to it, and a missing file falls back to the drawn face.
The Targets' ids are in `src/engine/data/targets/*.ts` and `src/engine/data/story.ts`.