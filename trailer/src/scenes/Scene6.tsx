import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CinematicRig } from '../CinematicRig';
import { useLayout } from '../layout';
import { C } from '../theme';
import { FONT } from '../fonts';
import { Dymo } from '../components/props';
import { TabloidPage } from '../components/cards';
import { PAPER_TEX } from '../texture';
import { clamp01, mapRange, ramp } from '../fx';
import { S6 } from '../timing';

export const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, portrait, S } = useLayout();

  // flash-bulb: hard white, fast exponential decay, with a warm afterglow
  const flash = Math.exp(-f / 10);
  const afterglow = Math.exp(-f / 45) * 0.35;

  const st = f - S6.stamp;
  const sp = st < 0 ? 0 : spring({ frame: st, fps, config: { damping: 11, stiffness: 320, mass: 0.8 } });
  const settle = st < 0 ? 0 : 1 + Math.sin(st / 40) * 0.006; // the stamp keeps breathing after it lands
  const smear = st >= 0 ? Math.max(0, 1 - Math.min(1, sp)) * 14 : 0;
  const pageW = w * 1.1;
  const pageH = h * 1.1;

  // the page is never still: a slow push and a slight paper sway
  const camAt = (ff: number) => ({
    rx: mapRange(ff, 0, 360, 5, -1) + Math.sin(ff / 70) * 0.5,
    ry: mapRange(ff, 0, 360, -3, 3) + Math.sin(ff / 95) * 0.5,
    tz: mapRange(ff, 0, 360, -40, 110),
    tx: Math.sin(ff / 110) * 10 * S,
  });
  const lamp = { x: 0.5, y: 0.45, intensity: 0.9, radius: 1400 * S, tint: '255,230,190' };

  const base = (portrait ? 150 : 94) * S;
  const stampTop = portrait ? h * 0.57 : h * 0.62;

  const hud = (
    <>
      {st >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: stampTop,
            display: 'flex',
            justifyContent: 'center',
            opacity: clamp01(st / 3),
            transform: `translateX(${portrait ? 0 : w * 0.27}px) scale(${(1 + (1 - sp) * 2.6) * settle}) rotate(${-8 + (1 - sp) * 6}deg)`,
            filter: smear > 0.4 ? `blur(${smear}px)` : undefined,
          }}
        >
          <div style={{ filter: 'drop-shadow(0 22px 24px rgba(0,0,0,.5))' }}>
            <div
              style={{
                color: C.blood,
                background: `${PAPER_TEX}, rgba(244,241,234,.96)`,
                border: `${base * 0.07}px solid ${C.blood}`,
                outline: `${base * 0.03}px solid ${C.blood}`,
                outlineOffset: base * 0.09,
                borderRadius: base * 0.12,
                padding: `${base * 0.18}px ${base * 0.34}px`,
                textAlign: 'center',
                fontFamily: FONT.sans,
                fontWeight: 900,
                textTransform: 'uppercase',
                filter: 'url(#rough)',
              }}
            >
              <div style={{ filter: 'url(#ink)' }}>
              {(portrait ? ['I HEARD', 'A RUMOR'] : ['I HEARD A RUMOR']).map((l) => (
                <div key={l} style={{ fontFamily: FONT.serif, fontSize: base, lineHeight: 0.95, letterSpacing: '-0.01em' }}>
                  {l}
                </div>
              ))}
              <div style={{ height: base * 0.05, background: C.blood, margin: `${base * 0.14}px 0`, borderRadius: 4 }} />
              {(portrait ? ['CAN YOU SURVIVE', 'THE SYNDICATE?'] : ['CAN YOU SURVIVE THE SYNDICATE?']).map((l) => (
                <div key={l} style={{ fontSize: base * 0.36, lineHeight: 1.1, letterSpacing: '0.04em' }}>
                  {l}
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {f > S6.cta && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: (portrait ? 80 : 60) * S, display: 'flex', justifyContent: 'center', opacity: clamp01((f - S6.cta) / 14), transform: `translateY(${(1 - clamp01((f - S6.cta) / 14)) * 12}px)` }}>
          <Dymo size={32 * S} rot={-1}>
            A tabloid strategy game set in Nigeria
          </Dymo>
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(255,240,210,${afterglow}), transparent 70%)`, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: ramp(f, 340, 360) }} />
    </>
  );

  return (
    <CinematicRig id="s6" cam={camAt(f)} camPrev={camAt(f - 1)} lamp={lamp} impacts={[0, S6.stamp, S6.stamp + 10]} hud={hud} fadeIn={1} darkness={0.35}>
      <div style={{ position: 'absolute', left: -pageW / 2, top: -pageH / 2, borderRadius: 4, boxShadow: '0 30px 80px rgba(0,0,0,.5)' }}>
        <TabloidPage w={pageW} h={pageH} portrait={portrait} bleed={Math.max(pageW - w, pageH - h) / 2} />
      </div>
    </CinematicRig>
  );
};
