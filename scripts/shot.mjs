// Screenshots the running dev server with headless Chrome at a given size, with the first-run pop-up already dismissed.
//   node scripts/shot.mjs <width> <height> <out.png> [path-and-query] [js-to-run-before-capture]
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [w, h, out, path = '/', pre = ''] = process.argv.slice(2);
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => existsSync(p));
const port = 9333 + Math.floor(Math.random() * 500);
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'shot-'))}`, '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let targets;
for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.find(t => t.type === 'page')) break; } catch { /* not up yet */ } await sleep(250); }
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => (ws.onopen = r));
let id = 0; const waiting = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 2, mobile: +w < 700 });
if (+w < 700 || process.env.TOUCH) {
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Emulation.setEmitTouchEvents', { enabled: true, configuration: 'mobile' });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'pointer', value: 'coarse' }, { name: 'hover', value: 'none' }, { name: 'any-pointer', value: 'coarse' }] });
}
const base = 'http://localhost:5173';
// Storage is set from a static file (no app running), so the app cannot overwrite it while it unloads.
await send('Page.navigate', { url: base + '/privacy.html' });
await sleep(1200);
if (!process.env.FRESH) await send('Runtime.evaluate', { expression: `localStorage.setItem('rumor_settings_v1', JSON.stringify({ tutorialDone: true, hints: true }))` });
else await send('Runtime.evaluate', { expression: `localStorage.clear()` });
if (process.env.LS_FILE) { const items = JSON.parse((await import('node:fs')).readFileSync(process.env.LS_FILE, 'utf8')); await send('Runtime.evaluate', { expression: `Object.entries(${JSON.stringify(items)}).forEach(([k, v]) => localStorage.setItem(k, v))` }); }
const nv = await send('Page.navigate', { url: base + path }); if (process.env.DEBUG) console.log(JSON.stringify(nv));
await sleep(+(process.env.WAIT ?? 3500));
if (pre) { const r = await send('Runtime.evaluate', { expression: pre, awaitPromise: true, returnByValue: true }); if (r.result?.result?.value !== undefined) console.log(String(r.result.result.value)); await sleep(+(process.env.POSTWAIT ?? 1200)); }
const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
ws.close(); proc.kill();
console.log('saved', out);
process.exit(0);
