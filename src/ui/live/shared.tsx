import React, { useEffect, useState } from 'react';
import { GameEngine } from '../../hooks/useGameEngine';
import { getTarget } from '../../engine/data/targets';
import { ConspiracyBoard } from '../components/ConspiracyBoard';
import { EvidenceDesk } from '../components/EvidenceDesk';
import { DefenseDesk } from '../components/DefenseDesk';
import { AlertCardModal } from '../components/AlertCardModal';
import { BelieversSheet, HeatSheet, HistoryLogSheet, PauseMenu, TargetInfoSheet } from '../components/Sheets';
import { SettingsSheet } from '../components/SettingsSheet';
import { HintToast, Tutorial } from '../components/Tutorial';
import { FieldGuide } from '../components/FieldGuide';
import { accentOf } from '../theme';
import { sfx } from '../audio';
import { updateSettings } from '../settings';
import { HowToPlay, howToSeen } from '../components/HowToPlay';
import { vocabFor } from '../../engine/campaigns';

// What the phone and desktop live screens share: tutorial state, the Field Guide, settings, the pause menu, alerts and
// sounds. Only the layout of the HUD, map and desks differs between the two designs.
const TOUR_KEY = 'rumor_tour_done';
const readTourDone = () => { try { return localStorage.getItem(TOUR_KEY) === '1'; } catch { return false; } };

export const useLiveShared = (engine: GameEngine) => {
  const { gameState, setModal, pause, resume, setHold } = engine;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tourDone, setTourDoneState] = useState(readTourDone);
  const [guide, setGuide] = useState<{ open: boolean; term: string | null }>({ open: false, term: null });
  const [tourHold, setTourHold] = useState(false);
  // The How to play cards open by themselves the first time a case starts (the clock is still frozen then), and any time from the menus.
  const [howTo, setHowTo] = useState<null | 'first' | 'menu'>(() => (!howToSeen() && gameState.status === 'PLAYING' ? 'first' : null));
  const setTourDone = (v: boolean) => { setTourDoneState(v); try { if (v) localStorage.setItem(TOUR_KEY, '1'); else localStorage.removeItem(TOUR_KEY); } catch { /* storage unavailable */ } };
  const tourActive = gameState.training && !tourDone && gameState.status === 'PLAYING';

  // The tutorial and the Field Guide both hold the clock while they are being read.
  useEffect(() => { setHold(tourHold || guide.open || howTo !== null); }, [tourHold, guide.open, howTo, setHold]);

  // Sounds for the big beats: a soft tick each day, a fanfare or a sad trombone at the end.
  useEffect(() => {
    if (gameState.hasPoppedFirstSpark && gameState.currentDay > 1 && gameState.status === 'PLAYING') sfx.play('tick');
  }, [gameState.currentDay, gameState.hasPoppedFirstSpark, gameState.status]);
  useEffect(() => {
    if (gameState.status === 'WON') sfx.play('win');
    else if (gameState.status === 'LOST_HEAT' || gameState.status === 'LOST_TIME' || gameState.status === 'LOST_COVERUP') sfx.play('lose');
  }, [gameState.status]);

  // Escape closes the top layer first (guide, settings, a desk or sheet), otherwise pauses or resumes the case.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (howTo) { setHowTo(null); return; }
      if (guide.open) { setGuide({ open: false, term: null }); return; }
      if (settingsOpen) { setSettingsOpen(false); return; }
      if (gameState.notificationQueue.length > 0 || !gameState.hasPoppedFirstSpark || gameState.status !== 'PLAYING') return;
      if (gameState.activeModal === 'PAUSE_MENU') resume();
      else if (gameState.activeModal !== 'NONE') setModal(gameState.isPaused ? 'PAUSE_MENU' : 'NONE');
      else pause();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const closeSheet = () => setModal(gameState.isPaused ? 'PAUSE_MENU' : 'NONE');
  const openModal = (m: Parameters<typeof setModal>[0]) => { sfx.play('click'); setModal(m); };

  return { howTo, setHowTo, settingsOpen, setSettingsOpen, tourDone, setTourDone, guide, setGuide, tourHold, setTourHold, tourActive, closeSheet, openModal };
};
export type LiveShared = ReturnType<typeof useLiveShared>;

export const LiveOverlays: React.FC<{ engine: GameEngine; shared: LiveShared; rootRef: React.RefObject<HTMLDivElement | null>; desks: boolean }> = ({ engine, shared, rootRef, desks }) => {
  const { gameState, setModal, resume, buyChannel, leakEvidence, buyDefense, dismissTopAlert, chooseOption, resetAll, returnToDossier, startTraining, profile, importProgress, resetProgress } = engine;
  const { howTo, setHowTo, settingsOpen, setSettingsOpen, setTourDone, guide, setGuide, setTourHold, tourActive, closeSheet } = shared;
  const target = getTarget(gameState.activeTargetId);

  return (
    <>
      {desks && gameState.activeModal === 'CHANNELS_DESK' && <ConspiracyBoard gameState={gameState} onClose={() => setModal('NONE')} onBuy={buyChannel} />}
      {desks && gameState.activeModal === 'EVIDENCE_DESK' && <EvidenceDesk gameState={gameState} onClose={() => setModal('NONE')} onLeak={leakEvidence} />}
      {desks && gameState.activeModal === 'COUNTER_OPS_DESK' && <DefenseDesk gameState={gameState} onClose={() => setModal('NONE')} onBuy={buyDefense} />}
      {gameState.activeModal === 'HISTORY_LOG' && <HistoryLogSheet gameState={gameState} onClose={closeSheet} />}
      {gameState.activeModal === 'BELIEVERS_INFO' && <BelieversSheet gameState={gameState} onClose={closeSheet} />}
      {gameState.activeModal === 'HEAT_INFO' && <HeatSheet gameState={gameState} onClose={closeSheet} />}
      {gameState.activeModal === 'TARGET_INFO' && <TargetInfoSheet gameState={gameState} onClose={closeSheet} />}
      {gameState.activeModal === 'PAUSE_MENU' && (
        <PauseMenu
          copySeed={gameState.copySeed} onResume={resume} onHistory={() => setModal('HISTORY_LOG')}
          onSettings={() => setSettingsOpen(true)} onGuide={() => setGuide({ open: true, term: null })} onCards={() => setHowTo('menu')}
          onHowTo={() => { setTourDone(false); startTraining(); }}
          onReset={resetAll}
        />
      )}

      {settingsOpen && (
        <SettingsSheet profile={profile} inMatch onClose={() => setSettingsOpen(false)} onReplayTutorial={() => { setSettingsOpen(false); setTourDone(false); startTraining(); }} onImportProgress={importProgress} onEraseProgress={resetProgress} />
      )}

      {tourActive && !howTo && (
        <Tutorial
          gameState={gameState} rootRef={rootRef} onHold={setTourHold}
          onLearn={term => setGuide({ open: true, term })}
          onTakeOver={() => { updateSettings({ tutorialDone: true }); setTourDone(true); setTourHold(false); }}
          onFinish={() => { updateSettings({ tutorialDone: true }); setTourDone(true); }}
          onSkip={() => { updateSettings({ tutorialDone: true }); setTourDone(true); setTourHold(false); if (gameState.training) returnToDossier(); }}
        />
      )}
      <HintToast gameState={gameState} suppressed={tourActive} />
      {guide.open && <FieldGuide focus={guide.term} onClose={() => setGuide({ open: false, term: null })} />}
      {howTo && <HowToPlay vocab={vocabFor(gameState.activeTargetId)} first={howTo === 'first'} onClose={() => setHowTo(null)} />}

      {/* ALERT QUEUE: always on top, pauses the clock while non-empty */}
      {gameState.notificationQueue.length > 0 && (
        <AlertCardModal alert={gameState.notificationQueue[0]} remaining={gameState.notificationQueue.length - 1} sparks={gameState.sparks} accent={accentOf(target)} copySeed={gameState.copySeed} onDismiss={dismissTopAlert} onChoose={chooseOption} />
      )}
    </>
  );
};
