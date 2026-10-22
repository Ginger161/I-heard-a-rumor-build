import React, { useState } from 'react';
import { GameState } from '../../engine/types';
import { computeMasterVariables, defenseUses, nationalBelieverPct, nationalHeardPct, nationalAverageDoubt } from '../../engine/selectors';
import { ZONE_IDS, ZONE_NAMES, ZONE_STATE_IDS } from '../../engine/data/zones';
import { getTarget } from '../../engine/data/targets';
import { DEFENSE_DATA } from '../../engine/data/defense';
import { WIN_BELIEVER_PCT } from '../../engine/simulation';
import { BrutalButton, PaperGrain } from './common';

interface ShellProps {
  title: string;
  stamp?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const SheetShell: React.FC<ShellProps> = ({ title, stamp, onClose, children }) => (
  <>
    <div className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-[2px] z-40 animate-fade-in" onClick={onClose} />
    <div className="absolute inset-x-0 bottom-0 max-h-[75%] bg-[#EADCC8] z-50 flex flex-col border-t-4 border-[#1A1A1A] shadow-[0px_-10px_20px_rgba(0,0,0,0.3)] rounded-t-3xl animate-slide-up overflow-hidden">
      <PaperGrain />
      <div className="relative bg-[#1A1A1A] text-[#F4F1EA] p-4 flex-shrink-0 flex items-center justify-between border-b-4 border-[#8B0000]">
        <div>
          {stamp && <div className="text-[9px] font-black tracking-widest uppercase text-[#FDE68A] mb-0.5">{stamp}</div>}
          <span className="text-base font-black tracking-widest uppercase font-serif">{title}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 bg-[#F4F1EA] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-md font-bold text-sm flex items-center justify-center active:translate-y-[2px] active:translate-x-[2px] cursor-pointer"
        >
          ✕
        </button>
      </div>
      <div className="relative flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">{children}</div>
    </div>
  </>
);

const Bar: React.FC<{ value: number; max?: number; color: string; markers?: number[] }> = ({ value, max = 100, color, markers = [] }) => (
  <div className="relative w-full h-4 bg-[#EBE5D9] border-2 border-[#1A1A1A] rounded-sm overflow-hidden">
    <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }} />
    {markers.map(m => (
      <div key={m} className="absolute top-0 bottom-0 w-[2px] bg-[#1A1A1A]/60" style={{ left: `${(m / max) * 100}%` }} />
    ))}
  </div>
);

// ---------------------------------------------------------------------------
export const HistoryLogSheet: React.FC<{ gameState: GameState; onClose: () => void }> = ({ gameState, onClose }) => {
  const entries = [...gameState.historyLog].reverse();
  return (
    <SheetShell title="Case Log" stamp={`Day ${Math.min(gameState.currentDay, gameState.dayBudget)} of ${gameState.dayBudget}`} onClose={onClose}>
      {entries.length === 0 && (
        <div className="text-center text-xs font-bold text-[#1A1A1A]/50 uppercase tracking-widest py-8">No developments yet. Keep pushing.</div>
      )}
      {entries.map((e, i) => (
        <div key={`${e.day}_${i}`} className="bg-[#F4F1EA] border-2 border-[#1A1A1A] rounded-lg p-3 shadow-[2px_2px_0px_#1A1A1A]">
          <div className="flex justify-between items-baseline gap-2">
            <span className="font-serif font-black text-sm leading-tight">{e.headline}</span>
            <span className="text-[9px] font-black tracking-widest uppercase text-[#8B0000] whitespace-nowrap">Day {e.day}</span>
          </div>
          <div className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-wider">{e.impact}</div>
        </div>
      ))}
    </SheetShell>
  );
};

// ---------------------------------------------------------------------------
export const BelieversSheet: React.FC<{ gameState: GameState; onClose: () => void }> = ({ gameState, onClose }) => {
  const believers = nationalBelieverPct(gameState.states);
  const heard = nationalHeardPct(gameState.states);
  const doubt = nationalAverageDoubt(gameState.states);
  return (
    <SheetShell title="Public Opinion" stamp="Believers // Heard // Doubt" onClose={onClose}>
      <div>
        <div className="flex justify-between text-xs font-black uppercase tracking-wider mb-1">
          <span>Believers</span>
          <span className="text-[#8B0000]">{believers.toFixed(1)}% / {WIN_BELIEVER_PCT}% to win</span>
        </div>
        <Bar value={believers} color="#DC2626" markers={[25, 50, WIN_BELIEVER_PCT]} />
      </div>
      <div>
        <div className="flex justify-between text-xs font-black uppercase tracking-wider mb-1">
          <span>Heard it</span>
          <span className="text-[#B45309]">{heard.toFixed(1)}%</span>
        </div>
        <Bar value={heard} color="#D97706" />
      </div>
      <div>
        <div className="flex justify-between text-xs font-black uppercase tracking-wider mb-1">
          <span>Avg. Doubt (reached states)</span>
          <span>{Math.round(doubt)}%</span>
        </div>
        <Bar value={doubt} color="#64748B" markers={[65]} />
      </div>
      <div className="text-[10px] font-black tracking-widest uppercase text-[#1A1A1A]/60 mt-1">By geopolitical zone</div>
      {ZONE_IDS.map(zone => {
        const ids = ZONE_STATE_IDS[zone];
        const pop = ids.reduce((a, id) => a + gameState.states[id].population, 0);
        const bel = ids.reduce((a, id) => a + gameState.states[id].believers, 0);
        const reached = ids.filter(id => gameState.states[id].heard + gameState.states[id].believers > 0).length;
        return (
          <div key={zone} className="bg-[#F4F1EA] border-2 border-[#1A1A1A] rounded-lg p-2.5">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider mb-1">
              <span>{ZONE_NAMES[zone]}</span>
              <span className="text-slate-600">{reached}/{ids.length} states • {((bel / pop) * 100).toFixed(1)}% believe</span>
            </div>
            <Bar value={(bel / pop) * 100} color="#DC2626" />
          </div>
        );
      })}
    </SheetShell>
  );
};

// ---------------------------------------------------------------------------
export const HeatSheet: React.FC<{ gameState: GameState; onClose: () => void }> = ({ gameState, onClose }) => {
  const vars = computeMasterVariables(gameState);
  const target = getTarget(gameState.activeTargetId);
  const proxy = defenseUses(gameState, 'proxy_relay') > 0 ? 0.75 : 1;
  const targetMult = gameState.activeTargetId === 'godfather' ? 1.15 : 1;
  const daily = Math.max(1.5, vars.notoriety * 7.5 * proxy) * targetMult;
  return (
    <SheetShell title="State Security Heat" stamp="DSS // Confidential" onClose={onClose}>
      <div>
        <div className="flex justify-between text-xs font-black uppercase tracking-wider mb-1">
          <span>Heat</span>
          <span className="text-[#8B0000]">{Math.floor(gameState.heat)}% (peak {Math.floor(gameState.peakHeat)}%)</span>
        </div>
        <Bar value={gameState.heat} color="#B91C1C" markers={[40, 70, 90]} />
      </div>
      <div className="bg-[#F4F1EA] border-2 border-[#1A1A1A] rounded-lg p-3 text-[11px] font-bold leading-relaxed">
        <div>Daily Heat gain: <span className="text-[#8B0000]">+{daily.toFixed(1)}%</span></div>
        <div className="text-slate-600">Notoriety {vars.notoriety.toFixed(2)} × 7.5{proxy < 1 ? ' × 0.75 (Darknet Relay)' : ''}{targetMult > 1 ? ` × 1.15 (${target.passiveName})` : ''}, minimum 1.5.</div>
      </div>
      <div className="text-[10px] font-black tracking-widest uppercase text-[#1A1A1A]/60">Escalation</div>
      {[
        { at: 40, text: 'Cybercrime Unit begins logging ISP traffic' },
        { at: 70, text: 'Telecom throttling and burner-account freezes' },
        { at: 90, text: 'Unmarked Hilux vans outside the safehouse' },
        { at: 100, text: 'SAFEHOUSE RAIDED. Game over.' }
      ].map(t => (
        <div key={t.at} className={`flex items-center gap-2 text-[11px] font-bold ${gameState.heat >= t.at ? 'text-[#8B0000]' : 'text-slate-500'}`}>
          <span className="font-black w-9">{t.at}%</span>
          <span>{t.text}</span>
        </div>
      ))}
      <div className="text-[10px] font-black tracking-widest uppercase text-[#1A1A1A]/60 mt-1">OpSec on file</div>
      {DEFENSE_DATA.filter(d => defenseUses(gameState, d.id) > 0).map(d => (
        <div key={d.id} className="text-[11px] font-bold">✓ {d.name}{d.maxUses > 1 ? ` ×${defenseUses(gameState, d.id)}` : ''}</div>
      ))}
      {Object.keys(gameState.defensePurchases).length === 0 && (
        <div className="text-[11px] font-bold text-slate-500">Nothing yet. Open the Defense Desk before the vans arrive.</div>
      )}
    </SheetShell>
  );
};

// ---------------------------------------------------------------------------
interface PauseProps {
  onResume: () => void;
  onHistory: () => void;
  onReset: () => void;
}

export const PauseMenu: React.FC<PauseProps> = ({ onResume, onHistory, onReset }) => {
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <div className="absolute inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="relative w-full max-w-[320px] bg-[#F4F1EA] border-4 border-[#1A1A1A] rounded-2xl shadow-[8px_8px_0px_#1A1A1A] p-5 animate-slide-up overflow-hidden">
        <PaperGrain />
        <div className="relative">
          <div className="inline-block -rotate-2 border-4 border-[#1A1A1A] bg-white px-4 py-1 font-black text-2xl tracking-widest mb-4 shadow-[3px_3px_0px_#1A1A1A]">PAUSED</div>
          <div className="flex flex-col gap-2.5">
            <BrutalButton tone="ink" onClick={onResume}>▶ Resume Investigation</BrutalButton>
            <BrutalButton tone="paper" onClick={onHistory}>Case Log</BrutalButton>
            {!confirmReset ? (
              <BrutalButton tone="paper" onClick={() => setConfirmReset(true)}>New Investigation / Reset</BrutalButton>
            ) : (
              <div className="border-2 border-dashed border-[#8B0000] rounded-lg p-3 bg-[#FEE2E2]">
                <div className="text-[11px] font-bold text-[#8B0000] mb-2">This burns the current case file. Start over?</div>
                <div className="flex gap-2">
                  <BrutalButton tone="crimson" className="flex-1 py-2" onClick={onReset}>Burn it</BrutalButton>
                  <BrutalButton tone="paper" className="flex-1 py-2" onClick={() => setConfirmReset(false)}>Cancel</BrutalButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
