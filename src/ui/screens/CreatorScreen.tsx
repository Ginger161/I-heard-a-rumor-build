import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ABILITY_KINDS, ABILITY_RANGE, BRANCHES, DEFENSE_STYLES, SILHOUETTES, TEMPERAMENTS, TargetDef, builtInIds, validateTargetDef } from '../../engine/data/targetPacks';
import { ABILITY_LABEL, ABILITY_WORDS, DEFENSE_LABEL, PLAY_STYLE_PRESETS, PlayStylePreset, TEMPERAMENT_LABEL, defaultAbility } from '../../engine/data/arenaPresets';
import { STYLE_TEXT, TEMPERAMENT_TEXT, SCANDALS, TIER_INFO } from '../../engine/data/targets';
import { SCANDAL_CATEGORIES } from '../../engine/data/targets';
import { CLIMATES } from '../../engine/data/climates';
import { EVENTS } from '../../engine/events';
import { ZONE_IDS, ZONE_NAMES } from '../../engine/data/zones';
import { BotReport, FAIR_FLOOR, EaseSuggestion, describeChanges, runBotCheck, suggestEase } from '../../engine/botCheck';
import { ArenaEntry, creationFee, summarize, upsertMine, findEntry, encodeTarget, shareLink } from '../../engine/arena';
import type { AbilityDef, Tier, SilhouetteKind } from '../../engine/data/targetTypes';
import { BrutalButton, PaperGrain } from '../components/common';
import { Avatar } from '../components/Silhouette';
import { sfx } from '../audio';
import { useSettings } from '../settings';
import { getTarget } from '../../engine/data/targets';

// THE CREATOR: a guided build in six steps. Every choice is an ordinary dial the engine already has, the words are the player's own,
// and the bot check can be run at any time, so nobody has to ask anyone whether their Target is fair.
const STEPS = ['Who', 'Pressure', 'Fighting style', 'Powers', 'World', 'Test'] as const;

const INPUT = 'w-full bg-[var(--m-surface2)] border-2 border-[var(--m-line)] rounded-md px-3 py-2.5 text-[14px] font-sans min-h-[44px] outline-none focus:border-[var(--m-accent)]';
const LABEL = 'block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--m-ink)]/72 mb-1';
const CARD = 'bg-[var(--m-surface)] border-2 border-[var(--m-line)] rounded-lg p-3';
const CHIP = (on: boolean) => `min-h-[44px] px-2.5 py-1.5 rounded-lg border-2 border-[var(--m-line)] text-[12px] font-black leading-tight text-left cursor-pointer transition-all ${on ? 'bg-[var(--m-accent)] text-[var(--m-accent-ink)] shadow-[2px_2px_0px_var(--m-accent2)]' : 'bg-[var(--m-surface2)] text-[var(--m-ink)] shadow-[2px_2px_0px_var(--m-line)]'}`;

const Field: React.FC<{ label: string; value: string; max: number; onChange: (v: string) => void; area?: boolean; placeholder?: string }> = ({ label, value, max, onChange, area, placeholder }) => (
  <label className="block">
    <span className={LABEL}>{label} <span className="text-[var(--m-ink)]/72 normal-case tracking-normal">{value.length}/{max}</span></span>
    {area
      ? <textarea className={`${INPUT} resize-none h-[72px]`} value={value} maxLength={max} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      : <input className={INPUT} value={value} maxLength={max} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}
  </label>
);

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }> = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
  <label className="block">
    <span className="flex justify-between text-[11px] font-black uppercase tracking-wider text-[var(--m-ink)]/72"><span>{label}</span><span className="text-[var(--m-accent-text)]">{value}{unit}</span></span>
    <input type="range" className="w-full h-9 accent-[var(--m-accent)] cursor-pointer" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
  </label>
);

// The dials a play-style preset sets, as sliders for fine-tuning.
const DIALS: { key: 'heatRate' | 'coverUpRate' | 'doubtRate' | 'staleRate' | 'doubtFlat' | 'doubtAdd' | 'counterHeat' | 'days' | 'forgeryRisk'; name: string; min: number; max: number; step: number; neutral: number; unit?: string }[] = [
  { key: 'heatRate', name: 'Heat builds', min: 0.7, max: 2, step: 0.05, neutral: 1, unit: '×' },
  { key: 'coverUpRate', name: 'Cover-Up builds', min: 0.7, max: 2, step: 0.05, neutral: 1, unit: '×' },
  { key: 'doubtRate', name: 'Doubt builds', min: 0.8, max: 2.2, step: 0.05, neutral: 1, unit: '×' },
  { key: 'staleRate', name: 'Story goes stale', min: 0.8, max: 1.5, step: 0.05, neutral: 1, unit: '×' },
  { key: 'doubtFlat', name: 'Everyone starts doubting at', min: 0, max: 60, step: 1, neutral: 0, unit: '%' },
  { key: 'doubtAdd', name: 'Extra starting Doubt', min: 0, max: 20, step: 1, neutral: 0, unit: '%' },
  { key: 'counterHeat', name: 'Heat on each counter-move', min: 0, max: 15, step: 1, neutral: 0, unit: '%' },
  { key: 'days', name: 'Days on the clock', min: -14, max: 6, step: 1, neutral: 0, unit: '' },
  { key: 'forgeryRisk', name: 'Forgery backfire risk', min: 0, max: 0.4, step: 0.01, neutral: 0, unit: '' }
];

const hash = (d: TargetDef) => JSON.stringify(d);

interface Props {
  profileEnvelopes: number;
  spendEnvelopes: (n: number) => boolean;
  initial: TargetDef;
  onClose: () => void;
  onPlay: (id: string) => void;
}

export const CreatorScreen: React.FC<Props> = ({ profileEnvelopes, spendEnvelopes, initial, onClose, onPlay }) => {
  const settings = useSettings();
  const [draft, setDraft] = useState<TargetDef>(initial);
  const [step, setStep] = useState(0);
  const [presetId, setPresetId] = useState<string | null>(null);
  const [report, setReport] = useState<BotReport | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ p: number; label: string } | null>(null);
  const [fix, setFix] = useState<EaseSuggestion | 'none' | null>(null);
  const [done, setDone] = useState<{ code: string; id: string; paid: number } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const existing = findEntry(initial.id);
  const wasPublished = !!existing?.published;

  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [step]);
  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(null), 2800); };

  const set = (patch: Partial<TargetDef>) => setDraft(d => ({ ...d, ...patch }));
  const setMods = (patch: Partial<TargetDef['mods']>) => setDraft(d => { const mods = { ...d.mods, ...patch }; (Object.keys(mods) as (keyof typeof mods)[]).forEach(k => { if (mods[k] === undefined) delete mods[k]; }); return { ...d, mods }; });
  const setAi = (patch: Partial<TargetDef['ai']>) => setDraft(d => ({ ...d, ai: { ...d.ai, ...patch } }));
  const setAbility = (i: number, patch: Partial<AbilityDef>) => setDraft(d => ({ ...d, abilities: d.abilities.map((a, j) => (j === i ? { ...a, ...patch } : a)) }));

  const validation = useMemo(() => validateTargetDef({ ...draft, kind: 'PLAYER' }, { builtInIds: builtInIds() }), [draft]);
  const stale = report !== null && checkedAt !== hash(draft);
  const portrait = useMemo(() => ({ ...getTarget('slay_queen'), id: draft.id, silhouette: draft.avatar.silhouette, avatar: { accent: draft.avatar.accent }, shortName: draft.shortName }), [draft.id, draft.avatar.silhouette, draft.avatar.accent, draft.shortName]);

  const applyPreset = (p: PlayStylePreset) => {
    sfx.play('click');
    setPresetId(p.id);
    setDraft(d => {
      const clear: Partial<TargetDef['mods']> = { heatRate: undefined, coverUpRate: undefined, doubtRate: undefined, staleRate: undefined, doubtFlat: undefined, doubtAdd: undefined, counterHeat: undefined, days: undefined, forgeryRisk: undefined, eliteFriction: undefined, tagDoubt: undefined, zoneDoubt: undefined, spinHubs: undefined };
      const mods = { ...d.mods, ...clear, ...JSON.parse(JSON.stringify(p.mods)) } as TargetDef['mods'];
      (Object.keys(mods) as (keyof typeof mods)[]).forEach(k => { if (mods[k] === undefined) delete mods[k]; });
      return { ...d, mods };
    });
  };

  const runCheck = async () => {
    sfx.play('click');
    setFix(null);
    setProgress({ p: 0, label: '30 bots are playing your Target…' });
    const snapshot = hash(draft);
    const r = await runBotCheck(draft, { runs: 12, onProgress: p => setProgress({ p, label: '30 bots are playing your Target…' }) });
    setProgress(null);
    setReport(r);
    setCheckedAt(snapshot);
    sfx.play(r.ok && r.verdict !== 'too_hard' ? 'win' : 'warn');
  };

  const makeFair = async () => {
    sfx.play('click');
    setProgress({ p: 0, label: 'Looking for a fair version…' });
    const s = await suggestEase(draft, (p, label) => setProgress({ p, label }));
    setProgress(null);
    setFix(s ?? 'none');
  };
  const acceptFix = () => {
    if (!fix || fix === 'none') return;
    sfx.play('click');
    setDraft(fix.def);
    setReport(fix.report);
    setCheckedAt(hash(fix.def));
    setPresetId(null);
    setFix(null);
  };

  const fee = report?.ok ? (wasPublished ? 0 : creationFee(draft, report)) : 0;
  const canPublish = !!report && report.ok && !stale && report.verdict !== 'too_hard' && validation.errors.length === 0 && profileEnvelopes >= fee;

  const saveDraft = () => {
    const entry: ArenaEntry = { def: { ...draft, kind: 'PLAYER' }, check: report?.ok && !stale ? summarize(report) : existing?.check, published: wasPublished, createdAt: existing?.createdAt ?? Date.now(), updatedAt: Date.now() };
    upsertMine(entry);
    flash('Saved to My Targets.');
  };

  const publish = async () => {
    if (!canPublish || !report) return;
    if (fee > 0 && !spendEnvelopes(fee)) { flash('Not enough envelopes.'); return; }
    const entry: ArenaEntry = { def: { ...draft, kind: 'PLAYER' }, check: summarize(report), published: true, createdAt: existing?.createdAt ?? Date.now(), updatedAt: Date.now() };
    upsertMine(entry);
    sfx.play('win');
    setDone({ code: await encodeTarget(entry.def), id: draft.id, paid: fee });
  };

  const share = async (code: string) => {
    sfx.play('click');
    const link = shareLink(code);
    const text = `Can you beat ${draft.shortName} in I Heard A Rumor? PR ${report?.rating ?? ''}`;
    try { if (navigator.share) { await navigator.share({ text, url: link }); return; } } catch { /* fall back to copy */ }
    try { await navigator.clipboard.writeText(`${text}\n${link}`); flash('Link copied. Paste it anywhere!'); } catch { flash('Could not copy.'); }
  };

  // ------------------------------------------------------------------------------------------------ published
  if (done) {
    return (
      <Shell title="Published!" onBack={onClose} envelopes={profileEnvelopes - 0}>
        <div className="flex flex-col gap-3 items-center text-center pt-4">
          <div className="w-32 h-40 bg-[#2B2470] border-4 border-[var(--m-line)] rounded-lg shadow-[4px_4px_0px_#8B0000] overflow-hidden -rotate-2"><Avatar target={getTarget(done.id)} emotion="SMUG" className="w-full h-full" /></div>
          <div className="font-serif font-black text-2xl leading-tight">{draft.fullName}</div>
          <div className="text-[13px] font-sans font-bold">PR {report?.rating} • Tier {report?.tier}{done.paid ? ` • cost ${done.paid} ✉️` : ''}</div>
          <p className="text-[13px] font-sans text-[var(--m-ink)]/75 max-w-[300px]">It is in My Targets and ready to share. Anyone who has the code can try to take it down.</p>
          <div className="w-full flex flex-col gap-2">
            <BrutalButton tone="green" onClick={() => share(done.code)}>📤 Share it</BrutalButton>
            <BrutalButton tone="ink" onClick={() => onPlay(done.id)}>▶ Play it yourself</BrutalButton>
            <BrutalButton tone="paper" onClick={onClose}>Back to the Arena</BrutalButton>
          </div>
          {note && <div role="status" className="text-[12px] font-bold text-[#065F46]">{note}</div>}
        </div>
      </Shell>
    );
  }

  // ------------------------------------------------------------------------------------------------ steps
  const stepBody = (() => {
    switch (step) {
      case 0: return (
        <div className="flex flex-col gap-3">
          <Intro text="Who is the Target? Write anything you like. Names, jobs and scandals are yours." />
          <Field label="Full name" value={draft.fullName} max={70} onChange={v => set({ fullName: v })} />
          <Field label="Short name (used in the game text)" value={draft.shortName} max={28} onChange={v => set({ shortName: v })} />
          <Field label="Job or title" value={draft.title} max={70} onChange={v => set({ title: v })} />
          <Field label="Personality" value={draft.personality} max={240} area onChange={v => set({ personality: v })} />
          <div>
            <span className={LABEL}>Look</span>
            <div className="flex gap-3 items-start">
              <div className="w-20 h-24 flex-shrink-0 bg-[#2B2470] border-[3px] border-[var(--m-line)] rounded-md overflow-hidden"><Avatar target={portrait as never} emotion="SMUG" className="w-full h-full" /></div>
              <div className="flex flex-wrap gap-1.5">
                {SILHOUETTES.map((s: SilhouetteKind) => <button key={s} onClick={() => set({ avatar: { ...draft.avatar, silhouette: s } })} className={CHIP(draft.avatar.silhouette === s)}>{s}</button>)}
              </div>
            </div>
          </div>
          <div>
            <span className={LABEL}>Scandals (1 to 3, one per kind)</span>
            <div className="flex flex-col gap-2">
              {draft.scandals.map((sc, i) => (
                <div key={i} className={CARD}>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {SCANDAL_CATEGORIES.map(c => {
                      const taken = draft.scandals.some((o, j) => j !== i && o.category === c);
                      return <button key={c} disabled={taken} onClick={() => set({ scandals: draft.scandals.map((o, j) => (j === i ? { ...o, category: c } : o)) })} className={`${CHIP(sc.category === c)} ${taken ? 'opacity-30' : ''}`}>{SCANDALS[c].label}</button>;
                    })}
                  </div>
                  <input className={INPUT} value={sc.title} maxLength={100} placeholder="The headline of the scandal" onChange={e => set({ scandals: draft.scandals.map((o, j) => (j === i ? { ...o, title: e.target.value } : o)) })} />
                  {draft.scandals.length > 1 && <button onClick={() => set({ scandals: draft.scandals.filter((_, j) => j !== i) })} className="mt-1.5 min-h-[44px] text-[12px] font-black uppercase text-[var(--m-accent-text)] underline cursor-pointer">Remove</button>}
                </div>
              ))}
              {draft.scandals.length < 3 && (
                <button onClick={() => { const used = new Set(draft.scandals.map(s => s.category)); const c = SCANDAL_CATEGORIES.find(x => !used.has(x)); if (c) set({ scandals: [...draft.scandals, { category: c, title: '' }] }); }} className={`${CHIP(false)} text-center`}>+ Add a scandal</button>
              )}
            </div>
          </div>
          <Field label="What makes them hard to shift? (name)" value={draft.passiveName} max={40} onChange={v => set({ passiveName: v })} />
          <Field label="…and a line about it" value={draft.passiveFlavor} max={180} area onChange={v => set({ passiveFlavor: v })} />
          <Field label="What they say when it starts" value={draft.ai.chatter.onStart} max={140} onChange={v => setAi({ chatter: { ...draft.ai.chatter, onStart: v } })} />
          <Field label="What they say when it gets bad" value={draft.ai.chatter.onCritical} max={140} onChange={v => setAi({ chatter: { ...draft.ai.chatter, onCritical: v } })} />
          <Field label="Made by" value={draft.author ?? ''} max={40} onChange={v => set({ author: v })} placeholder={settings.playerName || 'Your name'} />
        </div>
      );
      case 1: return (
        <div className="flex flex-col gap-3">
          <Intro text="How much pressure, and what kind? The bot check will tell you how hard the mix really is." />
          <div>
            <span className={LABEL}>Baseline (days, Heat, Doubt, Cover-Up)</span>
            <div className="grid grid-cols-1 gap-1.5">
              {([1, 2, 3, 4, 5] as Tier[]).map(t => (
                <button key={t} onClick={() => set({ tier: t })} className={CHIP(draft.tier === t)}>
                  Tier {t}: {TIER_INFO[t].name} <span className="font-sans font-semibold opacity-70">• {TIER_INFO[t].blurb}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={LABEL}>Play style (tap one to start from it)</span>
            <div className="grid grid-cols-2 gap-1.5">
              {PLAY_STYLE_PRESETS.map(p => (
                <button key={p.id} onClick={() => applyPreset(p)} className={`${CHIP(presetId === p.id)} flex flex-col gap-0.5`}>
                  <span>{p.icon} {p.name}</span>
                  <span className="font-sans font-semibold text-[10px] leading-snug opacity-75">{p.blurb}</span>
                </button>
              ))}
            </div>
            {presetId === 'hometown_hero' && (
              <div className="mt-2">
                <span className={LABEL}>Which region defends them?</span>
                <div className="flex flex-wrap gap-1.5">{ZONE_IDS.map(z => <button key={z} onClick={() => setMods({ zoneDoubt: { [z]: 18 } })} className={CHIP(!!draft.mods.zoneDoubt?.[z])}>{ZONE_NAMES[z]}</button>)}</div>
              </div>
            )}
          </div>
          <details className={CARD}>
            <summary className="font-black text-[12px] uppercase tracking-wider cursor-pointer min-h-[32px] flex items-center">🎛️ Fine-tune the dials</summary>
            <div className="mt-2 flex flex-col gap-1">
              {DIALS.map(dl => (
                <Slider key={dl.key} label={dl.name} min={dl.min} max={dl.max} step={dl.step} unit={dl.unit}
                  value={(draft.mods[dl.key] as number | undefined) ?? dl.neutral}
                  onChange={v => { setPresetId(null); setMods({ [dl.key]: v === dl.neutral ? undefined : v } as Partial<TargetDef['mods']>); }} />
              ))}
            </div>
          </details>
        </div>
      );
      case 2: return (
        <div className="flex flex-col gap-3">
          <Intro text="How do they fight back? A combat style changes the whole case, and a temperament decides when and how they strike." />
          <div>
            <span className={LABEL}>Combat style</span>
            <div className="grid grid-cols-1 gap-1.5">
              {DEFENSE_STYLES.map(s => (
                <button key={s} onClick={() => setAi({ defenseStyle: s })} className={`${CHIP(draft.ai.defenseStyle === s)} flex flex-col`}>
                  <span>{DEFENSE_LABEL[s].icon} {DEFENSE_LABEL[s].name}</span>
                  <span className="font-sans font-semibold text-[10px] leading-snug opacity-75">{STYLE_TEXT[s as keyof typeof STYLE_TEXT]?.replace(/^[^:]+: /, '') || 'No special rules: the plain baseline.'}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={LABEL}>Temperament</span>
            <div className="grid grid-cols-1 gap-1.5">
              {TEMPERAMENTS.map(t => (
                <button key={t} onClick={() => setAi({ temperament: t })} className={`${CHIP(draft.ai.temperament === t)} flex flex-col`}>
                  <span>{TEMPERAMENT_LABEL[t].icon} {TEMPERAMENT_LABEL[t].name}</span>
                  <span className="font-sans font-semibold text-[10px] leading-snug opacity-75">{TEMPERAMENT_TEXT[t as keyof typeof TEMPERAMENT_TEXT]?.replace(/^[^:]+: /, '') || 'The standard counter-moves at 20%, 45% and 70% Believers.'}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={LABEL}>Weak to (+25%)</span>
              <div className="flex flex-col gap-1.5">{BRANCHES.map(b => <button key={b} disabled={draft.ai.resistanceBranch === b} onClick={() => setAi({ weaknessBranch: b })} className={`${CHIP(draft.ai.weaknessBranch === b)} ${draft.ai.resistanceBranch === b ? 'opacity-30' : ''}`}>{b}</button>)}</div>
            </div>
            <div>
              <span className={LABEL}>Resists (-25%)</span>
              <div className="flex flex-col gap-1.5">{BRANCHES.map(b => <button key={b} disabled={draft.ai.weaknessBranch === b} onClick={() => setAi({ resistanceBranch: b })} className={`${CHIP(draft.ai.resistanceBranch === b)} ${draft.ai.weaknessBranch === b ? 'opacity-30' : ''}`}>{b}</button>)}</div>
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="flex flex-col gap-3">
          <Intro text="Powers are the moves they make on a schedule. Give them one to three." />
          {draft.abilities.map((a, i) => {
            const r = ABILITY_RANGE[a.kind];
            return (
              <div key={i} className={CARD}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[var(--m-accent-text)]">Power {i + 1}</span>
                  {draft.abilities.length > 1 && <button onClick={() => set({ abilities: draft.abilities.filter((_, j) => j !== i) })} className="min-h-[44px] px-2 text-[12px] font-black uppercase text-[var(--m-accent-text)] underline cursor-pointer">Remove</button>}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ABILITY_KINDS.map(k => (
                    <button key={k} onClick={() => setAbility(i, { ...defaultAbility(k) })} className={CHIP(a.kind === k)}>{ABILITY_LABEL[k].icon} {ABILITY_LABEL[k].name}</button>
                  ))}
                </div>
                <div className="text-[11px] font-sans text-[var(--m-ink)]/72 mb-1">{ABILITY_LABEL[a.kind].blurb}</div>
                <Slider label={`Strength (${r.unit})`} min={r.min} max={r.max} value={a.strength} onChange={v => setAbility(i, { strength: v })} />
                <Slider label="Every (days)" min={3} max={14} value={a.every} onChange={v => setAbility(i, { every: v })} />
                <Slider label="First used on day" min={3} max={20} value={a.start} onChange={v => setAbility(i, { start: v })} />
                {(a.kind === 'INJUNCTION' || a.kind === 'LANE_JAM') && (
                  <div className="mt-1"><span className={LABEL}>Which lane{a.kind === 'INJUNCTION' ? ' (or any)' : ''}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {a.kind === 'INJUNCTION' && <button onClick={() => setAbility(i, { branch: undefined })} className={CHIP(!a.branch)}>Any</button>}
                      {BRANCHES.map(b => <button key={b} onClick={() => setAbility(i, { branch: b })} className={CHIP(a.branch === b)}>{b}</button>)}
                    </div></div>
                )}
                {a.kind === 'REGION_LOCK' && (
                  <div className="mt-1"><span className={LABEL}>Which region</span>
                    <div className="flex flex-wrap gap-1.5">{ZONE_IDS.map(z => <button key={z} onClick={() => setAbility(i, { zone: z })} className={CHIP(a.zone === z)}>{ZONE_NAMES[z]}</button>)}</div></div>
                )}
                <details className="mt-2">
                  <summary className="text-[11px] font-black uppercase tracking-wider cursor-pointer min-h-[36px] flex items-center">✍️ The words on the alert card</summary>
                  <div className="flex flex-col gap-2 mt-1">
                    <Field label="Stamp" value={a.stamp} max={36} onChange={v => setAbility(i, { stamp: v })} />
                    <Field label="Headline" value={a.headline} max={70} onChange={v => setAbility(i, { headline: v })} />
                    <Field label="Body (use {Target} for their name)" value={a.line} max={220} area onChange={v => setAbility(i, { line: v })} />
                    <button onClick={() => setAbility(i, { ...ABILITY_WORDS[a.kind] })} className="min-h-[44px] text-[11px] font-black uppercase underline text-[var(--m-ink)]/72 cursor-pointer">Reset the words</button>
                  </div>
                </details>
              </div>
            );
          })}
          {draft.abilities.length < 3 && <button onClick={() => set({ abilities: [...draft.abilities, defaultAbility(ABILITY_KINDS.find(k => !draft.abilities.some(a => a.kind === k)) ?? 'DISTRACTION')] })} className={`${CHIP(false)} text-center`}>+ Add a power</button>}
        </div>
      );
      case 4: return (
        <div className="flex flex-col gap-3">
          <Intro text="The world around the case: the news climate, and natural occurrences that hit on days you choose." />
          <div>
            <span className={LABEL}>News climate</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => set({ climateId: undefined })} className={CHIP(!draft.climateId)}>🎲 Random each time</button>
              {CLIMATES.map(c => <button key={c.id} onClick={() => set({ climateId: c.id })} className={`${CHIP(draft.climateId === c.id)} flex flex-col`}><span>{c.icon} {c.name}</span><span className="font-sans font-semibold text-[10px] leading-snug opacity-75">{c.blurb}</span></button>)}
            </div>
          </div>
          <div>
            <span className={LABEL}>Natural occurrences (up to 4)</span>
            <div className="flex flex-col gap-2">
              {(draft.occurrences ?? []).map((o, i) => {
                const ev = EVENTS.find(e => e.id === o.eventId);
                return (
                  <div key={i} className={CARD}>
                    <select className={INPUT} value={o.eventId} onChange={e => set({ occurrences: (draft.occurrences ?? []).map((x, j) => (j === i ? { ...x, eventId: e.target.value } : x)) })}>
                      {EVENTS.filter(e => !e.id.startsWith('schemer')).map(e => <option key={e.id} value={e.id} disabled={(draft.occurrences ?? []).some((x, j) => j !== i && x.eventId === e.id)}>{e.headline.replace(/\{Target\}/g, 'the Target').replace(/\{zone\}/g, 'a region')}</option>)}
                    </select>
                    <div className="text-[11px] font-sans text-[var(--m-ink)]/72 mt-1 mb-1">{ev?.body.replace(/\{Target\}/g, 'the Target').replace(/\{zone\}/g, 'a region').slice(0, 110)}…</div>
                    <Slider label="Happens on day" min={4} max={30} value={o.day} onChange={v => set({ occurrences: (draft.occurrences ?? []).map((x, j) => (j === i ? { ...x, day: v } : x)) })} />
                    <button onClick={() => set({ occurrences: (draft.occurrences ?? []).filter((_, j) => j !== i) })} className="min-h-[44px] text-[12px] font-black uppercase text-[var(--m-accent-text)] underline cursor-pointer">Remove</button>
                  </div>
                );
              })}
              {(draft.occurrences ?? []).length < 4 && (
                <button onClick={() => { const used = new Set((draft.occurrences ?? []).map(o => o.eventId)); const ev = EVENTS.find(e => !used.has(e.id) && !e.id.startsWith('schemer')); if (ev) set({ occurrences: [...(draft.occurrences ?? []), { eventId: ev.id, day: 10 + 4 * (draft.occurrences ?? []).length }] }); }} className={`${CHIP(false)} text-center`}>+ Schedule an event</button>
              )}
            </div>
          </div>
        </div>
      );
      default: return (
        <div className="flex flex-col gap-3">
          <Intro text="Thirty bots, each with a different plan, will play your Target. You get a rating, tips for beating it, and a verdict on whether it is fair." />
          {validation.errors.length > 0 && (
            <div className="border-2 border-[#8B0000] bg-[#FEF2F2] text-[#1A1A1A] rounded-lg p-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-[#8B0000] mb-1">Fix these first</div>
              <ul className="list-disc pl-4 text-[12px] font-sans leading-snug">{validation.errors.slice(0, 6).map(e => <li key={e}>{e}</li>)}</ul>
              <div className="flex gap-1.5 flex-wrap mt-2">{STEPS.slice(0, 5).map((s, i) => <button key={s} onClick={() => setStep(i)} className={CHIP(false)}>{s}</button>)}</div>
            </div>
          )}
          {progress ? (
            <div className={CARD}>
              <div className="text-[13px] font-black mb-2">{progress.label}</div>
              <div className="h-4 border-2 border-[var(--m-line)] rounded-full bg-[var(--m-surface2)] overflow-hidden"><div className="h-full bg-[var(--m-accent)] transition-all" style={{ width: `${Math.round(progress.p * 100)}%` }} /></div>
              <div className="text-[11px] font-sans text-[var(--m-ink)]/72 mt-1.5">This takes a few seconds. Keep this screen open.</div>
            </div>
          ) : (
            <BrutalButton tone="ink" disabled={validation.errors.length > 0} onClick={runCheck}>🤖 {report ? 'Run the bot check again' : 'Run the bot check'}</BrutalButton>
          )}

          {report && report.ok && !progress && (
            <>
              {stale && <div className="border-2 border-[#B45309] bg-[#FEF3C7] text-[#1A1A1A] rounded-lg p-2.5 text-[12px] font-bold">You changed something since this check. Run it again before publishing.</div>}
              <div className={`${CARD} ${stale ? 'opacity-60' : ''}`}>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <div className={LABEL}>PR rating</div>
                    <div className="font-mono font-black text-4xl leading-none">{report.rating}</div>
                  </div>
                  <div className="text-right text-[12px] font-sans font-bold leading-snug">
                    Tier {report.tier}<br />Difficulty {Math.round(report.difficulty)}/100<br />Beaten by {report.beatenBy} of 30 plans
                  </div>
                </div>
                <div className="mt-3 text-[12px] font-sans leading-snug"><b>Best plan: {report.bestPlan.replace(/_/g, ' ')}</b> wins {report.best}% of its games. Average over all 30 plans: {report.breadth}%.</div>
              </div>

              {report.verdict === 'too_hard' && (
                <div className="border-[3px] border-[#8B0000] bg-[#FEF2F2] text-[#1A1A1A] rounded-lg p-3">
                  <div className="font-black text-[14px] text-[#8B0000]">Too hard to publish</div>
                  <p className="text-[12px] font-sans leading-snug mt-1">Even the best bot plan only wins {report.best}% of the time. A Target needs at least {FAIR_FLOOR}% so that real players have a fair chance. Nothing is wrong with the idea: it just needs to hurt a little less.</p>
                  {!fix && !progress && <div className="mt-2"><BrutalButton tone="crimson" onClick={makeFair}>🔧 Make it fair for me</BrutalButton></div>}
                  {fix === 'none' && <p className="text-[12px] font-sans font-bold mt-2">Even the gentlest version was too tough. Try removing a power, choosing a lower baseline in Pressure, or picking a calmer style.</p>}
                  {fix && fix !== 'none' && (
                    <div className="mt-2 bg-[var(--m-surface2)] border-2 border-[var(--m-line)] rounded-md p-2.5">
                      <div className="text-[12px] font-black">A fair version: {Math.round((1 - fix.factor) * 100)}% gentler, rated PR {fix.report.rating}, best plan wins {fix.report.best}%.</div>
                      <ul className="list-disc pl-4 mt-1 text-[11px] font-sans leading-snug">{describeChanges(draft, fix.def).slice(0, 8).map(c => <li key={c}>{c}</li>)}</ul>
                      <div className="mt-2 grid grid-cols-2 gap-2"><BrutalButton tone="green" onClick={acceptFix}>Use it</BrutalButton><BrutalButton tone="paper" onClick={() => setFix(null)}>No thanks</BrutalButton></div>
                    </div>
                  )}
                </div>
              )}
              {report.verdict === 'trivial' && <div className="border-2 border-[#B45309] bg-[#FEF3C7] text-[#1A1A1A] rounded-lg p-2.5 text-[12px] font-bold">Very easy: almost every bot wins. You can still publish it, but it will get the lowest rating. Add a power or more pressure if you want a real fight.</div>}
              {report.verdict === 'ok' && !stale && <div className="border-2 border-[#065F46] bg-[#ECFDF5] rounded-lg p-2.5 text-[12px] font-bold text-[#065F46]">Fair: real plans can beat it, and it is a real challenge.</div>}

              <div className={CARD}>
                <div className={LABEL}>How the bots did (top 8 of 30 plans)</div>
                <div className="flex flex-col gap-1">
                  {report.plans.slice(0, 8).map(p => (
                    <div key={p.name} className="flex items-center gap-2 text-[11px] font-sans">
                      <span className="w-[112px] truncate font-bold">{p.name.replace(/_/g, ' ')}</span>
                      <div className="flex-1 h-2.5 border border-[var(--m-line)] rounded-full bg-[var(--m-surface2)] overflow-hidden"><div className="h-full bg-[#065F46]" style={{ width: `${p.win}%` }} /></div>
                      <span className="w-9 text-right font-black">{p.win}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={CARD}>
                <div className={LABEL}>💡 Tips for beating it</div>
                <ul className="list-disc pl-4 text-[12px] font-sans leading-snug flex flex-col gap-1">{report.tips.map(t => <li key={t}>{t}</li>)}</ul>
              </div>
            </>
          )}
          {report && !report.ok && <div className="border-2 border-[#8B0000] bg-[#FEF2F2] text-[#1A1A1A] rounded-lg p-2.5 text-[12px]">{report.errors.slice(0, 4).join(' ')}</div>}

          <div className={CARD}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[13px] font-black">{wasPublished ? 'Update this Target' : 'Publish this Target'}</div>
                <div className="text-[11px] font-sans text-[var(--m-ink)]/72 leading-snug">{wasPublished ? 'Already published: updating is free.' : report?.ok && report.verdict === 'too_hard' ? 'Make it fair first, then you can publish.' : report?.ok ? `Costs ${fee} ✉️ (you have ${profileEnvelopes}).` : 'Run the bot check to see the cost.'}</div>
              </div>
              <span className="font-black text-[15px]">✉️ {profileEnvelopes}</span>
            </div>
            {report?.ok && report.verdict !== 'too_hard' && !wasPublished && profileEnvelopes < fee && <div className="text-[12px] font-bold text-[var(--m-accent-text)] mt-1">You need {fee - profileEnvelopes} more ✉️. Win cases to earn them, or make it simpler.</div>}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <BrutalButton tone="paper" onClick={saveDraft}>💾 Save draft</BrutalButton>
              <BrutalButton tone="green" disabled={!canPublish} onClick={publish}>{wasPublished ? 'Update' : 'Publish'}</BrutalButton>
            </div>
          </div>
        </div>
      );
    }
  })();

  return (
    <Shell title={`${STEPS[step]} • ${step + 1}/${STEPS.length}`} onBack={onClose} envelopes={profileEnvelopes} bodyRef={bodyRef}
      footer={
        <div className="flex gap-2">
          <BrutalButton tone="paper" className="flex-1" disabled={step === 0} onClick={() => { sfx.play('click'); setStep(s => Math.max(0, s - 1)); }}>← Back</BrutalButton>
          {step < STEPS.length - 1
            ? <BrutalButton tone="ink" className="flex-1" onClick={() => { sfx.play('click'); setStep(s => Math.min(STEPS.length - 1, s + 1)); }}>Next →</BrutalButton>
            : <BrutalButton tone="paper" className="flex-1" onClick={() => { saveDraft(); }}>💾 Save draft</BrutalButton>}
        </div>
      }
      dots={<div className="flex gap-1 justify-center items-center">{STEPS.map((s, i) => <button key={s} aria-label={s} onClick={() => setStep(i)} className="p-0 flex items-center justify-center cursor-pointer"><span className={`block h-2.5 rounded-full transition-all ${i === step ? 'w-7 bg-[var(--m-accent)]' : 'w-2.5 bg-[var(--m-sunk)]/25'}`} /></button>)}</div>}
    >
      {stepBody}
      {note && <div role="status" className="fixed bottom-24 inset-x-0 flex justify-center pointer-events-none"><div className="bg-[var(--m-sunk)] text-[var(--m-ink)] border-2 border-[#FDE68A] rounded-lg px-4 py-2 text-[13px] font-bold">{note}</div></div>}
    </Shell>
  );
};

const Intro: React.FC<{ text: string }> = ({ text }) => <p className="text-[13px] font-sans leading-snug text-[var(--m-ink)]/85 bg-[var(--m-sunk)] border-2 border-[var(--m-line)] rounded-md px-3 py-2">{text}</p>;

export const Shell: React.FC<{ title: string; onBack: () => void; envelopes: number; children: React.ReactNode; footer?: React.ReactNode; dots?: React.ReactNode; bodyRef?: React.RefObject<HTMLDivElement | null> }> = ({ title, onBack, envelopes, children, footer, dots, bodyRef }) => (
  <div className="relative flex-1 min-h-0 flex flex-col tex-arena text-[var(--m-ink)] font-serif overflow-hidden">
    <PaperGrain />
    <div className="relative flex-shrink-0 bg-[var(--m-sunk)] text-[var(--m-ink)] px-3 py-2 flex items-center gap-3 border-b-4 border-[var(--m-accent)]">
      <button onClick={() => { sfx.play('click'); onBack(); }} className="min-h-[44px] px-3 text-[13px] font-black uppercase tracking-wider bg-[var(--m-surface)] text-[var(--m-ink)] border-2 border-[var(--m-line)] rounded-md cursor-pointer">← Back</button>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--m-accent2)]">Arena • Create a Target</div>
        <div className="font-serif font-black text-[16px] leading-tight truncate">{title}</div>
      </div>
      <span className="bg-[var(--m-surface2)] text-[var(--m-ink)] border-2 border-[var(--m-line)] rounded px-1.5 py-1 text-[11px] font-black">✉️ {envelopes}</span>
    </div>
    {dots && <div className="relative flex-shrink-0 py-2.5">{dots}</div>}
    <div ref={bodyRef} className="relative flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 pb-6 pt-1">{children}</div>
    {footer && <div className="relative flex-shrink-0 p-3 border-t-2 border-[var(--m-line)] bg-[var(--m-surface)]">{footer}</div>}
  </div>
);

