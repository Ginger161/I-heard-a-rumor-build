import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';

// Fonts are bundled in public/fonts (downloaded once from Google Fonts), so a render never needs the network.
// fonts.css declares every subset; document.fonts.load() then pulls the ones we actually use, including
// latin-ext, which carries the naira sign (U+20A6).
const NEEDED = [
  '900 64px "Playfair Display"',
  '700 64px "Playfair Display"',
  'italic 700 64px "Playfair Display"',
  '500 24px "Inter"',
  '700 24px "Inter"',
  '900 24px "Inter"',
  '500 24px "JetBrains Mono"',
  '700 24px "JetBrains Mono"',
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading bundled fonts', { timeoutInMilliseconds: 60000 });
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = staticFile('fonts/fonts.css');
  link.onload = () => {
    Promise.all(NEEDED.map((f) => document.fonts.load(f, 'Aa0₦')))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch((e) => cancelRender(e));
  };
  link.onerror = () => cancelRender(new Error('Could not load public/fonts/fonts.css'));
  document.head.appendChild(link);
}

export const FONT = {
  serif: '"Playfair Display", Georgia, serif',
  serifItalic: '"Playfair Display", Georgia, serif',
  sans: '"Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;
