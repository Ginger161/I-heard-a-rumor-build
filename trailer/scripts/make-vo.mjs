// Generates the voiceover with ElevenLabs, one continuous take per scene, then slices each take into
// lines at its longest pauses (public/audio/vo/vNN.wav). The API key is read from ELEVEN_API_KEY only:
//   ELEVEN_API_KEY=... node scripts/make-vo.mjs [--voice=callum] [--force]
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { TAKES, VOICES, DEFAULT_VOICE, MODEL, STABILITY, TEMPO } from './vo-script.mjs';
import { ROOT, FF, decode } from './audio-lib.mjs';

const key = process.env.ELEVEN_API_KEY;
if (!key) throw new Error('Set ELEVEN_API_KEY');
const force = process.argv.includes('--force');
const voiceName = (process.argv.find((a) => a.startsWith('--voice=')) ?? '--voice=' + DEFAULT_VOICE).split('=')[1];
const voiceId = VOICES[voiceName];
if (!voiceId) throw new Error(`Unknown voice ${voiceName} (choose: ${Object.keys(VOICES).join(', ')})`);
console.log('voice:', voiceName, '| model:', MODEL, '| stability:', STABILITY);

const dir = join(ROOT, 'public/audio/vo');
const takeDir = join(ROOT, 'out/vo-takes');
mkdirSync(dir, { recursive: true });
mkdirSync(takeDir, { recursive: true });
const SR = 44100;

const writeWav = (file, ch) => {
  const n = ch[0].length;
  const pcm = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, ch[c][i])) * 32767), i * 4 + c * 2);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28);
  h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  writeFileSync(file, Buffer.concat([h, pcm]));
};

/** Voiced regions (seconds) of a mono signal; gaps shorter than `merge` are bridged. */
const regions = (m, merge = 0.06) => {
  const w = Math.floor(SR * 0.01);
  let pk = 0;
  for (let i = 0; i < m.length; i++) pk = Math.max(pk, Math.abs(m[i]));
  const thr = pk * 0.035;
  const voiced = [];
  for (let i = 0; i + w <= m.length; i += w) {
    let mx = 0;
    for (let j = 0; j < w; j++) mx = Math.max(mx, Math.abs(m[i + j]));
    voiced.push(mx > thr);
  }
  const out = [];
  let s = -1;
  let quiet = 0;
  voiced.forEach((v, i) => {
    if (v) {
      if (s < 0) s = i;
      quiet = 0;
    } else if (s >= 0 && ++quiet * 0.01 > merge) {
      out.push([s * 0.01, (i - quiet + 1) * 0.01]);
      s = -1;
    }
  });
  if (s >= 0) out.push([s * 0.01, voiced.length * 0.01]);
  return out;
};

for (const take of TAKES) {
  const mp3 = join(takeDir, `${take.id}-${voiceName}.mp3`);
  if (!existsSync(mp3) || force) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({ text: take.text, model_id: MODEL, voice_settings: { stability: STABILITY } }),
    });
    if (!res.ok) throw new Error(`${take.id}: ${res.status} ${(await res.text()).slice(0, 300)}`);
    writeFileSync(mp3, Buffer.from(await res.arrayBuffer()));
  }
  const c = decode(mp3, SR, 2);
  const mono = c.ch[0].map((v, i) => (v + c.ch[1][i]) / 2);
  const parts = take.lines.reduce((a, l) => a + l[2], 0);
  let reg = regions(mono);
  // the (parts - 1) longest pauses are the real sentence boundaries; merge the rest
  const gaps = reg.slice(1).map((r, i) => ({ i, g: r[0] - reg[i][1] }));
  const keep = new Set(gaps.sort((a, b) => b.g - a.g).slice(0, parts - 1).map((g) => g.i));
  const merged = [];
  reg.forEach((r, i) => {
    if (i > 0 && !keep.has(i - 1)) merged[merged.length - 1][1] = r[1];
    else merged.push([...r]);
  });
  if (merged.length !== parts) throw new Error(`${take.id}: expected ${parts} sentences, found ${merged.length}`);
  let p = 0;
  for (const [id, , n] of take.lines) {
    const a = merged[p][0];
    const b = merged[p + n - 1][1];
    p += n;
    const i0 = Math.max(0, Math.floor((a - 0.015) * SR));
    const i1 = Math.min(mono.length, Math.floor((b + 0.1) * SR));
    const seg = [c.ch[0].slice(i0, i1), c.ch[1].slice(i0, i1)];
    const raw = join(takeDir, `${id}-raw.wav`);
    writeWav(raw, seg);
    const r = spawnSync(FF, ['-v', 'error', '-y', '-i', raw, '-af', `atempo=${TEMPO}`, '-c:a', 'pcm_s16le', join(dir, `${id}.wav`)]);
    if (r.status !== 0) throw new Error(`atempo failed: ${r.stderr}`);
    console.log(`${id}  ${((i1 - i0) / SR / TEMPO).toFixed(2)}s  (${take.id})`);
  }
}
