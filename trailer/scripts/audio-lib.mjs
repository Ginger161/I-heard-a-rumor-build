// Shared audio helpers for the trailer scripts. Decodes via the ffmpeg that ships with Remotion
// (a stripped build: no raw/f32 muxers, so we go through WAV and parse the chunks ourselves).
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const FF = join(ROOT, 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
export const CACHE = join(tmpdir(), 'ria-trailer-audio');
mkdirSync(CACHE, { recursive: true });

/** Decode any audio file to float samples. Returns { ch: Float32Array[], sr }. */
export const decode = (file, sr = 44100, channels = 2) => {
  const out = join(CACHE, `${Buffer.from(file).toString('base64url').slice(-40)}-${sr}-${channels}.wav`);
  const r = spawnSync(FF, ['-v', 'error', '-y', '-i', file, '-ac', String(channels), '-ar', String(sr), '-c:a', 'pcm_s16le', '-f', 'wav', out]);
  if (r.status !== 0) throw new Error(`ffmpeg failed for ${file}: ${r.stderr}`);
  const b = readFileSync(out);
  let p = 12;
  let dataAt = -1;
  let dataLen = 0;
  while (p + 8 <= b.length) {
    const id = b.toString('ascii', p, p + 4);
    const len = b.readUInt32LE(p + 4);
    if (id === 'data') {
      dataAt = p + 8;
      dataLen = Math.min(len, b.length - dataAt);
      break;
    }
    p += 8 + len + (len % 2);
  }
  if (dataAt < 0) throw new Error('no data chunk');
  const n = Math.floor(dataLen / 2 / channels);
  const ch = Array.from({ length: channels }, () => new Float32Array(n));
  for (let i = 0; i < n; i++) for (let c = 0; c < channels; c++) ch[c][i] = b.readInt16LE(dataAt + (i * channels + c) * 2) / 32768;
  return { ch, sr };
};

/** Peak-envelope onsets: [{t, p}] where p is the hit's peak relative to the file's loudest peak. */
export const onsets = (mono, sr, { winMs = 5, ratio = 2.5, floor = 0.08, gap = 0.1 } = {}) => {
  const w = Math.floor((sr * winMs) / 1000);
  const env = [];
  for (let i = 0; i + w <= mono.length; i += w) {
    let m = 0;
    for (let j = 0; j < w; j++) m = Math.max(m, Math.abs(mono[i + j]));
    env.push(m);
  }
  const pk = Math.max(...env);
  const out = [];
  for (let i = 1; i < env.length; i++) {
    const prev = (env[i - 1] + (env[i - 2] ?? 0) + (env[i - 3] ?? 0)) / 3 + 1e-4;
    const t = (i * winMs) / 1000;
    if (env[i] > prev * ratio && env[i] > pk * floor && (!out.length || t - out[out.length - 1].t > gap)) {
      let m = 0;
      for (let j = i; j < Math.min(i + 20, env.length); j++) m = Math.max(m, env[j]);
      out.push({ t: +t.toFixed(3), p: +(m / pk).toFixed(2) });
    }
  }
  return { hits: out, peak: pk, dur: mono.length / sr };
};
