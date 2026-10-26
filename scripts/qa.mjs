// VISUAL QA. Opens screens of the running dev server (http://localhost:5173) in a headless phone, in realistic saved states, and checks:
//   - TEXT CONTRAST: every visible text element against the colour actually behind it (WCAG: 4.5 for normal text, 3 for large). Anything below is a failure.
//   - CUT-OFF TEXT: text that overflows and is clipped, and elements that run off the side of the screen.
// Seeds come from scripts/qaSeeds.ts (scratch/qa/seed_*.json). Screenshots go to scratch/qa/<name>.png and a report to scratch/qa/report.txt.
//   node scripts/qa.mjs            all scenarios
//   node scripts/qa.mjs alert      only scenarios whose name contains "alert"
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.QA_BASE ?? 'http://localhost:5173';
const filter = process.argv[2] ?? '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
mkdirSync('scratch/qa', { recursive: true });

// ---- helpers available to every scenario's `pre` script ---------------------------------------------------------------------
const H = `const s=ms=>new Promise(r=>setTimeout(r,ms));
const btn=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.toLowerCase().includes(t.toLowerCase()));
const click=async(t,w=700)=>{const b=btn(t);if(b){b.click();await s(w);return true}return false};
const tapScene=async(n,w=1700)=>{for(let i=0;i<n;i++){const sc=document.querySelector('.fx-film[data-mode=story]');if(sc)sc.click();await s(w)}};
const resume=async()=>{await click('Resume investigation',900);await click('Take over',500)};
const setText=(el,v)=>{const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')||Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value');d.set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}))};`;

// ---- the check that runs inside the page ------------------------------------------------------------------------------------
const CHECK = `(() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = c => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (t, b) => { const a = t[3] + b[3] * (1 - t[3]); if (a === 0) return [0, 0, 0, 0]; return [0, 1, 2].map(i => (t[i] * t[3] + b[i] * b[3] * (1 - t[3])) / a).concat([a]); };
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const hex = c => '#' + c.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  const out = { low: [], clipped: [], offscreen: [], tiny: [] };
  const seen = new Set();
  const vw = window.innerWidth;
  const all = document.querySelectorAll('body *');
  all.forEach(el => {
    if (el.closest('svg') || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) return;
    const direct = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim().length > 0).map(n => n.textContent.trim()).join(' ');
    if (!direct) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity); if (op < 0.35) return;
    // the colour behind the text: every ancestor background, nearest first, until something opaque
    const layers = []; let img = false;
    for (let e = el; e; e = e.parentElement) {
      const c = getComputedStyle(e); const bg = rgba(c.backgroundColor);
      if (c.backgroundImage && c.backgroundImage !== 'none' && bg[3] < 0.98) img = true;
      if (bg[3] > 0) layers.push(bg);
      if (bg[3] >= 0.98) break;
    }
    let bg = [7, 9, 13, 1]; for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg);
    let fg = rgba(cs.color); fg = over([fg[0], fg[1], fg[2], fg[3] * Math.min(1, op)], bg);
    const px = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
    const large = px >= 24 || (px >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    const rt = ratio(fg, bg);
    if (rt < need) {
      const key = direct.slice(0, 30) + hex(fg) + hex(bg);
      if (!seen.has(key)) { seen.add(key); out.low.push({ text: direct.slice(0, 48), ratio: Math.round(rt * 10) / 10, need, fg: hex(fg), bg: hex(bg), px, img, tag: el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.split(' ').filter(Boolean).slice(0, 3).join('.') : '') }); }
    }
    if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) out.clipped.push({ text: direct.slice(0, 60), kind: 'ellipsis' });
    else if ((cs.overflowX === 'hidden' || cs.overflowX === 'clip') && el.scrollWidth > el.clientWidth + 2 && !el.closest('.no-scrollbar')) out.clipped.push({ text: direct.slice(0, 60), kind: 'hidden overflow' });
    // off the side of the screen, unless something around it clips or scrolls it (a pannable board, a scroller)
    if (r.right > vw + 3 && r.left < vw) {
      let clippedBy = false;
      for (let e = el.parentElement; e; e = e.parentElement) { const c = getComputedStyle(e); if (c.overflowX !== 'visible' && e.getBoundingClientRect().right <= vw + 2) { clippedBy = true; break; } }
      if (!clippedBy) out.offscreen.push({ text: direct.slice(0, 40), right: Math.round(r.right), vw });
    }
    if (px < 10 && !el.closest('[aria-hidden=true]')) out.tiny.push({ text: direct.slice(0, 30), px });
  });
  return JSON.stringify(out);
})()`;

// ---- scenarios --------------------------------------------------------------------------------------------------------------
const seeded = (name, seed, pre = '', extra = {}) => ({ name, seed, pre, ...extra });
const S = [];
// first minute
S.push({ name: 'cold_open', fresh: true, pre: '' });
S.push({ name: 'cold_where', fresh: true, pre: `await click('Spread am',1200)` });
// arcade home
S.push(seeded('dossier', 'dossier_progress'));
S.push(seeded('dossier_case', 'dossier_progress', `await click('Mr. Macaroony',900)`));
S.push(seeded('dossier_menu', 'dossier_progress', `await click('☰',700)`));
S.push(seeded('dossier_settings', 'dossier_progress', `await click('☰',700);await click('Settings',900)`));
S.push(seeded('dossier_guide', 'dossier_progress', `await click('☰',700);await click('Field Guide',900)`));
// a match in progress
S.push(seeded('live_paused', 'arcade_mid'));
S.push(seeded('live_arcade', 'arcade_mid', `await resume()`));
S.push(seeded('live_channels', 'arcade_mid', `await resume();await click('Channels',1200)`));
S.push(seeded('live_channel_pick', 'arcade_mid', `await resume();await click('Channels',1200);const p=[...document.querySelectorAll('[class*=rounded-full]')].find(e=>e.textContent.includes('KEKE')||e.closest('button'));await click('KEKE',900)`));
S.push(seeded('live_evidence', 'arcade_mid', `await resume();await click('Evidence',1200)`));
S.push(seeded('live_defense', 'arcade_mid', `await resume();await click('Defense',1200)`));
S.push(seeded('live_heat_sheet', 'arcade_mid', `await resume();await click('🚨',900)`));
S.push(seeded('live_believers_sheet', 'arcade_mid', `await resume();await click('👥',900)`));
S.push(seeded('live_case_file', 'arcade_mid', `await resume();await click('The rumour',900)`));
S.push(seeded('live_history', 'arcade_mid', `await resume();await click('DAY',900)`));
S.push(seeded('end_win', 'arcade_win', '', { wait: 2500 }));
S.push(seeded('end_lose_heat', 'arcade_lose_heat', '', { wait: 2500 }));
S.push(seeded('end_lose_cover', 'arcade_lose_cover', '', { wait: 2500 }));
// the other two modes in play
S.push(seeded('story_live', 'story_mid', `await resume()`));
S.push(seeded('arena_live', 'arena_mid', `await resume()`));
// story screens
S.push({ name: 'story_prologue', fresh: true, pre: `await click('Story Mode',1500);await tapScene(2)` });
S.push({ name: 'story_prologue_chat', fresh: true, pre: `await click('Story Mode',1500);await tapScene(3,3200)` });
S.push({ name: 'story_prologue_doc', fresh: true, pre: `await click('Story Mode',1500);await tapScene(6,3200)` });
S.push(seeded('story_hub', 'story_hub', `await click('Story Mode',1500)`));
S.push(seeded('story_cast', 'story_hub', `await click('Story Mode',1500);await click('who',900)`));
S.push(seeded('story_glossary', 'story_hub', `await click('Story Mode',1500);const d=document.querySelector('details');d&&(d.open=true);await s(500);d&&d.scrollIntoView()`));
S.push(seeded('story_briefing', 'story_hub', `await click('Story Mode',1500);await click('Play Chapter 3',1500);await tapScene(60,350);await s(1500)`, { wait: 4500 }));
S.push(seeded('story_clueboard', 'story_hub', `await click('Story Mode',1500);await click('Clue board',900)`));
S.push(seeded('story_chapter_scene', 'story_hub', `await click('Story Mode',1500);await click('Tea Time',1500);await tapScene(2)`));
S.push(seeded('story_chapter_chat', 'story_hub', `await click('Story Mode',1500);await click('Tea Time',1500);await tapScene(3,3000)`));
// arena
S.push(seeded('arena_hub', 'arena_hub', `await click('Arena',1000)`));
S.push(seeded('arena_templates', 'arena_hub', `await click('Arena',1000);await click('Create a Target',900)`));
for (let i = 0; i < 6; i++) S.push(seeded(`arena_creator_${i}`, 'arena_hub', `await click('Arena',1000);await click('Create a Target',900);await click('The Pastor',900);for(let k=0;k<${i};k++){await click('Next',500)}`));
// the live screens and their sheets inside Story and Arena matches
['story_mid', 'arena_mid'].forEach(seed => {
  const m = seed.split('_')[0];
  S.push(seeded(`${m}_paused`, seed));
  S.push(seeded(`${m}_channels`, seed, `await resume();await click('Channels',1200)`));
  S.push(seeded(`${m}_evidence`, seed, `await resume();await click('Evidence',1200)`));
  S.push(seeded(`${m}_defense`, seed, `await resume();await click('Defense',1200)`));
  S.push(seeded(`${m}_heat`, seed, `await resume();await click('🚨',900)`));
  S.push(seeded(`${m}_case`, seed, `await resume();await click('The rumour',900)`));
});
['story', 'arena'].forEach(m => ['STREET_WHISPER', 'TARGET_PR', 'SECURITY_WIRE', 'INFORMANT_TIP'].forEach(a => [0, 1, 2].forEach(k => S.push(seeded(`alert_${m}_${a}_${k}`, `alert_${m}_${a}_${k}`, '', { wait: 1800, optional: true })))));
// every alert card in every skin
['STREET_WHISPER', 'VIRAL_RECEIPT', 'BREAKING_FRONT', 'TARGET_PR', 'SECURITY_WIRE', 'INFORMANT_TIP'].forEach(a => [0, 1, 2].forEach(k => S.push(seeded(`alert_${a}_${k}`, `alert_${a}_${k}`, '', { wait: 1800 }))));
// the finale: the hub, the choice (with and without the hidden ending), and two endings
S.push(seeded('story_finale_hub', 'story_finale_hub', `await click('Story Mode',1500)`));
S.push(seeded('story_finale_choice', 'story_finale_won', `await click('Continue the story',1500);await click('Next',900);await click('Next',900);await tapScene(40,900)`, { wait: 4500 }));
S.push(seeded('story_finale_choice_basic', 'story_finale_won_basic', `await click('Continue the story',1500);await click('Next',900);await click('Next',900);await tapScene(40,900)`, { wait: 4500 }));
S.push(seeded('story_ending_oracle', 'story_finale_won', `await click('Continue the story',1500);await click('Next',900);await click('Next',900);await tapScene(40,900);await click('Call everyone',1500);await tapScene(30,900)`, { wait: 4500 }));
S.push(seeded('story_ending_peace', 'story_finale_won_basic', `await click('Continue the story',1500);await click('Next',900);await click('Next',900);await tapScene(40,900);await click('Burn it all',1500);await tapScene(30,900)`, { wait: 4500 }));
// Premium Gist (locked: the Gist Pass sheet and the three episode rows)
S.push(seeded('story_premium', 'story_finale_hub', `await click('Story Mode',1500);const sc=[...document.querySelectorAll('.overflow-y-auto')].pop();sc&&(sc.scrollTop=99999);await s(700)`));
S.push(seeded('story_premium_sheet', 'story_finale_hub', `await click('Story Mode',1500);await click('Get the Gist Pass',1200)`));
// campaigns: the hub, a brief, a live case in the campaign voice, the desks, and the endings
S.push(seeded('campaigns_hub', 'campaign_hub', `await click('Campaigns',1500)`));
S.push(seeded('campaigns_brief', 'campaign_hub', `await click('Campaigns',1500);await click('Wash Your Hands',1200)`));
S.push(seeded('campaign_live', 'campaign_mid', `await resume()`));
S.push(seeded('campaign_proof', 'campaign_mid', `await resume();await click('Proof',1200)`));
S.push(seeded('campaign_protect', 'campaign_mid', `await resume();await click('Protect',1200)`));
S.push(seeded('campaign_channels', 'campaign_mid', `await resume();await click('Channels',1200)`));
S.push(seeded('campaign_brief_sheet', 'campaign_mid', `await resume();document.querySelector('[data-tour=meters]')?.click();await s(900)`));
S.push(seeded('campaign_backlash', 'campaign_mid', `await resume();document.querySelector('[data-tour=heat]')?.click();await s(900)`));
S.push(seeded('campaign_win', 'campaign_win'));
S.push(seeded('campaign_lose_cover', 'campaign_lose_cover'));
S.push(seeded('campaign_lose_heat', 'campaign_lose_heat'));
['seed', 'proof', 'hype', 'protect', 'channel', 'tick'].forEach(k => S.push(seeded(`campaign_alert_${k}`, `campaign_alert_${k}`, '', { wait: 1800 })));
// How to play cards: the first-case auto-open, a middle card, the last card, and the campaign wording
S.push({ name: 'howto_first', fresh: true, pre: `await click('Spread am',1200);await click('Kano',1500)`, wait: 2500 });
S.push({ name: 'howto_mid', fresh: true, pre: `await click('Spread am',1200);await click('Kano',1500);await click('Next',500);await click('Next',500);await click('Next',500);await click('Next',500)`, wait: 2500 });
S.push({ name: 'howto_last', fresh: true, pre: `await click('Spread am',1200);await click('Kano',1500);for(let i=0;i<6;i++)await click('Next',400)`, wait: 2500 });
S.push(seeded('howto_menu', 'dossier_progress', `await click('☰',700);await click('How to play',900)`));
// the Channels board tour and the guided-case lessons
S.push(seeded('live_channels_tour', 'arcade_mid', `localStorage.removeItem('rumor_board_tour');await resume();await click('Channels',1200)`));
S.push(seeded('live_channels_pin', 'arcade_mid', `await resume();await click('Channels',1200);const p=[...document.querySelectorAll('.cursor-pointer.flex-col')].find(e=>e.textContent.includes('Agbero'));p&&p.click();await s(700)`));
['goal', 'heat', 'defend', 'evidence'].forEach(k => S.push(seeded(`tutorial_${k}`, `tut_${k}`, `await click('Resume investigation',900)`, { wait: 3500 })));
S.push(seeded('tutorial_defend_open', 'tut_defend', `await click('Resume investigation',900);await click('Defense',1200)`, { wait: 3500 }));
// the first-run tutorial
S.push({ name: 'tutorial_plant', fresh: true, pre: `await click('Spread am',1200);await click('Kano',1500)`, wait: 2000 });

// ---- run -------------------------------------------------------------------------------------------------------------------
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => existsSync(p));
const port = 9400 + Math.floor(Math.random() * 400);
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'qa-'))}`, '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
let targets; for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.find(t => t.type === 'page')) break; } catch { /* not up yet */ } await sleep(250); }
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => (ws.onopen = r));
let id = 0; const waiting = new Map();
const pageErrors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') pageErrors.push('console.error: ' + (m.params.args ?? []).map(x => String(x.value ?? x.description ?? '')).join(' ').slice(0, 240));
  else if (m.method === 'Runtime.exceptionThrown') pageErrors.push(m.params.exceptionDetails?.exception?.description?.slice(0, 160) ?? m.params.exceptionDetails?.text); };
const send = (method, params = {}) => new Promise(r => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const evalIn = async (expression, awaitPromise = true) => (await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true })).result;
await send('Page.enable'); await send('Runtime.enable');

const report = [];
let total = 0, bad = 0;
for (const sc of S.filter(x => x.name.includes(filter))) {
  if (sc.seed && !existsSync(`scratch/qa/seed_${sc.seed}.json`)) { console.log(`- ${sc.name} skipped (no seed)`); continue; }
  const w = sc.w ?? 440, h = sc.h ?? 860;
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
  await send('Emulation.setTouchEmulationEnabled', { enabled: w < 700, maxTouchPoints: 5 });
  // storage is set from a static page, so the app cannot overwrite it while it unloads
  await send('Page.navigate', { url: BASE + '/privacy.html' }); await sleep(900);
  let ls = {};
  if (sc.seed) ls = JSON.parse(readFileSync(`scratch/qa/seed_${sc.seed}.json`, 'utf8'));
  else if (!sc.fresh) ls = { rumor_howto_seen: '1', rumor_settings_v1: JSON.stringify({ tutorialDone: true, hints: true }) };
  await evalIn(`localStorage.clear(); sessionStorage.clear(); Object.entries(${JSON.stringify(ls)}).forEach(([k,v])=>localStorage.setItem(k,v)); 1`, false);
  await send('Page.navigate', { url: BASE + '/' });
  await sleep(sc.wait ?? 4200);
  let note = '';
  if (sc.pre) { const r = await evalIn(`(async()=>{${H}\n${sc.pre}\nreturn window.__note || 'ok'})().catch(e=>'ERR '+e.message)`); note = String(r.result?.value ?? r.exceptionDetails?.text ?? ''); await sleep(900); }
  if (pageErrors.length) { note += ' PAGE ERRORS: ' + pageErrors.splice(0).slice(0, 3).join(' | '); }
  const res = await evalIn(CHECK, false);
  let data = { low: [], clipped: [], offscreen: [], tiny: [] };
  try { data = JSON.parse(res.result.value); } catch { note += ' (check failed)'; }
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`scratch/qa/${sc.name}.png`, Buffer.from(shot.result.data, 'base64'));
  total++;
  const problems = data.low.length + data.offscreen.length + data.tiny.length;
  if (problems) bad++;
  report.push(`\n=== ${sc.name}  ${problems ? 'PROBLEMS' : 'ok'}${note && note !== 'ok' ? '  [' + note + ']' : ''}`);
  data.low.forEach(x => report.push(`  LOW CONTRAST ${x.ratio}:1 (needs ${x.need})  "${x.text}"  text ${x.fg} on ${x.bg}${x.img ? ' (over an image/gradient)' : ''}  ${x.px}px  ${x.tag}`));
  data.offscreen.forEach(x => report.push(`  OFF SCREEN  "${x.text}"  right edge ${x.right}px, screen ${x.vw}px`));
  data.tiny.slice(0, 6).forEach(x => report.push(`  TINY TEXT ${x.px}px  "${x.text}"`));
  data.clipped.slice(0, 6).forEach(x => report.push(`  clipped (${x.kind})  "${x.text}"`));
  console.log(`${problems ? 'x' : '.'} ${sc.name}  low ${data.low.length}  tiny ${data.tiny.length}  offscreen ${data.offscreen.length}  clipped ${data.clipped.length}`);
}
writeFileSync('scratch/qa/report.txt', report.join('\n'));
console.log(`\n${total} screens checked, ${bad} with problems. Report: scratch/qa/report.txt`);
ws.close(); proc.kill(); process.exit(0);
