import React, { useState } from 'react';
import { ScandalCategory } from '../../engine/data/channels';
import { SCANDAL_CATEGORIES, SCANDALS, TARGETS, TargetId, getTarget, scandalTitleFor } from '../../engine/data/targets';
import { BrutalButton, PaperGrain, TapeStrip } from '../components/common';

interface DossierProps {
  onStart: (targetId: TargetId, category: ScandalCategory) => void;
  onReset: () => void;
}

export const DossierScreen: React.FC<DossierProps> = ({ onStart, onReset }) => {
  const [targetId, setTargetId] = useState<TargetId>('godfather');
  const target = getTarget(targetId);
  const [category, setCategory] = useState<ScandalCategory>(target.defaultScandal);
  const [confirmReset, setConfirmReset] = useState(false);

  const pickTarget = (id: TargetId) => {
    setTargetId(id);
    setCategory(getTarget(id).defaultScandal); // Each Target comes with its default scandal
  };

  return (
    <div className="relative flex-1 bg-[#EFEBE0] text-[#1A1A1A] font-serif overflow-y-auto no-scrollbar select-none">
      <PaperGrain />
      <div className="relative p-4 pb-8 flex flex-col gap-4">
        {/* MASTHEAD */}
        <div className="text-center border-b-4 border-double border-[#1A1A1A] pb-3">
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8B0000]">Classified // Case Files</div>
          <h1 className="text-3xl font-black uppercase tracking-tight leading-none mt-1">I Heard A Rumor</h1>
          <p className="text-[11px] font-sans mt-1 text-[#1A1A1A]/70">Investigative Tabloid Edition. Choose your target.</p>
        </div>

        {/* TARGET FILES */}
        <div className="flex flex-col gap-2.5">
          {TARGETS.map((t, i) => {
            const active = t.id === targetId;
            return (
              <button
                key={t.id}
                onClick={() => pickTarget(t.id)}
                className={`relative text-left p-3 border-2 border-[#1A1A1A] rounded-lg transition-all cursor-pointer ${
                  active ? 'bg-[#E6D5B8] shadow-[5px_5px_0px_#8B0000] -translate-y-0.5' : 'bg-[#F4F1EA] shadow-[2px_2px_0px_#1A1A1A] opacity-85'
                } ${i % 2 === 0 ? 'rotate-[-0.4deg]' : 'rotate-[0.4deg]'}`}
              >
                {active && <TapeStrip className="-top-2.5 left-6 rotate-[-4deg]" />}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="font-black text-sm leading-tight">{t.fullName}</div>
                    <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/60 mt-0.5">{t.title}</div>
                  </div>
                  {active && <span className="border-2 border-[#8B0000] text-[#8B0000] text-[8px] font-black tracking-widest px-1.5 py-0.5 rotate-6 whitespace-nowrap">SELECTED</span>}
                </div>
                {active && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    <p className="text-[11px] font-sans leading-snug text-slate-700 italic">{t.dossierBlurb}</p>
                    <div className="bg-[#1A1A1A] text-[#F4F1EA] px-2 py-1.5 rounded-sm">
                      <div className="text-[9px] font-black uppercase tracking-widest text-[#FDE68A]">AI passive: {t.passiveName}</div>
                      <div className="text-[10px] font-sans leading-snug mt-0.5">{t.passiveText}</div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* SCANDAL LOADOUT */}
        <div className="relative bg-[#F4F1EA] border-2 border-[#1A1A1A] rounded-lg p-3 shadow-[3px_3px_0px_#1A1A1A]">
          <TapeStrip className="-top-2.5 right-8 rotate-[3deg]" />
          <div className="text-[10px] font-black uppercase tracking-widest mb-2">Scandal category</div>
          <div className="grid grid-cols-2 gap-2">
            {SCANDAL_CATEGORIES.map(c => {
              const active = c === category;
              const isDefault = c === target.defaultScandal;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`relative py-2 px-2 border-2 border-[#1A1A1A] rounded-md font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all ${
                    active ? 'bg-[#1A1A1A] text-[#F4F1EA] shadow-[2px_2px_0px_#8B0000]' : 'bg-white text-[#1A1A1A]'
                  }`}
                >
                  {SCANDALS[c].label}
                  {isDefault && <span className={`block text-[7px] tracking-widest ${active ? 'text-[#FDE68A]' : 'text-[#B45309]'}`}>TARGET DEFAULT</span>}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] font-sans italic text-slate-700 mt-2.5 leading-snug">
            “{scandalTitleFor(target, category)}”
          </p>
          <p className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#065F46] mt-1.5">
            Matching channels get a ×1.35 Velocity &amp; Credibility synergy bonus.
          </p>
        </div>

        <BrutalButton tone="crimson" className="py-4 text-xs" onClick={() => onStart(targetId, category)}>
          Open Case File →
        </BrutalButton>

        {/* RESET */}
        <div className="text-center">
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1A1A1A]/50 underline cursor-pointer">
              New Investigation / Reset saved data
            </button>
          ) : (
            <div className="inline-flex items-center gap-2">
              <span className="text-[10px] font-sans font-bold text-[#8B0000]">Wipe saved game?</span>
              <button onClick={onReset} className="text-[10px] font-black uppercase text-white bg-[#8B0000] px-2 py-1 rounded cursor-pointer">Wipe</button>
              <button onClick={() => setConfirmReset(false)} className="text-[10px] font-black uppercase bg-white border border-[#1A1A1A] px-2 py-1 rounded cursor-pointer">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
