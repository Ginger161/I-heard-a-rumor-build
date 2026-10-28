import React from 'react';
import { random } from 'remotion';
import { FONT } from '../fonts';
import { C } from '../theme';
import { clamp01, easeOut } from '../fx';

/** Reveal `text` progressively; the cursor block is optional. */
export const typed = (text: string, p: number) => text.slice(0, Math.round(text.length * clamp01(p)));

/**
 * Slam-in headline. `t` = frames since it appeared. It arrives oversized and blurred, snaps to size with a
 * little overshoot, carries red/cyan ghosts for the first few frames, then settles with a slow creep.
 */
export const SlamText: React.FC<{
  text: string;
  t: number;
  size: number;
  color?: string;
  font?: 'display' | 'serif' | 'mono' | 'sans';
  spacing?: number;
  glow?: string;
  style?: React.CSSProperties;
  stroke?: string;
}> = ({ text, t, size, color = '#fff', font = 'display', spacing = 0.02, glow, style, stroke }) => {
  if (t < 0) return null;
  const p = easeOut(clamp01(t / 9));
  const over = t < 9 ? 1 + (1 - p) * 0.55 : 1 + Math.min(0.03, (t - 9) * 0.0006); // slow creep after the slam
  const blur = (1 - p) * 16;
  const ca = Math.max(0, 1 - t / 11) * 9;
  const sp = spacing + (1 - p) * 0.22;
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: FONT[font],
        fontSize: size,
        lineHeight: 1,
        letterSpacing: `${sp}em`,
        color,
        transform: `scale(${over})`,
        filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
        opacity: clamp01(t / 2),
        textShadow: [ca > 0.5 ? `${ca}px 0 0 rgba(255,30,70,.9), ${-ca}px 0 0 rgba(0,220,255,.9)` : '', glow ? `0 0 ${size * 0.35}px ${glow}` : ''].filter(Boolean).join(',') || undefined,
        WebkitTextStroke: stroke ? `2px ${stroke}` : undefined,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Text that jitters and tears horizontally for a few frames (a corrupted signal). */
export const GlitchText: React.FC<{ text: string; f: number; size: number; color?: string; font?: 'display' | 'mono' | 'sans' | 'serif'; amount?: number }> = ({ text, f, size, color = '#fff', font = 'mono', amount = 1 }) => {
  const k = Math.floor(f / 2);
  const off = (random(`gx${k}`) - 0.5) * 24 * amount;
  const cut = 20 + random(`gc${k}`) * 50;
  const base: React.CSSProperties = { fontFamily: FONT[font], fontSize: size, lineHeight: 1, color, whiteSpace: 'nowrap', position: 'absolute', left: 0, top: 0 };
  return (
    <div style={{ position: 'relative', fontFamily: FONT[font], fontSize: size, lineHeight: 1, whiteSpace: 'nowrap' }}>
      <span style={{ opacity: 0 }}>{text}</span>
      <div style={{ ...base, clipPath: `inset(0 0 ${100 - cut}% 0)`, transform: `translateX(${off}px)` }}>{text}</div>
      <div style={{ ...base, clipPath: `inset(${cut}% 0 0 0)`, transform: `translateX(${-off * 0.6}px)` }}>{text}</div>
      <div style={{ ...base, color: 'rgba(255,30,70,.7)', mixBlendMode: 'screen', transform: `translateX(${3 * amount}px)` }}>{text}</div>
      <div style={{ ...base, color: 'rgba(0,220,255,.7)', mixBlendMode: 'screen', transform: `translateX(${-3 * amount}px)` }}>{text}</div>
    </div>
  );
};

/** Small tracked mono label: timestamps, locations, status lines. */
export const Tag: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 26, color = C.glow, style }) => (
  <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: size, letterSpacing: '0.28em', color, textTransform: 'uppercase', whiteSpace: 'nowrap', ...style }}>{children}</div>
);

/** A line that reveals left-to-right behind a moving mask edge. */
export const WipeText: React.FC<{ children: React.ReactNode; p: number; style?: React.CSSProperties }> = ({ children, p, style }) => {
  const e = easeOut(clamp01(p));
  return (
    <div style={{ ...style, clipPath: `inset(0 ${100 - e * 100}% 0 0)`, opacity: clamp01(p * 6) }}>{children}</div>
  );
};
