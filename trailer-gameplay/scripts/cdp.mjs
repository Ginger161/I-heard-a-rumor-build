// Minimal Chrome DevTools driver for recording real gameplay from the running dev server (http://localhost:5173).
// No dependencies: Node's built-in WebSocket + fetch, Chrome's own screencast, and Remotion's bundled ffmpeg to turn frames into video.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, '..');
export const GAME = join(ROOT, '..');
export const FFMPEG = join(ROOT, 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
export const BASE = process.env.GAME_BASE ?? 'http://localhost:5173';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);

// Helpers that run INSIDE the game page. Text matching is case-insensitive because the UI uppercases with CSS.
export const PAGE_HELPERS = `
window.__s = ms => new Promise(r => setTimeout(r, ms));
window.__btn = t => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).find(b => b.textContent.toLowerCase().includes(t.toLowerCase()));
window.__tab = async (n, w = 700) => { const b = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null).find(x => { const t = x.textContent.trim(); return t.length <= 4 && t.endsWith(String(n)); }); if (b) { b.click(); await window.__s(w); return true; } return false; };
window.__click = async (t, w = 600) => { const b = window.__btn(t); if (b) { b.click(); await window.__s(w); return true; } return false; };
`;

export async function launch({ width = 440, height = 900, dpr = 2, seedFile = null, settings = { tutorialDone: true, hints: true }, fresh = false } = {}) {
  const port = 9600 + Math.floor(Math.random() * 300);
  const dir = mkdtempSync(join(tmpdir(), 'gp-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu-rasterization', 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 60; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.find((t) => t.type === 'page')) break; } catch { /* not up yet */ }
    await sleep(250);
  }
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const waiting = new Map(); const listeners = [];
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } else if (m.method) listeners.forEach((l) => l(m)); };
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'pointer', value: 'coarse' }, { name: 'hover', value: 'none' }] });

  const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) console.error('page error:', r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text); return r.result?.result?.value; };
  const nav = async (path) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      await send('Page.navigate', { url: BASE + path });
      for (let i = 0; i < 30; i++) { await sleep(500); if ((await ev('document.body && document.body.innerText.length')) > 40) { await sleep(900); await ev(PAGE_HELPERS); return; } }
      console.error('page blank, retrying', attempt + 1);
    }
    throw new Error('game page never rendered');
  };

  // storage goes in from a static page so the running app cannot overwrite it on unload
  await send('Page.navigate', { url: BASE + '/privacy.html' }); await sleep(1200);
  await ev(`localStorage.clear()`);
  if (!fresh) await ev(`localStorage.setItem('rumor_settings_v1', JSON.stringify(${JSON.stringify(settings)}))`);
  if (seedFile) { const items = JSON.parse(readFileSync(seedFile, 'utf8')); await ev(`Object.entries(${JSON.stringify(items)}).forEach(([k, v]) => localStorage.setItem(k, v))`); }

  // pointer input: touch, like a phone
  const tap = async (x, y) => {
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await sleep(60);
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  /** the centre of the first visible element matching text (case-insensitive) within the selector, or null */
  const where = (text, sel = 'button') => ev(`(() => { const e = [...document.querySelectorAll(${JSON.stringify(sel)})].filter(b => b.offsetParent !== null).find(b => b.textContent.toLowerCase().includes(${JSON.stringify(text.toLowerCase())})); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  const tapText = async (text, wait = 500, sel = 'button') => { const p = await where(text, sel); if (!p) return false; await tap(p.x, p.y); await sleep(wait); return true; };

  // ---- recording -------------------------------------------------------------------------------------------------------------
  let rec = null;
  const onFrame = async (m) => {
    if (m.method !== 'Page.screencastFrame' || !rec) return;
    send('Page.screencastFrameAck', { sessionId: m.params.sessionId });
    rec.frames.push({ t: m.params.metadata.timestamp, data: m.params.data });
  };
  listeners.push(onFrame);
  const startRec = async ({ quality = 92 } = {}) => {
    rec = { frames: [] };
    await send('Page.startScreencast', { format: 'jpeg', quality, maxWidth: width * dpr, maxHeight: height * dpr, everyNthFrame: 1 });
  };
  /** stop and write <name>.mp4 (constant 30fps, from real frame timestamps) into outDir */
  const stopRec = async (name, outDir, { fps = 30 } = {}) => {
    await send('Page.stopScreencast');
    const frames = rec.frames; rec = null;
    // a static screen sends one frame: hold it until the moment recording stopped
    if (frames.length >= 1) { const hold = Math.min(8, Date.now() / 1000 - frames[frames.length - 1].t); if (hold > 0.3) frames.push({ t: frames[frames.length - 1].t + hold, data: frames[frames.length - 1].data }); }
    if (frames.length < 2) { console.error('no frames recorded for', name); return null; }
    const fdir = join(ROOT, 'out/frames', name); rmSync(fdir, { recursive: true, force: true }); mkdirSync(fdir, { recursive: true });
    const lines = [];
    frames.forEach((f, i) => {
      const file = join(fdir, String(i).padStart(5, '0') + '.jpg');
      writeFileSync(file, Buffer.from(f.data, 'base64'));
      const dur = i < frames.length - 1 ? frames[i + 1].t - f.t : 1 / fps;
      lines.push(`file '${file.replace(/\\/g, '/')}'`, `duration ${Math.max(dur, 0.001).toFixed(4)}`);
    });
    lines.push(`file '${join(fdir, String(frames.length - 1).padStart(5, '0') + '.jpg').replace(/\\/g, '/')}'`);
    writeFileSync(join(fdir, 'list.txt'), lines.join('\n'));
    mkdirSync(outDir, { recursive: true });
    const out = join(outDir, name + '.mp4');
    const r = spawnSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(fdir, 'list.txt'), '-vsync', 'cfr', '-r', String(fps), '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-movflags', '+faststart', out], { encoding: 'utf8' });
    if (r.status !== 0) { console.error(r.stderr); return null; }
    const span = frames[frames.length - 1].t - frames[0].t;
    console.log(`  ${name}: ${frames.length} frames over ${span.toFixed(1)}s -> ${out}`);
    return { out, seconds: span, frames: frames.length };
  };
  const shot = async (file) => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(file, Buffer.from(r.result.data, 'base64')); };
  const close = async () => { try { ws.close(); } catch { /* */ } proc.kill(); await sleep(1200); try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 }); } catch { /* */ } };
  return { send, ev, nav, tap, where, tapText, startRec, stopRec, shot, close, width, height };
}
