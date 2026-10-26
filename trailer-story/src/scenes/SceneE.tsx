import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CinematicRig, Cam } from '../CinematicRig';
import { useLayout } from '../layout';
import { E, sec } from '../timing';
import { clamp01, easeInOut, easeOut, mapRange, flash, lerp } from '../fx';
import { NigeriaMap, MAP_W, MAP_H, centroid } from '../components/NigeriaMap';
import { Shards } from '../components/props';
import { SlamText, Tag } from '../components/kinetic';
import Nigeria from '@svg-maps/nigeria';
import { C } from '../theme';
import { FONT } from '../fonts';

const SEED = centroid('lagos');
const DIST = (() => {
  const m: Record<string, number> = {};
  let mx = 1;
  for (const l of Nigeria.locations) {
    const c = centroid(l.id);
    if (!c) continue;
    m[l.id] = Math.hypot(c.x - SEED.x, c.y - SEED.y);
    mx = Math.max(mx, m[l.id]);
  }
  for (const k of Object.keys(m)) m[k] /= mx;
  return m;
})();

const mix = (a: number[], b: number[], t: number) => `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
const BASE = [23, 29, 38];
const AMBER = [217, 150, 40];
const RED = [190, 24, 40];

const Choice: React.FC<{ f: number; t: number; w: number; portrait: boolean }> = ({ f, t, w, portrait }) => {
  const sel = f - sec(E.select);
  const p = easeOut(clamp01(t / 12));
  const left = Math.max(0, 10 - Math.floor(clamp01((t - 18) / (sec(E.select) - 18)) * 7.6));
  const timerP = clamp01((t - 18) / (sec(E.select) - 18));
  const chosen = sel >= 0;
  const optH = portrait ? 170 : 210;
  const opt = (label: string, sub: string, id: number) => {
    const isSel = chosen && id === 0;
    const isOther = chosen && id === 1;
    return (
      <div
        style={{
          flex: 1,
          minHeight: optH,
          borderRadius: 24,
          padding: '26px 30px',
          background: isSel ? 'linear-gradient(160deg,#B3203A,#7a1224)' : 'linear-gradient(160deg,#1c2634,#121923)',
          boxShadow: isSel ? `0 0 60px rgba(225,29,72,.6), inset 0 0 0 2px rgba(255,255,255,.5)` : 'inset 0 0 0 1.5px rgba(160,200,255,.22)',
          opacity: isOther ? 0.28 : 1,
          transform: `scale(${isSel ? 1 + Math.min(0.05, sel * 0.006) : isOther ? 0.96 : 1})`,
          transition: 'none',
        }}
      >
        <div style={{ fontFamily: FONT.display, fontSize: portrait ? 56 : 62, color: '#fff', letterSpacing: '0.02em' }}>{label}</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 22, color: isSel ? '#ffd5dc' : '#8fa6bd', marginTop: 10, letterSpacing: '0.04em' }}>{sub}</div>
      </div>
    );
  };
  return (
    <div style={{ width: w, transform: `translateY(${(1 - p) * 70}px)`, opacity: clamp01(p * 2), position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <Tag size={24} color="#8fa6bd">A file arrives before you ask</Tag>
          <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: portrait ? 62 : 70, color: '#fff', marginTop: 14, lineHeight: 1.05 }}>Use it, or verify it first?</div>
        </div>
        {/* timer */}
        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
          <svg width={120} height={120} viewBox="0 0 120 120" style={{ position: 'absolute', inset: 0 }}>
            <circle cx={60} cy={60} r={52} fill="none" stroke="rgba(160,200,255,.2)" strokeWidth={7} />
            <circle cx={60} cy={60} r={52} fill="none" stroke={C.siren} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={timerP} transform="rotate(-90 60 60)" style={{ filter: 'drop-shadow(0 0 8px rgba(225,29,72,.9))' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontSize: 58, color: '#fff' }}>{chosen ? '' : left}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: portrait ? 'column' : 'row', gap: 22 }}>
        {opt('USE THE FILE', 'Fast. Unverified.', 0)}
        {opt('VERIFY IT FIRST', 'Takes a day you do not have.', 1)}
      </div>
    </div>
  );
};

/** The choice: a timed decision with a cost, then the rumor goes national and the heat follows. */
export const SceneE: React.FC = () => {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  const mapF = sec(E.map);
  const sparks = E.sparks.map(sec);
  const flipF = sec(E.flip);
  const hurt = sec(E.hurt);
  const wireF = sec(E.wire);
  const inMap = f >= mapF;
  const CW = portrait ? 940 : 1180;
  const MW = portrait ? 1000 : 980;

  const camAt = (g: number): Cam => {
    if (g < mapF) {
      const p = mapRange(g, 0, mapF, 0, 1, (x) => x);
      return { tz: -240 + p * 330 + easeOut(clamp01(g / 20)) * 80, ty: -10, tx: -26 + p * 52, ry: 5 - p * 8, rx: 2, rz: -0.8 + p * 1.4 };
    }
    const p = mapRange(g, mapF, sec(7), 0, 1, (x) => x);
    return { tz: -60 + p * 240, tx: 40 - p * 70, ty: 0, rx: 14 - p * 10, ry: -8 + p * 6, rz: 0.6 - p * 1.2 };
  };

  const spread = mapRange(f, mapF + 10, sec(6.9), 0, 1.25, (x) => x);
  const fillFor = (id: string) => {
    const d = DIST[id] ?? 0.5;
    const heard = clamp01((spread - d * 0.9) / 0.25);
    const bel = clamp01((spread - d * 0.9 - 0.18) / 0.3);
    if (heard <= 0) return mix(BASE, BASE, 0);
    return bel > 0 ? mix(AMBER, RED, bel) : mix(BASE, AMBER, heard);
  };
  const believers = Math.round(mapRange(f, mapF + 24, sec(6.9), 4, 68, easeOut));
  const heat = Math.round(mapRange(f, mapF + 30, wireF + 20, 12, 91, (x) => x));
  const trust = f >= hurt ? 3 : 5;

  const stage = !inMap ? (
    <div style={{ position: 'absolute', left: -CW / 2, top: portrait ? -330 : -250 }}>
      <Choice f={f} t={f - sec(E.card)} w={CW} portrait={portrait} />
    </div>
  ) : (
    <div style={{ position: 'absolute', left: -MW / 2, top: -(MW * MAP_H) / MAP_W / 2 }}>
      <NigeriaMap
        width={MW}
        fillFor={fillFor}
        strokeFor={() => 'rgba(150,185,230,.45)'}
        strokeWidth={1.2}
        overlay={
          <>
            {sparks.map((s, i) => {
              const c = [centroid('lagos'), centroid('kano'), centroid('rivers')][i] ?? SEED;
              const t = f - s;
              if (t < 0 || t > 40) return null;
              const pop = t < 22;
              return (
                <g key={i} transform={`translate(${c.x} ${c.y})`}>
                  {pop ? (
                    <>
                      <circle r={26 * easeOut(clamp01(t / 6)) * (1 + 0.06 * Math.sin(t))} fill="rgba(253,230,138,.92)" stroke={C.amberDeep} strokeWidth={3} />
                      <text textAnchor="middle" y={9} fontFamily={FONT.display} fontSize={24} fill={C.amberDeep}>
                        ⚡{[15, 9, 12][i]}
                      </text>
                    </>
                  ) : null}
                  {t >= 22 && (
                    <foreignObject x={-70} y={-70} width={140} height={140} style={{ overflow: 'visible' }}>
                      <div style={{ position: 'relative', width: 140, height: 140 }}>
                        <div style={{ position: 'absolute', left: 70, top: 70 }}>
                          <Shards t={easeOut(clamp01((t - 22) / 18))} size={60} color={C.amberDeep} glow="rgba(245,158,11,.8)" count={6} />
                        </div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </>
        }
      />
    </div>
  );

  const trustHit = f - hurt;
  const hud = (
    <>
      {!inMap && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: portrait ? 230 : 96 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: clamp01((f - sec(E.card) - 40) / 14) }}>
            <Tag size={portrait ? 28 : 24} color="#8fa6bd">Biko · trust</Tag>
            <div style={{ display: 'flex', gap: 7 }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{ width: portrait ? 28 : 30, height: 14, borderRadius: 3, background: i < trust ? '#60a5fa' : 'rgba(160,200,255,.15)', boxShadow: i < trust ? '0 0 12px rgba(96,165,250,.7)' : undefined, opacity: f >= hurt && i >= 3 && i < 5 ? clamp01(1 - trustHit / 10) : 1 }} />
              ))}
            </div>
            {trustHit >= 0 && (
              <div style={{ transform: `translateY(${(1 - easeOut(clamp01(trustHit / 8))) * 14}px)`, opacity: clamp01(trustHit / 4) }}>
                <SlamText text="−2" t={trustHit} size={portrait ? 72 : 80} color={C.siren} glow="rgba(225,29,72,.8)" font="display" />
              </div>
            )}
          </div>
        </AbsoluteFill>
      )}

      {inMap && (
        <>
          <AbsoluteFill style={{ padding: portrait ? '100px 64px' : '60px 84px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Tag size={portrait ? 28 : 24} color="#8fa6bd">Believers</Tag>
                <div style={{ fontFamily: FONT.display, fontSize: portrait ? 130 : 120, color: '#fff', lineHeight: 1 }}>
                  {believers}
                  <span style={{ fontSize: '0.5em', color: C.siren }}>%</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Tag size={portrait ? 28 : 24} color="#8fa6bd">Heat</Tag>
                <div style={{ width: portrait ? 300 : 340, height: 18, borderRadius: 9, background: 'rgba(160,200,255,.15)', marginTop: 14, overflow: 'hidden' }}>
                  <div style={{ width: `${heat}%`, height: '100%', background: heat > 70 ? C.siren : C.amber, boxShadow: `0 0 18px ${heat > 70 ? 'rgba(225,29,72,.9)' : 'rgba(245,158,11,.8)'}` }} />
                </div>
                <div style={{ fontFamily: FONT.display, fontSize: portrait ? 60 : 56, color: heat > 70 ? C.siren : '#fff', marginTop: 8 }}>{heat}%</div>
              </div>
            </div>
          </AbsoluteFill>
          {f >= wireF && (
            <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: portrait ? 200 : 100 }}>
              <div style={{ transform: `translateX(${(1 - easeOut(clamp01((f - wireF) / 10))) * -120}px) rotate(-1.2deg)`, opacity: clamp01((f - wireF) / 4), background: '#F7D9DB', color: '#7a1224', padding: '22px 34px', fontFamily: FONT.mono, fontWeight: 700, fontSize: portrait ? 30 : 30, letterSpacing: '0.06em', boxShadow: '0 20px 60px rgba(0,0,0,.7), 0 0 0 3px #B3203A inset', maxWidth: portrait ? 940 : 1100 }}>
                SECURITY WIRE · HEAT {heat}%
                <br />
                <span style={{ fontWeight: 500 }}>Unmarked vehicle outside the safehouse.</span>
              </div>
            </AbsoluteFill>
          )}
        </>
      )}

      <AbsoluteFill style={{ background: '#fff', opacity: flash(f, mapF, 1, 8) * 0.5 + sparks.reduce((a, s) => a + flash(f, s, 1, 6) * 0.1, 0), mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: C.siren, opacity: flash(f, hurt, 1, 12) * 0.28 + flash(f, wireF, 1, 14) * 0.3, mixBlendMode: 'screen' }} />
    </>
  );

  return (
    <CinematicRig
      id="e"
      cam={camAt(f)}
      camPrev={camAt(f - 1)}
      lamp={{ x: 0.5, y: 0.5, intensity: inMap ? 0.75 : 0.65, radius: 1000, tint: inMap ? '255,200,140' : '160,205,255' }}
      impacts={[sec(E.select), hurt, mapF, ...sparks, flipF, wireF]}
      glitches={[hurt, mapF, wireF]}
      hud={hud}
      whipIn={inMap ? 0 : 10}
      fadeIn={2}
      mbScale={0.6}
      darkness={0.85}
      shakeAmp={0.9}
    >
      {stage}
    </CinematicRig>
  );
};
