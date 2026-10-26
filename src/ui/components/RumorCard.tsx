import React from 'react';
import type { GameState } from '../../engine/types';
import { SCANDALS, getTarget } from '../../engine/data/targets';
import { ANGLE_NAMES } from '../../engine/campaigns';

// THE RUMOUR YOU ARE SPREADING, on the game screen where it is never out of sight. Before this it showed nowhere during a case,
// and it was easy to forget what the story actually was.
//  strip: two lines under the top bar on a phone.   card: the full wording at the head of the case file on desktop.
export const RumorCard: React.FC<{ gameState: GameState; variant: 'strip' | 'card'; onOpen?: () => void; right?: React.ReactNode }> = ({ gameState, variant, onOpen, right }) => {
  const target = getTarget(gameState.activeTargetId);
  const camp = target.campaign;
  const title = gameState.scandalTitle || SCANDALS[gameState.scandalCategory].tagline;

  if (variant === 'card') {
    return (
      <div className="relative bg-[#1A1A1A] text-[#F4F1EA] border-[3px] border-[#1A1A1A] rounded-xl p-3 shadow-[3px_3px_0px_#8B0000]">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FDE68A]">{camp ? `📣 The campaign • ${ANGLE_NAMES[gameState.scandalCategory] ?? ''}` : `📰 The rumour • ${SCANDALS[gameState.scandalCategory].label}`}</div>
        <div className="font-serif font-black text-[17px] leading-tight mt-1">“{title}”</div>
        <div className="text-[11px] font-sans text-[#F4F1EA]/72 mt-1">{camp ? `${camp.cause}: against ${target.fullName}` : `About ${target.fullName}`}</div>
      </div>
    );
  }
  return (
    <button
      onClick={onOpen}
      aria-label={camp ? 'The campaign you are running. Open the brief.' : 'The rumour you are spreading. Open the case file.'}
      className="w-full text-left flex items-start gap-2 bg-[var(--m-panel)] text-[var(--m-panel-ink)] border border-[var(--m-line)] rounded-lg px-2.5 py-1.5 cursor-pointer active:opacity-80"
    >
      <span aria-hidden className="text-base leading-none mt-0.5">{camp ? '📣' : '📰'}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--m-panel-accent)]">
          <span className="truncate">{camp ? `The campaign • ${camp.cause}` : `The rumour • ${target.shortName}`}</span>
          {right}
        </div>
        <div className="text-[12px] font-bold leading-tight line-clamp-2">“{title}”</div>
      </div>
    </button>
  );
};
