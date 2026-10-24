// Writes the tuner's results (scratch/tuned_T*.json) into the Target source files: each Target's `mods:` line and the
// numbers in its `ab('KIND', every, start, strength, ...)` calls. Nothing else in the files is touched.
//   node scripts/bake.mjs              (tuned numbers)
//   TUNED=tuned2 node scripts/bake.mjs (the play-style tuner's numbers, scratch/tuned2_T*.json)
//   node scripts/bake.mjs originals    (put the pre-tuning numbers back; scratch/originals.json)
//   IDS=a,b node scripts/bake.mjs ...  (only those Targets)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const files = ['spotlight', 'tier1', 'tier2', 'tier3', 'tier4', 'tier5'].map(n => `src/engine/data/targets/${n}.ts`);
const tuned = {};
if (process.argv[2] === 'originals') Object.assign(tuned, JSON.parse(readFileSync('scratch/originals.json', 'utf8')));
else for (const t of [1, 2, 3, 4, 5]) {
  const p = `scratch/${process.env.TUNED ?? 'tuned'}_T${t}.json`;
  if (existsSync(p)) Object.assign(tuned, JSON.parse(readFileSync(p, 'utf8')));
}

if (process.env.IDS) { const keep = new Set(process.env.IDS.split(',')); Object.keys(tuned).forEach(id => { if (!keep.has(id)) delete tuned[id]; }); }

const lit = v => (v && typeof v === 'object' ? `{ ${Object.entries(v).map(([k, x]) => `${k}: ${lit(x)}`).join(', ')} }` : String(v));
let changed = 0;
for (const f of files) {
  let src = readFileSync(f, 'utf8');
  for (const [id, t] of Object.entries(tuned)) {
    const start = src.indexOf(`    id: '${id}',`);
    if (start < 0) continue;
    const next = src.indexOf("\n  {\n    id: '", start + 10);
    const end = next < 0 ? src.length : next;
    let block = src.slice(start, end);
    const mods = Object.keys(t.mods).length ? lit(t.mods) : '{}';
    block = block.replace(/(\n\s*mods: )\{[^\n]*\}(,?)/, `$1${mods}$2`);
    let i = 0;
    block = block.replace(/ab\('([A-Z_]+)', (\d+), (\d+), (\d+),/g, (m, kind) => {
      const a = t.abilities[i++];
      if (!a || a[0] !== kind) throw new Error(`${id}: ability ${i} mismatch (${kind} vs ${a && a[0]})`);
      return `ab('${kind}', ${a[1]}, ${a[2]}, ${a[3]},`;
    });
    if (i !== t.abilities.length) throw new Error(`${id}: expected ${t.abilities.length} abilities, found ${i}`);
    src = src.slice(0, start) + block + src.slice(end);
    changed++;
  }
  writeFileSync(f, src);
}
console.log(`baked ${changed} of ${Object.keys(tuned).length} Targets`);
