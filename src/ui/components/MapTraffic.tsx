import React from 'react';
import { getStateCentroid } from '../../engine/data/mapGeometry';
import { AIRPORT_HUBS } from '../../engine/data/zones';

// PLANES AND SHIPS. Something is always moving on the map, which keeps the eye (and the thumb) busy.
//  - Grey, faint traffic is ordinary Nigeria: planes between the five airports and ships along the coast.
//  - Red traffic is carrying the rumour: a plane for every pair of airport states that both know it, and ships once a port state knows it.
// The red planes mirror how the rumour really jumps by air. Ships are for show (the rumour does not travel by sea in the rules).
// All of it is drawn with SMIL so it costs no React renders, and it is switched off by "Reduce motion".

// The offshore shipping lane, west to east, checked to stay in open water. Each stop is a port state.
const LANE: { id: string; x: number; y: number }[] = [
  { id: 'lagos', x: 40, y: 482 }, { id: 'ondo', x: 100, y: 515 }, { id: 'delta', x: 169, y: 577 }, { id: 'bayelsa', x: 192, y: 606 },
  { id: 'rivers', x: 252, y: 603 }, { id: 'akwa_ibom', x: 305, y: 602 }, { id: 'cross_river', x: 345, y: 598 }
];
const PORTS = new Set(['lagos', 'delta', 'bayelsa', 'rivers', 'akwa_ibom', 'cross_river']);
const lanePath = (rev: boolean) => {
  const pts = rev ? LANE.slice().reverse() : LANE;
  return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
};
const LANE_FWD = lanePath(false), LANE_REV = lanePath(true);

const arc = (a: string, b: string) => {
  const p = getStateCentroid(a), q = getStateCentroid(b);
  const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, dist = Math.hypot(q.x - p.x, q.y - p.y);
  return { d: `M ${p.x} ${p.y} Q ${mx} ${my - dist * 0.35} ${q.x} ${q.y}`, dist };
};

// Top-view aeroplane pointing along +x, about 22 units long.
const PLANE = 'M 11 0 L 3 -2.2 L -1 -9 L -4 -9 L -2.6 -2.2 L -8 -1.6 L -10 -4.5 L -12 -4.5 L -10.6 0 L -12 4.5 L -10 4.5 L -8 1.6 L -2.6 2.2 L -4 9 L -1 9 L 3 2.2 Z';

const Plane: React.FC<{ d: string; dur: number; begin: number; color: string; opacity: number; scale?: number }> = ({ d, dur, begin, color, opacity, scale = 1.5 }) => (
  <g opacity={0}>
    <g transform={`scale(${scale})`}>
      <path d={PLANE} fill={color} stroke="#F4F1EA" strokeWidth={1.2} strokeLinejoin="round" />
    </g>
    <animateMotion dur={`${dur}s`} begin={`${-begin}s`} repeatCount="indefinite" path={d} rotate="auto" />
    <animate attributeName="opacity" values={`0;${opacity};${opacity};0`} keyTimes="0;0.08;0.92;1" dur={`${dur}s`} begin={`${-begin}s`} repeatCount="indefinite" />
  </g>
);

const Ship: React.FC<{ d: string; dur: number; begin: number; color: string; opacity: number }> = ({ d, dur, begin, color, opacity }) => (
  <g opacity={0}>
    <g transform="scale(1.35)">
      <path d="M -9 1 L 9 1 L 12 -2.5 L -11 -2.5 Z" fill={color} stroke="#F4F1EA" strokeWidth={1} strokeLinejoin="round" />
      <path d="M -4 -2.5 L -4 -7 L 3 -7 L 3 -2.5 Z M -1.5 -7 L -1.5 -10 L 1 -10 L 1 -7 Z" fill={color} stroke="#F4F1EA" strokeWidth={0.8} strokeLinejoin="round" />
    </g>
    <animateMotion dur={`${dur}s`} begin={`${-begin}s`} repeatCount="indefinite" path={d} />
    <animate attributeName="opacity" values={`0;${opacity};${opacity};0`} keyTimes="0;0.06;0.94;1" dur={`${dur}s`} begin={`${-begin}s`} repeatCount="indefinite" />
  </g>
);

const GREY = '#64748B';
const RED = '#B91C1C';

// Pairs of airports, fixed order so animations keep their identity between renders.
const PAIRS: [string, string][] = AIRPORT_HUBS.flatMap((a, i) => AIRPORT_HUBS.slice(i + 1).map(b => [a, b] as [string, string]));
// The grey background flights: a handful of the busiest routes.
const AMBIENT_AIR: [string, string][] = [['lagos', 'fct'], ['fct', 'kano'], ['lagos', 'rivers'], ['enugu', 'fct']];

export const MapTraffic: React.FC<{ infected: ReadonlySet<string> }> = ({ infected }) => {
  const infectedPorts = [...PORTS].filter(p => infected.has(p));
  return (
    <g pointerEvents="none" aria-hidden>
      {/* ordinary traffic */}
      {AMBIENT_AIR.map(([a, b], i) => {
        const { d, dist } = arc(a, b);
        const lit = infected.has(a) && infected.has(b);
        return lit ? null : <Plane key={`ag_${a}_${b}`} d={d} dur={Math.max(8, dist / 38)} begin={i * 2.7} color={GREY} opacity={0.7} scale={1} />;
      })}
      <Ship key="sg_f" d={LANE_FWD} dur={26} begin={4} color={GREY} opacity={0.65} />
      <Ship key="sg_r" d={LANE_REV} dur={30} begin={17} color={GREY} opacity={0.65} />

      {/* the rumour: a route line and a red plane for every pair of airport states that both know it */}
      {PAIRS.filter(([a, b]) => infected.has(a) && infected.has(b)).slice(0, 6).map(([a, b], i) => {
        const { d, dist } = arc(a, b);
        return (
          <g key={`rg_${a}_${b}`}>
            <path d={d} fill="none" stroke={RED} strokeOpacity={0.4} strokeWidth={1.4} strokeDasharray="1 5" strokeLinecap="round" />
            <Plane d={d} dur={Math.max(8, dist / 26)} begin={(i * 2.3) % 8} color={RED} opacity={0.95} scale={1.25} />
          </g>
        );
      })}

      {/* the rumour by sea: red ships on the lane, one more for each port that knows it (up to four) */}
      {infectedPorts.length > 0 && (
        <path d={LANE_FWD} fill="none" stroke={RED} strokeOpacity={0.3} strokeWidth={1.4} strokeDasharray="1 5" strokeLinecap="round" />
      )}
      {infectedPorts.slice(0, 4).map((p, i) => (
        <Ship key={`rs_${p}`} d={i % 2 === 0 ? LANE_FWD : LANE_REV} dur={22 + i * 3} begin={i * 7} color={RED} opacity={0.95} />
      ))}
    </g>
  );
};
