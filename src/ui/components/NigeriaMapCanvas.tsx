import React, { useState, useRef } from 'react';
import { GameState } from '../../engine/types';
import NigeriaMapData from '@svg-maps/nigeria';
import { SparkBubble } from './SparkBubble';

interface MapCanvasProps {
  gameState: GameState;
  onStateTap: (stateId: string) => void;
  onSparkTap: (sparkId: string, amount: number) => void;
  plantSeed?: (stateId: string) => void;
}

// Helper to generate a scattered grid of dots over a specific area
const generateDotGrid = (bbox: { x: number; y: number; w: number; h: number }, _density: number) => {
  const dots: { x: number; y: number }[] = [];
  const spacing = 8; // Distance between dots
  for (let px = bbox.x; px < bbox.x + bbox.w; px += spacing) {
    for (let py = bbox.y; py < bbox.y + bbox.h; py += spacing) {
      // Add slight random jitter so it looks like ink, not a perfect grid
      const jitterX = (Math.random() - 0.5) * 4;
      const jitterY = (Math.random() - 0.5) * 4;
      dots.push({ x: px + jitterX, y: py + jitterY });
    }
  }
  // Shuffle array for random reveal order
  return dots.sort(() => Math.random() - 0.5);
};

// The wrapper for SVG Paths with dynamic dot density masking
const StatePathRenderer: React.FC<{ 
  stateId: string; 
  pathData: string; 
  bbox: { x: number; y: number; w: number; h: number };
  gameState: GameState; 
  isSelected: boolean;
  onClick: () => void;
}> = ({ stateId, pathData, bbox, gameState, isSelected, onClick }) => {
  const id = stateId.toLowerCase().replace(/[^a-z]/g, '');
  const entry = Object.entries(gameState.states).find(([k]) => {
    const normK = k.toLowerCase().replace(/[^a-z]/g, '');
    return normK === id || normK.startsWith(id.slice(0, 3)) || id.startsWith(normK.slice(0, 3));
  });
  const s = entry ? entry[1] : gameState.states[stateId];
  const heardPct = s && s.population ? s.heard / s.population : 0;
  const believersPct = s && s.population ? s.believers / s.population : 0;

  // Generate dots once per state based on its bounding box
  const dots = React.useMemo(() => generateDotGrid(bbox, 100), [bbox.x, bbox.y, bbox.w, bbox.h]);
  const isStartingState = gameState.startingStateId === stateId;

  return (
    <g onClick={onClick} className="cursor-pointer group">
      {/* 1. Define the clipping mask using the state's exact border */}
      <defs>
        <clipPath id={`clip-${stateId}`}>
          <path d={pathData} />
        </clipPath>
      </defs>

      {/* 2. Base Paper Background */}
      <path 
        d={pathData} 
        fill={isStartingState ? "#FEF3C7" : "#F4F1EA"} 
        stroke={isStartingState ? "#B45309" : "#1A1A1A"} 
        strokeWidth={isStartingState ? "2" : "1"} 
        className={`transition-all ${isStartingState ? 'animate-pulse' : 'group-hover:stroke-2'}`} 
      />
      
      {/* 3. The Dots (Clipped strictly inside the state border) */}
      <g clipPath={`url(#clip-${stateId})`}>
        {dots.map((dot, i) => {
          const threshold = i / dots.length;
          let fill = "transparent";
          let scale = 0;

          // Reveal red dots for believers, amber for heard
          if (threshold < believersPct) {
            fill = "#D9381E"; // Red
            scale = 1;
          } else if (threshold < heardPct) {
            fill = "#D97706"; // Amber
            scale = 1;
          }

          return (
            <circle 
              key={i} 
              cx={dot.x} 
              cy={dot.y} 
              r="1.5" 
              fill={fill} 
              className="transition-all duration-500"
              style={{ transform: `scale(${scale})`, transformOrigin: `${dot.x}px ${dot.y}px` }}
            />
          );
        })}
      </g>
    </g>
  );
};

// Exact Bounding Boxes for all Nigerian states in @svg-maps/nigeria (viewBox: "0 0 744 600")
const STATE_BBOXES: Record<string, { x: number; y: number; w: number; h: number }> = {
  abia: { x: 277, y: 491, w: 52, h: 75 },
  adamawa: { x: 540, y: 185, w: 143, h: 219 },
  'akwa-ibom': { x: 297, y: 522, w: 55, h: 66 },
  anambra: { x: 244, y: 444, w: 48, h: 68 },
  bauchi: { x: 373, y: 87, w: 149, h: 189 },
  benue: { x: 298, y: 360, w: 152, h: 106 },
  borno: { x: 555, y: 11, w: 189, h: 232 },
  bayelsa: { x: 167, y: 530, w: 85, h: 70 },
  'cross-river': { x: 322, y: 437, w: 100, h: 137 },
  delta: { x: 144, y: 460, w: 110, h: 94 },
  ebonyi: { x: 301, y: 443, w: 57, h: 70 },
  edo: { x: 143, y: 395, w: 107, h: 115 },
  ekiti: { x: 138, y: 364, w: 57, h: 51 },
  enugu: { x: 262, y: 424, w: 61, h: 74 },
  fct: { x: 252, y: 284, w: 56, h: 60 },
  gombe: { x: 487, y: 161, w: 88, h: 110 },
  imo: { x: 245, y: 497, w: 49, h: 47 },
  jigawa: { x: 337, y: 56, w: 155, h: 131 },
  kaduna: { x: 212, y: 150, w: 168, h: 157 },
  kebbi: { x: 51, y: 41, w: 158, h: 198 },
  kano: { x: 311, y: 82, w: 104, h: 129 },
  kogi: { x: 166, y: 323, w: 158, h: 138 },
  katsina: { x: 260, y: 34, w: 131, h: 141 },
  kwara: { x: 4, y: 235, w: 216, h: 137 },
  lagos: { x: 2, y: 449, w: 103, h: 21 },
  nassarawa: { x: 264, y: 284, w: 167, h: 100 },
  niger: { x: 57, y: 160, w: 233, h: 197 },
  ogun: { x: 0, y: 370, w: 120, h: 104 },
  ondo: { x: 104, y: 383, w: 105, h: 119 },
  osun: { x: 84, y: 363, w: 65, h: 71 },
  oyo: { x: 0, y: 295, w: 118, h: 134 },
  plateau: { x: 364, y: 223, w: 131, h: 125 },
  rivers: { x: 230, y: 510, w: 75, h: 85 },
  sokoto: { x: 90, y: 0, w: 165, h: 149 },
  taraba: { x: 399, y: 269, w: 178, h: 193 },
  yobe: { x: 434, y: 32, w: 175, h: 176 },
  zamfara: { x: 146, y: 44, w: 138, h: 147 }
};

function getStateBBox(stateId: string): { x: number; y: number; w: number; h: number } {
  const norm = stateId.toLowerCase().replace(/[^a-z]/g, '');
  const entry = Object.entries(STATE_BBOXES).find(([k]) => {
    const kNorm = k.toLowerCase().replace(/[^a-z]/g, '');
    return kNorm === norm || kNorm.startsWith(norm.slice(0, 3)) || norm.startsWith(kNorm.slice(0, 3));
  });
  return entry ? entry[1] : { x: 0, y: 0, w: 744, h: 600 };
}

// Centroids for spark positioning in @svg-maps/nigeria (viewBox: "0 0 744 600")
const STATE_CENTROIDS: Record<string, { x: number; y: number }> = {
  abia: { x: 303, y: 529 },
  adamawa: { x: 612, y: 295 },
  'akwa-ibom': { x: 324, y: 555 },
  anambra: { x: 268, y: 478 },
  bauchi: { x: 447, y: 182 },
  benue: { x: 374, y: 413 },
  borno: { x: 650, y: 127 },
  bayelsa: { x: 210, y: 565 },
  'cross-river': { x: 372, y: 506 },
  delta: { x: 199, y: 507 },
  ebonyi: { x: 329, y: 478 },
  edo: { x: 197, y: 452 },
  ekiti: { x: 167, y: 389 },
  enugu: { x: 292, y: 461 },
  fct: { x: 280, y: 314 },
  gombe: { x: 531, y: 216 },
  imo: { x: 269, y: 521 },
  jigawa: { x: 415, y: 121 },
  kaduna: { x: 296, y: 229 },
  kebbi: { x: 130, y: 140 },
  kano: { x: 363, y: 147 },
  kogi: { x: 245, y: 392 },
  katsina: { x: 326, y: 105 },
  kwara: { x: 112, y: 303 },
  lagos: { x: 54, y: 460 },
  nassarawa: { x: 348, y: 334 },
  niger: { x: 173, y: 259 },
  ogun: { x: 60, y: 422 },
  ondo: { x: 157, y: 443 },
  osun: { x: 117, y: 398 },
  oyo: { x: 59, y: 362 },
  plateau: { x: 429, y: 285 },
  rivers: { x: 268, y: 553 },
  sokoto: { x: 173, y: 74 },
  taraba: { x: 488, y: 366 },
  yobe: { x: 521, y: 120 },
  zamfara: { x: 215, y: 118 }
};

function getStateCentroid(stateId: string): { x: number; y: number } {
  const norm = stateId.toLowerCase().replace(/[^a-z]/g, '');
  const entry = Object.entries(STATE_CENTROIDS).find(([k]) => {
    const kNorm = k.toLowerCase().replace(/[^a-z]/g, '');
    return kNorm === norm || kNorm.startsWith(norm.slice(0, 3)) || norm.startsWith(kNorm.slice(0, 3));
  });
  return entry ? entry[1] : { x: 372, y: 300 };
}

export const NigeriaMapCanvas: React.FC<MapCanvasProps> = ({ 
  gameState, 
  onStateTap, 
  onSparkTap,
  plantSeed
}) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });

  // Basic Pan Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startPan.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - startPan.current.x,
      y: e.clientY - startPan.current.y
    }));
  };

  const handlePointerUp = () => { isDragging.current = false; };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    setTransform(prev => ({
      ...prev,
      scale: Math.min(Math.max(0.5, prev.scale - e.deltaY * zoomSensitivity), 3)
    }));
  };

  return (
    <div 
      className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center bg-[#EADCC8]"
      ref={mapRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      <div 
        className="w-full h-full absolute flex items-center justify-center transition-transform duration-75"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
      >
        {/* SVG MAP OF NIGERIA */}
        <svg 
          viewBox={NigeriaMapData?.viewBox || "0 0 744 600"} 
          className="w-[90%] h-[90%] max-w-[620px] max-h-[500px] drop-shadow-md select-none overflow-visible"
        >
          <g>
            {NigeriaMapData?.locations?.map(location => {
              const isSelected = selectedStateId === location.id || gameState.startingStateId === location.id;
              const bbox = getStateBBox(location.id);

              return (
                <StatePathRenderer
                  key={location.id}
                  stateId={location.id}
                  pathData={location.path}
                  bbox={bbox}
                  gameState={gameState}
                  isSelected={isSelected}
                  onClick={() => {
                    const stateId = location.id;
                    setSelectedStateId(stateId);
                    if (!gameState.hasPlantedSeed) {
                      if (plantSeed) {
                        plantSeed(stateId);
                      } else {
                        onStateTap(stateId);
                      }
                    } else {
                      onStateTap(stateId);
                    }
                  }}
                />
              );
            })}
          </g>

          {/* DYNAMIC SPARK BUBBLES PINNED IN SVG SPACE */}
          {gameState.hasPlantedSeed && (gameState.activeSparks || []).map(spark => {
            const centroid = getStateCentroid(spark.stateId);
            const posX = centroid.x + (spark.offsetX || 0);
            const posY = centroid.y + (spark.offsetY || 0);

            return (
              <foreignObject
                key={spark.id}
                x={posX - 20}
                y={posY - 20}
                width={40}
                height={40}
                className="overflow-visible"
                style={{ overflow: 'visible' }}
              >
                <div className="w-full h-full relative flex items-center justify-center">
                  <SparkBubble
                    id={spark.id}
                    amount={spark.amount}
                    x={20}
                    y={20}
                    onCollect={onSparkTap}
                  />
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>
      
      {/* ZOOM & RESET CONTROLS */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button 
          onClick={() => setTransform(p => ({ ...p, scale: Math.min(3, p.scale + 0.4) }))} 
          className="w-10 h-10 bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] rounded-lg font-black text-xl flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
          title="Zoom In"
        >
          +
        </button>
        <button 
          onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.6, p.scale - 0.4) }))} 
          className="w-10 h-10 bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] rounded-lg font-black text-xl flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
          title="Zoom Out"
        >
          -
        </button>
        <button 
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} 
          className="w-10 h-10 bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_rgba(0,0,0,0.3)] rounded-lg font-black text-xs flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] active:shadow-none cursor-pointer"
          title="Reset View"
        >
          ▣
        </button>
      </div>
    </div>
  );
};
