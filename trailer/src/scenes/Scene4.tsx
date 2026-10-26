import React from 'react';
import { interpolateColors, random, useCurrentFrame } from 'remotion';
import { CinematicRig } from '../CinematicRig';
import { useLayout } from '../layout';
import { C } from '../theme';
import { FONT } from '../fonts';
import { Desk, Dymo, Stamp, caShadow } from '../components/props';
import { BreakingFront, ViralReceipt, typed } from '../components/cards';
import { NigeriaMap, POP_BY_SVG, TOTAL_POP, centroid } from '../components/NigeriaMap';
import { clamp01, decay, easeInOut, easeOut, lerp, ramp } from '../fx';
import { S4 } from '../timing';

const IDS = Object.keys(POP_BY_SVG);
const SEEDS = [
  { id: 'lagos', at: 0 },
  { id: 'fct', at: 8 },
];
const TIME_SCALE = 0.52; // the spread finishes just as the counter locks
const startOf = (id: string) => {
  const c = centroid(id);
  let best = Infinity;
  for (const s of SEEDS) {
    const sc = centroid(s.id);
    best = Math.min(best, s.at + Math.hypot(c.x - sc.x, c.y - sc.y) * 0.3);
  }
  return best + random(`jit-${id}`) * 10;
};
const START: Record<string, number> = Object.fromEntries(IDS.map((id) => [id, startOf(id)]));
const level = (id: string, t: number) => clamp01((t - START[id]) / 80);

const LEVEL_FROM = [0, 0.45, 1];
const LEVEL_COLORS = [C.paper, C.amber, C.blood];

const ARCS: [string, string][] = [
  ['lagos', 'fct'],
  ['fct', 'kano'],
  ['fct', 'rivers'],
  ['rivers', 'lagos'],
];
const CITY_LABEL: Record<string, string> = { lagos: 'LAGOS', fct: 'ABUJA', kano: 'KANO', rivers: 'PORT HARCOURT' };

const bez = (a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});

type Fly = { kind: 'VIRAL' | 'FRONT'; x: number; y: number; rot: number; text: string; sub: string };
const FLY: Fly[] = [
  { kind: 'VIRAL', x: -0.3, y: -0.2, rot: -8, text: 'Una don hear? ₦85B just disappear!', sub: '2.1M' },
  { kind: 'FRONT', x: 0.3, y: 0.16, rot: 6, text: 'Ministry cash: where did it go?', sub: 'Sources say the money never left the building.' },
  { kind: 'VIRAL', x: 0.28, y: -0.2, rot: 7, text: 'Abeg forward to 10 people. E dey real.', sub: '4.7M' },
  { kind: 'FRONT', x: -0.3, y: 0.18, rot: -6, text: 'Majority now believes', sub: 'Polls tilt hard against the big man.' },
];

/** Slow through the middle of the flight (where the card is legible), fast at both ends. */
const flightZ = (p: number) => {
  const g = p + 0.12 * Math.sin(Math.PI * 2 * p);
  return -1400 + 2400 * g;
};

export const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const { w, h, portrait, S } = useLayout();

  const t = f * TIME_SCALE;
  const mapW = (portrait ? 930 : 1120) * S;

  const fillFor = (id: string) => interpolateColors(level(id, t), LEVEL_FROM, LEVEL_COLORS);
  const strokeFor = (id: string) => (level(id, t) > 0.6 ? '#3a0a0a' : C.ink);

  // --- orbital sweep: a long, steady arc, never a hold
  const camAt = (ff: number) => {
    const orb = easeInOut(ramp(ff, 0, 500));
    return {
      rz: lerp(portrait ? -17 : -36, portrait ? 17 : 36, orb),
      rx: lerp(54, 44, orb) + Math.sin(orb * Math.PI) * 6,
      ry: lerp(portrait ? -6 : -10, portrait ? 6 : 10, orb),
      tz: lerp(-120, portrait ? 80 : 160, orb),
      ty: (portrait ? -h * 0.06 : 0) * S,
    };
  };
  const cam = camAt(f);

  // --- weighted believers share, so the counter tracks what the map is actually showing
  let weighted = 0;
  for (const id of IDS) weighted += POP_BY_SVG[id] * level(id, t);
  const share = weighted / TOTAL_POP;
  const lockedAt = S4.counterLock;
  const counter = f >= lockedAt ? 65.4 : Math.min(65.4, 65.4 * share);
  const sinceLock = f - lockedAt;
  const lockE = decay(f, lockedAt, 12);

  // --- flight arcs
  const arcs = ARCS.map(([a, b], i) => {
    const start = S4.arcs[i];
    const p = easeOut(ramp(f, start, start + 90));
    if (p <= 0) return null;
    const A = centroid(a);
    const B = centroid(b);
    const dist = Math.hypot(B.x - A.x, B.y - A.y);
    const ctrl = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 - dist * 0.42 };
    const pts = Array.from({ length: 31 }, (_, n) => bez(A, ctrl, B, (n / 30) * p));
    const d = pts.map((q, n) => `${n ? 'L' : 'M'} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ');
    const head = pts[pts.length - 1];
    const prev = pts[pts.length - 2] ?? head;
    const ang = (Math.atan2(head.y - prev.y, head.x - prev.x) * 180) / Math.PI;
    return (
      <g key={i}>
        <path d={d} fill="none" stroke="rgba(244,241,234,.85)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#E11D48" strokeWidth={4} strokeDasharray="12 9" strokeDashoffset={-f * 0.9} strokeLinecap="round" />
        <g transform={`translate(${head.x} ${head.y}) rotate(${ang})`}>
          <path d="M14 0 L-9 -9 L-4 0 L-9 9 Z" fill={C.paper} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
        </g>
      </g>
    );
  });
  const cities = Object.keys(CITY_LABEL).map((id) => {
    const c = centroid(id);
    const pulse = ((f + id.length * 12) % 90) / 90;
    return (
      <g key={id}>
        <circle cx={c.x} cy={c.y} r={7} fill={C.paper} stroke={C.ink} strokeWidth={2.5} />
        <circle cx={c.x} cy={c.y} r={7 + pulse * 26} fill="none" stroke="#fff" strokeOpacity={1 - pulse} strokeWidth={2.5} />
        <text x={c.x + 12} y={c.y - 12} fontFamily={FONT.mono} fontWeight={700} fontSize={22} fill={C.paper} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" paintOrder="stroke" letterSpacing="0.04em">
          {CITY_LABEL[id]}
        </text>
      </g>
    );
  });

  const impacts = [lockedAt, ...S4.arcs.map((s) => s + 90)];
  const lamp = { x: 0.5, y: 0.48, intensity: 1, radius: 1100 * S, tint: '255,190,120' };

  // --- HUD: counter + flying press, in its own perspective so they pass the lens
  const countSize = (portrait ? 250 : 270) * S;
  const ca = Math.max(0, lockE - 0.1) * 9 * S;
  const countColor = interpolateColors(clamp01(counter / 65.4), [0, 0.5, 1], [C.paper, C.amberLight, '#FF4D4D']);
  const caption = typed('Nationwide contagion', ramp(f, 10, 80));
  const w0 = (portrait ? 500 : 520) * S;

  const hud = (
    <>
      <div style={{ position: 'absolute', inset: 0, perspective: 1400 }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transformStyle: 'preserve-3d' }}>
          {FLY.map((c, i) => {
            const p = (f - S4.fly[i]) / S4.flyLen;
            if (p < 0 || p > 1) return null;
            const z = flightZ(p);
            const zPrev = flightZ(Math.max(0, p - 1 / S4.flyLen));
            const speed = Math.abs(z - zPrev);
            const bl = Math.max(0, z - 500) / 150 + Math.max(0, -z - 1000) / 170 + speed * 0.09; // depth of field + motion
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: c.x * w - w0 / 2 + (portrait ? 0 : c.x * 380),
                  top: c.y * h - 120 * S,
                  transform: `translateZ(${z}px) rotate(${c.rot + p * (c.rot > 0 ? 9 : -9)}deg)`,
                  filter: bl > 0.4 ? `blur(${Math.min(bl, 16)}px)` : undefined,
                  opacity: clamp01(p / 0.12) * (1 - ramp(p, 0.9, 1)),
                }}
              >
                {c.kind === 'VIRAL' ? <ViralReceipt w={w0} seen={c.sub} text={c.text} /> : <BreakingFront w={w0} head={c.text} sub={c.sub} />}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: 'absolute', left: (portrait ? 60 : 90) * S, top: (portrait ? 140 : 80) * S, opacity: clamp01((f - 8) / 6) }}>
        <Dymo size={34 * S} rot={-2}>
          {caption}
        </Dymo>
      </div>

      <div
        style={{
          position: 'absolute',
          left: portrait ? 0 : 90 * S,
          right: portrait ? 0 : undefined,
          bottom: (portrait ? 150 : 90) * S,
          textAlign: portrait ? 'center' : 'left',
          transform: `scale(${1 + lockE * 0.12})`,
          transformOrigin: portrait ? '50% 100%' : '0 100%',
        }}
      >
        <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: countSize, lineHeight: 0.9, letterSpacing: '-0.03em', color: countColor, textShadow: `${caShadow(ca)}${ca > 0.3 ? ',' : ''} 0 ${8 * S}px ${40 * S}px rgba(0,0,0,.85)`.replace(/^none, /, ''), filter: 'url(#press)' }}>
          {counter.toFixed(1)}%
        </div>
        <div style={{ marginTop: 8 * S, display: 'inline-flex', alignItems: 'center', gap: 22 * S }}>
          <span style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 56 * S, letterSpacing: '0.2em', color: C.paper, textShadow: '0 4px 20px rgba(0,0,0,.8)' }}>BELIEVERS</span>
          {sinceLock >= 0 && (
            <div style={{ transform: `scale(${1 + (1 - clamp01(sinceLock / 10)) * 1.6})`, opacity: clamp01(sinceLock / 4), filter: sinceLock < 8 ? `blur(${(8 - sinceLock) * 0.8}px)` : undefined }}>
              <Stamp lines={['MAJORITY']} size={38 * S} rot={-7} color="#FF4D4D" />
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <CinematicRig id="s4" cam={cam} camPrev={camAt(f - 1)} lamp={lamp} impacts={impacts} hud={hud} fadeIn={6} darkness={0.55} shakeAmp={0.7}>
      <Desk kind="mahogany" />
      <div
        style={{
          position: 'absolute',
          left: -mapW / 2,
          top: -(mapW * 600) / 744 / 2,
          filter: 'drop-shadow(10px 18px 6px rgba(0,0,0,.45)) drop-shadow(0 40px 34px rgba(0,0,0,.6))',
        }}
      >
        <NigeriaMap width={mapW} fillFor={fillFor} strokeFor={strokeFor} strokeWidth={1.4} overlay={<g>{arcs}{cities}</g>} />
      </div>
    </CinematicRig>
  );
};
