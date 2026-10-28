import { decode } from './audio-lib.mjs';
import * as D from './dsp.mjs';
import { join } from 'node:path';
import { ROOT } from './audio-lib.mjs';
for (const id of ['g01', 'g02', 'g09', 'g12']) {
  const m = decode(join(ROOT, 'out/vo-takes', id + '.mp3'), D.SR, 1).ch[0];
  const w = Math.floor(D.SR * 0.01); let pk = 0; for (const v of m) pk = Math.max(pk, Math.abs(v));
  const regs = []; let s = -1, q = 0;
  for (let i = 0; i + w <= m.length; i += w) { let mx = 0; for (let j = 0; j < w; j++) mx = Math.max(mx, Math.abs(m[i + j])); const on = mx > pk * 0.03; if (on) { if (s < 0) s = i; q = 0; } else if (s >= 0 && ++q * 0.01 > 0.12) { regs.push([s / D.SR, (i - q * w) / D.SR]); s = -1; } }
  if (s >= 0) regs.push([s / D.SR, m.length / D.SR]);
  console.log(id, 'total', (m.length / D.SR).toFixed(2), regs.map((r) => `${r[0].toFixed(2)}-${r[1].toFixed(2)}`).join(' '));
}
