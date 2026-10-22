import React from 'react';

export const PAPER_GRAIN =
  'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")';

// Subtle feTurbulence paper grain across paper surfaces (spec §1).
export const PaperGrain: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply ${className}`}
    style={{ backgroundImage: PAPER_GRAIN }}
  />
);

// Translucent masking-tape strip.
export const TapeStrip: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute w-10 h-3.5 bg-white/60 border border-slate-300 opacity-80 ${className}`} />
);

// Clout / Spark counter tape (spec §1).
export const SparkCounter: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`relative bg-[#FDE68A] text-[#B45309] font-black px-3 py-1.5 border-2 border-[#1A1A1A] rotate-1 shadow-[2px_2px_0px_rgba(0,0,0,0.15)] ${className}`}>
    <TapeStrip className="-top-2.5 left-1/2 -translate-x-1/2 rotate-[-4deg]" />
    {value} ⚡
  </div>
);

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'ink' | 'paper' | 'crimson' | 'green';
}

const TONES: Record<NonNullable<BrutalButtonProps['tone']>, string> = {
  ink: 'bg-[#1A1A1A] text-[#F4F1EA]',
  paper: 'bg-white text-[#1A1A1A]',
  crimson: 'bg-[#8B0000] text-white',
  green: 'bg-[#065F46] text-white'
};

export const BrutalButton: React.FC<BrutalButtonProps> = ({ tone = 'ink', className = '', disabled, children, ...rest }) => (
  <button
    disabled={disabled}
    className={`py-3 px-4 font-black text-[11px] uppercase tracking-widest border-2 border-[#1A1A1A] rounded-lg transition-all ${
      disabled
        ? 'bg-[#D4CFC4] text-slate-500 opacity-60 cursor-not-allowed border-dashed'
        : `${TONES[tone]} shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer`
    } ${className}`}
    {...rest}
  >
    {children}
  </button>
);

// Six jagged shards flying out at 60° steps: the glass-shatter used by every bubble.
export const ShatterBurst: React.FC<{ color?: string; animating: boolean }> = ({ color = '#B45309', animating }) => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 6 }).map((_, i) => {
      const angle = i * 60 * (Math.PI / 180);
      const dx = Math.cos(angle) * 30;
      const dy = Math.sin(angle) * 30;
      return (
        <div
          key={i}
          className="absolute w-2 h-2 rotate-45 transition-all duration-300 ease-out"
          style={{
            backgroundColor: color,
            transform: animating ? `translate(${dx}px, ${dy}px) scale(0)` : 'translate(0px, 0px) scale(1)',
            opacity: animating ? 0 : 1,
            top: '50%',
            left: '50%',
            marginTop: '-4px',
            marginLeft: '-4px'
          }}
        />
      );
    })}
  </div>
);

export const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(Math.round(n));
};
