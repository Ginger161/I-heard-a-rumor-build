import { launch, GAME, ROOT, sleep } from './cdp.mjs';
import { join } from 'node:path';
const b = await launch({ seedFile: join(GAME, 'scratch/qa/seed_dossier_progress.json') });
await b.nav('/?speed=3');
const dump = async (tag) => { console.log('==', tag, JSON.stringify(await b.ev(`[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null).map(x=>x.textContent.trim().replace(/\s+/g,' ').slice(0,40))`))); };
await dump('dossier'); await b.shot(join(ROOT,'out/ex_dossier.png'));
await b.ev(`__click('Mr. Macaroony',900)`);
await dump('after pick'); await b.shot(join(ROOT,'out/ex_pick.png'));
b.close();
