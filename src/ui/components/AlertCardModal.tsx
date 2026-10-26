import { getSettings } from '../settings';
import React, { useEffect } from 'react';
import { GameAlert } from '../../engine/types';
import { PaperGrain } from './common';
import { haptic, sfx } from '../audio';
import { hashString } from '../theme';

interface AlertCardModalProps {
  alert: GameAlert;
  remaining: number;
  sparks: number;
  accent: string;      // The Target's temperament colour, used on its own counter-moves
  copySeed: number;    // Picks the card skin, so two runs show different documents
  onDismiss: () => void;
  onChoose: (choiceId: string) => void;
}

const Impact: React.FC<{ text?: string; className?: string }> = ({ text, className = '' }) =>
  text ? (
    <div className={`text-[10px] font-black uppercase tracking-widest text-center px-2 py-1 border border-[#1A1A1A] ${className}`}>{text}</div>
  ) : null;

const ActionButton: React.FC<{ label: string; onClick: () => void; className: string; style?: React.CSSProperties }> = ({ label, onClick, className, style }) => (
  <button
    onClick={() => { sfx.play('click'); onClick(); }}
    style={style}
    className={`w-full mt-1 py-3 font-black text-xs uppercase tracking-widest border-2 border-[#1A1A1A] rounded-lg shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all cursor-pointer ${className}`}
  >
    {label}
  </button>
);

// Jagged torn-paper edges for the notebook scrap.
const TORN =
  'polygon(0% 2%, 5% 0%, 11% 2.5%, 18% 0.5%, 26% 2%, 34% 0%, 43% 2.5%, 52% 0.5%, 61% 2%, 70% 0%, 79% 2.5%, 88% 0.5%, 95% 2%, 100% 0%, 100% 97.5%, 94% 100%, 86% 97.5%, 77% 100%, 67% 97.5%, 58% 100%, 48% 97.5%, 38% 100%, 28% 97.5%, 19% 100%, 9% 97.5%, 0% 100%)';
const ZIGZAG =
  'polygon(0 0, 100% 0, 100% 96%, 95% 100%, 90% 96%, 85% 100%, 80% 96%, 75% 100%, 70% 96%, 65% 100%, 60% 96%, 55% 100%, 50% 96%, 45% 100%, 40% 96%, 35% 100%, 30% 96%, 25% 100%, 20% 96%, 15% 100%, 10% 96%, 5% 100%, 0 96%)';

const ENTRIES = ['animate-slide-up', 'animate-drop-in', 'animate-pop-in'];

export const AlertCardModal: React.FC<AlertCardModalProps> = ({ alert, remaining, sparks, accent, copySeed, onDismiss, onChoose }) => {
  const h = hashString(`${alert.id}:${copySeed}`);
  const skin = h % 3;
  const entry = ENTRIES[(h >>> 3) % ENTRIES.length];
  const heavy = (alert.archetype === 'TARGET_PR' || alert.archetype === 'SECURITY_WIRE') && alert.priority >= 76;

  // Sound and buzz when a card lands. Heavy hits shake the card.
  useEffect(() => {
    const sound = alert.archetype === 'SECURITY_WIRE' ? (alert.priority >= 82 ? 'warn' : 'alert')
      : alert.archetype === 'TARGET_PR' || alert.archetype === 'BREAKING_FRONT' ? 'stamp'
      : alert.archetype === 'VIRAL_RECEIPT' ? 'pop' : 'whoosh';
    sfx.play(sound);
    haptic(heavy ? [30, 40, 60] : 15);
  }, [alert.id, alert.archetype, alert.priority, heavy]);

  // Event and informant cards carry decisions; everything else has a single dismiss button.
  const renderAction = (cls: string, style?: React.CSSProperties) =>
    alert.choices && alert.choices.length > 0 ? (
      <div className="flex flex-col gap-2 mt-1">
        {alert.choices.map(c => {
          const broke = !!c.cost && sparks < c.cost;
          return (
            <button
              key={c.id}
              disabled={broke}
              onClick={() => { sfx.play('buy'); onChoose(c.id); }}
              style={broke ? undefined : style}
              className={`w-full text-left px-3 py-2.5 border-2 border-[#1A1A1A] rounded-lg transition-all ${
                broke
                  ? 'bg-[#D4CFC4] text-slate-600 opacity-60 cursor-not-allowed border-dashed'
                  : `${cls} shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer`
              }`}
            >
              <div className="font-black text-[11px] uppercase tracking-wider leading-tight">{c.label}</div>
              {c.detail && <div className="text-[10px] font-bold opacity-85 mt-0.5 leading-snug">{c.detail}{broke ? ' (not enough Sparks)' : ''}</div>}
            </button>
          );
        })}
      </div>
    ) : (
      <ActionButton label={alert.buttonText} onClick={onDismiss} className={cls} style={style} />
    );

  const renderCard = () => {
    switch (alert.archetype) {
      // ======================= STREET_WHISPER =======================
      case 'STREET_WHISPER':
        if (skin === 1) {
          // Napkin with a coffee ring, scribbled in blue pen
          return (
            <div className="relative rotate-[1.5deg] bg-[#FBF6EC] border-2 border-[#C4A574] shadow-[6px_6px_0px_#1A1A1A] px-5 pt-6 pb-5 flex flex-col gap-3 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-[6px] border-[#8B5E3C]/25" aria-hidden />
              <span className="self-start text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#1E40AF] text-white rotate-[-2deg]">{alert.stampText}</span>
              <h2 className="font-serif italic text-2xl leading-7 text-[#1E40AF] underline decoration-wavy decoration-[#1E40AF]/40">{alert.headline}</h2>
              <p className="font-serif italic text-[15px] leading-6 text-[#1E3A8A]">{alert.body}</p>
              <Impact text={alert.subtext} className="bg-[#FEF3C7] text-[#92400E] rotate-[-1deg]" />
              {renderAction('bg-[#1E40AF] text-white')}
            </div>
          );
        }
        if (skin === 2) {
          // Thermal receipt
          return (
            <div style={{ filter: 'drop-shadow(5px 5px 0 #1A1A1A)' }}>
              <div className="relative bg-white px-5 pt-4 pb-7 flex flex-col gap-2.5 font-mono" style={{ clipPath: ZIGZAG }}>
                <div className="text-center text-[11px] font-black tracking-[0.25em]">NAIJA GIST MART</div>
                <div className="text-center text-[10px] text-slate-600 leading-tight">RC 0001234 • ALL SALES FINAL • NO REFUNDS ON RUMOURS</div>
                <div className="border-t border-dashed border-[#1A1A1A] pt-2 text-[10px] font-black tracking-widest">{alert.stampText}</div>
                <h2 className="text-[15px] font-black uppercase leading-tight">{alert.headline}</h2>
                <p className="text-[11px] leading-relaxed text-slate-700">{alert.body}</p>
                <div className="border-t border-dashed border-[#1A1A1A] pt-2 flex justify-between text-[10px] font-black"><span>TOTAL</span><span>1 RUMOR</span></div>
                {alert.subtext && <div className="text-[10px] text-center font-bold text-[#92400E]">{alert.subtext}</div>}
                <div className="h-6 opacity-80" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#1A1A1A 0 2px,transparent 2px 4px,#1A1A1A 4px 5px,transparent 5px 8px)' }} aria-hidden />
                {renderAction('bg-[#1A1A1A] text-[#F4F1EA]')}
              </div>
            </div>
          );
        }
        return (
          <div className="rotate-[-1.5deg]" style={{ filter: 'drop-shadow(5px 5px 0 #1A1A1A)' }}>
            <div
              className="relative bg-[#FFFDF5] px-6 pt-7 pb-6 flex flex-col gap-3 overflow-hidden"
              style={{ clipPath: TORN, backgroundImage: 'linear-gradient(transparent 27px, #BFDBFE 28px)', backgroundSize: '100% 28px' }}
            >
              <div className="absolute top-0 bottom-0 left-9 w-[2px] bg-[#FCA5A5]" />
              <div className="absolute top-4 left-2 flex flex-col gap-6">
                <span className="w-3 h-3 rounded-full bg-[#1A1A1A]/80" />
                <span className="w-3 h-3 rounded-full bg-[#1A1A1A]/80" />
              </div>
              <span className="self-start ml-5 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] border border-[#B45309] -rotate-1">{alert.stampText}</span>
              <h2 className="ml-5 font-serif italic text-xl leading-7 text-[#1A1A1A]">{alert.headline}</h2>
              <p className="ml-5 font-mono text-xs text-slate-700 leading-[28px]">{alert.body}</p>
              <Impact text={alert.subtext} className="ml-5 bg-[#FEF3C7] text-[#92400E]" />
              <div className="ml-5">{renderAction('bg-[#1A1A1A] text-[#F4F1EA]')}</div>
            </div>
          </div>
        );

      // ======================= VIRAL_RECEIPT =======================
      case 'VIRAL_RECEIPT':
        if (skin === 1) {
          // Instagram-story style
          return (
            <div className="rotate-[1deg] p-[3px] rounded-2xl bg-gradient-to-tr from-[#F59E0B] via-[#EC4899] to-[#8B5CF6] shadow-[8px_8px_0px_#1A1A1A]">
              <div className="rounded-[14px] bg-[#111827] text-white overflow-hidden">
                <div className="flex items-center gap-2 px-3 pt-3">
                  <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-[#F59E0B] to-[#EC4899]"><div className="w-full h-full rounded-full bg-[#111827] flex items-center justify-center text-[11px]">🗣️</div></div>
                  <div className="text-[11px] font-bold">naija_gist_central <span className="text-white/50 font-normal">• now</span></div>
                </div>
                <div className="px-4 py-5 flex flex-col gap-2.5">
                  <span className="self-start text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/15">{alert.stampText}</span>
                  <h2 className="font-sans font-black text-xl leading-tight tracking-tight">{alert.headline}</h2>
                  <p className="font-sans text-[13px] font-semibold leading-snug text-white/90">{alert.body}</p>
                  <div className="flex gap-3 text-sm pt-1" aria-hidden><span>❤️ 48K</span><span>🔥 12K</span><span>😂 9K</span></div>
                  <Impact text={alert.subtext} className="bg-white/10 text-[#FDE68A] border-white/20 rounded" />
                  {renderAction('bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white')}
                </div>
              </div>
            </div>
          );
        }
        if (skin === 2) {
          // Dark social-post style
          return (
            <div className="rotate-[-1deg] bg-black text-white border-4 border-[#1A1A1A] rounded-xl shadow-[8px_8px_0px_#0B6FB8] overflow-hidden">
              <div className="p-4 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0B6FB8] flex items-center justify-center text-sm flex-shrink-0">📢</div>
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="text-[12px] font-bold">Naija Gist HQ <span className="text-[#5CC0FA]">✔</span> <span className="text-white/50 font-normal">@gisthq · 2m</span></div>
                  <span className="self-start text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[#0B6FB8]/20 text-[#5CC0FA]">{alert.stampText}</span>
                  <h2 className="font-sans font-black text-base leading-snug">{alert.headline}</h2>
                  <p className="font-sans text-[12px] leading-snug text-white/85">{alert.body}</p>
                  <div className="flex justify-between text-[10px] text-white/50 pt-1" aria-hidden><span>💬 12K</span><span>🔁 48K</span><span>❤️ 210K</span><span>📊 3.1M</span></div>
                  <Impact text={alert.subtext} className="bg-[#0B6FB8]/15 text-[#7DD3FC] border-[#0B6FB8]/40 rounded" />
                  {renderAction('bg-[#0B6FB8] text-white')}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="rotate-[1deg] bg-[#E5DDD5] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#065F46] rounded-xl overflow-hidden">
            <div className="bg-[#075E54] text-white px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest">{alert.stampText}</span>
              <span className="text-[10px] opacity-80">now ✓✓</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="relative bg-[#DCF8C6] border border-[#1A1A1A]/30 rounded-lg rounded-tr-none p-3 shadow-sm">
                <div className="text-[10px] text-slate-600 italic mb-1">↪ Forwarded many times</div>
                <h2 className="font-sans font-black text-base text-[#1A1A1A] leading-tight mb-1.5 tracking-tight">{alert.headline}</h2>
                <p className="font-sans text-xs font-semibold text-slate-800 leading-snug">{alert.body}</p>
                <div className="text-right text-[10px] text-slate-600 mt-1">12:07 ✓✓</div>
              </div>
              <Impact text={alert.subtext} className="bg-white text-[#065F46] rounded" />
              {renderAction('bg-[#065F46] text-white')}
            </div>
          </div>
        );

      // ======================= BREAKING_FRONT =======================
      case 'BREAKING_FRONT':
        if (skin === 1) {
          // Screaming tabloid
          return (
            <div className="relative rotate-[-0.5deg] bg-[#FFFBEB] border-4 border-[#1A1A1A] shadow-[10px_10px_0px_#1A1A1A] overflow-hidden">
              <div className="bg-[#DC2626] text-white text-center py-1.5 font-black text-xl tracking-[0.12em] uppercase" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>The Naija Sun</div>
              <div className="relative p-4 flex flex-col gap-3">
                <div className="absolute -top-2 right-2 w-16 h-16 flex items-center justify-center bg-[#FDE047] text-[#1A1A1A] font-black text-[10px] text-center leading-tight rotate-[12deg] shadow-[2px_2px_0px_#1A1A1A]" style={{ clipPath: 'polygon(50% 0,61% 20%,82% 10%,80% 33%,100% 40%,83% 55%,95% 76%,72% 74%,65% 100%,50% 82%,35% 100%,28% 74%,5% 76%,17% 55%,0 40%,20% 33%,18% 10%,39% 20%)' }}>EXCLU-<br />SIVE!</div>
                <span className="self-start text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#1A1A1A] text-[#FDE047]">{alert.stampText}</span>
                <h2 className="font-black text-[26px] uppercase leading-[0.98] pr-14" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                  <span className="bg-[#FDE047] px-1 box-decoration-clone">{alert.headline}</span>
                </h2>
                <p className="font-sans text-[13px] font-semibold leading-snug">{alert.body}</p>
                <Impact text={alert.subtext} className="bg-[#DC2626] text-white" />
                {renderAction('bg-[#1A1A1A] text-[#FDE047]')}
              </div>
            </div>
          );
        }
        if (skin === 2) {
          // Broadsheet
          return (
            <div className="relative rotate-[0.4deg] bg-[#F7F3EA] border-[3px] border-[#1A1A1A] shadow-[9px_9px_0px_#44403C] overflow-hidden">
              <PaperGrain />
              <div className="relative text-center border-b-2 border-[#1A1A1A] px-3 pt-2 pb-1.5">
                <div className="font-serif text-[10px] tracking-[0.3em] uppercase text-[#1A1A1A]/72">Est. 1961 • Late Final</div>
                <div className="font-serif font-black text-[22px] leading-none uppercase tracking-wide">The Lagos Ledger</div>
              </div>
              <div className="relative p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2"><span className="flex-1 h-[2px] bg-[#1A1A1A]" /><span className="text-[10px] font-black uppercase tracking-widest">{alert.stampText}</span><span className="flex-1 h-[2px] bg-[#1A1A1A]" /></div>
                <h2 className="font-serif font-black text-[22px] leading-[1.05] text-center">{alert.headline}</h2>
                <p className="font-serif text-[12px] leading-[1.45] text-justify [column-count:2] [column-gap:14px] [column-rule:1px_solid_#1A1A1A]">{alert.body}</p>
                <Impact text={alert.subtext} className="bg-[#1A1A1A] text-[#F7F3EA]" />
                {renderAction('bg-[#44403C] text-white')}
              </div>
            </div>
          );
        }
        return (
          <div className="relative rotate-[0.5deg] bg-[#F4F1EA] border-4 border-[#1A1A1A] shadow-[10px_10px_0px_#8B0000] overflow-hidden">
            <PaperGrain />
            <div className="relative border-b-4 border-[#1A1A1A] px-4 pt-3 pb-2 text-center">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/72">
                <span>Lagos • Abuja • Kano</span>
                <span>₦300</span>
              </div>
              <div className="font-serif font-black text-2xl tracking-tight uppercase leading-none">The Daily Gist</div>
            </div>
            <div className="relative p-4 flex flex-col gap-3">
              <div className="absolute -top-1 right-2 rotate-[-6deg] border-4 border-[#8B0000] text-[#8B0000] font-black text-[10px] tracking-widest px-2 py-0.5 bg-[#F4F1EA]/80 animate-stamp-in">{alert.stampText}</div>
              <h2 className="font-serif font-black text-2xl uppercase tracking-tight leading-[1.05] text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-2 pr-2 pt-5">{alert.headline}</h2>
              <p className="font-serif text-sm text-[#1A1A1A] leading-relaxed first-letter:text-3xl first-letter:font-black first-letter:float-left first-letter:mr-1 first-letter:leading-none">{alert.body}</p>
              <Impact text={alert.subtext} className="bg-[#1A1A1A] text-[#F4F1EA]" />
              {renderAction('bg-[#8B0000] text-white')}
            </div>
          </div>
        );

      // ======================= TARGET_PR (tinted by the Target's temperament) =======================
      case 'TARGET_PR':
        if (skin === 1) {
          // Legal notice with a wax seal
          return (
            <div className="relative rotate-[0.5deg] bg-[#FFFEF7] border-4 shadow-[8px_8px_0px_#1A1A1A] p-4 flex flex-col gap-3 overflow-hidden" style={{ borderColor: accent }}>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-[10px] text-center leading-tight rotate-12 shadow-md" style={{ backgroundColor: accent }}>OFFICIAL<br />SEAL</div>
              <div className="font-serif font-black text-[11px] tracking-[0.3em] uppercase text-center pr-8" style={{ color: accent }}>Notice of Legal Action</div>
              <span className="self-start text-[10px] font-black uppercase tracking-widest px-2 py-0.5 text-white" style={{ backgroundColor: accent }}>{alert.stampText}</span>
              <h2 className="font-serif font-black text-lg uppercase leading-tight text-[#1A1A1A]">{alert.headline}</h2>
              <p className="font-serif text-[12px] leading-relaxed text-slate-800 border-t border-b border-[#1A1A1A]/30 py-2">{alert.body}</p>
              <div className="text-[10px] font-serif uppercase tracking-widest text-slate-600 text-center">Without prejudice • Strictly confidential</div>
              <Impact text={alert.subtext} className="bg-[#FEF3C7] text-[#8B0000]" />
              {renderAction('text-white', { backgroundColor: accent })}
            </div>
          );
        }
        if (skin === 2) {
          // Slick PR press statement
          return (
            <div className="relative rotate-[-0.5deg] bg-white border-2 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] overflow-hidden">
              <div className="px-4 py-2 text-white flex justify-between items-center" style={{ backgroundColor: accent }}>
                <span className="font-sans font-black text-[10px] tracking-[0.25em] uppercase">Press Statement</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">For immediate release</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <span className="self-start text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2" style={{ color: accent, borderColor: accent }}>{alert.stampText}</span>
                <h2 className="font-sans font-black text-xl leading-tight text-[#1A1A1A]">{alert.headline}</h2>
                <p className="font-sans text-[12px] leading-relaxed text-slate-700 border-l-4 pl-3 italic" style={{ borderColor: accent }}>{alert.body}</p>
                <Impact text={alert.subtext} className="bg-[#FEF3C7] text-[#8B0000]" />
                {renderAction('text-white', { backgroundColor: accent })}
              </div>
            </div>
          );
        }
        return (
          <div className="relative rotate-[-0.5deg] bg-[#FAF8F5] border-double border-[6px] shadow-[8px_8px_0px_#1A1A1A] p-1 overflow-hidden" style={{ borderColor: accent }}>
            <PaperGrain />
            <div className="relative border p-4 flex flex-col gap-3" style={{ borderColor: accent }}>
              <div className="flex items-center gap-3 border-b pb-2" style={{ borderColor: accent }}>
                <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center font-serif font-black text-sm" style={{ borderColor: accent, color: accent }}>★</div>
                <div className="flex-1">
                  <div className="font-serif font-bold text-[10px] uppercase tracking-[0.2em]">Office of the Principal</div>
                  <div className="font-serif text-[10px] uppercase tracking-widest text-slate-600">Press Secretariat • Strictly for release</div>
                </div>
              </div>
              <span className="self-start text-[10px] font-black uppercase tracking-widest px-2 py-0.5 text-white" style={{ backgroundColor: accent }}>{alert.stampText}</span>
              <h2 className="font-serif font-bold text-lg uppercase tracking-widest text-[#1A1A1A] text-center leading-tight">{alert.headline}</h2>
              <p className="font-serif text-xs text-slate-700 italic border-l-4 pl-3 leading-relaxed" style={{ borderColor: accent }}>{alert.body}</p>
              <Impact text={alert.subtext} className="bg-[#FEF3C7] text-[#8B0000]" />
              {renderAction('text-white', { backgroundColor: accent })}
            </div>
          </div>
        );

      // ======================= SECURITY_WIRE =======================
      case 'SECURITY_WIRE':
        if (skin === 1) {
          // Fax printout
          return (
            <div className="relative rotate-[-0.8deg] bg-[#E7E5E4] border-4 border-[#44403C] shadow-[8px_8px_0px_#1A1A1A] overflow-hidden font-mono">
              <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.35) 2px 3px)' }} />
              <div className="relative bg-[#44403C] text-[#E7E5E4] px-3 py-1 flex justify-between text-[10px] font-black tracking-widest"><span>FAX • TX 04:12</span><span>PAGE 1/1</span></div>
              <div className="relative p-4 flex flex-col gap-3 text-[#1A1A1A]">
                <div className="text-[10px] font-black tracking-widest border border-[#1A1A1A] self-start px-1.5 py-0.5">{alert.stampText}</div>
                <h2 className="font-black text-base uppercase leading-tight">{alert.headline}</h2>
                <p className="text-[11px] leading-relaxed border-l-4 border-[#1A1A1A] pl-3">{alert.body}</p>
                <Impact text={alert.subtext} className="bg-[#1A1A1A] text-[#E7E5E4]" />
                {renderAction('bg-[#44403C] text-white')}
              </div>
            </div>
          );
        }
        if (skin === 2) {
          // Green terminal
          return (
            <div className="relative rotate-[0.5deg] bg-[#020617] text-[#4ADE80] border-4 border-[#14532D] shadow-[8px_8px_0px_#1A1A1A] overflow-hidden font-mono">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 2px, rgba(74,222,128,0.4) 2px 3px)' }} />
              <div className="relative bg-[#14532D] text-[#BBF7D0] px-3 py-1 text-[10px] font-black tracking-widest">root@dss-intercept:~# tail -f /var/log/watchlist</div>
              <div className="relative p-4 flex flex-col gap-2.5">
                <div className="text-[10px] font-black tracking-widest text-[#FDE68A]">[{alert.stampText}]</div>
                <h2 className="font-black text-base uppercase leading-tight">&gt; {alert.headline}</h2>
                <p className="text-[11px] leading-relaxed text-[#86EFAC]">{alert.body}</p>
                {alert.subtext && <div className="text-[10px] font-black text-[#FDE68A]">$ {alert.subtext}<span className="animate-blink">█</span></div>}
                {renderAction('bg-[#4ADE80] text-[#020617]')}
              </div>
            </div>
          );
        }
        return (
          <div className="rotate-[1deg] bg-[#FFE4E6] border-4 border-[#8B0000] shadow-[8px_8px_0px_#1A1A1A] relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 3px, rgba(139,0,0,0.25) 3px 4px)' }} />
            <div className="relative bg-[#8B0000] text-white px-3 py-1.5 flex justify-between font-mono text-[10px] font-black tracking-widest">
              <span>DEPT OF STATE SERVICES</span>
              <span>TOP SECRET // CC-3</span>
            </div>
            <div className="relative p-4 flex flex-col gap-3">
              <span className="self-start font-mono text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#8B0000] text-white border-2 border-[#1A1A1A]">{alert.stampText}</span>
              <h2 className="font-mono font-black text-lg uppercase text-[#8B0000] tracking-wider leading-tight">{alert.headline}</h2>
              <p className="font-mono text-xs text-[#1A1A1A] bg-white/70 p-2.5 border border-[#8B0000] leading-relaxed">{alert.body}</p>
              <Impact text={alert.subtext} className="bg-[#8B0000] text-white font-mono" />
              {renderAction('bg-[#8B0000] text-white')}
            </div>
            <div className="relative border-t-2 border-dashed border-[#8B0000] text-center font-mono text-[10px] tracking-[0.3em] text-[#8B0000]/70 py-1">- - - - - - - - TEAR HERE - - - - - - - -</div>
          </div>
        );

      // ======================= INFORMANT_TIP =======================
      case 'INFORMANT_TIP':
        if (skin === 1) {
          // Voice note
          return (
            <div className="relative rotate-[-0.8deg] bg-[#2E1065] text-white border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#7C3AED] rounded-2xl overflow-hidden">
              <div className="px-4 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center text-sm flex-shrink-0">▶</div>
                <div className="flex-1 flex items-center gap-[3px] h-8" aria-hidden>
                  {Array.from({ length: 22 }).map((_, i) => (
                    <span key={i} className="flex-1 bg-[#C4B5FD] rounded-full animate-wave" style={{ height: `${30 + ((i * 37) % 70)}%`, animationDelay: `${(i % 7) * 90}ms` }} />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-white/70">0:37</span>
              </div>
              <div className="p-4 flex flex-col gap-2.5">
                <span className="self-start text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/15">{alert.stampText}</span>
                <h2 className="font-sans font-black text-base leading-tight">{alert.headline}</h2>
                <p className="font-sans text-[12px] leading-snug text-white/80 italic">"{alert.body.replace(/^"|"$/g, '')}"</p>
                <Impact text={alert.subtext} className="bg-white/10 text-[#DDD6FE] border-white/20 rounded" />
                {renderAction('bg-[#7C3AED] text-white')}
              </div>
            </div>
          );
        }
        if (skin === 2) {
          // Burner phone SMS
          return (
            <div className="relative rotate-[0.8deg] bg-[#3F3F46] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] rounded-2xl p-3">
              <div className="bg-[#B7D79A] border-4 border-[#27272A] rounded-md p-3 flex flex-col gap-2 font-mono text-[#1F2A14]" style={{ boxShadow: 'inset 0 0 12px rgba(0,0,0,0.25)' }}>
                <div className="flex justify-between text-[10px] font-black"><span>▮▮▮ BURNER</span><span>✉ 1 NEW</span></div>
                <div className="text-[10px] font-black tracking-widest border-b border-[#1F2A14]/40 pb-1">FROM: UNKNOWN • {alert.stampText}</div>
                <h2 className="font-black text-[13px] uppercase leading-tight">{alert.headline}</h2>
                <p className="text-[11px] leading-snug">{alert.body}</p>
                {alert.subtext && <div className="text-[10px] font-black">&gt; {alert.subtext}<span className="animate-blink">_</span></div>}
              </div>
              <div className="pt-3">{renderAction('bg-[#FACC15] text-[#1A1A1A]')}</div>
            </div>
          );
        }
        return (
          <div className="rotate-[-1deg] bg-[#C9B28A] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] relative overflow-hidden">
            <PaperGrain />
            <div className="relative h-8 border-b-2 border-[#1A1A1A] bg-[#B89D72]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            <div className="relative p-4 pt-2 flex flex-col gap-3 -mt-2">
              <div className="absolute top-1 right-3 rotate-[12deg] border-4 border-[#8B0000] text-[#8B0000] font-black text-sm tracking-[0.25em] px-2 py-0.5 opacity-80 animate-stamp-in">REDACTED</div>
              <span className="self-start font-mono text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#1A1A1A] text-[#E6D5B8]">{alert.stampText}</span>
              <h2 className="font-mono font-black text-base uppercase text-[#1A1A1A] leading-tight">{alert.headline}</h2>
              <p className="font-mono text-xs text-[#1A1A1A] border-t border-b border-dashed border-[#1A1A1A] py-2 leading-relaxed">{alert.body}</p>
              <div className="flex flex-col gap-1">
                <div className="h-2 w-3/4 bg-[#1A1A1A]" />
                <div className="h-2 w-1/2 bg-[#1A1A1A]" />
              </div>
              <Impact text={alert.subtext} className="bg-[#E6D5B8] text-[#1A1A1A] font-mono" />
              {renderAction('bg-[#1A1A1A] text-[#E6D5B8]')}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-[#1A1A1A]/75 backdrop-blur-[2px] flex items-center justify-center p-5 animate-fade-in">
      <div className="w-full max-w-[350px] alert-scale">
        <div className={heavy && getSettings().shake ? 'animate-shake' : ''}>
          <div className={entry}>{renderCard()}</div>
        </div>
        {remaining > 0 && (
          <div className="text-center mt-3 text-[10px] font-black uppercase tracking-widest text-[#F4F1EA]/72">+{remaining} more waiting</div>
        )}
      </div>
    </div>
  );
};
