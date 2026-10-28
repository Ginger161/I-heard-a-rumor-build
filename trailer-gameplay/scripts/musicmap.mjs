import { decode } from './audio-lib.mjs';
import { join } from 'node:path';
import { ROOT } from './audio-lib.mjs';
const c = decode(join(ROOT, 'public/audio/ES_Only the Brave - Bonnie Grace.mp3'), 22050, 1);
const m = c.ch[0]; const sr = 22050;
console.log('duration', (m.length / sr).toFixed(1));
const rows = [];
for (let t = 0; t + 1 <= m.length / sr; t += 1) { let s = 0; for (let i = t * sr; i < (t + 1) * sr; i++) s += m[i] * m[i]; rows.push(Math.sqrt(s / sr)); }
const mx = Math.max(...rows);
console.log(rows.map((v, i) => `${i}:${Math.round((v / mx) * 9)}`).join(' '));
