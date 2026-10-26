import React, { useState } from 'react';
import { CLUES, CLUE_TOTAL, isBonusClue, seasonClueCount } from '../../engine/season/clues';
import type { Clue } from '../../engine/season/types';
import { sfx } from '../audio';

// THE CLUE BOARD: every receipt you have pinned, as a dark corkboard of index cards. Locked slots stay blank, so the player can see how much is still out there.
const ICON: Record<Clue['kind'], string> = { doc: '📄', photo: '📷', voice: '🎙', chat: '💬', money: '💸', file: '🗂' };

export const ClueBoard: React.FC<{ found: string[]; onClose: () => void }> = ({ found, onClose }) => {
  const [open, setOpen] = useState<Clue | null>(null);
  return (
    <div data-mode="story" className="absolute inset-0 z-[110] flex flex-col tex-story fx-film text-[var(--m-ink)] animate-fade-in">
      <div className="relative z-[70] flex-shrink-0 px-3 py-2.5 flex items-center gap-3 bg-black/60 border-b border-white/10">
        <button onClick={() => { sfx.play('click'); onClose(); }} aria-label="Close the clue board" className="w-11 h-11 rounded-full border-2 border-[var(--m-line)] bg-[var(--m-surface2)] font-black cursor-pointer">←</button>
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--m-accent-text)]">Evidence</div>
          <div className="font-serif font-black text-[18px] leading-tight">The Clue Board • {seasonClueCount(found)}/{CLUE_TOTAL}{found.some(isBonusClue) ? ' +1 bonus' : ''}</div>
        </div>
      </div>
      <div className="relative flex-1 min-h-0 overflow-y-auto no-scrollbar p-3">
        <p className="text-[12px] font-sans text-[var(--m-soft)] leading-snug mb-3">Every receipt you find goes on the board. The more you hold, the more you can say when it counts.</p>
        <div className="grid grid-cols-3 gap-2.5">
          {CLUES.filter(c => !isBonusClue(c.id) || found.includes(c.id)).map(c => {
            const has = found.includes(c.id);
            return (
              <button key={c.id} disabled={!has} onClick={() => { sfx.play('click'); setOpen(c); }}
                className={`relative text-left rounded-md p-2 min-h-[104px] border-2 transition-all ${has ? 'bg-[#F4F1EA] text-[#1A1A1A] border-black shadow-[3px_3px_0px_rgba(0,0,0,.6)] cursor-pointer active:translate-y-[2px]' : 'bg-[var(--m-sunk)] border-dashed border-[var(--m-line)] text-[var(--m-soft)]'}`}
                style={{ transform: has ? `rotate(${((c.n * 37) % 5) - 2}deg)` : undefined }}>
                {has && <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#E11D48] border border-black" aria-hidden />}
                <div className="text-[10px] font-black tracking-widest">{String(c.n).padStart(2, '0')}</div>
                {has ? (
                  <>
                    <div className="text-xl leading-none mt-0.5" aria-hidden>{ICON[c.kind]}</div>
                    <div className="font-serif font-black text-[12px] leading-tight mt-1">{c.title}</div>
                  </>
                ) : <div className="text-2xl mt-2 text-center opacity-75" aria-label="Not found yet">?</div>}
              </button>
            );
          })}
        </div>
      </div>
      {open && (
        <div className="absolute inset-0 z-[80] bg-black/75 flex items-center justify-center p-5 animate-fade-in" onClick={() => setOpen(null)}>
          <div className="w-full max-w-[360px] bg-[#F4F1EA] text-[#1A1A1A] rounded-md border-2 border-black p-4 shadow-[6px_6px_0px_rgba(0,0,0,.6)] animate-pop-in" onClick={e => e.stopPropagation()}>
            <div className="text-[10px] font-black tracking-[0.3em] text-[#8B0000]">{isBonusClue(open.id) ? `BONUS CLUE • PREMIUM GIST` : `CLUE ${String(open.n).padStart(2, '0')} / ${CLUE_TOTAL} • CHAPTER ${open.chapter}`}</div>
            <div className="font-serif font-black text-[21px] leading-tight mt-1">{ICON[open.kind]} {open.title}</div>
            <p className="font-sans text-[14px] leading-snug mt-2">{open.detail}</p>
            <button onClick={() => setOpen(null)} className="mt-3 min-h-[44px] px-4 rounded-md border-2 border-black bg-[#1A1A1A] text-[#F4F1EA] text-[12px] font-black uppercase tracking-wider cursor-pointer">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
