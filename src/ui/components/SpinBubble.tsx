import React from 'react';

interface SpinBubbleProps {
  ticksRemaining: number;
  lifetime: number;
  paused: boolean;         // Freeze the countdown ring while the clock is stopped
  onTap: () => void;
  hit?: number;            // Invisible tap area behind the bubble, in the map's own units (keeps it finger-sized on a small map)
}

const RADIUS = 19;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// A Target AI "PR Spin" bubble. Shatter it before the ring runs out or Doubt detonates.
export const SpinBubble: React.FC<SpinBubbleProps> = ({ ticksRemaining, lifetime, paused, onTap, hit = 0 }) => {
  const from = Math.max(0, ticksRemaining / lifetime);
  const to = Math.max(0, (ticksRemaining - 1) / lifetime);
  const urgent = ticksRemaining <= 1;

  return (
    <div className="relative w-11 h-11">
      {hit > 0 && (
        <span
          aria-hidden
          onPointerDown={e => { e.stopPropagation(); onTap(); }}
          className="absolute rounded-full"
          style={{ width: hit, height: hit, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      )}
      <button
        aria-label="Shatter PR spin bubble"
        onPointerDown={e => { e.stopPropagation(); onTap(); }}
        className={`relative w-11 h-11 flex flex-col items-center justify-center bg-[#FEE2E2] border-2 border-[#8B0000] rounded-full shadow-[2px_2px_0px_#8B0000] cursor-pointer leading-none active:scale-75 hover:scale-105 transition-transform ${
          urgent ? 'animate-pulse' : ''
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
        <span className="text-[7px] font-black text-[#8B0000] tracking-wider">SPIN</span>
      </button>
      <svg className="absolute inset-0 -rotate-90 pointer-events-none" width="44" height="44" viewBox="0 0 44 44">
        <circle
          key={`${ticksRemaining}`}
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          stroke="#8B0000"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{
            ['--ring-from' as string]: CIRCUMFERENCE * (1 - from),
            ['--ring-to' as string]: CIRCUMFERENCE * (1 - to),
            strokeDashoffset: CIRCUMFERENCE * (1 - from),
            animation: 'ring-deplete 6s linear forwards',
            animationPlayState: paused ? 'paused' : 'running'
          }}
        />
      </svg>
    </div>
  );
};
