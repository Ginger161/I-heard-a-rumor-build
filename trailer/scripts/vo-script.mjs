// Voiceover script. Each TAKE is read in one go so the delivery flows (a line read in isolation
// always sounds like the start of a new sentence), then sliced into LINES at its longest pauses.
// `at` = the time (seconds) the first WORD of the line is heard, aligned to the picture's beats
// (src/timing.ts, 45s cut): word snaps 2.0 / 3.35 / 4.6s, spark pop 8.3s, card slam 11.3s, pins 15.6-20.4s,
// counter lock 29.7s, DSS stamp 36.0s, flash 39.0s, final stamp 41.25s.
//
// ElevenLabs v3 audio tags ([quietly], [ominous] ...) steer delivery and are not spoken. Keep them sparse.
// Free accounts can only use built-in voices through the API (library voices need a paid plan).
export const VOICES = {
  callum: 'N2lVS1w4EtoT3dr4eOWO', // intense, hoarse
  bill: 'pqHfZKP75CvOlQylNhV4',
  arnold: 'VR6AewLTigWG4xSOukaG',
  brian: 'nPczCjzI2devNBz1zQrb',
  george: 'JBFqnCBsd6RMkjVDRZzb',
  adam: 'pNInz6obpgDQGcFmaJgB',
};
export const DEFAULT_VOICE = 'callum';
export const MODEL = 'eleven_v3';
export const TEMPO = 1.12; // Callum reads slowly; a small pitch-preserving speed-up keeps lines inside their slots
export const STABILITY = 0.5; // v3 "Natural": expressive but not erratic

// parts = how many separate sentences the line contains in the take (they are kept together, pause included)
export const TAKES = [
  { id: 't1', text: '[quietly] One whisper. [pause] Twenty days. [pause] [intense] Bring them down.', lines: [['v01', 2.0, 1], ['v02', 3.2, 1], ['v03', 4.8, 1]] },
  { id: 't2', text: '[ominous] It starts with one spark. [pause] Somebody always talks.', lines: [['v04', 7.2, 1], ['v05', 11.0, 1]] },
  { id: 't3', text: "[urgent] Pin the gossip. Pull the strings. [pause] Build a story they can't kill.", lines: [['v06', 15.3, 2], ['v07', 19.0, 1]] },
  { id: 't4', text: '[low] Watch it spread. [pause] [rising intensity] Sixty-five percent believe.', lines: [['v08', 24.2, 1], ['v09', 27.9, 1]] },
  { id: 't5', text: "[hushed] They're watching. [pause] [commanding] Drop the smoking gun.", lines: [['v10', 32.2, 1], ['v11', 34.1, 1]] },
  { id: 't7', text: '[hushed] Now everyone knows.', lines: [['v14', 39.4, 1]] },
  { id: 't6', text: '[deep, slow] I heard a rumor. [pause] Can you survive the syndicate?', lines: [['v12', 41.3, 1], ['v13', 42.8, 1]] },
];
export const LINES = TAKES.flatMap((t) => t.lines.map(([id, at]) => ({ id, at, text: id })));
