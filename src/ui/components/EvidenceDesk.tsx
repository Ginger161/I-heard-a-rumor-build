import React, { useState } from 'react';
import { GameState } from '../../engine/types';
import { EvidenceItem, FORGERY_EVIDENCE, VERIFIED_EVIDENCE, getEvidenceVariant } from '../../engine/data/evidence';
import { fillTarget, getTarget } from '../../engine/data/targets';
import { nationalAverageDoubt } from '../../engine/selectors';
import { FORGERY_BASE_BACKFIRE, FORGERY_HIGH_DOUBT_BACKFIRE } from '../../engine/actions';
import { BrutalButton, PaperGrain, SparkCounter } from './common';

interface EvidenceDeskProps {
  gameState: GameState;
  onClose: () => void;
  docked?: boolean;   // desktop: fills its panel instead of sliding up over the map
  onLeak: (evidenceId: string) => void;
}

type Tab = 'VERIFIED' | 'FORGERY';

const effectChips = (e: EvidenceItem): string[] => {
  const chips = [`-${e.doubtReduction}% Doubt`, `+${e.heatIncrease}% Heat`];
  if (e.jadedToHeard >= 1) chips.push('Resurrects 100% of Jaded');
  else if (e.jadedToHeard > 0) chips.push(`${Math.round(e.jadedToHeard * 100)}% Jaded → Heard`);
  if (e.jadedToBelievers > 0) chips.push(`${Math.round(e.jadedToBelievers * 100)}% Jaded → Believers`);
  if (e.heardToBelievers > 0) chips.push(`${Math.round(e.heardToBelievers * 100)}% of all Heard → Believers`);
  chips.push(`-${e.coverUpReduction}% Cover-Up`, `+${e.freshnessBoost} Freshness`);
  return chips;
};

export const EvidenceDesk: React.FC<EvidenceDeskProps> = ({ gameState, onClose, onLeak, docked = false }) => {
  const [tab, setTab] = useState<Tab>('VERIFIED');
  const target = getTarget(gameState.activeTargetId);
  const category = gameState.scandalCategory;
  const progress = gameState.investigationProgress;
  const avgDoubt = nationalAverageDoubt(gameState.states);
  const backfireRisk = Math.round((FORGERY_BASE_BACKFIRE + (avgDoubt > 55 ? FORGERY_HIGH_DOUBT_BACKFIRE : 0) + (target.mods.forgeryRisk ?? 0)) * 100);
  const totalJaded = Object.values(gameState.states).reduce((a, s) => a + s.jaded, 0);
  const items = tab === 'VERIFIED' ? VERIFIED_EVIDENCE : FORGERY_EVIDENCE;

  return (
    <>
      {!docked && <div className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-[2px] z-40 animate-fade-in" onClick={onClose} />}

      <div className={docked ? 'relative h-full bg-[#EADCC8] flex flex-col overflow-hidden' : 'absolute inset-x-0 bottom-0 h-[72%] bg-[#EADCC8] z-50 flex flex-col border-t-4 border-[#1A1A1A] shadow-[0px_-10px_20px_rgba(0,0,0,0.3)] rounded-t-3xl animate-slide-up overflow-hidden'}>
        <PaperGrain />

        {/* HEADER */}
        <div className="relative bg-[#1A1A1A] text-[#F4F1EA] p-4 flex-shrink-0 border-b-4 border-[#8B0000]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-black tracking-widest uppercase font-serif">Evidence Locker</span>
            <div className="flex items-center gap-3">
              <SparkCounter value={gameState.sparks} className="text-xs" />
              {!docked && <button
                onClick={onClose}
                aria-label="Close evidence locker"
                className="w-8 h-8 bg-[#F4F1EA] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-md font-bold text-sm flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] cursor-pointer"
              >
                ✕
              </button>}
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Investigation Progress</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="relative w-full h-3 bg-black border border-white/30 rounded-sm overflow-hidden">
            <div className="h-full bg-[#FDE68A] transition-all duration-500" style={{ width: `${progress}%` }} />
            {[25, 50, 75].map(m => (
              <div key={m} className="absolute top-0 bottom-0 w-[2px] bg-white/60" style={{ left: `${m}%` }} />
            ))}
          </div>
          <div className="flex gap-1 mt-3">
            {(['VERIFIED', 'FORGERY'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 font-black text-[10px] uppercase tracking-wider rounded-t-lg border-2 border-b-0 border-[#F4F1EA]/40 cursor-pointer transition-colors ${
                  tab === t ? 'bg-[#EADCC8] text-[#1A1A1A]' : 'bg-[#2B2B2B] text-slate-400'
                }`}
              >
                {t === 'VERIFIED' ? 'Verified Dossier Files' : 'Fabricated Forgeries'}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-3">
          {tab === 'VERIFIED' && totalJaded > 0 && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#475569] bg-[#E2E8F0] border-2 border-dashed border-[#64748B] rounded-lg px-3 py-2">
              {Math.round(totalJaded).toLocaleString()} citizens are Gist-Fatigued. Hard evidence wakes them up.
            </div>
          )}
          {tab === 'FORGERY' && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B0000] bg-[#FEE2E2] border-2 border-[#8B0000] rounded-lg px-3 py-2">
              ⚠ Forgery backfire risk right now: {backfireRisk}%{avgDoubt > 55 ? ' (skeptical streets: +35%)' : ''}. If exposed: +20% Doubt, +25% Heat, +15% Cover-Up.
            </div>
          )}

          {items.map(item => {
            const variant = getEvidenceVariant(item, category, target.parody);
            const dropped = gameState.droppedEvidence.includes(item.id);
            const unlocked = progress >= item.requiredInvestigation;
            const canAfford = gameState.sparks >= item.cost;

            return (
              <div
                key={item.id}
                className={`relative p-3 rounded-xl border-2 border-[#1A1A1A] flex flex-col gap-2 ${
                  dropped ? 'bg-[#EBE5D9] opacity-60' : unlocked ? 'bg-[#F4F1EA] shadow-[2px_2px_0px_#1A1A1A]' : 'bg-[#E3DDCF] border-dashed'
                }`}
              >
                {dropped && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] border-4 border-[#065F46] text-[#065F46] font-black text-xl tracking-widest px-2 py-1 opacity-40 pointer-events-none font-serif">
                    RELEASED
                  </div>
                )}

                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.tier && <span className="text-[8px] font-black bg-[#1A1A1A] text-[#FDE68A] px-1.5 py-0.5 rounded-sm tracking-wider">TIER {item.tier}</span>}
                      {item.isFabricated && <span className="text-[8px] font-black bg-[#8B0000] text-white px-1.5 py-0.5 rounded-sm tracking-wider">FABRICATED</span>}
                    </div>
                    <h3 className="font-bold text-sm text-[#1A1A1A] font-serif leading-tight mt-1">{unlocked ? variant.name : '▮▮▮▮▮ CLASSIFIED ▮▮▮▮▮'}</h3>
                  </div>
                  <span className="bg-[#FEF3C7] text-[#B45309] font-black text-xs px-2 py-1 rounded border-2 border-[#1A1A1A] flex-shrink-0">{item.cost} ⚡</span>
                </div>

                {unlocked ? (
                  <>
                    <p className="text-[11px] font-sans italic text-slate-700 leading-snug border-l-4 border-slate-400 pl-2">
                      {variant.flavor.map(f => fillTarget(f, target)).join(' ')}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {effectChips(item).map(chip => (
                        <span key={chip} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${chip.includes('Heat') && !chip.includes('Cover') ? 'text-[#8B0000] border-[#8B0000]' : 'text-[#065F46] border-[#065F46]'}`}>
                          {chip}
                        </span>
                      ))}
                    </div>
                    {!dropped && (
                      <BrutalButton tone={item.isFabricated ? 'crimson' : 'ink'} disabled={!canAfford} onClick={() => onLeak(item.id)} className="py-2.5">
                        {canAfford ? (item.isFabricated ? `Leak Forgery (${item.cost} ⚡)` : `Leak Evidence (${item.cost} ⚡)`) : 'Insufficient Sparks'}
                      </BrutalButton>
                    )}
                  </>
                ) : (
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/50">
                    🔒 Requires {item.requiredInvestigation}% Investigation ({Math.floor(progress)}% now)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
