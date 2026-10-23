# Launch guide: from this folder to players

## 1. Get it playable today (about 30 minutes)

The game is a static website: `npm run build` makes a `dist/` folder, and any static host can serve it.

1. Put the project on GitHub (private repo is fine): `git init`, `git add .`, `git commit`, push. `private/` (your licence key) and `node_modules/` are already in `.gitignore`.
2. Create a free account on **Cloudflare Pages** (recommended), or Netlify.
3. Connect the repo. Build command `npm run build`, output folder `dist`. Deploy.
4. Open the address it gives you on a real phone. Check: it loads, you can play a case, "Add to home screen" works, and after one visit it opens with no data.
5. Buy a domain (a `.ng` or `.com.ng` is cheap and trusted locally, or a `.com`), add it in the host's dashboard. HTTPS is automatic.
6. Test on a cheap Android phone and on slow data before you tell anyone.

### Netlify, Vercel or Cloudflare?

| | Commercial use on free plan | Nigeria speed | Forms / functions | Locking the Studio |
|---|---|---|---|---|
| **Cloudflare Pages** | Yes | Best (has servers in Lagos) | Pages Functions (free tier) | **Cloudflare Access**, free for up to 50 people |
| **Netlify** | Yes | Good | Netlify Forms (waitlist) and Functions | Paid plans only |
| **Vercel** | **No: the free "Hobby" plan is for non-commercial use** | Good | Serverless functions | Paid plans only |

Between the two you asked about, use **Netlify**: Vercel's free plan is not allowed for anything that earns money, and you plan to charge. My actual recommendation is **Cloudflare Pages**: free, no bandwidth cap worries on a viral launch, fastest for Nigerian players, and it can lock the Studio. (Check each host's current terms before you commit; plans change.)

### Environment variables (set in the host's dashboard, then redeploy)

| Variable | What it does |
|---|---|
| `VITE_MONETIZATION_LIVE` | `true` turns the Gist Pass page from "coming soon" into a Buy page |
| `VITE_PAYMENT_URL` | Your Paystack (or Flutterwave) payment-page link |
| `VITE_PREMIUM_PRICE` | Text shown on the Buy button, e.g. `₦2,500 once` |
| `VITE_WAITLIST_URL` | On Netlify set it to `/` (the hidden form in `index.html` collects emails). Elsewhere use Formspree or similar. Empty = emails stay on the device |
| `VITE_ONESIGNAL_APP_ID` | Turns on real push reminders |
| `VITE_ANALYTICS_TOKEN` | Cloudflare Web Analytics token (cookie-free visit counts) |
| `VITE_SUPPORT_EMAIL` | Shown to buyers who need help |

## 2. The Studio (team content tool)

Never put the Studio on the public site. Run `npm run build:studio` (output `dist-studio/`), deploy that folder as a **second** project, and protect it with Cloudflare Access (Zero Trust > Access > Applications > add your team's emails). Players' build contains none of the Studio code.

## 3. Reminders ("global notifications")

A web page cannot wake a phone by itself, so reminders need a push service. The game is ready for **OneSignal** (free tier):

1. Create a OneSignal app, choose Web, enter your site address. Copy the **App ID** into `VITE_ONESIGNAL_APP_ID` and redeploy.
2. In OneSignal's web settings use a custom service-worker path: `push/OneSignalSDKWorker.js`, scope `/push/` (the file is already in `public/push/`).
3. Players opt in from Settings > Daily reminders. Nothing third-party loads before they do.
4. The game tells OneSignal three facts you can segment on: `streak`, `daily_done` (yes/no) and `last_played`.
5. Create two automated messages in OneSignal:
   - **Daily case**, about 6pm Lagos time, to everyone: "Today's case is live. Who are we cancelling? 🕵️" / "Naija is waiting for your gist. Today's Daily Case just dropped."
   - **Streak at risk**, about 9pm, segment `daily_done = no` and `streak >= 2`: "Your streak ends tonight. One case to save it. 🔥"
6. Keep it to one message a day at most. Too many and people switch them off.

Notes: on iPhone, push works only after the player adds the game to the Home Screen (iOS 16.4+). The installed app also shows a dot badge while today's case is waiting.
**I could not test OneSignal end to end** (it needs your account). Test it on a real Android phone and an iPhone before launch.

## 4. The Gist Pass (premium), "coming soon" until you decide

Already working today:
- The Gist Pass page shows "coming soon" with a waitlist, and licence codes already unlock Premium (every Target file, the gold share card, a supporter badge).
- **Gift Premium now** (testers, creators, press): `node scripts/licenseTool.mjs issue --plan forever --note "Name"`. Send them the code; they paste it into Settings > Redeem a code, or the Gist Pass page. Use `--plan season --days 90` for a time-limited one.
- Back up `private/license-private.jwk` somewhere safe (not the repo). If you lose it you cannot issue codes; if someone steals it they can forge codes.

When you are ready to charge (Nigeria: use **Paystack** or Flutterwave; Stripe does not serve Nigerian businesses well):
1. Create a Paystack payment page for the Gist Pass and set `VITE_PAYMENT_URL`, `VITE_PREMIUM_PRICE`, `VITE_MONETIZATION_LIVE=true`.
2. Easiest start (manual, fine for the first customers): after each payment email arrives, run the `issue` command and email the code.
3. Automatic (later): a small serverless function receives Paystack's webhook, checks its signature, signs a licence with the private key (stored as a secret on the host, never in the repo) and emails it. The licence format is already in `src/engine/premium.ts`.
4. Tell buyers clearly what they get, and keep the game free to play.

## 5. Before you tell people about it

- [ ] A lawyer has read the parody names and the Terms/Privacy templates (`public/privacy.html`, `public/terms.html`; put your contact email in them). Nigerian rules on data protection (NDPA 2023) and on satire both matter.
- [ ] Real phone tests: a cheap Android, an iPhone, a laptop. Try the share button, the install prompt, the offline start.
- [ ] A way for players to tell you about bugs (an email or a form), written in the Terms/Privacy and the Premium page.
- [ ] Analytics token set, so you can see how many people play and where they stop.
- [ ] A soft launch to 20 to 50 people first. Watch where they get confused. Fix that before a bigger push.
- [ ] Back up the licence key and keep a copy of the repo somewhere other than your laptop.
- [ ] Music: commission or license real tracks if you can (see `public/music/README.md`).
- [ ] Your social handles and one launch post ready: the front-page share image is your best advert.
