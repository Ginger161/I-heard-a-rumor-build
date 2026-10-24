// Dev helper: bundle once, render a handful of key-frame stills for both aspect ratios.
//   node scripts/stills.mjs [comp] [frame,frame,...]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// 3000 is often taken by other dev servers, so use our own port
const PORT = 3417;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'out', 'stills');
mkdirSync(outDir, { recursive: true });

const comps = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : ['Trailer-9x16', 'Trailer-16x9'];
const frames = (process.argv[3] ?? '70,200,360,470,690,880,1010,1200,1330,1470,1572,1700').split(',').map(Number);

const serveUrl = await bundle({ entryPoint: join(root, 'src', 'index.ts'), publicDir: join(root, 'public') });
for (const id of comps) {
  const composition = await selectComposition({ serveUrl, id, port: PORT });
  for (const frame of frames) {
    const output = join(outDir, `${id}-${String(frame).padStart(4, '0')}.jpg`);
    await renderStill({ serveUrl, composition, frame, port: PORT, output, imageFormat: 'jpeg', jpegQuality: 85, chromiumOptions: { gl: 'angle' } });
    console.log('wrote', output);
  }
}
