import React from 'react';
import { GameEngine } from '../../hooks/useGameEngine';
import { canTick } from '../../engine/simulation';
import { nationalBelieverPct } from '../../engine/selectors';
import { getTarget } from '../../engine/data/targets';
import { SCANDALS } from '../../engine/data/targets';

import { NigeriaMapCanvas } from '../components/NigeriaMapCanvas';
import { InspectionCard } from '../components/InspectionCard';
import { ConspiracyBoard } from '../components/ConspiracyBoard';
import { EvidenceDesk } from '../components/EvidenceDesk';
import { DefenseDesk } from '../components/DefenseDesk';
import { AlertCardModal } from '../components/AlertCardModal';
import { BelieversSheet, HeatSheet, HistoryLogSheet, PauseMenu } from '../components/Sheets';
import { PaperGrain, SparkCounter } from '../components/common';

const PILL =
  'flex-1 h-9 rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-xs font-bold font-sans active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all';

const DOCK_ON = 'shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer';
const DOCK_OFF = 'bg-[#D4CFC4] text-slate-500 opacity-60 cursor-not-allowed';

export const LiveGameScreen: React.FC<{ engine: GameEngine }> = ({ engine }) => {
  const { gameState, setModal, pause, resume, plantSeed, selectState, collectSpark, popSpin, buyChannel, leakEvidence, buyDefense, dismissTopAlert, resetAll } = engine;
  const unlocked = gameState.hasPoppedFirstSpark;
  const target = getTarget(gameState.activeTargetId);
  const believers = nationalBelieverPct(gameState.states);
  const ticking = canTick(gameState);

  const closeSheet = () => setModal(gameState.isPaused ? 'PAUSE_MENU' : 'NONE');

  const onStateTap = (stateId: string | null) => {
    if (!gameState.hasPlantedSeed) {
      if (stateId) plantSeed(stateId);
      return;
    }
    selectState(stateId);
  };

  const dockButton = (label: string, modal: 'CHANNELS_DESK' | 'EVIDENCE_DESK' | 'COUNTER_OPS_DESK', tone: 'ink' | 'paper') => (
    <button
      disabled={!unlocked}
      onClick={() => setModal(modal)}
      className={`flex-1 py-3 font-black text-[11px] tracking-widest uppercase border-2 border-[#1A1A1A] rounded-lg transition-all ${
        unlocked ? `${tone === 'ink' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'} ${DOCK_ON}` : DOCK_OFF
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#F4F1EA] text-[#1A1A1A] font-serif overflow-hidden select-none relative">
      <PaperGrain className="z-50" />

      {/* ZONE 1: TOP BAR */}
      <div className="flex-shrink-0 bg-[#F4F1EA] border-b-2 border-[#1A1A1A] px-3 pt-2 pb-3 flex flex-col gap-2 z-10">
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest px-1 text-[#1A1A1A]/60">
          <span className="truncate">Target: {target.shortName}</span>
          <span className="whitespace-nowrap">{SCANDALS[gameState.scandalCategory].label}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => setModal('HISTORY_LOG')} className={`${PILL} bg-white`}>
            DAY {Math.min(gameState.currentDay, gameState.dayBudget)}/{gameState.dayBudget}
          </button>
          <button onClick={() => setModal('BELIEVERS_INFO')} className={`${PILL} bg-white`}>
            👥 {believers.toFixed(1)}%
          </button>
          <button onClick={() => setModal('HEAT_INFO')} className={`${PILL} bg-[#FEE2E2] text-[#D9381E]`}>
            🚨 {Math.floor(gameState.heat)}%
          </button>
          <SparkCounter value={gameState.sparks} className="flex-1 h-9 flex items-center justify-center text-xs font-sans" />
        </div>
      </div>

      {/* ZONE 2: MAP */}
      <div className="flex-1 relative bg-[#EADCC8] overflow-hidden border-b-2 border-[#1A1A1A]" id="map-container">
        <NigeriaMapCanvas
          gameState={gameState}
          ticking={ticking}
          onStateTap={onStateTap}
          onSparkTap={collectSpark}
          onSpinTap={popSpin}
        />

        {/* Phase 1 floating instruction badges */}
        {!gameState.hasPlantedSeed && (
          <div className="absolute inset-x-0 top-3 flex justify-center pointer-events-none z-20">
            <div className="bg-[#1A1A1A] text-[#F4F1EA] px-4 py-2 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_rgba(0,0,0,0.3)] rotate-[-2deg] animate-pulse">
              <p className="font-serif font-black text-xs uppercase tracking-widest text-center">Tap a state to plant the rumor</p>
            </div>
          </div>
        )}
        {gameState.hasPlantedSeed && !gameState.hasPoppedFirstSpark && (
          <div className="absolute inset-x-0 top-3 flex justify-center pointer-events-none z-20">
            <div className="bg-[#FDE68A] text-[#B45309] px-4 py-2 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_rgba(0,0,0,0.3)] rotate-[1deg] animate-pulse">
              <p className="font-serif font-black text-xs uppercase tracking-widest text-center">Shatter the ⚡ to start the clock</p>
            </div>
          </div>
        )}
      </div>

      {/* ZONE 3: INSPECTION CARD */}
      <InspectionCard gameState={gameState} />

      {/* BOTTOM ACTION DOCK */}
      <div className="absolute bottom-4 inset-x-4 flex gap-2 z-30">
        {dockButton('Channels', 'CHANNELS_DESK', 'ink')}
        {dockButton('Evidence', 'EVIDENCE_DESK', 'ink')}
        {dockButton('Defense', 'COUNTER_OPS_DESK', 'paper')}
        <button
          onClick={() => (gameState.isPaused ? resume() : pause())}
          disabled={!unlocked}
          aria-label={gameState.isPaused ? 'Resume' : 'Pause'}
          className={`w-12 flex-shrink-0 flex items-center justify-center border-2 border-[#1A1A1A] rounded-lg transition-all ${
            unlocked ? `bg-white text-[#1A1A1A] ${DOCK_ON}` : DOCK_OFF
          }`}
        >
          <span className="font-black">{gameState.isPaused ? '▶' : 'II'}</span>
        </button>
      </div>

      {/* DESKS & SHEETS */}
      {gameState.activeModal === 'CHANNELS_DESK' && (
        <ConspiracyBoard gameState={gameState} onClose={() => setModal('NONE')} onBuy={buyChannel} />
      )}
      {gameState.activeModal === 'EVIDENCE_DESK' && (
        <EvidenceDesk gameState={gameState} onClose={() => setModal('NONE')} onLeak={leakEvidence} />
      )}
      {gameState.activeModal === 'COUNTER_OPS_DESK' && (
        <DefenseDesk gameState={gameState} onClose={() => setModal('NONE')} onBuy={buyDefense} />
      )}
      {gameState.activeModal === 'HISTORY_LOG' && <HistoryLogSheet gameState={gameState} onClose={closeSheet} />}
      {gameState.activeModal === 'BELIEVERS_INFO' && <BelieversSheet gameState={gameState} onClose={closeSheet} />}
      {gameState.activeModal === 'HEAT_INFO' && <HeatSheet gameState={gameState} onClose={closeSheet} />}
      {gameState.activeModal === 'PAUSE_MENU' && (
        <PauseMenu onResume={resume} onHistory={() => setModal('HISTORY_LOG')} onReset={resetAll} />
      )}

      {/* ALERT QUEUE: always on top, pauses the clock while non-empty */}
      {gameState.notificationQueue.length > 0 && (
        <AlertCardModal alert={gameState.notificationQueue[0]} remaining={gameState.notificationQueue.length - 1} onDismiss={dismissTopAlert} />
      )}
    </div>
  );
};
