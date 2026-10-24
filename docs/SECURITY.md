# Security notes

The game runs entirely in the player's browser. That means a determined player can read the code, change the saved data
and patch the running game. Nothing client-side can stop that, so the aim is not "unhackable" but:

1. keep players from hurting **other** players or the site (real security),
2. make **shared** things (leaderboards, paid features) hard to fake, and
3. not waste effort on things only the cheater's own game is affected by.

## What matters, and what to do

| Threat | Matters? | Status |
|---|---|---|
| A player edits their own save (envelopes, stars) | No. Only their own game. | Ignored on purpose. |
| Malicious link or pasted code (`?s=`, `?c=`, progress codes, Studio packs) running script in someone's browser | **Yes** | No `innerHTML`/`eval` in the code; all imports are validated; **Content-Security-Policy** (below) blocks injected script even if one slipped through. |
| Page embedded in someone else's site (clickjacking) | Yes | `X-Frame-Options: DENY` and `frame-ancestors 'none'`. |
| Forged leaderboard scores | Yes, once boards are shared widely | Offline boards use a signature with a secret that is in the source, so it stops casual edits only (stated in `engine/scores.ts`). Real fix: server-side replay check (below). |
| Cracked Gist Pass | Yes, once money is involved | Licences are ECDSA-signed, only the public key ships, so codes cannot be forged. But the check can be patched out in the browser. Real fix: the server decides entitlements. |
| Studio / private key leaking | Yes | Studio is not in the public build; `private/` is git-ignored; the build contains no private key and no source maps. Check before every deploy (checklist). |
| Someone re-hosting a copy | Legal only | Copyright notice, `LICENSE`, the founder's mark, DMCA takedowns. |

## Headers (`public/_headers`)

- `Content-Security-Policy`: only this site's own scripts, plus Cloudflare Insights and OneSignal (both opt-in). No inline
  scripts (the two start-up helpers live in `public/early.js`), no `eval`, no plugins, no foreign frames. `style-src` allows
  inline styles because React sets them on elements.
- `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`, `Strict-Transport-Security`, `nosniff`,
  a tight `Permissions-Policy`.
- After changing anything that loads from another site, test with a production build served with these headers and look for
  CSP violations in the browser console. (If you add a new third-party script, add its host to `script-src` and `connect-src`.)
- The offline single file (`npm run build:offline`) has no server, so no headers; it inlines `early.js`.

## Plan: server-side score checking (build when online boards matter)

The engine is deterministic and seeded, so a finished game can be **replayed**:

1. The client records, for each match: Target, scandal, climate, seed, perk, assist flag, and the list of player actions with the
   day/tick each happened on (plant, spark taps, channel buys, evidence leaks, defence buys, decision choices, spin pops).
2. On finishing, it sends `{ matchSetup, actions, claimedScore }` to a small function (Cloudflare Worker / Netlify function).
3. The function imports the same `src/engine` code, re-runs the match with the same seed and actions, and recomputes the result
   and the score. It accepts the score only if the replay agrees, and stores `{ playerId, name, score, day }`.
4. Rate-limit per device and per IP, cap name length, and strip markup from names.

A forged number in the browser then achieves nothing, because the server never trusts the number, only the replay. Cost: a
backend, an action log in the engine, and care that the engine has no hidden randomness outside the seed.

## Plan: paid features

When payments go live, keep the licence **check on a server** that returns "premium: yes/no" for a signed code (and can revoke
it). Treat the client check as a convenience only.

## Before every deploy

- [ ] `npm run build` and `npm run verify` pass.
- [ ] `dist/` contains no `license-private.jwk`, no `.map` files, no Studio code (`grep -r "Target Studio" dist`).
- [ ] The CSP in `dist/_headers` is present; load the built site with it and check the console for violations.
- [ ] The project is in version control with `private/` and `.env.local` ignored.
