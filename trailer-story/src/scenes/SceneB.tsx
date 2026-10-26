import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CinematicRig, Cam } from '../CinematicRig';
import { useLayout } from '../layout';
import { B, sec } from '../timing';
import { clamp01, easeOut, mapRange, flash } from '../fx';
import { Bokeh } from '../components/bokeh';
import { ProfileCard, Banner, TARGET_APOLOGY } from '../components/ui';
import { TransferAlert, GroupChatShot, HrEmail, NotebookPage, DeedPage, ExposedStamp } from '../components/docs';
import { SlamText, Tag } from '../components/kinetic';
import { C } from '../theme';
import { FONT } from '../fonts';

const WORDS = ['YOUR EX', 'YOUR BESTIE', 'YOUR BOSS', 'YOUR IN-LAW', 'YOUR UNCLE'];
const WHO = ['Your ex', 'Your best friend', 'Your boss', 'Your mother-in-law', 'Your uncle'];
const ROT = [-4, 3, -3, 4, -2];

/** The page: Lagos at night, the account that never lies, and five people cornered in a row. */
export const SceneB: React.FC = () => {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  const DW = portrait ? 780 : 600;
  const beats = B.beats.map(sec);
  const pings = B.pings.map(sec);
  const end = sec(9.5);

  const prog = (g: number) => mapRange(g, 0, end, 0, 1, (x) => x);
  const camAt = (g: number): Cam => ({
    tx: -150 + prog(g) * 300,
    ty: 0,
    tz: -160 + easeOut(clamp01(g / sec(2.5))) * 120 + prog(g) * 80,
    ry: 3 - prog(g) * 6,
    rz: Math.sin(g * 0.02) * 0.6,
  });

  const idx = beats.reduce((a, b, i) => (f >= b ? i : a), -1);
  const tBeat = idx >= 0 ? f - beats[idx] : -1;
  const inBeats = idx >= 0 && f < pings[0];
  const cardOut = clamp01((f - (beats[0] - 8)) / 10);
  const followers = mapRange(f, sec(B.countFrom), sec(B.countTo), 0, 41000, easeOut);

  const docEl = (i: number) => {
    const m = clamp01((f - beats[i] - 18) / 26);
    switch (i) {
      case 0:
        return <TransferAlert w={DW} mark={m} />;
      case 1:
        return <GroupChatShot w={DW} />;
      case 2:
        return <HrEmail w={DW} mark={m} />;
      case 3:
        return <NotebookPage w={DW * 0.86} />;
      default:
        return <DeedPage w={DW} mark={m} />;
    }
  };

  const stage = (
    <>
      <Bokeh f={f} intensity={inBeats ? 0.55 : 1} />

      {/* profile card */}
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${-(portrait ? 430 : 330)}px, ${-250 - cardOut * 320}px) translateZ(${cardOut * 120}px)`, opacity: 1 - cardOut }}>
        <ProfileCard w={portrait ? 860 : 660} followers={followers} t={f - sec(B.card)} />
      </div>

      {/* the five documents */}
      {inBeats && (
        <div key={idx} style={{ position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d' }}>
          {/* the giant word, behind the paper, drifting the other way for parallax */}
          <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate3d(${-(WORDS[idx].length * (portrait ? 0.245 * 150 : 0.245 * 250))}px, ${portrait ? -560 : -470}px, -260px)`, opacity: clamp01(tBeat / 5) * 0.95 }}>
            <SlamText text={WORDS[idx]} t={tBeat} size={portrait ? 150 : 250} color="rgba(255,255,255,.92)" stroke="transparent" glow="rgba(160,205,255,.25)" />
          </div>
          <div
            style={{
              position: 'absolute',
              left: -DW / 2,
              top: portrait ? -300 : -230,
              transform: `translateZ(${(1 - easeOut(clamp01(tBeat / 7))) * 520 + tBeat * 0.35}px) rotate(${ROT[idx] * (0.4 + 0.6 * easeOut(clamp01(tBeat / 9)))}deg)`,
              opacity: clamp01(tBeat / 3),
            }}
          >
            {docEl(idx)}
          </div>
          <div style={{ position: 'absolute', left: portrait ? -60 : 10, top: portrait ? 60 : 70, transform: 'translateZ(200px)' }}>
            <ExposedStamp size={portrait ? 110 : 96} t={tBeat - 14} />
          </div>
        </div>
      )}
    </>
  );

  // apology pings flooding in
  const pingCount = pings.filter((p) => f >= p).length;
  const bw = portrait ? 940 : 700;
  const hud = (
    <>
      <AbsoluteFill style={{ padding: portrait ? '110px 70px' : '70px 90px' }}>
        <Tag size={portrait ? 30 : 26} style={{ opacity: clamp01((f - sec(B.tag)) / 12) * (1 - clamp01((f - beats[0] + 4) / 8)) }}>
          Lagos · 11:42 PM
        </Tag>
      </AbsoluteFill>
      {f < beats[0] && (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: portrait ? 260 : 120 }}>
          <Tag size={portrait ? 34 : 28} color="#8fa6bd" style={{ opacity: clamp01((f - sec(2.2)) / 14) * (1 - cardOut), letterSpacing: '0.35em' }}>
            Rule one: receipts only
          </Tag>
        </AbsoluteFill>
      )}

      {f >= pings[0] && (
        <AbsoluteFill style={{ background: `rgba(3,4,6,${clamp01((f - pings[0]) / 16) * 0.72})` }} />
      )}
      {f >= pings[0] && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: bw, height: 640 }}>
            {pings.map((p, j) => {
              if (f < p) return null;
              const age = pingCount - 1 - j;
              return (
                <div key={j} style={{ position: 'absolute', left: 0, top: (4 - age) * 0 + j * 112 - 100, opacity: 1 }}>
                  <Banner
                    w={bw}
                    t={f - p}
                    app="Feed · 6:06 PM"
                    title={`${WHO[j]} posted a statement`}
                    body={TARGET_APOLOGY.slice(0, 64) + '… Peace and light.'}
                    accent={C.siren}
                  />
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: '#fff', opacity: pings.reduce((a, p) => a + flash(f, p, 1, 6) * 0.16, 0), mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: C.siren, opacity: flash(f, beats[0], 1, 7) * 0.0 }} />
    </>
  );

  return (
    <CinematicRig
      id="b"
      cam={camAt(f)}
      camPrev={camAt(f - 1)}
      lamp={{ x: 0.5, y: 0.48, intensity: inBeats ? 0.9 : 0.7, radius: 1000, tint: inBeats ? '255,210,150' : '170,210,255' }}
      impacts={[...beats, ...pings]}
      glitches={[beats[0], pings[0], pings[4]]}
      hud={hud}
      whipIn={14}
      fadeIn={2}
      darkness={0.8}
      shakeAmp={0.8}
    >
      {stage}
    </CinematicRig>
  );
};
