import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
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

  // the stamp falls so that it first touches the desk exactly on S5.stamp
  const firstTouch = touchdowns(STAMP_CFG)[0];
  const stampDelay = S5.stamp - firstTouch;
  const zAt = (ff: number) => (ff < stampDelay ? 1400 : Math.abs(1 - spring({ frame: ff - stampDelay, fps, config: STAMP_CFG })) * 1100);
  const stampZ = zAt(f);
  const stampBlur = Math.abs(stampZ - zAt(f - 1)) * 0.07;
  const since = f - S5.stamp;

  // --- layout
  const wireW = (portrait ? 900 : 820) * S;
  const wirePos = portrait ? { x: 0, y: -h * 0.22 } : { x: -w * 0.24, y: -20 * S };
  const rowCenter = portrait ? { x: 0, y: h * 0.14 } : { x: w * 0.2, y: 0 };
  const gap = (portrait ? 180 : 168) * S;
  const bSize = (portrait ? 150 : 140) * S;
  const stampW = (portrait ? 920 : 860) * S;
  const stampH = (portrait ? 360 : 330) * S;

  // --- wire card flashes in, then holds long enough to read
  const wireT = f - S5.wire;
  const wireSp = wireT < 0 ? 0 : spring({ frame: wireT, fps, config: { damping: 12, stiffness: 190, mass: 0.9 } });
  const wireZ = wireT < 0 ? 900 : Math.abs(1 - wireSp) * 700;
  const strobe = wireT >= 0 && wireT < 60 ? (Math.floor(wireT / 4) % 2 ? 0.3 : 1) : 1;
  const heat = Math.round(lerp(40, 92, ramp(f, S5.wire, S5.heatEnd)));

  // --- siren lighting: two rotating beams, opposite phase
  const sweep = (f * 4) % 360;
  const redOn = 0.5 + 0.5 * Math.sin(f / 6);
  const blueOn = 0.5 + 0.5 * Math.sin(f / 6 + Math.PI);
  const lampTint = redOn > blueOn ? '255,40,80' : '60,110,255';

  const camAt = (ff: number) => ({
    rx: mapRange(ff, 0, 450, 40, 28) + Math.sin(ff / 100) * 0.8,
    rz: mapRange(ff, 0, 450, -4, 3) + Math.sin(ff / 140) * 0.8,
    tz: mapRange(ff, 0, 450, -60, 170) + Math.sin(ff / 85) * 9,
    ty: (portrait ? 0 : 10) * S,
    tx: Math.sin(ff / 120) * 12 * S,
  });
  const cam = camAt(f);
  const lamp = { x: 0.5, y: 0.5, intensity: 0.9 + 0.2 * Math.max(redOn, blueOn), radius: 1100 * S, tint: lampTint };

  const hud = (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `conic-gradient(from ${sweep}deg at 0% 100%, rgba(225,29,72,0) 0deg, rgba(225,29,72,.75) 26deg, rgba(225,29,72,0) 62deg, rgba(225,29,72,0) 360deg)`, opacity: 0.1 + 0.32 * redOn, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', inset: 0, background: `conic-gradient(from ${180 - sweep}deg at 100% 100%, rgba(37,99,235,0) 0deg, rgba(37,99,235,.8) 26deg, rgba(37,99,235,0) 62deg, rgba(37,99,235,0) 360deg)`, opacity: 0.1 + 0.32 * blueOn, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', inset: 0, background: `rgba(${lampTint},${0.015 + 0.035 * Math.max(redOn, blueOn)})`, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', left: (portrait ? 60 : 90) * S, top: (portrait ? 140 : 80) * S, opacity: Math.floor(f / 10) % 2 ? 0.6 : 1 }}>
        <Dymo size={34 * S} rot={-2} bg={C.siren}>
          Heat {heat}% // DSS closing in
        </Dymo>
      </div>
    </>
  );

  // --- spin bubbles waiting for their fate
  const bubbles = Array.from({ length: BUBBLES }, (_, i) => {
    const bx = rowCenter.x + (i - (BUBBLES - 1) / 2) * gap;
    const born = S5.bubble + i * 9;
    const pop = f < born ? 0 : spring({ frame: f - born, fps, config: { damping: 9, stiffness: 200, mass: 0.7 } });
    const wob = Math.sin(f / 10 + i * 1.3) * 7 * S;
    return { bx, by: rowCenter.y + wob, pop, i };
  });

  const inkFade = 1 - ramp(since, 50, 150); // flakes dissolve instead of lingering as stray shapes

  return (
    <CinematicRig id="s5" cam={cam} camPrev={camAt(f - 1)} lamp={lamp} impacts={[S5.wire, S5.stamp, S5.stamp + 10]} hud={hud} fadeIn={4} darkness={0.6} shakeAmp={1.2}>
      <Desk kind="mahogany" />

      {wireT >= 0 && (
        <Lift x={wirePos.x} y={wirePos.y} w={wireW} h={wireW * 0.52} z={wireZ} rot={-3 + Math.sin(f / 90) * 0.5} radius={10}>
          <div style={{ opacity: strobe, filter: strobe < 1 ? 'brightness(1.8)' : undefined }}>
            <SecurityWire w={wireW} heat={heat} />
          </div>
        </Lift>
      )}

      {/* the spin bubbles, billboarded so they read as spheres */}
      {since < 0 &&
        bubbles.map((b) => (
          <div key={b.i} style={{ position: 'absolute', left: b.bx - bSize / 2, top: b.by - bSize / 2, width: bSize, height: bSize, transformStyle: 'preserve-3d', transform: `translateZ(${40 * S}px) scale(${b.pop})` }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 32% 28%, #DBEAFE 0%, #3B82F6 40%, #1E3A8A 100%)',
                border: `${5 * S}px solid #1E40AF`,
                boxShadow: '0 0 40px rgba(59,130,246,.7), inset 0 -10px 18px rgba(15,23,80,.6), inset 0 8px 14px rgba(255,255,255,.35)',
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

      {/* ink: one stain under the stamp, plus flakes that burst out and dissolve */}
      {since >= 0 && (
        <>
          <div
            style={{
              position: 'absolute',
              left: rowCenter.x - stampW * 0.5,
              top: rowCenter.y - stampH * 0.46,
              width: stampW,
              height: stampH * 0.92,
              borderRadius: '46% 54% 48% 52% / 58% 46% 54% 42%',
              background: 'radial-gradient(ellipse, #040404 0 58%, rgba(4,4,4,.0) 78%)',
              transform: `translateZ(0.4px) scale(${0.4 + 0.6 * Math.min(1, since / 8)})`,
              filter: 'blur(3px)',
              opacity: 0.9,
            }}
          />
          <div style={{ opacity: inkFade }}>
            {bubbles.map((b) => (
              <div key={b.i} style={{ position: 'absolute', left: b.bx, top: b.by, transform: 'translateZ(30px)' }}>
                <Shards t={1 - Math.exp(-since / 16)} size={bSize * 1.5} color="#050505" count={8} spin={1.4} ink />
              </div>
            ))}
          </div>
        </>
      )}

      {/* the stamp */}
      <Lift x={rowCenter.x} y={rowCenter.y} w={stampW} h={stampH} z={stampZ} rot={-5} radius={10} blur={stampBlur}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Stamp lines={['THE SMOKING GUN', 'DOSSIER']} sub="(−65% DOUBT)" size={(portrait ? 62 : 56) * S} rot={0} color={C.ink} bg={C.paper} font="sans" style={{ boxShadow: `0 ${12 * S}px ${30 * S}px rgba(0,0,0,.45)` }} />
        </div>
      </Lift>
    </CinematicRig>
  );
};
