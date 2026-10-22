import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { isGameOver } from './engine/types';
import { DossierScreen } from './ui/screens/DossierScreen';
import { LiveGameScreen } from './ui/screens/LiveGameScreen';
import { EndgameScreen } from './ui/screens/EndgameScreen';

export default function App() {
  const engine = useGameEngine();
  const { gameState, startMatch, resetAll, returnToDossier } = engine;

  return (
    <div className="w-full max-w-[440px] h-screen h-[100dvh] mx-auto relative overflow-hidden select-none shadow-2xl bg-[#0B0E14] text-slate-100 flex flex-col font-sans">
      {gameState.status === 'LOBBY' ? (
        <DossierScreen onStart={startMatch} onReset={resetAll} />
      ) : (
        <>
          <LiveGameScreen engine={engine} />
          {isGameOver(gameState.status) && <EndgameScreen gameState={gameState} onNewInvestigation={returnToDossier} />}
        </>
      )}
    </div>
  );
}
