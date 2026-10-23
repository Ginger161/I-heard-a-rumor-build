import React from 'react';
import { GameState } from '../../engine/types';
import { DEFENSE_DATA } from '../../engine/data/defense';
import { defenseUses } from '../../engine/selectors';
import { BrutalButton, PaperGrain, SparkCounter } from './common';

interface DefenseDeskProps {
  gameState: GameState;
  onClose: () => void;
  docked?: boolean;   // desktop: fills its panel instead of sliding up over the map
  onBuy: (defenseId: string) => void;
}

export const DefenseDesk: React.FC<DefenseDeskProps> = ({ gameState, onClose, onBuy, docked = false }) => {
  const heat = gameState.heat;
  const critical = heat >= 90;
  const activeSpin = gameState.activeSpinBubbles.length;

  return (
    <>
      {!docked && <div className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-[2px] z-40 animate-fade-in" onClick={onClose} />}

      <div className={docked ? 'relative h-full bg-[#EADCC8] flex flex-col overflow-hidden' : 'absolute inset-x-0 bottom-0 h-[72%] bg-[#EADCC8] z-50 flex flex-col border-t-4 border-[#1A1A1A] shadow-[0px_-10px_20px_rgba(0,0,0,0.3)] rounded-t-3xl animate-slide-up overflow-hidden'}>
        <PaperGrain />

        <div className="relative bg-[#1A1A1A] text-[#F4F1EA] p-4 flex-shrink-0 border-b-4 border-[#8B0000]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-black tracking-widest uppercase font-serif">Defense Desk</span>
            <div className="flex items-center gap-3">
              <SparkCounter value={gameState.sparks} className="text-xs" />
              {!docked && <button
                onClick={onClose}
                aria-label="Close defense desk"
                className="w-8 h-8 bg-[#F4F1EA] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-md font-bold text-sm flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] cursor-pointer"
              >
                ✕
              </button>}
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
            <span className="text-slate-400">State Security Heat</span>
            <span className={critical ? 'text-[#FCA5A5] animate-pulse' : 'text-slate-300'}>{Math.floor(heat)}%</span>
          </div>
          <div className="relative w-full h-3 bg-black border border-white/30 rounded-sm overflow-hidden">
            <div className="h-full bg-[#DC2626] transition-all duration-500" style={{ width: `${heat}%` }} />
            {[40, 70, 90].map(m => (
              <div key={m} className="absolute top-0 bottom-0 w-[2px] bg-white/60" style={{ left: `${m}%` }} />
            ))}
          </div>
          {activeSpin > 0 && (
            <div className="mt-2 text-[10px] font-black uppercase tracking-wider text-[#FDE68A]">📢 {activeSpin} Spin bubble{activeSpin > 1 ? 's' : ''} live on the map</div>
          )}
        </div>

        <div className="relative flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-3">
          {DEFENSE_DATA.map(item => {
            const uses = defenseUses(gameState, item.id);
            const maxed = uses >= item.maxUses;
            const canAfford = gameState.sparks >= item.cost;
            const pulse = item.emergency && critical && !maxed;

            return (
              <div
                key={item.id}
                className={`relative p-3 rounded-xl border-2 flex flex-col gap-2 ${
                  maxed ? 'bg-[#EBE5D9] opacity-60 border-[#1A1A1A]' : item.emergency ? 'bg-[#FFE4E6] border-[#8B0000] shadow-[3px_3px_0px_#8B0000]' : 'bg-[#F4F1EA] border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]'
                } ${pulse ? 'animate-pulse' : ''}`}
              >
                {maxed && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] border-4 border-[#065F46] text-[#065F46] font-black text-xl tracking-widest px-2 py-1 opacity-40 pointer-events-none font-serif">
                    ACTIVE
                  </div>
                )}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    {item.emergency && <span className="text-[8px] font-black bg-[#8B0000] text-white px-1.5 py-0.5 rounded-sm tracking-wider">PANIC BUTTON</span>}
                    <h3 className="font-bold text-sm text-[#1A1A1A] font-serif leading-tight mt-0.5">{item.name}</h3>
                  </div>
                  <span className="bg-[#FEF3C7] text-[#B45309] font-black text-xs px-2 py-1 rounded border-2 border-[#1A1A1A] flex-shrink-0">{item.cost} ⚡</span>
                </div>
                <p className="text-[11px] font-sans text-slate-700 leading-snug">{item.effectText}</p>
                {item.maxUses > 1 && (
                  <div className="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]/60">Used {uses}/{item.maxUses}</div>
                )}
                {!maxed && (
                  <BrutalButton tone={item.emergency ? 'crimson' : 'ink'} disabled={!canAfford} onClick={() => onBuy(item.id)} className="py-2.5">
                    {canAfford ? `Activate (${item.cost} ⚡)` : 'Insufficient Sparks'}
                  </BrutalButton>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
