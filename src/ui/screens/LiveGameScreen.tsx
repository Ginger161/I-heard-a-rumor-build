import React, { useRef } from 'react';
import { GameEngine } from '../../hooks/useGameEngine';
import { canTick } from '../../engine/simulation';
import { nationalBelieverPct } from '../../engine/selectors';
import { getTarget } from '../../engine/data/targets';
import { SCANDALS } from '../../engine/data/targets';

import { NigeriaMapCanvas } from '../components/NigeriaMapCanvas';
import { InspectionCard } from '../components/InspectionCard';
import { PaperGrain, SparkCounter } from '../components/common';
import { PolaroidChatter } from '../components/PolaroidChatter';
import { accentOf } from '../theme';
import { moodOf } from '../mood';
import { getClimate } from '../../engine/data/climates';
import { useSettings } from '../settings';
import { LiveOverlays, useLiveShared } from '../live/shared';

const PILL =
  'flex-1 h-9 rounded-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center text-xs font-bold font-sans active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all';

const Meter: React.FC<{ label: string; value: number; color: string; danger?: boolean }> = ({ label, value, color, danger }) => (
  <div className="flex-1 min-w-0">
    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/60 leading-none mb-0.5">
      <span>{label}</span>
      <span className={danger ? 'text-[#B91C1C]' : ''}>{Math.round(value)}%</span>
    </div>
    <div className={`h-2 rounded-full border border-[#1A1A1A] bg-white overflow-hidden ${danger ? 'animate-pulse' : ''}`}>
      <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
    </div>
  </div>
);

const DOCK_ON = 'shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer';
const DOCK_OFF = 'bg-[#D4CFC4] text-slate-500 opacity-60 cursor-not-allowed';

// The phone design: a portrait frame with a top HUD, the map, an inspection card and a bottom dock. Desks open over the map.
export const LiveGameScreen: React.FC<{ engine: GameEngine }> = ({ engine }) => {
  const { gameState, pause, resume, plantSeed, selectState, collectSpark, popSpin } = engine;
  const settings = useSettings();
  const rootRef = useRef<HTMLDivElement>(null);
  const shared = useLiveShared(engine);
  const { openModal } = shared;
  const unlocked = gameState.hasPoppedFirstSpark;
  const target = getTarget(gameState.activeTargetId);
  const believers = nationalBelieverPct(gameState.states);
  const ticking = canTick(gameState);

  const activeEffects = gameState.timedEffects.filter(e => e.until >= gameState.currentDay);
  const frozenCount = Object.values(gameState.frozenChannels).filter(until => until >= gameState.currentDay).length;

  const mood = moodOf(gameState);
  const climate = getClimate(gameState.climateId);

  const onStateTap = (stateId: string | null) => {
    if (!gameState.hasPlantedSeed) {
      if (stateId) plantSeed(stateId);
      return;
    }
    selectState(stateId);
  };

  const dockButton = (label: string, modal: 'CHANNELS_DESK' | 'EVIDENCE_DESK' | 'COUNTER_OPS_DESK', tone: 'ink' | 'paper') => (
    <button
      data-tour={modal === 'CHANNELS_DESK' ? 'dock-channels' : undefined}
      disabled={!unlocked}
      onClick={() => openModal(modal)}
      className={`flex-1 py-3 font-black text-[11px] tracking-widest uppercase border-2 border-[#1A1A1A] rounded-lg transition-all ${
        unlocked ? `${tone === 'ink' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A]'} ${DOCK_ON}` : DOCK_OFF
      }`}
    >
      {label}
    </button>
  );

  return (
    <div ref={rootRef} className="w-full h-full flex flex-col bg-[#F4F1EA] text-[#1A1A1A] font-serif overflow-hidden select-none relative transition-[filter] duration-1000" style={{ filter: settings.vignette ? mood.filter : 'none' }}>
      <PaperGrain className="z-50" />

      {/* MOOD OVERLAY: heat vignette, momentum glow and icy edge. Pure decoration; never blocks a tap. */}
      <div
        aria-hidden
        className={`absolute inset-0 pointer-events-none z-[45] transition-opacity duration-700 ${mood.pulse ? 'animate-vignette-pulse' : ''}`}
        hidden={!settings.vignette}
        style={{
          background: [mood.frost ? 'linear-gradient(to top, rgba(147,197,253,0.3), transparent 16%)' : '', mood.vignette].filter(s => s && s !== 'none').join(', ') || 'none',
          boxShadow: mood.glow ?? 'none'
        }}
      />

      {/* ZONE 1: TOP BAR */}
      <div className="flex-shrink-0 bg-[#F4F1EA] border-b-2 px-3 pt-2 pb-3 flex flex-col gap-2 z-10 transition-colors duration-700" style={{ borderColor: mood.accent }}>
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest px-1 text-[#1A1A1A]/60">
          <span className="truncate">Target: {target.shortName}{gameState.training ? ' • Training' : ''}</span>
          <span data-tour="climate" className="whitespace-nowrap truncate max-w-[60%]" title={climate.blurb}>{climate.icon} {climate.name} • {SCANDALS[gameState.scandalCategory].label}</span>
        </div>
        <div data-tour="hud" className="flex items-center justify-between gap-2">
          <button onClick={() => openModal('HISTORY_LOG')} className={`${PILL} bg-white`}>
            DAY {Math.min(gameState.currentDay, gameState.dayBudget)}/{gameState.dayBudget}
          </button>
          <button onClick={() => openModal('BELIEVERS_INFO')} className={`${PILL} bg-white`}>
            👥 {believers.toFixed(1)}%
          </button>
          <button onClick={() => openModal('HEAT_INFO')} className={`${PILL} bg-[#FEE2E2] text-[#D9381E]`}>
            🚨 {Math.floor(gameState.heat)}%
          </button>
          <SparkCounter value={gameState.sparks} className="flex-1 h-9 flex items-center justify-center text-xs font-sans" />
        </div>
        <button data-tour="meters" onClick={() => openModal('TARGET_INFO')} aria-label="Open case file" className="flex items-center gap-3 px-1 cursor-pointer text-left">
          <Meter label="Cover-Up" value={gameState.coverUp} color="#B91C1C" danger={gameState.coverUp >= 65} />
          <Meter label="Story Freshness" value={gameState.freshness} color="#D97706" danger={gameState.freshness <= 25} />
        </button>
        {(activeEffects.length > 0 || frozenCount > 0) && (
          <div className="flex gap-1.5 flex-wrap px-1">
            {frozenCount > 0 && (
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-[#1E3A5F] text-white">❄ {frozenCount} channel{frozenCount > 1 ? 's' : ''} frozen</span>
            )}
            {activeEffects.map(e => (
              <span key={e.id} className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm text-white ${e.mult >= 1 ? 'bg-[#065F46]' : 'bg-[#8B0000]'}`}>
                {e.label} ×{e.mult} • {e.until - gameState.currentDay + 1}d
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ZONE 2: MAP */}
      <div className="flex-1 min-h-0 relative overflow-hidden border-b-2 border-[#1A1A1A] transition-colors duration-[2000ms]" id="map-container" data-tour="map" style={{ backgroundColor: mood.mapBg }}>
        <NigeriaMapCanvas
          gameState={gameState}
          ticking={ticking}
          onStateTap={onStateTap}
          onSparkTap={collectSpark}
          onSpinTap={popSpin}
        />

        {gameState.hasPoppedFirstSpark && <PolaroidChatter target={target} ping={gameState.chatter} accent={accentOf(target)} />}

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
      <div data-tour="dock" className="absolute bottom-4 inset-x-4 flex gap-2 z-30">
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

      <LiveOverlays engine={engine} shared={shared} rootRef={rootRef} desks />
    </div>
  );
};
