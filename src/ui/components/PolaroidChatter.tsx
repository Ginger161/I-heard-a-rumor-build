import React, { useEffect, useState } from 'react';
import { ChatterPing } from '../../engine/types';
import { TargetArchetype } from '../../engine/data/targets';
import { BALANCE } from '../../engine/balance';
import { Avatar } from './Silhouette';
import type { Emotion } from './Face';
import { pingEmotion } from '../mood';

// The Target's Polaroid, pinned top-left of the map. It "speaks" for 4 seconds whenever the Target reacts to something
// you did (starting, buying a channel, leaking evidence, a backfire) or when things get critical.
export const PolaroidChatter: React.FC<{ target: TargetArchetype; ping: ChatterPing | null; accent?: string; emotion?: Emotion }> = ({ target, ping, accent = '#1A1A1A', emotion = 'NEUTRAL' }) => {
  const [visibleId, setVisibleId] = useState<number | null>(null);

  useEffect(() => {
    if (!ping) return;
    setVisibleId(ping.id);
    const timer = setTimeout(() => setVisibleId(current => (current === ping.id ? null : current)), BALANCE.chatterMs);
    return () => clearTimeout(timer);
  }, [ping?.id]);

  const speaking = !!ping && visibleId === ping.id;
  const tone = ping?.event === 'onBackfire' ? 'text-[#065F46]' : ping?.event === 'onCritical' ? 'text-[#8B0000]' : 'text-[#1A1A1A]';

  return (
    <div className="absolute top-2 left-2 z-20 pointer-events-none flex items-start gap-1.5 max-w-[68%]" aria-live="polite">
      <div style={speaking ? { boxShadow: `0 0 0 2px ${accent}, 2px 2px 0px rgba(0,0,0,0.35)` } : undefined} className={`relative flex-shrink-0 w-[54px] bg-[#FDFCF8] p-[3px] pb-3 border border-[#1A1A1A] shadow-[2px_2px_0px_rgba(0,0,0,0.35)] -rotate-3 transition-transform ${speaking ? 'scale-105' : ''}`}>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white/70 border border-slate-300 rotate-[4deg]" />
        <div className="bg-[#D9CBB0] h-[44px] flex items-end justify-center overflow-hidden">
          <Avatar target={target} emotion={(speaking ? pingEmotion(ping?.event) : null) ?? emotion} className={`w-full h-full ${emotion === 'PANIC' || (speaking && ping?.event === 'onCritical') ? 'avatar-shake' : ''}`} />
        </div>
        <div className="absolute bottom-0.5 inset-x-0 text-center font-serif text-[6px] font-black leading-none truncate px-0.5">{target.shortName}</div>
      </div>
      {speaking && ping && (
        <div style={{ borderColor: accent, boxShadow: `2px 2px 0px ${accent}` }} className={`relative mt-1 bg-white border-2 rounded-lg rounded-tl-none px-2 py-1.5 animate-fade-in ${tone}`}>
          <div className="text-[10px] font-sans font-bold leading-snug italic">"{ping.text}"</div>
        </div>
      )}
    </div>
  );
};
