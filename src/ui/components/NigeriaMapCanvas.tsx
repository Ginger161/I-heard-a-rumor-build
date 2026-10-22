import React, { useEffect, useMemo, useRef, useState } from 'react';
import NigeriaMapData from '@svg-maps/nigeria';
import { GameState, FlightEvent, StateNode } from '../../engine/types';
import { getStateCentroid } from '../../engine/data/mapGeometry';
import { toDataId } from '../../engine/data/mapIds';
import { AIRPORT_HUBS } from '../../engine/data/zones';
import { BALANCE } from '../../engine/balance';
import { seedSparkId } from '../../engine/actions';
import { SparkBubble } from './SparkBubble';
import { SpinBubble } from './SpinBubble';
import { ShatterBurst } from './common';

interface MapCanvasProps {
  gameState: GameState;
  ticking: boolean;
  onStateTap: (stateId: string | null) => void;
  onSparkTap: (sparkId: string) => void;
  onSpinTap: (spinId: string) => void;
}

const SHATTER_MS = 400;
const FLIGHT_MS = 1500;
const DRAG_THRESHOLD = 6;

// ---- colour helpers ----
const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lerpColor = (a: string, b: string, t: number): string => {
  const k = Math.max(0, Math.min(1, t));
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * k).toString(16).padStart(2, '0');
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`;
};

// Spec §4A choropleth: heard tints pale amber -> warm orange, believers tint light crimson -> blood red at 60%.
export const stateFill = (s: StateNode | undefined): string => {
  if (!s || (s.heard === 0 && s.believers === 0)) return '#F4F1EA';
  const heardPct = s.heard / s.population;
  const believerPct = s.believers / s.population;
  const heardColor = lerpColor('#FEF3C7', '#F59E0B', heardPct / 0.5);
  if (believerPct <= 0) return heardColor;
  const believerColor = lerpColor('#FECACA', '#991B1B', believerPct / 0.6);
  const weight = believerPct / (believerPct + heardPct + 1e-9);
  return lerpColor(heardColor, believerColor, weight * 1.4);
};

const FlightArc: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number } }> = ({ from, to }) => {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const d = `M ${from.x} ${from.y} Q ${mx} ${my - dist * 0.35} ${to.x} ${to.y}`;
  const dur = `${FLIGHT_MS / 1000}s`;
  return (
    <g pointerEvents="none">
      <path d={d} fill="none" stroke="#8B0000" strokeWidth="2" strokeDasharray="6 5" strokeLinecap="round" style={{ animation: 'flight-dash 0.6s linear infinite' }}>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${(FLIGHT_MS + 200) / 1000}s`} fill="freeze" />
      </path>
      <g>
        <path d="M -5 -5 L 9 0 L -5 5 L -2 0 Z" fill="#8B0000" stroke="#F4F1EA" strokeWidth="0.8" />
        <animateMotion dur={dur} path={d} rotate="auto" fill="freeze" />
        <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.92;1" dur={dur} fill="freeze" />
      </g>
    </g>
  );
};

export const NigeriaMapCanvas: React.FC<MapCanvasProps> = ({ gameState, ticking, onStateTap, onSparkTap, onSpinTap }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const origin = useRef({ px: 0, py: 0, tx: 0, ty: 0 });

  // Bubbles mid-shatter: the seed spark (deferred collect) and ghosts for already-collected sparks.
  const [seedShattering, setSeedShattering] = useState(false);
  const [ghosts, setGhosts] = useState<{ key: string; x: number; y: number; animating: boolean }[]>([]);

  // Flight arcs and border pulses are driven by transient events from the last tick.
  const seenFlights = useRef<Set<string>>(new Set());
  const [arcs, setArcs] = useState<FlightEvent[]>([]);
  const [pulsing, setPulsing] = useState<string[]>([]);

  useEffect(() => {
    const fresh = gameState.flightEvents.filter(f => !seenFlights.current.has(f.id));
    if (fresh.length === 0) return;
    fresh.forEach(f => seenFlights.current.add(f.id));
    setArcs(prev => [...prev, ...fresh]);
    const timer = setTimeout(() => setArcs(prev => prev.filter(a => !fresh.some(f => f.id === a.id))), FLIGHT_MS + 300);
    return () => clearTimeout(timer);
  }, [gameState.flightEvents]);

  const newlyInfectedKey = gameState.newlyInfectedIds.join(',');
  useEffect(() => {
    if (!newlyInfectedKey) return;
    setPulsing(newlyInfectedKey.split(','));
    const timer = setTimeout(() => setPulsing([]), 2000);
    return () => clearTimeout(timer);
  }, [newlyInfectedKey, gameState.currentDay]);

  useEffect(() => {
    if (!gameState.hasPlantedSeed || gameState.hasPoppedFirstSpark) setSeedShattering(false);
  }, [gameState.hasPlantedSeed, gameState.hasPoppedFirstSpark]);

  // ---- pan / zoom ----
  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    moved.current = false;
    origin.current = { px: e.clientX, py: e.clientY, tx: transform.x, ty: transform.y };
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - origin.current.px;
    const dy = e.clientY - origin.current.py;
    if (!moved.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    moved.current = true;
    setTransform(prev => ({ ...prev, x: origin.current.tx + dx, y: origin.current.ty + dy }));
  };
  const handlePointerUp = () => { dragging.current = false; };
  const handleWheel = (e: React.WheelEvent) => {
    setTransform(prev => ({ ...prev, scale: Math.min(Math.max(0.6, prev.scale - e.deltaY * 0.001), 3) }));
  };

  const tapSpark = (sparkId: string, x: number, y: number) => {
    const isSeed = !gameState.hasPoppedFirstSpark && gameState.startingStateId !== null && sparkId === seedSparkId(gameState.startingStateId);
    if (isSeed) {
      // Spec §3.5: 400ms shatter first, then bank +15 and pop the Ground Zero alert.
      setSeedShattering(true);
      setTimeout(() => onSparkTap(sparkId), SHATTER_MS);
      return;
    }
    const key = `${sparkId}_${Date.now()}`;
    setGhosts(g => [...g, { key, x, y, animating: false }]);
    requestAnimationFrame(() => setGhosts(g => g.map(gh => (gh.key === key ? { ...gh, animating: true } : gh))));
    setTimeout(() => setGhosts(g => g.filter(gh => gh.key !== key)), SHATTER_MS);
    onSparkTap(sparkId);
  };

  const locations = useMemo(() => NigeriaMapData?.locations ?? [], []);
  const selectedId = gameState.selectedStateId;

  // Render the selected / starting state last so its border is never covered by a neighbour.
  const ordered = useMemo(() => {
    return [...locations].sort((a, b) => {
      const rank = (id: string) => (toDataId(id) === selectedId ? 2 : toDataId(id) === gameState.startingStateId ? 1 : 0);
      return rank(a.id) - rank(b.id);
    });
  }, [locations, selectedId, gameState.startingStateId]);

  const earlyPulse = gameState.currentDay <= 3 || !gameState.hasPoppedFirstSpark;

  return (
    <div
      className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center bg-[#EADCC8] touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onClick={() => { if (!moved.current) onStateTap(null); }}
    >
      <div
        className="w-full h-full absolute flex items-center justify-center"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
      >
        <svg viewBox={NigeriaMapData?.viewBox || '0 0 744 600'} className="w-[94%] h-[94%] max-w-[640px] max-h-[520px] drop-shadow-md select-none overflow-visible">
          <defs>
            <pattern id="jadedHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#475569" strokeWidth="1.8" />
            </pattern>
            <pattern id="halftone" width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="0.9" fill="#8B0000" />
            </pattern>
          </defs>

          {/* STATES */}
          <g>
            {ordered.map(location => {
              const dataId = toDataId(location.id);
              const s = gameState.states[dataId];
              const isStart = gameState.startingStateId === dataId;
              const isSelected = selectedId === dataId;
              const isPulsing = pulsing.includes(dataId);
              const infected = !!s && (s.heard > 0 || s.believers > 0);
              const jadedRatio = s && s.population ? s.jaded / s.population : 0;
              const awareness = s && s.population ? (s.heard + s.believers) / s.population : 0;

              let stroke = '#1A1A1A';
              let strokeWidth = 1;
              if (isStart) { stroke = '#B45309'; strokeWidth = 2.5; }
              if (isSelected) { strokeWidth = 3; if (!isStart) stroke = '#1A1A1A'; }
              if (isPulsing) { stroke = '#F59E0B'; strokeWidth = 3; }

              return (
                <g
                  key={location.id}
                  className="cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    if (moved.current) return;
                    onStateTap(dataId);
                  }}
                >
                  <path
                    d={location.path}
                    fill={isStart && !gameState.hasPoppedFirstSpark ? '#FEF3C7' : stateFill(s)}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    className={`transition-colors duration-500 ${isStart && earlyPulse ? 'animate-pulse' : ''} ${isPulsing ? 'animate-border-pulse' : ''}`}
                  />
                  {infected && (
                    <path d={location.path} fill="url(#halftone)" opacity={Math.min(0.4, 0.08 + awareness * 0.5)} pointerEvents="none" />
                  )}
                  {jadedRatio > 0.25 && (
                    <path d={location.path} fill="url(#jadedHatch)" opacity="0.55" pointerEvents="none" />
                  )}
                </g>
              );
            })}
          </g>

          {/* AIRPORT HUB MARKERS */}
          {AIRPORT_HUBS.map(id => {
            const c = getStateCentroid(id);
            return (
              <text key={`hub_${id}`} x={c.x} y={c.y + 4} fontSize="11" textAnchor="middle" fill="#1A1A1A" opacity="0.55" pointerEvents="none">
                ✈
              </text>
            );
          })}

          {/* FLIGHT ARCS */}
          {arcs.map(a => (
            <FlightArc key={a.id} from={getStateCentroid(a.from)} to={getStateCentroid(a.to)} />
          ))}

          {/* SPARK BUBBLES */}
          {gameState.hasPlantedSeed && gameState.activeSparks.map(spark => {
            const c = getStateCentroid(spark.stateId);
            const x = c.x + spark.offsetX;
            const y = c.y + spark.offsetY;
            const isSeed = gameState.startingStateId !== null && spark.id === seedSparkId(gameState.startingStateId) && !gameState.hasPoppedFirstSpark;
            return (
              <foreignObject key={spark.id} x={x - 20} y={y - 20} width={40} height={40} style={{ overflow: 'visible' }}>
                <div onClick={e => e.stopPropagation()}>
                  <SparkBubble
                    amount={spark.amount}
                    urgent={spark.ticksRemaining <= 1}
                    shattering={isSeed && seedShattering}
                    onTap={() => tapSpark(spark.id, x, y)}
                  />
                </div>
              </foreignObject>
            );
          })}

          {/* SPIN BUBBLES */}
          {gameState.activeSpinBubbles.map(spin => {
            const c = getStateCentroid(spin.stateId);
            return (
              <foreignObject key={spin.id} x={c.x + spin.offsetX - 22} y={c.y + spin.offsetY - 22} width={44} height={44} style={{ overflow: 'visible' }}>
                <div onClick={e => e.stopPropagation()}>
                  <SpinBubble
                    ticksRemaining={spin.ticksRemaining}
                    lifetime={BALANCE.spinLifetimeTicks}
                    paused={!ticking}
                    onTap={() => onSpinTap(spin.id)}
                  />
                </div>
              </foreignObject>
            );
          })}

          {/* SHATTER GHOSTS for sparks that were just banked */}
          {ghosts.map(g => (
            <foreignObject key={g.key} x={g.x - 20} y={g.y - 20} width={40} height={40} style={{ overflow: 'visible' }} pointerEvents="none">
              <div className="relative w-10 h-10">
                <ShatterBurst animating={g.animating} />
              </div>
            </foreignObject>
          ))}
        </svg>
      </div>

      {/* ZOOM & RESET CONTROLS */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-20" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setTransform(p => ({ ...p, scale: Math.min(3, p.scale + 0.4) }))}
          className="w-10 h-10 bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] rounded-lg font-black text-xl flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.6, p.scale - 0.4) }))}
          className="w-10 h-10 bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] rounded-lg font-black text-xl flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          className="w-10 h-10 bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_rgba(0,0,0,0.3)] rounded-lg font-black text-sm flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
          aria-label="Reset view"
        >
          ■
        </button>
      </div>
    </div>
  );
};
