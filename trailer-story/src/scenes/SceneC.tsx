import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { CinematicRig, Cam } from '../CinematicRig';
import { useLayout } from '../layout';
import { Cc, sec } from '../timing';
import { clamp01, easeInOut, easeOut, mapRange, flash, flicker } from '../fx';
import { TARGET_APOLOGY, SIGNOFF } from '../components/ui';
import { SlamText, Tag, GlitchText, typed } from '../components/kinetic';
import { C } from '../theme';
import { FONT } from '../fonts';

const COLS = 7;
const ROWS = 5;
const CW = 340;
const GX = 420;
const GY = 540;
const HANDLES = ['@tolu.b', '@ngozi.k', '@seun_a', '@kemi.o', '@femi.d', '@ada.n', '@yinka.t', '@emeka.u', '@zainab.l', '@bayo.m', '@chioma', '@tunde.k'];
const AV = ['#7c3aed', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'];
const WRONG = ['5:41 PM', '6:12 PM', '6:03 PM', '7:20 PM', '5:58 PM', '6:31 PM', '6:09 PM', '4:47 PM'];

const ApologyCard: React.FC<{ i: number; f: number; typeP: number; minute: number; sign: number; hero: boolean }> = ({ i, f, typeP, minute, sign, hero }) => {
  const delay = hero ? 0 : random(`dl${i}`) * 0.1;
  const p = clamp01((typeP - delay) / (1 - 0.1));
  const wrong = WRONG[i % WRONG.length];
  const stamp = minute > 0 ? '6:06 PM' : wrong;
  const lit = sign > 0;
  return (
    <div
      style={{
        width: CW,
        background: 'linear-gradient(160deg,#1c2634,#111821)',
        borderRadius: 26,
        padding: 26,
        fontFamily: FONT.sans,
        color: '#EAF1F8',
        boxShadow: `0 20px 60px rgba(0,0,0,.7), inset 0 0 0 1.5px ${lit ? 'rgba(225,29,72,.75)' : 'rgba(160,200,255,.2)'}, 0 0 ${lit ? 44 : 14}px ${lit ? 'rgba(225,29,72,.5)' : 'rgba(120,180,255,.12)'}`,
        minHeight: 400,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: AV[i % AV.length], opacity: 0.9 }} />
        <div style={{ fontWeight: 700, fontSize: 24, flex: 1 }}>{HANDLES[i % HANDLES.length]}</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 22, color: minute > 0 ? C.siren : '#7f8ea0', fontWeight: minute > 0 ? 700 : 500, textShadow: minute > 0 ? `0 0 ${14 * minute}px rgba(225,29,72,.9)` : undefined }}>{stamp}</div>
      </div>
      <div style={{ fontFamily: FONT.mono, fontSize: 17, letterSpacing: '0.16em', color: '#7f8ea0', margin: '18px 0 10px' }}>STATEMENT · TO THE PUBLIC</div>
      <div style={{ fontSize: 27, lineHeight: 1.36, fontWeight: 500 }}>{typed(TARGET_APOLOGY, p)}</div>
      <div style={{ marginTop: 18, fontSize: 28, fontWeight: 800, color: lit ? C.siren : '#EAF1F8', textShadow: lit ? '0 0 24px rgba(225,29,72,.9)' : undefined, opacity: p >= 1 ? 1 : 0 }}>{SIGNOFF}</div>
    </div>
  );
};

/** The pattern: one apology, then the camera pulls back and it is on every phone, word for word. */
export const SceneC: React.FC = () => {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  const w0 = Cc.words.map(sec);
  const minuteF = sec(Cc.minute);
  const signF = sec(Cc.signoff);
  const pullS = sec(Cc.pullStart);
  const pullE = sec(Cc.pullEnd);
  const pushS = sec(Cc.push);
  const end = sec(10);

  const camAt = (g: number): Cam => {
    const pull = easeInOut(mapRange(g, pullS, pullE, 0, 1, (x) => x));
    const push = easeInOut(mapRange(g, pushS, end, 0, 1, (x) => x));
    const tz = 1000 + g * 0.18 - pull * 1950 + push * 700;
    return {
      tz,
      tx: Math.sin(g * 0.008) * 18 * pull,
      ty: -pull * 30 + push * 40,
      rx: pull * 9 - push * 6,
      ry: -pull * 12 + push * 12,
      rz: pull * 1.6 - push * 1.6,
    };
  };

  const typeP = mapRange(f, sec(Cc.typeStart), sec(Cc.typeEnd), 0, 1, (x) => x);
  const minute = f >= minuteF ? clamp01(1 - (f - minuteF) / 36) * 0.4 + 0.6 : 0;
  const sign = f >= signF ? clamp01((f - signF) / 8) : 0;
  const count = Math.round(mapRange(f, pullS, pullE, 1, COLS * ROWS, easeOut));

  const cards: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      const hero = c === 3 && r === 2;
      const cx = (c - 3) * GX + (random(`jx${i}`) - 0.5) * 24;
      const cy = (r - 2) * GY + (random(`jy${i}`) - 0.5) * 24;
      const cz = (random(`jz${i}`) - 0.5) * 140;
      const rot = (random(`jr${i}`) - 0.5) * 3;
      cards.push(
        <div key={i} style={{ position: 'absolute', left: cx - CW / 2, top: cy - 200, transform: `translateZ(${cz}px) rotate(${rot}deg)` }}>
          <ApologyCard i={i} f={f} typeP={typeP} minute={minute} sign={sign} hero={hero} />
        </div>,
      );
    }
  }

  const wi = w0.reduce((a, b, i) => (f >= b ? i : a), -1);
  const WORDS = ['SAME WORDS.', 'SAME FORMAT.', 'SAME MINUTE.'];
  const tW = wi >= 0 ? f - w0[wi] : -1;
  const wordsOn = wi >= 0 && f < signF - 6;
  const sz = portrait ? 150 : 210;
  const sg = f >= signF + 12 ? f - (signF + 12) : -1;

  const hud = (
    <>
      {/* a soft pool of black behind the headline so it reads over the wall */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(2,3,5,${wordsOn ? 0.78 : 0}) 0%, rgba(2,3,5,0) 62%)` }} />
      {wordsOn && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div key={wi} style={{ textAlign: 'center' }}>
            <SlamText text={WORDS[wi]} t={tW} size={sz} color="#fff" glow={wi === 2 ? 'rgba(225,29,72,.8)' : 'rgba(160,205,255,.35)'} />
            <div style={{ marginTop: 26, opacity: clamp01(tW / 16) }}>
              <Tag size={portrait ? 30 : 26} color={wi === 2 ? C.siren : '#8fa6bd'}>
                {wi === 0 ? 'every sentence matches' : wi === 1 ? 'every sign-off matches' : 'every timestamp matches'}
              </Tag>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {sg >= 0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at 50% 50%, rgba(2,3,5,${clamp01(sg / 12) * 0.82}) 0%, rgba(2,3,5,0) 70%)` }}>
          <div style={{ textAlign: 'center', opacity: flicker(f, [signF + 40]) }}>
            {sg < 7 ? (
              <GlitchText text="Peace and light." f={f} size={portrait ? 84 : 150} font="serif" color={C.siren} amount={2.4} />
            ) : (
              <div style={{ fontFamily: FONT.serifItalic, fontWeight: 900, fontSize: portrait ? 84 : 150, color: C.siren, textShadow: '0 0 60px rgba(225,29,72,.75), 0 0 140px rgba(225,29,72,.4)', letterSpacing: '0.01em' }}>Peace and light.</div>
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* counter */}
      <AbsoluteFill style={{ padding: portrait ? '110px 70px' : '64px 84px', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <div style={{ opacity: clamp01((f - pullS + 10) / 14) * (sg >= 0 ? 0.35 : 1) }}>
          <Tag size={portrait ? 28 : 24} color="#8fa6bd">Statements posted</Tag>
          <div style={{ fontFamily: FONT.display, fontSize: portrait ? 120 : 110, color: '#fff', lineHeight: 1.05 }}>{String(count).padStart(3, '0')}</div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: C.siren, opacity: flash(f, minuteF, 1, 12) * 0.35, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: '#fff', opacity: flash(f, w0[0], 1, 6) * 0.14 + flash(f, w0[1], 1, 6) * 0.14, mixBlendMode: 'overlay' }} />
    </>
  );

  return (
    <CinematicRig
      id="c"
      cam={camAt(f)}
      camPrev={camAt(f - 1)}
      lamp={{ x: 0.5, y: 0.5, intensity: 0.8, radius: 1250, tint: '160,205,255' }}
      impacts={[...w0, signF]}
      glitches={[w0[0], w0[1], minuteF, signF]}
      hud={hud}
      stageBlur={wordsOn ? 2.4 : 0}
      whipIn={10}
      fadeIn={2}
      darkness={0.7}
      shakeAmp={0.9}
    >
      {cards}
    </CinematicRig>
  );
};
