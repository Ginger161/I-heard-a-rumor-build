import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CinematicRig, Cam } from '../CinematicRig';
import { useLayout } from '../layout';
import { G, sec } from '../timing';
import { clamp01, easeOut, mapRange, flash, flicker } from '../fx';
import { Banner } from '../components/ui';
import { Bokeh } from '../components/bokeh';
import { SlamText, Tag, GlitchText, typed } from '../components/kinetic';
import { C } from '../theme';
import { FONT } from '../fonts';

/** Title: a last buzz at 6:06, the lock-up, and a question. */
export const SceneG: React.FC = () => {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  const buzz = sec(G.buzz);
  const bannerF = sec(G.banner);
  const titleF = sec(G.title);
  const subF = sec(G.sub);
  const seasonF = sec(G.season);
  const tagF = sec(G.tagline);
  const clockF = sec(G.clock);
  const end = sec(8);

  const bursts = [0, 14, 28].map((d) => buzz + d);
  const vib = bursts.reduce((a, b) => a + (f >= b && f < b + 9 ? Math.pow(1 - (f - b) / 9, 0.6) : 0), 0);
  const bw = portrait ? 940 : 760;
  const showBanner = f >= bannerF && f < titleF - 4;

  const camAt = (g: number): Cam => {
    const p = mapRange(g, titleF, end, 0, 1, (x) => x);
    return { tz: -260 + easeOut(clamp01(g / sec(2.3))) * 120 + p * 170, ty: 0, tx: 0, rx: 0, ry: -1 + p * 2, rz: 0 };
  };

  const sinceTitle = f - titleF;
  const fadeOut = clamp01((f - (end - 22)) / 22);
  const underline = easeOut(clamp01((f - titleF - 18) / 22));
  const tagText = typed('Who writes the apologies?', mapRange(f, tagF, tagF + sec(1.3), 0, 1, (x) => x));
  const tS = portrait ? 56 : 52;

  const titleSize = portrait ? 160 : 205;
  const hud = (
    <>
      {showBanner && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ transform: `translate(${Math.sin(f * 2.4) * 10 * vib}px, ${Math.cos(f * 2.9) * 6 * vib}px)` }}>
            <Banner w={bw} t={f - bannerF} app="Notes" title="New statement · 6:06 PM" body="I want to address the allegations against ████████. I take full responsibility." time="now" accent="#F5C84B" blurBody />
          </div>
        </AbsoluteFill>
      )}

      {f >= titleF && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `translateY(${portrait ? -90 : -70}px)` }}>
          <div style={{ textAlign: 'center' }}>
            {sinceTitle >= 0 && (
              <>
                {portrait ? (
                  <>
                    <SlamText text="THE" t={sinceTitle} size={120} font="serif" color={C.paper} spacing={0.18} />
                    <div style={{ height: 4 }} />
                    <SlamText text="RECEIPTS" t={sinceTitle - 3} size={titleSize} font="serif" color={C.paper} spacing={0.0} glow="rgba(225,29,72,.45)" style={{ fontWeight: 900 }} />
                  </>
                ) : (
                  <SlamText text="THE RECEIPTS" t={sinceTitle} size={titleSize} font="serif" color={C.paper} spacing={0.0} glow="rgba(225,29,72,.45)" style={{ fontWeight: 900 }} />
                )}
              </>
            )}
            <div style={{ margin: '26px auto 0', width: portrait ? 700 : 1000, height: 10, background: C.siren, transform: `scaleX(${underline}) skewX(-18deg)`, transformOrigin: 'center', boxShadow: '0 0 36px rgba(225,29,72,.9)' }} />
            <div style={{ marginTop: 40, opacity: clamp01((f - subF) / 10), transform: `translateY(${(1 - easeOut(clamp01((f - subF) / 14))) * 20}px)` }}>
              <Tag size={portrait ? 36 : 34} color="#fff" style={{ letterSpacing: '0.45em' }}>I Heard a Rumor</Tag>
              <div style={{ marginTop: 16, opacity: clamp01((f - seasonF) / 10) }}>
                <Tag size={portrait ? 30 : 28} color="#8fa6bd" style={{ letterSpacing: '0.4em' }}>Story Mode · Season 1</Tag>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {f >= tagF && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: portrait ? 330 : 118 }}>
          <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: tS, color: '#EDEDED', letterSpacing: '0.02em' }}>
            {tagText}
            <span style={{ color: C.siren, opacity: Math.floor(f / 18) % 2 ? 0 : 1 }}>▍</span>
          </div>
        </AbsoluteFill>
      )}

      {f >= clockF && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: portrait ? 170 : 52 }}>
          {f < clockF + 8 ? <GlitchText text="6:06 PM" f={f} size={30} font="mono" color={C.siren} amount={1.5} /> : <Tag size={portrait ? 30 : 26} color={C.siren} style={{ opacity: flicker(f) }}>6:06 PM</Tag>}
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ background: '#fff', opacity: flash(f, titleF, 1, 10) * 0.55, mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: 'rgba(190,225,255,1)', opacity: bursts.reduce((a, b) => a + flash(f, b, 1, 6) * 0.18, 0), mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: '#000', opacity: fadeOut }} />
    </>
  );

  return (
    <CinematicRig
      id="g"
      cam={camAt(f)}
      camPrev={camAt(f - 1)}
      lamp={{ x: 0.5, y: 0.45, intensity: f >= titleF ? 0.85 : 0.4, radius: 1000, tint: f >= titleF ? '255,170,170' : '160,205,255' }}
      impacts={[...bursts, titleF]}
      glitches={[titleF, clockF]}
      hud={hud}
      fadeIn={1}
      darkness={0.95}
      shakeAmp={f >= titleF - 2 && f < titleF + 20 ? 1.4 : 0.35}
    >
      <div style={{ opacity: f >= titleF ? 0.5 : 0 }}>
        <Bokeh f={f * 0.5} intensity={0.55} seed="gz" />
      </div>
    </CinematicRig>
  );
};
