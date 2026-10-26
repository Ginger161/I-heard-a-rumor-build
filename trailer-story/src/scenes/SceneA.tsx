import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CinematicRig, Cam } from '../CinematicRig';
import { useLayout } from '../layout';
import { A, sec } from '../timing';
import { clamp01, decay, easeInOut, easeOut, mapRange, flash, flicker } from '../fx';
import { Phone, NotesApology, Bubble, TypingDots } from '../components/ui';
import { GlitchText, SlamText, Tag } from '../components/kinetic';
import { C } from '../theme';
import { FONT } from '../fonts';

/** 6:06: the dark, the tick, the phone waking up, an apology that nobody wrote yet, Biko's text. */
export const SceneA: React.FC = () => {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  const PW = portrait ? 760 : 470;

  const buzz = A.buzz.map(sec);
  const wake = buzz[0];
  const on = clamp01((f - wake) / 5);
  const impacts = [...buzz, sec(A.chat3)];
  const glitches = [sec(A.tick), sec(A.circle), sec(A.chat3)];

  // phone vibration: three short bursts of high-frequency shake
  const vib = buzz.reduce((a, b) => a + (f >= b && f < b + 12 ? Math.pow(1 - (f - b) / 12, 0.6) : 0), 0);
  const vx = Math.sin(f * 2.4) * 11 * vib;
  const vy = Math.cos(f * 2.9) * 7 * vib;
  const vr = Math.sin(f * 2.1) * 1.1 * vib;

  const camAt = (g: number): Cam => {
    const p = easeInOut(mapRange(g, 0, sec(9), 0, 1, (x) => x));
    const push = easeOut(mapRange(g, wake, sec(5.0), 0, 1, (x) => x));
    const late = mapRange(g, sec(5.8), sec(9), 0, 1, (x) => x);
    return {
      tz: -520 + p * 220 + push * (portrait ? 590 : 740) + late * 90,
      ty: push * (portrait ? 400 : 250) + late * 20,
      tx: Math.sin(g * 0.011) * 10,
      rx: 7 - push * 7,
      ry: -9 + push * 9,
      rz: -2 + push * 2,
    };
  };

  const dim = clamp01((f - (sec(A.chat1) - 6)) / 14) * 0.62;
  const chatBlur = clamp01((f - sec(A.chat1)) / 20) * 7;

  const tick = f >= sec(A.tick);
  const dateOpacity = clamp01((f - sec(A.dateIn)) / 18) * (1 - clamp01((f - (wake - 10)) / 8));
  const jitter = f > sec(A.tick) - 3 && f < sec(A.tick) + 8;

  // notes timing
  const bodyP = mapRange(f, sec(A.typeStart), sec(5.0), 0, 1, (x) => x);
  const signP = mapRange(f, sec(5.1), sec(A.typeEnd), 0, 1, (x) => x);
  const circle = mapRange(f, sec(A.circle), sec(A.circle) + 26, 0, 1, (x) => x);
  const hot = f >= sec(A.circle);

  const t1 = f - sec(A.chat1);
  const t2 = f - sec(A.chat2);
  const t3 = f - sec(A.chat3);
  const dots = f >= sec(A.dots) && f < sec(A.chat3);
  const bw = portrait ? 880 : 700;

  const hud = (
    <>
      {/* the time, before anything happens */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: dateOpacity }}>
        <div style={{ textAlign: 'center' }}>
          <Tag size={portrait ? 30 : 26} color="#7f8ea0" style={{ marginBottom: 22, opacity: flicker(f) }}>
            Friday · Lagos
          </Tag>
          {jitter ? (
            <GlitchText text="6:06 PM" f={f} size={portrait ? 150 : 170} font="mono" color="#fff" amount={2} />
          ) : (
            <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: portrait ? 150 : 170, color: tick ? '#fff' : '#9fb0c2', letterSpacing: '0.04em', textShadow: tick ? '0 0 50px rgba(160,210,255,.45)' : 'none' }}>
              {tick ? '6:06 PM' : '6:05 PM'}
            </div>
          )}
        </div>
      </AbsoluteFill>

      {/* dim the apology so Biko's message owns the frame */}
      <AbsoluteFill style={{ background: `rgba(2,3,5,${dim})` }} />

      {f >= sec(A.chat1) && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: bw, display: 'flex', flexDirection: 'column', gap: 18, transform: `translateY(${portrait ? 120 : 20}px)` }}>
            <Tag size={26} color="#7f8ea0" style={{ marginLeft: 8, opacity: clamp01(t1 / 8) }}>
              Biko
            </Tag>
            <Bubble w={bw * 1.4} text="Boss." t={t1} />
            <Bubble w={bw * 1.4} text="Somebody wrote your apology." t={t2} />
            {dots && <TypingDots w={bw * 1.4} f={f} />}
            {t3 >= 0 && (
              <div style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                <SlamText text="Before you did anything." t={t3} size={portrait ? 84 : 78} font="sans" spacing={-0.01} color="#fff" style={{ fontWeight: 900, whiteSpace: 'normal' }} glow="rgba(225,29,72,.6)" />
              </div>
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* screen wake flash */}
      <AbsoluteFill style={{ background: 'rgba(190,225,255,1)', opacity: flash(f, wake, 1, 10) * 0.55, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: '#fff', opacity: flash(f, sec(A.chat3), 1, 8) * 0.35, mixBlendMode: 'overlay' }} />
    </>
  );

  const stage = (
    <div style={{ transform: `translate(${vx}px, ${vy}px) rotate(${vr}deg)` }}>
      <Phone w={PW} on={on}>
        <NotesApology w={PW} p={bodyP} signP={signP} circle={circle} hot={hot} />
      </Phone>
    </div>
  );

  return (
    <CinematicRig
      id="a"
      cam={camAt(f)}
      camPrev={camAt(f - 1)}
      lamp={{ x: 0.5, y: portrait ? 0.4 : 0.42, intensity: 0.5 + on * 0.6, radius: 900, tint: '150,200,255' }}
      impacts={impacts}
      glitches={glitches}
      hud={hud}
      stageBlur={chatBlur}
      darkness={0.9}
      shakeAmp={0.55}
      fadeIn={1}
    >
      {stage}
    </CinematicRig>
  );
};
