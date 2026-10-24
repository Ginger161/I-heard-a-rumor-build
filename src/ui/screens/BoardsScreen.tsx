import React, { useMemo, useState } from 'react';
import { BrutalButton, PaperGrain } from '../components/common';
import { sfx } from '../audio';
import { updateSettings, useSettings } from '../settings';
import {
  Challenge, Ranked, ScoreEntry, allTimeBoard, challengeBoard, crewBoard, dailyBoard, encodeBoard, playerId, weekBoard
} from '../../engine/scores';
import { DailyCase } from '../../engine/daily';
import { getTarget } from '../../engine/data/targets';
import { baseUrl } from '../shareCard';

// Leaderboards without a server. Scores travel as signed links and codes (WhatsApp, X, Instagram); opening one adds it here.
type Tab = 'TODAY' | 'WEEK' | 'ALL' | 'CREWS' | 'CHALLENGES';
const TABS: [Tab, string][] = [['TODAY', 'Today'], ['WEEK', 'This week'], ['ALL', 'All-time'], ['CREWS', 'Crews'], ['CHALLENGES', 'Challenges']];

const MEDAL = ['🥇', '🥈', '🥉'];
const ago = (at: number): string => {
  const d = Math.floor((Date.now() - at) / 86400000);
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d}d ago`;
};

const Row: React.FC<{ r: Ranked; me: string }> = ({ r, me }) => {
  const e = r.entry;
  const mine = e.pid === me;
  return (
    <li className={`flex items-center gap-3 border-2 rounded-lg px-3 py-2 ${mine ? 'border-[#8B0000] bg-[#FEE2E2]' : 'border-[#1A1A1A] bg-white'}`}>
      <div className="w-8 text-center font-black text-[15px]">{r.rank <= 3 ? MEDAL[r.rank - 1] : r.rank}</div>
      <div className="min-w-0 flex-1">
        <div className="font-black text-[13px] leading-tight truncate">{e.name}{mine ? ' (you)' : ''}{e.assisted ? ' • assisted' : ''}</div>
        <div className="text-[10px] font-sans text-slate-600 truncate">{e.crew ? `${e.crew} • ` : ''}{e.target} • Day {e.day}/{e.budget} • {'★'.repeat(e.stars)}{'☆'.repeat(3 - e.stars)} • {ago(e.at)}</div>
      </div>
      <div className="font-mono font-black text-[18px]">{e.score}</div>
    </li>
  );
};

interface Props {
  scores: ScoreEntry[];
  daily: DailyCase;
  dailyDone: boolean;
  onBack: () => void;
  onPlayDaily: () => void;
  onImport: (input: string) => { added: number; challenge: Challenge | null };
  onPlayChallenge: (c: Challenge) => void;
}

export const BoardsScreen: React.FC<Props> = ({ scores, daily, dailyDone, onBack, onPlayDaily, onImport, onPlayChallenge }) => {
  const settings = useSettings();
  // Open on Today when there are scores for today's case, otherwise on All-time, so a new board is never empty.
  const [tab, setTab] = useState<Tab>(() => (dailyBoard(scores, daily.dateKey).length ? 'TODAY' : 'ALL'));
  const [paste, setPaste] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [pendingChallenge, setPendingChallenge] = useState<Challenge | null>(null);
  const me = playerId();
  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(null), 3500); };

  const today = useMemo(() => dailyBoard(scores, daily.dateKey), [scores, daily.dateKey]);
  const week = useMemo(() => weekBoard(scores), [scores]);
  const all = useMemo(() => allTimeBoard(scores), [scores]);
  const crews = useMemo(() => crewBoard(scores), [scores]);
  const challenges = useMemo(() => {
    const keys = Array.from(new Set(scores.filter(e => e.kind === 'challenge' && e.score > 0).map(e => e.key)));
    return keys.map(k => ({ key: k, board: challengeBoard(scores, k) })).filter(c => c.board.length).sort((a, b) => b.board[0].entry.at - a.board[0].entry.at).slice(0, 12);
  }, [scores]);

  const shown: Ranked[] = tab === 'TODAY' ? today : tab === 'WEEK' ? week : all;

  const shareBoard = async () => {
    sfx.play('click');
    const list = (tab === 'CHALLENGES' ? scores : shown.map(r => r.entry)).slice(0, 25);
    if (!list.length) { flash('Nothing to share yet. Win a case first.'); return; }
    const link = `${baseUrl()}?s=${encodeBoard(list)}`;
    const text = `My I Heard A Rumor board (${list.length} scores). Open it to add them to yours and beat them: ${link}`;
    try { if (navigator.share) { await navigator.share({ text, url: link }); return; } } catch { /* fall back to copy */ }
    try { await navigator.clipboard.writeText(text); flash('Board link copied. Paste it in the group chat!'); } catch { flash('Could not copy the link.'); }
  };

  const doImport = () => {
    sfx.play('click');
    const r = onImport(paste);
    if (r.challenge) { setPendingChallenge(r.challenge); setPaste(''); return; }
    if (r.added > 0) { sfx.play('buy'); flash(`Added ${r.added} score${r.added > 1 ? 's' : ''} to your board.`); setPaste(''); }
    else flash(paste.trim() ? 'No new scores in that code. It may be invalid, or you already have them.' : 'Paste a score code or link first.');
  };

  const dailyTarget = getTarget(daily.targetId);

  return (
    <div className="relative flex-1 min-h-0 bg-[#EFEBE0] text-[#1A1A1A] font-serif flex flex-col overflow-hidden">
      <PaperGrain />
      <div className="relative flex-shrink-0 px-3.5 py-2.5 border-b-4 border-double border-[#1A1A1A] flex items-center gap-3">
        <button onClick={() => { sfx.play('click'); onBack(); }} aria-label="Back" className="w-11 h-11 rounded-full border-2 border-[#1A1A1A] bg-white font-black cursor-pointer flex-shrink-0">←</button>
        <div className="min-w-0">
          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-[#8B0000]">Compete</div>
          <h1 className="text-[18px] font-black uppercase tracking-tight leading-none">Leaderboards</h1>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-y-auto no-scrollbar p-3.5 flex flex-col gap-3">
        <div className="bg-[#F4F1EA] border-2 border-[#1A1A1A] rounded-lg p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B0000] mb-1.5">You on the boards</div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Name</span>
              <input value={settings.playerName} maxLength={20} onChange={e => updateSettings({ playerName: e.target.value })} placeholder="Anonymous" className="w-full border-2 border-[#1A1A1A] rounded px-2 py-1 text-[13px] font-sans bg-white" /></label>
            <label className="block"><span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Crew</span>
              <input value={settings.crew} maxLength={20} onChange={e => updateSettings({ crew: e.target.value })} placeholder="Lagos, UNILAG, my estate…" className="w-full border-2 border-[#1A1A1A] rounded px-2 py-1 text-[13px] font-sans bg-white" /></label>
          </div>
          <div className="text-[10px] font-sans text-slate-600 mt-1.5 leading-snug">Your name and crew go on the scores you share. Crews compete as a team: the average of their five best players.</div>
        </div>

        <div className="flex flex-wrap gap-1.5" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => { sfx.play('click'); setTab(id); }}
              className={`px-3 py-1.5 rounded-full border-2 border-[#1A1A1A] text-[11px] font-black uppercase tracking-wider cursor-pointer ${tab === id ? 'bg-[#1A1A1A] text-[#F4F1EA]' : 'bg-white'}`}>{label}</button>
          ))}
        </div>

        {tab === 'TODAY' && (
          <div className={`flex items-center gap-3 border-2 border-[#1A1A1A] rounded-lg px-3 py-2 ${dailyDone ? 'bg-[#D1FAE5]' : 'bg-[#FDE68A]'}`}>
            <span className="text-xl" aria-hidden>📅</span>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]/60">Today's case, the same for everyone</div>
              <div className="text-[13px] font-black leading-tight truncate">{dailyTarget.shortName}</div>
            </div>
            {dailyDone ? <span className="text-[10px] font-black uppercase text-[#065F46]">✓ Played</span> : <BrutalButton tone="ink" className="py-1.5 px-3 text-[11px]" onClick={onPlayDaily}>Play</BrutalButton>}
          </div>
        )}

        {(tab === 'TODAY' || tab === 'WEEK' || tab === 'ALL') && (
          shown.length === 0
            ? <div className="text-center text-[12px] font-sans text-slate-600 py-8">No scores here yet. Win a case, then share your score link, or add a friend's below.</div>
            : <ul className="flex flex-col gap-1.5">{shown.slice(0, 50).map(r => <Row key={r.entry.sig} r={r} me={me} />)}</ul>
        )}

        {tab === 'CREWS' && (
          crews.length === 0
            ? <div className="text-center text-[12px] font-sans text-slate-600 py-8">No crews yet. Set your crew above, win a case, and share your score.</div>
            : <ul className="flex flex-col gap-1.5">{crews.map((c, i) => (
                <li key={c.crew} className="flex items-center gap-3 border-2 border-[#1A1A1A] rounded-lg px-3 py-2 bg-white">
                  <div className="w-8 text-center font-black text-[15px]">{i < 3 ? MEDAL[i] : i + 1}</div>
                  <div className="min-w-0 flex-1"><div className="font-black text-[13px] truncate">{c.crew}</div><div className="text-[10px] font-sans text-slate-600">{c.players} player{c.players > 1 ? 's' : ''}</div></div>
                  <div className="font-mono font-black text-[18px]">{c.score}</div>
                </li>))}</ul>
        )}

        {tab === 'CHALLENGES' && (
          challenges.length === 0
            ? <div className="text-center text-[12px] font-sans text-slate-600 py-8">No challenges yet. Finish a win and tap "Challenge a friend", or open a friend's challenge link.</div>
            : <div className="flex flex-col gap-3">{challenges.map(c => (
                <div key={c.key}>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#8B0000] mb-1">{c.board[0].entry.target} • {c.board.length} player{c.board.length > 1 ? 's' : ''}</div>
                  <ul className="flex flex-col gap-1.5">{c.board.slice(0, 5).map(r => <Row key={r.entry.sig} r={r} me={me} />)}</ul>
                </div>))}</div>
        )}

        <div className="border-2 border-dashed border-[#1A1A1A] rounded-lg p-3 flex flex-col gap-2 bg-[#F4F1EA]">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B0000]">Add a friend's score</div>
          <textarea value={paste} onChange={e => setPaste(e.target.value)} rows={2} placeholder="Paste a score code, a board code or a link" aria-label="Score code" className="w-full border-2 border-[#1A1A1A] rounded px-2 py-1 text-[11px] font-mono bg-white resize-none" />
          <div className="flex gap-2">
            <BrutalButton tone="ink" className="flex-1 py-2" onClick={doImport}>Add to my board</BrutalButton>
            <BrutalButton tone="paper" className="flex-1 py-2" onClick={shareBoard}>Share this board</BrutalButton>
          </div>
          {note && <div role="status" className="text-[11px] font-bold text-[#065F46]">{note}</div>}
          <div className="text-[10px] font-sans text-slate-600 leading-snug">There is no server, so scores travel as links. Share yours in a group chat; when friends open the link, your score appears on their board, and theirs on yours. A "Share this board" link carries the whole list.</div>
        </div>
      </div>

      {pendingChallenge && (
        <ChallengeIntro challenge={pendingChallenge} onCancel={() => setPendingChallenge(null)} onPlay={() => { const c = pendingChallenge; setPendingChallenge(null); onPlayChallenge(c); }} />
      )}
    </div>
  );
};

// "Dayo challenged you": shown when a challenge link is opened or pasted.
export const ChallengeIntro: React.FC<{ challenge: Challenge; onPlay: () => void; onCancel: () => void }> = ({ challenge: c, onPlay, onCancel }) => {
  const t = getTarget(c.t);
  return (
    <div className="absolute inset-0 z-[110] bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
      <div role="dialog" aria-label="Challenge" className="relative w-full max-w-[380px] bg-[#FDE68A] border-4 border-[#1A1A1A] rounded-2xl shadow-[8px_8px_0px_#1A1A1A] p-5 animate-pop-in">
        <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#8B0000]">Challenge</div>
        <div className="font-serif font-black text-2xl leading-tight mt-1">{c.by} wants to see you try.</div>
        <p className="text-[13px] font-sans leading-snug mt-2">Take down <b>{t.shortName}</b> with the exact same case: same scandal, same news climate, same luck. No perks. {c.by} scored <b>{c.sc}</b> ({'★'.repeat(c.st)}{'☆'.repeat(3 - c.st)}) in {c.d} days.</p>
        <div className="flex flex-col gap-2 mt-4">
          <BrutalButton tone="crimson" onClick={() => { sfx.play('stamp'); onPlay(); }}>Accept the challenge</BrutalButton>
          <BrutalButton tone="paper" onClick={onCancel}>Not now</BrutalButton>
        </div>
      </div>
    </div>
  );
};
