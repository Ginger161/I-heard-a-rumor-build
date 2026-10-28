# I Heard A Rumor: gameplay trailer

A 75-second, 60fps gameplay montage in 16:9 and 9:16. It is built from the real game, not mock-ups:

- **Real recorded gameplay** (`public/takes/*.mp4`): the dev server driven by scripted touch input and recorded with Chrome's screencast.
- **A real simulated game** (`src/simdata.json`): a bot-played win and a bust from the actual engine, which drive the extruded 3D map.
- Everything is composed in Remotion with a 3D camera rig, floating phones with real thickness, kinetic type and callouts.

## Pipeline

```
npm run dev            (in the game folder, port 5173: the recorder drives it)
node scripts/record.mjs [take ...]       record takes -> public/takes + markers.json
node ..\node_modules\.cache\trailerSim.cjs   re-export sim data (see scripts/trailerSim.ts in the game repo)
ELEVEN_API_KEY=sk_... node scripts/make-vo.mjs   voiceover (key from the environment only, never stored)
node scripts/make-mix.mjs                music + SFX + VO -> public/gameplay-mix.wav
node scripts/stills.mjs Gameplay-16x9 5,12,30   key-frame stills (silent)
npm run render:all                       -> out/gameplay-16x9.mp4, out/gameplay-9x16.mp4
```

Takes: `run` (Dossier tiers, case file, plant, first spark, Conspiracy Board, Evidence, Defense), `spread` (timelapse), `heat`,
`win`, `lose_heat`, `lose_cover`, `story`, `arena`, `campaign`, plus live story/campaign boards.

## Timeline

`src/timing.ts` is the single source of truth. The picture (`src/scenes.tsx`) and the audio (`scripts/make-mix.mjs`,
`scripts/vo-script.mjs`) both read it, so sound and image cannot drift. The music edit jumps exactly nine 5.00s phrases on the
ending cut so the track's closing chord lands on the title slam (71.25s): change a scene length and re-check that.

## Audio

Music and effects are the Epidemic Sound files in `public/audio/`. Voice is ElevenLabs (Callum, v3 delivery tags), squeezed, deepened
and compressed in `make-vo.mjs`. The mix was verified by measurement only, not by ear.
