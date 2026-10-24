import React, { useState } from 'react';
import { getTarget } from '../../engine/data/targets';
import { Avatar } from '../components/Silhouette';
import { StateFinder } from '../components/StateFinder';
import { PaperGrain } from '../components/common';
import { sfx } from '../audio';

// The very first thing a new player sees. No menu, no roster, no rules: one scandalous headline and one huge button, then
// one question every Nigerian can answer ("which state you dey?"). Two taps and the rumour is running on the real map.
export const FIRST_RUMOR_TARGET = 'slay_queen';

export const ColdOpen: React.FC<{ onStart: (stateId: string) => void; onSkip: () => void }> = ({ onStart, onSkip }) => {
  const [stage, setStage] = useState<'headline' | 'where'>('headline');
  const [tapped, setTapped] = useState(false);
  const target = getTarget(FIRST_RUMOR_TARGET);

  const spread = () => {
    if (tapped) return;
    setTapped(true);
    sfx.play('pop');
    setTimeout(() => setStage('where'), 450);
  };

  return (
    <div className="flex-1 min-h-0 relative flex justify-center bg-[#0B0E14] text-[#F4F1EA] overflow-hidden">
      <div className="relative w-full max-w-[440px] h-full flex flex-col">
        {stage === 'headline' ? (
          <>
            <div className="flex-shrink-0 text-center pt-5 px-4">
              <div className="font-serif font-black text-[15px] uppercase tracking-[0.3em] text-[#F4F1EA]/70">The Daily Gist</div>
              <div className="inline-block mt-2 border-4 border-[#B91C1C] text-[#EF4444] font-black text-lg tracking-[0.3em] px-4 py-0.5 rotate-[-4deg] animate-stamp-in">BREAKING</div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-5 gap-4">
              <div className={`relative w-full bg-[#F4F1EA] text-[#1A1A1A] border-4 border-[#1A1A1A] rounded-lg p-5 shadow-[6px_6px_0px_#B91C1C] rotate-[-1deg] animate-pop-in ${tapped ? 'avatar-shake' : ''}`}>
                <PaperGrain />
                <div className="relative flex gap-3 items-center">
                  <div className="w-28 h-36 flex-shrink-0 bg-[#D9CBB0] border-4 border-[#1A1A1A] rounded-md overflow-hidden rotate-2">
                    <Avatar target={target} emotion={tapped ? 'PANIC' : 'SMUG'} className="w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-serif font-black text-[31px] leading-[0.98] uppercase tracking-tight">Amaka's "sponsor" na <span className="text-[#B91C1C]">married senator</span>?!</div>
                  </div>
                </div>
                <div className="relative mt-4 text-[15px] font-sans font-bold leading-snug">Only you know. For now. 🤫</div>
              </div>
            </div>

            <div className="flex-shrink-0 px-5 pb-6 flex flex-col items-center gap-2">
              <button
                onClick={spread}
                className={`w-full h-[72px] rounded-2xl border-4 border-[#1A1A1A] bg-[#FDE68A] text-[#1A1A1A] font-serif font-black text-3xl uppercase tracking-wide shadow-[6px_6px_0px_#B91C1C] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer ${tapped ? '' : 'animate-pulse'}`}
              >
                Spread am 🔥
              </button>
              <button onClick={() => { sfx.play('click'); onSkip(); }} className="min-h-[44px] px-4 text-[12px] font-black uppercase tracking-widest text-[#F4F1EA]/55 underline cursor-pointer">I don play this before</button>
            </div>
          </>
        ) : (
          <StateFinder
            dark
            title="Which state you dey?"
            subtitle="Pick your state. The gist go start from there."
            onPick={id => { sfx.play('pop'); onStart(id); }}
          />
        )}
      </div>
    </div>
  );
};
