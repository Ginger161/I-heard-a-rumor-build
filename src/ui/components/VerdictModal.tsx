import React from 'react';
import { GameState } from '../../engine/types';

interface VerdictModalProps {
  gameState: GameState;
  onRestart: () => void;
  onLobby: () => void;
}

export const VerdictModal: React.FC<VerdictModalProps> = ({ gameState, onRestart, onLobby }) => {
  // Determine win/loss context
  const isWin = gameState.status === 'VICTORY';
  const isHeatDeath = gameState.status === 'DEFEAT_HEAT';

  let headline = "STORY BURIED";
  let subhead = "The 20-day investigation cycle elapsed. The target survived.";
  let stampText = "TIME'S UP";
  let stampColor = "text-[#8B0000] border-[#8B0000]";

  if (isWin) {
    headline = "TARGET CANCELLED";
    subhead = "Critical mass achieved. The target has been completely disgraced.";
    stampText = "PUBLISHED";
    stampColor = "text-[#065F46] border-[#065F46]"; // Emerald dark
  } else if (isHeatDeath) {
    headline = "RAIDED BY DSS";
    subhead = "Heat reached 100%. Regulators seized your servers and arrested your network.";
    stampText = "ARRESTED";
    stampColor = "text-[#8B0000] border-[#8B0000]";
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center p-6 select-none">
      
      {/* THE PHYSICAL CARD */}
      <div className="w-full max-w-[360px] bg-[#F4F1EA] border-4 border-[#1A1A1A] rounded-2xl shadow-[8px_8px_0px_#1A1A1A] p-6 relative overflow-hidden animate-slide-up">
        
        {/* NOISE TEXTURE */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        ></div>

        {/* MASSIVE BG STAMP */}
        <div className={`absolute top-12 -right-4 rotate-[15deg] border-4 ${stampColor} font-black text-5xl tracking-widest px-4 py-2 opacity-10 pointer-events-none font-serif`}>
          {stampText}
        </div>

        {/* HEADER BLOCK */}
        <div className="border-b-4 border-[#1A1A1A] pb-4 mb-5 relative z-10">
          <span className="bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-3 inline-block rounded-sm">Final Edition</span>
          <h2 className="text-3xl font-black font-serif leading-none uppercase text-[#1A1A1A] drop-shadow-sm">{headline}</h2>
          <p className="text-sm font-sans mt-3 text-[#1A1A1A] font-bold leading-relaxed">{subhead}</p>
        </div>

        {/* TACTILE STAT BOXES */}
        <div className="flex flex-col gap-2.5 mb-6 relative z-10 font-sans font-bold">
          <div className="flex justify-between items-center bg-[#EBE5D9] p-3 border-2 border-[#1A1A1A] rounded-xl shadow-[2px_2px_0px_#1A1A1A]">
            <span className="text-slate-600 text-xs uppercase tracking-wider">Final Day</span>
            <span className="text-[#1A1A1A] text-sm">{Math.min(gameState.currentDay, gameState.dayBudget)} / {gameState.dayBudget}</span>
          </div>
          <div className="flex justify-between items-center bg-[#EBE5D9] p-3 border-2 border-[#1A1A1A] rounded-xl shadow-[2px_2px_0px_#1A1A1A]">
            <span className="text-slate-600 text-xs uppercase tracking-wider">Heat Level</span>
            <span className={`${isHeatDeath ? 'text-[#8B0000]' : 'text-[#1A1A1A]'} text-sm`}>{Math.floor(gameState.heat)}%</span>
          </div>
          <div className="flex justify-between items-center bg-[#EBE5D9] p-3 border-2 border-[#1A1A1A] rounded-xl shadow-[2px_2px_0px_#1A1A1A]">
            <span className="text-slate-600 text-xs uppercase tracking-wider">Investigation</span>
            <span className="text-[#1A1A1A] text-sm">{Math.floor(gameState.investigationProgress)}%</span>
          </div>
        </div>

        {/* BIG TACTILE BUTTONS */}
        <div className="flex gap-3 relative z-10 mt-2">
          <button 
            onClick={onRestart}
            className="flex-1 h-12 bg-[#1A1A1A] text-white font-black text-[11px] uppercase tracking-wider rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all cursor-pointer"
          >
            Play Again
          </button>
          <button 
            onClick={onLobby}
            className="flex-1 h-12 bg-white text-[#1A1A1A] font-black text-[11px] uppercase tracking-wider rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all cursor-pointer"
          >
            Lobby
          </button>
        </div>

      </div>
    </div>
  );
};
