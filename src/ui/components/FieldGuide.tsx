import React, { useEffect, useState } from 'react';
import { PaperGrain } from './common';
import { sfx } from '../audio';

// The Field Guide: every term in the game in plain words, with what it means for your next decision. The tutorial teaches
// the essentials in a few cards and points here for the rest, so nothing has to be crammed into the walkthrough.
export interface GuideEntry { id: string; group: string; icon: string; term: string; short: string; detail: string; tip?: string }

export const GUIDE: GuideEntry[] = [
  // ---- The goal
  { id: 'goal', group: 'The goal', icon: '🎯', term: 'How you win and lose', short: 'Get 75% of Nigeria to believe the story before the clock runs out.',
    detail: 'You win when 75% of the national population are Believers. You lose if Heat reaches 100% (raided), if the Target\'s Cover-Up reaches 100% (story spun), or if the days run out.',
    tip: 'Watch Heat and Cover-Up as much as Believers. Two of the three ways to lose have nothing to do with how many people believe you.' },
  { id: 'funnel', group: 'The goal', icon: '👥', term: 'Unaware → Heard → Believers', short: 'Every state\'s population moves through these stages.',
    detail: 'Unaware people have never heard it. Heard people know the rumour but are not convinced. Believers are convinced and count toward your 75%. A fourth group, Jaded, heard it but got bored and stopped caring.',
    tip: 'Velocity moves people from Unaware to Heard. Credibility moves them from Heard to Believers. You need both.' },

  // ---- Your three stats
  { id: 'velocity', group: 'Your three stats', icon: '⚡', term: 'Velocity', short: 'How fast the rumour spreads.',
    detail: 'Velocity is how quickly Unaware people become Heard, inside a state and across borders. Street and Social channels are the Velocity channels.',
    tip: 'Early on, Velocity is king: a rumour nobody has heard cannot be believed.' },
  { id: 'credibility', group: 'Your three stats', icon: '🧾', term: 'Credibility', short: 'How many listeners become Believers.',
    detail: 'Credibility turns Heard into Believers, shields states against Doubt, and slows the Target\'s Cover-Up. Press and Elite channels are the Credibility channels.',
    tip: 'If lots of people have heard it but few believe it, you are short on Credibility. Chain Press and Elite channels, or leak evidence.' },
  { id: 'notoriety', group: 'Your three stats', icon: '🔥', term: 'Notoriety', short: 'More sparks, but more Heat.',
    detail: 'Notoriety makes spark bubbles appear more often and worth more, which is your income. It also makes Heat rise faster every day, because the security services notice a loud page.',
    tip: 'Notoriety is a trade: the more you have, the richer and the hotter you get. Buy Defence before Heat passes 70.' },
  { id: 'synergy', group: 'Your three stats', icon: '✨', term: 'Synergy', short: 'Channels that fit your scandal work 35% harder.',
    detail: 'Every channel has tags. If one matches the scandal category you picked (Financial, Affair, Leaked Media, Fake Credentials), its Velocity and Credibility count 1.35x. Matching tags glow gold on the Conspiracy Board.',
    tip: 'When two channels cost about the same, buy the one with the gold tag.' },
  { id: 'lanes', group: 'Your three stats', icon: '🛤️', term: 'Lanes: Street, Social, Press, Elite', short: 'Four kinds of channel, each good at different states.',
    detail: 'Street (motor parks, markets) is cheap and fast. Social (WhatsApp, TikTok) is very fast but breeds Doubt without receipts. Press builds Credibility. Elite opens the powerful hubs. Each Target is weak to one lane (x1.25) and resists another (x0.75).',
    tip: 'The Case File lists the Target\'s weak and resisted lanes. Lean on the weak one.' },

  // ---- States and spread
  { id: 'tags', group: 'States and spread', icon: '🗺️', term: 'State types', short: 'Grassroots, Hyper-online and Elite hubs behave differently.',
    detail: 'Grassroots states (most of the country) spread by word of mouth: Street channels help most and Doubt grows slowly. Hyper-online states (Lagos, Rivers, Enugu, Oyo, Abuja) love Social channels but demand receipts fast, so Doubt grows quickly. Elite hubs (the big power centres) hardly listen to street gossip until you have chained two Press or Elite channels.',
    tip: 'Tap any state to see its type, and its Doubt, before you decide where to push.' },
  { id: 'doubt', group: 'States and spread', icon: '🤨', term: 'Doubt', short: 'How sceptical a state is of your story.',
    detail: 'Doubt starts at a level that depends on the state and the Target, then changes every day. It rises when you spread hype with no proof (especially Social channels) and when the Target\'s Cover-Up is strong. It falls with Credibility and evidence. High Doubt blocks people from becoming Believers.',
    tip: 'Doubt above 65% is a warning. Leak evidence: it cuts Doubt in every state at once.' },
  { id: 'jaded', group: 'States and spread', icon: '😴', term: 'Gist fatigue (Jaded)', short: 'People who got bored and stopped passing it on.',
    detail: 'If a state stays at high Doubt for a couple of days, a slice of the people who heard it turn Jaded. They stop spreading the story and cannot become Believers. Genuine evidence wins them back.',
    tip: 'Grey on the map means fatigue. Do not let it build: drop evidence before it does.' },
  { id: 'highways', group: 'States and spread', icon: '🛣️', term: 'Highways', short: 'A rumour jumps across land borders.',
    detail: 'A state that has reached enough people can pass the rumour to its neighbours each day. Higher Velocity makes the jump likelier. Where you plant the first seed decides which neighbours catch it first.',
    tip: 'Seed a big state in the middle of the map to give yourself the most neighbours.' },
  { id: 'flights', group: 'States and spread', icon: '✈️', term: 'Flights', short: 'Five airport cities can jump the rumour across the country.',
    detail: 'Lagos, Abuja, Kano, Port Harcourt and Enugu have airports. Once one is well informed and you own a Social or Press channel, it can send the rumour to the other airport cities, shown as dashed arcs on the map.',
    tip: 'Reaching two or three hubs early often wins the map.' },
  { id: 'freshness', group: 'States and spread', icon: '🥬', term: 'Story Freshness', short: 'How alive the story is in the news cycle.',
    detail: 'Freshness fades every day. A stale story makes all your channels up to 45% weaker (the screen also drains of colour). New evidence, new channels and milestones refresh it; the Target\'s distractions drain it.',
    tip: 'When the Freshness bar is low, spend on something new rather than waiting.' },

  // ---- Money and bubbles
  { id: 'sparks', group: 'Sparks and bubbles', icon: '💰', term: 'Sparks (⚡)', short: 'Your money.',
    detail: 'You earn sparks by tapping bubbles on the map. The first time the rumour reaches a state you get a guaranteed bubble (bigger in bigger states). More appear at random, more often with Notoriety. Spend sparks on channels, evidence and defence.',
    tip: 'Unpopped bubbles expire. Tap them as they appear.' },
  { id: 'golden', group: 'Sparks and bubbles', icon: '🌟', term: 'Golden sparks', short: 'A rare jackpot worth triple.',
    detail: 'About one random spark in fourteen is golden and worth three times as much. It also fades quickly.' },
  { id: 'spin', group: 'Sparks and bubbles', icon: '🫧', term: 'Spin bubbles', short: 'The Target\'s PR team, trying to plant doubt.',
    detail: 'Dark Spin bubbles appear during the Target\'s counter-offensives. Tap them before they detonate. A detonation raises Doubt in that state and its neighbours and adds to the Cover-Up.',
    tip: 'Popping Spin bubbles is worth more than grabbing a small spark.' },

  // ---- Danger
  { id: 'heat', group: 'Dangers', icon: '🚨', term: 'Heat', short: 'How close the security services are.',
    detail: 'Heat rises every day, faster with Notoriety, when you leak evidence and when the Target calls in favours. At 40%, 70% and 90% warnings arrive. At 100% your safehouse is raided and you lose.',
    tip: 'Defence desk items cool Heat. Buy the cheap ones early and keep the big one for emergencies.' },
  { id: 'coverup', group: 'Dangers', icon: '🧱', term: 'Cover-Up', short: 'The Target\'s spin machine.',
    detail: 'Cover-Up grows every day, faster the more people believe you and slower with high Credibility. Target moves and detonated Spin bubbles add to it. At 100% the story is dead. Genuine evidence pushes it back; forgeries do a little but can backfire.',
    tip: 'If Cover-Up is racing ahead of Believers, stop spreading and start leaking evidence.' },
  { id: 'abilities', group: 'Dangers', icon: '🥊', term: 'Target moves', short: 'Each Target fights back in their own way.',
    detail: 'Every Target has a few moves on a schedule: freeze one of your channels, distract the news, add Heat, add Cover-Up or release a bot swarm. They also have a style (how they defend) and a temperament (how they behave when you push). The Case File lists them all.',
    tip: 'Tap the Cover-Up bar any time to read the Target\'s file.' },
  { id: 'evidence', group: 'Dangers', icon: '📁', term: 'Evidence', short: 'Receipts that turn gossip into belief.',
    detail: 'The investigation fills a little every day, unlocking four tiers of genuine evidence. Each cuts Doubt nationwide, pushes Cover-Up back, refreshes the story and wins back Jaded people, at the price of some Heat. Forgeries are available immediately and cost less, but they can be exposed, which adds Doubt, Heat and Cover-Up.',
    tip: 'Verified beats forged unless you are desperate.' },
  { id: 'defense', group: 'Dangers', icon: '🛡️', term: 'Defence', short: 'Spend sparks to stay free and break the Target\'s tricks.',
    detail: 'Defence items cool Heat, block injunctions (which freeze your channels), neutralise Spin bubbles and speed up the investigation.',
    tip: 'An injunction counter also thaws frozen channels.' },

  // ---- Surprises
  { id: 'events', group: 'Surprises', icon: '🎲', term: 'Random events', short: 'News happens: blackouts, strikes, tips, scandals.',
    detail: 'Every few days a decision card appears: a blackout in one zone, a strike, a celebrity wedding, an informant\'s tip. Read it and choose. There is always a free option, and the costly ones usually pay off. Events are random, but the same options always do the same thing.',
    tip: 'Cards pause the clock, so take your time.' },
  { id: 'climate', group: 'Surprises', icon: '⛅', term: 'News climate', short: 'The season changes the rules for the whole case.',
    detail: 'Each case rolls a climate such as Harmattan, Rainy Season, Election Year or Fuel Scarcity. It nudges lane strength, how far the rumour travels, Heat or how fast the story goes stale. The forecast is on the Dossier before you start and the chip is on your HUD.',
    tip: 'Pick Targets that suit the weather.' },

  // ---- Progress
  { id: 'progress', group: 'Progress', icon: '⭐', term: 'Stars, envelopes and perks', short: 'Win faster and cleaner for more stars.',
    detail: 'Every win earns Brown Envelopes. Win quickly with low Heat for two stars, and very quickly with low Heat and no exposed forgeries for three. Envelopes buy perks and unseal harder Targets. Four stars in a tier opens the next.',
    tip: 'Assist Mode (Settings) gives you more time per day if you want it.' }
];

interface Props { focus?: string | null; onClose: () => void }

export const FieldGuide: React.FC<Props> = ({ focus, onClose }) => {
  const [open, setOpen] = useState<string | null>(focus ?? 'goal');
  useEffect(() => { if (focus) setOpen(focus); }, [focus]);
  const groups = Array.from(new Set(GUIDE.map(g => g.group)));

  return (
    <div className="absolute inset-0 z-[95] bg-[#1A1A1A]/75 backdrop-blur-sm flex items-end justify-center animate-fade-in desk-wrap" onClick={onClose}>
      <div role="dialog" aria-label="Field Guide" onClick={e => e.stopPropagation()} className="relative w-full max-h-[92%] bg-[#F4F1EA] border-t-4 border-x-4 border-[#1A1A1A] rounded-t-2xl flex flex-col animate-slide-up overflow-hidden desk-sheet">
        <PaperGrain />
        <div className="relative flex items-center justify-between px-4 pt-3 pb-2 border-b-2 border-[#1A1A1A] flex-shrink-0">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B0000]">Reference</div>
            <div className="font-serif font-black text-xl leading-none">Field Guide</div>
          </div>
          <button onClick={onClose} aria-label="Close field guide" className="w-11 h-11 rounded-full border-2 border-[#1A1A1A] bg-white font-black cursor-pointer">✕</button>
        </div>
        <div className="relative overflow-y-auto no-scrollbar p-3 flex flex-col gap-3">
          {groups.map(group => (
            <div key={group}>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8B0000] mb-1.5">{group}</div>
              <div className="flex flex-col gap-1.5">
                {GUIDE.filter(g => g.group === group).map(g => {
                  const isOpen = open === g.id;
                  return (
                    <div key={g.id} className={`border-2 border-[#1A1A1A] rounded-lg bg-white ${isOpen ? 'shadow-[3px_3px_0px_#1A1A1A]' : ''}`}>
                      <button
                        onClick={() => { sfx.play('click'); setOpen(isOpen ? null : g.id); }}
                        aria-expanded={isOpen}
                        className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 cursor-pointer"
                      >
                        <span className="text-lg flex-shrink-0" aria-hidden>{g.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-black leading-tight">{g.term}</span>
                          <span className="block text-[11px] font-sans text-slate-600 leading-snug">{g.short}</span>
                        </span>
                        <span className="text-[11px] font-black" aria-hidden>{isOpen ? '–' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 pt-0.5 animate-fade-in">
                          <p className="text-[12px] font-sans leading-snug">{g.detail}</p>
                          {g.tip && <p className="text-[11px] font-sans font-bold text-[#92400E] mt-1.5 leading-snug">💡 {g.tip}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
