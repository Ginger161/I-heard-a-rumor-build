import React, { useState, useRef } from 'react';
import { GameState } from '../../engine/types';
import { CHANNELS_DATA } from '../../engine/data/channels';

interface BoardProps {
  gameState: GameState;
  onClose: () => void;
  onBuy: (channelId: string) => void;
}

const BRANCH_LABELS = [
  { name: 'STREET', y: 150 },
  { name: 'SOCIAL', y: 350 },
  { name: 'PRESS', y: 550 },
  { name: 'ELITE', y: 750 }
];

// Helper to render clean, tabloid-style SVG icons based on branch
const BranchIcon = ({ branch, isLocked }: { branch: string; isLocked: boolean }) => {
  if (isLocked) {
    return (
      <svg className="w-5 h-5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    );
  }
  
  switch (branch) {
    case 'STREET': // Megaphone
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l18-5v12L3 14v-3z"></path>
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
        </svg>
      );
    case 'SOCIAL': // Smartphone
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      );
    case 'PRESS': // Newspaper
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
          <path d="M18 14h-8"></path>
          <path d="M15 18h-5"></path>
          <path d="M10 6h8v4h-8V6Z"></path>
        </svg>
      );
    case 'ELITE': // Pillar/Bank
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18"></path>
          <path d="M3 10h18"></path>
          <path d="M5 6l7-3 7 3"></path>
          <path d="M4 10v11"></path>
          <path d="M20 10v11"></path>
          <path d="M8 14v3"></path>
          <path d="M12 14v3"></path>
          <path d="M16 14v3"></path>
        </svg>
      );
    default:
      return null;
  }
};

export const ConspiracyBoard: React.FC<BoardProps> = ({ gameState, onClose, onBuy }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const isDragging = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startPan.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    let newX = e.clientX - startPan.current.x;
    let newY = e.clientY - startPan.current.y;
    newX = Math.max(Math.min(newX, 100), -1600); 
    newY = Math.max(Math.min(newY, 100), -500); 
    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handlePointerUp = () => { isDragging.current = false; };

  return (
    <div className="absolute inset-0 z-50 bg-[#EFEBE0] flex flex-col font-serif select-none overflow-hidden animate-slide-up">
      
      {/* HEADER */}
      <div className="relative z-20 border-b-2 border-[#1A1A1A] p-4 flex justify-between items-start bg-[#EFEBE0] shadow-sm">
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")' }}
        ></div>
        <div>
          <h2 className="text-2xl font-black tracking-wider uppercase text-[#1A1A1A] leading-none mb-1">The Conspiracy<br/>Board</h2>
        </div>
        <div className="flex items-center gap-3 relative">
          <div className="relative bg-[#FDE68A] text-[#B45309] font-black text-lg px-4 py-2 border-2 border-[#1A1A1A] rotate-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/60 border border-slate-300 rotate-[-4deg] opacity-70"></div>
            {gameState.sparks} ⚡
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] rounded font-black text-xl flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* PANNING CANVAS */}
      <div 
        className="flex-1 relative cursor-grab active:cursor-grabbing bg-[#EFEBE0] touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")' }}
        ></div>

        <div 
          className="absolute inset-0 origin-top-left transition-transform duration-75"
          style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
        >
          {/* LANE DIVIDERS & ROW LABELS */}
          <svg className="absolute inset-0 w-[2000px] h-[1000px] pointer-events-none">
            <line x1="0" y1="250" x2="2000" y2="250" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="6,6" opacity="0.15" />
            <line x1="0" y1="450" x2="2000" y2="450" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="6,6" opacity="0.15" />
            <line x1="0" y1="650" x2="2000" y2="650" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="6,6" opacity="0.15" />
          </svg>

          {BRANCH_LABELS.map((branch, i) => (
            <div key={branch.name} className="absolute flex items-center justify-center z-10" style={{ left: 15, top: branch.y - 15 }}>
              <div className={`bg-[#F4F1EA] border border-[#1A1A1A] px-3 py-1 font-black text-sm uppercase tracking-widest shadow-sm ${i % 2 === 0 ? 'rotate-[-3deg]' : 'rotate-[2deg]'}`}>
                {branch.name}
              </div>
            </div>
          ))}

          {/* RED STRINGS */}
          <svg className="absolute inset-0 w-[2000px] h-[1000px] pointer-events-none">
            {CHANNELS_DATA.map(node => {
              if (!node.requires || node.requires.length === 0) return null;
              return node.requires.map(reqId => {
                const parent = CHANNELS_DATA.find(n => n.id === reqId);
                if (!parent) return null;
                
                const isUnlocked = gameState.unlockedChannels.includes(node.id);
                const isParentUnlocked = gameState.unlockedChannels.includes(parent.id);
                
                let strokeColor = "#1A1A1A"; 
                let strokeWidth = "2";
                let strokeDash = "6,6";
                let opacity = "0.15";

                if (isUnlocked) { 
                  strokeColor = "#B91C1C"; 
                  strokeWidth = "3"; 
                  strokeDash = "none";
                  opacity = "0.9";
                } else if (isParentUnlocked) { 
                  strokeColor = "#D97706"; 
                  strokeWidth = "2"; 
                  strokeDash = "4,4"; 
                  opacity = "0.7";
                }

                const mx = (parent.gridX + node.gridX) / 2;
                return (
                  <path 
                    key={`${parent.id}-${node.id}`}
                    d={`M ${parent.gridX} ${parent.gridY} C ${mx} ${parent.gridY}, ${mx} ${node.gridY}, ${node.gridX} ${node.gridY}`}
                    stroke={strokeColor} 
                    strokeWidth={strokeWidth} 
                    strokeDasharray={strokeDash}
                    fill="none"
                    opacity={opacity}
                  />
                );
              });
            })}
          </svg>

          {/* DYMO-TAPED NODES */}
          {CHANNELS_DATA.map(node => {
            const isUnlocked = gameState.unlockedChannels.includes(node.id);
            const isAvailable = node.requires.length === 0 || node.requires.every(r => gameState.unlockedChannels.includes(r));
            const canAfford = gameState.sparks >= node.cost;

            // Determine visual state based on Affordability
            let circleClasses = "bg-[#EFEBE0] border-2 border-dashed border-slate-400 opacity-50";
            let pinColor = "bg-slate-400";
            let iconColor = "text-slate-400";

            if (isUnlocked) {
              circleClasses = "bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#B91C1C] hover:scale-105 cursor-pointer";
              pinColor = "bg-[#B91C1C]"; // Deep Red pin for owned
              iconColor = "text-[#1A1A1A]";
            } else if (isAvailable && canAfford) {
              // The "READY" Pulse
              circleClasses = "bg-white border-4 border-[#1A1A1A] shadow-[0_0_15px_rgba(217,119,6,0.6)] animate-pulse hover:scale-105 cursor-pointer";
              pinColor = "bg-[#D97706]"; // Amber/Gold pin for ready to buy
              iconColor = "text-[#1A1A1A]";
            } else if (isAvailable && !canAfford) {
              circleClasses = "bg-white border-4 border-[#1A1A1A] shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:scale-105 cursor-pointer opacity-80";
              pinColor = "bg-slate-300"; // Grey pin for broke
              iconColor = "text-slate-500";
            }

            // Shorten name for Dymo tape (max 12 chars roughly)
            const shortName = node.name.length > 12 ? node.name.substring(0, 11) + '.' : node.name;
            // Randomize tape tilt slightly
            const tapeTilt = node.gridX % 3 === 0 ? 'rotate-[-3deg]' : 'rotate-[2deg]';

            return (
              <div 
                key={node.id}
                onClick={() => (isAvailable || isUnlocked) && setSelectedNode(node.id)}
                className="absolute flex flex-col items-center justify-center group"
                style={{ left: node.gridX, top: node.gridY, transform: 'translate(-50%, -50%)' }}
              >
                <div className={`w-12 h-12 rounded-full relative flex items-center justify-center transition-all ${circleClasses}`}>
                  
                  {/* Pushpin */}
                  {(isUnlocked || isAvailable) && (
                    <div className={`absolute -top-1.5 w-3.5 h-3.5 rounded-full shadow-[2px_2px_2px_rgba(0,0,0,0.4)] border border-[#1A1A1A] z-10 ${pinColor}`}>
                      <div className="absolute top-[2px] left-[2px] w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    </div>
                  )}

                  {/* SVG Icon inside circle */}
                  <div className={iconColor}>
                    <BranchIcon branch={node.branch} isLocked={!isAvailable && !isUnlocked} />
                  </div>
                </div>

                {/* Dymo Tape Label */}
                {(isUnlocked || isAvailable) && (
                  <div className={`mt-1.5 bg-[#1A1A1A] text-[#F4F1EA] font-mono text-[9px] px-1.5 py-0.5 shadow-sm tracking-tighter uppercase whitespace-nowrap z-20 ${tapeTilt}`}>
                    {shortName}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED MANILA FOLDER PANEL */}
      {selectedNode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-[#F4F1EA] border-4 border-[#1A1A1A] p-4 shadow-[8px_8px_0px_#1A1A1A] rounded-xl flex flex-col z-30 animate-slide-up">
          {(() => {
            const channel = CHANNELS_DATA.find(c => c.id === selectedNode);
            if (!channel) return null;
            const isUnlocked = gameState.unlockedChannels.includes(channel.id);
            const canAfford = gameState.sparks >= channel.cost;

            return (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 border border-[#1A1A1A] rounded-sm mr-2">{channel.branch}</span>
                    <h3 className="font-black text-lg mt-1 leading-tight text-[#1A1A1A] pr-4">{channel.name}</h3>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="font-black text-2xl p-1 active:scale-90 transition-transform cursor-pointer">✕</button>
                </div>
                
                <p className="text-xs font-sans text-slate-600 italic mb-4 leading-relaxed border-l-4 border-slate-300 pl-3">"{channel.flavorTexts.DEFAULT[0]}"</p>
                
                {!isUnlocked ? (
                  <button
                    onClick={() => {
                      if (canAfford) {
                        onBuy(channel.id);
                        setSelectedNode(null);
                      }
                    }}
                    className={`py-3 font-black text-xs uppercase tracking-widest border-2 rounded-lg transition-all ${
                      canAfford 
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer' 
                        : 'bg-transparent text-slate-400 border-dashed border-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? `Acquire Channel (${channel.cost} ⚡)` : 'Insufficient Sparks'}
                  </button>
                ) : (
                  <div className="py-2 text-center border-2 border-[#8B0000] text-[#8B0000] font-black uppercase tracking-widest bg-red-50 rounded-lg">
                    Channel Acquired
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
