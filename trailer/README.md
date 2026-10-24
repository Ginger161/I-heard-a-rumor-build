# I Heard A Rumor — 30s trailer (Remotion)

One composition, two native aspect ratios. Every scene reads `useLayout()` and re-composes
(stacked in 9:16, side-by-side in 16:9) instead of cropping.

| Composition    | Size      | FPS | Frames |
| -------------- | --------- | --- | ------ |
| `Trailer-9x16` | 1080×1920 | 60  | 1800   |
| `Trailer-16x9` | 1920×1080 | 60  | 1800   |

## Commands (run inside `trailer/`)

```
npm install
npm run audio              # regenerate public/trailer-score.wav (synth sound bed)
npx remotion studio src/index.ts
npm run render:portrait    # out/trailer-9x16.mp4
npm run render:landscape   # out/trailer-16x9.mp4
npm run typecheck
node scripts/stills.mjs all 70,200,420   # quick key-frame JPEGs in out/stills
```

The render scripts pin `--port=3417` because Remotion defaults to port 3000, which is often taken by
other dev servers (a foreign server there makes Remotion fail with a 500).

## Structure

- `src/CinematicRig.tsx` — `perspective: 1400px` + `preserve-3d` camera (rotateX/Y/Z, translateX/Y/Z),
  lamp that tracks the focal point, vignette, impact shake and RGB-split bursts, whip-pan entry.
- `src/PostFX.tsx` — warm grade (`contrast(1.12) saturate(1.08) sepia(0.08)`), animated `feTurbulence`
  35mm grain at 0.06 opacity, shadow halftone.
- `src/scenes/Scene1..6.tsx` — the six scenes. `src/timing.ts` holds scene ranges and event frames
  shared by picture and audio.
- `src/components/NigeriaMap.tsx` — uses the game's real geometry: `@svg-maps/nigeria` paths,
  `src/engine/data/mapGeometry.ts` centroids and `nigeriaData.ts` populations.
- `src/theme.ts` — palette taken from the game UI.

## Gotchas

- Keep the desk plane circular and ≤ ~3200px: a plane that crosses the camera plane makes Chrome drop the frame.
- Fonts (Playfair Display, Inter, JetBrains Mono) load from Google Fonts at render time.
