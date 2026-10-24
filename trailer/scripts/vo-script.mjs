// Voiceover script. `at` is the time (seconds) the first WORD should be heard, aligned to the
// picture's beats (see src/timing.ts): word snaps 1.3 / 2.3 / 3.3s, spark pop 5.47s, card slam 7.42s,
// pins 10.17-13.42s, counter lock 19.25s, DSS stamp 23.5s, flash 26.0s, final stamp 26.83s.
//
// Text uses ElevenLabs v3 audio tags ([whispering], [growling] ...). They steer delivery and are not spoken.
// Free accounts can only use built-in voices through the API (library voices need a paid plan).
export const VOICES = {
  callum: 'N2lVS1w4EtoT3dr4eOWO', // intense, hoarse
  bill: 'pqHfZKP75CvOlQylNhV4', // older, documentary
  arnold: 'VR6AewLTigWG4xSOukaG', // crisp, strong
  brian: 'nPczCjzI2devNBz1zQrb', // deep, resonant
  george: 'JBFqnCBsd6RMkjVDRZzb', // warm British
  adam: 'pNInz6obpgDQGcFmaJgB', // the stock default
};
export const DEFAULT_VOICE = 'callum';
export const MODEL = 'eleven_v3';
export const LINES = [
  { id: 'v01', at: 1.3, text: '[whispering] One whisper.' },
  { id: 'v02', at: 2.3, text: '[low, tense] Twenty days.' },
  { id: 'v03', at: 3.3, text: '[growling, dramatic] Bring them down.' },
  { id: 'v04', at: 4.85, text: '[ominous] It starts with one spark.' },
  { id: 'v05', at: 7.55, text: '[low, knowing] Somebody always talks.' },
  { id: 'v06', at: 9.85, text: '[urgent] Pin the gossip. [short pause] Pull the strings.' },
  { id: 'v07', at: 12.55, text: "[building intensity] Build a story they can't kill." },
  { id: 'v08', at: 15.5, text: '[low, intrigued] Watch it spread.' },
  { id: 'v09', at: 18.2, text: '[rising, intense] Sixty-five percent believe.' },
  { id: 'v10', at: 21.5, text: "[hushed, tense] They're watching." },
  { id: 'v11', at: 22.6, text: '[commanding] Drop the smoking gun.' },
  { id: 'v12', at: 26.9, text: '[deep, slow] I heard a rumor.' },
  { id: 'v13', at: 28.1, text: '[menacing, slow] Can you survive the syndicate?' },
];
