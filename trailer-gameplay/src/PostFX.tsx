import React from 'react';
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from 'remotion';

/** Night grade: crushed blacks, a touch of cold in the shadows, and a hair of film diffusion. */
export const Graded: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: 'contrast(1.14) saturate(1.06) brightness(0.98) blur(0.4px)', background: '#000' }}>{children}</AbsoluteFill>
);

/** Lens edge softness, 35mm grain, gate flutter, and the odd dust speck / hair on the lens. */
export const PostFX: React.FC = () => {
  const f = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  const gw = Math.round(w / 2);
  const gh = Math.round(h / 2);
  const seed = (f * 7) % 97;
  const gateX = Math.sin(f * 0.9) * 0.6;
  const gateY = Math.cos(f * 1.3) * 0.6;
  const mask = 'radial-gradient(ellipse at 50% 50%, transparent 55%, #000 100%)';

  const dust = Array.from({ length: 5 }, (_, i) => {
    const life = Math.floor(f / 5);
    const on = random(`d-on-${life}-${i}`) > 0.55;
    return on ? (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: random(`dx-${life}-${i}`) * w,
          top: random(`dy-${life}-${i}`) * h,
          width: 2 + random(`ds-${life}-${i}`) * 4,
          height: 2 + random(`ds-${life}-${i}`) * 4,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.35)',
          filter: 'blur(1px)',
        }}
      />
    ) : null;
  });

  return (
    <>
      <AbsoluteFill
        style={{
          backdropFilter: 'blur(2.2px)',
          WebkitBackdropFilter: 'blur(2.2px)',
          WebkitMaskImage: mask,
          maskImage: mask,
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill style={{ opacity: 0.075, transform: `translate(${gateX}px, ${gateY}px)`, pointerEvents: 'none', mixBlendMode: 'screen' }}>
        <svg width={gw} height={gh} viewBox={`0 0 ${gw} ${gh}`} style={{ width: w, height: h }} preserveAspectRatio="none">
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="2.6" intercept="-0.8" />
              <feFuncG type="linear" slope="2.6" intercept="-0.8" />
              <feFuncB type="linear" slope="2.6" intercept="-0.8" />
              <feFuncA type="linear" slope="0" intercept="1" />
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: 'none' }}>{dust}</AbsoluteFill>
    </>
  );
};
