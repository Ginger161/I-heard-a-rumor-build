import React from 'react';
import { Look, SKIN_TONES, HeadStyle, Outfit } from '../../engine/data/looks';

// ---------------------------------------------------------------------------
// FACE: a flat-vector cartoon bust built from layers, driven by a Look (who they are) and an Emotion (how they feel).
// Everything is drawn in code, so it ships with the game, works offline and needs no licensed art. Real portraits can still
// replace it per Target (see Avatar in Silhouette.tsx).
// ---------------------------------------------------------------------------
export type Emotion = 'NEUTRAL' | 'CONFIDENT' | 'SMUG' | 'ANGRY' | 'WORRIED' | 'PANIC' | 'DEFEATED' | 'LAUGH';
export const EMOTIONS: Emotion[] = ['NEUTRAL', 'CONFIDENT', 'SMUG', 'ANGRY', 'WORRIED', 'PANIC', 'DEFEATED', 'LAUGH'];

// Mix a hex colour toward white (amount > 0) or black (amount < 0).
const shade = (hex: string, amt: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt));
  const c = (v: number) => Math.max(0, Math.min(255, f(v))).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

const INK = '#1A1A1A';
const GOLD = '#D4A017';

// What each emotion does to the face: brow lift/tilt, how open the eyes are, where the pupils look, and the mouth.
interface Pose {
  browL: number; browR: number;     // vertical offset of the outer end (negative = raised)
  tilt: number;                     // inner end of each brow: negative = raised (worried), positive = lowered (angry)
  open: number;                     // eye openness, 1 = normal
  look: number;                     // pupil shift sideways
  mouth: 'flat' | 'smile' | 'smirk' | 'frown' | 'grit' | 'open' | 'laugh' | 'wobble';
  closed?: boolean;                 // eyes shut in a smile
  sweat?: number; tear?: boolean; anger?: boolean; blush?: number; pale?: boolean; tilt2?: number;
}
const POSES: Record<Emotion, Pose> = {
  NEUTRAL: { browL: 0, browR: 0, tilt: 0, open: 1, look: 0, mouth: 'flat' },
  CONFIDENT: { browL: -0.6, browR: -0.6, tilt: 0, open: 0.95, look: 0, mouth: 'smile' },
  SMUG: { browL: -2.2, browR: 0.4, tilt: 0.6, open: 0.62, look: 0.6, mouth: 'smirk' },
  ANGRY: { browL: 0.4, browR: 0.4, tilt: 3, open: 0.76, look: 0, mouth: 'grit', anger: true, blush: 0.35 },
  WORRIED: { browL: -1.4, browR: -1.4, tilt: -3.2, open: 1.12, look: 1.3, mouth: 'wobble', sweat: 1 },
  PANIC: { browL: -2.4, browR: -2.4, tilt: -2.4, open: 1.45, look: 0, mouth: 'open', sweat: 2, pale: true },
  DEFEATED: { browL: 1.2, browR: 1.2, tilt: -2.4, open: 0.42, look: 0, mouth: 'frown', tear: true, tilt2: 1 },
  LAUGH: { browL: -1.4, browR: -1.4, tilt: -0.4, open: 0.9, look: 0, mouth: 'laugh', closed: true }
};

const regionOutfit = (region: Look['region']): string =>
  ({ IGBO: '#7F1D1D', YORUBA: '#1E3A8A', HAUSA: '#F1ECDD', SS: '#0F766E', MB: '#374151' } as const)[region];

// ---- head and hair --------------------------------------------------------
interface Layers { back?: React.ReactNode; front?: React.ReactNode }

const headLayers = (style: HeadStyle, hair: string, cloth: string, look: Look): Layers => {
  const edge = shade(cloth, -0.25);
  switch (style) {
    case 'short':
      return { front: <path d="M24.5 33 C23 19 31 14 40 14 C49 14 57 19 55.5 33 C52 26 46 23 40 23 C34 23 28 26 24.5 33 Z" fill={hair} /> };
    case 'fade':
      return { front: <path d="M26 31 C25.5 19 32 15 40 15 C48 15 54.5 19 54 31 C51 25 46 22.5 40 22.5 C34 22.5 29 25 26 31 Z" fill={hair} /> };
    case 'afro':
      return {
        back: <circle cx="40" cy="25" r="21.5" fill={hair} />,
        front: <path d="M25.5 31 C26 22 32 19.5 40 19.5 C48 19.5 54 22 54.5 31 C50 25.5 45 23.5 40 23.5 C35 23.5 30 25.5 25.5 31 Z" fill={hair} />
      };
    case 'locs':
      return {
        back: <g stroke={hair} strokeWidth="3.4" strokeLinecap="round" fill="none">
          {[24, 27, 30, 50, 53, 56].map((x, i) => <path key={x} d={`M${x} 22 C${x - 3 + i % 2 * 2} 34 ${x - 2} 46 ${x - 3 + (x > 40 ? 6 : 0)} ${58 + (i % 3) * 3}`} />)}
        </g>,
        front: <path d="M24.5 33 C23 18 31 13.5 40 13.5 C49 13.5 57 18 55.5 33 C52 26 46 22.5 40 22.5 C34 22.5 28 26 24.5 33 Z" fill={hair} />
      };
    case 'balding':
      return { front: <g fill={hair}><path d="M24.6 37 C23.8 30 26 26 29.2 25 L29.4 37.5 Z" /><path d="M55.4 37 C56.2 30 54 26 50.8 25 L50.6 37.5 Z" /></g> };
    case 'braids':
      return {
        back: <g>
          <path d="M22 36 C20 12 60 12 58 36 L60 68 L53 68 L52 42 L28 42 L27 68 L20 68 Z" fill={hair} />
          <g stroke={shade(hair, 0.22)} strokeWidth="0.7" fill="none">{[22, 25, 28, 52, 55, 58].map(x => <path key={x} d={`M${x} 40 L${x - 0.6} 68`} />)}</g>
        </g>,
        front: <g><path d="M24.5 34 C23.5 19 31 14 40 14 C49 14 56.5 19 55.5 34 C52 27 46 23 40 23 C34 23 28 27 24.5 34 Z" fill={hair} /><path d="M40 14 V23" stroke={shade(hair, 0.25)} strokeWidth="0.8" /></g>
      };
    case 'weave':
      return {
        back: <path d="M21 36 C19 11 61 11 59 36 C62 52 59 66 63 82 L17 82 C21 66 18 52 21 36 Z" fill={hair} />,
        front: <path d="M24.5 35 C23.5 19 31 14 40 14 C50 14 56.5 20 55.5 35 C53 27 47 21 36 21.5 C31 22 27 27 24.5 35 Z" fill={hair} />
      };
    case 'puff':
      return {
        back: <g fill={hair}><circle cx="40" cy="14.5" r="12" /><circle cx="30" cy="20" r="8" /><circle cx="50" cy="20" r="8" /></g>,
        front: <path d="M25.5 32 C26 22 32 19 40 19 C48 19 54 22 54.5 32 C50 26 45 23.5 40 23.5 C35 23.5 30 26 25.5 32 Z" fill={hair} />
      };
    case 'bun':
      return { back: <circle cx="40" cy="11" r="7" fill={hair} />, front: <path d="M24.5 33 C23 19 31 14 40 14 C49 14 57 19 55.5 33 C52 26 46 23 40 23 C34 23 28 26 24.5 33 Z" fill={hair} /> };
    case 'wig':
      return {
        back: <path d="M22 35 C21 13 59 13 58 35 L59.5 55 C54 58 26 58 20.5 55 Z" fill={hair} />,
        front: <path d="M24.5 34 C23.5 19 31 14 40 14 C49 14 56.5 19 55.5 34 C51 26 44 22 38 24 C32 25 27 28 24.5 34 Z" fill={hair} />
      };
    case 'gele':
      return {
        front: <g>
          <path d="M19 32 C14 12 30 2 44 3 C60 4 69 14 62 31 C58 22 48 18 40 18 C32 18 23 22 19 32 Z" fill={cloth} />
          <path d="M47 5 C57 -1 69 5 65 15 C61 10 56 10 50 12 Z" fill={shade(cloth, 0.12)} />
          <g fill="none" stroke={shade(cloth, -0.28)} strokeWidth="0.9"><path d="M22 27 C26 14 38 9 52 11" /><path d="M26 28 C30 18 40 14 54 16" /></g>
          <path d="M30 6 C36 4 44 4 50 7" stroke={shade(cloth, 0.3)} strokeWidth="0.9" fill="none" />
        </g>
      };
    case 'headtie':
      return {
        front: <g><path d="M22 32 C20 16 32 10 40 10 C50 10 60 16 58 32 C52 24 28 24 22 32 Z" fill={cloth} /><path d="M52 12 C60 8 66 12 63 18 C60 15 57 15 54 16 Z" fill={shade(cloth, 0.15)} /></g>
      };
    case 'fila':
      return {
        front: <g>
          <path d="M23.5 31 C22.5 16 31 9.5 42 9.5 C52 9.5 60 12 64 20 C67 26 64.5 33 60 33 C58.5 29 56 25.5 40 25.5 C32 25.5 27 27 23.5 31 Z" fill={cloth} />
          <path d="M23.5 31 C27 27 32 25.5 40 25.5 C56 25.5 58.5 29 60 33" fill="none" stroke={edge} strokeWidth="1.4" />
          <path d="M30 13 C40 9 52 11 60 17" fill="none" stroke={shade(cloth, 0.2)} strokeWidth="0.8" />
        </g>
      };
    case 'okpu':
      return {
        front: <g>
          <path d="M25 30 C24 14 30 10.5 40 10.5 C50 10.5 56 14 55 30 C50 26.5 30 26.5 25 30 Z" fill="#B91C1C" />
          <path d="M25 30 C30 26.5 50 26.5 55 30 L55 26 C50 23 30 23 25 26 Z" fill="#7F1D1D" />
          <path d="M52 18 C58 9 65 6 71 3 C69 12 62 19 54 25 Z" fill="#F4F1EA" stroke={INK} strokeWidth="0.5" />
          <path d="M55 17 C60 12 64 9 69 6" fill="none" stroke="#9CA3AF" strokeWidth="0.6" />
          <circle cx="40" cy="18" r="2" fill={GOLD} />
        </g>
      };
    case 'kufi': {
      const c = look.region === 'HAUSA' ? '#EDE6D2' : cloth;
      return {
        front: <g>
          <path d="M25.5 29 C25 16 32 11.5 40 11.5 C48 11.5 55 16 54.5 29 C48 26 32 26 25.5 29 Z" fill={c} />
          <g fill="none" stroke={shade(c, -0.35)} strokeWidth="0.8"><path d="M29 27 L31 15" /><path d="M35 26 L35.5 13" /><path d="M41 26 L40.5 12" /><path d="M47 26 L45.5 13" /><path d="M52 27 L50 15" /></g>
          <path d="M25.5 29 C32 26 48 26 54.5 29" fill="none" stroke={shade(c, -0.3)} strokeWidth="1.2" />
        </g>
      };
    }
    case 'turban':
      return {
        front: <g>
          <ellipse cx="40" cy="19" rx="19.5" ry="11.5" fill="#F4EFE3" />
          <path d="M52 22 C66 24 66 38 59 44 C59 34 55 29 49 27 Z" fill="#E7DFCB" />
          <g fill="none" stroke="#C9BFA2" strokeWidth="0.9"><path d="M22 20 C30 11 50 11 58 20" /><path d="M21 24 C30 16 50 16 59 24" /><path d="M25 28 C33 22 47 22 55 28" /></g>
        </g>
      };
    case 'hijab':
      return {
        back: <path d="M16 100 C13 50 17 11 40 10 C63 11 67 50 64 100 Z" fill={cloth} />,
        front: <g>
          <path d="M24 34 C25 21 32 16.5 40 16.5 C48 16.5 55 21 56 34 C51 26.5 45 24 40 24 C35 24 29 26.5 24 34 Z" fill={cloth} />
          <path d="M24 48 C26 60 32 64 40 64 C48 64 54 60 56 48 L61 78 L19 78 Z" fill={shade(cloth, -0.08)} />
        </g>
      };
    case 'cap':
      return {
        front: <g>
          <path d="M25 30 C24 17 31 12.5 40 12.5 C49 12.5 56 17 55 30 C50 26 30 26 25 30 Z" fill={INK} />
          <path d="M34 28 L66 27 C67 30 65 32 62 32 L34 31 Z" fill={shade(INK, 0.2)} />
        </g>
      };
    case 'peaked':
      return {
        front: <g>
          <path d="M24 28 C23 14 31 9 40 9 C49 9 57 14 56 28 Z" fill={cloth} />
          <rect x="23" y="26" width="34" height="4.2" rx="1.2" fill={shade(cloth, -0.35)} />
          <path d="M30 29 L50 29 C52 33 48 35 40 35 C32 35 28 33 30 29 Z" fill="#111" />
          <circle cx="40" cy="17" r="3" fill={GOLD} />
        </g>
      };
    case 'crown':
      return {
        front: <g>
          <path d="M26 25 L28 8 L34 17 L40 4 L46 17 L52 8 L54 25 Z" fill={GOLD} stroke="#8A6A0B" strokeWidth="0.8" />
          <rect x="26" y="23" width="28" height="4" fill="#B8860B" />
          <circle cx="40" cy="14" r="1.7" fill="#B91C1C" />
        </g>
      };
    default:
      return {};
  }
};

// ---- outfits ----------------------------------------------------------------
const outfitLayers = (outfit: Outfit, c: string, look: Look, skin: string): Layers => {
  const female = look.g === 'F';
  const torso = female ? 'M12 100 C12 80 24 71 34 68.5 L46 68.5 C56 71 68 80 68 100 Z' : 'M6 100 C6 79 20 70 33 68.5 L47 68.5 C60 70 74 79 74 100 Z';
  const wide = 'M0 100 C0 77 17 67 33 66.5 L47 66.5 C63 67 80 77 80 100 Z';
  const skinDark = shade(skin, -0.2);
  switch (outfit) {
    case 'suit': {
      const jacket = shade(c, 0);
      return { front: <g>
        <path d={torso} fill={jacket} />
        <path d="M33.5 68.5 L40 87 L46.5 68.5 Z" fill="#F4F1EA" />
        {!female && <path d="M39 71 H41 L42.6 84 L40 90 L37.4 84 Z" fill="#B91C1C" />}
        {female && <path d="M34 69 Q40 77 46 69 Z" fill={skinDark} />}
        <path d="M33.5 68.5 L37 92 L27 82 Z" fill={shade(jacket, -0.18)} /><path d="M46.5 68.5 L43 92 L53 82 Z" fill={shade(jacket, -0.18)} />
      </g> };
    }
    case 'agbada':
      return { front: <g>
        <path d={wide} fill={c} />
        <path d="M33 66.5 Q40 80 47 66.5 Z" fill={shade(c, 0.35)} />
        <path d="M31 66.5 Q40 84 49 66.5" fill="none" stroke={GOLD} strokeWidth="1.5" />
        <g fill="none" stroke={shade(c, -0.25)} strokeWidth="0.9"><path d="M6 100 C8 86 14 78 22 72" /><path d="M74 100 C72 86 66 78 58 72" /></g>
        <path d="M36 78 H44 M38 81 H42" stroke={GOLD} strokeWidth="0.8" />
      </g> };
    case 'babariga':
      return { front: <g>
        <path d={wide} fill={c === '#7F1D1D' ? '#EEE8D6' : shade(c, 0.55)} />
        <path d="M33 66.5 Q40 78 47 66.5 Z" fill={skinDark} />
        <rect x="31.5" y="75" width="17" height="11" rx="1" fill="none" stroke={GOLD} strokeWidth="1" />
        <path d="M34 80.5 H46 M40 76 V85" stroke={GOLD} strokeWidth="0.8" />
        <g fill="none" stroke="#CFC6AE" strokeWidth="0.9"><path d="M6 100 C8 86 14 78 22 72" /><path d="M74 100 C72 86 66 78 58 72" /></g>
      </g> };
    case 'senator':
      return { front: <g>
        <path d={torso} fill={c} />
        <path d="M34 68.5 Q40 77 46 68.5 Z" fill={skinDark} />
        <path d="M33 68.5 Q40 80 47 68.5" fill="none" stroke={GOLD} strokeWidth="1.2" />
        <path d="M40 78 V94" stroke={shade(c, -0.3)} strokeWidth="0.8" />
      </g> };
    case 'buba':
      return { front: <g>
        <path d={torso} fill={c} />
        <path d="M27 71.5 Q40 82 53 71.5 L50 68.5 L30 68.5 Z" fill={skinDark} />
        <g fill={shade(c, 0.45)}>{[[22, 88], [30, 94], [38, 90], [47, 95], [55, 89], [62, 94], [27, 80], [52, 82]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.5" />)}</g>
        <path d="M27 71.5 Q40 82 53 71.5" fill="none" stroke={GOLD} strokeWidth="1" />
      </g> };
    case 'dress':
      return { front: <g>
        <path d={torso} fill={c} />
        {look.head !== 'hijab' && <path d="M30 69 L40 85 L50 69 Z" fill={skinDark} />}
        <path d="M30 69 L40 85 L50 69" fill="none" stroke={shade(c, -0.3)} strokeWidth="1" />
      </g> };
    case 'isiagu':
      return { front: <g>
        <path d={torso} fill="#161616" />
        <rect x="34" y="66.5" width="12" height="4.5" fill={GOLD} />
        <g fill={GOLD}>{[[40, 80], [28, 90], [52, 90], [40, 96], [20, 96], [60, 96]].map(([x, y]) => <g key={`${x}${y}`}><circle cx={x} cy={y} r="3" /><circle cx={x - 1.1} cy={y - 0.6} r="0.6" fill="#161616" /><circle cx={x + 1.1} cy={y - 0.6} r="0.6" fill="#161616" /></g>)}</g>
      </g> };
    case 'clergy':
      return { front: <g>
        <path d={torso} fill="#161616" />
        <path d="M35 68.5 L40 76 L45 68.5 Z" fill={skinDark} />
        <rect x="37" y="68" width="6" height="3.6" fill="#F4F1EA" />
        <path d="M40 78 V92 M35 83 H45" stroke={GOLD} strokeWidth="2" />
      </g> };
    case 'hoodie':
      return {
        back: <path d="M15 76 C12 60 22 54 33 56 L47 56 C58 54 68 60 65 76 Z" fill={shade(c, -0.3)} />,
        front: <g>
          <path d={torso} fill={c} />
          <path d="M31 69 Q40 79 49 69" fill="none" stroke={shade(c, -0.35)} strokeWidth="2.2" />
          <path d="M35 74 L35.5 86 M45 74 L44.5 86" stroke="#F4F1EA" strokeWidth="1" strokeLinecap="round" />
        </g>
      };
    case 'uniform':
      return { front: <g>
        <path d={torso} fill={c} />
        <path d="M33 68.5 L40 80 L47 68.5 L47 72 L40 84 L33 72 Z" fill={shade(c, -0.3)} />
        <rect x="12" y="73" width="13" height="4.5" fill={shade(c, -0.4)} /><rect x="55" y="73" width="13" height="4.5" fill={shade(c, -0.4)} />
        <g fill={GOLD}><circle cx="18.5" cy="75.2" r="1" /><circle cx="61.5" cy="75.2" r="1" /><circle cx="40" cy="88" r="1.2" /><circle cx="40" cy="94" r="1.2" /></g>
        <rect x="48" y="82" width="7" height="5" rx="1" fill={shade(c, 0.25)} />
      </g> };
    case 'judge':
      return { front: <g>
        <path d={wide} fill="#161616" />
        <path d="M33 66.5 L40 92 L47 66.5 Z" fill="#F4F1EA" />
        <path d="M36 70 L40 92 M44 70 L40 92" stroke="#9CA3AF" strokeWidth="0.8" />
        <path d="M30 66.5 L37 96 H30 Z M50 66.5 L43 96 H50 Z" fill="#B91C1C" opacity="0.9" />
      </g> };
    case 'tee':
    default:
      return { front: <g>
        <path d={torso} fill={c} />
        <path d="M33.5 68.5 Q40 77 46.5 68.5 Z" fill={skinDark} />
        <path d="M33.5 68.5 Q40 77 46.5 68.5" fill="none" stroke={shade(c, -0.3)} strokeWidth="1.2" />
      </g> };
  }
};

const defaultOutfitColour = (outfit: Outfit, look: Look, accent?: string): string => {
  if (outfit === 'uniform') return look.region === 'HAUSA' ? '#6B6A3A' : '#46506B';
  if (outfit === 'suit') return accent ?? '#2D3340';
  if (outfit === 'babariga') return accent ?? '#F1ECDD';
  if (outfit === 'hoodie' || outfit === 'tee') return accent ?? '#475569';
  return accent ?? regionOutfit(look.region);
};

// ---- the component --------------------------------------------------------
export const Face: React.FC<{ look: Look; emotion?: Emotion; accent?: string; seed?: number; className?: string }> = ({ look, emotion = 'NEUTRAL', accent, seed = 0, className = '' }) => {
  const v = (n: number) => ((seed >>> n) & 7) / 7 - 0.5;   // a stable -0.5..0.5 per person, so same-age faces differ
  const p = POSES[emotion];
  const skin = SKIN_TONES[Math.max(0, Math.min(5, look.skin))];
  const skinDark = shade(skin, -0.22);
  const old = look.age === 'O', mid = look.age === 'M', female = look.g === 'F';
  const hair = ['wig', 'weave', 'braids', 'puff', 'afro', 'locs'].includes(look.head) ? (old ? '#C9C6C0' : look.head === 'weave' ? '#24140F' : INK) : old ? '#D8D5CF' : mid ? '#33302B' : INK;
  const cloth = defaultOutfitColour(look.outfit, look, accent);
  const headCloth = look.head === 'hijab' ? accent ?? '#5B4B8A' : look.head === 'fila' || look.head === 'gele' || look.head === 'headtie'
    ? (look.outfit === 'agbada' || look.outfit === 'buba' || look.outfit === 'dress' || look.outfit === 'senator' ? cloth : accent ?? regionOutfit(look.region))
    : cloth;

  const w = (female ? 14.6 : 15.8) + v(0) * 1.6;
  const top = (old ? 19.2 : 19.8) + v(3) * 1.2, bot = old ? 57.8 : female ? 57 : 57.4, cy = 38.5;
  const jaw = female ? 0.6 : 0.74;
  const headPath = `M40 ${top} C${40 + w * 0.8} ${top} ${40 + w} ${top + 9} ${40 + w} ${cy} C${40 + w} ${cy + 11} ${40 + w * jaw} ${bot} 40 ${bot} C${40 - w * jaw} ${bot} ${40 - w} ${cy + 11} ${40 - w} ${cy} C${40 - w} ${top + 9} ${40 - w * 0.8} ${top} 40 ${top} Z`;

  const outfit = outfitLayers(look.outfit, cloth, look, skin);
  const headL = headLayers(look.head, hair, headCloth, look);
  const lip = female ? '#A5434F' : shade(skin, -0.42);
  const eyeY = 37 + v(9) * 0.8, eyeX = [33.4 - v(6) * 0.9, 46.6 + v(6) * 0.9];
  const browY = 31.2 + (old ? 0.6 : 0);
  const browW = (old || look.g === 'M' ? 2 : 1.5) + v(12) * 0.5;
  const lookX = p.look;
  const beardCol = old ? '#D8D5CF' : mid ? '#3A3631' : INK;

  const eye = (x: number, side: -1 | 1) => {
    const ry = Math.max(0.5, 2.5 * p.open);
    if (p.closed) return <path d={`M${x - 3.2} ${eyeY + 0.6} Q${x} ${eyeY - 3.4} ${x + 3.2} ${eyeY + 0.6}`} fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />;
    return (
      <g>
        <ellipse cx={x} cy={eyeY} rx="3.1" ry={ry} fill="#FBFAF6" />
        <ellipse cx={x + lookX * side * 0 + lookX} cy={eyeY + (emotion === 'DEFEATED' ? 0.5 : 0)} rx={emotion === 'PANIC' ? 1.1 : 1.6} ry={Math.min(emotion === 'PANIC' ? 1.1 : 1.6, ry)} fill={INK} />
        <path d={`M${x - 3.3} ${eyeY - 0.2} Q${x} ${eyeY - ry * 1.9 - 0.6} ${x + 3.3} ${eyeY - 0.2}`} fill="none" stroke={INK} strokeWidth="0.95" strokeLinecap="round" />
        {p.open < 0.7 && <path d={`M${x - 3.2} ${eyeY - ry * 0.6} Q${x} ${eyeY - ry * 1.5 - 1} ${x + 3.2} ${eyeY - ry * 0.6} L${x + 3.2} ${eyeY - 3.2} L${x - 3.2} ${eyeY - 3.2} Z`} fill={skin} opacity="0.92" />}
      </g>
    );
  };
  const brow = (inner: number, outer: number, side: -1 | 1, offset: number) => {
    const ox = 40 + side * 11.2, ix = 40 + side * 2.9;
    return <path d={`M${ox} ${browY + outer + offset} Q${(ox + ix) / 2} ${browY + (outer + inner) / 2 - 1.2 + offset} ${ix} ${browY + inner + offset}`} fill="none" stroke={hair === INK || old ? (old ? '#CFCCC6' : INK) : hair} strokeWidth={browW} strokeLinecap="round" />;
  };

  const mouth = (() => {
    const y = 49.6;
    switch (p.mouth) {
      case 'smile': return <path d={`M35.2 ${y - 0.6} Q40 ${y + 3.4} 44.8 ${y - 0.6}`} fill="none" stroke={lip} strokeWidth="1.5" strokeLinecap="round" />;
      case 'smirk': return <path d={`M35.5 ${y + 0.8} Q40 ${y + 1.4} 44.8 ${y - 1.8}`} fill="none" stroke={lip} strokeWidth="1.5" strokeLinecap="round" />;
      case 'frown': return <path d={`M35.2 ${y + 1.6} Q40 ${y - 2.6} 44.8 ${y + 1.6}`} fill="none" stroke={lip} strokeWidth="1.5" strokeLinecap="round" />;
      case 'wobble': return <path d={`M35.5 ${y + 0.8} Q37.5 ${y - 0.8} 40 ${y + 0.8} T44.5 ${y + 0.8}`} fill="none" stroke={lip} strokeWidth="1.4" strokeLinecap="round" />;
      case 'grit': return <g><rect x="35.2" y={y - 1.6} width="9.6" height="4.2" rx="1.2" fill="#FBFAF6" stroke={INK} strokeWidth="0.9" /><path d={`M37.6 ${y - 1.6} V${y + 2.6} M40 ${y - 1.6} V${y + 2.6} M42.4 ${y - 1.6} V${y + 2.6}`} stroke={INK} strokeWidth="0.5" /></g>;
      case 'open': return <g><ellipse cx="40" cy={y + 1.2} rx="3.6" ry="4.4" fill="#3B0D0D" stroke={INK} strokeWidth="0.8" /><ellipse cx="40" cy={y + 3.2} rx="2.2" ry="1.3" fill="#E8878F" /></g>;
      case 'laugh': return <g><path d={`M34.2 ${y - 1.6} Q40 ${y + 9} 45.8 ${y - 1.6} Z`} fill="#3B0D0D" stroke={INK} strokeWidth="0.9" strokeLinejoin="round" /><path d={`M35.6 ${y - 1.2} Q40 ${y + 0.6} 44.4 ${y - 1.2} L44 ${y + 0.4} Q40 ${y + 1.6} 36 ${y + 0.4} Z`} fill="#FBFAF6" /></g>;
      default: return <path d={`M36 ${y} H44`} stroke={lip} strokeWidth="1.5" strokeLinecap="round" />;
    }
  })();

  const beard = (() => {
    switch (look.beard) {
      case 'full': return <path d={`M${40 - w + 0.6} 41 C${40 - w + 0.4} 53 31 ${bot + 2.4} 40 ${bot + 2.4} C49 ${bot + 2.4} ${40 + w - 0.4} 53 ${40 + w - 0.6} 41 C53 46 48.5 46.4 44.5 46.4 L35.5 46.4 C31.5 46.4 27 46 ${40 - w + 0.6} 41 Z`} fill={beardCol} />;
      case 'stubble': return <path d={`M${40 - w + 0.8} 42 C${40 - w + 0.6} 53 31 ${bot + 0.6} 40 ${bot + 0.6} C49 ${bot + 0.6} ${40 + w - 0.6} 53 ${40 + w - 0.8} 42 C52 47 48 47.4 44.5 47.4 L35.5 47.4 C32 47.4 28 47 ${40 - w + 0.8} 42 Z`} fill={beardCol} opacity="0.24" />;
      case 'goatee': return <g fill={beardCol}><path d="M35 51.4 C35 59 45 59 45 51.4 C43 53.2 37 53.2 35 51.4 Z" /><path d="M33.4 46.8 C36 44.8 39.4 46.2 40 46.4 C40.6 46.2 44 44.8 46.6 46.8 C44.4 48.2 41.6 47.6 40 47.6 C38.4 47.6 35.6 48.2 33.4 46.8 Z" /></g>;
      case 'moustache': return <path d="M33 46.9 C36 44.4 39.4 46 40 46.2 C40.6 46 44 44.4 47 46.9 C44.6 48.6 41.6 47.8 40 47.8 C38.4 47.8 35.4 48.6 33 46.9 Z" fill={beardCol} />;
      default: return null;
    }
  })();

  return (
    <svg viewBox="4 3 72 90" preserveAspectRatio="xMidYMin slice" className={className} aria-hidden="true" data-emotion={emotion}>
      {headL.back}
      {outfit.back}
      {/* neck and body */}
      <rect x={female ? 35 : 34} y="52" width={female ? 10 : 12} height="20" fill={shade(skin, -0.12)} />
      {outfit.front}
      <path d={female ? 'M35 66 Q40 71 45 66 V62 H35 Z' : 'M34 66 Q40 72 46 66 V62 H34 Z'} fill={shade(skin, -0.28)} opacity="0.55" />
      {/* ears and head */}
      <ellipse cx={40 - w - 0.6} cy="40.5" rx="2.2" ry="3.6" fill={shade(skin, -0.08)} />
      <ellipse cx={40 + w + 0.6} cy="40.5" rx="2.2" ry="3.6" fill={shade(skin, -0.08)} />
      <path d={headPath} fill={skin} />
      {p.pale && <path d={headPath} fill="#FFFFFF" opacity="0.14" />}
      {/* cheeks and age */}
      {(female || look.age === 'Y' || p.blush) && <g fill="#E06A5A" opacity={p.blush ?? (female ? 0.16 : 0.08)}><ellipse cx="30.6" cy="45" rx="3.4" ry="2.2" /><ellipse cx="49.4" cy="45" rx="3.4" ry="2.2" /></g>}
      {(mid || old) && <g fill="none" stroke={skinDark} strokeWidth="0.6" strokeLinecap="round" opacity="0.55"><path d="M33.2 43 Q31.6 47 33 50.4" /><path d="M46.8 43 Q48.4 47 47 50.4" /></g>}
      {old && <g fill="none" stroke={skinDark} strokeWidth="0.55" strokeLinecap="round" opacity="0.5">
        <path d="M32 25.6 H48 M33.5 27.4 H46.5" /><path d="M27.4 36 L25.6 35.2 M27.4 38 L25.4 38.4 M52.6 36 L54.4 35.2 M52.6 38 L54.6 38.4" />
        <path d="M30.4 40.6 Q33.4 42.4 36.4 40.6 M43.6 40.6 Q46.6 42.4 49.6 40.6" /></g>}
      {/* features */}
      {brow(p.tilt, p.browL, -1, 0)}
      {brow(p.tilt, p.browR, 1, 0)}
      {eye(eyeX[0], -1)}
      {eye(eyeX[1], 1)}
      <g transform={`translate(40 0) scale( 1) translate(-40 0)`}><path d="M40 38.8 L38.5 44.4 Q40 45.8 41.5 44.4" fill="none" stroke={skinDark} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></g>
      {beard}
      {mouth}
      {/* emotion effects */}
      {(p.sweat ?? 0) >= 1 && <path d="M56.6 27 Q58.8 31 56.6 33 Q54.4 31 56.6 27 Z" fill="#7DD3FC" stroke="#38BDF8" strokeWidth="0.4" />}
      {(p.sweat ?? 0) >= 2 && <path d="M22.6 31 Q24.4 34.4 22.6 36 Q20.8 34.4 22.6 31 Z" fill="#7DD3FC" stroke="#38BDF8" strokeWidth="0.4" />}
      {p.tear && <path d="M28.6 41 Q30.4 45.6 28.6 47.4 Q26.8 45.6 28.6 41 Z" fill="#7DD3FC" stroke="#38BDF8" strokeWidth="0.4" />}
      {p.anger && <g stroke="#DC2626" strokeWidth="1.1" strokeLinecap="round" fill="none"><path d="M56 22.5 L59.5 20.5 M56.6 26 L60.4 26 M56 29.5 L59.5 31.5" /></g>}
      {headL.front}
      {/* eyewear and accessories */}
      {look.glasses && <g fill="rgba(180,220,255,0.18)" stroke={INK} strokeWidth="1.1"><rect x="28.2" y="32.8" width="10.4" height="8.2" rx="3" /><rect x="41.4" y="32.8" width="10.4" height="8.2" rx="3" /><path d="M38.6 36 H41.4" fill="none" /></g>}
      {look.extras.includes('sunglasses') && <g fill="#111"><rect x="28" y="33" width="11" height="7.4" rx="3" /><rect x="41" y="33" width="11" height="7.4" rx="3" /><rect x="38.6" y="35" width="2.8" height="1.2" /></g>}
      {look.extras.includes('earrings') && <g fill={GOLD}><circle cx={40 - w - 0.6} cy="45.2" r="1.4" /><circle cx={40 + w + 0.6} cy="45.2" r="1.4" /></g>}
      {look.extras.includes('chain') && <g><path d="M31 70.5 Q40 86 49 70.5" fill="none" stroke={GOLD} strokeWidth="1.3" /><circle cx="40" cy="82" r="2.4" fill={GOLD} /></g>}
      {look.extras.includes('beads') && <g fill="#C2410C" stroke="#7C2D12" strokeWidth="0.3">{Array.from({ length: 9 }).map((_, i) => { const t = i / 8, u = 1 - t; return <circle key={i} cx={u * u * 29 + 2 * u * t * 40 + t * t * 51} cy={u * u * 69 + 2 * u * t * 90 + t * t * 69} r="1.7" />; })}</g>}
      {look.extras.includes('whistle') && <g><path d="M40 72 L40 84" stroke="#9CA3AF" strokeWidth="0.8" /><rect x="37.5" y="83" width="5" height="3.4" rx="1.2" fill="#E5E7EB" stroke={INK} strokeWidth="0.5" /></g>}
      {look.extras.includes('mic') && <g><rect x="60.5" y="68" width="5" height="17" rx="2.2" fill="#3F3F46" /><circle cx="63" cy="65" r="5" fill="#71717A" stroke={INK} strokeWidth="0.8" /><path d="M59.4 63.4 H66.6 M59.4 66.4 H66.6" stroke="#A1A1AA" strokeWidth="0.6" /></g>}
    </svg>
  );
};
