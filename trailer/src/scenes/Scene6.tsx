import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CinematicRig } from '../CinematicRig';
import { useLayout } from '../layout';
import { C } from '../theme';
import { FONT } from '../fonts';
import { Dymo } from '../components/props';
import { TabloidPage } from '../components/cards';
import { clamp01, mapRange, ramp } from '../fx';
import { S6 } from '../timing';

export const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, portrait, S } = useLayout();

  // flash-bulb: hard white, fast exponential decay, with a warm afterglow
  const flash = Math.exp(-f / 9);
  const afterglow = Math.exp(-f / 40) * 0.35;

  const st = f - S6.stamp;
  const sp = st < 0 ? 0 : spring({ frame: st, fps, config: { damping: 11, stiffness: 320, mass: 0.8 } });
  const pageW = w * 1.1;
  const pageH = h * 1.1;

  const cam = {
    rx: mapRange(f, 0, 240, 5, -1),
    ry: mapRange(f, 0, 240, -3, 3),
    tz: mapRange(f, 0, 240, -40, 90),
  };
  const lamp = { x: 0.5, y: 0.45, intensity: 0.9, radius: 1400 * S, tint: '255,230,190' };

  const base = (portrait ? 150 : 104) * S;
  const hud = (
    <>
      {st >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: portrait ? h * 0.57 : h * 0.62,
            display: 'flex',
            justifyContent: 'center',
            opacity: clamp01(st / 2),
            transform: `translateX(${portrait ? 0 : w * 0.2}px) scale(${1 + (1 - sp) * 2.6}) rotate(${-8 + (1 - sp) * 6}deg)`,
          }}
        >
          <div
            style={{
              color: C.blood,
              background: 'rgba(244,241,234,.96)',
              border: `${base * 0.07}px solid ${C.blood}`,
              outline: `${base * 0.03}px solid ${C.blood}`,
              outlineOffset: base * 0.09,
              padding: `${base * 0.18}px ${base * 0.34}px`,
              textAlign: 'center',
              fontFamily: FONT.sans,
              fontWeight: 900,
              textTransform: 'uppercase',
              boxShadow: '0 24px 24px rgba(0,0,0,.35)',
            }}
          >
            {(portrait ? ['I HEARD', 'A RUMOR'] : ['I HEARD A RUMOR']).map((l) => (
              <div key={l} style={{ fontFamily: FONT.serif, fontSize: base, lineHeight: 0.95, letterSpacing: '-0.01em' }}>
                {l}
              </div>
            ))}
            <div style={{ height: base * 0.05, background: C.blood, margin: `${base * 0.14}px 0` }} />
            {(portrait ? ['CAN YOU SURVIVE', 'THE SYNDICATE?'] : ['CAN YOU SURVIVE THE SYNDICATE?']).map((l) => (
              <div key={l} style={{ fontSize: base * 0.36, lineHeight: 1.1, letterSpacing: '0.04em' }}>
                {l}
              </div>
            ))}
          </div>
        </div>
      )}
      {f > S6.stamp + 50 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: (portrait ? 80 : 60) * S, display: 'flex', justifyContent: 'center', opacity: clamp01((f - S6.stamp - 50) / 10) }}>
          <Dymo size={32 * S} rot={-1}>
            A tabloid strategy game set in Nigeria
          </Dymo>
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(255,240,210,${afterglow}), transparent 70%)`, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: ramp(f, 226, 240) }} />
    </>
  );

  return (
    <CinematicRig id="s6" cam={cam} lamp={lamp} impacts={[0, S6.stamp, S6.stamp + 8]} hud={hud} fadeIn={1} darkness={0.35}>
      <div style={{ position: 'absolute', left: -pageW / 2, top: -pageH / 2 }}>
        <TabloidPage w={pageW} h={pageH} portrait={portrait} bleed={Math.max(pageW - w, pageH - h) / 2} />
      </div>
    </CinematicRig>
  );
};
