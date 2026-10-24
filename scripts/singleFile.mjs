// Packs the built game (dist/) into ONE html file that works with no server and no internet: open it from a phone's
// storage or a laptop, share it over WhatsApp, Bluetooth, a USB stick or Xender. Progress is saved in that browser.
//   npm run build:offline   ->   dist-offline/IHeardARumor.html
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const out = 'dist-offline';
if (!existsSync(join(dist, 'index.html'))) { console.error('Run "npm run build" first (dist/index.html is missing).'); process.exit(1); }

let html = readFileSync(join(dist, 'index.html'), 'utf8');
const read = p => readFileSync(join(dist, p.replace(/^\//, '')), 'utf8');
const dataUri = (p, type) => `data:${type};base64,${readFileSync(join(dist, p.replace(/^\//, ''))).toString('base64')}`;

// Pull out the (single) module script and stylesheet, then put them back inline.
let js = '';
html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>\s*/g, (_, src) => { js += read(src) + '\n'; return ''; });
let css = '';
html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>\s*/g, (_, href) => { css += read(href) + '\n'; return ''; });
if (!js) { console.error('No module script found in dist/index.html.'); process.exit(1); }

// The small start-up helpers (public/early.js) go inline too.
html = html.replace(/<script src="(\/early\.js)"><\/script>/g, (_, src) => `<script>${read(src)}</script>`);

// A server-only manifest and absolute icon links cannot resolve from a file; use an embedded icon instead.
const icon = dataUri('/icons/icon-192.png', 'image/png');
html = html.replace(/<link rel="manifest"[^>]*>\s*/g, '')
  .replace(/<link rel="icon"[^>]*>/g, `<link rel="icon" type="image/png" href="${icon}" />`)
  .replace(/<link rel="apple-touch-icon"[^>]*>/g, `<link rel="apple-touch-icon" href="${icon}" />`);

html = html.replace('</head>', () => `<style>${css}</style>\n</head>`);
// "</script" inside the bundle would end the tag early.
html = html.replace('</body>', () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>\n</body>`);

mkdirSync(out, { recursive: true });
const file = join(out, 'IHeardARumor.html');
writeFileSync(file, html);
console.log(`${file}  (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
if (/(?:src|href)="\/(?:assets|icons)\//.test(html)) console.warn('Warning: the file still points at /assets or /icons.');
