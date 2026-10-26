import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CinematicRig, Cam } from '../CinematicRig';
import { useLayout } from '../layout';
import { F, sec } from '../timing';
import { clamp01, easeInOut, easeOut, mapRange, flash, decay } from '../fx';
import { ProfileCard } from '../components/ui';
import { Bokeh } from '../components/bokeh';
import { SlamText, Tag } from '../components/kinetic';
import { C } from '../theme';
import { FONT } from '../fonts';

const Reticle: React.FC<{ f: number; size: number }> = ({ f, size }) => {
  const a = sec(F.reticle);
  const lock = sec(F.lock);
  const p = easeInOut(clamp01((f - a) / (lock - a)));
  if (f < a) return null;
  const s = 1 + (1 - p) * 1.9 + decay(f, lock, 5) * 0.07;
  const rot = (1 - p) * 150;
  const col = f >= lock ? C.siren : 'rgba(255,255,255,.85)';
  const ticks = Array.from({ length: 48 }, (_, i) => i);
  const R = size / 2;
  return (
    <svg width={size} height={size} viewBox={`${-R} ${-R} ${size} ${size}`} style={{ position: 'absolute', left: -R, top: -R, overflow: 'visible', opacity: clamp01((f - a) / 10), filter: `drop-shadow(0 0 14px ${f >= lock ? 'rgba(225,29,72,.9)' : 'rgba(255,255,255,.3)'})` }}>
      <g transform={`scale(${s}) rotate(${rot})`} stroke={col} fill="none">
        <circle r={R * 0.96} strokeWidth={3} strokeDasharray="6 14" />
        <circle r={R * 0.74} strokeWidth={2.5} />
        {ticks.map((i) => (
          <line key={i} x1={0} y1={-R * 0.74} x2={0} y2={-R * (i % 4 === 0 ? 0.62 : 0.68)} strokeWidth={i % 4 === 0 ? 4 : 2} transform={`rotate(${(i / ticks.length) * 360})`} />
        ))}
      </g>
      <g stroke={col} strokeWidth={3} transform={`scale(${1 + (1 - p) * 0.6})`}>
        <line x1={-R * 1.6} y1={0} x2={-R * 0.28} y2={0} />
        <line x1={R * 0.28} y1={0} x2={R * 1.6} y2={0} />
        <line x1={0} y1={-R * 1.2} x2={0} y2={-R * 0.28} />
        <line x1={0} y1={R * 0.28} x2={0} y2={R * 1.2} />
      </g>
      {f >= lock && <circle r={14} fill={C.siren} />}
    </svg>
  );
};

/** Aimed: a calm profile, a whisper, and a reticle that was there the whole time. */
export const SceneF: React.FC = () => {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  const lock = sec(F.lock);
  const textF = sec(F.text);
  const CWd = portrait ? 880 : 700;

  const camAt = (g: number): Cam => {
    const p = mapRange(g, 0, sec(6.5), 0, 1, (x) => x);
    const lockPush = decay(g, lock, 6) * -60;
    return { tz: -200 + easeInOut(p) * 380 + lockPush, ty: portrait ? -60 : -10, tx: 0, rx: 0, ry: -2 + p * 3, rz: 0 };
  };
  const lockedAmt = f >= lock ? clamp01(1 - (f - lock) / 90) * 0.4 + 0.6 : 0;
  const t = f - textF;

  const stage = (
    <>
      <div style={{ opacity: 0.35 }}>
        <Bokeh f={f * 0.6} intensity={0.45} seed="fz" />
      </div>
      <div style={{ position: 'absolute', left: -CWd / 2, top: -CWd * 0.42, transform: 'translateZ(0px)' }}>
        <ProfileCard w={CWd} followers={41000} t={99} locked={lockedAmt} />
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${-CWd * 0.33}px, ${-CWd * 0.25}px) translateZ(30px)` }}>
        <Reticle f={f} size={CWd * 0.9} />
      </div>
    </>
  );

  const hud = (
    <>
      <AbsoluteFill style={{ padding: portrait ? '110px 70px' : '64px 84px', justifyContent: 'space-between' }}>
        <Tag size={portrait ? 28 : 24} color="#7f8ea0" style={{ opacity: clamp01((f - 20) / 20) }}>6:06 PM</Tag>
        <Tag size={portrait ? 26 : 22} color={f >= lock ? C.siren : '#7f8ea0'} style={{ opacity: clamp01((f - sec(F.reticle)) / 14) * (f >= lock && Math.floor(f / 8) % 2 ? 0.35 : 1), alignSelf: 'flex-end' }}>
          {f >= lock ? 'Locked' : 'Tracking'}
        </Tag>
      </AbsoluteFill>
      {t >= 0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at 50% 55%, rgba(2,3,5,${clamp01(t / 8) * 0.88}) 0%, rgba(2,3,5,0) 72%)` }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ opacity: clamp01(t / 6) }}>
              <Tag size={portrait ? 40 : 34} color="#fff" style={{ letterSpacing: '0.5em', marginBottom: 18 }}>You were being</Tag>
            </div>
            <SlamText text="AIMED." t={t} size={portrait ? 280 : 360} color={C.siren} glow="rgba(225,29,72,.85)" spacing={0.01} />
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: C.siren, opacity: flash(f, lock, 1, 16) * 0.55, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: '#fff', opacity: flash(f, lock, 1, 5) * 0.4, mixBlendMode: 'overlay' }} />
    </>
  );

  return (
    <CinematicRig
      id="f"
      cam={camAt(f)}
      camPrev={camAt(f - 1)}
      lamp={{ x: 0.5, y: 0.5, intensity: 0.6 + (f >= lock ? 0.35 : 0), radius: 850, tint: f >= lock ? '255,120,140' : '160,205,255' }}
      impacts={[lock]}
      glitches={[lock, lock + 7]}
      hud={hud}
      fadeIn={1}
      darkness={0.95}
      shakeAmp={1.15}
      hand={0.5}
    >
      {stage}
    </CinematicRig>
  );
};
