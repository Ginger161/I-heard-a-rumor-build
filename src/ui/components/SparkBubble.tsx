import React, { useState, useEffect } from 'react';

interface SparkBubbleProps {
  id: string;
  amount: number;
  x: number;
  y: number;
  onCollect: (id: string, amount: number) => void;
}

export const SparkBubble: React.FC<SparkBubbleProps> = ({ id, amount, x, y, onCollect }) => {
  const [isShattering, setIsShattering] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isShattering) {
      const raf = requestAnimationFrame(() => setAnimating(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [isShattering]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    e.stopPropagation();
    if (isShattering) return;
    
    setIsShattering(true);
    // Wait for the shatter animation to play before updating the game state
    setTimeout(() => {
      onCollect(id, amount);
    }, 400);
  };

  // Generate 6 shards that shoot out in a circle
  const renderShards = () => {
    return Array.from({ length: 6 }).map((_, i) => {
      const angle = (i * 60) * (Math.PI / 180);
      // Math for shooting the shards outward
      const dx = Math.cos(angle) * 30; 
      const dy = Math.sin(angle) * 30;

      return (
        <div 
          key={i}
          className="absolute w-2 h-2 bg-[#B45309] rotate-45 transition-all duration-300 ease-out"
          style={{
            transform: animating ? `translate(${dx}px, ${dy}px) scale(0)` : `translate(0px, 0px) scale(1)`,
            opacity: animating ? 0 : 1,
            top: '50%',
            left: '50%',
            marginTop: '-4px',
            marginLeft: '-4px'
          }}
        />
      );
    });
  };

  return (
    <div 
      className="absolute z-40"
      style={{ left: `${x}px`, top: `${y}px`, transform: `translate(-50%, -50%)` }}
    >
      <button
        onPointerDown={handleTap}
        className={`relative flex items-center justify-center w-10 h-10 bg-white border-2 border-[#1A1A1A] rounded-full shadow-[2px_2px_0px_#1A1A1A] cursor-pointer transition-all duration-150 ease-out ${
          isShattering ? 'scale-0 opacity-0' : 'animate-bounce active:scale-75 hover:scale-105'
        }`}
      >
        <span className="text-base font-black text-[#B45309]">⚡</span>
      </button>

      {/* SHARDS (Only visible during the exact moment of the shatter) */}
      {isShattering && (
        <div className="absolute inset-0 pointer-events-none">
          {renderShards()}
        </div>
      )}
    </div>
  );
};
