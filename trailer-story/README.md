# THE RECEIPTS — Story Mode trailer (Remotion)

A ~63 second trailer for the **Story Mode** of *I Heard a Rumor* ("The Receipts", Season 1).
Separate from `../trailer` (the gameplay trailer). One composition, two native aspect ratios;
every scene re-composes for the frame it is given instead of cropping.

| Composition  | Size      | FPS | Length |
| ------------ | --------- | --- | ------ |
| `Story-16x9` | 1920×1080 | 60  | 63 s   |
| `Story-9x16` | 1080×1920 | 60  | 63 s   |

Outputs: `out/the-receipts-16x9.mp4`, `out/the-receipts-9x16.mp4`.

## The cut

| Time        | Scene | What happens |
| ----------- | ----- | ------------ |
| 0:00–0:09   | A — 6:06 | Black. The clock ticks to 6:06. The phone buzzes awake and an apology writes itself. Biko: "Somebody wrote your apology. Before you did anything." |
| 0:09–0:18   | B — The page | Lagos at night. "I don't make up gist. I bring receipts." Five people cornered, one slam each, then the apologies flood in. |
| 0:18–0:28   | C — The pattern | One apology, then the camera pulls back through a wall of them. SAME WORDS. SAME FORMAT. SAME MINUTE. The chorus: "Peace and light." |
| 0:28–0:41   | D — The trail | The clue board: receipts, CCTV, a redacted ledger, the Inspector's email, the Oracle, and Halo's voice note. |
| 0:41–0:48   | E — The choice | A timed decision with a cost, then the rumor goes national and the heat follows. |
| 0:48–0:55   | F — Aimed | "I thought I was exposing them." The reticle locks. "You were being aimed." |
| 0:55–1:03   | G — Title | One last buzz at 6:06. THE RECEIPTS. "Who writes the apologies?" |

## Commands (run inside `trailer-story/`)

```
npm run studio            # preview
npm run typecheck
npm run stills            # node scripts/stills.mjs Story-16x9 12.4,15.3,...  (global seconds)
npm run render:all        # both formats (long: heavy filters, ~1 h each)
```

`node_modules` is a junction to `../trailer/node_modules` (same Remotion version), so no second install.

## Voiceover (ElevenLabs)

Narrator is **Bill**; Halo is **Daniel**; the "Peace and light." chorus stacks six voices
(Bill, George, Roger, Clyde, Chris, Daniel). Overused voices (Adam, Brian) are deliberately avoided.
Expression comes from ElevenLabs v3 audio tags in `scripts/vo-script.mjs` (`[low]`, `[whispering]`, `[pause]`...),
a low-stability setting, and takes read in one go so intonation carries across sentences.
Each line is then processed in `scripts/voice-fx.mjs`:

- **Deeper, heavier:** resampled down 7–10% (pitch and formants), tempo restored with `atempo`, low-shelf boost, mud cut, compression, light saturation.
- **Close / inner voice:** slower, breathier (high shelf), more room and a soft ping-pong echo.
- **Halo's voice note:** phone-speaker band-pass, bit-crush, hiss. **Halo up close:** warm, deep, much too calm.
- **Chorus:** six voices pitched apart, staggered, panned, dropped into a dark 3-second hall.

```
set ELEVEN_API_KEY=sk_...         (PowerShell: $env:ELEVEN_API_KEY="sk_...")   # secret key, not the key *id*
npm run vo                        # generate + process  -> public/audio/vo/*.wav   (--list shows your voices)
npm run audio                     # score + sound design + voiceover -> public/story-mix.wav
node scripts/remux.mjs            # drop the new mix into the rendered videos, no re-render
```

`node scripts/vo-selftest.mjs` runs every voice chain on a synthetic voice (no API key) as a sanity check.
The key is read from the environment only and is never written to disk.

## Structure

- `src/timing.ts` — the single timeline (scene ranges, every event, VO placement). Picture **and** audio read it.
- `src/CinematicRig.tsx` — 3D camera (perspective + preserve-3d), handheld drift, impact shake, directional motion blur, RGB split, glitch displacement, lamp pool, vignette, whip-in.
- `src/PostFX.tsx` — night grade, lens falloff, animated 35mm grain, dust.
- `src/components/` — `kinetic.tsx` (slam / glitch / typed text), `ui.tsx` (phone, notes, chat, banners, profile, waveform), `docs.tsx` (the paper receipts), `bokeh.tsx` (night street), copied `props.tsx` / `NigeriaMap.tsx` from the gameplay trailer.
- `scripts/dsp.mjs` — oscillators, RBJ filters, reverb, compressor, resampler. `scripts/make-mix.mjs` — the score and sound design.

## Spoiler discipline

Teases the mystery (same apology everywhere, who writes it, someone is aiming at you) without revealing the
big turns. The ledger's project name is redacted. Chapter and ending counts are intentionally not mentioned.
