// Dev helper: bundle once, render key-frame stills.
//   node scripts/stills.mjs <Story-16x9|Story-9x16|all> <sec,sec,...>   (global seconds)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PORT = 3418;
const FPS = 60;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'out', 'stills');
mkdirSync(outDir, { recursive: true });

const comps = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : ['Story-16x9', 'Story-9x16'];
const secs = (process.argv[3] ?? '1,3,5,7').split(',').map(Number);

const serveUrl = await bundle({ entryPoint: join(root, 'src', 'index.ts'), publicDir: join(root, 'public') });
for (const id of comps) {
  const composition = await selectComposition({ serveUrl, id, port: PORT });
  for (const s of secs) {
    const frame = Math.round(s * FPS);
    const output = join(outDir, `${id}-${s.toFixed(2)}s.jpg`);
    await renderStill({ serveUrl, composition, frame, port: PORT, output, imageFormat: 'jpeg', jpegQuality: 85, chromiumOptions: { gl: 'angle' } });
    console.log('wrote', output);
  }
}
