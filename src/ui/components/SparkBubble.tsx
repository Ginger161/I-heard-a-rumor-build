import React from 'react';
import { ShatterBurst } from './common';

interface SparkBubbleProps {
  amount: number;
  urgent?: boolean;       // Last tick of life: bounce faster
  shattering?: boolean;   // Controlled by the map: plays the 6-shard shatter
  onTap: () => void;
}

// A Spark (⚡) clout bubble pinned over a state. Tapping banks it.
export const SparkBubble: React.FC<SparkBubbleProps> = ({ amount, urgent = false, shattering = false, onTap }) => {
  const [animating, setAnimating] = React.useState(false);

  React.useEffect(() => {
    if (!shattering) return;
    const raf = requestAnimationFrame(() => setAnimating(true));
    return () => cancelAnimationFrame(raf);
  }, [shattering]);

  return (
    <div className="relative w-10 h-10">
      <button
        aria-label={`Collect ${amount} sparks`}
        onPointerDown={e => { e.stopPropagation(); if (!shattering) onTap(); }}
        className={`relative w-10 h-10 flex flex-col items-center justify-center bg-[#FEF3C7] border-2 border-[#1A1A1A] rounded-full shadow-[2px_2px_0px_#1A1A1A] cursor-pointer transition-all duration-150 ease-out leading-none ${
          shattering ? 'scale-0 opacity-0' : urgent ? 'animate-bounce [animation-duration:0.5s]' : 'animate-bounce active:scale-75 hover:scale-105'
        }`}
      >
        <span className="text-[13px] font-black text-[#B45309]">⚡</span>
        <span className="text-[9px] font-black text-[#1A1A1A] -mt-0.5">{amount}</span>
      </button>
      {shattering && <ShatterBurst color="#B45309" animating={animating} />}
    </div>
  );
};
