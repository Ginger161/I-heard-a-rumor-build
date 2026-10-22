import { useState, useEffect, useCallback } from 'react';
import { GameState, ModalState, StateNode } from '../engine/types';
import { SaveManager } from '../engine/saveManager';
import { SimulationEngine } from '../engine/simulation';
import { EVIDENCE_DATA } from '../engine/data/evidence';
import { CHANNELS_DATA } from '../engine/data/channels';
import { INITIAL_STATES } from '../engine/data/defaultStates';
import { AlertFactory } from '../engine/alerts';

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const loaded = SaveManager.load();
    if (!loaded.states || Object.keys(loaded.states).length === 0) {
      return { ...loaded, states: INITIAL_STATES };
    }
    return loaded;
  });

  // Main Game Loop
  useEffect(() => {
    // HARD LOCK: Do not tick unless the first spark has been popped!
    if (gameState.status !== 'PLAYING' || gameState.isPaused || !gameState.hasPoppedFirstSpark) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.status !== 'PLAYING') return prev; 
        const nextState = SimulationEngine.processTick(prev);
        SaveManager.save(nextState);
        return nextState;
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [gameState.status, gameState.isPaused, gameState.hasPoppedFirstSpark]);

  const setModal = useCallback((modal: ModalState) => {
    setGameState(prev => {
      const next = { ...prev, activeModal: modal, isPaused: modal !== 'NONE' };
      SaveManager.save(next);
      return next;
    });
  }, []);

  const resumePlay = useCallback(() => {
    setGameState(prev => {
      const next = { ...prev, isPaused: false, activeModal: 'NONE' as ModalState };
      SaveManager.save(next);
      return next;
    });
  }, []);

  // NEW: The action to start the game on the map
  const plantSeed = useCallback((stateId: string) => {
    setGameState(prev => {
      if (prev.hasPlantedSeed) return prev;

      const updatedStates = { ...prev.states };
      const currentState = updatedStates[stateId] || {
        id: stateId,
        name: stateId.toUpperCase(),
        region: 'SW',
        population: 4000000,
        traits: ['Local Community'],
        demographicTag: 'GRASSROOTS' as const,
        neighbors: [],
        hasAirport: false,
        unaware: 3999999,
        heard: 0,
        believers: 0,
        jaded: 0,
        highDoubtTicks: 0,
        doubt: 40,
        gistReport: `Whispers have begun in ${stateId}.`,
        hasSpawnedFirstWhisper: false
      };
      updatedStates[stateId] = { ...currentState, heard: 1 };

      const next: GameState = { 
        ...prev, 
        hasPlantedSeed: true, 
        startingStateId: stateId,
        states: updatedStates,
        activeSparks: [{
          id: `spark_first_${stateId}`,
          stateId: stateId,
          amount: 15, // Big initial clout drop
          offsetX: 0, 
          offsetY: -20,
          ticksRemaining: 9999 // Doesn't despawn until clicked
        }]
      };
      SaveManager.save(next);
      return next;
    });
  }, []);

  const buyChannel = useCallback((channelId: string) => {
    setGameState(prev => {
      const channel = CHANNELS_DATA.find(c => c.id === channelId);
      if (!channel || prev.sparks < channel.cost || prev.unlockedChannels.includes(channelId)) return prev;
      const meetsPrereqs = !channel.requires || channel.requires.length === 0 || channel.requires.every(req => prev.unlockedChannels.includes(req));
      if (!meetsPrereqs) return prev;

      const alert = AlertFactory.createChannelAlert(channelId);
      const newQueue = alert ? [...(prev.notificationQueue || []), alert] : (prev.notificationQueue || []);

      const next = { 
        ...prev, 
        sparks: prev.sparks - channel.cost, 
        unlockedChannels: [...prev.unlockedChannels, channelId],
        notificationQueue: newQueue,
        isPaused: true
      };
      SaveManager.save(next); 
      return next;
    });
  }, []);

  const dropEvidence = useCallback((evidenceId: string) => {
    setGameState(prev => {
      const evidence = EVIDENCE_DATA.find(e => e.id === evidenceId);
      if (!evidence) return prev;
      const cost = evidence.cost ?? 0;
      if (prev.sparks < cost || prev.droppedEvidence.includes(evidenceId)) return prev;

      const stateList = Object.values(prev.states);
      const avgDoubt = stateList.reduce((sum, s) => sum + s.doubt, 0) / (stateList.length || 1);
      const backfired = Boolean(evidence.isFabricated && avgDoubt > 55 && Math.random() < 0.4);

      const updatedStates = { ...prev.states };
      let newHeat = prev.heat;

      if (backfired) {
        Object.keys(updatedStates).forEach(key => {
          updatedStates[key] = {
            ...updatedStates[key],
            doubt: Math.min(100, updatedStates[key].doubt + 20)
          };
        });
        newHeat = Math.min(100, prev.heat + 25);
      } else {
        const doubtReduction = evidence.doubtReduction ?? 0;
        const heatIncrease = evidence.heatIncrease ?? 0;
        Object.keys(updatedStates).forEach(key => {
          updatedStates[key] = {
            ...updatedStates[key],
            doubt: Math.max(0, updatedStates[key].doubt - doubtReduction)
          };
        });
        newHeat = Math.min(100, prev.heat + heatIncrease);
      }

      const alert = AlertFactory.createEvidenceAlert(evidenceId, backfired);
      const newQueue = alert ? [...(prev.notificationQueue || []), alert] : (prev.notificationQueue || []);

      const next: GameState = { 
        ...prev, 
        sparks: prev.sparks - cost, 
        heat: newHeat, 
        droppedEvidence: [...prev.droppedEvidence, evidenceId], 
        states: updatedStates,
        notificationQueue: newQueue,
        isPaused: true
      };
      SaveManager.save(next); 
      return next;
    });
  }, []);

  const buyDefense = useCallback((defenseName: string, cost: number = 20, heatReduced: number = 25) => {
    setGameState(prev => {
      if (prev.sparks < cost) return prev;
      const alert = AlertFactory.createDefenseAlert(defenseName, heatReduced);
      const next: GameState = {
        ...prev,
        sparks: prev.sparks - cost,
        heat: Math.max(0, prev.heat - heatReduced),
        activeCounterOps: [...prev.activeCounterOps, defenseName],
        notificationQueue: [...(prev.notificationQueue || []), alert],
        isPaused: true
      };
      SaveManager.save(next);
      return next;
    });
  }, []);

  const collectSpark = useCallback((sparkId: string, amount: number) => {
    setGameState(prev => {
      const isFirstSpark = !prev.hasPoppedFirstSpark;
      let newQueue = [...(prev.notificationQueue || [])];

      if (isFirstSpark) {
        const stateName = prev.startingStateId 
          ? (prev.states[prev.startingStateId]?.name || prev.startingStateId)
          : 'Nigeria';
        const seedAlert = AlertFactory.createSeedAlert(stateName);
        newQueue.push(seedAlert);
      }

      const next: GameState = { 
        ...prev, 
        sparks: prev.sparks + amount,
        activeSparks: (prev.activeSparks || []).filter(s => s.id !== sparkId),
        hasPoppedFirstSpark: true,
        notificationQueue: newQueue,
        isPaused: isFirstSpark ? true : prev.isPaused
      };
      SaveManager.save(next);
      return next;
    });
  }, []);

  const dismissTopAlert = useCallback(() => {
    setGameState(prev => {
      const remaining = (prev.notificationQueue || []).slice(1);
      const next: GameState = {
        ...prev,
        notificationQueue: remaining,
        isPaused: remaining.length > 0 ? true : (prev.activeModal !== 'NONE')
      };
      SaveManager.save(next);
      return next;
    });
  }, []);

  const startMatch = useCallback(() => {
    setGameState(prev => {
      const freshStates: Record<string, StateNode> = {};
      Object.entries(INITIAL_STATES).forEach(([k, s]) => {
        freshStates[k] = { ...s, heard: 0, believers: 0, jaded: 0, highDoubtTicks: 0, unaware: s.population };
      });

      const next: GameState = {
        ...prev,
        status: 'PLAYING',
        isPaused: false,
        hasPlantedSeed: false,
        hasPoppedFirstSpark: false,
        startingStateId: null,
        activeModal: 'NONE',
        currentDay: 1,
        dayBudget: 20,
        sparks: 0,
        heat: 0,
        investigationProgress: 0,
        endgameShotFired: false,
        scramble: { active: false, hoursRemaining: 0, subtleClue: '', queuedMoveId: null, damageReductionMuliplier: 1 },
        states: freshStates,
        unlockedChannels: [],
        droppedEvidence: [],
        activeCounterOps: [],
        activeSparks: [],
        activeSpinBubbles: [],
        notificationQueue: [],
        triggeredMilestones: []
      };
      SaveManager.save(next);
      return next;
    });
  }, []);

  const returnToLobby = useCallback(() => {
    setGameState(prev => {
      const next = SaveManager.clearActiveMatch(prev);
      return next;
    });
  }, []);

  return { 
    gameState, 
    setGameState,
    setModal, 
    resumePlay, 
    plantSeed, 
    buyChannel, 
    dropEvidence, 
    buyDefense,
    collectSpark,
    dismissTopAlert,
    startMatch,
    returnToLobby
  };
};
