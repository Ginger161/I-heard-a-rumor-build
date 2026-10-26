import React, { useRef } from 'react';
import { GameEngine } from '../../hooks/useGameEngine';
import { canTick } from '../../engine/simulation';
import { nationalBelieverPct } from '../../engine/selectors';
import { vocabFor } from '../../engine/campaigns';
import { getTarget } from '../../engine/data/targets';
import { SCANDALS } from '../../engine/data/targets';

import { NigeriaMapCanvas } from '../components/NigeriaMapCanvas';
import { InspectionCard } from '../components/InspectionCard';
import { PaperGrain, SparkCounter } from '../components/common';
import { PolaroidChatter } from '../components/PolaroidChatter';
import { RumorCard } from '../components/RumorCard';
import { Reveal, useReveals } from '../components/Reveal';
import { MODE_META, useMode } from '../modeTheme';
import { accentOf } from '../theme';
import { moodOf, targetEmotion } from '../mood';
import { getClimate } from '../../engine/data/climates';
import { useSettings } from '../settings';
import { LiveOverlays, useLiveShared } from '../live/shared';

const PILL =
  'flex-1 h-9 rounded-lg border-2 border-[var(--m-line)] shadow-[2px_2px_0px_var(--m-line)] flex items-center justify-center text-xs font-bold font-sans active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all';

const Meter: React.FC<{ label: string; value: number; color: string; danger?: boolean }> = ({ label, value, color, danger }) => (
  <div className="flex-1 min-w-0">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[var(--m-ink)]/72 leading-none mb-0.5">
      <span>{label}</span>
      <span className={danger ? 'text-[#B91C1C]' : ''}>{Math.round(value)}%</span>
    </div>
    <div className={`h-2 rounded-full border border-[var(--m-line)] bg-[var(--m-surface2)] overflow-hidden ${danger ? 'animate-pulse' : ''}`}>
      <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
    </div>
  </div>
);

const DOCK_ON = 'shadow-[3px_3px_0px_var(--m-line)] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer';
const DOCK_OFF = 'bg-[var(--m-disabled)] text-[var(--m-soft)] opacity-60 cursor-not-allowed';

// The phone design: a portrait frame with a top HUD, the map, an inspection card and a bottom dock. Desks open over the map.
export const LiveGameScreen: React.FC<{ engine: GameEngine }> = ({ engine }) => {
  const { gameState, profile, pause, resume, plantSeed, selectState, collectSpark, popSpin } = engine;
  const settings = useSettings();
  const rootRef = useRef<HTMLDivElement>(null);
  const shared = useLiveShared(engine);
  const { openModal } = shared;
  const unlocked = gameState.hasPoppedFirstSpark;
  const target = getTarget(gameState.activeTargetId);
  const mode = useMode();
  const believers = nationalBelieverPct(gameState.states);
  const ticking = canTick(gameState);

  // Beginners get a lighter screen: the day, believers and cash first, and each other meter or button appears the moment it starts
  // to matter (with a one-time hint). Experienced players, with three Targets beaten, always see everything.
  const lite = gameState.training || Object.keys(profile.targetStars).length < 3;
  const vocab = vocabFor(gameState.activeTargetId);
  const showHeat = !lite || gameState.peakHeat >= 10;
  const showMeters = !lite || gameState.coverUp >= 8 || gameState.freshness <= 80;
  const showEvidence = !lite || gameState.investigationProgress >= 25 || gameState.droppedEvidence.length > 0;
  const showDefense = !lite || gameState.peakHeat >= 15 || Object.keys(gameState.defensePurchases).length > 0;

  // The first time each of these appears it is pointed at (see Reveal). Not while a card, desk or tutorial step is in the way.
  const { active: reveal, dismiss: dismissReveal } = useReveals(
    { heat: showHeat, meters: showMeters, evidence: showEvidence, defense: showDefense },
    lite && gameState.status === 'PLAYING' && gameState.hasPoppedFirstSpark && gameState.notificationQueue.length === 0 && gameState.activeModal === 'NONE' && !shared.tourHold && !gameState.isPaused,
    lite
  );

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

  const dockButton = (label: string, modal: 'CHANNELS_DESK' | 'EVIDENCE_DESK' | 'COUNTER_OPS_DESK', tone: 'ink' | 'paper', revealId?: 'evidence' | 'defense') => (
    <Reveal id={revealId ?? 'evidence'} on={!!revealId && reveal === revealId} onDone={dismissReveal} className="flex-1" campaign={vocab.campaign}>
      <button
        data-tour={modal === 'CHANNELS_DESK' ? 'dock-channels' : modal === 'EVIDENCE_DESK' ? 'dock-evidence' : 'dock-defense'}
        disabled={!unlocked}
        onClick={() => openModal(modal)}
        className={`w-full py-3 font-black text-[11px] tracking-widest uppercase border-2 border-[var(--m-line)] rounded-lg transition-all ${
          unlocked ? `${tone === 'ink' ? 'bg-[var(--m-btn-ink-bg)] text-[var(--m-btn-ink-fg)]' : 'bg-[var(--m-btn-paper-bg)] text-[var(--m-btn-paper-fg)]'} ${DOCK_ON}` : DOCK_OFF
        }`}
      >
        {label}
      </button>
    </Reveal>
  );

  return (
    <div ref={rootRef} className={`w-full h-full flex flex-col ${MODE_META[mode].tex} ${mode === 'story' ? 'fx-film' : ''} text-[#1A1A1A] font-serif overflow-hidden select-none relative transition-[filter] duration-1000`} style={{ filter: settings.vignette ? mood.filter : 'none' }}>
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
      <div className="flex-shrink-0 bg-[var(--m-header)] text-[var(--m-header-ink)] border-b-2 px-3 pt-2 pb-3 flex flex-col gap-2 z-10 transition-colors duration-700" style={{ borderColor: mood.accent }}>
        <RumorCard
          gameState={gameState}
          variant="strip"
          onOpen={() => openModal('TARGET_INFO')}
          right={!lite ? <span data-tour="climate" className="whitespace-nowrap truncate" title={climate.blurb}>{climate.icon} {climate.name}</span> : undefined}
        />
        <div data-tour="hud" className="flex items-center justify-between gap-2">
          <button onClick={() => openModal('HISTORY_LOG')} className={`${PILL} bg-[var(--m-surface2)] text-[var(--m-ink)]`}>
            DAY {Math.min(gameState.currentDay, gameState.dayBudget)}/{gameState.dayBudget}
          </button>
          <button onClick={() => openModal('BELIEVERS_INFO')} className={`${PILL} bg-[var(--m-surface2)] text-[var(--m-ink)]`}>
            👥 {believers.toFixed(1)}%{lite && <span className="text-[var(--m-ink)]/72 font-bold">&nbsp;/ 75</span>}
          </button>
          <Reveal id="heat" on={reveal === 'heat'} onDone={dismissReveal} className="flex-1" campaign={vocab.campaign}>
            <button
              data-tour="heat"
              onClick={() => openModal('HEAT_INFO')}
              disabled={!showHeat}
              aria-hidden={!showHeat}
              className={`${PILL} w-full bg-[#FEE2E2] text-[#B91C1C] transition-opacity duration-500 ${showHeat ? (lite ? 'animate-pop-in' : '') : 'opacity-0 pointer-events-none'}`}
            >
              {vocab.heatIcon} {Math.floor(gameState.heat)}%
            </button>
          </Reveal>
          <SparkCounter value={gameState.sparks} className="flex-1 h-9 flex items-center justify-center text-xs font-sans" />
        </div>
        <Reveal id="meters" on={reveal === 'meters'} onDone={dismissReveal} campaign={vocab.campaign}>
          <button data-tour="meters" onClick={() => openModal('TARGET_INFO')} disabled={!showMeters} aria-hidden={!showMeters} aria-label="Open case file" className={`w-full flex items-center gap-3 px-1 cursor-pointer text-left transition-opacity duration-700 ${showMeters ? '' : 'opacity-0 pointer-events-none'}`}>
            <Meter label={vocab.coverUp} value={gameState.coverUp} color="#B91C1C" danger={gameState.coverUp >= 65} />
            <Meter label="Story Freshness" value={gameState.freshness} color="#D97706" danger={gameState.freshness <= 25} />
          </button>
          {!showMeters && (
            <div className="absolute inset-0 flex items-center justify-center text-[12px] font-sans font-bold text-[var(--m-ink)]/72 text-center leading-tight pointer-events-none">🎯 Get 75% of Nigeria to believe it before the days run out.</div>
          )}
        </Reveal>
        {(activeEffects.length > 0 || frozenCount > 0) && (
          <div className="flex gap-1.5 flex-wrap px-1">
            {frozenCount > 0 && (
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-[#1E3A5F] text-white">❄ {frozenCount} channel{frozenCount > 1 ? 's' : ''} frozen</span>
            )}
            {activeEffects.map(e => (
              <span key={e.id} className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm text-white ${e.mult >= 1 ? 'bg-[#065F46]' : 'bg-[#8B0000]'}`}>
                {e.label} ×{e.mult} • {e.until - gameState.currentDay + 1}d
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ZONE 2: MAP */}
      <div className="flex-1 min-h-0 relative overflow-hidden border-b-2 border-[var(--m-line)] transition-colors duration-[2000ms]" id="map-container" data-tour="map" style={{ backgroundColor: mode === 'arcade' ? mood.mapBg : 'var(--m-map)' }}>
        <NigeriaMapCanvas
          gameState={gameState}
          ticking={ticking}
          onStateTap={onStateTap}
          onSparkTap={collectSpark}
          onSpinTap={popSpin}
        />

        {gameState.hasPoppedFirstSpark && <PolaroidChatter target={target} ping={gameState.chatter} accent={accentOf(target)} emotion={targetEmotion(gameState)} />}

        {/* Phase 1 floating instruction badges */}
        {!gameState.hasPlantedSeed && (
          <div className="absolute inset-x-0 top-3 flex justify-center pointer-events-none z-20">
            <div className="bg-[#1A1A1A] text-[#F4F1EA] px-4 py-2 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_rgba(0,0,0,0.3)] rotate-[-2deg] animate-hint">
              <p className="font-serif font-black text-xs uppercase tracking-widest text-center">{vocab.campaign ? 'Tap a state to start the campaign' : 'Tap a state to plant the rumor'}</p>
            </div>
          </div>
        )}
        {gameState.hasPlantedSeed && !gameState.hasPoppedFirstSpark && (
          <div className="absolute inset-x-0 top-3 flex justify-center pointer-events-none z-20">
            <div className="bg-[#FDE68A] text-[#7C2D12] px-4 py-2 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_rgba(0,0,0,0.3)] rotate-[1deg] animate-hint">
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
        {showEvidence && dockButton(vocab.evidence, 'EVIDENCE_DESK', 'ink', 'evidence')}
        {showDefense && dockButton(vocab.defense, 'COUNTER_OPS_DESK', 'paper', 'defense')}
        <button
          onClick={() => (gameState.isPaused ? resume() : pause())}
          disabled={!unlocked}
          aria-label={gameState.isPaused ? 'Resume' : 'Pause'}
          className={`w-12 flex-shrink-0 flex items-center justify-center border-2 border-[var(--m-line)] rounded-lg transition-all ${
            unlocked ? `bg-[var(--m-btn-paper-bg)] text-[var(--m-btn-paper-fg)] ${DOCK_ON}` : DOCK_OFF
          }`}
        >
          <span className="font-black">{gameState.isPaused ? '▶' : 'II'}</span>
        </button>
      </div>

      <LiveOverlays engine={engine} shared={shared} rootRef={rootRef} desks />
    </div>
  );
};
