import React, { useState } from 'react';
import { BrutalButton } from './common';
import { sfx } from '../audio';
import { Vocab } from '../../engine/campaigns';

// HOW TO PLAY: seven short cards, one idea each, readable in about a minute and skippable at any moment. It opens by itself the first time
// a case starts (the clock is still frozen then) and lives in both menus afterwards. Written to be read, not skimmed past: two lines a card,
// plain words, no jargon without its meaning next to it. In a campaign the same cards use the campaign's words.
const KEY = 'rumor_howto_seen';
export const howToSeen = (): boolean => { try { return localStorage.getItem(KEY) === '1'; } catch { return true; } };
export const markHowToSeen = () => { try { localStorage.setItem(KEY, '1'); } catch { /* storage unavailable */ } };

interface Card { icon: string; title: string; lead: string; more: string; tip?: string }

const cards = (v: Vocab): Card[] => [
  {
    icon: '🎯', title: 'Your mission',
    lead: v.campaign ? `Get 75% of Nigeria on board with ${v.cause} before the days run out.` : 'Get 75% of Nigeria to believe your story before the days run out.',
    more: v.campaign ? 'It starts in one state, then spreads by itself. You decide how fast.' : 'It starts in one state, then spreads by itself, state to state. You decide how fast.',
    tip: v.campaign ? `You lose if ${v.heat} or the ${v.coverUp} reaches 100%, or the time runs out.` : 'You lose if Heat or the Cover-Up reaches 100%, or the time runs out.'
  },
  {
    icon: '⚡', title: 'Sparks are your money',
    lead: 'Tap the ⚡ bubbles on the map to collect them. Be quick: they disappear.',
    more: 'The further the news spreads, the more bubbles appear.',
    tip: `Spend Sparks on channels, ${v.evidence.toLowerCase()} and ${v.defense.toLowerCase()}.`
  },
  {
    icon: '📣', title: 'Channels carry the story',
    lead: 'Buy channels on the Channels board. Each one spreads the story faster.',
    more: 'Street: cheap and local. Social: fastest, but loud. Press: makes people believe it. Elite: opens the big cities.',
    tip: 'Start cheap. Tap a channel to read what it does.'
  },
  {
    icon: '🧾', title: `${v.doubt} and ${v.evidence}`,
    lead: v.campaign ? `${v.doubt} means people are not convinced. When it is high, nobody comes round.` : `${v.doubt} means people are not buying it. When it is high, nobody believes.`,
    more: v.campaign ? `${v.evidence} brings it down. Honest proof is safe. A bolder claim is cheap, but it can backfire.` : `${v.evidence} brings it down. Real files are safe. Fake ones are cheap, but they can backfire.`,
    tip: 'Each file you share shocks people a little less than the last.'
  },
  {
    icon: v.campaign ? '📣' : '🚨', title: `${v.heat} and ${v.defense}`,
    lead: v.campaign ? 'Backlash is critics and regulators noticing you. At 100% the campaign is shut down.' : 'Heat is the authorities closing in. At 100% you are busted.',
    more: v.campaign ? 'Protection cools it, but critics keep a record of how loud you have been, so it never goes back to zero.' : 'Defense cools it, but they keep a file on how loud you have been, so it never goes back to zero.',
    tip: 'Be quiet early. Do not wait for 90%.'
  },
  {
    icon: '⚫', title: `${v.spin === 'Hoax' ? 'Hoax bubbles' : 'Spin bubbles'} and the ${v.coverUp}`,
    lead: v.campaign ? 'Dark Hoax bubbles are the opposition at work. Pop them before they land or Skepticism jumps.' : 'Dark Spin bubbles are the Target\'s PR team. Pop them before they land or Doubt jumps.',
    more: v.campaign ? `The Opposition bar is their counter-message. At 100% the message is dead. Proof pushes it back.` : `The Cover-Up bar is their counter-story. At 100% they walk free. Evidence pushes it back.`
  },
  {
    icon: '📰', title: v.campaign ? 'Their moves and the news' : 'Their moves and the news',
    lead: v.campaign ? 'The opposition hits back on a schedule: blocking a channel, draining Sparks, and more.' : 'The Target hits back on a schedule: freezing a channel, draining Sparks, and more.',
    more: 'News cards (blackouts, strikes, weddings) pop up too. The game waits while you decide, and there is always a free option.',
    tip: 'Open the Field Guide in the pause menu any time you forget a word.'
  }
];

export const HowToPlay: React.FC<{ vocab: Vocab; onClose: () => void; first?: boolean }> = ({ vocab, onClose, first = false }) => {
  const list = cards(vocab);
  const [i, setI] = useState(0);
  const c = list[i];
  const last = i === list.length - 1;
  const finish = () => { markHowToSeen(); sfx.play('click'); onClose(); };
  return (
    <div className="absolute inset-0 z-[150] bg-black/70 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-label="How to play">
      <div className="relative w-full max-w-[380px] bg-[var(--m-surface,#F4F1EA)] text-[var(--m-ink,#1A1A1A)] border-[3px] border-[var(--m-line,#1A1A1A)] rounded-2xl shadow-[6px_6px_0px_var(--m-line,#1A1A1A)] p-5 animate-pop-in">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--m-accent-text,#8B0000)]">How to play • {i + 1} of {list.length}</div>
          <button onClick={finish} className="min-h-[44px] px-2 text-[12px] font-black uppercase tracking-wider underline cursor-pointer">{first ? 'Skip' : 'Close'}</button>
        </div>
        <div className="mt-2 text-center">
          <div className="text-[52px] leading-none" aria-hidden>{c.icon}</div>
          <h2 className="font-serif font-black text-[24px] leading-tight mt-2">{c.title}</h2>
        </div>
        <p className="font-sans font-bold text-[16px] leading-snug mt-3">{c.lead}</p>
        <p className="font-sans text-[14px] leading-snug mt-2 text-[var(--m-soft,#5B564B)]">{c.more}</p>
        {c.tip && <div className="mt-3 rounded-lg border-2 border-dashed border-[var(--m-line,#1A1A1A)] bg-[var(--m-sunk,#E6D5B8)] px-3 py-2 text-[13px] font-sans font-bold leading-snug">💡 {c.tip}</div>}
        <div className="flex items-center justify-center gap-1.5 mt-4" aria-hidden>
          {list.map((_, k) => <span key={k} className={`h-1.5 rounded-full ${k === i ? 'w-5 bg-[var(--m-accent,#8B0000)]' : 'w-1.5 bg-[var(--m-ink,#1A1A1A)]/30'}`} />)}
        </div>
        <div className="flex gap-2 mt-4">
          {i > 0 && <BrutalButton tone="paper" className="py-3 px-5" onClick={() => { sfx.play('click'); setI(i - 1); }}>←</BrutalButton>}
          <BrutalButton tone="ink" className="py-3 flex-1" onClick={() => { if (last) finish(); else { sfx.play('click'); setI(i + 1); } }}>{last ? (first ? 'Let\'s go →' : 'Done') : 'Next →'}</BrutalButton>
        </div>
      </div>
    </div>
  );
};
