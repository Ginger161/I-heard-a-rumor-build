// Joins the rendered chunks and muxes public/gameplay-mix.wav as AAC: out/gameplay-<fmt>.mp4, plus a small -share copy.
//   node scripts/stitch.mjs 16x9|9x16
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, FF } from './audio-lib.mjs';

const fmt = process.argv[2] ?? '16x9';
const dir = join(ROOT, 'out/chunks', `Gameplay-${fmt}`);
const chunks = readdirSync(dir).filter((f) => /^chunk_\d+\.mp4$/.test(f)).sort();
if (!chunks.length) throw new Error(`no chunks in ${dir}`);
const mix = join(ROOT, 'public/gameplay-mix.wav');
if (!existsSync(mix)) throw new Error('Run `node scripts/make-mix.mjs` first');
const list = join(dir, 'list.txt');
writeFileSync(list, chunks.map((c) => `file '${join(dir, c).split(sep).join('/')}'`).join('\n'));
const out = join(ROOT, `out/gameplay-${fmt}.mp4`);
const run = (args) => { const r = spawnSync(FF, ['-v', 'error', '-y', ...args], { encoding: 'utf8' }); if (r.status !== 0) throw new Error(r.stderr); };
run(['-f', 'concat', '-safe', '0', '-i', list, '-i', mix, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out]);
console.log('wrote', out, `(${chunks.length} chunks)`);
// a lighter copy for posting
const share = join(ROOT, `out/gameplay-${fmt}-share.mp4`);
run(['-i', out, '-c:v', 'libx264', '-crf', '23', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', share]);
console.log('wrote', share);
