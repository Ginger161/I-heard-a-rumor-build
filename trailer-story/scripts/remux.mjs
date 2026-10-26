// Swap the audio track of the rendered videos for the current public/story-mix.wav WITHOUT re-rendering the picture.
// Use it after `npm run vo` + `npm run audio` (new voiceover or mix tweaks):
//   node scripts/remux.mjs            (both formats)
//   node scripts/remux.mjs 16x9
import { existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, FF } from './audio-lib.mjs';

const which = process.argv[2] ? [process.argv[2]] : ['16x9', '9x16'];
const mix = join(ROOT, 'public/story-mix.wav');
if (!existsSync(mix)) throw new Error('Run `npm run audio` first');

for (const f of which) {
  const video = join(ROOT, `out/the-receipts-${f}.mp4`);
  if (!existsSync(video)) {
    console.warn(`skip ${f}: ${video} not rendered yet`);
    continue;
  }
  const tmp = join(ROOT, `out/the-receipts-${f}.remux.mp4`);
  const r = spawnSync(FF, ['-v', 'error', '-y', '-i', video, '-i', mix, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', tmp]);
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr}`);
  renameSync(tmp, video);
  console.log(`updated ${video}`);
}
