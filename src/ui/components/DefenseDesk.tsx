import React from 'react';
import { GameState } from '../../engine/types';
import { DEFENSE_DATA } from '../../engine/data/defense';
import { CAMPAIGN_DEFENSE } from '../../engine/data/campaignCopy';
import { campaignize, vocabFor } from '../../engine/campaigns';
import { defenseActualCut, defenseCostFor, defenseNominalCut, defenseUses, heatFloor } from '../../engine/selectors';
import { BrutalButton, PaperGrain, SparkCounter } from './common';

interface DefenseDeskProps {
  gameState: GameState;
  onClose: () => void;
  docked?: boolean;   // desktop: fills its panel instead of sliding up over the map
  onBuy: (defenseId: string) => void;
}

export const DefenseDesk: React.FC<DefenseDeskProps> = ({ gameState, onClose, onBuy, docked = false }) => {
  const V = vocabFor(gameState.activeTargetId);
  const heat = gameState.heat;
  const critical = heat >= 90;
  const activeSpin = gameState.activeSpinBubbles.length;
  const floor = Math.round(heatFloor(gameState));

  return (
    <>
      {!docked && <div className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-[2px] z-40 animate-fade-in" onClick={onClose} />}

      <div className={docked ? 'relative h-full bg-[#EADCC8] flex flex-col overflow-hidden' : 'absolute inset-x-0 bottom-0 h-[72%] bg-[#EADCC8] z-50 flex flex-col border-t-4 border-[#1A1A1A] shadow-[0px_-10px_20px_rgba(0,0,0,0.3)] rounded-t-3xl animate-slide-up overflow-hidden'}>
        <PaperGrain />

        <div className="relative bg-[#1A1A1A] text-[#F4F1EA] p-4 flex-shrink-0 border-b-4 border-[#8B0000]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-black tracking-widest uppercase font-serif">{V.defenseDesk}</span>
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
            <span className="text-slate-400">{V.campaign ? 'Backlash' : 'State Security Heat'}</span>
            <span className={critical ? 'text-[#FCA5A5] animate-pulse' : 'text-slate-300'}>{Math.floor(heat)}%</span>
          </div>
          <div className="relative w-full h-3 bg-black border border-white/30 rounded-sm overflow-hidden">
            <div className="h-full bg-[#DC2626] transition-all duration-500" style={{ width: `${heat}%` }} />
            {[40, 70, 90].map(m => (
              <div key={m} className="absolute top-0 bottom-0 w-[2px] bg-white/60" style={{ left: `${m}%` }} />
            ))}
          </div>
          {floor > 0 && <div className="mt-2 text-[10px] font-bold text-slate-300 leading-snug">🗂 {V.campaign ? 'Critics keep a record of how loud you have been' : 'The DSS keeps a file on how loud you have been'}: protection cannot take {V.heat} below {floor}%. Everything you buy makes the next thing dearer.</div>}
          {activeSpin > 0 && (
            <div className="mt-2 text-[10px] font-black uppercase tracking-wider text-[#FDE68A]">📢 {activeSpin} {V.campaign ? 'Hoax' : 'Spin'} bubble{activeSpin > 1 ? 's' : ''} live on the map</div>
          )}
        </div>

        <div className="relative flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-3">
          {DEFENSE_DATA.map(item => {
            const uses = defenseUses(gameState, item.id);
            const maxed = uses >= item.maxUses;
            const cost = defenseCostFor(gameState, item);
            const nominal = defenseNominalCut(gameState, item);
            const actual = Math.round(defenseActualCut(gameState, item));
            const canAfford = gameState.sparks >= cost;
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
                    {item.emergency && <span className="text-[10px] font-black bg-[#8B0000] text-white px-1.5 py-0.5 rounded-sm tracking-wider">PANIC BUTTON</span>}
                    <h3 className="font-bold text-sm text-[#1A1A1A] font-serif leading-tight mt-0.5">{V.campaign ? (CAMPAIGN_DEFENSE[item.id]?.name ?? item.name) : item.name}</h3>
                  </div>
                  <span className="bg-[#FEF3C7] text-[#92400E] font-black text-xs px-2 py-1 rounded border-2 border-[#1A1A1A] flex-shrink-0">{cost} ⚡</span>
                </div>
                <p className="text-[11px] font-sans text-slate-700 leading-snug">{V.campaign ? campaignize(CAMPAIGN_DEFENSE[item.id]?.effectText ?? item.effectText, V) : item.effectText}</p>
                {!maxed && <div className="text-[11px] font-sans font-bold text-[#7F1D1D] leading-snug">{V.heat} removed right now: -{actual}%{actual < nominal ? ` (of -${nominal}%: the DSS file limits it)` : nominal !== item.heatReduction ? ` (this one scrubs less than the first)` : ''}</div>}
                {item.maxUses > 1 && (
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/72">Used {uses}/{item.maxUses}</div>
                )}
                {!maxed && (
                  <BrutalButton tone={item.emergency ? 'crimson' : 'ink'} disabled={!canAfford} onClick={() => onBuy(item.id)} className="py-2.5">
                    {canAfford ? `Activate (${cost} ⚡)` : 'Insufficient Sparks'}
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
