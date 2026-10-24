// Voiceover script. Each TAKE is read in one go so the delivery flows (a line read in isolation
// always sounds like the start of a new sentence), then sliced into LINES at its longest pauses.
// `at` = the time (seconds) the first WORD of the line is heard, aligned to the picture's beats
// (src/timing.ts): word snaps 1.2 / 2.15 / 3.55s, spark pop 5.47s, card slam 7.42s, pins 10.17-13.42s,
// counter lock 19.25s, DSS stamp 23.5s, flash 26.0s, final stamp 26.83s.
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
  { id: 't1', text: '[quietly] One whisper. [pause] Twenty days. [pause] [intense] Bring them down.', lines: [['v01', 1.2, 1], ['v02', 2.15, 1], ['v03', 3.55, 1]] },
  { id: 't2', text: '[ominous] It starts with one spark. [pause] Somebody always talks.', lines: [['v04', 5.0, 1], ['v05', 7.55, 1]] },
  { id: 't3', text: "[urgent] Pin the gossip. Pull the strings. [pause] Build a story they can't kill.", lines: [['v06', 9.85, 2], ['v07', 12.55, 1]] },
  { id: 't4', text: '[low] Watch it spread. [pause] [rising intensity] Sixty-five percent believe.', lines: [['v08', 15.5, 1], ['v09', 18.2, 1]] },
  { id: 't5', text: "[hushed] They're watching. [pause] [commanding] Drop the smoking gun.", lines: [['v10', 21.5, 1], ['v11', 22.6, 1]] },
  { id: 't6', text: '[deep, slow] I heard a rumor. [pause] Can you survive the syndicate?', lines: [['v12', 26.85, 1], ['v13', 28.3, 1]] },
];
export const LINES = TAKES.flatMap((t) => t.lines.map(([id, at]) => ({ id, at, text: id })));
