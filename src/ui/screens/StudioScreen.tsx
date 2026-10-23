import React, { useMemo, useRef, useState } from 'react';
import {
  ABILITY_KINDS, ABILITY_RANGE, BRANCHES, DEFENSE_STYLES, PACK_SCHEMA_VERSION, SILHOUETTES, TARGET_KINDS, TEMPERAMENTS,
  TargetDef, TargetPack, builtInIds, defToArchetype, deleteDraftPack, estimateRating, loadDraftPacks, newBlankDef, registerPack, saveDraftPack,
  threatScore, validatePack, validateTargetDef
} from '../../engine/data/targetPacks';
import { SCANDAL_CATEGORIES, SCANDALS, TARGETS, TargetArchetype, describeTarget, getTarget } from '../../engine/data/targets';
import { RATING_RANGES } from '../../engine/data/ratings';
import { SKILLS, play } from '../../engine/bots';
import { Avatar } from '../components/Silhouette';

// THE TARGET STUDIO: a content tool for the team. Author a Target (archetype, playstyle, avatar, difficulty, scandals,
// abilities, chatter), see exactly what the game will say about them, check the rules, run the bots against them, and
// export a pack file. Open the game with ?studio=1. It stores drafts in this browser only; publishing is a file drop.
const INPUT = 'w-full border border-slate-400 rounded px-2 py-1 text-[13px] bg-white font-sans';
const LABEL = 'text-[11px] font-bold uppercase tracking-wider text-slate-600';

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block">
    <span className={LABEL}>{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-500 font-sans">{hint}</span>}
  </label>
);

const Section: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
  <section className="bg-white border-2 border-[#1A1A1A] rounded-lg p-3 flex flex-col gap-2.5">
    <div className="flex items-center justify-between">
      <h3 className="font-serif font-black text-sm uppercase tracking-wide">{title}</h3>
      {right}
    </div>
    {children}
  </section>
);

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'ink' | 'paper' | 'crimson' }> = ({ tone = 'paper', className = '', ...rest }) => (
  <button
    {...rest}
    className={`px-3 py-1.5 rounded border-2 border-[#1A1A1A] text-[12px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-40 ${tone === 'ink' ? 'bg-[#1A1A1A] text-white' : tone === 'crimson' ? 'bg-[#8B0000] text-white' : 'bg-white'} ${className}`}
  />
);

const archetypeToDef = (t: TargetArchetype): TargetDef => ({
  id: `${t.id}_copy`,
  kind: t.parody ? 'PARODY' : 'FICTIONAL',
  enabled: true,
  tier: t.tier,
  folder: t.folder,
  fullName: t.fullName, shortName: t.shortName, title: t.title, personality: t.personality,
  avatar: { silhouette: t.silhouette, imageUrl: t.avatar?.imageUrl, accent: t.avatar?.accent },
  scandals: t.scandals.map(s => ({ ...s })),
  passiveName: t.passiveName, passiveFlavor: t.passiveFlavor,
  mods: JSON.parse(JSON.stringify(t.mods)),
  abilities: t.abilities.map(a => ({ ...a })),
  ai: { defenseStyle: t.ai.defenseStyle, temperament: t.ai.temperament, weaknessBranch: t.ai.weaknessBranch, resistanceBranch: t.ai.resistanceBranch, chatter: { ...t.ai.chatter } }
});

// Resizes an uploaded portrait to a small JPEG data URL so packs stay light.
const resizeImage = (file: File, size = 256): Promise<string> => new Promise((resolve, reject) => {
  const fr = new FileReader();
  fr.onerror = () => reject(new Error('Could not read the file'));
  fr.onload = () => {
    const img = new Image();
    img.onerror = () => reject(new Error('Not an image'));
    img.onload = () => {
      const scale = Math.min(1, size / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.src = String(fr.result);
  };
  fr.readAsDataURL(file);
});

const download = (name: string, text: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};

interface BalanceResult { expert: number; average: number; runs: number }

export const StudioScreen: React.FC = () => {
  const initial = useMemo<TargetPack>(() => loadDraftPacks()[0] ?? { schema: PACK_SCHEMA_VERSION, packId: 'my-pack', name: 'My Pack', author: '', version: 1, targets: [newBlankDef()] }, []);
  const [pack, setPack] = useState<TargetPack>(initial);
  const [sel, setSel] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [balance, setBalance] = useState<BalanceResult | 'running' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const def = pack.targets[Math.min(sel, pack.targets.length - 1)];
  const built = useMemo(builtInIds, []);
  const v = useMemo(() => (def ? validateTargetDef(def, { builtInIds: built }) : { errors: [], warnings: [] }), [def, built]);
  const packV = useMemo(() => validatePack(pack, built), [pack, built]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 4000); };
  const edit = (patch: Partial<TargetDef>) => { setBalance(null); setPack(p => ({ ...p, targets: p.targets.map((t, i) => (i === sel ? { ...t, ...patch } : t)) })); };
  const editAi = (patch: Partial<TargetDef['ai']>) => edit({ ai: { ...def.ai, ...patch } });
  const setMod = (k: string, value: string) => {
    const mods = { ...def.mods } as Record<string, unknown>;
    if (value === '') delete mods[k]; else mods[k] = Number(value);
    edit({ mods: mods as TargetDef['mods'] });
  };

  const addTarget = (d: TargetDef) => { setPack(p => ({ ...p, targets: [...p.targets, d] })); setSel(pack.targets.length); };
  const preview: TargetArchetype | null = useMemo(() => {
    if (!def || v.errors.length) return null;
    // The in-game Target for the preview, built without touching the live roster.
    return defToArchetype(def, pack.packId);
  }, [pack, def, v.errors.length]);

  const runBalance = () => {
    if (!def || v.errors.length) return;
    const rep = registerPack({ ...pack, packId: pack.packId });
    if (!rep.registered.includes(def.id)) { flash('Fix the errors first. The Target is not playable yet.'); return; }
    setBalance('running');
    const runs = 20;
    const out = { expert: 0, average: 0 };
    const [expert, average] = [SKILLS[0], SKILLS[1]];
    let i = 0;
    const step = () => {
      for (let k = 0; k < 2 && i < runs; k++, i++) {
        if (play(def.id, expert, 500 + i).status === 'WON') out.expert++;
        if (play(def.id, average, 900 + i).status === 'WON') out.average++;
      }
      if (i < runs) setTimeout(step, 0);
      else setBalance({ expert: Math.round((out.expert / runs) * 100), average: Math.round((out.average / runs) * 100), runs });
    };
    setTimeout(step, 0);
  };

  const saveDraft = () => {
    if (packV.errors.length) { flash(`${packV.errors.length} error(s) in the pack. Valid Targets are still saved; fix the rest to publish.`); }
    saveDraftPack(pack);
    const r = registerPack(pack);
    flash(`Saved in this browser. ${r.registered.length} Target(s) are playable here (open the game without ?studio=1).`);
  };

  const exportPack = () => {
    const text = JSON.stringify(pack, null, 2);
    download(`${pack.packId}.json`, text);
    flash(`Exported ${pack.packId}.json. Drop it in public/target-packs/ and add "${pack.packId}.json" to index.json.`);
  };

  const doImport = (text: string) => {
    try {
      const parsed = JSON.parse(text) as TargetPack;
      if (!parsed || !Array.isArray(parsed.targets)) throw new Error('No targets found');
      setPack({ ...parsed, schema: PACK_SCHEMA_VERSION }); setSel(0); setBalance(null); setImportText('');
      flash(`Imported ${parsed.targets.length} Target(s).`);
    } catch (e) { flash('That is not a valid pack file: ' + (e as Error).message); }
  };

  const pickImage = async (f?: File | null) => {
    if (!f) return;
    try { edit({ avatar: { ...def.avatar, imageUrl: await resizeImage(f) } }); } catch (e) { flash((e as Error).message); }
  };

  if (!def) return null;
  const folderKey = def.folder === 'SPOTLIGHT' || !def.folder ? def.tier : def.folder;
  const [rLo, rHi] = RATING_RANGES[folderKey];

  return (
    <div className="min-h-screen bg-[#EFEBE0] text-[#1A1A1A] font-sans p-3 md:p-5">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-3">
        <header className="flex flex-wrap items-center gap-3 border-b-4 border-double border-[#1A1A1A] pb-2">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B0000]">I Heard A Rumor • Content tool</div>
            <h1 className="font-serif font-black text-2xl leading-none">Target Studio</h1>
          </div>
          <div className="flex-1" />
          <a href="./" className="text-[12px] underline font-bold">← Back to the game</a>
        </header>

        {msg && <div role="status" className="bg-[#FDE68A] border-2 border-[#1A1A1A] rounded px-3 py-2 text-[13px] font-bold">{msg}</div>}

        <div className="grid md:grid-cols-[260px_1fr_340px] gap-3 items-start">
          {/* ---------------- LEFT: pack and list */}
          <div className="flex flex-col gap-3">
            <Section title="Pack">
              <Field label="Pack id" hint="Lowercase, letters, digits, - or _"><input className={INPUT} value={pack.packId} onChange={e => setPack({ ...pack, packId: e.target.value })} /></Field>
              <Field label="Name"><input className={INPUT} value={pack.name} onChange={e => setPack({ ...pack, name: e.target.value })} /></Field>
              <Field label="Author"><input className={INPUT} value={pack.author} onChange={e => setPack({ ...pack, author: e.target.value })} /></Field>
              <Field label="Version"><input type="number" min={1} className={INPUT} value={pack.version} onChange={e => setPack({ ...pack, version: Math.max(1, Number(e.target.value) || 1) })} /></Field>
              <div className="flex flex-wrap gap-2">
                <Btn tone="ink" onClick={saveDraft}>Save in browser</Btn>
                <Btn onClick={exportPack} disabled={packV.errors.length > 0}>Export JSON</Btn>
                <Btn onClick={() => { deleteDraftPack(pack.packId); flash('Draft removed from this browser.'); }}>Delete draft</Btn>
              </div>
              {packV.errors.length > 0 && <div className="text-[11px] text-[#8B0000] font-bold">Export is blocked until all errors are fixed ({packV.errors.length}).</div>}
            </Section>

            <Section title={`Targets (${pack.targets.length})`} right={<Btn onClick={() => addTarget({ ...newBlankDef(), id: `new_target_${pack.targets.length + 1}` })}>+ New</Btn>}>
              <ul className="flex flex-col gap-1">
                {pack.targets.map((t, i) => {
                  const tv = packV.perTarget[t.id];
                  return (
                    <li key={i}>
                      <button onClick={() => { setSel(i); setBalance(null); }} className={`w-full text-left rounded border-2 px-2 py-1 cursor-pointer ${i === sel ? 'border-[#8B0000] bg-[#FEE2E2]' : 'border-slate-300 bg-white'}`}>
                        <div className="text-[13px] font-bold leading-tight truncate">{t.fullName || '(unnamed)'}</div>
                        <div className="text-[11px] text-slate-500 truncate">{t.id} • T{t.tier} • {t.kind}{t.enabled === false ? ' • hidden' : ''}{tv?.errors.length ? ` • ${tv.errors.length} error(s)` : ''}</div>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Btn onClick={() => addTarget({ ...JSON.parse(JSON.stringify(def)), id: `${def.id}_copy` })}>Duplicate</Btn>
                <Btn tone="crimson" disabled={pack.targets.length < 2} onClick={() => { setPack(p => ({ ...p, targets: p.targets.filter((_, i) => i !== sel) })); setSel(0); }}>Delete</Btn>
              </div>
              <Field label="Start from a built-in Target">
                <select className={INPUT} value="" onChange={e => { if (e.target.value) addTarget(archetypeToDef(getTarget(e.target.value))); }}>
                  <option value="">Choose to copy…</option>
                  {TARGETS.filter(t => !t.packId).map(t => <option key={t.id} value={t.id}>{t.fullName} (T{t.tier})</option>)}
                </select>
              </Field>
            </Section>

            <Section title="Import">
              <textarea className={`${INPUT} font-mono text-[11px]`} rows={4} placeholder="Paste a pack's JSON" value={importText} onChange={e => setImportText(e.target.value)} />
              <div className="flex gap-2"><Btn onClick={() => doImport(importText)} disabled={!importText.trim()}>Import pasted</Btn></div>
              <input type="file" accept="application/json,.json" className="text-[12px]" onChange={async e => { const f = e.target.files?.[0]; if (f) doImport(await f.text()); }} />
            </Section>
          </div>

          {/* ---------------- MIDDLE: editor */}
          <div className="flex flex-col gap-3">
            <Section title="Identity">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Id" hint="snake_case, unique forever"><input className={INPUT} value={def.id} onChange={e => edit({ id: e.target.value })} /></Field>
                <Field label="Type">
                  <select className={INPUT} value={def.kind} onChange={e => edit({ kind: e.target.value as TargetDef['kind'] })}>
                    {TARGET_KINDS.map(k => <option key={k}>{k}</option>)}
                  </select>
                </Field>
                <Field label="Full name"><input className={INPUT} value={def.fullName} onChange={e => edit({ fullName: e.target.value })} /></Field>
                <Field label="Short name" hint="Replaces {Target} in text"><input className={INPUT} value={def.shortName} onChange={e => edit({ shortName: e.target.value })} /></Field>
              </div>
              <Field label="Title"><input className={INPUT} value={def.title} onChange={e => edit({ title: e.target.value })} /></Field>
              <Field label="Personality"><textarea rows={2} className={INPUT} value={def.personality} onChange={e => edit({ personality: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Passive name"><input className={INPUT} value={def.passiveName} onChange={e => edit({ passiveName: e.target.value })} /></Field>
                <Field label="Passive flavour"><input className={INPUT} value={def.passiveFlavor} onChange={e => edit({ passiveFlavor: e.target.value })} /></Field>
              </div>
              <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={def.enabled !== false} onChange={e => edit({ enabled: e.target.checked })} /> Playable (untick to keep it in the pack but hide it)</label>
              <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={!!def.storyOnly} onChange={e => edit({ storyOnly: e.target.checked })} /> Story only (not listed in the Dossier)</label>
            </Section>

            {def.kind === 'CREATOR' && (
              <Section title="Creator permission (required)">
                <p className="text-[12px] text-slate-600">Real creators appear only with their written permission, and only with comic scandals. Record where that permission lives.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Handle"><input className={INPUT} value={def.creator?.handle ?? ''} onChange={e => edit({ creator: { handle: e.target.value, consentRef: def.creator?.consentRef ?? '', approvedOn: def.creator?.approvedOn ?? '' } })} /></Field>
                  <Field label="Approved on"><input type="date" className={INPUT} value={def.creator?.approvedOn ?? ''} onChange={e => edit({ creator: { handle: def.creator?.handle ?? '', consentRef: def.creator?.consentRef ?? '', approvedOn: e.target.value } })} /></Field>
                </div>
                <Field label="Permission reference" hint="Email subject, contract number or document link"><input className={INPUT} value={def.creator?.consentRef ?? ''} onChange={e => edit({ creator: { handle: def.creator?.handle ?? '', approvedOn: def.creator?.approvedOn ?? '', consentRef: e.target.value } })} /></Field>
              </Section>
            )}

            <Section title="Avatar">
              <div className="flex items-center gap-3">
                <div className="w-20 h-24 bg-[#D9CBB0] border-2 border-[#1A1A1A] rounded overflow-hidden flex items-end justify-center">
                  {preview ? <Avatar target={preview} className="w-full h-full" /> : <span className="text-[11px] text-slate-500 p-1">fix errors to preview</span>}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Field label="Silhouette (always the fallback)">
                    <select className={INPUT} value={def.avatar.silhouette} onChange={e => edit({ avatar: { ...def.avatar, silhouette: e.target.value as TargetDef['avatar']['silhouette'] } })}>
                      {SILHOUETTES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Accent colour"><input type="color" value={def.avatar.accent ?? '#8B0000'} onChange={e => edit({ avatar: { ...def.avatar, accent: e.target.value } })} /></Field>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => pickImage(e.target.files?.[0])} />
                <Btn onClick={() => fileRef.current?.click()}>Upload portrait</Btn>
                {def.avatar.imageUrl && <Btn onClick={() => edit({ avatar: { silhouette: def.avatar.silhouette, accent: def.avatar.accent } })}>Remove portrait</Btn>}
                <span className="text-[11px] text-slate-500">Uploads are resized to 256px. Use a photo you have the rights to.</span>
              </div>
              <Field label="…or an https image URL"><input className={INPUT} value={def.avatar.imageUrl?.startsWith('data:') ? '' : def.avatar.imageUrl ?? ''} placeholder="https://…" onChange={e => edit({ avatar: { ...def.avatar, imageUrl: e.target.value || undefined } })} /></Field>
            </Section>

            <Section title="Difficulty">
              <div className="grid grid-cols-3 gap-2">
                <Field label="Tier (mechanics)">
                  <select className={INPUT} value={def.tier} onChange={e => edit({ tier: Number(e.target.value) as TargetDef['tier'] })}>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Tier {n}</option>)}</select>
                </Field>
                <Field label="Dossier folder">
                  <select className={INPUT} value={def.folder ?? def.tier} onChange={e => edit({ folder: e.target.value === 'SPOTLIGHT' ? 'SPOTLIGHT' : (Number(e.target.value) as TargetDef['tier']) })}>
                    <option value="SPOTLIGHT">★ Spotlight (always open)</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Folder {n}</option>)}
                  </select>
                </Field>
                <Field label="PR rating" hint={`Auto ${estimateRating(def)} • range ${rLo}-${rHi}`}>
                  <input type="number" className={INPUT} value={def.prRating ?? ''} placeholder="auto" onChange={e => edit({ prRating: e.target.value === '' ? undefined : Number(e.target.value) })} />
                </Field>
              </div>
              <p className="text-[12px] text-slate-600">Tier sets the clock, Heat, Doubt and Cover-Up baselines. The folder decides where players find them and how they unlock.</p>
            </Section>

            <Section title="Playstyle">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Defence style"><select className={INPUT} value={def.ai.defenseStyle} onChange={e => editAi({ defenseStyle: e.target.value as TargetDef['ai']['defenseStyle'] })}>{DEFENSE_STYLES.map(s => <option key={s}>{s}</option>)}</select></Field>
                <Field label="Temperament"><select className={INPUT} value={def.ai.temperament} onChange={e => editAi({ temperament: e.target.value as TargetDef['ai']['temperament'] })}>{TEMPERAMENTS.map(s => <option key={s}>{s}</option>)}</select></Field>
                <Field label="Weak to (x1.25)"><select className={INPUT} value={def.ai.weaknessBranch} onChange={e => editAi({ weaknessBranch: e.target.value as TargetDef['ai']['weaknessBranch'] })}>{BRANCHES.map(s => <option key={s}>{s}</option>)}</select></Field>
                <Field label="Resists (x0.75)"><select className={INPUT} value={def.ai.resistanceBranch} onChange={e => editAi({ resistanceBranch: e.target.value as TargetDef['ai']['resistanceBranch'] })}>{BRANCHES.map(s => <option key={s}>{s}</option>)}</select></Field>
              </div>
              <Field label="Chatter: when the case starts"><input className={INPUT} value={def.ai.chatter.onStart} onChange={e => editAi({ chatter: { ...def.ai.chatter, onStart: e.target.value } })} /></Field>
              <Field label="Chatter: when things get critical"><input className={INPUT} value={def.ai.chatter.onCritical} onChange={e => editAi({ chatter: { ...def.ai.chatter, onCritical: e.target.value } })} /></Field>
              {(['onChannelBought', 'onEvidenceDropped', 'onBackfire'] as const).map(k => (
                <Field key={k} label={`Chatter: ${k} (optional)`} hint="Leave empty to use the temperament's lines"><input className={INPUT} value={def.ai.chatter[k] ?? ''} onChange={e => editAi({ chatter: { ...def.ai.chatter, [k]: e.target.value } })} /></Field>
              ))}
            </Section>

            <Section title="Scandals" right={<Btn disabled={def.scandals.length >= 4} onClick={() => edit({ scandals: [...def.scandals, { category: SCANDAL_CATEGORIES.find(c => !def.scandals.some(s => s.category === c)) ?? 'FINANCIAL', title: '' }] })}>+ Add</Btn>}>
              <p className="text-[12px] text-slate-600">The first scandal is the Target's main story (and the default in Story Mode). One per category.</p>
              {def.scandals.map((s, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select className={`${INPUT} w-40`} value={s.category} onChange={e => edit({ scandals: def.scandals.map((x, k) => (k === i ? { ...x, category: e.target.value as typeof s.category } : x)) })}>
                    {SCANDAL_CATEGORIES.map(c => <option key={c} value={c}>{SCANDALS[c].label}</option>)}
                  </select>
                  <input className={INPUT} placeholder="Headline" value={s.title} onChange={e => edit({ scandals: def.scandals.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)) })} />
                  <Btn disabled={def.scandals.length < 2} onClick={() => edit({ scandals: def.scandals.filter((_, k) => k !== i) })}>✕</Btn>
                </div>
              ))}
            </Section>

            <Section title="Abilities" right={<Btn disabled={def.abilities.length >= 3} onClick={() => edit({ abilities: [...def.abilities, { kind: 'DISTRACTION', every: 9, start: 8, strength: 10, stamp: 'DISTRACTION', headline: 'A Distraction Appears', line: '{Target} changes the subject.' }] })}>+ Add</Btn>}>
              {def.abilities.map((a, i) => {
                const upd = (patch: Partial<typeof a>) => edit({ abilities: def.abilities.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
                const r = ABILITY_RANGE[a.kind];
                return (
                  <div key={i} className="border border-slate-300 rounded p-2 flex flex-col gap-2">
                    <div className="grid grid-cols-4 gap-2">
                      <Field label="Kind"><select className={INPUT} value={a.kind} onChange={e => upd({ kind: e.target.value as typeof a.kind })}>{ABILITY_KINDS.map(k => <option key={k}>{k}</option>)}</select></Field>
                      <Field label="Every (days)"><input type="number" className={INPUT} value={a.every} onChange={e => upd({ every: Number(e.target.value) })} /></Field>
                      <Field label="First day"><input type="number" className={INPUT} value={a.start} onChange={e => upd({ start: Number(e.target.value) })} /></Field>
                      <Field label="Strength" hint={`${r.min}-${r.max}: ${r.unit}`}><input type="number" className={INPUT} value={a.strength} onChange={e => upd({ strength: Number(e.target.value) })} /></Field>
                    </div>
                    {a.kind === 'INJUNCTION' && (
                      <Field label="Targets lane (optional)"><select className={INPUT} value={a.branch ?? ''} onChange={e => upd({ branch: (e.target.value || undefined) as typeof a.branch })}><option value="">Any lane</option>{BRANCHES.map(b => <option key={b}>{b}</option>)}</select></Field>
                    )}
                    <Field label="Stamp"><input className={INPUT} value={a.stamp} onChange={e => upd({ stamp: e.target.value })} /></Field>
                    <Field label="Headline"><input className={INPUT} value={a.headline} onChange={e => upd({ headline: e.target.value })} /></Field>
                    <Field label="Body (use {Target})"><textarea rows={2} className={INPUT} value={a.line} onChange={e => upd({ line: e.target.value })} /></Field>
                    <div><Btn tone="crimson" disabled={def.abilities.length < 2} onClick={() => edit({ abilities: def.abilities.filter((_, k) => k !== i) })}>Remove ability</Btn></div>
                  </div>
                );
              })}
            </Section>

            <Section title="Passive rules (optional)">
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['doubtAdd', 'Starting Doubt +', '0-20'], ['doubtFlat', 'Starting Doubt (fixed)', '0-60'], ['coverUpRate', 'Cover-Up rate x', '0.7-1.5'],
                  ['eliteFriction', 'Elite friction', '0.1-0.8'], ['counterHeat', 'Counter-offensive Heat', '0-15'], ['forgeryRisk', 'Forgery risk +', '0-0.4'], ['staleRate', 'Story stale rate x', '0.8-1.5']
                ].map(([k, label, hint]) => (
                  <Field key={k} label={label} hint={hint}><input type="number" step="any" className={INPUT} value={(def.mods as Record<string, number | undefined>)[k] ?? ''} onChange={e => setMod(k, e.target.value)} /></Field>
                ))}
              </div>
              <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={!!def.mods.spinHubs} onChange={e => edit({ mods: { ...def.mods, spinHubs: e.target.checked || undefined } })} /> Spin bubbles twice as likely in the online hubs</label>
            </Section>
          </div>

          {/* ---------------- RIGHT: checks and preview */}
          <div className="flex flex-col gap-3 md:sticky md:top-3">
            <Section title="Checks">
              {v.errors.length === 0 && v.warnings.length === 0 && <div className="text-[13px] text-[#065F46] font-bold">✓ No problems found.</div>}
              {v.errors.map((m, i) => <div key={'e' + i} className="text-[12px] text-[#8B0000] font-bold">✕ {m}</div>)}
              {v.warnings.map((m, i) => <div key={'w' + i} className="text-[12px] text-[#B45309]">⚠ {m}</div>)}
              <div className="text-[11px] text-slate-500">Threat score {v.errors.length ? '—' : threatScore(def)} • estimated rating {estimateRating(def)}</div>
            </Section>

            <Section title="Balance test" right={<Btn tone="ink" disabled={v.errors.length > 0 || balance === 'running'} onClick={runBalance}>{balance === 'running' ? 'Running…' : 'Run bots'}</Btn>}>
              <p className="text-[12px] text-slate-600">Plays 20 games with an expert and an average bot. Typical results for this tier: Tier 1 ≈ 99 / 93%, Tier 2 ≈ 99 / 91%, Tier 3 ≈ 84 / 59%, Tier 4 ≈ 78 / 49%, Tier 5 ≈ 66 / 20%.</p>
              {balance && balance !== 'running' && (
                <div className="text-[13px]">
                  <div>Expert bot wins <b>{balance.expert}%</b> • average bot wins <b>{balance.average}%</b> ({balance.runs} runs each)</div>
                  {balance.expert < 35 && <div className="text-[#8B0000] font-bold">Very hard: a skilled human may struggle. Soften an ability or lower the tier.</div>}
                  {balance.expert >= 35 && balance.expert < 60 && def.tier <= 3 && <div className="text-[#B45309]">Harder than usual for this tier.</div>}
                  {balance.average > 97 && balance.expert > 97 && def.tier >= 3 && <div className="text-[#B45309]">Very easy for this tier. Add pressure or raise the tier.</div>}
                  {balance.expert >= 35 && balance.average >= 5 && <div className="text-[#065F46] font-bold">Within a playable range.</div>}
                </div>
              )}
            </Section>

            <Section title="What the player sees">
              {preview ? (
                <div className="bg-[#1A1A1A] text-[#F4F1EA] rounded-lg p-3">
                  <div className="flex gap-3">
                    <Avatar target={preview} className="w-14 h-16 bg-[#D9CBB0] rounded flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-serif font-black leading-tight">{preview.fullName}</div>
                      <div className="text-[12px] text-slate-300">{preview.title} • Rating {preview.prRating}</div>
                      {preview.creator && <div className="text-[11px] text-[#FDE68A]">★ Featured creator (appears with permission)</div>}
                    </div>
                  </div>
                  <p className="text-[12px] italic text-slate-300 mt-2">{preview.personality}</p>
                  <div className="text-[11px] font-black uppercase tracking-widest text-[#FDE68A] mt-2">Passive: {preview.passiveName}</div>
                  <ul className="mt-1 flex flex-col gap-0.5">{describeTarget(preview).map(l => <li key={l} className="text-[12px]">• {l}</li>)}</ul>
                  <div className="text-[11px] italic text-slate-400 mt-2">“{preview.ai.chatter.onStart}”</div>
                </div>
              ) : <div className="text-[12px] text-slate-500">Fix the errors to see the preview.</div>}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};
