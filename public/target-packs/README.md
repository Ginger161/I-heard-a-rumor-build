# Target packs

Anyone on the team can add Targets (including real creators who have agreed to appear) without touching code.

1. Open the game with `?studio=1` (for example `http://localhost:5173/?studio=1`).
2. Author the Target: identity, avatar (silhouette or an uploaded portrait), difficulty tier and folder, playstyle,
   scandals, abilities, chatter. The **Checks** panel lists every rule that is broken; **Run bots** plays 20 games
   against an expert and an average bot so you can see how hard the Target really is.
3. **Save in browser** to playtest on your own device. **Export JSON** when it is ready.
4. Put the exported file in this folder and list it in `index.json`:

       { "packs": ["my-creators.json"] }

5. Deploy. The game loads the listed packs at start-up. A bad Target is skipped and never breaks the rest.

Rules the validator enforces:
- `id` is snake_case and unique across the whole game (built-in ids can never be overwritten).
- A real creator (`kind: "CREATOR"`) needs `creator.handle`, `creator.consentRef` (where the written permission is kept)
  and `creator.approvedOn`. Creators and parodies only get comic scandals: no crimes, fraud or affairs.
- Fictional Targets may not carry a known real person's name.
- Avatars are `https://` URLs or PNG/JPEG/WebP data URLs (no SVG).
- Abilities, passives and ratings stay inside the tested ranges.

To retire a Target without deleting it, set `"enabled": false`.
