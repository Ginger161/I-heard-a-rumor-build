import React, { useCallback, useEffect, useRef, useState } from 'react';
import { markHintSeen } from '../settings';
import { haptic, sfx } from '../audio';

// FIRST-TIME REVEALS. A beginner's screen starts light, and each meter or button appears when it first matters. The first time
// one appears it must not slip in unnoticed: it shakes, gets a "NEW" stamp slammed on it, a ring and a bouncing pointer, and says
// in one line what it is. Each is shown once, ever, and goes away after a few seconds or on a tap. Only one at a time.
export type RevealId = 'heat' | 'meters' | 'evidence' | 'defense';

export const REVEALS: Record<RevealId, { title: string; body: string; hint?: string; align: 'left' | 'center' | 'right'; side: 'below' | 'above' }> = {
  heat:     { title: '🚨 Heat', body: 'Police dey watch you. At 100% you are busted.', hint: 'heat', align: 'right', side: 'below' },
  meters:   { title: '🛡 Cover-Up', body: 'Their PR team is fighting back. At 100% they walk free.', hint: 'coverup', align: 'center', side: 'below' },
  evidence: { title: '🧾 Evidence', body: 'A real file is ready. Leak it and Doubt drops.', hint: 'evidence', align: 'left', side: 'above' },
  defense:  { title: '🛡 Defense', body: 'Spend ⚡ here to cool the Heat down.', align: 'right', side: 'above' }
};
const ORDER: RevealId[] = ['heat', 'meters', 'evidence', 'defense'];
const KEY = 'rumor_reveals_seen';
const SHOW_MS = 6500;

const readSeen = (): RevealId[] => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
const writeSeen = (s: RevealId[]) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ } };

/** Which reveal (if any) should be pointing at something right now. `enabled` is false while a card, desk or tutorial step is in the way. */
export const useReveals = (visible: Record<RevealId, boolean>, enabled: boolean, lite = true) => {
  const [seen, setSeen] = useState<RevealId[]>(readSeen);
  const [active, setActive] = useState<RevealId | null>(null);
  const seenRef = useRef(seen);
  seenRef.current = seen;

  const dismiss = useCallback(() => {
    setActive(cur => {
      if (cur && !seenRef.current.includes(cur)) { const next = [...seenRef.current, cur]; seenRef.current = next; writeSeen(next); setSeen(next); }
      return null;
    });
  }, []);

  // A beginner gets the reveal instead of the plain hint toast for the same thing, so the two never stack on top of each other.
  useEffect(() => {
    if (!lite) return;
    ORDER.forEach(id => { const h = REVEALS[id].hint; if (h && visible[id]) markHintSeen(h); });
  }, [lite, visible]);

  useEffect(() => {
    if (!enabled || active) return;
    const next = ORDER.find(id => visible[id] && !seen.includes(id));
    if (!next) return;
    setActive(next);
    const hint = REVEALS[next].hint;
    if (hint) markHintSeen(hint);     // the reveal says it, so the plain hint toast does not repeat it
    sfx.play('stamp');
    haptic([20, 30, 20]);
  }, [enabled, active, visible, seen]);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(dismiss, SHOW_MS);
    return () => clearTimeout(t);
  }, [active, dismiss]);

  return { active, dismiss };
};

/** Wraps an element. While `on`, it shakes, wears a ring and a NEW stamp, and has a pointer and a caption. */
export const Reveal: React.FC<{ id: RevealId; on: boolean; onDone: () => void; className?: string; children: React.ReactNode }> = ({ id, on, onDone, className = '', children }) => {
  const r = REVEALS[id];
  const pos = r.align === 'left' ? 'left-0' : r.align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2';
  return (
    <div className={`relative ${className}`} onPointerDown={on ? onDone : undefined}>
      <div className={on ? 'reveal-shake' : ''}>{children}</div>
      {on && (
        <>
          <div aria-hidden className="absolute -inset-1.5 rounded-xl border-[4px] border-[#FDE68A] pointer-events-none animate-pulse" style={{ boxShadow: '0 0 0 3px #1A1A1A, 0 0 18px 4px rgba(253,230,138,0.85)' }} />
          <div aria-hidden className="absolute -top-3 -right-2 z-10 rotate-[-12deg] pointer-events-none animate-stamp-in border-[3px] border-[#B91C1C] bg-[#FEF2F2] text-[#B91C1C] font-black text-[11px] tracking-[0.2em] px-1.5 py-0.5 rounded-sm">NEW</div>
          <div aria-hidden className={`absolute z-10 pointer-events-none reveal-bounce text-2xl ${r.side === 'below' ? 'top-full mt-1' : 'bottom-full mb-1'} left-1/2 -translate-x-1/2`}>{r.side === 'below' ? '👆' : '👇'}</div>
          <div role="status" className={`absolute z-20 w-[236px] pointer-events-none animate-pop-in ${pos} ${r.side === 'below' ? 'top-full mt-9' : 'bottom-full mb-9'}`}>
            <div className="bg-[#1A1A1A] text-[#F4F1EA] border-2 border-[#FDE68A] rounded-lg px-3 py-2 shadow-[3px_3px_0px_rgba(0,0,0,0.35)]">
              <div className="text-[12px] font-black uppercase tracking-wider text-[#FDE68A] leading-tight">{r.title}</div>
              <div className="text-[13px] font-sans font-semibold leading-snug">{r.body}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
