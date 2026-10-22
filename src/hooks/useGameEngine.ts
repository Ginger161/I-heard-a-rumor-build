import { useState, useEffect, useCallback } from 'react';
import { GameState, ModalState } from '../engine/types';
import { SaveManager } from '../engine/saveManager';
import { SimulationEngine, canTick } from '../engine/simulation';
import { Actions } from '../engine/actions';
import { createLobbyState } from '../engine/newGame';
import { ScandalCategory } from '../engine/data/channels';
import { TargetId } from '../engine/data/targets';

export const TICK_MS = 6000; // 1 Day = 6000ms

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(() => SaveManager.load());

  // Persist every state change (transient map events are stripped by SaveManager).
  useEffect(() => {
    SaveManager.save(gameState);
  }, [gameState]);

  // The daily clock. canTick() is the Phase 1 hard lock: no tick while the first spark is unpopped,
  // the game is paused, an alert is waiting, or a desk/modal is open.
  const ticking = canTick(gameState);
  useEffect(() => {
    if (!ticking) return;
    const timer = setInterval(() => {
      setGameState(prev => SimulationEngine.processTick(prev));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [ticking]);

  const apply = useCallback((fn: (s: GameState) => GameState) => setGameState(prev => fn(prev)), []);

  const startMatch = useCallback((targetId: TargetId, category: ScandalCategory) => {
    setGameState(Actions.startMatch(targetId, category));
  }, []);

  // Back to the Classified Case File screen, keeping the save slot clean.
  const returnToDossier = useCallback(() => setGameState(createLobbyState()), []);

  // "New Investigation / Reset": wipe the save entirely.
  const resetAll = useCallback(() => setGameState(SaveManager.hardReset()), []);

  return {
    gameState,
    startMatch,
    returnToDossier,
    resetAll,
    plantSeed: useCallback((id: string) => apply(s => Actions.plantSeed(s, id)), [apply]),
    collectSpark: useCallback((id: string) => apply(s => Actions.collectSpark(s, id)), [apply]),
    popSpin: useCallback((id: string) => apply(s => Actions.popSpin(s, id)), [apply]),
    selectState: useCallback((id: string | null) => apply(s => Actions.selectState(s, id)), [apply]),
    setModal: useCallback((m: ModalState) => apply(s => Actions.setModal(s, m)), [apply]),
    pause: useCallback(() => apply(Actions.pause), [apply]),
    resume: useCallback(() => apply(Actions.resume), [apply]),
    dismissTopAlert: useCallback(() => apply(Actions.dismissTopAlert), [apply]),
    buyChannel: useCallback((id: string) => apply(s => Actions.buyChannel(s, id)), [apply]),
    leakEvidence: useCallback((id: string) => apply(s => Actions.leakEvidence(s, id)), [apply]),
    buyDefense: useCallback((id: string) => apply(s => Actions.buyDefense(s, id)), [apply])
  };
};

export type GameEngine = ReturnType<typeof useGameEngine>;
