import React from 'react';
import { GameState } from '../../engine/types';
import { EVIDENCE_DATA } from '../../engine/data/evidence';

interface EvidenceDeskProps {
  gameState: GameState;
  onClose: () => void;
  onDrop: (evidenceId: string) => void;
}

export const EvidenceDesk: React.FC<EvidenceDeskProps> = ({ gameState, onClose, onDrop }) => {
  // Filter evidence into stages based on investigation progress
  const availableEvidence = EVIDENCE_DATA.filter(
    e => gameState.investigationProgress >= e.requiredInvestigation
  );
  
  const lockedEvidenceCount = EVIDENCE_DATA.length - availableEvidence.length;

  return (
    <>
      {/* TRANSLUCENT BACKDROP */}
      <div 
        className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-[2px] z-40"
        onClick={onClose}
      ></div>

      {/* BOTTOM SHEET MODAL */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[#EADCC8] z-50 flex flex-col border-t-4 border-[#1A1A1A] shadow-[0px_-10px_20px_rgba(0,0,0,0.3)] rounded-t-3xl animate-slide-up">
        
        {/* HEADER */}
        <div className="bg-[#1A1A1A] text-[#F4F1EA] p-4 rounded-t-2xl flex-shrink-0 border-b-4 border-[#8B0000]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-base font-black tracking-widest uppercase font-serif">Evidence Locker</span>
            <button 
              onClick={onClose}
              className="w-7 h-7 bg-[#F4F1EA] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-md font-bold text-sm flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Investigation Progress: {Math.floor(gameState.investigationProgress)}%
          </div>
        </div>

        {/* CONTENT LIST */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-3 bg-[#EADCC8]">
          {availableEvidence.map(evidence => {
            const isDropped = gameState.droppedEvidence.includes(evidence.id);
            const canAfford = gameState.sparks >= evidence.cost;

            return (
              <div 
                key={evidence.id} 
                className={`p-3 rounded-xl border-2 border-[#1A1A1A] flex flex-col justify-between relative ${
                  isDropped ? 'bg-[#EBE5D9] opacity-60' : 'bg-[#F4F1EA] shadow-[2px_2px_0px_#1A1A1A]'
                }`}
              >
                {isDropped && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] border-4 border-[#065F46] text-[#065F46] font-black text-xl tracking-widest px-2 py-1 opacity-40 pointer-events-none font-serif">
                    RELEASED
                  </div>
                )}

                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-[#1A1A1A] font-serif leading-tight flex items-center gap-2">
                      {evidence.name}
                      {evidence.isFabricated && (
                        <span className="text-[8px] bg-[#8B0000] text-white px-1 py-0.5 rounded-sm uppercase tracking-wider font-sans">
                          Fabricated
                        </span>
                      )}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] font-bold text-[#065F46]">-{evidence.doubtReduction}% Doubt</span>
                      <span className="text-[9px] font-bold text-[#8B0000]">+{evidence.heatIncrease}% Heat</span>
                    </div>
                  </div>
                  <span className="bg-[#FEF3C7] text-[#B45309] font-black text-xs px-2 py-1 rounded border-2 border-[#1A1A1A] flex-shrink-0">
                    {evidence.cost} ⚡
                  </span>
                </div>

                {!isDropped && (
                  <button
                    onClick={() => onDrop(evidence.id)}
                    disabled={!canAfford}
                    className={`w-full py-2 mt-1 font-black text-[10px] tracking-widest uppercase border-2 border-[#1A1A1A] rounded-lg transition-all cursor-pointer ${
                      canAfford 
                        ? 'bg-[#1A1A1A] text-white shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none' 
                        : 'bg-[#D4CFC4] text-slate-500 cursor-not-allowed border-dashed'
                    }`}
                  >
                    {canAfford ? 'Leak Evidence' : 'Insufficient Sparks'}
                  </button>
                )}
              </div>
            );
          })}

          {/* CLASSIFIED / LOCKED EVIDENCE INDICATOR */}
          {lockedEvidenceCount > 0 && (
            <div className="mt-2 mb-4 border-2 border-dashed border-[#1A1A1A]/30 rounded-xl p-4 flex flex-col items-center justify-center bg-[#EBE5D9]/50">
              <span className="text-xl mb-1">🔒</span>
              <span className="text-xs font-bold text-[#1A1A1A]/50 uppercase tracking-widest">
                {lockedEvidenceCount} Classified Files
              </span>
              <span className="text-[9px] text-[#1A1A1A]/40 mt-1 text-center font-bold">
                Advance the investigation to unlock harder evidence.
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
