import React, { useEffect, useState } from 'react';
import { BrutalButton, PaperGrain } from './common';
import { sfx, useNowPlaying } from '../audio';
import { STATIONS } from '../music/director';
import { TRACKS, getTrack } from '../music/library';
import { TextSize, exportProgressCode, parseProgressCode, resetSettings, updateSettings, useSettings } from '../settings';
import { MetaProfile } from '../../engine/profile';
import { OWNER, checkSecret, creditsVisible, triggerEgg } from '../egg';
import { redeemLicense } from '../../engine/premium';
import { disableReminders, enableReminders, notifyRemindersChanged, reminderStatus } from '../notify';
import { PREMIUM_NAME } from '../../config';
import { BALANCE } from '../../engine/balance';

interface Props {
  profile: MetaProfile;
  inMatch?: boolean;                       // Opened from the pause menu: some options only apply to the next case
  onClose: () => void;
  onReplayTutorial: () => void;
  onImportProgress: (raw: unknown) => boolean;
  onEraseProgress: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-2 border-[#1A1A1A] rounded-lg bg-white/70 p-3">
    <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#8B0000] mb-2">{title}</div>
    <div className="flex flex-col gap-2.5">{children}</div>
  </div>
);

const Toggle: React.FC<{ label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, hint, value, onChange }) => (
  <button
    type="button" role="switch" aria-checked={value}
    onClick={() => { onChange(!value); sfx.play('click'); }}
    className="flex items-center justify-between gap-3 text-left cursor-pointer"
  >
    <span className="min-w-0">
      <span className="block text-[12px] font-bold leading-tight">{label}</span>
      {hint && <span className="block text-[10px] font-sans text-slate-600 leading-snug">{hint}</span>}
    </span>
    <span className={`flex-shrink-0 w-11 h-6 rounded-full border-2 border-[#1A1A1A] relative transition-colors ${value ? 'bg-[#065F46]' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white border border-[#1A1A1A] transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
    </span>
  </button>
);

const Slider: React.FC<{ label: string; value: number; onChange: (v: number) => void; onRelease?: () => void }> = ({ label, value, onChange, onRelease }) => (
  <label className="flex items-center gap-3">
    <span className="w-16 text-[11px] font-bold flex-shrink-0">{label}</span>
    <input
      type="range" min={0} max={100} value={Math.round(value * 100)}
      onChange={e => onChange(Number(e.target.value) / 100)}
      onPointerUp={onRelease} onKeyUp={onRelease}
      aria-label={`${label} volume`}
      className="flex-1 accent-[#8B0000]"
    />
    <span className="w-8 text-right text-[10px] font-mono">{Math.round(value * 100)}</span>
  </label>
);

export const SettingsSheet: React.FC<Props> = ({ profile, inMatch, onClose, onReplayTutorial, onImportProgress, onEraseProgress }) => {
  const s = useSettings();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmErase, setConfirmErase] = useState(false);
  const [jukebox, setJukebox] = useState(false);
  const [redeem, setRedeem] = useState('');
  const [redeemMsg, setRedeemMsg] = useState<string | null>(null);
  const doRedeem = async () => {
    sfx.play('click');
    if (redeem.trim().startsWith('RUMP1.')) {
      if ((await redeemLicense(redeem)) === 'ok') { setRedeem(''); setRedeemMsg(`${PREMIUM_NAME} unlocked. Thank you!`); sfx.play('win'); } else setRedeemMsg('That licence is not valid, or it has expired.');
      return;
    }
    if (await checkSecret(redeem)) { setRedeem(''); setRedeemMsg(null); triggerEgg('phrase'); return; }
    setRedeemMsg(redeem.trim() ? 'That code did nothing. Maybe next time.' : 'Type a code first.');
  };
  const { id: playingId, auditioning } = useNowPlaying();
  // Leaving Settings hands the soundtrack back to the game.
  useEffect(() => () => { sfx.auditionTrack(null); }, []);

  const doExport = async () => {
    const out = exportProgressCode(JSON.stringify(profile));
    setCode(out);
    try { await navigator.clipboard.writeText(out); setMsg('Progress code copied. Paste it on another device to carry on.'); }
    catch { setMsg('Copy the code below to move your progress.'); }
  };
  const doImport = () => {
    const raw = parseProgressCode(code);
    const ok = raw !== null && onImportProgress(raw);
    setMsg(ok ? 'Progress restored.' : 'That code is not valid. Nothing was changed.');
    if (ok) sfx.play('buy');
  };
  const sizes: TextSize[] = ['S', 'M', 'L'];

  return (
    <div className="absolute inset-0 z-[60] bg-[#1A1A1A]/75 backdrop-blur-sm flex items-end justify-center animate-fade-in desk-wrap" onClick={onClose}>
      <div
        role="dialog" aria-label="Settings"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-h-[92%] bg-[#F4F1EA] border-t-4 border-x-4 border-[#1A1A1A] rounded-t-2xl flex flex-col animate-slide-up overflow-hidden desk-sheet"
      >
        <PaperGrain />
        <div className="relative flex items-center justify-between px-4 pt-3 pb-2 border-b-2 border-[#1A1A1A] flex-shrink-0">
          <div>
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-[#8B0000]">Preferences</div>
            <div className="font-serif font-black text-xl leading-none">Settings</div>
          </div>
          <button onClick={onClose} aria-label="Close settings" className="w-11 h-11 rounded-full border-2 border-[#1A1A1A] bg-white font-black cursor-pointer">✕</button>
        </div>

        <div className="relative overflow-y-auto no-scrollbar p-3 flex flex-col gap-3">
          <Section title="Sound">
            <Toggle label="Sound on" value={!s.muted} onChange={v => updateSettings({ muted: !v })} />
            <Slider label="Master" value={s.master} onChange={v => updateSettings({ master: v })} />
            <Slider label="Music" value={s.music} onChange={v => updateSettings({ music: v })} onRelease={() => sfx.preview('music')} />
            <Slider label="Effects" value={s.sfx} onChange={v => updateSettings({ sfx: v })} onRelease={() => sfx.preview('sfx')} />
            <Slider label="Ambience" value={s.ambient} onChange={v => updateSettings({ ambient: v })} onRelease={() => sfx.preview('ambient')} />
            <Toggle label="Vibration" hint="Phone haptics on big moments." value={s.haptics} onChange={v => updateSettings({ haptics: v })} />
          </Section>

          <Section title="Music">
            <div className="text-[10px] font-sans text-slate-600 leading-snug">Pick a station, or let the soundtrack follow your case: calm in the Dossier, a groove while you play, tense when Heat climbs.</div>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Music station">
              {STATIONS.map(st => (
                <button
                  key={st.id} role="radio" aria-checked={s.musicStyle === st.id}
                  onClick={() => { updateSettings({ musicStyle: st.id }); sfx.play('click'); }}
                  className={`px-2.5 py-1 rounded-full border-2 border-[#1A1A1A] text-[11px] font-black cursor-pointer ${s.musicStyle === st.id ? 'bg-[#1A1A1A] text-[#F4F1EA]' : 'bg-white'}`}
                >{st.name}</button>
              ))}
            </div>
            <div className="text-[10px] font-sans text-slate-500 -mt-1">{STATIONS.find(x => x.id === s.musicStyle)?.blurb}</div>
            <div className="text-[11px] font-sans">Now playing: <b>{playingId ? (getTrack(playingId)?.name ?? playingId) : 'nothing yet'}</b></div>
            <button onClick={() => setJukebox(v => !v)} aria-expanded={jukebox} className="text-left text-[11px] font-black uppercase tracking-wider underline cursor-pointer">{jukebox ? '▾ Hide the jukebox' : '▸ Open the jukebox'} ({TRACKS.length} tracks)</button>
            {jukebox && (
              <ul className="flex flex-col gap-1">
                {TRACKS.map(tr => {
                  const active = auditioning === tr.id;
                  return (
                    <li key={tr.id} className={`flex items-center gap-2 border rounded-lg px-2 py-1 ${active ? 'border-[#8B0000] bg-[#FEE2E2]' : 'border-slate-300 bg-white'}`}>
                      <button
                        onClick={() => { sfx.auditionTrack(active ? null : tr.id); }}
                        aria-label={`${active ? 'Stop' : 'Play'} ${tr.name}`}
                        className="w-7 h-7 flex-shrink-0 rounded-full border-2 border-[#1A1A1A] bg-[#1A1A1A] text-white text-[11px] cursor-pointer"
                      >{active ? '■' : '▶'}</button>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-bold leading-tight truncate">{tr.name}</div>
                        <div className="text-[10px] font-sans text-slate-500 leading-snug truncate">{tr.genre} • {tr.bpm} BPM • {tr.blurb}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section title="Layout">
            <div className="text-[10px] font-sans text-slate-600 leading-snug">The desktop layout is a situation room for big screens. Auto switches by window size.</div>
            <div className="flex border-2 border-[#1A1A1A] rounded-lg overflow-hidden self-start" role="radiogroup" aria-label="Layout">
              {(['auto', 'mobile', 'desktop'] as const).map(l => (
                <button key={l} role="radio" aria-checked={s.layout === l} onClick={() => { updateSettings({ layout: l }); sfx.play('click'); }}
                  className={`px-3.5 py-1 font-black text-[12px] capitalize cursor-pointer ${s.layout === l ? 'bg-[#1A1A1A] text-[#F4F1EA]' : 'bg-white'}`}>{l}</button>
              ))}
            </div>
          </Section>

          <Section title="Comfort and accessibility">
            <Toggle label="Reduce motion" hint="Turns off confetti, pulsing and most animation." value={s.reduceMotion} onChange={v => updateSettings({ reduceMotion: v })} />
            <Toggle label="Screen shake" value={s.shake && !s.reduceMotion} onChange={v => updateSettings({ shake: v })} />
            <Toggle label="Heat and mood overlay" hint="The red vignette and colour shifts as a case heats up." value={s.vignette} onChange={v => updateSettings({ vignette: v })} />
            <Toggle label="High contrast" value={s.highContrast} onChange={v => updateSettings({ highContrast: v })} />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] font-bold">Text size</span>
              <div className="flex border-2 border-[#1A1A1A] rounded-lg overflow-hidden" role="radiogroup" aria-label="Text size">
                {sizes.map(z => (
                  <button
                    key={z} role="radio" aria-checked={s.textSize === z}
                    onClick={() => { updateSettings({ textSize: z }); sfx.play('click'); }}
                    className={`px-3.5 py-1 font-black cursor-pointer ${s.textSize === z ? 'bg-[#1A1A1A] text-[#F4F1EA]' : 'bg-white'}`}
                  >{z}</button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Gameplay">
            <Toggle
              label="Assist Mode"
              hint={`Each day lasts ${Math.round((BALANCE.assistTickMult - 1) * 100)}% longer so you have more time to think. Assisted wins pay half the envelopes, cap at 1 star and skip the Daily bonus.${inMatch ? ' Applies from the next case.' : ''}`}
              value={s.assist} onChange={v => updateSettings({ assist: v })}
            />
            <Toggle label="Show hints" hint="Short one-time tips the first time something new happens." value={s.hints} onChange={v => updateSettings({ hints: v })} />
            <BrutalButton tone="paper" className="py-2" onClick={() => { onReplayTutorial(); onClose(); }}>↺ Replay the tutorial</BrutalButton>
          </Section>

          <Section title="Your data">
            <div className="text-[10px] font-sans text-slate-600 leading-snug">
              Stars, envelopes and perks live on this device. A progress code lets you move them to another one.
            </div>
            <div className="flex gap-2">
              <BrutalButton tone="paper" className="flex-1 py-2" onClick={doExport}>Export code</BrutalButton>
              <BrutalButton tone="paper" className="flex-1 py-2" onClick={doImport} disabled={!code.trim()}>Import code</BrutalButton>
            </div>
            <textarea
              value={code} onChange={e => setCode(e.target.value)} rows={3} placeholder="Progress code"
              aria-label="Progress code"
              className="w-full text-[10px] font-mono border-2 border-[#1A1A1A] rounded-lg p-2 bg-white resize-none"
            />
            {msg && <div className="text-[10px] font-bold text-[#8B0000]" role="status">{msg}</div>}
            {!confirmErase ? (
              <BrutalButton tone="paper" className="py-2" onClick={() => setConfirmErase(true)}>Erase all progress…</BrutalButton>
            ) : (
              <div className="border-2 border-dashed border-[#8B0000] rounded-lg p-3 bg-[#FEE2E2]">
                <div className="text-[11px] font-bold text-[#8B0000] mb-2">This wipes stars, envelopes, perks and the archive. It cannot be undone.</div>
                <div className="flex gap-2">
                  <BrutalButton tone="crimson" className="flex-1 py-2" onClick={() => { onEraseProgress(); setConfirmErase(false); setMsg('Progress erased.'); }}>Erase</BrutalButton>
                  <BrutalButton tone="paper" className="flex-1 py-2" onClick={() => setConfirmErase(false)}>Keep it</BrutalButton>
                </div>
              </div>
            )}
          </Section>

          <Section title="Daily reminders">
            {(() => {
              const st = reminderStatus();
              if (st === 'unsupported') return <div className="text-[11px] font-sans text-slate-600 leading-snug">This browser cannot show reminders. Installing the game to your home screen usually fixes that.</div>;
              if (st === 'soon') return (
                <>
                  <div className="text-[11px] font-sans text-slate-600 leading-snug">Daily reminders are coming soon: a nudge when the Daily Case is ready, and a warning before your streak ends.</div>
                  <Toggle label="Tell me when they are ready" value={s.remindersInterest} onChange={v => updateSettings({ remindersInterest: v })} />
                </>
              );
              return (
                <>
                  <Toggle
                    label="Remind me to play"
                    hint={st === 'blocked' ? 'Notifications are blocked for this site. Allow them in your browser settings first.' : 'One gentle reminder a day, and a streak warning. Turn off any time.'}
                    value={st === 'on'}
                    onChange={async v => { if (v) await enableReminders(); else await disableReminders(); notifyRemindersChanged(); }}
                  />
                </>
              );
            })()}
          </Section>

          <Section title="Redeem a code">
            <div className="text-[10px] font-sans text-slate-600 leading-snug">Heard a code from a creator, or on the grapevine? A licence code unlocks the Gist Pass. Type or paste it here.</div>
            <div className="flex gap-2">
              <input value={redeem} onChange={e => setRedeem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void doRedeem(); }} aria-label="Code" placeholder="Code" autoComplete="off" autoCapitalize="characters" className="flex-1 min-w-0 border-2 border-[#1A1A1A] rounded-lg px-2 py-1.5 text-[13px] font-mono bg-white uppercase" />
              <BrutalButton tone="paper" className="py-1.5 px-4" onClick={() => void doRedeem()}>Redeem</BrutalButton>
            </div>
            {redeemMsg && <div role="status" className="text-[11px] font-bold text-[#8B0000]">{redeemMsg}</div>}
          </Section>

          {creditsVisible() && (
            <Section title="Credits">
              <div className="text-[13px] font-serif font-black leading-tight">{OWNER.name}</div>
              <div className="text-[11px] font-sans text-slate-600">{OWNER.title}. © {OWNER.year}. All rights reserved.</div>
            </Section>
          )}

          <button onClick={() => { resetSettings(); sfx.play('click'); }} className="text-[10px] font-bold underline text-slate-600 cursor-pointer self-center pb-2">
            Restore default settings
          </button>
        </div>
      </div>
    </div>
  );
};
