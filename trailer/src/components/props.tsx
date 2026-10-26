import React from 'react';
import { random } from 'remotion';
import { C } from '../theme';
import { FONT } from '../fonts';
import { CORK_TEX, WOOD_TEX } from '../texture';

/* ------------------------------------------------------------------ surfaces */

/** Big flat plane laid on the stage. Gradients plus a tiled grain texture keep it cheap to rasterise. */
export const Desk: React.FC<{ kind: 'mahogany' | 'cork'; size?: number; w?: number; h?: number }> = ({ kind, size = 3200, w, h }) => {
  const bw = w ?? size;
  const bh = h ?? size;
  const base: React.CSSProperties = { position: 'absolute', left: -bw / 2, top: -bh / 2, width: bw, height: bh };
  if (kind === 'cork') {
    return (
      <div
        style={{
          ...base,
          background: [
            CORK_TEX,
            'radial-gradient(ellipse at 50% 40%, rgba(255,214,150,.18), transparent 70%)',
            '#a8733f',
          ].join(','),
          boxShadow: 'inset 0 0 120px rgba(60,30,10,.55)',
        }}
      />
    );
  }
  return (
    <div
      style={{
        ...base,
        borderRadius: w ? undefined : '50%',
        // the desk dissolves into darkness instead of ending in a visible curved horizon
        WebkitMaskImage: w ? undefined : 'radial-gradient(circle, #000 48%, transparent 70%)',
        maskImage: w ? undefined : 'radial-gradient(circle, #000 48%, transparent 70%)',
        background: [
          WOOD_TEX,
          'repeating-linear-gradient(91deg, rgba(0,0,0,.22) 0 2px, transparent 2px 13px, rgba(255,150,80,.05) 13px 15px, transparent 15px 37px)',
          'repeating-linear-gradient(0deg, transparent 0 596px, rgba(0,0,0,.55) 596px 600px)',
          'radial-gradient(ellipse at 50% 50%, #5a2c14 0%, #3b1a0b 55%, #1d0c05 100%)',
        ].join(','),
        backgroundSize: '1024px 1024px, auto, auto, auto',
      }}
    />
  );
};

/** Lifts `children` off the desk by z px and draws a soft contact shadow that spreads with height. */
export const Lift: React.FC<{
  x?: number;
  y?: number;
  z?: number;
  w: number;
  h: number;
  rot?: number;
  shadow?: boolean;
  radius?: number;
  /** px/frame the object is travelling vertically: becomes motion blur on the card itself */
  blur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x = 0, y = 0, z = 0, w, h, rot = 0, shadow = true, radius = 6, blur = 0, style, children }) => {
  const soft = 14 + z * 0.09;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transformStyle: 'preserve-3d', transform: `rotateZ(${rot}deg)`, ...style }}>
      {shadow && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radius,
            background: 'rgba(0,0,0,0.7)',
            filter: `blur(${soft}px)`,
            opacity: Math.max(0.28, 0.85 - z / 1500),
            transform: `translate(${5 + z * 0.1}px, ${9 + z * 0.17}px) scale(${1 + z / 2800})`,
          }}
        />
      )}
      <div style={{ position: 'absolute', inset: 0, transform: `translateZ(${Math.max(1.5, z)}px)`, filter: blur > 0.4 ? `blur(${Math.min(blur, 9)}px)` : undefined }}>{children}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ small props */

export const Bolt: React.FC<{ size: number; color?: string }> = ({ size, color = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
    <path d="M13.5 2 5 13.5h5.2L9 22l9-12.2h-5.4L13.5 2Z" strokeLinejoin="round" stroke={color} strokeWidth="1.2" />
  </svg>
);

export const Pushpin: React.FC<{ size?: number; color?: string }> = ({ size = 54, color = '#B91C1C' }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 40 50" style={{ overflow: 'visible' }}>
    <defs>
      <radialGradient id="pinhead" cx="35%" cy="28%" r="75%">
        <stop offset="0" stopColor="#fff" stopOpacity=".75" />
        <stop offset=".25" stopColor={color} />
        <stop offset="1" stopColor="#4a0a0a" />
      </radialGradient>
    </defs>
    <ellipse cx="22" cy="44" rx="11" ry="4" fill="rgba(0,0,0,.4)" />
    <rect x="18.5" y="26" width="3" height="20" rx="1.5" fill="#cfd3d8" />
    <ellipse cx="20" cy="26" rx="14" ry="6" fill={color} />
    <path d="M7 14 q13 -16 26 0 l-3 12 q-10 6 -20 0 Z" fill="url(#pinhead)" />
  </svg>
);

/** Embossed black Dymo label: rounded, slightly rough-edged, with a lit top edge. */
export const Dymo: React.FC<{ children: React.ReactNode; size?: number; rot?: number; bg?: string; fg?: string }> = ({ children, size = 26, rot = -2, bg = C.ink, fg = C.paper }) => (
  <div
    style={{
      display: 'inline-block',
      background: `linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,0) 40%), ${bg}`,
      color: fg,
      fontFamily: FONT.mono,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
      padding: `${size * 0.24}px ${size * 0.6}px`,
      transform: `rotate(${rot}deg)`,
      boxShadow: '0 4px 10px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.2)',
      borderRadius: size * 0.22,
      whiteSpace: 'nowrap',
      textShadow: '0 -1px 0 rgba(0,0,0,.55), 0 1px 0 rgba(255,255,255,.12)',
      filter: 'url(#rough)',
    }}
  >
    {children}
  </div>
);

/** Translucent masking tape strip with slightly ragged ends. */
export const Tape: React.FC<{ w?: number; rot?: number }> = ({ w = 150, rot = -4 }) => (
  <div
    style={{
      width: w,
      height: 42,
      background: 'linear-gradient(180deg, rgba(253,236,160,.7), rgba(240,214,120,.6))',
      transform: `rotate(${rot}deg)`,
      boxShadow: '0 2px 6px rgba(0,0,0,.3)',
      clipPath: 'polygon(0 8%, 3% 0, 7% 10%, 12% 0, 100% 0, 96% 12%, 100% 24%, 96% 36%, 100% 50%, 96% 62%, 100% 76%, 96% 88%, 100% 100%, 8% 100%, 4% 90%, 0 100%, 3% 60%, 0 30%)',
    }}
  />
);

/** Rubber stamp: double border, worn ink, wobbly edges, rounded corners. */
export const Stamp: React.FC<{
  lines: string[];
  color?: string;
  size?: number;
  rot?: number;
  font?: 'serif' | 'sans' | 'mono';
  bg?: string;
  /** smaller trailing line, e.g. "(−65% DOUBT)" */
  sub?: string;
  style?: React.CSSProperties;
}> = ({ lines, color = C.blood, size = 64, rot = -6, font = 'sans', bg, sub, style }) => (
  <div
    style={{
      display: 'inline-block',
      transform: `rotate(${rot}deg)`,
      color,
      border: `${Math.max(4, size * 0.09)}px solid ${color}`,
      outline: `${Math.max(2, size * 0.04)}px solid ${color}`,
      outlineOffset: size * 0.1,
      borderRadius: size * 0.16,
      padding: `${size * 0.2}px ${size * 0.42}px`,
      fontFamily: FONT[font],
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      textAlign: 'center',
      background: bg,
      filter: bg ? 'url(#rough)' : 'url(#ink)',
      mixBlendMode: bg ? 'normal' : 'multiply',
      ...style,
    }}
  >
    <div style={{ filter: bg ? 'url(#ink)' : undefined }}>
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
      {sub && <div style={{ fontFamily: FONT.mono, fontSize: size * 0.5, marginTop: size * 0.18, letterSpacing: 0 }}>{sub}</div>}
    </div>
  </div>
);

/** Chromatic-split text: red/cyan ghosts whose offset is driven by `ca`. */
export const caShadow = (ca: number) => (ca > 0.3 ? `${ca}px 0 0 rgba(255,30,70,.85), ${-ca}px 0 0 rgba(0,220,255,.85)` : 'none');

/* ------------------------------------------------------------------ fragments */

// irregular 5-7 point polygons, built once per index so every fragment is a different shape
const poly = (i: number) => {
  const n = 5 + (i % 3);
  const pts: string[] = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + (random(`fa${i}${k}`) - 0.5) * 0.7;
    const r = 0.38 + random(`fr${i}${k}`) * 0.12 + (k % 2 ? 0 : 0.1);
    pts.push(`${(50 + Math.cos(a) * r * 100).toFixed(1)}% ${(50 + Math.sin(a) * r * 100).toFixed(1)}%`);
  }
  return `polygon(${pts.join(',')})`;
};

/**
 * Fragments radiating from the origin. `t` is 0..1 travel (already time-remapped, so slow motion is just an
 * eased t). `ink` makes them matte black flakes; otherwise they are glassy, lit shards with a soft glow.
 * Each one is a different irregular shape, blurred a hair so nothing is razor-sharp.
 */
export const Shards: React.FC<{ t: number; size: number; color: string; glow?: string; count?: number; spin?: number; ink?: boolean }> = ({ t, size, color, glow, count = 6, spin = 1, ink }) => {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <>
      {items.map((i) => {
        const a = (i / count) * Math.PI * 2 + (random(`sa${i}`) - 0.5) * 0.9;
        const reach = 0.55 + random(`sd${i}`) * 0.75;
        const dist = size * reach * t;
        const rot = (random(`sr${i}`) - 0.5) * 420 * t * spin;
        const s = size * (ink ? 0.12 + random(`ss${i}`) * 0.16 : 0.22 + random(`ss${i}`) * 0.2);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: Math.cos(a) * dist - s / 2,
              top: Math.sin(a) * dist - s / 2 + 70 * t * t,
              width: s,
              height: s,
              transform: `rotate(${rot}deg) scale(${1 - t * 0.3})`,
              opacity: ink ? 1 - t * 0.15 : 1 - t * 0.6,
              clipPath: poly(i),
              background: ink
                ? 'radial-gradient(circle at 35% 30%, #2a2a2a, #050505 70%)'
                : `linear-gradient(${120 + i * 30}deg, #fff9 0%, ${color} 38%, ${color} 62%, #fff4 100%)`,
              filter: `blur(${0.6 + t * 1.2}px)${glow ? ` drop-shadow(0 0 ${size * 0.1}px ${glow})` : ''}`,
            }}
          />
        );
      })}
    </>
  );
};

/** Slow rising specks in a lamp's light cone: a little life in the air. */
export const Dust: React.FC<{ frame: number; w: number; h: number; count?: number }> = ({ frame, w, h, count = 26 }) => (
  <>
    {Array.from({ length: count }, (_, i) => {
      const x0 = random(`dx${i}`) * w;
      const y0 = random(`dy${i}`) * h;
      const sp = 0.12 + random(`dv${i}`) * 0.28;
      const r = 1.2 + random(`dr${i}`) * 2.6;
      const x = x0 + Math.sin(frame / (70 + i * 3) + i) * 26;
      const y = (y0 - frame * sp + h * 4) % h;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            background: 'rgba(255,236,200,.8)',
            opacity: 0.12 + 0.28 * random(`do${i}`) * (0.6 + 0.4 * Math.sin(frame / 25 + i)),
            filter: `blur(${0.6 + random(`db${i}`) * 1.2}px)`,
          }}
        />
      );
    })}
  </>
);
