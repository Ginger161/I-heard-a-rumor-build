import React from 'react';
import Nigeria from '@svg-maps/nigeria';
import { MAP_H, MAP_W, POP_BY_SVG, TOTAL_POP, centroid } from './NigeriaMap';
import { useLayout } from '../layout';
import sim from '../simdata.json';

export type SimFrame = { day: number; heard: Record<string, number>; believers: Record<string, number>; doubt: Record<string, number>; heat: number; coverUp: number; sparks: number; channels: number; freshness: number };
export type SimRun = { target: string; seed: number; status: string; day: number; frames: SimFrame[] };
export const SIM = sim as unknown as { win: SimRun; lose: SimRun };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Interpolated sim state at a fractional frame index (clamped), so the map blooms smoothly between the daily snapshots. */
export const simAt = (run: SimRun, idx: number) => {
  const n = run.frames.length - 1;
  const i = Math.max(0, Math.min(n, idx));
  const a = run.frames[Math.floor(i)];
  const b = run.frames[Math.min(n, Math.floor(i) + 1)];
  const k = i - Math.floor(i);
  const mix = (ra: Record<string, number>, rb: Record<string, number>) => Object.fromEntries(Object.keys(ra).map((id) => [id, lerp(ra[id], rb[id], k)]));
  return {
    day: Math.round(lerp(a.day, b.day, k)),
    heard: mix(a.heard, b.heard),
    believers: mix(a.believers, b.believers),
    doubt: mix(a.doubt, b.doubt),
    heat: lerp(a.heat, b.heat, k),
    coverUp: lerp(a.coverUp, b.coverUp, k),
    sparks: lerp(a.sparks, b.sparks, k),
    channels: Math.round(lerp(a.channels, b.channels, k)),
    freshness: lerp(a.freshness, b.freshness, k),
  };
};
export const nationalBelievers = (believers: Record<string, number>) => Object.entries(believers).reduce((acc, [id, v]) => acc + v * (POP_BY_SVG[id] ?? 0), 0) / TOTAL_POP;
export const nationalHeard = (heard: Record<string, number>) => Object.entries(heard).reduce((acc, [id, v]) => acc + v * (POP_BY_SVG[id] ?? 0), 0) / TOTAL_POP;

const mixHex = (a: [number, number, number], b: [number, number, number], t: number) => `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
const BASE: [number, number, number] = [30, 42, 60];
const AMBER: [number, number, number] = [245, 158, 11];
const CRIMSON: [number, number, number] = [225, 29, 72];
const topColor = (heard: number, believers: number) => {
  const h = Math.min(1, heard * 1.6);
  const b = Math.min(1, believers * 2.2);
  const warm = mixHex(BASE, AMBER, h);
  const m = warm.match(/\d+/g)!.map(Number) as [number, number, number];
  return mixHex(m, CRIMSON, b);
};

const LAYERS = 12;

/**
 * The game's real Nigeria map, extruded: every state rises as the rumour reaches it (stacked slabs with dark sides and a bright
 * top face), and flight arcs carry it between the five airport hubs. Driven by a day-by-day bot-played game from the real engine.
 */
export const Map3D: React.FC<{ run: SimRun; idx: number; frame: number; w: number; lift?: number; showFlights?: boolean; sparkAt?: string }> = ({ run, idx, frame, w, lift = 1, showFlights = true, sparkAt }) => {
  const { S } = useLayout();
  const W = w * S;
  const H = (W * MAP_H) / MAP_W;
  const st = simAt(run, idx);
  const gap = 9 * S * lift;
  const levels: Record<string, number> = {};
  Nigeria.locations.forEach((l) => {
    const l1 = Math.min(1, (st.heard[l.id] ?? 0) * 0.55 + (st.believers[l.id] ?? 0) * 1.1);
    levels[l.id] = Math.round(l1 * LAYERS);
  });

  const hubs = ['lagos', 'fct', 'kano', 'rivers', 'enugu'].filter((id) => (st.heard[id] ?? 0) > 0.04);
  const k = W / MAP_W;
  const arcs: { d: string; pts: (p: number) => [number, number] }[] = [];
  for (let i = 0; i < hubs.length; i++) {
    for (let j = i + 1; j < hubs.length; j++) {
      const a = centroid(hubs[i]);
      const b = centroid(hubs[j]);
      if (!a || !b) continue;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2 - Math.hypot(a.x - b.x, a.y - b.y) * 0.28;
      arcs.push({
        d: `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`,
        pts: (p) => [(1 - p) * (1 - p) * a.x + 2 * (1 - p) * p * mx + p * p * b.x, (1 - p) * (1 - p) * a.y + 2 * (1 - p) * p * my + p * p * b.y],
      });
    }
  }
  const topZ = (LAYERS + 1.4) * gap;

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d' }}>
      {/* the shadow the whole slab casts on the floor */}
      <div style={{ position: 'absolute', left: -W / 2, top: -H / 2, width: W, height: H, transform: `translateZ(${-40 * S}px)` }}>
        <svg width={W} height={H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ filter: `blur(${34 * S}px)`, opacity: 0.9 }}>
          {Nigeria.locations.map((l) => <path key={l.id} d={l.path} fill="#000" />)}
        </svg>
      </div>
      {Array.from({ length: LAYERS + 1 }, (_, layer) => (
        <div key={layer} style={{ position: 'absolute', left: -W / 2, top: -H / 2, width: W, height: H, transform: `translateZ(${layer * gap}px)` }}>
          <svg width={W} height={H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ overflow: 'visible', display: 'block' }}>
            {Nigeria.locations.map((l) => {
              const lv = levels[l.id];
              if (layer > lv) return null;
              const top = layer === lv;
              const hd = st.heard[l.id] ?? 0;
              const bl = st.believers[l.id] ?? 0;
              const hot = bl > 0.18;
              return (
                <path
                  key={l.id}
                  d={l.path}
                  fill={top ? topColor(hd, bl) : `rgb(${14 + layer * 2},${18 + layer * 2},${26 + layer * 2})`}
                  stroke={top ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'}
                  strokeWidth={top ? 1.6 : 1}
                  strokeLinejoin="round"
                  style={top && hot ? { filter: 'drop-shadow(0 0 7px rgba(225,29,72,0.9))' } : undefined}
                />
              );
            })}
          </svg>
        </div>
      ))}
      {showFlights && (
        <div style={{ position: 'absolute', left: -W / 2, top: -H / 2, width: W, height: H, transform: `translateZ(${topZ}px)` }}>
          <svg width={W} height={H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ overflow: 'visible' }}>
            {arcs.map((a, i) => {
              const p = ((frame / 60) * 0.32 + i * 0.23) % 1;
              const [px, py] = a.pts(p);
              const [qx, qy] = a.pts(Math.min(1, p + 0.02));
              const ang = (Math.atan2(qy - py, qx - px) * 180) / Math.PI;
              return (
                <g key={i}>
                  <path d={a.d} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2.2} strokeDasharray="7 7" strokeDashoffset={-frame * 0.6} />
                  <g transform={`translate(${px} ${py}) rotate(${ang})`}>
                    <path d="M 11 0 L 3 -2.2 L -1 -9 L -4 -9 L -2.6 -2.2 L -8 -1.6 L -10 -4.5 L -12 -4.5 L -10.6 0 L -12 4.5 L -10 4.5 L -8 1.6 L -2.6 2.2 L -4 9 L -1 9 L 3 2.2 Z" fill="#fff" stroke={'#E11D48'} strokeWidth={1.1} transform="scale(1.5)" style={{ filter: 'drop-shadow(0 0 6px #E11D48)' }} />
                  </g>
                </g>
              );
            })}
            {sparkAt && centroid(sparkAt) && (
              <circle cx={centroid(sparkAt).x} cy={centroid(sparkAt).y} r={10 + (frame % 60) * 0.9} fill="none" stroke="#F59E0B" strokeWidth={3} opacity={Math.max(0, 1 - (frame % 60) / 60)} />
            )}
          </svg>
        </div>
      )}
      {k < 0 && null}
    </div>
  );
};
