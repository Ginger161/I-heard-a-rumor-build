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
import { haptic, sfx } from '../audio';
import { usePanZoom } from '../../hooks/usePanZoom';
import { focusTransform, layoutLabels, stateLabel } from '../../engine/data/stateLabels';
import { StateFinder } from './StateFinder';
import { MapTraffic } from './MapTraffic';
import { ZONE_TINT } from '../zoneColors';
import type { ZoneId } from '../../engine/data/zones';
import { useSettings } from '../settings';

interface MapCanvasProps {
  gameState: GameState;
  ticking: boolean;
  onStateTap: (stateId: string | null) => void;
  onSparkTap: (sparkId: string) => void;
  onSpinTap: (spinId: string) => void;
}

const SHATTER_MS = 400;
const FLIGHT_MS = 1500;

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
const stateFill = (s: StateNode | undefined): string => {
  if (!s) return 'var(--z-none)';
  // Nobody has heard it yet: the region's own pale colour. The spread then paints amber and red over it.
  if (s.heard === 0 && s.believers === 0) return s.region ? `var(--z-${s.region})` : 'var(--z-none)';
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
        <g transform="scale(1.15)"><path d="M 11 0 L 3 -2.2 L -1 -9 L -4 -9 L -2.6 -2.2 L -8 -1.6 L -10 -4.5 L -12 -4.5 L -10.6 0 L -12 4.5 L -10 4.5 L -8 1.6 L -2.6 2.2 L -4 9 L -1 9 L 3 2.2 Z" fill="#8B0000" stroke="#F4F1EA" strokeWidth="0.9" strokeLinejoin="round" /></g>
        <animateMotion dur={dur} path={d} rotate="auto" fill="freeze" />
        <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.92;1" dur={dur} fill="freeze" />
      </g>
    </g>
  );
};

export const NigeriaMapCanvas: React.FC<MapCanvasProps> = ({ gameState, ticking, onStateTap, onSparkTap, onSpinTap }) => {
  const { t: transform, viewRef, moved, handlers, zoomBy, reset, setT } = usePanZoom({ minScale: 1, maxScale: 4, content: null, origin: 'center' });

  // The size of the map area, so state names can be fitted to the room there is (and refitted when you zoom or the phone turns).
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const read = () => setViewSize(v => (v.w === el.clientWidth && v.h === el.clientHeight ? v : { w: el.clientWidth, h: el.clientHeight }));
    read();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', read); return () => window.removeEventListener('resize', read); }
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewRef]);

  // "Find a state": pick any state from a written list; the map zooms to it and names it.
  const [finderOpen, setFinderOpen] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);
  const pickFromList = (id: string) => {
    setFinderOpen(false);
    setT(focusTransform(id, viewSize.w, viewSize.h));
    setFlashId(id);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashId(null), 3500);
    onStateTap(id);
  };
  // Bubbles are drawn inside the map, so they shrink with it. Their invisible tap area is sized from how big the map is on
  // screen right now, so it is always about 52 px across for a finger, at any zoom.
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mapWidth = svgRef.current?.getBoundingClientRect().width ?? 0;
  const unitPx = mapWidth > 0 ? mapWidth / (parseFloat((NigeriaMapData?.viewBox || '0 0 744 600').split(' ')[2]) || 744) : 0.6;
  const hitUnits = Math.min(120, 52 / Math.max(0.2, unitPx));

  // Bubbles mid-shatter: the seed spark (deferred collect) and ghosts for already-collected sparks.
  const [seedShattering, setSeedShattering] = useState(false);
  const [ghosts, setGhosts] = useState<{ key: string; x: number; y: number; animating: boolean; label: string; gold: boolean }[]>([]);
  // Rapid collects build a combo streak (cosmetic: sound, haptics and a badge).
  const comboRef = useRef({ n: 0, last: 0 });
  const [combo, setCombo] = useState<{ n: number; key: number } | null>(null);

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

  const tapSpark = (sparkId: string, x: number, y: number) => {
    const isSeed = !gameState.hasPoppedFirstSpark && gameState.startingStateId !== null && sparkId === seedSparkId(gameState.startingStateId);
    const spark = gameState.activeSparks.find(sp => sp.id === sparkId);
    const golden = spark?.kind === 'GOLDEN';
    sfx.play(golden ? 'golden' : 'pop');
    haptic(golden ? [18, 40, 18] : 12);
    if (isSeed) {
      // Spec §3.5: 400ms shatter first, then bank the first spark and pop the Ground Zero alert.
      setSeedShattering(true);
      setTimeout(() => onSparkTap(sparkId), SHATTER_MS);
      return;
    }
    // Combo: taps within 2.2s of each other stack.
    const now = Date.now();
    const streak = now - comboRef.current.last < 2200 ? comboRef.current.n + 1 : 1;
    comboRef.current = { n: streak, last: now };
    if (streak >= 3) {
      sfx.play('combo', streak);
      setCombo({ n: streak, key: now });
      setTimeout(() => setCombo(c => (c && c.key === now ? null : c)), 1300);
    }
    const key = `${sparkId}_${now}`;
    setGhosts(g => [...g, { key, x, y, animating: false, label: `+${spark?.amount ?? ''}`, gold: golden }]);
    requestAnimationFrame(() => setGhosts(g => g.map(gh => (gh.key === key ? { ...gh, animating: true } : gh))));
    setTimeout(() => setGhosts(g => g.filter(gh => gh.key !== key)), 900);
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

  const settings = useSettings();
  // The states that know the rumour (changes a few times a game, so the traffic is rebuilt only then).
  const infectedKey = Object.values(gameState.states).filter(st => st.heard > 0 || st.believers > 0).map(st => st.id).join(',');
  const infectedSet = useMemo(() => new Set(infectedKey ? infectedKey.split(',') : []), [infectedKey]);

  const earlyPulse = gameState.currentDay <= 3 || !gameState.hasPoppedFirstSpark;

  // Which state names fit right now. The selected, searched and starting states are always named.
  const bubbleKey = [...gameState.activeSparks.map(sp => `${sp.stateId}:${sp.offsetX}:${sp.offsetY}`), ...gameState.activeSpinBubbles.map(sp => `${sp.stateId}:${sp.offsetX}:${sp.offsetY}`)].join('|');
  const labels = useMemo(
    () => layoutLabels({
      avoid: [...gameState.hasPlantedSeed ? gameState.activeSparks : [], ...gameState.activeSpinBubbles].map(b => { const c = getStateCentroid(b.stateId); return { x: c.x + b.offsetX, y: c.y + b.offsetY }; }),
      viewW: viewSize.w, viewH: viewSize.h, scale: Math.round(transform.scale * 20) / 20, tx: Math.round(transform.x / 4) * 4, ty: Math.round(transform.y / 4) * 4,
      forced: [selectedId, flashId, gameState.startingStateId].filter((x): x is string => !!x)
    }),
    [viewSize.w, viewSize.h, transform.scale, transform.x, transform.y, selectedId, flashId, gameState.startingStateId, bubbleKey]
  );

  return (
    <div
      ref={viewRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center bg-transparent touch-none"
      {...handlers}
      onClick={() => { if (!moved.current) onStateTap(null); }}
    >
      <div
        className="w-full h-full absolute flex items-center justify-center"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
      >
        <svg ref={svgRef} viewBox={NigeriaMapData?.viewBox || '0 0 744 600'} className="w-[94%] h-[94%] max-w-[640px] max-h-[520px] drop-shadow-md select-none overflow-visible">
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

              // A highlighted state (the one you started in, the one you picked, one the news just reached) gets a DOUBLE outline: a dark ring with a
              // bright ring on top, so it stands out against any fill, pale or deep, in any mode.
              const isFlash = flashId === dataId;
              const hi = isFlash || isSelected || isPulsing ? 3 : isStart ? 2.5 : 0;

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
                    fill={isStart && !gameState.hasPoppedFirstSpark ? 'var(--m-start-fill)' : stateFill(s)}
                    stroke="var(--m-state-line)"
                    strokeWidth={1}
                    strokeLinejoin="round"
                    className="transition-colors duration-[900ms]"
                  />
                  {hi > 0 && (
                    <>
                      <path d={location.path} fill="none" stroke="var(--m-hi-outer)" strokeWidth={hi + 3} strokeLinejoin="round" pointerEvents="none" />
                      <path d={location.path} fill="none" stroke="var(--m-state-hi)" strokeWidth={hi} strokeLinejoin="round" pointerEvents="none"
                        className={isStart && earlyPulse ? 'animate-border-loop' : isPulsing || isFlash ? 'animate-border-pulse' : ''} />
                    </>
                  )}
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

          {/* STATE NAMES: written in full, same size on screen at every zoom, never overlapping or cut off */}
          <g pointerEvents="none" aria-hidden>
            {labels.map(l => (
              <text
                key={l.id}
                x={l.x}
                y={l.y - ((l.lines.length - 1) * l.fontUnits * 1.15) / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={l.fontUnits}
                fontWeight={800}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fill={l.forced ? 'var(--m-label-forced)' : 'var(--m-label)'}
                stroke="var(--m-label-halo)"
                strokeWidth={l.fontUnits * 0.32}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {l.lines.map((line, i) => <tspan key={i} x={l.x} dy={i === 0 ? 0 : l.fontUnits * 1.15}>{line}</tspan>)}
              </text>
            ))}
          </g>

          {/* AIRPORT HUB MARKERS */}
          {AIRPORT_HUBS.map(id => {
            const c = getStateCentroid(id);
            return (
              <text key={`hub_${id}`} x={c.x} y={c.y + 4} fontSize="11" textAnchor="middle" fill="var(--m-label)" opacity="0.55" pointerEvents="none">
                ✈
              </text>
            );
          })}

          {/* PLANES AND SHIPS: always something moving; red when it carries the rumour */}
          {!settings.reduceMotion && <MapTraffic infected={infectedSet} />}

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
                <div className="w-10 h-10 flex items-center justify-center" onClick={e => e.stopPropagation()}>
                  <SparkBubble
                    amount={spark.amount}
                    kind={spark.kind}
                    urgent={spark.ticksRemaining <= 1}
                    shattering={isSeed && seedShattering}
                    hit={hitUnits}
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
                    hit={hitUnits}
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
                <ShatterBurst animating={g.animating} color={g.gold ? '#F59E0B' : '#B45309'} />
                <div className={`absolute left-1/2 -top-1 -translate-x-1/2 whitespace-nowrap text-[13px] font-black animate-float-up ${g.gold ? 'text-[#92400E] drop-shadow-[0_0_4px_rgba(250,204,21,0.9)]' : 'text-[#92400E]'}`}>
                  {g.label} ⚡
                </div>
              </div>
            </foreignObject>
          ))}
        </svg>
      </div>

      {combo && (
        <div key={combo.key} className="absolute top-10 inset-x-0 flex justify-center pointer-events-none z-30">
          <div className="animate-combo-pop bg-[#1A1A1A] text-[#FDE68A] border-2 border-[#FDE68A] px-3 py-1 rounded-full font-black text-xs tracking-widest shadow-[3px_3px_0px_rgba(0,0,0,0.35)]">
            COMBO ×{combo.n}!
          </div>
        </div>
      )}

      {/* FIND A STATE: for everyone who cannot spot their own state by its shape */}
      <button
        data-tour="find-state"
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); setFinderOpen(true); }}
        className="absolute bottom-3 left-3 z-20 h-11 px-3 bg-[var(--m-btn-paper-bg)] text-[var(--m-btn-paper-fg)] border-2 border-[var(--m-line)] shadow-[2px_2px_0px_var(--m-line)] rounded-lg font-black text-[12px] font-sans flex items-center gap-1.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
      >
        <span aria-hidden>📍</span> Find a state
      </button>
      {finderOpen && (
        <StateFinder
          title={gameState.hasPlantedSeed ? 'Which state?' : 'Where the gist go start?'}
          subtitle={gameState.hasPlantedSeed ? 'Tap a state and the map goes straight to it.' : 'Tap your state, or any state, to plant the rumour there.'}
          grouped
          current={selectedId}
          onPick={pickFromList}
          onClose={() => setFinderOpen(false)}
        />
      )}
      {flashId && (
        <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none z-30">
          <div className="animate-pop-in bg-[#8B0000] text-white border-2 border-[#1A1A1A] rounded-full px-4 py-1.5 font-black text-sm shadow-[3px_3px_0px_#1A1A1A]">📍 {stateLabel(flashId)}</div>
        </div>
      )}

      {/* ZOOM & RESET CONTROLS */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-20" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => zoomBy(1.4)}
          className="w-10 h-10 bg-[var(--m-btn-paper-bg)] text-[var(--m-btn-paper-fg)] border-2 border-[var(--m-line)] shadow-[2px_2px_0px_var(--m-line)] rounded-lg font-black text-xl flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => zoomBy(1 / 1.4)}
          className="w-10 h-10 bg-[var(--m-btn-paper-bg)] text-[var(--m-btn-paper-fg)] border-2 border-[var(--m-line)] shadow-[2px_2px_0px_var(--m-line)] rounded-lg font-black text-xl flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          onClick={() => reset()}
          className="w-10 h-10 bg-[var(--m-btn-ink-bg)] text-[var(--m-btn-ink-fg)] border-2 border-[var(--m-line)] shadow-[2px_2px_0px_rgba(0,0,0,0.3)] rounded-lg font-black text-sm flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
          aria-label="Reset view"
        >
          ■
        </button>
      </div>
    </div>
  );
};
