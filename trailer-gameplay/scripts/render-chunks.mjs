// Renders a composition in small chunks (silent), each with its own timeout and retries, so one hung browser cannot lose the whole render.
//   node scripts/render-chunks.mjs <Gameplay-16x9|Gameplay-9x16> [chunkFrames=300] [concurrency=2] [fromFrame] [toFrame]
// Chunks land in out/chunks/<id>/chunk_000.mp4 and finished chunks are skipped on re-run. Then: node scripts/stitch.mjs <16x9|9x16>
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, makeCancelSignal } from '@remotion/renderer';
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [id = 'Gameplay-16x9', chunkArg = '300', concArg = '2', fromArg, toArg] = process.argv.slice(2);
const CHUNK = Number(chunkArg);
const CONC = Number(concArg);
const PORT = 3431;
const TIMEOUT_MS = 20 * 60 * 1000;
const outDir = join(root, 'out/chunks', id);
mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: join(root, 'src/index.ts'), publicDir: join(root, 'public') });
const inputProps = { audio: false };
const composition = await selectComposition({ serveUrl, id, inputProps, port: PORT });
const total = composition.durationInFrames;
const start = fromArg ? Number(fromArg) : 0;
const end = Math.min(total - 1, toArg ? Number(toArg) : total - 1);
console.log(`${id}: ${total} frames, chunks of ${CHUNK}, concurrency ${CONC}, range ${start}-${end}`);

for (let a = start, n = Math.floor(start / CHUNK); a <= end; a += CHUNK, n++) {
  const b = Math.min(a + CHUNK - 1, end);
  const file = join(outDir, `chunk_${String(n).padStart(3, '0')}.mp4`);
  if (existsSync(file)) { console.log(`chunk ${n} (${a}-${b}) already done`); continue; }
  for (let attempt = 1; attempt <= 3; attempt++) {
    const tmp = file + '.part.mp4';
    rmSync(tmp, { force: true });
    const { cancelSignal, cancel } = makeCancelSignal();
    const t0 = Date.now();
    let last = Date.now();
    const watchdog = setInterval(() => { if (Date.now() - last > TIMEOUT_MS) { console.warn(`chunk ${n}: no progress for ${TIMEOUT_MS / 60000} min, cancelling`); cancel(); } }, 15000);
    try {
      await renderMedia({
        composition, serveUrl, inputProps, codec: 'h264', outputLocation: tmp, frameRange: [a, b], muted: true,
        crf: 16, imageFormat: 'jpeg', jpegQuality: 94, pixelFormat: 'yuv420p', concurrency: CONC, port: PORT,
        chromiumOptions: { gl: 'angle' }, overwrite: true, cancelSignal,
        onProgress: ({ renderedFrames }) => { last = Date.now(); if (renderedFrames % 100 === 0) process.stdout.write(`  chunk ${n}: ${renderedFrames}/${b - a + 1}\n`); },
      });
      clearInterval(watchdog);
      renameSync(tmp, file);
      console.log(`chunk ${n} (${a}-${b}) done in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
      break;
    } catch (e) {
      clearInterval(watchdog);
      console.warn(`chunk ${n} attempt ${attempt} failed: ${String(e.message ?? e).slice(0, 200)}`);
      if (attempt === 3) { console.error(`chunk ${n} (${a}-${b}) FAILED after 3 attempts; re-run to retry it`); process.exit(2); }
    }
  }
}
console.log('all chunks rendered');
process.exit(0);
