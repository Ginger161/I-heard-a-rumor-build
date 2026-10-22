import React from 'react';
import { GameAlert } from '../../engine/types';
import { PaperGrain } from './common';

interface AlertCardModalProps {
  alert: GameAlert;
  remaining: number;
  onDismiss: () => void;
}

const Impact: React.FC<{ text?: string; className?: string }> = ({ text, className = '' }) =>
  text ? (
    <div className={`text-[10px] font-black uppercase tracking-widest text-center px-2 py-1 border border-[#1A1A1A] ${className}`}>{text}</div>
  ) : null;

const ActionButton: React.FC<{ label: string; onClick: () => void; className: string }> = ({ label, onClick, className }) => (
  <button
    onClick={onClick}
    className={`w-full mt-1 py-3 font-black text-xs uppercase tracking-widest border-2 border-[#1A1A1A] rounded-lg shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all cursor-pointer ${className}`}
  >
    {label}
  </button>
);

// Jagged torn-paper edges for the notebook scrap.
const TORN =
  'polygon(0% 2%, 5% 0%, 11% 2.5%, 18% 0.5%, 26% 2%, 34% 0%, 43% 2.5%, 52% 0.5%, 61% 2%, 70% 0%, 79% 2.5%, 88% 0.5%, 95% 2%, 100% 0%, 100% 97.5%, 94% 100%, 86% 97.5%, 77% 100%, 67% 97.5%, 58% 100%, 48% 97.5%, 38% 100%, 28% 97.5%, 19% 100%, 9% 97.5%, 0% 100%)';

export const AlertCardModal: React.FC<AlertCardModalProps> = ({ alert, remaining, onDismiss }) => {
  const renderCard = () => {
    switch (alert.archetype) {
      // ---- Torn notebook scrap / lined paper ----
      case 'STREET_WHISPER':
        return (
          <div className="rotate-[-1.5deg]" style={{ filter: 'drop-shadow(5px 5px 0 #1A1A1A)' }}>
            <div
              className="relative bg-[#FFFDF5] px-6 pt-7 pb-6 flex flex-col gap-3 overflow-hidden"
              style={{ clipPath: TORN, backgroundImage: 'linear-gradient(transparent 27px, #BFDBFE 28px)', backgroundSize: '100% 28px' }}
            >
              <div className="absolute top-0 bottom-0 left-9 w-[2px] bg-[#FCA5A5]" />
              <div className="absolute top-4 left-2 flex flex-col gap-6">
                <span className="w-3 h-3 rounded-full bg-[#1A1A1A]/80" />
                <span className="w-3 h-3 rounded-full bg-[#1A1A1A]/80" />
              </div>
              <span className="self-start ml-5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#FEF3C7] text-[#B45309] border border-[#B45309] -rotate-1">{alert.stampText}</span>
              <h2 className="ml-5 font-serif italic text-xl leading-7 text-[#1A1A1A]">{alert.headline}</h2>
              <p className="ml-5 font-mono text-xs text-slate-700 leading-[28px]">{alert.body}</p>
              <Impact text={alert.subtext} className="ml-5 bg-[#FEF3C7] text-[#B45309]" />
              <div className="ml-5"><ActionButton label={alert.buttonText} onClick={onDismiss} className="bg-[#1A1A1A] text-[#F4F1EA]" /></div>
            </div>
          </div>
        );

      // ---- WhatsApp / blog cutout with green accent ----
      case 'VIRAL_RECEIPT':
        return (
          <div className="rotate-[1deg] bg-[#E5DDD5] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#065F46] rounded-xl overflow-hidden">
            <div className="bg-[#075E54] text-white px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest">{alert.stampText}</span>
              <span className="text-[9px] opacity-80">now ✓✓</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="relative bg-[#DCF8C6] border border-[#1A1A1A]/30 rounded-lg rounded-tr-none p-3 shadow-sm">
                <div className="text-[9px] text-slate-500 italic mb-1">↪ Forwarded many times</div>
                <h2 className="font-sans font-black text-base text-[#1A1A1A] leading-tight mb-1.5 tracking-tight">{alert.headline}</h2>
                <p className="font-sans text-xs font-semibold text-slate-800 leading-snug">{alert.body}</p>
                <div className="text-right text-[9px] text-slate-500 mt-1">12:07 ✓✓</div>
              </div>
              <Impact text={alert.subtext} className="bg-white text-[#065F46] rounded" />
              <ActionButton label={alert.buttonText} onClick={onDismiss} className="bg-[#065F46] text-white" />
            </div>
          </div>
        );

      // ---- Neo-brutalist newspaper front page with red stamp ----
      case 'BREAKING_FRONT':
        return (
          <div className="relative rotate-[0.5deg] bg-[#F4F1EA] border-4 border-[#1A1A1A] shadow-[10px_10px_0px_#8B0000] overflow-hidden">
            <PaperGrain />
            <div className="relative border-b-4 border-[#1A1A1A] px-4 pt-3 pb-2 text-center">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/60">
                <span>Lagos • Abuja • Kano</span>
                <span>₦300</span>
              </div>
              <div className="font-serif font-black text-2xl tracking-tight uppercase leading-none">The Daily Gist</div>
            </div>
            <div className="relative p-4 flex flex-col gap-3">
              <div className="absolute -top-1 right-2 rotate-[-6deg] border-4 border-[#8B0000] text-[#8B0000] font-black text-[10px] tracking-widest px-2 py-0.5 bg-[#F4F1EA]/80 animate-stamp-in">{alert.stampText}</div>
              <h2 className="font-serif font-black text-2xl uppercase tracking-tight leading-[1.05] text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-2 pr-2 pt-5">{alert.headline}</h2>
              <p className="font-serif text-sm text-[#1A1A1A] leading-relaxed first-letter:text-3xl first-letter:font-black first-letter:float-left first-letter:mr-1 first-letter:leading-none">{alert.body}</p>
              <Impact text={alert.subtext} className="bg-[#1A1A1A] text-[#F4F1EA]" />
              <ActionButton label={alert.buttonText} onClick={onDismiss} className="bg-[#8B0000] text-white" />
            </div>
          </div>
        );

      // ---- Official double-bordered cream letterhead ----
      case 'TARGET_PR':
        return (
          <div className="rotate-[-0.5deg] bg-[#FAF8F5] border-double border-[6px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-1 relative overflow-hidden">
            <PaperGrain />
            <div className="relative border border-[#1A1A1A] p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 border-b border-[#1A1A1A] pb-2">
                <div className="w-9 h-9 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center font-serif font-black text-sm">★</div>
                <div className="flex-1">
                  <div className="font-serif font-bold text-[10px] uppercase tracking-[0.2em]">Office of the Principal</div>
                  <div className="font-serif text-[8px] uppercase tracking-widest text-slate-500">Press Secretariat • Strictly for release</div>
                </div>
              </div>
              <span className="self-start text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#1A1A1A] text-[#FDE68A]">{alert.stampText}</span>
              <h2 className="font-serif font-bold text-lg uppercase tracking-widest text-[#1A1A1A] text-center leading-tight">{alert.headline}</h2>
              <p className="font-serif text-xs text-slate-700 italic border-l-4 border-[#1A1A1A] pl-3 leading-relaxed">{alert.body}</p>
              <Impact text={alert.subtext} className="bg-[#FEF3C7] text-[#8B0000]" />
              <ActionButton label={alert.buttonText} onClick={onDismiss} className="bg-[#1A1A1A] text-white" />
            </div>
          </div>
        );

      // ---- Pink/red carbon-copy DSS telex ----
      case 'SECURITY_WIRE':
        return (
          <div className="rotate-[1deg] bg-[#FFE4E6] border-4 border-[#8B0000] shadow-[8px_8px_0px_#1A1A1A] relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 3px, rgba(139,0,0,0.25) 3px 4px)' }} />
            <div className="relative bg-[#8B0000] text-white px-3 py-1.5 flex justify-between font-mono text-[9px] font-black tracking-widest">
              <span>DEPT OF STATE SERVICES</span>
              <span>TOP SECRET // CC-3</span>
            </div>
            <div className="relative p-4 flex flex-col gap-3">
              <span className="self-start font-mono text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#8B0000] text-white border-2 border-[#1A1A1A]">{alert.stampText}</span>
              <h2 className="font-mono font-black text-lg uppercase text-[#8B0000] tracking-wider leading-tight">{alert.headline}</h2>
              <p className="font-mono text-xs text-[#1A1A1A] bg-white/70 p-2.5 border border-[#8B0000] leading-relaxed">{alert.body}</p>
              <Impact text={alert.subtext} className="bg-[#8B0000] text-white font-mono" />
              <ActionButton label={alert.buttonText} onClick={onDismiss} className="bg-[#8B0000] text-white" />
            </div>
            <div className="relative border-t-2 border-dashed border-[#8B0000] text-center font-mono text-[8px] tracking-[0.3em] text-[#8B0000]/70 py-1">- - - - - - - - TEAR HERE - - - - - - - -</div>
          </div>
        );

      // ---- Dark manila envelope with redacted stamp ----
      case 'INFORMANT_TIP':
        return (
          <div className="rotate-[-1deg] bg-[#C9B28A] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] relative overflow-hidden">
            <PaperGrain />
            <div className="relative h-8 border-b-2 border-[#1A1A1A] bg-[#B89D72]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            <div className="relative p-4 pt-2 flex flex-col gap-3 -mt-2">
              <div className="absolute top-1 right-3 rotate-[12deg] border-4 border-[#8B0000] text-[#8B0000] font-black text-sm tracking-[0.25em] px-2 py-0.5 opacity-80 animate-stamp-in">REDACTED</div>
              <span className="self-start font-mono text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#1A1A1A] text-[#E6D5B8]">{alert.stampText}</span>
              <h2 className="font-mono font-black text-base uppercase text-[#1A1A1A] leading-tight">{alert.headline}</h2>
              <p className="font-mono text-xs text-[#1A1A1A] border-t border-b border-dashed border-[#1A1A1A] py-2 leading-relaxed">{alert.body}</p>
              <div className="flex flex-col gap-1">
                <div className="h-2 w-3/4 bg-[#1A1A1A]" />
                <div className="h-2 w-1/2 bg-[#1A1A1A]" />
              </div>
              <Impact text={alert.subtext} className="bg-[#E6D5B8] text-[#1A1A1A] font-mono" />
              <ActionButton label={alert.buttonText} onClick={onDismiss} className="bg-[#1A1A1A] text-[#E6D5B8]" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-[#1A1A1A]/75 backdrop-blur-[2px] flex items-center justify-center p-5 animate-fade-in">
      <div className="w-full max-w-[350px] animate-slide-up">
        {renderCard()}
        {remaining > 0 && (
          <div className="text-center mt-3 text-[10px] font-black uppercase tracking-widest text-[#F4F1EA]/70">+{remaining} more waiting</div>
        )}
      </div>
    </div>
  );
};
