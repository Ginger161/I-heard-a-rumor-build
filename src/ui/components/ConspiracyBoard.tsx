import React, { useState } from 'react';
import { GameState } from '../../engine/types';
import { usePanZoom } from '../../hooks/usePanZoom';
import { CHANNELS_DATA, ChannelUpgrade } from '../../engine/data/channels';
import { getTarget } from '../../engine/data/targets';
import { channelFlavorLine } from '../../engine/data/flavor';
import { channelAvailable, isFrozen } from '../../engine/selectors';
import { BrutalButton, PaperGrain, SparkCounter, TapeStrip } from './common';

interface BoardProps {
  gameState: GameState;
  onClose: () => void;
  onBuy: (channelId: string) => void;
  docked?: boolean;   // desktop: fills its panel instead of covering the screen
}

const CANVAS_W = 2000;
const CANVAS_H = 1000;

const BRANCH_LABELS = [
  { name: 'STREET', y: 150 },
  { name: 'SOCIAL', y: 350 },
  { name: 'PRESS', y: 550 },
  { name: 'ELITE', y: 750 }
];
const DIVIDERS = [250, 450, 650];

const STAT_MAX = { velocity: 0.45, credibility: 0.5, notoriety: 0.4 };

const BranchIcon = ({ branch, isLocked }: { branch: string; isLocked: boolean }) => {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24' };
  if (isLocked) {
    return (
      <svg className="w-5 h-5 opacity-50" {...common}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }
  switch (branch) {
    case 'STREET': // Megaphone
      return (
        <svg className="w-6 h-6" {...common}>
          <path d="M3 11l18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      );
    case 'SOCIAL': // Smartphone
      return (
        <svg className="w-6 h-6" {...common}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'PRESS': // Newspaper
      return (
        <svg className="w-6 h-6" {...common}>
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
          <path d="M10 6h8v4h-8V6Z" />
        </svg>
      );
    default: // ELITE: classical pillars
      return (
        <svg className="w-6 h-6" {...common}>
          <path d="M3 21h18" />
          <path d="M3 10h18" />
          <path d="M5 6l7-3 7 3" />
          <path d="M6 10v11" />
          <path d="M18 10v11" />
          <path d="M10 14v3" />
          <path d="M14 14v3" />
        </svg>
      );
  }
};

// Dymo labels are short: first 12 characters of the part before any dash/slash.
const dymoName = (name: string): string => {
  const base = name.split(/ — | - /)[0].replace(/^["']|["']$/g, '');
  return base.length > 14 ? `${base.slice(0, 13)}.` : base;
};

const StatBar: React.FC<{ label: string; value: number; max: number; color: string; boosted?: boolean }> = ({ label, value, max, color, boosted }) => (
  <div className="flex items-center gap-2">
    <span className="w-20 text-[9px] font-black uppercase tracking-wider text-slate-600">{label}</span>
    <div className="flex-1 h-2.5 bg-[#EBE5D9] border border-[#1A1A1A] rounded-sm overflow-hidden">
      <div className="h-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }} />
    </div>
    <span className={`w-12 text-right text-[10px] font-black ${boosted ? 'text-[#B45309]' : 'text-[#1A1A1A]'}`}>+{value.toFixed(2)}</span>
  </div>
);

export const ConspiracyBoard: React.FC<BoardProps> = ({ gameState, onClose, onBuy, docked = false }) => {
  const { t: pan, viewRef, moved, handlers, zoomBy } = usePanZoom({ minScale: 0.4, maxScale: 1.6, content: { w: CANVAS_W, h: CANVAS_H }, origin: 'topleft', slack: 100 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const target = getTarget(gameState.activeTargetId);
  const category = gameState.scandalCategory;

  const selected: ChannelUpgrade | undefined = CHANNELS_DATA.find(c => c.id === selectedNode);

  return (
    <div className={docked ? 'relative h-full w-full bg-[#EFEBE0] flex flex-col font-serif select-none overflow-hidden' : 'absolute inset-0 z-50 bg-[#EFEBE0] flex flex-col font-serif select-none overflow-hidden animate-slide-up'}>
      {/* HEADER */}
      <div className="relative z-20 border-b-2 border-[#1A1A1A] p-4 flex justify-between items-start bg-[#EFEBE0] shadow-sm">
        <PaperGrain />
        <div className="relative">
          <h2 className="text-2xl font-black tracking-wider uppercase text-[#1A1A1A] leading-none mb-1">
            The Conspiracy<br />Board
          </h2>
          <div className="text-[9px] font-black tracking-widest uppercase text-[#1A1A1A]/50">
            {gameState.unlockedChannels.length}/{CHANNELS_DATA.length} channels • drag to pan, pinch to zoom
          </div>
        </div>
        <div className="flex items-center gap-3 relative">
          <SparkCounter value={gameState.sparks} className="text-lg px-4 py-2" />
          {!docked && <button
            onClick={onClose}
            aria-label="Close board"
            className="w-10 h-10 bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] rounded font-black text-xl flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] cursor-pointer"
          >
            ✕
          </button>}
        </div>
      </div>

      {/* PANNING CANVAS */}
      <div
        ref={viewRef}
        className="flex-1 relative cursor-grab active:cursor-grabbing bg-[#EFEBE0] touch-none overflow-hidden"
        {...handlers}
      >
        <PaperGrain />
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: CANVAS_W, height: CANVAS_H, transform: `translate(${pan.x}px, ${pan.y}px) scale(${pan.scale})` }}
        >
          {/* LANE DIVIDERS */}
          <svg className="absolute inset-0 pointer-events-none" width={CANVAS_W} height={CANVAS_H}>
            {DIVIDERS.map(y => (
              <line key={y} x1="0" y1={y} x2={CANVAS_W} y2={y} stroke="#1A1A1A" strokeWidth="1" strokeDasharray="6,6" opacity="0.15" />
            ))}
          </svg>

          {/* TAPED ROW LABELS */}
          {BRANCH_LABELS.map((branch, i) => (
            <div key={branch.name} className="absolute z-10" style={{ left: 15, top: branch.y - 15 }}>
              <div className={`relative bg-[#F4F1EA] border border-[#1A1A1A] px-3 py-1 font-black text-sm uppercase tracking-widest shadow-sm ${i % 2 === 0 ? 'rotate-[-3deg]' : 'rotate-[2deg]'}`}>
                <TapeStrip className="-top-2.5 left-1/2 -translate-x-1/2 rotate-[-3deg]" />
                {branch.name}
              </div>
              {branch.name === target.ai.weaknessBranch && (
                <div className="mt-1 text-[8px] font-black tracking-wider uppercase bg-[#065F46] text-white px-1.5 py-0.5 rounded-sm w-fit rotate-[1deg]">▲ Weak spot ×1.25</div>
              )}
              {branch.name === target.ai.resistanceBranch && (
                <div className="mt-1 text-[8px] font-black tracking-wider uppercase bg-[#8B0000] text-white px-1.5 py-0.5 rounded-sm w-fit rotate-[-1deg]">▼ Resists ×0.75</div>
              )}
            </div>
          ))}

          {/* RED STRINGS (cubic Beziers) */}
          <svg className="absolute inset-0 pointer-events-none" width={CANVAS_W} height={CANVAS_H}>
            {CHANNELS_DATA.flatMap(node =>
              node.requires.map(reqId => {
                const parent = CHANNELS_DATA.find(n => n.id === reqId);
                if (!parent) return null;
                const nodeOwned = gameState.unlockedChannels.includes(node.id);
                const parentOwned = gameState.unlockedChannels.includes(parent.id);

                let stroke = '#1A1A1A';
                let width = 2;
                let dash: string | undefined = '6,6';
                let opacity = 0.15;
                if (nodeOwned && parentOwned) { stroke = '#B91C1C'; width = 3; dash = undefined; opacity = 0.9; }
                else if (parentOwned) { stroke = '#D97706'; dash = '4,4'; opacity = 0.8; }

                const mx = (parent.gridX + node.gridX) / 2;
                return (
                  <path
                    key={`${parent.id}-${node.id}`}
                    d={`M ${parent.gridX} ${parent.gridY} C ${mx} ${parent.gridY}, ${mx} ${node.gridY}, ${node.gridX} ${node.gridY}`}
                    stroke={stroke}
                    strokeWidth={width}
                    strokeDasharray={dash}
                    fill="none"
                    opacity={opacity}
                  />
                );
              })
            )}
          </svg>

          {/* PUSHPIN NODES */}
          {CHANNELS_DATA.map(node => {
            const owned = gameState.unlockedChannels.includes(node.id);
            const available = channelAvailable(gameState, node);
            const canAfford = gameState.sparks >= node.cost;
            const locked = !owned && !available;
            const frozen = owned && isFrozen(gameState, node.id);
            const ready = !owned && available && canAfford;

            let circle = 'bg-[#EFEBE0] border-2 border-dashed border-slate-400 opacity-60';
            let pin = 'bg-slate-400';
            let icon = 'text-slate-400';
            if (owned && frozen) {
              circle = 'bg-[#E5E7EB] border-4 border-[#1E3A5F] shadow-[4px_4px_0px_#1E3A5F] opacity-80';
              pin = 'bg-[#1E3A5F]';
              icon = 'text-slate-500';
            } else if (owned) {
              circle = 'bg-white border-4 border-[#1A1A1A] shadow-[4px_4px_0px_#B91C1C] hover:scale-105';
              pin = 'bg-[#B91C1C]';
              icon = 'text-[#1A1A1A]';
            } else if (ready) {
              circle = 'bg-white border-4 border-[#1A1A1A] shadow-[0_0_15px_rgba(217,119,6,0.65)] animate-pulse hover:scale-105';
              pin = 'bg-[#D97706]';
              icon = 'text-[#1A1A1A]';
            } else if (available) {
              circle = 'bg-white border-4 border-[#1A1A1A] shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:scale-105 opacity-90';
              pin = 'bg-[#CBD5E1]';
              icon = 'text-slate-500';
            }
            const tilt = node.id.length % 2 === 0 ? 'rotate-[-2deg]' : 'rotate-[2deg]';

            return (
              <div
                key={node.id}
                onClick={() => { if (!moved.current) setSelectedNode(node.id); }}
                className="absolute flex flex-col items-center cursor-pointer"
                style={{ left: node.gridX, top: node.gridY, transform: 'translate(-50%, -24px)' }}
              >
                <div className={`w-12 h-12 rounded-full relative flex items-center justify-center transition-all ${circle}`}>
                  {!locked && (
                    <div className={`absolute -top-2 w-4 h-4 rounded-full shadow-[2px_2px_2px_rgba(0,0,0,0.4)] border border-[#1A1A1A] z-10 ${pin}`}>
                      <div className="absolute top-[2px] left-[2px] w-1.5 h-1.5 bg-white/40 rounded-full" />
                    </div>
                  )}
                  <div className={icon}>
                    <BranchIcon branch={node.branch} isLocked={locked} />
                  </div>
                  {frozen && (
                    <>
                      <div className="absolute w-[68px] h-2.5 bg-[#B91C1C]/90 border border-[#1A1A1A] rotate-45 z-20" />
                      <div className="absolute w-[68px] h-2.5 bg-[#B91C1C]/90 border border-[#1A1A1A] -rotate-45 z-20" />
                    </>
                  )}
                </div>
                <div className={`mt-1.5 bg-[#1A1A1A] text-[#F4F1EA] font-mono text-[9px] px-1.5 py-0.5 shadow-sm tracking-tighter uppercase whitespace-nowrap z-20 ${tilt} ${locked ? 'opacity-50' : ''}`}>
                  {dymoName(node.name)} {frozen ? '❄ FROZEN' : owned ? '✓' : `${node.cost} ⚡`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SLIDE-UP MANILA FOLDER INSPECTOR */}
      {selected && (() => {
        const owned = gameState.unlockedChannels.includes(selected.id);
        const frozenNow = owned && isFrozen(gameState, selected.id);
        const available = channelAvailable(gameState, selected);
        const canAfford = gameState.sparks >= selected.cost;
        const matched = selected.synergy.includes(category);
        const boost = matched ? 1.35 : 1;
        const missing = selected.requires.filter(r => !gameState.unlockedChannels.includes(r)).map(r => CHANNELS_DATA.find(c => c.id === r)?.name ?? r);

        return (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] bg-[#E6D5B8] border-4 border-[#1A1A1A] p-4 shadow-[8px_8px_0px_#1A1A1A] rounded-xl flex flex-col z-30 animate-slide-up">
            <div className="absolute -top-3 left-6 w-24 h-4 bg-[#D8C39A] border-2 border-[#1A1A1A] border-b-0 rounded-t-md" />
            <div className="flex justify-between items-start mb-2">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 border border-[#1A1A1A] rounded-sm">{selected.branch}</span>
                <h3 className="font-black text-lg mt-1.5 leading-tight text-[#1A1A1A] pr-4">{selected.name}</h3>
              </div>
              <button onClick={() => setSelectedNode(null)} aria-label="Close dossier" className="font-black text-2xl p-1 active:scale-90 transition-transform cursor-pointer">✕</button>
            </div>

            <div className="flex gap-1 flex-wrap mb-2">
              {selected.synergy.map(syn => (
                <span
                  key={syn}
                  className={`text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider rounded-sm border ${
                    syn === category ? 'bg-[#F59E0B] text-[#1A1A1A] border-[#1A1A1A]' : 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  }`}
                >
                  {syn.replace('_', ' ')}{syn === category ? ' ×1.35' : ''}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-1 mb-3">
              <StatBar label="Velocity" value={selected.velocity * boost} max={STAT_MAX.velocity} color="#D97706" boosted={matched} />
              <StatBar label="Credibility" value={selected.credibility * boost} max={STAT_MAX.credibility} color="#065F46" boosted={matched} />
              <StatBar label="Notoriety" value={selected.notoriety} max={STAT_MAX.notoriety} color="#B91C1C" />
            </div>

            <p className="text-xs font-sans text-slate-700 italic mb-3 leading-relaxed border-l-4 border-slate-400 pl-3">"{channelFlavorLine(selected, category, target)}"</p>

            {frozenNow && (
              <div className="mb-2 py-1.5 px-2 text-center border-2 border-[#1E3A5F] bg-[#DBEAFE] text-[#1E3A5F] font-black uppercase tracking-wider text-[9px] rounded-md">
                ❄ Frozen until the end of Day {gameState.frozenChannels[selected.id]}. It contributes nothing. A SAN Counter-Injunction thaws it.
              </div>
            )}
            {owned ? (
              <div className="py-2 text-center border-2 border-[#8B0000] text-[#8B0000] font-black uppercase tracking-widest bg-red-50 rounded-lg text-xs">Channel Acquired</div>
            ) : !available ? (
              <div className="py-2 px-3 text-center border-2 border-dashed border-slate-500 text-slate-600 font-black uppercase tracking-wider text-[10px] rounded-lg">
                Locked. Requires: {missing.join(' + ')}
              </div>
            ) : (
              <BrutalButton
                disabled={!canAfford}
                onClick={() => { onBuy(selected.id); setSelectedNode(null); }}
              >
                {canAfford ? `Acquire Channel (${selected.cost} ⚡)` : `Insufficient Sparks (${selected.cost} ⚡)`}
              </BrutalButton>
            )}
          </div>
        );
      })()}
    </div>
  );
};
