// Generates the gameplay trailer's voiceover with ElevenLabs and processes each line (EQ, a touch deeper, compression, room)
// into public/audio/vo/<id>.wav.
//   ELEVEN_API_KEY=sk_... node scripts/make-vo.mjs [--force] [--only=g01,g02] [--list]
// The key is read from the environment only and is never written to disk. Raw takes are cached in out/vo-takes so re-runs are free.
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LINES, VOICE, MODEL, FALLBACK_MODEL } from './vo-script.mjs';
import { ROOT, decode } from './audio-lib.mjs';
import * as D from './dsp.mjs';
import { finish, deepen } from './voice-fx.mjs';

const key = process.env.ELEVEN_API_KEY;
if (!key) throw new Error('Set ELEVEN_API_KEY (an sk_... secret key)');
const argv = process.argv.slice(2);
const force = argv.includes('--force');
const only = (argv.find((a) => a.startsWith('--only=')) ?? '').split('=')[1]?.split(',').filter(Boolean);
const H = { 'xi-api-key': key, 'content-type': 'application/json' };
const api = (path, init) => fetch(`https://api.elevenlabs.io/v1/${path}`, { ...init, headers: { ...H, ...(init?.headers ?? {}) } });

const takeDir = join(ROOT, 'out/vo-takes');
const outDir = join(ROOT, 'public/audio/vo');
mkdirSync(takeDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const res = await api('voices');
if (!res.ok) throw new Error(`voices: ${res.status} ${(await res.text()).slice(0, 300)}`);
const list = (await res.json()).voices ?? [];
if (argv.includes('--list')) { for (const v of list) console.log(v.voice_id, '|', v.name, '|', v.category); process.exit(0); }
const hit = list.find((v) => v.name.toLowerCase().startsWith(VOICE.name.toLowerCase()));
const voiceId = hit?.voice_id ?? VOICE.id;
console.log(`voice: ${hit ? hit.name : VOICE.name + ' (fallback id)'} -> ${voiceId}`);

const tts = async (text) => {
  const attempts = [
    { model_id: MODEL, text, voice_settings: { stability: 0.38, similarity_boost: 0.8, use_speaker_boost: true } },
    { model_id: FALLBACK_MODEL, text: text.replace(/\[[^\]]*\]\s*/g, ''), voice_settings: { stability: 0.32, similarity_boost: 0.8, style: 0.55, use_speaker_boost: true } },
  ];
  let last = '';
  for (const body of attempts) {
    const r = await api(`text-to-speech/${voiceId}?output_format=mp3_44100_128`, { method: 'POST', body: JSON.stringify(body) });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    last = `${r.status} ${(await r.text()).slice(0, 300)}`;
    console.warn(`  ${body.model_id} failed: ${last}`);
    if (r.status === 401) break;
  }
  throw new Error(`tts failed: ${last}`);
};

// Narrator chain: tight low end, a little darker, presence and compression, a short dark room.
const narrator = (x) => {
  let y = D.biquad(x, 'hp', 75);
  y = deepen(y, 0.94, 1.1);
  y = D.biquad(y, 'lowshelf', 150, 0.7, 3.5);
  y = D.biquad(y, 'peak', 280, 1.0, -1.5);
  y = D.biquad(y, 'peak', 2900, 1.1, 2.4);
  y = D.compress(y, { thresh: -24, ratio: 3.2, makeup: 4 });
  y = D.sat(y, 1.3);
  return { dry: y, send: 0.09, room: { decay: 0.7, damp: 0.5 }, delay: 0 };
};

const report = [];
for (const l of LINES) {
  if (only && !only.includes(l.id)) continue;
  const mp3 = join(takeDir, `${l.id}.mp3`);
  if (!existsSync(mp3) || force) { console.log(`generating ${l.id}…`); writeFileSync(mp3, await tts(l.text)); }
  const mono = decode(mp3, D.SR, 1).ch[0];
  let a = 0, b = mono.length - 1, pk = 0;
  for (const v of mono) pk = Math.max(pk, Math.abs(v));
  while (a < mono.length && Math.abs(mono[a]) < pk * 0.03) a++;
  while (b > a && Math.abs(mono[b]) < pk * 0.02) b--;
  // squeeze long pauses (v3 reads dramatic and slow) so each line fits its scene: gaps over 0.3s become 0.24s
  const w = Math.floor(D.SR * 0.01);
  const regs = []; let st = -1, q = 0;
  for (let i = 0; i + w <= mono.length; i += w) {
    let mx = 0; for (let j = 0; j < w; j++) mx = Math.max(mx, Math.abs(mono[i + j]));
    if (mx > pk * 0.03) { if (st < 0) st = i; q = 0; } else if (st >= 0 && ++q * 0.01 > 0.3) { regs.push([st, i - (q - 1) * w]); st = -1; }
  }
  if (st >= 0) regs.push([st, mono.length]);
  const pad = Math.floor(0.03 * D.SR), gap = Math.floor(0.24 * D.SR);
  const parts = regs.map(([x, y]) => mono.slice(Math.max(0, x - pad), Math.min(mono.length, y + pad)));
  const seg = new Float32Array(parts.reduce((n, p) => n + p.length, 0) + gap * (parts.length - 1));
  let o = 0; parts.forEach((p, i) => { seg.set(p, o); o += p.length + (i < parts.length - 1 ? gap : 0); });
  const [L, R] = finish(narrator(seg));
  D.writeWavStereo(join(outDir, `${l.id}.wav`), L, R);
  report.push({ id: l.id, at: l.at, dur: +(L.length / D.SR).toFixed(2) });
  console.log(`${l.id}  ${(L.length / D.SR).toFixed(2)}s  @${l.at.toFixed(2)}s`);
}
writeFileSync(join(ROOT, 'out/vo-report.json'), JSON.stringify(report, null, 2));
console.log('\nVoiceover ready in public/audio/vo. Next: npm run audio');
