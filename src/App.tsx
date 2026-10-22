import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { LiveGameScreen } from './ui/screens/LiveGameScreen';
import { VerdictModal } from './ui/components/VerdictModal';

export default function App() {
  const { 
    gameState, 
    setModal, 
    resumePlay, 
    startMatch, 
    returnToLobby, 
    collectSpark, 
    plantSeed, 
    buyChannel, 
    dropEvidence, 
    buyDefense, 
    dismissTopAlert 
  } = useGameEngine();

  const isGameOver = gameState.status === 'DEFEAT_TIME' || gameState.status === 'DEFEAT_HEAT' || gameState.status === 'VICTORY';

  return (
    <div className="w-full max-w-[440px] h-[100dvh] mx-auto bg-[#0B0E14] text-slate-100 flex flex-col overflow-hidden relative select-none font-sans">
      
      {gameState.status === 'LOBBY' ? (
        <div className="flex-1 flex items-center justify-center bg-[#F4F1EA] text-[#1A1A1A] p-6 text-center">
          <div>
            <h1 className="text-3xl font-black font-serif uppercase border-b-4 border-[#1A1A1A] pb-2 mb-4">I Heard A Rumor</h1>
            <p className="text-sm font-sans mb-8">Investigative Tabloid Edition</p>
            <button 
              onClick={() => startMatch()}
              className="bg-[#1A1A1A] text-[#F4F1EA] px-6 py-3 font-bold uppercase tracking-widest border-2 border-[#1A1A1A] cursor-pointer active:bg-[#2B2B2B]"
            >
              Start Game
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full relative flex flex-col">
          <LiveGameScreen 
            gameState={gameState} 
            resumePlay={resumePlay} 
            setModal={setModal}
            plantSeed={plantSeed}
            buyChannel={buyChannel}
            dropEvidence={dropEvidence}
            buyDefense={buyDefense}
            dismissTopAlert={dismissTopAlert}
            onSparkTap={(sparkId, amount) => collectSpark(sparkId, amount)}
            onStateTap={(stateId) => {
              if (!gameState.hasPlantedSeed) {
                plantSeed(stateId);
              }
            }}
          />

          {/* VERDICT MODAL: Displays when game reaches victory or defeat */}
          {(isGameOver || gameState.activeModal === 'VERDICT') && (
            <VerdictModal 
              gameState={gameState} 
              onRestart={() => startMatch()} 
              onLobby={() => returnToLobby()} 
            />
          )}
        </div>
      )}

      {/* Modals will be rendered here dynamically based on gameState.activeModal */}
    </div>
  );
}
