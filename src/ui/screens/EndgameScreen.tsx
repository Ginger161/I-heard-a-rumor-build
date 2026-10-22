import React from 'react';
import { GameState } from '../../engine/types';
import { getTarget, SCANDALS } from '../../engine/data/targets';
import { countEvidence, nationalBelieverPct } from '../../engine/selectors';
import { BrutalButton, PaperGrain } from '../components/common';

interface EndgameProps {
  gameState: GameState;
  onNewInvestigation: () => void;
}

const Row: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = '' }) => (
  <div className={`flex justify-between items-center gap-3 px-3 py-2 border-2 border-[#1A1A1A] rounded-lg ${className}`}>
    <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{label}</span>
    <span className="text-xs font-black text-right">{value}</span>
  </div>
);

export const EndgameScreen: React.FC<EndgameProps> = ({ gameState, onNewInvestigation }) => {
  const target = getTarget(gameState.activeTargetId);
  const believers = nationalBelieverPct(gameState.states);
  const ev = countEvidence(gameState);
  const days = Math.min(gameState.currentDay, gameState.dayBudget);
  const defenses = Object.values(gameState.defensePurchases).reduce((a, b) => a + b, 0);

  const rows = [
    ['Target', target.fullName],
    ['Scandal', SCANDALS[gameState.scandalCategory].label],
    ['Days Taken', `${days}/${gameState.dayBudget}`],
    ['Final Believers', `${believers.toFixed(1)}%`],
    ['Peak Heat', `${Math.floor(gameState.peakHeat)}%`],
    ['Channels Syndicated', `${gameState.unlockedChannels.length}`],
    ['Evidence Leaked', `${ev.total}${ev.forged > 0 ? ` (${ev.forged} forged)` : ''}`]
  ];

  // ---- VICTORY: tabloid front page ----
  if (gameState.status === 'WON') {
    return (
      <div className="absolute inset-0 z-[120] bg-[#F4F1EA] text-[#1A1A1A] flex flex-col overflow-y-auto no-scrollbar animate-fade-in">
        <PaperGrain />
        <div className="relative p-5 flex flex-col gap-4">
          <div className="border-b-4 border-double border-[#1A1A1A] pb-2 text-center">
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/60">
              <span>Special Edition</span>
              <span>₦300</span>
            </div>
            <div className="font-serif font-black text-4xl uppercase tracking-tight leading-none">The Daily Gist</div>
          </div>
          <div className="relative">
            <div className="absolute -top-2 right-0 rotate-[8deg] border-4 border-[#065F46] text-[#065F46] font-black text-sm tracking-[0.25em] px-3 py-1 bg-[#F4F1EA]/80 animate-stamp-in">PUBLISHED</div>
            <h1 className="font-serif font-black text-[34px] uppercase leading-[0.95] tracking-tight pt-6">Target Disgraced! EFCC Arrest &amp; Resignation!</h1>
          </div>
          <p className="font-serif text-sm leading-relaxed border-t-2 border-b-2 border-[#1A1A1A] py-3 first-letter:text-4xl first-letter:font-black first-letter:float-left first-letter:mr-1.5 first-letter:leading-none">
            After {days} days of whispers, receipts and relentless gist, {target.fullName} has been detained by anti-graft operatives and has tendered a resignation letter. Crowds outside {target.shortName}&apos;s residence are singing. Motor parks, WhatsApp groups and pulpits agree on one thing: the story was true.
          </p>
          <div className="flex flex-col gap-2">
            {rows.map(([l, v]) => <Row key={l} label={l} value={v} className="bg-[#EBE5D9] shadow-[2px_2px_0px_#1A1A1A]" />)}
          </div>
          <BrutalButton tone="ink" onClick={onNewInvestigation} className="mt-1">New Investigation</BrutalButton>
        </div>
      </div>
    );
  }

  // ---- DEFEAT: BUSTED (red DSS security report) ----
  if (gameState.status === 'LOST_HEAT') {
    return (
      <div className="absolute inset-0 z-[120] bg-[#FFE4E6] text-[#1A1A1A] flex flex-col overflow-y-auto no-scrollbar animate-fade-in">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 3px, rgba(139,0,0,0.25) 3px 4px)' }} />
        <div className="relative bg-[#8B0000] text-white px-4 py-2 flex justify-between font-mono text-[10px] font-black tracking-widest">
          <span>DEPT OF STATE SERVICES</span>
          <span>INCIDENT REPORT // FINAL</span>
        </div>
        <div className="relative p-5 flex flex-col gap-4">
          <div className="self-start rotate-[-4deg] border-4 border-[#8B0000] text-[#8B0000] font-black text-lg tracking-[0.2em] px-3 py-1 animate-stamp-in">BUSTED</div>
          <h1 className="font-mono font-black text-2xl uppercase leading-tight text-[#8B0000]">Safehouse Raided! Operatives Seize Laptops &amp; Burner Phones</h1>
          <p className="font-mono text-xs leading-relaxed bg-white/70 border border-[#8B0000] p-3">
            At 04:12, unmarked Hilux vans closed off the street. Your operation against {target.shortName} reached {believers.toFixed(1)}% belief before Heat hit 100%. Every device in the room is now evidence against you.
          </p>
          <div className="flex flex-col gap-2">
            {rows.map(([l, v]) => <Row key={l} label={l} value={v} className="bg-white/70 border-[#8B0000] font-mono" />)}
          </div>
          <div className="font-mono text-xs border-2 border-dashed border-[#8B0000] bg-[#FEE2E2] p-3 leading-relaxed">
            <span className="font-black text-[#8B0000]">FIELD TIP:</span>{' '}
            {defenses === 0
              ? 'You never opened the Defense Desk. Burner SIMs, the Darknet Relay and the Safehouse panic button are all cheaper than losing the case. Spend Sparks on OpSec before Heat passes 70%.'
              : `You bought ${defenses} OpSec upgrade${defenses > 1 ? 's' : ''}, but Heat still outran you. Buy the Darknet Relay early (it cuts daily Heat) and keep 40 ⚡ in reserve for the Safehouse.`}
          </div>
          <BrutalButton tone="crimson" onClick={onNewInvestigation}>New Investigation</BrutalButton>
        </div>
      </div>
    );
  }

  // ---- DEFEAT: FIZZLED OUT (tabloid front page, the story dies) ----
  return (
    <div className="absolute inset-0 z-[120] bg-[#E7E2D6] text-[#1A1A1A] flex flex-col overflow-y-auto no-scrollbar animate-fade-in">
      <PaperGrain />
      <div className="relative p-5 flex flex-col gap-4">
        <div className="border-b-4 border-double border-[#1A1A1A] pb-2 text-center">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/60">
            <span>Late Edition</span>
            <span>₦300</span>
          </div>
          <div className="font-serif font-black text-4xl uppercase tracking-tight leading-none">The Daily Gist</div>
        </div>
        <div className="relative">
          <div className="absolute -top-2 right-0 rotate-[8deg] border-4 border-[#8B0000] text-[#8B0000] font-black text-sm tracking-[0.2em] px-3 py-1 bg-[#E7E2D6]/80 animate-stamp-in">TIME&apos;S UP</div>
          <h1 className="font-serif font-black text-[32px] uppercase leading-[0.95] tracking-tight pt-6">Rumor Fizzles Out! {target.shortName} Survives the News Cycle</h1>
        </div>
        <p className="font-serif text-sm leading-relaxed border-t-2 border-b-2 border-[#1A1A1A] py-3 first-letter:text-4xl first-letter:font-black first-letter:float-left first-letter:mr-1.5 first-letter:leading-none">
          Twenty days came and went. Only {believers.toFixed(1)}% of the country was convinced, and the nation has already moved on to a new scandal, a new fuel price and a new football argument. {target.fullName} is back on television, smiling.
        </p>
        <div className="flex flex-col gap-2">
          {rows.map(([l, v]) => <Row key={l} label={l} value={v} className="bg-[#D9D3C3] shadow-[2px_2px_0px_#1A1A1A]" />)}
        </div>
        <div className="font-serif text-xs italic border-l-4 border-[#1A1A1A] pl-3 leading-relaxed">
          Editor&apos;s note: Stories die when the receipts run dry. Chain PRESS and ELITE channels early, and leak verified evidence before Doubt hardens into Gist Fatigue.
        </div>
        <BrutalButton tone="ink" onClick={onNewInvestigation}>New Investigation</BrutalButton>
      </div>
    </div>
  );
};
