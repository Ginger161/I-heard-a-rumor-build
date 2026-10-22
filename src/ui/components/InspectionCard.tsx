import React from 'react';
import { GameState } from '../../engine/types';
import { DISPLAY_POPULATION_LABEL, nationalAverageDoubt } from '../../engine/selectors';
import { formatCount } from './common';

interface Slice {
  population: number;
  unaware: number;
  heard: number;
  believers: number;
  jaded: number;
  doubt: number;
}

// Spec §4B quotes, in priority order. The spec lists five; a sixth covers a state mid-spread.
export const streetGist = (s: Slice): string => {
  const reached = s.heard + s.believers;
  if (reached === 0) return 'Dead silence. Nobody in this state has heard a single whisper yet.';
  const believerPct = (s.believers / s.population) * 100;
  const heardPct = (s.heard / s.population) * 100;
  const jadedPct = (s.jaded / s.population) * 100;
  if (believerPct > 50) return 'Open outrage across the state! Street debates and radio callers are demanding immediate arrest.';
  if (s.doubt > 65) return 'The streets are calling cap! People think this is a paid political hatchet job without receipts.';
  if (jadedPct > 20) return 'Gist fatigue has set in. Citizens are tired of hearing talk with no hard evidence.';
  if (heardPct < 15) return "Quiet whispers at bus stops and barbershops. People are asking if it's true...";
  return 'Screenshots are flying and everyone has an opinion. The debate is getting louder by the hour.';
};

const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);

export const InspectionCard: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const selected = gameState.selectedStateId ? gameState.states[gameState.selectedStateId] : null;
  const all = Object.values(gameState.states);

  const slice: Slice = selected
    ? selected
    : {
        population: all.reduce((a, s) => a + s.population, 0),
        unaware: all.reduce((a, s) => a + s.unaware, 0),
        heard: all.reduce((a, s) => a + s.heard, 0),
        believers: all.reduce((a, s) => a + s.believers, 0),
        jaded: all.reduce((a, s) => a + s.jaded, 0),
        doubt: nationalAverageDoubt(gameState.states)
      };

  const believersPct = pct(slice.believers, slice.population);
  const heardPct = pct(slice.heard, slice.population);
  const jadedPct = pct(slice.jaded, slice.population);
  const unawarePct = Math.max(0, 100 - believersPct - heardPct - jadedPct);

  let quote: string;
  if (!gameState.hasPlantedSeed) {
    quote = 'Investigation dossier assembled. Tap any state to leak the first whisper and start the countdown.';
  } else if (!gameState.hasPoppedFirstSpark) {
    quote = 'The rumor is out. Tap the ⚡ bubble to bank your first Sparks and start the clock.';
  } else {
    quote = streetGist(slice);
  }

  return (
    <div className="flex-shrink-0 bg-[#1A1A1A] text-[#F4F1EA] p-3 z-10 border-t-2 border-[#1A1A1A] shadow-[0px_-4px_0px_rgba(0,0,0,0.1)] rounded-t-2xl mt-[-10px] pb-20">
      <div className="flex justify-between items-center mb-2 px-1 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold tracking-wide uppercase truncate">
            {selected ? selected.name : '🇳🇬 NG Nigeria'}
          </span>
          {selected && (
            <span className="text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-[#FEF3C7] text-[#B45309] whitespace-nowrap">
              {selected.demographicTag.replace('_', ' ')}
            </span>
          )}
        </div>
        <span className="text-[10px] font-sans text-slate-400 font-bold whitespace-nowrap">
          POP: {selected ? formatCount(selected.population) : `${DISPLAY_POPULATION_LABEL}`}
        </span>
      </div>

      <div className="w-full h-2.5 bg-black rounded-full flex overflow-hidden mb-2 border border-white/20 shadow-inner">
        <div className="h-full bg-[#DC2626]" style={{ width: `${believersPct}%` }} />
        <div className="h-full bg-[#D97706]" style={{ width: `${heardPct}%` }} />
        <div className="h-full bg-[#64748B]" style={{ width: `${jadedPct}%` }} />
        <div className="h-full bg-[#374151]" style={{ width: `${unawarePct}%` }} />
      </div>

      <div className="flex justify-between text-[10px] font-sans font-bold px-1 mb-2 text-slate-300">
        <span>Heard: <span className="text-[#D97706]">{heardPct.toFixed(1)}%</span></span>
        <span>Believers: <span className="text-[#F87171]">{believersPct.toFixed(1)}%</span></span>
        <span>Doubt: <span className="text-white">{Math.round(slice.doubt)}%</span></span>
        <span>Fatigue: <span className="text-[#94A3B8]">{jadedPct.toFixed(1)}%</span></span>
      </div>

      <div className="text-[11px] leading-snug font-sans italic text-slate-300 px-1 line-clamp-2 min-h-[30px]">"{quote}"</div>
    </div>
  );
};
