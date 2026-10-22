import React from 'react';
import { GameState, ModalState } from '../../engine/types';

import { NigeriaMapCanvas } from '../components/NigeriaMapCanvas';
import { ConspiracyBoard } from '../components/ConspiracyBoard';
import { EvidenceDesk } from '../components/EvidenceDesk';
import { AlertCardModal } from '../components/AlertCardModal';

interface LiveGameProps {
  gameState: GameState;
  setModal: (modal: ModalState) => void;
  resumePlay: () => void;
  plantSeed: (stateId: string) => void;
  buyChannel: (id: string) => void;
  dropEvidence: (id: string) => void;
  buyDefense?: (name: string, cost?: number, heatReduced?: number) => void;
  dismissTopAlert?: () => void;
  onStateTap?: (stateId: string) => void;
  onSparkTap?: (sparkId: string, amount: number) => void;
}

export const LiveGameScreen: React.FC<LiveGameProps> = ({ 
  gameState, 
  setModal, 
  resumePlay,
  plantSeed,
  buyChannel,
  dropEvidence,
  buyDefense: _buyDefense,
  dismissTopAlert,
  onStateTap,
  onSparkTap
}) => {
  const day = gameState.currentDay || 1;
  const sparks = gameState.sparks || 0;
  const heat = gameState.heat || 0;
  const totalPop = 223800000;
  
  const nationalBelievers = Object.values(gameState.states).reduce((sum, state) => sum + state.believers, 0);
  const believersPercent = ((nationalBelievers / totalPop) * 100).toFixed(1);

  const openModal = setModal;
  const togglePause = () => (gameState.isPaused ? resumePlay() : setModal('PAST_LOG'));

  return (
    <div className="w-full h-full flex flex-col bg-[#F4F1EA] text-[#1A1A1A] font-serif overflow-hidden select-none relative">
      
      {/* GLOBAL NOISE TEXTURE OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply z-50"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      {/* ZONE 1: TOP BAR (Tactile Pills) */}
      <div className="flex-shrink-0 bg-[#F4F1EA] border-b-2 border-[#1A1A1A] px-3 py-3 flex flex-col z-10">
        
        {gameState.scramble?.active && (
          <div className="bg-[#D9381E] text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] font-bold uppercase tracking-widest mb-3 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
            <span>⚠️ Target Mobilizing</span>
            <span>[{gameState.scramble.hoursRemaining}H]</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button 
            onClick={() => setModal('PAST_LOG')}
            className="flex-1 h-9 rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-xs font-bold font-sans bg-white active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
          >
            DAY {Math.min(day, gameState.dayBudget)}/{gameState.dayBudget}
          </button>
          <button 
            onClick={() => setModal('BELIEVERS_INFO')}
            className="flex-1 h-9 rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-xs font-bold font-sans bg-white active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
          >
            👥 {believersPercent}%
          </button>
          <button 
            onClick={() => setModal('HEAT_INFO')}
            className="flex-1 h-9 rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-xs font-bold font-sans bg-[#FEE2E2] text-[#D9381E] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
          >
            🚨 {Math.floor(heat)}%
          </button>
          <div className="flex-1 h-9 rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-xs font-bold font-sans bg-[#FEF3C7] text-[#B45309]">
            ⚡ {sparks}
          </div>
        </div>
      </div>

      {/* ZONE 2: MAP CANVAS */}
      <div className="flex-1 relative bg-[#EADCC8] overflow-hidden border-b-2 border-[#1A1A1A]" id="map-container">
        <NigeriaMapCanvas 
          gameState={gameState} 
          plantSeed={plantSeed}
          onStateTap={(stateId) => {
            console.log('Tapped state:', stateId);
            onStateTap?.(stateId);
          }} 
          onSparkTap={(sparkId, amount) => {
            console.log('Collected spark:', sparkId, amount);
            onSparkTap?.(sparkId, amount);
          }} 
        />
        
        {gameState.hasPlantedSeed && gameState.isPaused && gameState.activeModal === 'NONE' && (
          <div className="absolute inset-0 bg-[#F4F1EA]/60 backdrop-blur-sm flex items-center justify-center z-40 pointer-events-none">
            <span className="text-3xl font-black tracking-widest text-[#1A1A1A] border-4 border-[#1A1A1A] rounded-xl py-3 px-8 bg-white shadow-[4px_4px_0px_#1A1A1A] rotate-[-2deg]">
              PAUSED
            </span>
          </div>
        )}
      </div>

      {/* ZONE 3: PERSISTENT GIST BAR (Slightly rounded, elevated) */}
      <div className="flex-shrink-0 bg-[#1A1A1A] text-[#F4F1EA] p-3 z-10 border-t-2 border-[#1A1A1A] shadow-[0px_-4px_0px_rgba(0,0,0,0.1)] rounded-t-2xl mt-[-10px] pb-20">
        <div className="flex justify-between items-baseline mb-2 px-1">
          <span className="text-sm font-bold tracking-wide uppercase">🇳🇬 Nigeria</span>
          <span className="text-[10px] font-sans text-slate-400 font-bold">POP: 223.8M</span>
        </div>
        
        <div className="w-full h-2.5 bg-black rounded-full flex overflow-hidden mb-3 border border-white/20 shadow-inner">
          <div className="bg-[#D9381E] h-full" style={{ width: `${believersPercent}%` }} />
          <div className="bg-[#F4F1EA] h-full opacity-30" style={{ width: `0%` }} />
        </div>

        <div className="text-[11px] leading-snug font-sans italic text-slate-300 px-1 line-clamp-2">
          {!gameState.hasPlantedSeed 
            ? "Investigation dossier assembled. Tap any state to leak the first whisper and trigger the countdown."
            : "\"The scandal is just breaking. Nobody knows the truth yet, but whispers are starting in the streets...\""}
        </div>
      </div>

      {/* BOTTOM ACTION DOCK */}
      <div className="absolute bottom-4 inset-x-4 flex gap-2 z-30">
        <button 
          disabled={!gameState.hasPoppedFirstSpark}
          onClick={() => openModal('CHANNELS_DESK')}
          className={`flex-1 py-3 font-black text-[11px] tracking-widest uppercase border-2 border-[#1A1A1A] rounded-lg transition-all ${
            gameState.hasPoppedFirstSpark 
              ? 'bg-[#1A1A1A] text-white shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer' 
              : 'bg-[#D4CFC4] text-slate-500 opacity-60 cursor-not-allowed'
          }`}
        >
          Channels
        </button>
        <button 
          disabled={!gameState.hasPoppedFirstSpark}
          onClick={() => openModal('EVIDENCE_DESK')}
          className={`flex-1 py-3 font-black text-[11px] tracking-widest uppercase border-2 border-[#1A1A1A] rounded-lg transition-all ${
            gameState.hasPoppedFirstSpark 
              ? 'bg-[#1A1A1A] text-white shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer' 
              : 'bg-[#D4CFC4] text-slate-500 opacity-60 cursor-not-allowed'
          }`}
        >
          Evidence
        </button>
        <button 
          disabled={!gameState.hasPoppedFirstSpark}
          onClick={() => openModal('COUNTER_OPS_DESK')}
          className={`flex-1 py-3 font-black text-[11px] tracking-widest uppercase border-2 border-[#1A1A1A] rounded-lg transition-all ${
            gameState.hasPoppedFirstSpark 
              ? 'bg-white text-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer' 
              : 'bg-[#D4CFC4] text-slate-500 opacity-60 cursor-not-allowed'
          }`}
        >
          Defense
        </button>
        
        {/* Pause Button STRICT LOCK */}
        <button 
          onClick={togglePause}
          disabled={!gameState.hasPoppedFirstSpark}
          className={`w-12 flex-shrink-0 flex items-center justify-center border-2 border-[#1A1A1A] rounded-lg transition-all ${
            gameState.hasPoppedFirstSpark
              ? 'bg-white text-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer'
              : 'bg-[#D4CFC4] text-slate-500 opacity-60 cursor-not-allowed'
          }`}
        >
          <span className="font-black">{gameState.isPaused ? '▶' : 'II'}</span>
        </button>
      </div>

      {/* "TAP TO PLANT" INSTRUCTION OVERLAY */}
      {!gameState.hasPlantedSeed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none pb-32">
          <div className="bg-[#1A1A1A] text-[#F4F1EA] px-6 py-3 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_rgba(0,0,0,0.3)] rotate-[-2deg] animate-pulse">
            <p className="font-serif font-black text-sm uppercase tracking-widest text-center">Tap any state<br/>to leak the dossier</p>
          </div>
        </div>
      )}

      {/* MODALS OVERLAY */}
      {gameState.activeModal === 'CHANNELS_DESK' && (
        <ConspiracyBoard 
          gameState={gameState} 
          onClose={resumePlay} 
          onBuy={(id) => buyChannel(id)} 
        />
      )}

      {gameState.activeModal === 'EVIDENCE_DESK' && (
        <EvidenceDesk 
          gameState={gameState} 
          onClose={resumePlay} 
          onDrop={(id) => dropEvidence(id)} 
        />
      )}

      {/* ALERT QUEUE READER */}
      {gameState.notificationQueue && gameState.notificationQueue.length > 0 && (
        <AlertCardModal 
          alert={gameState.notificationQueue[0]} 
          onDismiss={() => {
            // Shift the first alert off the queue and unpause if queue is now empty
            if (dismissTopAlert) {
              dismissTopAlert();
            }
          }}
        />
      )}

    </div>
  );
};
