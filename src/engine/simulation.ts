import { GameState, StateNode } from './types';
import { CHANNELS_DATA } from './data/channels';
import { EVIDENCE_DATA } from './data/evidence';
import { AlertFactory } from './alerts';

export const SimulationEngine = {
  processTick: (prevState: GameState): GameState => {
    if (prevState.status !== 'PLAYING' || prevState.isPaused) return prevState;

    const newState = { 
      ...prevState, 
      currentDay: prevState.currentDay + 1,
      activeSparks: [...(prevState.activeSparks || [])],
      activeSpinBubbles: [...(prevState.activeSpinBubbles || [])]
    };
    const updatedStates: Record<string, StateNode> = {};
    
    // Calculate global modifiers based on unlocked channels
    let globalSpreadMultiplier = 1.0;
    newState.unlockedChannels.forEach(channelId => {
      const channel = CHANNELS_DATA.find(c => c.id === channelId);
      if (channel) globalSpreadMultiplier += (channel.baseMultiplier - 1.0);
    });

    // Inside processTick, before the state loop, define our global RNG pool
    const activeInfectedStates = Object.values(prevState.states).filter(s => s.heard > 0);
    const activeSparkCount = (prevState.activeSparks || []).length;
    const MAX_SPARKS_ON_BOARD = 5;

    // 1. Process Population Math (Unaware -> Heard -> Believers)
    Object.values(prevState.states).forEach(state => {
      let { unaware, heard, believers, doubt, population, id, name, region, traits, gistReport, hasSpawnedFirstWhisper } = state;

      const spreadRate = 0.15 * globalSpreadMultiplier; 
      const newHeard = Math.floor(heard * spreadRate);
      
      const doubtBlocker = Math.max(0, (100 - doubt) / 100);
      const conversionRate = 0.08 * globalSpreadMultiplier * doubtBlocker;
      const newBelievers = Math.floor(heard * conversionRate);

      unaware = Math.max(0, unaware - newHeard);
      heard = Math.max(0, heard + newHeard - newBelievers);
      believers = Math.min(population, believers + newBelievers);
      
      if (heard > 0 || believers > 0) {
        doubt = Math.min(100, doubt + 1.5); 
      }

      // SYSTEM 1: DETERMINISTIC "FIRST WHISPER"
      // The exact moment a state gets its first rumor, it drops a guaranteed spark.
      if (heard > 0 && !hasSpawnedFirstWhisper) {
        newState.activeSparks.push({
          id: `spark_first_${id}_${newState.currentDay}`,
          stateId: id,
          amount: 8, 
          offsetX: Math.floor(Math.random() * 20) - 10,
          offsetY: Math.floor(Math.random() * 20) - 10,
          ticksRemaining: 3 // Lasts 3 ticks (18 seconds)
        });
        hasSpawnedFirstWhisper = true;
      }

      updatedStates[id] = { 
        ...state, 
        unaware, 
        heard, 
        believers, 
        doubt, 
        hasSpawnedFirstWhisper 
      };
    });

    // SYSTEM 2: STOCHASTIC (RNG) SPAWNS
    // Every tick, there is a chance to spawn a bonus spark based on global momentum.
    if (activeSparkCount < MAX_SPARKS_ON_BOARD && activeInfectedStates.length > 0) {
      // 30% base chance + 5% per unlocked channel. Caps at 60%.
      const spawnChance = Math.min(0.60, 0.30 + (prevState.unlockedChannels.length * 0.05));
      
      if (Math.random() < spawnChance) {
        // Pick a random infected state to host the spark
        const randomState = activeInfectedStates[Math.floor(Math.random() * activeInfectedStates.length)];
        const isFatSpark = Math.random() > 0.7; // 30% chance for a high-value, slow spark

        newState.activeSparks.push({
          id: `spark_rng_${randomState.id}_${newState.currentDay}_${Math.floor(Math.random() * 1000)}`,
          stateId: randomState.id,
          amount: isFatSpark ? Math.floor(6 + Math.random() * 6) : Math.floor(2 + Math.random() * 3), 
          offsetX: Math.floor(Math.random() * 30) - 15,
          offsetY: Math.floor(Math.random() * 30) - 15,
          ticksRemaining: isFatSpark ? 4 : 2 // Fast sparks vanish quickly!
        });
      }
    }

    newState.states = updatedStates;

    // Age and filter active sparks: ticksRemaining is decremented and expired sparks removed
    newState.activeSparks = (newState.activeSparks || [])
      .map(spark => ({ ...spark, ticksRemaining: spark.ticksRemaining - 1 }))
      .filter(spark => spark.ticksRemaining > 0);

    // 2. Progression & Win/Loss Checks
    // Advance investigation progress based on days passed and spread
    if (newState.investigationProgress < 100) {
      newState.investigationProgress = Math.min(100, newState.investigationProgress + 3.5);
    }

    if (newState.heat >= 100) {
      newState.status = 'DEFEAT_HEAT';
      newState.isPaused = true;
      newState.activeModal = 'VERDICT';
    } else if (newState.currentDay >= newState.dayBudget) {
      newState.status = 'DEFEAT_TIME';
      newState.isPaused = true;
      newState.activeModal = 'VERDICT';
    }

    // 3. Process Target Scramble Countdown
    if (newState.scramble.active && newState.scramble.hoursRemaining > 0) {
      newState.scramble.hoursRemaining -= 24; // 1 tick = 24 hours
      if (newState.scramble.hoursRemaining <= 0) {
        // Scramble hits 0! Trigger breaking news.
        newState.scramble.active = false;
        newState.isPaused = true;
        newState.activeModal = 'BREAKING_NEWS';
      }
    }

    // 4. Evaluate Tick Alerts & Milestone Triggers
    const { alerts, newMilestones } = AlertFactory.evaluateTickTriggers(prevState, newState);
    if (alerts.length > 0) {
      newState.notificationQueue = [...(newState.notificationQueue || []), ...alerts];
      newState.triggeredMilestones = [...(newState.triggeredMilestones || []), ...newMilestones];
      newState.isPaused = true;

      // Apply mechanical side-effects if TARGET_PR milestones fired
      if (newMilestones.includes('TARGET_PR_20')) {
        Object.keys(newState.states).forEach(k => {
          newState.states[k] = {
            ...newState.states[k],
            doubt: Math.min(100, newState.states[k].doubt + 10)
          };
        });
      }
      if (newMilestones.includes('TARGET_PR_45')) {
        Object.keys(newState.states).forEach(k => {
          newState.states[k] = {
            ...newState.states[k],
            doubt: Math.min(100, newState.states[k].doubt + 15)
          };
        });
      }
      if (newMilestones.includes('TARGET_PR_70')) {
        newState.heat = Math.min(100, newState.heat + 15);
      }
    }

    return newState;
  }
};
