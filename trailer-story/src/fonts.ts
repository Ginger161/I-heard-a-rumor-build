import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';

// latin-ext carries the naira sign (U+20A6). Each loadFont() holds the render until the font is ready.
const subsets = ['latin', 'latin-ext'] as const;
const playfair = loadPlayfair('normal', { weights: ['700', '900'], subsets: [...subsets] });
const playfairItalic = loadPlayfair('italic', { weights: ['700', '900'], subsets: [...subsets] });
const inter = loadInter('normal', { weights: ['400', '500', '700', '900'], subsets: [...subsets] });
const mono = loadMono('normal', { weights: ['500', '700'], subsets: [...subsets] });
const anton = loadAnton('normal', { weights: ['400'], subsets: [...subsets] });
const caveat = loadCaveat('normal', { weights: ['600'], subsets: [...subsets] });

export const FONT = {
  serif: `${playfair.fontFamily}, Georgia, serif`,
  serifItalic: `${playfairItalic.fontFamily}, Georgia, serif`,
  sans: `${inter.fontFamily}, system-ui, sans-serif`,
  mono: `${mono.fontFamily}, ui-monospace, monospace`,
  display: `${anton.fontFamily}, Impact, sans-serif`,
  hand: `${caveat.fontFamily}, cursive`,
} as const;
