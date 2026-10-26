// Plays every Story Mode Target with each approach, to check the season is fair and ramps up chapter by chapter.
//   RUNS=24 npm run simulate:story        (BANDS=low,mid,high to include reputation bands; SUMMARY=1 for one line per chapter)
import { play, SKILLS } from './botLib';
import { STORY_CHAPTERS, PREMIUM_EPISODES, APPROACHES } from '../src/engine/data/story';
import { storyPerkId } from '../src/engine/data/perks';

const RUNS = Number(process.env.RUNS ?? 24);
const bands = (process.env.BANDS ?? 'mid').split(',') as ('low' | 'mid' | 'high')[];
const skills = SKILLS.filter(s => s.name !== 'sloppy');
const summary = process.env.SUMMARY === '1';

const only = (process.env.ONLY ?? '').split(',').filter(Boolean);
[...STORY_CHAPTERS, ...PREMIUM_EPISODES].forEach(ch => ch.variants.filter(v => only.length === 0 || only.includes(v.targetId)).forEach(v => {
  const row: string[] = [];
  const tot: Record<string, { won: number; n: number }> = { expert: { won: 0, n: 0 }, average: { won: 0, n: 0 } };
  bands.forEach(band => APPROACHES.forEach(a => skills.forEach(sk => {
    let won = 0;
    for (let i = 0; i < RUNS; i++) if (play(v.targetId, sk, 100 + i, storyPerkId(a.id, band)).status === 'WON') won++;
    tot[sk.name].won += won; tot[sk.name].n += RUNS;
    row.push(`${band}/${a.id.slice(0, 3)}/${sk.name.slice(0, 3)} ${Math.round((won / RUNS) * 100)}%`);
  })));
  const e = Math.round((tot.expert.won / tot.expert.n) * 100), g = Math.round((tot.average.won / tot.average.n) * 100);
  console.log(`${ch.id} ${v.targetId.padEnd(26)} expert ${String(e).padStart(3)}%  average ${String(g).padStart(3)}%${summary ? '' : '   | ' + row.join('  ')}`);
}));
