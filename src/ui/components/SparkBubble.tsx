import React from 'react';
import { SparkKind } from '../../engine/types';
import { ShatterBurst } from './common';

interface SparkBubbleProps {
  amount: number;
  kind?: SparkKind;
  urgent?: boolean;       // Last tick of life: bounce faster
  shattering?: boolean;   // Controlled by the map: plays the 6-shard shatter
  onTap: () => void;
  hit?: number;           // Size of an invisible tap area behind the bubble, in the map's own units (keeps it finger-sized when the map is small)
}

// Each kind reads differently at a glance, so players learn what is worth chasing:
//   WHISPER = amber (a state's first whisper) | FAST = small teal blip | FAT = big gold | GOLDEN = rare jackpot.
const LOOK: Record<SparkKind, { size: string; bg: string; border: string; text: string; shard: string; label: string }> = {
  WHISPER: { size: 'w-10 h-10', bg: 'bg-[#FEF3C7]', border: 'border-[#1A1A1A]', text: 'text-[#B45309]', shard: '#B45309', label: 'sparks' },
  FAST: { size: 'w-8 h-8', bg: 'bg-white', border: 'border-[#0E7490]', text: 'text-[#0E7490]', shard: '#0E7490', label: 'quick sparks' },
  FAT: { size: 'w-12 h-12', bg: 'bg-[#FDE68A]', border: 'border-[#B45309]', text: 'text-[#92400E]', shard: '#92400E', label: 'big sparks' },
  GOLDEN: { size: 'w-12 h-12', bg: 'bg-gradient-to-br from-[#FEF08A] via-[#FACC15] to-[#F59E0B]', border: 'border-[#78350F]', text: 'text-[#78350F]', shard: '#F59E0B', label: 'golden jackpot' }
};

// A Spark (⚡) clout bubble pinned over a state. Tapping banks it.
export const SparkBubble: React.FC<SparkBubbleProps> = ({ amount, kind = 'WHISPER', urgent = false, shattering = false, onTap, hit = 0 }) => {
  const [animating, setAnimating] = React.useState(false);
  const look = LOOK[kind];

  React.useEffect(() => {
    if (!shattering) return;
    const raf = requestAnimationFrame(() => setAnimating(true));
    return () => cancelAnimationFrame(raf);
  }, [shattering]);

  return (
    <div className={`relative ${look.size}`}>
      {kind === 'GOLDEN' && !shattering && (
        <>
          <span className="absolute inset-0 rounded-full bg-[#FACC15]/50 animate-ping" aria-hidden />
          <span className="absolute -top-2 -right-1 text-[11px] animate-pulse" aria-hidden>✦</span>
          <span className="absolute -bottom-1 -left-2 text-[9px] animate-pulse [animation-delay:300ms]" aria-hidden>✦</span>
        </>
      )}
      {kind === 'FAT' && !shattering && <span className="absolute inset-0 rounded-full border-2 border-[#B45309]/50 animate-ping" aria-hidden />}
      {hit > 0 && !shattering && (
        <span
          aria-hidden
          onPointerDown={e => { e.stopPropagation(); onTap(); }}
          className="absolute rounded-full"
          style={{ width: hit, height: hit, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      )}
      <button
        aria-label={`Collect ${amount} ${look.label}`}
        onPointerDown={e => { e.stopPropagation(); if (!shattering) onTap(); }}
        className={`relative ${look.size} flex flex-col items-center justify-center ${look.bg} border-2 ${look.border} rounded-full shadow-[2px_2px_0px_#1A1A1A] cursor-pointer transition-all duration-150 ease-out leading-none ${
          shattering ? 'scale-0 opacity-0' : urgent ? 'animate-bounce [animation-duration:0.5s]' : 'animate-bounce active:scale-75 hover:scale-105'
        }`}
      >
        <span className={`${kind === 'FAST' ? 'text-[11px]' : 'text-[13px]'} font-black ${look.text}`}>⚡</span>
        <span className={`${kind === 'FAST' ? 'text-[8px]' : 'text-[9px]'} font-black text-[#1A1A1A] -mt-0.5`}>{amount}</span>
      </button>
      {shattering && <ShatterBurst color={look.shard} animating={animating} />}
    </div>
  );
};
