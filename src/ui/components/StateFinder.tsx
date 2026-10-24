import React from 'react';
import { STATES_A_TO_Z, STATES_BY_ZONE, stateListName } from '../../engine/data/stateLabels';
import { sfx } from '../audio';
import { ZONE_TINT } from '../zoneColors';

// A plain list of every state, written out in full, for people who do not know where their state is on the map.
// Big tap targets (44 px), three to a row, names never shortened or cut. Used by "Find a state" on the map and by the first screen.
const Chip: React.FC<{ id: string; current?: string | null; onPick: (id: string) => void; tint?: string }> = ({ id, current, onPick, tint }) => (
  <button
    onClick={() => { sfx.play('click'); onPick(id); }}
    className={`min-h-[44px] px-1.5 py-1 rounded-lg border-2 border-[#1A1A1A] text-[#1A1A1A] text-[13px] leading-tight font-black font-sans text-center break-words active:translate-y-[2px] active:shadow-none cursor-pointer ${
      current === id ? 'bg-[#FDE68A] shadow-none' : `${tint ? '' : 'bg-white '}shadow-[2px_2px_0px_#1A1A1A]`
    }`}
    style={tint && current !== id ? { backgroundColor: tint } : undefined}
  >
    {stateListName(id)}
  </button>
);

interface Props {
  onPick: (id: string) => void;
  onClose?: () => void;
  title: string;
  subtitle?: string;
  grouped?: boolean;            // by region (helps people learn where things are) or A to Z (fastest to scan for your own state)
  current?: string | null;
  dark?: boolean;
}

export const StateFinder: React.FC<Props> = ({ onPick, onClose, title, subtitle, grouped = false, current = null, dark = false }) => (
  <div className={`absolute inset-0 z-40 flex flex-col animate-fade-in ${dark ? 'bg-[#0B0E14] text-[#F4F1EA]' : 'bg-[#F4F1EA] text-[#1A1A1A]'}`} role="dialog" aria-label={title} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
    <div className="flex-shrink-0 flex items-start justify-between gap-3 px-4 pt-3 pb-2">
      <div className="min-w-0">
        <div className="font-serif font-black text-xl leading-tight">{title}</div>
        {subtitle && <div className={`text-[12px] font-sans leading-snug mt-0.5 ${dark ? 'text-[#F4F1EA]/70' : 'text-[#1A1A1A]/70'}`}>{subtitle}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Close" className="w-11 h-11 flex-shrink-0 rounded-lg border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] font-black text-lg shadow-[2px_2px_0px_#1A1A1A] cursor-pointer">✕</button>
      )}
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 pb-4">
      {grouped ? (
        STATES_BY_ZONE.map(z => (
          <div key={z.zone} className="mb-3">
            <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 px-1 ${dark ? 'text-[#FDE68A]' : 'text-[#8B0000]'}`}><span aria-hidden className="w-3.5 h-3.5 rounded-sm border-2 border-[#1A1A1A]" style={{ backgroundColor: ZONE_TINT[z.zone] }} />{z.name}</div>
            <div className="grid grid-cols-3 gap-2">{z.ids.map(id => <Chip key={id} id={id} current={current} onPick={onPick} tint={ZONE_TINT[z.zone]} />)}</div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-3 gap-2">{STATES_A_TO_Z.map(id => <Chip key={id} id={id} current={current} onPick={onPick} />)}</div>
      )}
    </div>
  </div>
);
