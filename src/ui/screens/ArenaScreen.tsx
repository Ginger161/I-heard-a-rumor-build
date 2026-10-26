import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { ArenaEntry, ARENA_WIN_REWARD, TEMPLATES, decodeTarget, encodeTarget, getArena, getArenaVersion, newArenaDef, removeEntry, shareLink, subscribeArena, summarize, updateArena } from '../../engine/arena';
import { runBotCheck } from '../../engine/botCheck';
import type { TargetDef } from '../../engine/data/targetPacks';
import { getTarget } from '../../engine/data/targets';
import { BrutalButton } from '../components/common';
import { Avatar } from '../components/Silhouette';
import { sfx } from '../audio';
import { useSettings } from '../settings';
import { CreatorScreen, Shell } from './CreatorScreen';

// THE ARENA: where players build Targets and take on each other's. Everything here works with no server: a Target travels as a code
// or link, and is always re-checked by the bot check on the phone that receives it.
type View = { kind: 'hub' } | { kind: 'templates' } | { kind: 'create'; def: TargetDef };

const CARD = 'bg-[var(--m-surface)] border-2 border-[var(--m-line)] rounded-lg shadow-[2px_2px_0px_var(--m-line)]';

const RatingChip: React.FC<{ e: ArenaEntry }> = ({ e }) => e.check
  ? <span className="text-[10px] font-sans font-black bg-[var(--m-sunk)] text-[var(--m-ink)] px-1.5 py-0.5 rounded-sm tracking-wider">PR {e.check.rating} • T{e.check.tier}</span>
  : <span className="text-[10px] font-sans font-black bg-[#FEF3C7] text-[#1A1A1A] border border-[var(--m-line)] px-1.5 py-0.5 rounded-sm tracking-wider">NOT TESTED</span>;

interface Props {
  envelopes: number;
  spendEnvelopes: (n: number) => boolean;
  onPlay: (targetId: string) => void;
  onBack: () => void;
  initialCode?: string | null;      // a ?t= link was opened
}

export const ArenaScreen: React.FC<Props> = ({ envelopes, spendEnvelopes, onPlay, onBack, initialCode }) => {
  useSyncExternalStore(subscribeArena, getArenaVersion, getArenaVersion);
  const arena = getArena();
  const settings = useSettings();
  const [view, setView] = useState<View>({ kind: 'hub' });
  const [code, setCode] = useState(initialCode ?? '');
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ text: string; good: boolean } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const author = settings.playerName || 'A Gist Lord';

  const say = (text: string, good = true) => { setNote({ text, good }); setTimeout(() => setNote(null), 4200); };

  const addFromCode = async () => {
    sfx.play('click');
    const raw = code.includes('?t=') ? code.slice(code.indexOf('?t=') + 3) : code;
    setBusy('Reading the code…');
    const d = await decodeTarget(raw);
    if (!d.def) { setBusy(null); say(d.errors.join(' '), false); return; }
    if (getArena().shelf.some(e => e.def.id === d.def!.id) || getArena().mine.some(e => e.def.fullName === d.def!.fullName && e.def.author === d.def!.author)) { setBusy(null); say('You already have this Target.', false); return; }
    setBusy('30 bots are testing it…');
    const r = await runBotCheck(d.def, { runs: 10 });
    setBusy(null);
    if (!r.ok) { say(r.errors.slice(0, 2).join(' '), false); return; }
    if (r.verdict === 'too_hard') { say(`${d.def.shortName} is too hard to be fair (the best bot plan wins ${r.best}%), so it was not added.`, false); return; }
    const now = Date.now();
    updateArena(a => ({ ...a, shelf: [{ def: d.def!, check: summarize(r), published: true, createdAt: now, updatedAt: now }, ...a.shelf] }));
    setCode('');
    sfx.play('win');
    say(`${d.def.shortName} added to the shelf. PR ${r.rating}.`);
  };

  const share = async (e: ArenaEntry) => {
    sfx.play('click');
    const link = shareLink(await encodeTarget(e.def));
    const text = `Can you beat ${e.def.shortName} in I Heard A Rumor?${e.check ? ` PR ${e.check.rating}` : ''}`;
    try { if (navigator.share) { await navigator.share({ text, url: link }); return; } } catch { /* fall back to copy */ }
    try { await navigator.clipboard.writeText(`${text}\n${link}`); say('Link copied. Paste it anywhere!'); } catch { say('Could not copy.', false); }
  };

  // A shared link was opened: add the Target at once.
  useEffect(() => { if (initialCode) void addFromCode(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (view.kind === 'create') {
    return <CreatorScreen initial={view.def} profileEnvelopes={envelopes} spendEnvelopes={spendEnvelopes} onClose={() => setView({ kind: 'hub' })} onPlay={onPlay} />;
  }

  if (view.kind === 'templates') {
    return (
      <Shell title="Pick a starting point" onBack={() => setView({ kind: 'hub' })} envelopes={envelopes}>
        <div className="flex flex-col gap-2.5 pt-2">
          <p className="text-[13px] font-sans text-[var(--m-ink)]/75">Start from one of these and change anything, or begin with a blank page.</p>
          {TEMPLATES.map(t => (
            <button key={t.name} onClick={() => { sfx.play('click'); setView({ kind: 'create', def: t.make(author) }); }} className={`${CARD} text-left p-3 cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none min-h-[56px]`}>
              <div className="font-serif font-black text-[17px] leading-tight">{t.name}</div>
              <div className="text-[12px] font-sans text-[var(--m-ink)]/72 leading-snug">{t.blurb}</div>
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  const Row: React.FC<{ e: ArenaEntry; mine: boolean }> = ({ e, mine }) => {
    const r = arena.results[e.def.id];
    const isOpen = open === e.def.id;
    const t = getTarget(e.def.id);
    return (
      <div className={`${CARD} p-2.5`}>
        <div className="flex gap-3 items-center">
          <div className="w-14 h-[70px] flex-shrink-0 bg-[#2B2470] border-2 border-[var(--m-line)] rounded-md overflow-hidden"><Avatar target={t} emotion={r?.wins ? 'DEFEATED' : 'SMUG'} className="w-full h-full" /></div>
          <div className="min-w-0 flex-1">
            <div className="font-black text-[14px] leading-tight truncate">{e.def.fullName || 'Untitled'}</div>
            <div className="text-[11px] font-sans text-[var(--m-ink)]/72 truncate">{e.def.title}{e.def.author ? ` • by ${e.def.author}` : ''}</div>
            <div className="flex flex-wrap gap-1 mt-1 items-center">
              <RatingChip e={e} />
              {mine && <span className="text-[10px] font-sans font-black px-1.5 py-0.5 rounded-sm border border-[var(--m-line)] bg-[var(--m-surface2)]">{e.published ? 'PUBLISHED' : 'DRAFT'}</span>}
              {r && <span className="text-[10px] font-sans font-bold text-[var(--m-ink)]/72">{r.wins}/{r.plays} won{r.bestDay ? ` • best day ${r.bestDay}` : ''}</span>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-2.5">
          {(!mine || e.check) && (!mine || e.check?.verdict !== 'too_hard')
            ? <BrutalButton tone="ink" className="py-2.5" onClick={() => onPlay(e.def.id)}>▶ Play</BrutalButton>
            : <BrutalButton tone="paper" className="py-2.5" disabled>▶ Test first</BrutalButton>}
          {mine ? <BrutalButton tone="paper" className="py-2.5" onClick={() => { sfx.play('click'); setView({ kind: 'create', def: e.def }); }}>✏️ Edit</BrutalButton>
                : <BrutalButton tone="paper" className="py-2.5" onClick={() => { sfx.play('click'); setOpen(isOpen ? null : e.def.id); }}>💡 Tips</BrutalButton>}
          {mine && e.published ? <BrutalButton tone="green" className="py-2.5" onClick={() => share(e)}>📤 Share</BrutalButton>
                : <BrutalButton tone="paper" className="py-2.5" onClick={() => { sfx.play('click'); setConfirmDelete(e.def.id); }}>🗑 Delete</BrutalButton>}
        </div>
        {mine && e.published && (
          <div className="flex gap-3 mt-1">
            <button onClick={() => { sfx.play('click'); setOpen(isOpen ? null : e.def.id); }} className="min-h-[44px] text-[12px] font-black uppercase underline cursor-pointer">💡 Tips</button>
            <button onClick={() => { sfx.play('click'); setConfirmDelete(e.def.id); }} className="min-h-[44px] text-[12px] font-black uppercase underline text-[var(--m-accent-text)] cursor-pointer">🗑 Delete</button>
          </div>
        )}
        {isOpen && (
          <div className="mt-1.5 bg-[var(--m-surface2)] border-2 border-[var(--m-line)]/30 rounded-md p-2.5">
            {e.check ? (
              <>
                <div className="text-[11px] font-black uppercase tracking-wider text-[var(--m-accent-text)] mb-1">How to beat {e.def.shortName}</div>
                <ul className="list-disc pl-4 text-[12px] font-sans leading-snug flex flex-col gap-1">{e.check.tips.map(x => <li key={x}>{x}</li>)}</ul>
                <div className="text-[11px] font-sans text-[var(--m-ink)]/72 mt-1.5">Difficulty {Math.round(e.check.difficulty)}/100 • best bot plan won {e.check.best}%.</div>
              </>
            ) : <div className="text-[12px] font-sans">Test it in the Creator to get tips.</div>}
          </div>
        )}
        {confirmDelete === e.def.id && (
          <div className="mt-2 flex items-center gap-2 bg-[#FEF2F2] text-[#1A1A1A] border-2 border-[#8B0000] rounded-md p-2">
            <span className="text-[12px] font-bold flex-1">Delete {e.def.shortName || 'this Target'} for good?</span>
            <button onClick={() => { removeEntry(e.def.id); setConfirmDelete(null); }} className="min-h-[44px] px-3 text-[12px] font-black uppercase bg-[var(--m-accent)] text-white rounded cursor-pointer">Delete</button>
            <button onClick={() => setConfirmDelete(null)} className="min-h-[44px] px-3 text-[12px] font-black uppercase bg-[var(--m-surface2)] border-2 border-[var(--m-line)] rounded cursor-pointer">Keep</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Shell title="The Arena" onBack={onBack} envelopes={envelopes}>
      <div className="flex flex-col gap-3 pt-2">
        <div className="bg-[var(--m-sunk)] text-[var(--m-ink)] border-4 border-[var(--m-line)] rounded-2xl p-4 shadow-[5px_5px_0px_var(--m-accent)]">
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--m-accent2)]">⚔️ Player vs Player</div>
          <div className="font-serif font-black text-[26px] leading-[0.98] uppercase mt-1">Build the Target.<br />Beat their Target.</div>
          <p className="text-[13px] font-sans leading-snug text-[var(--m-ink)]/85 mt-2">Design your own Target with your own scandal, powers and tricks. Thirty bots test it so it is fair, and your friends try to take it down.</p>
          <div className="mt-3"><BrutalButton tone="paper" className="w-full min-h-[52px] text-[15px]" onClick={() => { sfx.play('click'); setView({ kind: 'templates' }); }}>🛠 Create a Target</BrutalButton></div>
        </div>

        <div className={`${CARD} p-3`}>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--m-ink)]/72 mb-1">Got a Target code or link?</div>
          <textarea value={code} onChange={ev => setCode(ev.target.value)} placeholder="Paste it here" className="w-full bg-[var(--m-surface2)] border-2 border-[var(--m-line)] rounded-md px-3 py-2 text-[13px] font-mono h-[64px] resize-none outline-none focus:border-[var(--m-accent)]" />
          <div className="mt-2"><BrutalButton tone="ink" disabled={!code.trim() || !!busy} onClick={addFromCode}>{busy ?? '➕ Add to my shelf'}</BrutalButton></div>
          <div className="text-[11px] font-sans text-[var(--m-ink)]/72 mt-1.5">Every Target is tested again on your phone before it is added. Beat one for the first time: +{ARENA_WIN_REWARD} ✉️.</div>
        </div>
        {note && <div role="status" className={`border-2 rounded-lg px-3 py-2 text-[13px] font-bold ${note.good ? 'border-[#065F46] bg-[#ECFDF5] text-[#065F46]' : 'border-[#8B0000] bg-[#FEF2F2] text-[#1A1A1A] text-[var(--m-accent-text)]'}`}>{note.text}</div>}

        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] mb-1.5">My Targets ({arena.mine.length})</div>
          {arena.mine.length === 0 ? <div className="text-[12px] font-sans text-[var(--m-ink)]/72 border-2 border-dashed border-[var(--m-line)]/30 rounded-lg p-3">Nothing yet. Create your first Target above.</div>
            : <div className="flex flex-col gap-2.5">{arena.mine.map(e => <Row key={e.def.id} e={e} mine />)}</div>}
        </div>
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] mb-1.5">From friends ({arena.shelf.length})</div>
          {arena.shelf.length === 0 ? <div className="text-[12px] font-sans text-[var(--m-ink)]/72 border-2 border-dashed border-[var(--m-line)]/30 rounded-lg p-3">Targets your friends send you show up here.</div>
            : <div className="flex flex-col gap-2.5">{arena.shelf.map(e => <Row key={e.def.id} e={e} mine={false} />)}</div>}
        </div>
      </div>
    </Shell>
  );
};
