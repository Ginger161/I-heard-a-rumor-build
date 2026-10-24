import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from './theme';

/** Warm, high-contrast editorial grade applied to everything underneath the grain. */
export const Graded: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: 'contrast(1.12) saturate(1.08) sepia(0.08)', background: '#000' }}>{children}</AbsoluteFill>
);

/** 35mm grain, shadow halftone and a faint gate flutter, drawn over the graded programme. */
export const PostFX: React.FC = () => {
  const f = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  // grain is generated at half size and scaled up: coarser, more filmic, and 4x cheaper
  const gw = Math.round(w / 2);
  const gh = Math.round(h / 2);
  const seed = (f * 7) % 97;
  const gateX = Math.sin(f * 0.9) * 0.6;
  const gateY = Math.cos(f * 1.3) * 0.6;

  return (
    <>
      {/* halftone dots, only visible toward the frame edges / in the shadows */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at center, ${C.ink} 0 1.7px, transparent 2.2px)`,
          backgroundSize: '7px 7px',
          transform: 'rotate(15deg) scale(1.3)',
          opacity: 0.5,
          mixBlendMode: 'multiply',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, transparent 42%, #000 100%)',
          maskImage: 'radial-gradient(ellipse at 50% 50%, transparent 42%, #000 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* animated 35mm grain: feTurbulence reseeded every frame */}
      <AbsoluteFill style={{ opacity: 0.06, transform: `translate(${gateX}px, ${gateY}px)`, pointerEvents: 'none' }}>
        <svg width={gw} height={gh} viewBox={`0 0 ${gw} ${gh}`} style={{ width: w, height: h }} preserveAspectRatio="none">
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="2.4" intercept="-0.7" />
              <feFuncG type="linear" slope="2.4" intercept="-0.7" />
              <feFuncB type="linear" slope="2.4" intercept="-0.7" />
              <feFuncA type="linear" slope="0" intercept="1" />
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};
