import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from './theme';

/**
 * Warm, high-contrast editorial grade. The tiny blur is deliberate "film diffusion": it takes the
 * razor edge off vector shapes and type so the picture reads as photographed, not drawn.
 */
export const Graded: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: 'contrast(1.12) saturate(1.08) sepia(0.08) blur(0.45px)', background: '#000' }}>{children}</AbsoluteFill>
);

/** Lens edge softness, halftone in the shadows, 35mm grain and a faint gate flutter. */
export const PostFX: React.FC = () => {
  const f = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  // grain is generated at half size and scaled up: coarser, more filmic, and 4x cheaper
  const gw = Math.round(w / 2);
  const gh = Math.round(h / 2);
  const seed = (f * 7) % 97;
  const gateX = Math.sin(f * 0.9) * 0.6;
  const gateY = Math.cos(f * 1.3) * 0.6;
  const mask = 'radial-gradient(ellipse at 50% 50%, transparent 52%, #000 100%)';

  return (
    <>
      {/* soft-focus falloff toward the frame edges, like a fast vintage lens */}
      <AbsoluteFill
        style={{
          backdropFilter: 'blur(2.4px)',
          WebkitBackdropFilter: 'blur(2.4px)',
          WebkitMaskImage: mask,
          maskImage: mask,
          pointerEvents: 'none',
        }}
      />
      {/* halftone dots, only visible toward the frame edges / in the shadows */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at center, ${C.ink} 0 1.6px, transparent 2.3px)`,
          backgroundSize: '7px 7px',
          transform: 'rotate(15deg) scale(1.3)',
          opacity: 0.32,
          mixBlendMode: 'multiply',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, transparent 46%, #000 100%)',
          maskImage: 'radial-gradient(ellipse at 50% 50%, transparent 46%, #000 100%)',
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
