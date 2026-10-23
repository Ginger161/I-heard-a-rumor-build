import React, { useEffect, useState } from 'react';
import { BrutalButton, PaperGrain } from './common';
import { OWNER, EggSource } from '../egg';
import { sfx } from '../audio';

// The reveal: a tabloid front page that names the founder. Shown once per discovery; the first discovery pays 100 envelopes.
const INTRO: Record<EggSource, string> = {
  phrase: 'You said the words.',
  konami: 'Up, up, down, down. Somebody remembers.',
  taps: 'Twelve taps. You really wanted to know.',
  fax: 'A fax machine nobody owns started printing…'
};

const CONFETTI = ['#B91C1C', '#FDE68A', '#1A1A1A', '#B45309', '#F4F1EA'];

export const FounderReveal: React.FC<{ source: EggSource; reward: boolean; onClose: () => void; onShare: () => void }> = ({ source, reward, onClose, onShare }) => {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    sfx.play('stamp');
    const a = setTimeout(() => { setStage(1); sfx.play('win'); }, 1400);
    const b = setTimeout(() => setStage(2), 2600);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  return (
    <div className="absolute inset-0 z-[200] bg-[#0B0E14]/92 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in" role="dialog" aria-label="The founder's mark">
      {stage >= 1 && Array.from({ length: 26 }).map((_, i) => (
        <span key={i} aria-hidden className="absolute top-0 w-2 h-3 animate-confetti-fall pointer-events-none" style={{ left: `${(i * 37) % 100}%`, background: CONFETTI[i % CONFETTI.length], animationDelay: `${(i % 9) * 0.12}s`, ['--dx' as string]: `${((i % 7) - 3) * 24}px` }} />
      ))}
      <div className="relative w-full max-w-[420px] bg-[#EFEBE0] border-4 border-[#1A1A1A] shadow-[10px_10px_0px_#8B0000] p-5 text-[#1A1A1A] font-serif overflow-hidden">
        <PaperGrain />
        <div className="relative text-center">
          <div className="text-[10px] font-mono font-black tracking-[0.3em] text-[#8B0000]">{INTRO[source]}</div>
          <div className="font-serif font-black text-[34px] leading-none tracking-tight mt-2">THE DAILY GIST</div>
          <div className="h-1 bg-[#1A1A1A] mt-2" /><div className="h-[2px] bg-[#1A1A1A] mt-1" />

          <div className="inline-block rotate-[-4deg] border-4 border-[#8B0000] text-[#8B0000] font-black text-lg tracking-[0.2em] px-3 py-1 mt-4 animate-stamp-in">EXCLUSIVE</div>
          <h2 className="font-black text-[26px] leading-tight uppercase mt-3">The gist behind the gist, exposed!</h2>

          <div className={`mt-4 transition-opacity duration-700 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-[11px] font-mono font-bold tracking-widest text-slate-600 uppercase">This game was created by</div>
            <div className="font-serif font-black text-[30px] leading-tight mt-1 break-words">{OWNER.name}</div>
            <div className="text-[12px] font-sans italic text-slate-700 mt-1">{OWNER.title}. © {OWNER.year}. All rights reserved.</div>
          </div>

          <div className={`mt-4 transition-opacity duration-700 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-[12px] font-sans leading-snug">You found the founder's mark. Most players never will. Keep it to yourself, or tell everyone.</p>
            {reward && <div className="mt-2 inline-block bg-[#FDE68A] border-2 border-[#1A1A1A] rounded px-2.5 py-1 text-[12px] font-black">+100 ✉️ for finding it</div>}
            <div className="flex flex-col gap-2 mt-4">
              <BrutalButton tone="crimson" onClick={() => { sfx.play('click'); onShare(); }}>📣 Tell everyone</BrutalButton>
              <BrutalButton tone="ink" onClick={() => { sfx.play('click'); onClose(); }}>Keep the secret</BrutalButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
