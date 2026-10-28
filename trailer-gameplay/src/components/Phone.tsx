import React from 'react';
import { OffthreadVideo, staticFile, useVideoConfig } from 'remotion';
import { CLIP } from '../timing';

export type ClipKey = keyof typeof CLIP;
export const SCREEN_RATIO = 880 / 1800; // the recorded take: 440x900 CSS px at 2x

type PhoneProps = {
  clip: ClipKey;
  /** seconds into the take where this scene's footage starts (defaults to CLIP[clip].start) */
  from?: number;
  /** frames into the scene (so the footage restarts with the scene) */
  t: number;
  /** playback speed of the footage */
  rate?: number;
  /** screen height in design px (short side of the frame = 1080) */
  h: number;
  /** placement inside the 3D stage, relative to the stage origin (screen centre) */
  x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number;
  opacity?: number;
  /** extra brightness boost on the footage (the game is bright paper: it needs to sit in a dark room) */
  dim?: number;
  /** 0..1 light sweep across the glass */
  glare?: number;
  tint?: string;
  loop?: boolean;
};

/**
 * A physical phone floating in 3D: stainless frame with real thickness (stacked slabs), a bezel, a glass glare and the
 * recorded gameplay playing on the screen. The take plays at the scene's local time, so footage and callouts stay in sync.
 */
export const Phone: React.FC<PhoneProps> = ({ clip, from, t, rate = 1, h, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, opacity = 1, dim = 1, glare = 0.5, tint = '#9fb4cc', loop = false }) => {
  const { fps, width, height } = useVideoConfig();
  const S = Math.min(width, height) / 1080;
  const c = CLIP[clip];
  const startSec = from ?? c.start;
  const sh = h * S;
  const sw = sh * SCREEN_RATIO;
  const bez = 22 * S;
  const bw = sw + bez * 2;
  const bh = sh + bez * 2;
  const rad = 74 * S;
  const depth = 15 * S;
  const slabs = 7;

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d', transform: `translate3d(${x * S}px, ${y * S}px, ${z * S}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`, opacity }}>
      {/* soft contact shadow on the surface under the phone */}
      <div style={{ position: 'absolute', left: -bw * 0.62, top: -bh * 0.5, width: bw * 1.24, height: bh, borderRadius: rad * 1.5, background: 'rgba(0,0,0,0.85)', filter: `blur(${70 * S}px)`, transform: `translateZ(${-260 * S}px) scale(0.92)` }} />
      {/* thickness: slabs behind the glass */}
      {Array.from({ length: slabs }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: -bw / 2, top: -bh / 2, width: bw, height: bh, borderRadius: rad, background: i === 0 ? '#0b0d11' : `rgb(${58 - i * 5}, ${64 - i * 5}, ${74 - i * 5})`, transform: `translateZ(${-(i * depth) / slabs}px)` }} />
      ))}
      {/* front face: frame, bezel, screen */}
      <div style={{ position: 'absolute', left: -bw / 2, top: -bh / 2, width: bw, height: bh, borderRadius: rad, background: 'linear-gradient(145deg, #3a4150, #12151b 45%, #2b313d)', boxShadow: `inset 0 0 0 ${3 * S}px rgba(255,255,255,0.14), 0 0 ${60 * S}px rgba(120,160,220,0.12)`, transform: 'translateZ(0px)' }}>
        <div style={{ position: 'absolute', left: bez, top: bez, width: sw, height: sh, borderRadius: rad - bez * 0.55, overflow: 'hidden', background: '#000' }}>
          <OffthreadVideo
            src={staticFile(`takes/${c.take}.mp4`)}
            startFrom={Math.round(startSec * fps)}
            playbackRate={rate}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${0.9 * dim}) contrast(1.04) saturate(1.05)` }}
          />
          {/* glass: faint cool tint, a diagonal glare band that slides with `glare`, and screen-edge falloff */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0) ${20 + glare * 40}%, rgba(255,255,255,0.16) ${30 + glare * 40}%, rgba(255,255,255,0) ${42 + glare * 40}%)`, mixBlendMode: 'screen' }} />
          <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${60 * S}px rgba(0,0,0,0.38)`, background: `linear-gradient(180deg, ${tint}12, transparent 30%)` }} />
        </div>
        {/* dynamic island */}
        <div style={{ position: 'absolute', left: '50%', top: bez + 14 * S, width: 96 * S, height: 26 * S, marginLeft: -48 * S, borderRadius: 20 * S, background: '#030405', opacity: 0.0 }} />
      </div>
      {loop && null}
    </div>
  );
};
