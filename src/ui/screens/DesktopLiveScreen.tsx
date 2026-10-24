import { RumorCard } from '../components/RumorCard';
import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../../hooks/useGameEngine';
import { canTick } from '../../engine/simulation';
import { nationalBelieverPct } from '../../engine/selectors';
import { SCANDALS, describeTarget, getTarget } from '../../engine/data/targets';
import { getClimate } from '../../engine/data/climates';
import { NigeriaMapCanvas } from '../components/NigeriaMapCanvas';
import { InspectionCard } from '../components/InspectionCard';
import { ConspiracyBoard } from '../components/ConspiracyBoard';
import { EvidenceDesk } from '../components/EvidenceDesk';
import { DefenseDesk } from '../components/DefenseDesk';
import { Avatar } from '../components/Silhouette';
import { PaperGrain, SparkCounter } from '../components/common';
import { accentOf } from '../theme';
import { moodOf, targetEmotion } from '../mood';
import { sfx, useSfxMuted } from '../audio';
import { useSettings } from '../settings';
import { LiveOverlays, useLiveShared } from '../live/shared';

// THE DESKTOP DESIGN: a situation room. A case file on the left, the map (or the Conspiracy Board) in the middle, the desks
// docked on the right, and a news ticker along the bottom. Nothing is a stretched phone screen: the HUD is a labelled
// instrument panel, the Target is always on screen, hovering a state inspects it, and everything has a key.
//
// The clock rule is the same as on the phone: while you work at a desk (Board, Evidence or Defence) the news cycle waits,
// so the two designs are equally fair. The map and the log run in real time.
const LABEL = 'text-[10px] font-black uppercase tracking-[0.18em]';

const Gauge: React.FC<{ label: string; value: number; color: string; warn?: number; hint?: string }> = ({ label, value, color, warn, hint }) => {
  const danger = warn !== undefined && value >= warn;
  return (
    <div className="min-w-[132px] flex-1" title={hint}>
      <div className="flex justify-between items-baseline">
        <span className={`${LABEL} text-slate-400`}>{label}</span>
        <span className={`font-mono text-[13px] font-black ${danger ? 'text-[#FCA5A5]' : 'text-[#F4F1EA]'}`}>{Math.round(value)}%</span>
      </div>
      <div className={`h-2.5 mt-1 rounded-sm bg-black/60 border border-white/20 overflow-hidden ${danger ? 'animate-pulse' : ''}`}>
        <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

const Key: React.FC<{ k: string }> = ({ k }) => (
  <kbd className="ml-1.5 px-1.5 py-[1px] rounded border border-current/40 bg-black/10 text-[10px] font-mono font-black opacity-80">{k}</kbd>
);

type Desk = 'NONE' | 'CHANNELS_DESK' | 'EVIDENCE_DESK' | 'COUNTER_OPS_DESK';

export const DesktopLiveScreen: React.FC<{ engine: GameEngine }> = ({ engine }) => {
  const { gameState, setModal, pause, resume, plantSeed, selectState, collectSpark, popSpin, buyChannel, leakEvidence, buyDefense } = engine;
  const settings = useSettings();
  const [muted, setMuted] = useSfxMuted();
  const rootRef = useRef<HTMLDivElement>(null);
  const shared = useLiveShared(engine);
  const { openModal, setSettingsOpen, setGuide } = shared;
  const [rightTab, setRightTab] = useState<'LOG' | 'EVIDENCE' | 'DEFENSE'>('LOG');

  const target = getTarget(gameState.activeTargetId);
  const accent = accentOf(target);
  const believers = nationalBelieverPct(gameState.states);
  const ticking = canTick(gameState);
  const mood = moodOf(gameState);
  const climate = getClimate(gameState.climateId);
  const unlocked = gameState.hasPoppedFirstSpark;
  const day = Math.min(gameState.currentDay, gameState.dayBudget);
  const desk: Desk = (['CHANNELS_DESK', 'EVIDENCE_DESK', 'COUNTER_OPS_DESK'] as const).find(d => d === gameState.activeModal) ?? 'NONE';
  const activeEffects = gameState.timedEffects.filter(e => e.until >= gameState.currentDay);
  const frozen = Object.entries(gameState.frozenChannels).filter(([, until]) => until >= gameState.currentDay);
  const pausedOverlay = gameState.activeModal === 'PAUSE_MENU';

  // Desks mirror the engine's own modal state, so the clock rule is exactly the phone's.
  const goDesk = (d: Desk) => {
    if (!unlocked) return;
    sfx.play('click');
    if (d === 'EVIDENCE_DESK') setRightTab('EVIDENCE');
    if (d === 'COUNTER_OPS_DESK') setRightTab('DEFENSE');
    setModal(d);
  };
  const showLog = () => { setRightTab('LOG'); setModal('NONE'); };

  // Keys: 1 map, 2 board, E evidence, D defence, L log, Space pause. (Escape lives in the shared handler.)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (gameState.notificationQueue.length > 0 || gameState.status !== 'PLAYING' || shared.settingsOpen || shared.guide.open) return;
      const k = e.key.toLowerCase();
      if (k === '1') { showLog(); }
      else if (k === '2') goDesk('CHANNELS_DESK');
      else if (k === 'e') goDesk('EVIDENCE_DESK');
      else if (k === 'd') goDesk('COUNTER_OPS_DESK');
      else if (k === 'l') showLog();
      else if (k === ' ' && unlocked) { e.preventDefault(); if (gameState.isPaused) resume(); else pause(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  // When a desk closes elsewhere (Escape, the pause menu), the right panel falls back to the log.
  useEffect(() => { if (desk === 'NONE' && rightTab !== 'LOG' && !pausedOverlay) setRightTab('LOG'); }, [desk, pausedOverlay]); // eslint-disable-line react-hooks/exhaustive-deps

  const onStateTap = (stateId: string | null) => {
    if (!gameState.hasPlantedSeed) { if (stateId) plantSeed(stateId); return; }
    selectState(stateId);
  };

  const log = [...gameState.historyLog].reverse();
  const ticker = log.slice(0, 6).map(e => `Day ${e.day}: ${e.headline}`).join('   •   ') || 'No developments yet. Plant the rumour and keep pushing.';

  return (
    <div ref={rootRef} className="relative w-full h-full flex flex-col bg-[#1A1A1A] text-[#1A1A1A] font-serif overflow-hidden select-none" style={{ filter: settings.vignette ? mood.filter : 'none' }}>
      {/* mood overlay across the whole room */}
      <div
        aria-hidden hidden={!settings.vignette}
        className={`absolute inset-0 pointer-events-none z-[45] ${mood.pulse ? 'animate-vignette-pulse' : ''}`}
        style={{ background: mood.vignette !== 'none' ? mood.vignette : 'none', boxShadow: mood.glow ?? 'none' }}
      />

      {/* ---------------- TOP: masthead and instruments ---------------- */}
      <header className="flex-shrink-0 flex items-center gap-5 px-5 h-[76px] bg-[#111] border-b-4 text-[#F4F1EA]" style={{ borderColor: mood.accent }}>
        <div className="min-w-0 w-[260px]">
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FDE68A]">Case file{gameState.training ? ' • Training' : ''}{gameState.assisted ? ' • Assisted' : ''}</div>
          <div className="font-serif font-black text-[19px] leading-tight truncate">{target.shortName}</div>
          <div className="text-[11px] font-sans text-slate-400 truncate" title={gameState.scandalTitle}>{SCANDALS[gameState.scandalCategory].label}: {gameState.scandalTitle}</div>
        </div>

        <div data-tour="hud" className="flex items-center gap-4 xl:gap-5 flex-1 justify-center min-w-0">
          <button onClick={() => openModal('HISTORY_LOG')} className="text-left cursor-pointer" aria-label="Case log">
            <div className={`${LABEL} text-slate-400`}>Day</div>
            <div className="font-mono font-black text-[22px] leading-none">{day}<span className="text-slate-500 text-[14px]">/{gameState.dayBudget}</span></div>
          </button>
          <button onClick={() => openModal('BELIEVERS_INFO')} className="text-left cursor-pointer" aria-label="Believers">
            <div className={`${LABEL} text-slate-400`}>Believers</div>
            <div className="font-mono font-black text-[22px] leading-none whitespace-nowrap">{believers.toFixed(1)}<span className="text-slate-500 text-[14px]">% / 75</span></div>
          </button>
          <button onClick={() => openModal('HEAT_INFO')} className="text-left cursor-pointer" aria-label="Heat">
            <div className={`${LABEL} text-slate-400`}>Heat</div>
            <div className={`font-mono font-black text-[22px] leading-none ${gameState.heat >= 70 ? 'text-[#FCA5A5]' : ''}`}>{Math.floor(gameState.heat)}<span className="text-slate-500 text-[14px]">%</span></div>
          </button>
          <SparkCounter value={gameState.sparks} className="text-base" />
          <div data-tour="meters" className="flex items-center gap-4 ml-2">
            <Gauge label="Cover-Up" value={gameState.coverUp} color="#DC2626" warn={65} hint="At 100% the Target walks free" />
            <Gauge label="Freshness" value={gameState.freshness} color="#F59E0B" hint="A stale story weakens every channel" />
          </div>
        </div>

        <div className="flex items-center gap-2 w-[330px] justify-end">
          <span data-tour="climate" className="hidden lg:inline text-[11px] font-sans text-slate-300 mr-1 truncate max-w-[200px]" title={climate.blurb}>{climate.icon} {climate.name}</span>
          <button
            onClick={() => (gameState.isPaused ? resume() : pause())} disabled={!unlocked}
            className="px-3 py-1.5 rounded border-2 border-[#F4F1EA]/60 text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-40"
          >{gameState.isPaused ? '▶ Resume' : '⏸ Pause'}<Key k="Space" /></button>
          <button onClick={() => { setMuted(!muted); if (muted) sfx.play('click'); }} aria-label={muted ? 'Unmute' : 'Mute'} className="w-9 h-9 rounded border-2 border-[#F4F1EA]/40 cursor-pointer">{muted ? '🔇' : '🔊'}</button>
          <button onClick={() => setGuide({ open: true, term: null })} aria-label="Field Guide" className="w-9 h-9 rounded border-2 border-[#F4F1EA]/40 cursor-pointer">📖</button>
          <button onClick={() => setSettingsOpen(true)} aria-label="Settings" className="w-9 h-9 rounded border-2 border-[#F4F1EA]/40 cursor-pointer">⚙</button>
        </div>
      </header>

      {/* ---------------- MAIN ---------------- */}
      <div className="flex-1 min-h-0 grid grid-cols-[minmax(280px,22%)_1fr_minmax(340px,28%)] bg-[#EFEBE0]">
        {/* LEFT: the Target's case file */}
        <aside className="relative border-r-4 border-[#1A1A1A] bg-[#E6D5B8] overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">
          <PaperGrain />
          <div className="relative"><RumorCard gameState={gameState} variant="card" /></div>
          <div className="relative flex gap-3 items-start">
            <div className="flex-shrink-0 w-[92px] bg-[#FDFCF8] p-1.5 pb-5 border border-[#1A1A1A] shadow-[3px_3px_0px_rgba(0,0,0,0.35)] -rotate-2" style={{ boxShadow: `0 0 0 2px ${accent}, 3px 3px 0 rgba(0,0,0,0.35)` }}>
              <div className="bg-[#D9CBB0] h-[104px] flex items-end justify-center overflow-hidden"><Avatar target={target} emotion={targetEmotion(gameState)} className="w-full h-full" /></div>
              <div className="absolute bottom-1 left-0 right-0 text-center font-serif text-[9px] font-black truncate px-1">{target.shortName}</div>
            </div>
            <div className="min-w-0">
              <div className="font-serif font-black text-[17px] leading-tight">{target.fullName}</div>
              <div className="text-[12px] font-sans text-slate-700">{target.title}</div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <span className="text-[10px] font-sans font-black bg-[#1A1A1A] text-[#F4F1EA] px-1.5 py-0.5 rounded-sm">PR {target.prRating}</span>
                <span className="text-[10px] font-sans font-black bg-white border border-[#1A1A1A] px-1.5 py-0.5 rounded-sm">{target.ai.temperament.replace('THE_', '').replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* the Target speaks */}
          <div className="relative min-h-[54px] bg-white border-2 rounded-lg rounded-tl-none px-3 py-2" style={{ borderColor: accent, boxShadow: `2px 2px 0 ${accent}` }}>
            <div className="text-[12px] font-sans italic leading-snug">“{gameState.chatter?.text ?? target.ai.chatter.onStart}”</div>
          </div>

          <p className="relative text-[12px] font-sans italic text-slate-700 leading-snug">{target.personality}</p>

          <div className="relative bg-[#1A1A1A] text-[#F4F1EA] rounded-md px-3 py-2.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#FDE68A]">Passive: {target.passiveName}</div>
            <div className="text-[11px] font-sans text-slate-300 italic mt-0.5 leading-snug">{target.passiveFlavor}</div>
            <ul className="mt-1.5 flex flex-col gap-0.5">
              {describeTarget(target).slice(0, 5).map(l => <li key={l} className="text-[11px] font-sans leading-snug">• {l}</li>)}
            </ul>
          </div>

          <div className="relative">
            <div className={`${LABEL} mb-1.5`}>Their next moves</div>
            <div className="flex flex-col gap-1.5">
              {target.abilities.map((a, i) => {
                const next = gameState.abilityNext[i];
                const soon = next !== undefined && next - gameState.currentDay <= 2;
                return (
                  <div key={i} className={`flex items-center justify-between gap-2 border-2 rounded-md px-2.5 py-1.5 ${soon ? 'border-[#8B0000] bg-[#FEE2E2]' : 'border-[#1A1A1A] bg-[#F4F1EA]'}`}>
                    <span className="text-[11px] font-bold leading-tight">{a.headline}</span>
                    <span className="text-[10px] font-mono font-black whitespace-nowrap text-[#8B0000]">{next === undefined ? '' : next <= gameState.currentDay ? 'any day' : `Day ~${next}`}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {(frozen.length > 0 || activeEffects.length > 0) && (
            <div className="relative flex flex-wrap gap-1.5">
              {frozen.length > 0 && <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-[#1E3A5F] text-white">❄ {frozen.length} frozen</span>}
              {activeEffects.map(e => <span key={e.id} className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm text-white ${e.mult >= 1 ? 'bg-[#065F46]' : 'bg-[#8B0000]'}`}>{e.label} ×{e.mult} • {e.until - gameState.currentDay + 1}d</span>)}
            </div>
          )}

          <div className="relative bg-[#F4F1EA] border-2 border-[#1A1A1A] rounded-md px-3 py-2">
            <div className={`${LABEL} text-[#1A1A1A]/60`}>News climate</div>
            <div className="text-[12px] font-bold">{climate.icon} {climate.name}</div>
            <div className="text-[11px] font-sans text-slate-600 leading-snug">{climate.blurb}</div>
          </div>
        </aside>

        {/* CENTRE: the map, or the Conspiracy Board */}
        <main className="relative min-w-0 flex flex-col">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 h-11 bg-[#D9CBB0] border-b-2 border-[#1A1A1A]">
            <button onClick={showLog} className={`px-3.5 h-8 rounded-t-md border-2 border-b-0 border-[#1A1A1A] text-[11px] font-black uppercase tracking-wider cursor-pointer ${desk !== 'CHANNELS_DESK' ? 'bg-[#EFEBE0]' : 'bg-[#BFB095] text-[#1A1A1A]/60'}`}>Map<Key k="1" /></button>
            <button
              data-tour="dock-channels" onClick={() => goDesk('CHANNELS_DESK')} disabled={!unlocked}
              className={`px-3.5 h-8 rounded-t-md border-2 border-b-0 border-[#1A1A1A] text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-40 ${desk === 'CHANNELS_DESK' ? 'bg-[#EFEBE0]' : 'bg-[#BFB095] text-[#1A1A1A]/60'}`}
            >Conspiracy Board<Key k="2" /></button>
            <div className="flex-1" />
            {desk !== 'NONE' && <span className="text-[11px] font-black uppercase tracking-wider text-[#8B0000]">⏸ At the desk — the news cycle waits</span>}
          </div>

          <div className="relative flex-1 min-h-0 flex flex-col">
            <div className="relative flex-1 min-h-0" id="map-container" data-tour="map" style={{ backgroundColor: mood.mapBg }}>
              <NigeriaMapCanvas gameState={gameState} ticking={ticking} onStateTap={onStateTap} onSparkTap={collectSpark} onSpinTap={popSpin} />
              {!gameState.hasPlantedSeed && (
                <div className="absolute inset-x-0 top-4 flex justify-center pointer-events-none z-20">
                  <div className="bg-[#1A1A1A] text-[#F4F1EA] px-5 py-2.5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_rgba(0,0,0,0.3)] rotate-[-1deg] animate-pulse">
                    <p className="font-serif font-black text-sm uppercase tracking-widest text-center">Click a state to plant the rumour</p>
                  </div>
                </div>
              )}
              {gameState.hasPlantedSeed && !gameState.hasPoppedFirstSpark && (
                <div className="absolute inset-x-0 top-4 flex justify-center pointer-events-none z-20">
                  <div className="bg-[#FDE68A] text-[#B45309] px-5 py-2.5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_rgba(0,0,0,0.3)] rotate-[1deg] animate-pulse">
                    <p className="font-serif font-black text-sm uppercase tracking-widest text-center">Click the ⚡ to start the clock</p>
                  </div>
                </div>
              )}
              {desk === 'CHANNELS_DESK' && (
                <div className="absolute inset-0 z-30"><ConspiracyBoard docked gameState={gameState} onClose={showLog} onBuy={buyChannel} /></div>
              )}
            </div>
            <div className="flex-shrink-0"><InspectionCard gameState={gameState} desktop /></div>
          </div>
        </main>

        {/* RIGHT: desks and the log */}
        <aside className="relative border-l-4 border-[#1A1A1A] bg-[#EADCC8] flex flex-col min-h-0">
          <div data-tour="dock" className="flex-shrink-0 flex gap-1 px-3 pt-3 bg-[#D9CBB0] border-b-2 border-[#1A1A1A]">
            {([['LOG', 'Log', 'L'], ['EVIDENCE', 'Evidence', 'E'], ['DEFENSE', 'Defence', 'D']] as const).map(([id, label, k]) => (
              <button
                key={id}
                disabled={id !== 'LOG' && !unlocked}
                onClick={() => (id === 'LOG' ? showLog() : goDesk(id === 'EVIDENCE' ? 'EVIDENCE_DESK' : 'COUNTER_OPS_DESK'))}
                className={`flex-1 h-9 rounded-t-md border-2 border-b-0 border-[#1A1A1A] text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-40 ${rightTab === id ? 'bg-[#EADCC8]' : 'bg-[#BFB095] text-[#1A1A1A]/60'}`}
              >{label}<Key k={k} /></button>
            ))}
          </div>
          <div className="relative flex-1 min-h-0 overflow-hidden">
            {rightTab === 'EVIDENCE' && desk === 'EVIDENCE_DESK' && <EvidenceDesk docked gameState={gameState} onClose={showLog} onLeak={leakEvidence} />}
            {rightTab === 'DEFENSE' && desk === 'COUNTER_OPS_DESK' && <DefenseDesk docked gameState={gameState} onClose={showLog} onBuy={buyDefense} />}
            {(rightTab === 'LOG' || (rightTab === 'EVIDENCE' && desk !== 'EVIDENCE_DESK') || (rightTab === 'DEFENSE' && desk !== 'COUNTER_OPS_DESK')) && (
              <div className="h-full overflow-y-auto no-scrollbar p-3 flex flex-col gap-2">
                <PaperGrain />
                <div className="relative text-[10px] font-black uppercase tracking-[0.2em] text-[#8B0000]">Case log • newest first</div>
                {log.length === 0 && <div className="relative text-[12px] font-sans text-slate-600 py-6 text-center">No developments yet. Keep pushing.</div>}
                {log.map((e, i) => (
                  <div key={`${e.day}_${i}`} className="relative bg-[#F4F1EA] border-2 border-[#1A1A1A] rounded-lg px-3 py-2 shadow-[2px_2px_0px_#1A1A1A]">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-serif font-black text-[13px] leading-tight">{e.headline}</span>
                      <span className="text-[10px] font-black tracking-widest uppercase text-[#8B0000] whitespace-nowrap">Day {e.day}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 mt-0.5 uppercase tracking-wider">{e.impact}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ---------------- BOTTOM: news ticker ---------------- */}
      <footer className="flex-shrink-0 h-9 flex items-center gap-4 px-4 bg-[#8B0000] text-white overflow-hidden">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-white text-[#8B0000] px-2 py-0.5 rounded-sm flex-shrink-0">Breaking</span>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className={`inline-block text-[12px] font-sans font-bold ${settings.reduceMotion ? '' : 'ticker-scroll'}`}>{ticker}</div>
        </div>
        <span className="hidden xl:flex flex-shrink-0 text-[10px] font-sans opacity-80 items-center gap-2">
          <span><Key k="Esc" /> menu</span><span><Key k="Space" /> pause</span>
        </span>
      </footer>

      <LiveOverlays engine={engine} shared={shared} rootRef={rootRef} desks={false} />
    </div>
  );
};
