// Dev helper: list every distinct hit (onset time + relative loudness) in each audio file.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { decode, onsets, ROOT } from './audio-lib.mjs';
const dir = join(ROOT, 'public/audio');
for (const f of readdirSync(dir).filter((n) => /\.(mp3|wav)$/i.test(n))) {
  const { ch, sr } = decode(join(dir, f), 22050, 1);
  const o = onsets(ch[0], sr);
  console.log(`\n${f.replace(' - Epidemic Sound', '').replace(/^ES_/, '').slice(0, 80)}\n  dur=${o.dur.toFixed(2)}s peak=${o.peak.toFixed(2)} hits(${o.hits.length}): ${o.hits.slice(0, 30).map((h) => `${h.t}(${h.p})`).join(' ')}`);
}
