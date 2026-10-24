// Generates the voiceover clips with ElevenLabs. The API key is read from the ELEVEN_API_KEY
// environment variable only (never stored in the project):
//   ELEVEN_API_KEY=... node scripts/make-vo.mjs [--voice=callum] [--force]
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LINES, VOICES, DEFAULT_VOICE, MODEL } from './vo-script.mjs';
import { ROOT } from './audio-lib.mjs';

const key = process.env.ELEVEN_API_KEY;
if (!key) throw new Error('Set ELEVEN_API_KEY');
const dir = join(ROOT, 'public/audio/vo');
mkdirSync(dir, { recursive: true });
const force = process.argv.includes('--force');
const voiceName = (process.argv.find((a) => a.startsWith('--voice=')) ?? '--voice=' + DEFAULT_VOICE).split('=')[1];
const voiceId = VOICES[voiceName];
if (!voiceId) throw new Error('Unknown voice ' + voiceName + ' (choose: ' + Object.keys(VOICES).join(', ') + ')');
console.log('voice:', voiceName, '| model:', MODEL);

for (const l of LINES) {
  const file = join(dir, `${l.id}.mp3`);
  if (existsSync(file) && !force) {
    console.log('skip', l.id);
    continue;
  }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      text: l.text,
      model_id: MODEL,
      // v3: lower stability = more expressive, so keep it in the 'creative' range
      voice_settings: { stability: 0.3 },
    }),
  });
  if (!res.ok) throw new Error(`${l.id}: ${res.status} ${(await res.text()).slice(0, 300)}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log('wrote', l.id, JSON.stringify(l.text));
}
