// Records the real game (dev server on :5173) into public/takes/*.mp4 and writes public/takes/markers.json with the
// time of every action, so the Remotion cut can line callouts up with what is on screen.
//   node scripts/record.mjs            all takes
//   node scripts/record.mjs run spread only takes whose name is listed
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { launch, GAME, ROOT, sleep } from './cdp.mjs';

const OUT = join(ROOT, 'public/takes');
const seed = (n) => join(GAME, `scratch/qa/seed_${n}.json`);
const only = process.argv.slice(2);
const want = (n) => only.length === 0 || only.includes(n);
const markersFile = join(OUT, 'markers.json');
const markers = existsSync(markersFile) ? JSON.parse(readFileSync(markersFile, 'utf8')) : {};

// ---- shared page-side helpers ----------------------------------------------------------------------------------------------
const POP = `(() => { let n = 0; document.querySelectorAll('button[aria-label^="Collect"], button[aria-label^="Shatter"]').forEach(b => { b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); n++; }); return n; })()`;
const CENTER = (selJs) => `(() => { const e = ${selJs}; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`;

async function session(name, opts, fn) {
  if (!want(name)) return;
  console.log('take:', name);
  const b = await launch(opts);
  const t0 = { v: 0 };
  const mk = {};
  const mark = (k) => { mk[k] = +((Date.now() - t0.v) / 1000).toFixed(2); };
  try {
    await fn(b, mark, t0);
  } catch (e) { console.error('take failed:', name, e); }
  const res = await b.stopRec(name, OUT).catch((e) => { console.error('stopRec failed', e); return null; });
  await b.close();
  if (res) { markers[name] = { seconds: +res.seconds.toFixed(2), marks: mk }; writeFileSync(markersFile, JSON.stringify(markers, null, 2)); }
}
const startRec = async (b, t0) => { await b.startRec(); t0.v = Date.now(); };
const harvest = async (b, ms, every = 350) => { const end = Date.now() + ms; while (Date.now() < end) { await b.ev(POP); await sleep(every); } };
const ALERT = `(async () => { const m = document.querySelector('div[class*="z-[100]"]'); if (!m) return false; const bs = [...m.querySelectorAll('button')].filter(b => !b.disabled); if (!bs.length) return false; bs[0].click(); await new Promise(r => setTimeout(r, 650)); return true; })()`;
const passAlerts = async (b) => { for (let i = 0; i < 3; i++) { if (!(await b.ev(ALERT))) break; } };

// ---- 1. the run: Dossier -> case file -> plant -> first spark -> Channels -> Evidence -> Defense --------------------------------
await session('run', { seedFile: seed('dossier_progress') }, async (b, mark, t0) => {
  await b.nav('/?speed=2');
  await startRec(b, t0);
  mark('dossier'); await sleep(1800);
  // flick through the five tiers: sealed ones are silhouettes
  for (const t of [2, 3, 4, 5]) { await b.ev(`__tab(${t}, 1000)`); mark('tier_' + t); }
  await b.ev(`__tab(1, 800)`); await sleep(400);
  mark('pick'); await b.ev(`__click('Mr. Macaroony', 1600)`);
  mark('casefile'); await b.ev(`(() => { const s = [...document.querySelectorAll('.overflow-y-auto')].pop(); s && s.scrollTo({ top: 600, behavior: 'smooth' }); })()`); await sleep(1500);
  mark('scandal'); await b.ev(`__click('Financial', 900)`);
  mark('open'); await b.ev(`__click('Open case file', 2200)`);
  // the map is empty: tap a state to plant the rumor
  mark('map'); await sleep(900);
  const lagos = await b.ev(CENTER(`[...document.querySelectorAll('svg g.cursor-pointer')].sort((p, q) => p.getBoundingClientRect().left - q.getBoundingClientRect().left)[2]`));
  await b.tap(lagos.x, lagos.y); mark('plant'); await sleep(1700);
  mark('spark_ready'); await sleep(600);
  await b.ev(POP); mark('spark_pop'); await sleep(1800);
  mark('ground_zero'); await sleep(900);
  await passAlerts(b); await sleep(1200);
  mark('ticking'); await harvest(b, 3500);
  // Channels board: tap the cheapest pin, acquire it
  mark('channels_open'); await b.ev(`__click('channels', 1700)`);
  await b.ev(`__click('got it', 500); __click('skip tour', 500)`);
  const pin = await b.ev(CENTER(`[...document.querySelectorAll('div.absolute.cursor-pointer')].find(e => e.textContent.toLowerCase().includes('agbero'))`));
  if (pin) { await b.tap(pin.x, pin.y); mark('pin_select'); await sleep(1600); await b.ev(`__click('acquire channel', 1400)`); mark('pin_buy'); }
  await sleep(1200); await passAlerts(b);
  await b.ev(`__click('close board', 900)`); await passAlerts(b); await b.ev(POP); await sleep(500);
  mark('evidence_open'); await b.ev(`__click('evidence', 1800)`); await sleep(900);
  await b.ev(`__click('close', 900)`);
  mark('defense_open'); await b.ev(`__click('defen', 1800)`); await sleep(900);
  await b.ev(`__click('close', 900)`);
  mark('end'); await harvest(b, 2500);
});

// ---- 2. the spread: a mid-game board at speed, harvesting bubbles and shattering spin ----------------------------------------
await session('spread', { seedFile: seed('arcade_mid') }, async (b, mark, t0) => {
  await b.nav('/?speed=5');
  await b.ev(`__click('resume investigation', 900)`); await b.ev(`__click('take over', 500)`);
  await startRec(b, t0);
  mark('start');
  for (let i = 0; i < 40; i++) { await b.ev(POP); await passAlerts(b); await sleep(450); if (i === 14) mark('mid'); }
  mark('end');
});

// ---- 3. sheets and endings from saved states --------------------------------------------------------------------------------------
const still = (name, seedName, pre, hold = 3200) => session(name, { seedFile: seed(seedName) }, async (b, mark, t0) => {
  await b.nav('/?speed=1');
  if (pre) await b.ev(pre);
  await startRec(b, t0); mark('start'); await sleep(hold); mark('end');
});
const RESUME = `(async () => { await __click('resume investigation', 900); await __click('take over', 500); })()`;
await still('heat', 'arcade_mid', `${RESUME}.then(() => __click('🚨', 900))`);
await still('casefile_live', 'arcade_mid', `${RESUME}.then(() => __click('the rumour', 900))`);
await still('win', 'arcade_win', '', 5000);
await still('lose_heat', 'arcade_lose_heat', '', 4000);
await still('lose_cover', 'arcade_lose_cover', '', 4000);
await still('story', 'story_hub', `__click('story mode', 1500)`, 3500);
await still('story_live', 'story_mid', RESUME, 4000);
await still('arena', 'arena_hub', `__click('arena', 1200)`, 3000);
await still('campaign', 'campaign_hub', `__click('campaigns', 1500)`, 3000);
await still('campaign_live', 'campaign_mid', RESUME, 4000);
console.log('done');
