import React from 'react';
import { GameState } from '../../engine/types';
import { vocabFor } from '../../engine/campaigns';
import { DISPLAY_POPULATION_LABEL, nationalAverageDoubt } from '../../engine/selectors';
import { formatCount } from './common';
import { pickGist } from '../../engine/data/copyUi';

interface Slice {
  population: number;
  unaware: number;
  heard: number;
  believers: number;
  jaded: number;
  doubt: number;
}

// Spec quotes, in priority order, with sharp Standard English tabloid copy.
const streetGist = (s: Slice, _zone?: string, _seed?: number, _stateId?: string): string => {
  const reached = s.heard + s.believers;
  if (reached === 0) {
    return 'Complete silence. Not even a motor-park whisper has reached the streets of this state yet.';
  }
  if (s.doubt >= 65) {
    return 'Widespread skepticism! Citizens are calling the story a paid political smear job—leak verified evidence immediately or lose the crowd!';
  }
  if (s.jaded / s.population > 0.15) {
    return 'Scandal fatigue has set in! The public is tired of sensational rumors with zero proof. Only hard evidence can reignite their outrage.';
  }
  if (s.believers / s.population >= 0.5) {
    return 'Total public outrage! From market stalls to ministry corridors, citizens are 100% convinced of his guilt and demanding immediate arrest!';
  }
  if (s.heard > 0) {
    return 'Whispers are spreading fast across barbershops, commuter buses, and WhatsApp groups as citizens ask if the explosive allegations are actually true.';
  }
  return 'Complete silence. Not even a motor-park whisper has reached the streets of this state yet.';
};

// The same five moods, for a campaign: the street talks about the cause, not a scandal.
const campaignGist = (s: Slice, cause: string, adopters: string): string => {
  const reached = s.heard + s.believers;
  if (reached === 0) return `Nobody here has heard of ${cause} yet. Not a poster, not a radio mention, not even a rumour.`;
  if (s.doubt >= 65) return 'People are not convinced. Questions about who is behind it and whether it is true are everywhere. Clear, checkable proof is the only way back.';
  if (s.jaded / s.population > 0.15) return 'Campaign fatigue has set in. People have heard the slogan so many times that it has stopped meaning anything. Fresh proof, a fresh voice.';
  if (s.believers / s.population >= 0.5) return `More than half of this state is now among the ${adopters}. The shop owners know the slogan and the children can sing it.`;
  if (s.heard > 0) return `${cause} is being talked about at bus stops, barber shops and in the family group chat. People are asking whether it really works.`;
  return `Nobody here has heard of ${cause} yet.`;
};

const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);

export const InspectionCard: React.FC<{ gameState: GameState; desktop?: boolean }> = ({ gameState, desktop = false }) => {
  const vocab = vocabFor(gameState.activeTargetId);
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
    quote = vocab.campaign ? `${vocab.cause}: brief ready. Tap any state to start the first conversation and the countdown.` : 'Investigation dossier assembled. Tap any state to leak the first whisper and start the countdown.';
  } else if (!gameState.hasPoppedFirstSpark) {
    quote = vocab.campaign ? 'The first conversation has started. Tap the ⚡ bubble to bank your first Sparks and start the clock.' : 'The rumor is out. Tap the ⚡ bubble to bank your first Sparks and start the clock.';
  } else {
    quote = vocab.campaign ? campaignGist(slice, vocab.cause, vocab.adoptersLow) : streetGist(slice, selected?.region ?? 'NC', gameState.copySeed, selected?.id ?? 'nation');
  }

  return (
    <div data-tour="inspect" className={desktop ? "flex-shrink-0 bg-[#1A1A1A] text-[#F4F1EA] px-5 py-3.5 z-10 border-t-4 border-[#8B0000]" : "flex-shrink-0 bg-[#1A1A1A] text-[#F4F1EA] p-3 z-10 border-t-2 border-[#1A1A1A] shadow-[0px_-4px_0px_rgba(0,0,0,0.1)] rounded-t-2xl mt-[-10px] pb-20"}>
      <div className="flex justify-between items-center mb-2 px-1 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold tracking-wide uppercase truncate">
            {selected ? selected.name : '🇳🇬 NG Nigeria'}
          </span>
          {selected && (
            <span className="text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-[#FEF3C7] text-[#92400E] whitespace-nowrap">
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
        <span>{vocab.adopters}: <span className="text-[#F87171]">{believersPct.toFixed(1)}%</span></span>
        <span>{vocab.doubt}: <span className="text-white">{Math.round(slice.doubt)}%</span></span>
        <span>Fatigue: <span className="text-[#94A3B8]">{jadedPct.toFixed(1)}%</span></span>
      </div>

      <div className="text-[11px] leading-snug font-sans italic text-slate-300 px-1 line-clamp-2 min-h-[30px]">"{quote}"</div>
    </div>
  );
};
