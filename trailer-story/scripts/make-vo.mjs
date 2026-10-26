// Generates the voiceover with ElevenLabs, slices each take into lines, and processes each line
// (deeper pitch, EQ, compression, room, plus per-character effects) into public/audio/vo/<id>.wav.
//   ELEVEN_API_KEY=sk_... node scripts/make-vo.mjs [--force] [--only=n1,h2] [--list]
// The key is read from the environment only and is never written to disk.
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TAKES, VOICES, MODEL, FALLBACK_MODEL, STABILITY, CHORUS } from './vo-script.mjs';
import { VO_AT } from '../src/timing.ts';
import { ROOT, decode } from './audio-lib.mjs';
import * as D from './dsp.mjs';
import { CHAINS, finish, deepen } from './voice-fx.mjs';

const key = process.env.ELEVEN_API_KEY;
if (!key) throw new Error('Set ELEVEN_API_KEY (an sk_... secret key, not the key id)');
const argv = process.argv.slice(2);
const force = argv.includes('--force');
const only = (argv.find((a) => a.startsWith('--only=')) ?? '').split('=')[1]?.split(',').filter(Boolean);
const H = { 'xi-api-key': key, 'content-type': 'application/json' };

const api = async (path, init) => {
  const res = await fetch(`https://api.elevenlabs.io/v1/${path}`, { ...init, headers: { ...H, ...(init?.headers ?? {}) } });
  return res;
};

/* ------------------------------------------------------------------ voices */
const resolved = {};
const resolveVoices = async () => {
  const res = await api('voices');
  if (!res.ok) throw new Error(`voices: ${res.status} ${(await res.text()).slice(0, 300)}`);
  const list = (await res.json()).voices ?? [];
  if (argv.includes('--list')) {
    for (const v of list) console.log(v.voice_id, '|', v.name, '|', v.category, '|', Object.values(v.labels ?? {}).join(','));
    process.exit(0);
  }
  for (const [k, v] of Object.entries(VOICES)) {
    const hit = list.find((x) => x.name.toLowerCase().startsWith(v.name.toLowerCase()));
    resolved[k] = hit?.voice_id ?? v.id;
    console.log(`voice ${k}: ${hit ? hit.name : v.name + ' (fallback id)'} -> ${resolved[k]}`);
  }
};

const tts = async (voiceKey, text, stability) => {
  const voice_id = resolved[voiceKey];
  const attempts = [
    { model_id: MODEL, text, voice_settings: { stability: STABILITY[stability] ?? 0.4, similarity_boost: 0.8, use_speaker_boost: true } },
    // fallback for accounts without v3: tags stripped, expression pushed through style instead
    { model_id: FALLBACK_MODEL, text: text.replace(/\[[^\]]*\]\s*/g, ''), voice_settings: { stability: 0.32, similarity_boost: 0.8, style: 0.55, use_speaker_boost: true } },
  ];
  let lastErr = '';
  for (const body of attempts) {
    const res = await api(`text-to-speech/${voice_id}?output_format=mp3_44100_128`, { method: 'POST', body: JSON.stringify(body) });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    lastErr = `${res.status} ${(await res.text()).slice(0, 300)}`;
    console.warn(`  ${body.model_id} failed: ${lastErr}`);
    if (res.status === 401) break;
  }
  throw new Error(`tts failed: ${lastErr}`);
};

const takeDir = join(ROOT, 'out/vo-takes');
const outDir = join(ROOT, 'public/audio/vo');
mkdirSync(takeDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const fetchTake = async (id, voiceKey, text, stability) => {
  const mp3 = join(takeDir, `${id}-${voiceKey}.mp3`);
  if (!existsSync(mp3) || force) {
    console.log(`generating ${id} (${voiceKey})…`);
    writeFileSync(mp3, await tts(voiceKey, text, stability));
  }
  return mp3;
};

/* ------------------------------------------------------------------ slicing */
const regions = (m, merge = 0.06) => {
  const w = Math.floor(D.SR * 0.01);
  let pk = 0;
  for (let i = 0; i < m.length; i++) pk = Math.max(pk, Math.abs(m[i]));
  const thr = pk * 0.03;
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

/* ------------------------------------------------------------------ main */
await resolveVoices();
const report = [];

for (const take of TAKES) {
  if (only && !take.lines.some((l) => only.includes(l[0])) && !only.includes(take.id)) continue;
  const mp3 = await fetchTake(take.id, take.voice, take.text, take.stability);
  const c = decode(mp3, D.SR, 1);
  const mono = c.ch[0];
  const parts = take.lines.reduce((a, l) => a + l[1], 0);
  const reg = regions(mono);
  // the (parts - 1) longest pauses are the real sentence boundaries; bridge the rest
  const gaps = reg.slice(1).map((r, i) => ({ i, g: r[0] - reg[i][1] }));
  const keep = new Set(gaps.sort((a, b) => b.g - a.g).slice(0, parts - 1).map((g) => g.i));
  const merged = [];
  reg.forEach((r, i) => {
    if (i > 0 && !keep.has(i - 1)) merged[merged.length - 1][1] = r[1];
    else merged.push([...r]);
  });
  if (merged.length !== parts) throw new Error(`${take.id}: expected ${parts} sentences, found ${merged.length}. Re-run with --force (the read changed) or adjust the script.`);
  let p = 0;
  for (const [id, n, chain] of take.lines) {
    const a = merged[p][0];
    const b = merged[p + n - 1][1];
    p += n;
    const seg = mono.slice(Math.max(0, Math.floor((a - 0.02) * D.SR)), Math.min(mono.length, Math.floor((b + 0.12) * D.SR)));
    const [l, r] = finish(CHAINS[chain](seg));
    D.writeWavStereo(join(outDir, `${id}.wav`), l, r);
    const dur = l.length / D.SR;
    report.push({ id, dur, at: VO_AT[id] });
    console.log(`${id}  ${dur.toFixed(2)}s  @${VO_AT[id]?.toFixed(2)}s  (${chain})`);
  }
}

// the chorus: the same two words in six voices, stacked
if (!only || only.includes('chorus')) {
  console.log('chorus…');
  const total = D.secToN(4.2);
  const L = new Float32Array(total);
  const R = new Float32Array(total);
  for (const ly of CHORUS.layers) {
    const mp3 = await fetchTake(`chorus-${ly.voice}`, ly.voice, CHORUS.text, 'creative');
    const x = decode(mp3, D.SR, 1).ch[0];
    const reg = regions(x);
    const seg = x.slice(Math.floor(Math.max(0, reg[0][0] - 0.02) * D.SR), Math.floor((reg[reg.length - 1][1] + 0.1) * D.SR));
    let y = D.biquad(seg, 'hp', 90);
    y = deepen(y, ly.rate * 0.97, 0.9);
    y = D.biquad(y, 'highshelf', 5500, 0.7, 2.5);
    y = D.compress(y, { thresh: -26, ratio: 3, makeup: 5 });
    const at = D.secToN(ly.delay);
    const l = Math.cos(((ly.pan + 1) * Math.PI) / 4) * ly.gain;
    const r = Math.sin(((ly.pan + 1) * Math.PI) / 4) * ly.gain;
    D.mixInto(L, y, at, l);
    D.mixInto(R, y, at, r);
  }
  // big, dark hall: the sound of a room full of people reading from the same page
  const mono = L.map((v, i) => (v + R[i]) * 0.5);
  const [wl, wr] = D.reverb(mono, { decay: 3.2, damp: 0.6, pre: 0.03 });
  const n = total + D.secToN(2.5);
  const oL = new Float32Array(n);
  const oR = new Float32Array(n);
  D.mixInto(oL, L, 0, 0.7);
  D.mixInto(oR, R, 0, 0.7);
  D.mixInto(oL, wl.subarray(0, n), 0, 2.2);
  D.mixInto(oR, wr.subarray(0, n), 0, 2.2);
  let pk = 0;
  for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(oL[i]), Math.abs(oR[i]));
  const g = D.dbToGain(-3) / (pk || 1);
  D.writeWavStereo(join(outDir, 'chorus.wav'), oL.map((v) => v * g), oR.map((v) => v * g));
  report.push({ id: 'chorus', dur: n / D.SR, at: VO_AT.chorus });
  console.log(`chorus  ${(n / D.SR).toFixed(2)}s  @${VO_AT.chorus.toFixed(2)}s`);
}

writeFileSync(join(ROOT, 'out/vo-report.json'), JSON.stringify(report, null, 2));
console.log('\nVoiceover ready in public/audio/vo. Next: npm run audio');
