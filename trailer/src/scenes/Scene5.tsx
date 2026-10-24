import React from 'react';
import { random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CinematicRig } from '../CinematicRig';
import { useLayout } from '../layout';
import { C } from '../theme';
import { FONT } from '../fonts';
import { Desk, Dymo, Lift, Shards, Stamp } from '../components/props';
import { SecurityWire } from '../components/cards';
import { clamp01, lerp, mapRange, ramp } from '../fx';
import { S5, touchdowns } from '../timing';

const STAMP_CFG = { damping: 15, stiffness: 210, mass: 1.1 };
const BUBBLES = 5;

export const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, portrait, S } = useLayout();

  // stamp falls so that it first touches the desk exactly on S5.stamp
  const firstTouch = touchdowns(STAMP_CFG)[0];
  const stampDelay = S5.stamp - firstTouch;
  const sS = f < stampDelay ? 0 : spring({ frame: f - stampDelay, fps, config: STAMP_CFG });
  const stampZ = f < stampDelay ? 1400 : Math.abs(1 - sS) * 1100;
  const since = f - S5.stamp;

  // --- layout
  const wireW = (portrait ? 900 : 820) * S;
  const wirePos = portrait ? { x: 0, y: -h * 0.22 } : { x: -w * 0.24, y: -20 * S };
  const rowCenter = portrait ? { x: 0, y: h * 0.14 } : { x: w * 0.2, y: 0 };
  const gap = (portrait ? 180 : 168) * S;
  const bSize = (portrait ? 150 : 140) * S;

  // --- wire card flashes in
  const wireT = f - S5.wire;
  const wireSp = wireT < 0 ? 0 : spring({ frame: wireT, fps, config: { damping: 12, stiffness: 190, mass: 0.9 } });
  const wireZ = wireT < 0 ? 900 : Math.abs(1 - wireSp) * 700;
  const strobe = wireT >= 0 && wireT < 54 ? (Math.floor(wireT / 3) % 2 ? 0.25 : 1) : 1;
  const heat = Math.round(lerp(40, 92, ramp(f, S5.wire, S5.wire + 70)));

  // --- siren lighting: two rotating beams, opposite phase
  const sweep = (f * 5) % 360;
  const redOn = 0.5 + 0.5 * Math.sin(f / 5);
  const blueOn = 0.5 + 0.5 * Math.sin(f / 5 + Math.PI);
  const lampTint = redOn > blueOn ? '255,40,80' : '60,110,255';

  const cam = {
    rx: mapRange(f, 0, 300, 40, 28),
    rz: mapRange(f, 0, 300, -4, 3),
    tz: mapRange(f, 0, 300, -60, 150),
    ty: (portrait ? 0 : 10) * S,
  };
  const lamp = { x: portrait ? 0.5 : 0.5, y: 0.5, intensity: 0.9 + 0.2 * Math.max(redOn, blueOn), radius: 1100 * S, tint: lampTint };

  const hud = (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `conic-gradient(from ${sweep}deg at 0% 100%, rgba(225,29,72,0) 0deg, rgba(225,29,72,.75) 26deg, rgba(225,29,72,0) 62deg, rgba(225,29,72,0) 360deg)`,
          opacity: 0.1 + 0.32 * redOn,
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `conic-gradient(from ${180 - sweep}deg at 100% 100%, rgba(37,99,235,0) 0deg, rgba(37,99,235,.8) 26deg, rgba(37,99,235,0) 62deg, rgba(37,99,235,0) 360deg)`,
          opacity: 0.1 + 0.32 * blueOn,
          mixBlendMode: 'screen',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: `rgba(${lampTint},${0.015 + 0.035 * Math.max(redOn, blueOn)})`, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', left: (portrait ? 60 : 90) * S, top: (portrait ? 140 : 80) * S, opacity: Math.floor(f / 8) % 2 ? 0.55 : 1 }}>
        <Dymo size={34 * S} rot={-2} bg={C.siren}>
          Heat {heat}% // DSS closing in
        </Dymo>
      </div>
    </>
  );

  // --- spin bubbles
  const bubbles = Array.from({ length: BUBBLES }, (_, i) => {
    const bx = rowCenter.x + (i - (BUBBLES - 1) / 2) * gap;
    const pop = spring({ frame: f - (56 + i * 6), fps, config: { damping: 9, stiffness: 200, mass: 0.7 } });
    const wob = Math.sin(f / 8 + i) * 6 * S;
    return { bx, by: rowCenter.y + wob, pop: f < 56 + i * 6 ? 0 : pop, i };
  });

  // black ink splats left on the desk after the crush
  const splats = bubbles.map((b) => ({
    x: b.bx + (random(`sx${b.i}`) - 0.5) * 40 * S,
    y: b.by + (random(`sy${b.i}`) - 0.5) * 40 * S,
    r: (bSize * (0.7 + random(`sr${b.i}`) * 0.5)) / 2,
  }));

  return (
    <CinematicRig id="s5" cam={cam} lamp={lamp} impacts={[S5.wire, S5.stamp, S5.stamp + 9]} hud={hud} fadeIn={4} darkness={0.6} shakeAmp={1.2}>
      <Desk kind="mahogany" />

      {wireT >= 0 && (
        <Lift x={wirePos.x} y={wirePos.y} w={wireW} h={wireW * 0.52} z={wireZ} rot={-3}>
          <div style={{ opacity: strobe, filter: strobe < 1 ? 'brightness(1.8)' : undefined }}>
            <SecurityWire w={wireW} heat={heat} />
          </div>
        </Lift>
      )}

      {/* ink splats under the stamp */}
      {since >= 0 &&
        splats.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.x - s.r,
              top: s.y - s.r,
              width: s.r * 2,
              height: s.r * 2,
              borderRadius: '46% 54% 51% 49% / 55% 45% 55% 45%',
              background: 'radial-gradient(circle, #050505 0 55%, rgba(5,5,5,.0) 72%)',
              transform: `scale(${Math.min(1, since / 6)})`,
              opacity: 0.92,
            }}
          />
        ))}

      {/* spin bubbles waiting for their fate */}
      {since < 0 &&
        bubbles.map((b) => (
          <div key={b.i} style={{ position: 'absolute', left: b.bx - bSize / 2, top: b.by - bSize / 2, width: bSize, height: bSize, transformStyle: 'preserve-3d', transform: `translateZ(${40 * S}px) scale(${b.pop})` }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 32% 28%, #BFDBFE 0%, #3B82F6 40%, #1E3A8A 100%)',
                border: `${5 * S}px solid #1E40AF`,
                boxShadow: '0 0 40px rgba(59,130,246,.8), inset 0 -10px 18px rgba(15,23,80,.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontFamily: FONT.sans,
                fontWeight: 900,
                fontSize: bSize * 0.2,
                lineHeight: 1.05,
                textAlign: 'center',
                transform: `rotateZ(${-cam.rz}deg) rotateX(${-cam.rx}deg)`,
              }}
            >
              <span>PR</span>
              <span>SPIN</span>
            </div>
          </div>
        ))}

      {/* ink shards from the crushed bubbles */}
      {since >= 0 &&
        bubbles.map((b) => (
          <div key={b.i} style={{ position: 'absolute', left: b.bx, top: b.by, transform: 'translateZ(30px)' }}>
            <Shards t={1 - Math.exp(-since / 12)} size={bSize * 1.5} color="#050505" count={8} spin={1.6} solid />
          </div>
        ))}

      {/* the stamp */}
      <Lift x={rowCenter.x} y={rowCenter.y} w={(portrait ? 880 : 800) * S} h={(portrait ? 300 : 280) * S} z={stampZ} rot={-5} shadow>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Stamp lines={['THE SMOKING GUN', 'DOSSIER']} size={(portrait ? 64 : 58) * S} rot={0} color={C.ink} bg={C.paper} font="sans" style={{ boxShadow: `0 ${10 * S}px 0 rgba(0,0,0,.4)` }} />
        </div>
      </Lift>
      {since >= 4 && (
        <div style={{ position: 'absolute', left: rowCenter.x - 300 * S, top: rowCenter.y + (portrait ? 170 : 150) * S, width: 600 * S, textAlign: 'center', transform: `translateZ(6px) rotate(-5deg) scale(${1 + (1 - clamp01((since - 4) / 8)) * 0.6})` }}>
          <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 58 * S, color: '#fff', background: C.blood, padding: `${6 * S}px ${20 * S}px`, boxShadow: `0 ${6 * S}px 0 rgba(0,0,0,.5)` }}>−65% DOUBT</span>
        </div>
      )}
    </CinematicRig>
  );
};
