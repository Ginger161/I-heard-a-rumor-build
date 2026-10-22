import React from 'react';
import { GameAlert } from '../../engine/types';

interface AlertCardModalProps {
  alert: GameAlert;
  onDismiss: () => void;
}

export const AlertCardModal: React.FC<AlertCardModalProps> = ({ alert, onDismiss }) => {
  // Style configurations per physical archetype
  const getTheme = () => {
    switch (alert.archetype) {
      case 'STREET_WHISPER':
        return {
          card: 'bg-[#FFFDF5] border-2 border-[#1A1A1A] rotate-[-1.5deg] shadow-[6px_6px_0px_#1A1A1A]',
          stamp: 'bg-[#FEF3C7] text-[#B45309] border border-[#B45309]',
          headline: 'font-serif italic text-xl text-[#1A1A1A]',
          body: 'font-mono text-xs text-slate-700 bg-[linear-gradient(transparent_23px,#E5E7EB_24px)] bg-[length:100%_24px] leading-[24px]',
          btn: 'bg-[#1A1A1A] text-[#F4F1EA]'
        };
      case 'VIRAL_RECEIPT':
        return {
          card: 'bg-[#F0FDF4] border-4 border-[#1A1A1A] rotate-[1deg] shadow-[8px_8px_0px_#065F46]',
          stamp: 'bg-[#065F46] text-white',
          headline: 'font-sans font-black text-lg text-[#1A1A1A] tracking-tight',
          body: 'font-sans text-xs font-semibold text-slate-800 bg-white p-3 rounded-lg border-2 border-[#1A1A1A]',
          btn: 'bg-[#065F46] text-white'
        };
      case 'BREAKING_FRONT':
        return {
          card: 'bg-[#F4F1EA] border-4 border-[#1A1A1A] rotate-[0.5deg] shadow-[10px_10px_0px_#8B0000]',
          stamp: 'bg-[#8B0000] text-white',
          headline: 'font-serif font-black text-2xl uppercase tracking-tight text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-2',
          body: 'font-serif text-sm text-[#1A1A1A] leading-relaxed',
          btn: 'bg-[#8B0000] text-white'
        };
      case 'TARGET_PR':
        return {
          card: 'bg-[#FAF8F5] border-double border-4 border-[#1A1A1A] rotate-[-0.5deg] shadow-[8px_8px_0px_#1A1A1A]',
          stamp: 'bg-[#1A1A1A] text-[#FDE68A]',
          headline: 'font-serif font-bold text-lg uppercase tracking-widest text-[#1A1A1A] text-center',
          body: 'font-serif text-xs text-slate-700 italic border-l-4 border-[#1A1A1A] pl-3',
          btn: 'bg-[#1A1A1A] text-white'
        };
      case 'SECURITY_WIRE':
        return {
          card: 'bg-[#FFE4E6] border-4 border-[#8B0000] rotate-[1deg] shadow-[8px_8px_0px_#1A1A1A]',
          stamp: 'bg-[#8B0000] text-white border-2 border-[#1A1A1A]',
          headline: 'font-mono font-black text-lg uppercase text-[#8B0000] tracking-wider',
          body: 'font-mono text-xs text-[#1A1A1A] bg-white/70 p-2.5 border border-[#8B0000]',
          btn: 'bg-[#8B0000] text-white'
        };
      case 'INFORMANT_TIP':
        return {
          card: 'bg-[#E6D5B8] border-4 border-[#1A1A1A] rotate-[-1deg] shadow-[8px_8px_0px_#1A1A1A]',
          stamp: 'bg-[#1A1A1A] text-[#E6D5B8]',
          headline: 'font-mono font-black text-base uppercase text-[#1A1A1A]',
          body: 'font-mono text-xs text-[#1A1A1A] border-t border-b border-dashed border-[#1A1A1A] py-2',
          btn: 'bg-[#1A1A1A] text-[#E6D5B8]'
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="fixed inset-0 z-[100] bg-[#1A1A1A]/75 backdrop-blur-[2px] flex items-center justify-center p-5 animate-fade-in">
      <div className={`w-full max-w-[340px] p-5 rounded-xl flex flex-col gap-3 relative ${theme.card}`}>
        
        {/* Top Stamp / Classification Tag */}
        <div className="flex justify-between items-center">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${theme.stamp}`}>
            {alert.stampText}
          </span>
        </div>

        {/* Headline */}
        <h2 className={theme.headline}>{alert.headline}</h2>

        {/* Body Copy */}
        <div className={theme.body}>{alert.body}</div>

        {/* Mechanical Impact Subtext */}
        {alert.subtext && (
          <div className="text-[10px] font-black uppercase tracking-widest text-[#B45309] bg-[#FEF3C7] border border-[#1A1A1A] px-2 py-1 rounded text-center">
            {alert.subtext}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onDismiss}
          className={`w-full mt-1 py-3 font-black text-xs uppercase tracking-widest border-2 border-[#1A1A1A] rounded-lg shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all cursor-pointer ${theme.btn}`}
        >
          {alert.buttonText}
        </button>
      </div>
    </div>
  );
};
