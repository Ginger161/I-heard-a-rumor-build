import React from 'react';
import { C } from '../theme';
import { FONT } from '../fonts';

/* ------------------------------------------------------------------ surfaces */

/** Huge flat plane laid on the stage. Pure CSS gradients so it stays cheap to rasterise. */
export const Desk: React.FC<{ kind: 'mahogany' | 'cork'; size?: number; w?: number; h?: number }> = ({ kind, size = 3200, w, h }) => {
  const bw = w ?? size;
  const bh = h ?? size;
  const base: React.CSSProperties = {
    position: 'absolute',
    left: -bw / 2,
    top: -bh / 2,
    width: bw,
    height: bh,
  };
  if (kind === 'cork') {
    return (
      <div
        style={{
          ...base,
          background: [
            'radial-gradient(circle at 20% 30%, rgba(60,34,14,.55) 0 2px, transparent 3px) 0 0/23px 19px',
            'radial-gradient(circle at 70% 60%, rgba(60,34,14,.5) 0 1.5px, transparent 2.5px) 0 0/17px 21px',
            'radial-gradient(circle at 40% 80%, rgba(255,226,170,.35) 0 2px, transparent 3px) 0 0/29px 27px',
            'radial-gradient(circle at 85% 15%, rgba(40,20,8,.45) 0 3px, transparent 4px) 0 0/41px 37px',
            'radial-gradient(circle at 55% 45%, rgba(255,214,150,.3) 0 1.5px, transparent 2.5px) 0 0/13px 15px',
            '#a8733f',
          ].join(','),
          boxShadow: 'inset 0 0 0 40px #4a2a12',
        }}
      />
    );
  }
  return (
    <div
      style={{
        ...base,
        borderRadius: w ? undefined : '50%',
        // soft edge: the desk dissolves into darkness instead of ending in a visible curved horizon
        WebkitMaskImage: w ? undefined : 'radial-gradient(circle, #000 48%, transparent 70%)',
        maskImage: w ? undefined : 'radial-gradient(circle, #000 48%, transparent 70%)',
        background: [
          // long irregular grain
          'repeating-linear-gradient(91deg, rgba(0,0,0,.30) 0 2px, transparent 2px 11px, rgba(255,150,80,.07) 11px 13px, transparent 13px 31px)',
          'repeating-linear-gradient(89deg, rgba(0,0,0,.22) 0 1px, transparent 1px 7px, rgba(255,170,100,.05) 7px 8px, transparent 8px 19px)',
          'repeating-linear-gradient(90.4deg, transparent 0 120px, rgba(0,0,0,.35) 120px 123px, transparent 123px 340px)',
          // plank seams
          'repeating-linear-gradient(0deg, transparent 0 596px, rgba(0,0,0,.65) 596px 600px)',
          'radial-gradient(ellipse at 50% 50%, #5a2c14 0%, #3b1a0b 55%, #1d0c05 100%)',
        ].join(','),
      }}
    />
  );
};

/** Pushes `children` up off the desk by z px and draws the contact shadow that tracks that height. */
export const Lift: React.FC<{
  x?: number;
  y?: number;
  z?: number;
  w: number;
  h: number;
  rot?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x = 0, y = 0, z = 0, w, h, rot = 0, shadow = true, style, children }) => {
  const soft = 10 + z * 0.06;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transformStyle: 'preserve-3d', transform: `rotateZ(${rot}deg)`, ...style }}>
      {shadow && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            filter: `blur(${soft}px)`,
            opacity: Math.max(0.25, 0.85 - z / 1400),
            transform: `translate(${6 + z * 0.1}px, ${10 + z * 0.18}px) scale(${1 + z / 2600})`,
          }}
        />
      )}
      <div style={{ position: 'absolute', inset: 0, transform: `translateZ(${Math.max(0.5, z)}px)` }}>{children}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ small props */

export const Bolt: React.FC<{ size: number; color?: string }> = ({ size, color = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
    <path d="M13.5 2 5 13.5h5.2L9 22l9-12.2h-5.4L13.5 2Z" />
  </svg>
);

export const Pushpin: React.FC<{ size?: number; color?: string }> = ({ size = 54, color = '#B91C1C' }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 40 50" style={{ overflow: 'visible' }}>
    <ellipse cx="22" cy="44" rx="11" ry="4" fill="rgba(0,0,0,.45)" />
    <rect x="18.5" y="26" width="3" height="20" rx="1.5" fill="#cfd3d8" />
    <ellipse cx="20" cy="26" rx="14" ry="6" fill={color} />
    <path d="M7 14 q13 -16 26 0 l-3 12 q-10 6 -20 0 Z" fill={color} />
    <path d="M12 14 q6 -9 14 -6" stroke="rgba(255,255,255,.55)" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

/** Embossed black Dymo label. */
export const Dymo: React.FC<{ children: React.ReactNode; size?: number; rot?: number; bg?: string; fg?: string }> = ({ children, size = 26, rot = -2, bg = C.ink, fg = C.paper }) => (
  <div
    style={{
      display: 'inline-block',
      background: bg,
      color: fg,
      fontFamily: FONT.mono,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
      padding: `${size * 0.22}px ${size * 0.55}px`,
      transform: `rotate(${rot}deg)`,
      boxShadow: '0 3px 0 rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.18)',
      borderRadius: 3,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

/** Translucent masking tape strip. */
export const Tape: React.FC<{ w?: number; rot?: number }> = ({ w = 150, rot = -4 }) => (
  <div
    style={{
      width: w,
      height: 42,
      background: 'rgba(253,230,138,.62)',
      transform: `rotate(${rot}deg)`,
      boxShadow: '0 2px 4px rgba(0,0,0,.25)',
      clipPath: 'polygon(0 8%, 4% 0, 8% 10%, 12% 0, 100% 0, 96% 12%, 100% 24%, 96% 36%, 100% 50%, 96% 62%, 100% 76%, 96% 88%, 100% 100%, 8% 100%, 4% 90%, 0 100%, 3% 60%, 0 30%)',
    }}
  />
);

/** Rubber stamp: double border, slight rotation, worn-ink speckle mask. */
export const Stamp: React.FC<{
  lines: string[];
  color?: string;
  size?: number;
  rot?: number;
  font?: 'serif' | 'sans' | 'mono';
  bg?: string;
  style?: React.CSSProperties;
}> = ({ lines, color = C.blood, size = 64, rot = -6, font = 'sans', bg, style }) => (
  <div
    style={{
      display: 'inline-block',
      transform: `rotate(${rot}deg)`,
      color,
      border: `${Math.max(4, size * 0.09)}px solid ${color}`,
      outline: `${Math.max(2, size * 0.04)}px solid ${color}`,
      outlineOffset: size * 0.1,
      padding: `${size * 0.2}px ${size * 0.42}px`,
      fontFamily: FONT[font],
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      textAlign: 'center',
      background: bg,
      WebkitMaskImage: 'radial-gradient(circle at 20% 30%, #000 0 70%, rgba(0,0,0,.82) 100%)',
      mixBlendMode: bg ? 'normal' : 'multiply',
      ...style,
    }}
  >
    {lines.map((l, i) => (
      <div key={i}>{l}</div>
    ))}
  </div>
);

/** Chromatic-split text: red/cyan ghosts whose offset is driven by `ca`. */
export const caShadow = (ca: number) => (ca > 0.3 ? `${ca}px 0 0 rgba(255,30,70,.85), ${-ca}px 0 0 rgba(0,220,255,.85)` : 'none');

/* ------------------------------------------------------------------ shards */

const SHARD_ANGLES = [0, 60, 120, 180, 240, 300];

/**
 * Glass-style geometric shards radiating from the origin. `t` is 0..1 travel (already time-remapped,
 * so slow motion is just an eased t). Positions are relative to the element's centre.
 */
export const Shards: React.FC<{ t: number; size: number; color: string; glow?: string; count?: number; spin?: number; solid?: boolean }> = ({ t, size, color, glow, count = 6, spin = 1, solid }) => {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <>
      {items.map((i) => {
        const a = ((SHARD_ANGLES[i % 6] + (i >= 6 ? 30 : 8)) * Math.PI) / 180;
        const dist = size * (0.9 + 0.5 * ((i * 37) % 5) / 4) * t;
        const rot = (i % 2 ? 1 : -1) * (30 + i * 35) * t * spin;
        const s = size * (0.34 + 0.12 * (i % 3));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: Math.cos(a) * dist - s / 2,
              top: Math.sin(a) * dist - s / 2 + 90 * t * t,
              width: s,
              height: s,
              transform: `rotate(${rot}deg) scale(${1 - t * 0.35})`,
              opacity: solid ? 1 - t * 0.2 : 1 - t * 0.55,
              background: solid ? color : `linear-gradient(135deg, ${color}, #fff7 120%)`,
              clipPath: i % 2 ? 'polygon(50% 0, 100% 90%, 0 70%)' : 'polygon(10% 0, 100% 30%, 60% 100%)',
              filter: glow ? `drop-shadow(0 0 ${size * 0.12}px ${glow})` : undefined,
            }}
          />
        );
      })}
    </>
  );
};
