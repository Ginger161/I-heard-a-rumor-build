// node scripts/sheet.mjs <take> [everySeconds=1] [cols=7]  -> out/sheet_<take>.png (contact sheet of a recorded take; ffmpeg here has no tile filter, so Pillow tiles)
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join, sep } from 'node:path';
import { FFMPEG, ROOT } from './cdp.mjs';
const fwd = (p) => p.split(sep).join('/');
const [name, every = '1', cols = '7'] = process.argv.slice(2);
const dir = join(ROOT, 'out/sheet_tmp'); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
const src = join(ROOT, 'public/takes', name + '.mp4');
const r = spawnSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-r', String(1 / +every), '-vf', 'scale=w=240:h=-2', join(dir, 'f_%03d.png')], { encoding: 'utf8' });
if (r.status !== 0) { console.log(r.stderr); process.exit(1); }
const py = [
  'import glob',
  'from PIL import Image',
  `fs=sorted(glob.glob('${fwd(dir)}/f_*.png'))`,
  'ims=[Image.open(f) for f in fs]',
  `c=${cols}; w,h=ims[0].size; rows=(len(ims)+c-1)//c`,
  'sheet=Image.new("RGB",(c*w,rows*h),(30,30,30))',
  'for i,im in enumerate(ims): sheet.paste(im,((i%c)*w,(i//c)*h))',
  `sheet.save('${fwd(join(ROOT, 'out', `sheet_${name}.png`))}'); print(len(ims),"frames")`,
].join('\n');
console.log(spawnSync('python', ['-c', py], { encoding: 'utf8' }).stdout);
