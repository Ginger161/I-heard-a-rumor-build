import React from 'react';
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp01, easeOut, energy, handheld, decay } from './fx';

export type Cam = { tx?: number; ty?: number; tz?: number; rx?: number; ry?: number; rz?: number };
export type Lamp = { x: number; y: number; intensity?: number; radius?: number; tint?: string };

type RigProps = {
  /** unique per scene: SVG filter ids must not collide */
  id: string;
  cam: Cam;
  /** the same camera one frame earlier: the difference drives directional motion blur */
  camPrev?: Cam;
  lamp: Lamp;
  /** local frames where something heavy lands: drives shake + chromatic aberration burst */
  impacts?: number[];
  /** screen-space layer (type, counters, foreground cards) drawn above the 3D stage */
  hud?: React.ReactNode;
  /** frames of whip-pan entry (lateral smear + slide); 0 = none */
  whipIn?: number;
  fadeIn?: number;
  /** depth-of-field blur applied to the 3D stage only (px) */
  stageBlur?: number;
  /** extra darkness outside the lamp pool, 0..1 */
  darkness?: number;
  shakeAmp?: number;
  /** handheld drift amount (0 = locked off) */
  hand?: number;
  /** multiplier on directional motion blur (1 = default) */
  mbScale?: number;
  /** local frames where the picture tears (slice displacement + RGB split) */
  glitches?: number[];
  /** 0..1 white/colour flash drawn over everything */
  flashColor?: string;
  children: React.ReactNode;
};

/**
 * Reusable cinematography rig: perspective: 1400px + preserve-3d stage driven by a camera
 * (rotateX/Y/Z, translateX/Y/Z), a lamp that tracks the focal point, a deep vignette, and impact
 * response (camera shake + RGB split). Colour grade / grain / halftone live in <PostFX/> on top.
 */
export const CinematicRig: React.FC<RigProps> = ({
  id,
  cam,
  camPrev,
  lamp,
  impacts = [],
  hud,
  whipIn = 0,
  fadeIn = 8,
  stageBlur = 0,
  darkness = 0.7,
  shakeAmp = 1,
  hand = 0.8,
  mbScale = 1,
  glitches = [],
  children,
}) => {
  const f = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  const S = Math.min(w, h) / 1080;

  const e = energy(f, impacts);
  const jx = (random(`jx${id}${f}`) - 0.5) * 2;
  const jy = (random(`jy${id}${f}`) - 0.5) * 2;
  const jr = (random(`jr${id}${f}`) - 0.5) * 2;
  const amp = 30 * S * shakeAmp;

  const whipP = whipIn > 0 ? clamp01(f / whipIn) : 1;
  const whipEase = easeOut(whipP);
  const whipX = (1 - whipEase) * w * 1.3;
  const whipBlur = whipIn > 0 ? Math.pow(1 - whipP, 1.6) * 90 : 0;

  const hh = handheld(f, id.length * 1.7, hand * S);
  const gl = Math.min(1, glitches.reduce((a, g) => a + decay(f, g, 4), 0));
  const tx = (cam.tx ?? 0) + jx * e * amp + whipX + hh.x;
  const ty = (cam.ty ?? 0) + jy * e * amp + hh.y;
  const tz = (cam.tz ?? 0) + e * 28;
  const rx = (cam.rx ?? 0) + jy * e * 0.5;
  const ry = (cam.ry ?? 0) + jx * e * 0.4;
  const rz = (cam.rz ?? 0) + jr * e * 0.7 + hh.r;

  // motion blur: smear along the direction the camera (and any impact shake) is travelling
  const pv = camPrev ?? cam;
  const d = (k: keyof Cam) => Math.abs((cam[k] ?? 0) - (pv[k] ?? 0));
  const shakeSmear = e * amp * 0.22;
  const mbx = mbScale * Math.min(18 * S, (d('tx') + d('rz') * 9 * S + d('ry') * 14 * S) * 0.5 + d('tz') * 0.05 + shakeSmear);
  const mby = mbScale * Math.min(18 * S, (d('ty') + d('rx') * 14 * S) * 0.5 + d('tz') * 0.05 + shakeSmear);
  const mb = mbx > 0.35 || mby > 0.35;

  const ca = Math.max(0, e - 0.12) * 7.5 * S + gl * 9 * S;
  const filters: string[] = [];
  if (ca > 0.4) filters.push(`url(#ca-${id})`);
  if (whipBlur > 0.6) filters.push(`url(#whip-${id})`);
  if (gl > 0.05) filters.push(`url(#gl-${id})`);

  const I = lamp.intensity ?? 1;
  const R = (lamp.radius ?? 950) * S;
  const lx = `${lamp.x * 100}%`;
  const ly = `${lamp.y * 100}%`;
  const tint = lamp.tint ?? '255,214,150';

  const fade = clamp01(f / fadeIn);

  return (
    <AbsoluteFill style={{ background: '#050403', opacity: fade, filter: filters.join(' ') || undefined }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          {/* RGB split: red channel shoved right, blue left, green stays */}
          <filter id={`ca-${id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
            <feOffset in="r" dx={ca} dy={0} result="ro" />
            <feOffset in="b" dx={-ca} dy={0} result="bo" />
            <feBlend in="ro" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="bo" mode="screen" />
          </filter>
          <filter id={`gl-${id}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0006 0.07" numOctaves={1} seed={f % 23} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={gl * 140 * S} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`mb-${id}`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={`${mbx} ${mby}`} />
          </filter>
          <filter id={`whip-${id}`} x="-20%" y="-5%" width="140%" height="110%">
            <feGaussianBlur stdDeviation={`${whipBlur} 0`} />
          </filter>
        </defs>
      </svg>

      {/* 3D stage: origin sits at the screen centre */}
      <AbsoluteFill
        style={{
          perspective: 1400,
          perspectiveOrigin: '50% 50%',
          filter: [mb ? `url(#mb-${id})` : "", stageBlur > 0.2 ? `blur(${stageBlur}px)` : ""].filter(Boolean).join(" ") || undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 0,
            height: 0,
            transformStyle: 'preserve-3d',
            transform: `translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
          }}
        >
          {children}
        </div>
      </AbsoluteFill>

      {/* Lamp pool: darkens everything outside the focal point, then a warm overlay-blended hotspot */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${lx} ${ly}, rgba(0,0,0,0) 0, rgba(0,0,0,0) ${R * 0.28}px, rgba(0,0,0,${darkness * (1.25 - I * 0.25)}) ${R * 1.35}px)`,
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${lx} ${ly}, rgba(${tint},${0.62 * I}) 0%, rgba(${tint},${0.24 * I}) ${R * 0.3}px, rgba(${tint},0) ${R * 0.9}px)`,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />

      {hud && (
        <AbsoluteFill style={{ transform: `translate(${jx * e * amp * 0.5 + whipX * 0.3}px, ${jy * e * amp * 0.5}px)` }}>{hud}</AbsoluteFill>
      )}

      {/* deep cinematic vignette */}
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 180px rgba(0,0,0,0.85)', pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
