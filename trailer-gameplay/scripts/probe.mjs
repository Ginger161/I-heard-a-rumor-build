import { launch, GAME, ROOT } from './cdp.mjs';
import { join } from 'node:path';
const b = await launch({ seedFile: join(GAME, 'scratch/qa/seed_dossier_progress.json') });
await b.nav('/?speed=2');
console.log(await b.ev('document.body.innerText.slice(0,200)'));
await b.shot(join(ROOT, 'out/probe_c.png'));
await b.close();
