import React, { useState } from 'react';
import { BrutalButton, PaperGrain } from './common';
import { sfx } from '../audio';
import { PREMIUM_FEATURES, joinWaitlist, onWaitlist, redeemLicense, removeLicense } from '../../engine/premium';
import { usePremium } from '../usePremium';
import { MONETIZATION_LIVE, PAYMENT_URL, PREMIUM_NAME, PREMIUM_PRICE_TEXT, SUPPORT_EMAIL, WAITLIST_URL } from '../../config';

// The Gist Pass. While MONETIZATION_LIVE is false this is a "coming soon" page with a waitlist; licence codes already work,
// so testers and creators can be given Premium today.
export const PremiumSheet: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const ent = usePremium();
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(onWaitlist);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const live = MONETIZATION_LIVE && !!PAYMENT_URL;

  const join = async () => {
    sfx.play('click');
    const ok = await joinWaitlist(email, WAITLIST_URL);
    if (ok) { setJoined(true); setMsg(email.trim() ? "You're on the list. We'll tell you first." : "Noted. We'll show a reminder in the game when it opens."); sfx.play('buy'); }
    else setMsg('That email does not look right.');
  };
  const redeem = async () => {
    sfx.play('click');
    if (!code.trim()) { setMsg('Paste your licence code first.'); return; }
    const r = await redeemLicense(code);
    if (r === 'ok') { setCode(''); setMsg(null); sfx.play('win'); } else setMsg('That code is not valid, or it has expired.');
  };

  return (
    <div className="absolute inset-0 z-[90] bg-[#1A1A1A]/75 backdrop-blur-sm flex items-end justify-center animate-fade-in desk-wrap" onClick={onClose}>
      <div role="dialog" aria-label={PREMIUM_NAME} onClick={e => e.stopPropagation()} className="relative w-full max-h-[92%] bg-[#F4F1EA] border-t-4 border-x-4 border-[#1A1A1A] rounded-t-2xl flex flex-col animate-slide-up overflow-hidden desk-sheet">
        <PaperGrain />
        <div className="relative flex items-center justify-between px-4 pt-3 pb-2 border-b-2 border-[#1A1A1A] flex-shrink-0 bg-[#FDE68A]">
          <div>
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-[#8B0000]">{ent ? 'Active' : live ? 'Premium' : 'Coming soon'}</div>
            <div className="font-serif font-black text-xl leading-none">⭐ {PREMIUM_NAME}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] bg-white font-black cursor-pointer">✕</button>
        </div>

        <div className="relative overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">
          {ent && (
            <div className="bg-[#D1FAE5] border-2 border-[#1A1A1A] rounded-lg p-3">
              <div className="font-black text-[14px]">Thank you for backing the game. ⭐</div>
              <div className="text-[11px] font-sans text-slate-700 mt-0.5">{ent.plan === 'forever' ? 'Yours for good.' : ent.expires ? `Active until ${new Date(ent.expires).toLocaleDateString()}.` : 'Active.'}{ent.note ? ` (${ent.note})` : ''}</div>
              <button onClick={() => { removeLicense(); setMsg('Premium removed from this device.'); }} className="text-[10px] font-bold underline text-slate-600 mt-1 cursor-pointer">Remove from this device</button>
            </div>
          )}

          <p className="text-[13px] font-sans leading-snug">Every Target file, unlocked from day one, plus a few extras for the people who help us keep adding more.</p>
          <ul className="flex flex-col gap-2">
            {PREMIUM_FEATURES.map(f => (
              <li key={f.title} className="flex gap-3 items-start bg-white border-2 border-[#1A1A1A] rounded-lg px-3 py-2">
                <span className="text-xl leading-none mt-0.5" aria-hidden>{f.icon}</span>
                <div><div className="font-black text-[13px] leading-tight">{f.title}</div><div className="text-[11px] font-sans text-slate-600 leading-snug">{f.blurb}</div></div>
              </li>
            ))}
          </ul>
          <p className="text-[11px] font-sans italic text-slate-600 leading-snug">The game stays free to play. Stars, envelopes and the Daily Case never need Premium.</p>

          {!ent && live && (
            <div className="flex flex-col gap-2">
              <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer" className="block text-center bg-[#8B0000] text-white border-2 border-[#1A1A1A] rounded-lg py-3 font-black uppercase tracking-wider text-[13px] shadow-[3px_3px_0px_#1A1A1A]">Get the {PREMIUM_NAME}{PREMIUM_PRICE_TEXT ? ` • ${PREMIUM_PRICE_TEXT}` : ''}</a>
              <div className="text-[10px] font-sans text-slate-600 leading-snug">After paying you receive a licence code by email{SUPPORT_EMAIL ? ` (trouble? ${SUPPORT_EMAIL})` : ''}. Paste it below.</div>
            </div>
          )}

          {!ent && !live && (
            <div className="border-2 border-dashed border-[#1A1A1A] rounded-lg p-3 bg-[#FEF3C7] flex flex-col gap-2">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B0000]">Coming soon</div>
              {joined ? <div className="text-[12px] font-bold text-[#065F46]">✓ You're on the list.</div> : (
                <>
                  <div className="text-[11px] font-sans text-slate-700 leading-snug">Want to hear when it opens? Leave an email (optional).</div>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" aria-label="Email" className="w-full border-2 border-[#1A1A1A] rounded px-2 py-1.5 text-[13px] font-sans bg-white" />
                  <BrutalButton tone="ink" className="py-2" onClick={() => void join()}>Notify me</BrutalButton>
                </>
              )}
            </div>
          )}

          {!ent && (
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B0000]">Have a licence code?</div>
              <div className="flex gap-2">
                <input value={code} onChange={e => setCode(e.target.value)} aria-label="Licence code" placeholder="RUMP1…" autoComplete="off" className="flex-1 min-w-0 border-2 border-[#1A1A1A] rounded-lg px-2 py-1.5 text-[11px] font-mono bg-white" />
                <BrutalButton tone="paper" className="py-1.5 px-4" onClick={() => void redeem()}>Redeem</BrutalButton>
              </div>
            </div>
          )}
          {msg && <div role="status" className="text-[11px] font-bold text-[#8B0000]">{msg}</div>}
        </div>
      </div>
    </div>
  );
};
