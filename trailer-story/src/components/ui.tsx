import React from 'react';
import { random } from 'remotion';
import { C } from '../theme';
import { FONT } from '../fonts';
import { clamp01, easeOut } from '../fx';
import { typed } from './kinetic';

export const APOLOGY_BODY =
  'I want to address the allegations against the owner of The Receipts. I take full responsibility. I have been selfish, and I have hurt people I love. I am deeply sorry.';
export const SIGNOFF = 'Peace and light.';

/* ------------------------------------------------------------------ phone chrome */

/** A phone seen face-on. `children` fill the screen. The glow is the light the screen throws on the room. */
export const Phone: React.FC<{ w: number; children: React.ReactNode; glow?: number; screen?: string; on?: number; style?: React.CSSProperties }> = ({
  w,
  children,
  glow = 1,
  screen = '#0B0E13',
  on = 1,
  style,
}) => {
  const h = w * 2.05;
  const r = w * 0.15;
  return (
    <div
      style={{
        position: 'absolute',
        left: -w / 2,
        top: -h / 2,
        width: w,
        height: h,
        borderRadius: r,
        background: 'linear-gradient(145deg,#2a2f38,#0c0e12 55%,#1a1d23)',
        padding: w * 0.022,
        boxShadow: `0 0 ${w * 0.9 * glow * on}px rgba(120,185,255,${0.22 * glow * on}), 0 30px 80px rgba(0,0,0,.7), inset 0 0 0 2px rgba(255,255,255,.07)`,
        ...style,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: r * 0.82, overflow: 'hidden', background: on > 0.02 ? screen : '#030405' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: on }}>{children}</div>
        {/* island */}
        <div style={{ position: 'absolute', top: w * 0.035, left: '50%', width: w * 0.28, height: w * 0.075, marginLeft: -w * 0.14, borderRadius: w, background: '#000', zIndex: 9 }} />
        {/* glass reflection */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 28%)', pointerEvents: 'none', zIndex: 10 }} />
      </div>
    </div>
  );
};

export const StatusBar: React.FC<{ w: number; time: string; dark?: boolean }> = ({ w, time, dark }) => (
  <div style={{ position: 'absolute', top: w * 0.03, left: w * 0.07, right: w * 0.07, display: 'flex', justifyContent: 'space-between', fontFamily: FONT.sans, fontWeight: 700, fontSize: w * 0.05, color: dark ? C.ink : '#fff', zIndex: 8 }}>
    <span>{time}</span>
    <span style={{ display: 'flex', alignItems: 'flex-end', gap: w * 0.012 }}>
      {[0.3, 0.45, 0.6, 0.75].map((hh, i) => (
        <i key={i} style={{ display: 'block', width: w * 0.018, height: w * 0.05 * hh * 1.3, background: dark ? C.ink : '#fff', borderRadius: 1 }} />
      ))}
      <i style={{ display: 'block', marginLeft: w * 0.025, width: w * 0.075, height: w * 0.036, border: `2px solid ${dark ? C.ink : '#fff'}`, borderRadius: w * 0.01, position: 'relative' }}>
        <i style={{ position: 'absolute', inset: 2, background: dark ? C.ink : '#fff', borderRadius: 1 }} />
      </i>
    </span>
  </div>
);

/** Notes-app apology. `p` types it (0..1), `signP` types the sign-off, `circle` draws a red scribble round the target phrase. */
export const NotesApology: React.FC<{ w: number; p: number; signP?: number; circle?: number; time?: string; hot?: boolean }> = ({ w, p, signP = 0, circle = 0, time = '6:06', hot }) => {
  const fs = w * 0.056;
  const head = 'To the public,';
  const full = `${head}\n${APOLOGY_BODY}`;
  const shown = typed(full, p);
  const cursor = p < 1 || signP < 1 ? '▍' : '';
  const target = 'the owner of The Receipts';
  const idx = shown.indexOf(target);
  const done = idx >= 0 ? shown.slice(0, idx + target.length) : shown;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#121316', color: '#EDEDED', fontFamily: FONT.sans }}>
      <StatusBar w={w} time={time} />
      <div style={{ position: 'absolute', top: w * 0.17, left: w * 0.07, right: w * 0.07, display: 'flex', justifyContent: 'space-between', color: '#F5C84B', fontWeight: 500, fontSize: fs * 0.82 }}>
        <span>‹ Notes</span>
        <span style={{ opacity: 0.8 }}>Done</span>
      </div>
      <div style={{ position: 'absolute', top: w * 0.31, left: w * 0.07, right: w * 0.07, fontSize: fs * 0.62, color: '#8b8d93', textAlign: 'center' }}>Today at {time} PM</div>
      <div style={{ position: 'absolute', top: w * 0.4, left: w * 0.07, right: w * 0.07, fontSize: fs, lineHeight: 1.38, fontWeight: 500, whiteSpace: 'pre-wrap', letterSpacing: '-0.005em' }}>
        <div style={{ position: 'relative' }}>
          {shown.split('\n').map((line, i) => (
            <div key={i} style={{ minHeight: fs * 0.6 }}>
              {line}
            </div>
          ))}
          {/* the scribble: a hand-drawn loop round "the owner of The Receipts" */}
          {circle > 0 && idx >= 0 && (
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
              <path
                d="M8 31 C 4 21, 34 18, 62 21 S 96 24, 92 33 C 88 43, 40 43, 22 40 C 6 38, 2 30, 14 24"
                fill="none"
                stroke={C.siren}
                strokeWidth={0.9}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - easeOut(circle)}
                style={{ filter: `drop-shadow(0 0 ${w * 0.01}px rgba(225,29,72,.8))` }}
              />
            </svg>
          )}
        </div>
        <div style={{ marginTop: fs * 0.9, color: hot ? C.siren : '#EDEDED', fontWeight: 700, textShadow: hot ? '0 0 22px rgba(225,29,72,.7)' : undefined }}>
          {typed(SIGNOFF, signP)}
          <span style={{ color: '#F5C84B' }}>{cursor}</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: w * 0.9, background: 'linear-gradient(0deg, #121316 25%, rgba(18,19,22,0))' }} />
    </div>
  );
};

/* ------------------------------------------------------------------ chat */

export const Bubble: React.FC<{ text: string; w: number; side?: 'in' | 'out'; t?: number; who?: string; big?: boolean }> = ({ text, w, side = 'in', t = 99, who, big }) => {
  if (t < 0) return null;
  const p = easeOut(clamp01(t / 7));
  return (
    <div style={{ alignSelf: side === 'in' ? 'flex-start' : 'flex-end', maxWidth: '82%', transform: `translateY(${(1 - p) * 26}px) scale(${0.92 + p * 0.08})`, opacity: p, transformOrigin: side === 'in' ? 'left bottom' : 'right bottom' }}>
      {who && <div style={{ fontFamily: FONT.mono, fontSize: w * 0.034, color: '#7f8ea0', marginBottom: 4, marginLeft: 6, letterSpacing: '0.08em' }}>{who}</div>}
      <div
        style={{
          background: side === 'in' ? C.bubble : C.bubbleSelf,
          color: '#EAF1F8',
          fontFamily: FONT.sans,
          fontWeight: big ? 700 : 500,
          fontSize: w * (big ? 0.066 : 0.056),
          lineHeight: 1.22,
          padding: `${w * 0.034}px ${w * 0.05}px`,
          borderRadius: w * 0.055,
          borderTopLeftRadius: side === 'in' ? w * 0.014 : w * 0.055,
          borderTopRightRadius: side === 'out' ? w * 0.014 : w * 0.055,
          boxShadow: '0 2px 10px rgba(0,0,0,.35)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const TypingDots: React.FC<{ w: number; f: number }> = ({ w, f }) => (
  <div style={{ alignSelf: 'flex-start', background: C.bubble, padding: `${w * 0.04}px ${w * 0.06}px`, borderRadius: w * 0.055, display: 'flex', gap: w * 0.022 }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: w * 0.026, height: w * 0.026, borderRadius: '50%', background: '#9fb2c6', opacity: 0.35 + 0.65 * Math.max(0, Math.sin(f * 0.22 - i * 0.9)) }} />
    ))}
  </div>
);

/** iOS-style lock-screen notification banner. */
export const Banner: React.FC<{ w: number; t: number; app: string; title: string; body: React.ReactNode; time?: string; accent?: string; blurBody?: boolean }> = ({ w, t, app, title, body, time = 'now', accent = '#34D399', blurBody }) => {
  if (t < 0) return null;
  const p = easeOut(clamp01(t / 9));
  return (
    <div
      style={{
        width: w,
        background: 'rgba(38,42,50,.88)',
        backdropFilter: 'blur(18px)',
        borderRadius: w * 0.07,
        padding: `${w * 0.045}px ${w * 0.05}px`,
        boxShadow: '0 12px 40px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.08)',
        transform: `translateY(${(1 - p) * -60}px) scale(${0.94 + p * 0.06})`,
        opacity: p,
        fontFamily: FONT.sans,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: w * 0.03, marginBottom: w * 0.02 }}>
        <div style={{ width: w * 0.07, height: w * 0.07, borderRadius: w * 0.018, background: accent }} />
        <div style={{ fontFamily: FONT.mono, fontSize: w * 0.034, letterSpacing: '0.12em', color: '#9fb0c2', textTransform: 'uppercase', flex: 1 }}>{app}</div>
        <div style={{ fontSize: w * 0.034, color: '#9fb0c2' }}>{time}</div>
      </div>
      <div style={{ fontWeight: 700, fontSize: w * 0.05, color: '#fff' }}>{title}</div>
      <div style={{ fontSize: w * 0.046, color: '#d5dde6', marginTop: 2, filter: blurBody ? 'blur(5px)' : undefined, lineHeight: 1.25 }}>{body}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ profile + voice note */

export const ProfileCard: React.FC<{ w: number; followers: number; t?: number; locked?: number }> = ({ w, followers, t = 99, locked = 0 }) => {
  const p = easeOut(clamp01(t / 12));
  return (
    <div
      style={{
        width: w,
        background: 'linear-gradient(160deg, rgba(24,30,40,.96), rgba(10,13,18,.98))',
        borderRadius: w * 0.05,
        padding: w * 0.07,
        fontFamily: FONT.sans,
        color: '#fff',
        boxShadow: `0 40px 110px rgba(0,0,0,.75), 0 0 ${w * 0.5}px rgba(120,185,255,.12), inset 0 0 0 1px rgba(255,255,255,.09)`,
        transform: `translateY(${(1 - p) * 60}px)`,
        opacity: clamp01(p * 2),
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: w * 0.06 }}>
        <div style={{ width: w * 0.2, height: w * 0.2, borderRadius: '50%', background: `conic-gradient(from 210deg, ${C.siren}, #7f1d1d, ${C.siren})`, display: 'grid', placeItems: 'center', fontFamily: FONT.serif, fontWeight: 900, fontSize: w * 0.11 }}>R</div>
        <div>
          <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: w * 0.095, lineHeight: 1 }}>The Receipts</div>
          <div style={{ fontFamily: FONT.mono, fontSize: w * 0.04, color: '#7f8ea0', marginTop: w * 0.015, letterSpacing: '0.06em' }}>@thereceipts</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: w * 0.08, marginTop: w * 0.07, alignItems: 'baseline' }}>
        <div style={{ fontFamily: FONT.display, fontSize: w * 0.17, lineHeight: 1 }}>{Math.round(followers).toLocaleString('en-US')}</div>
        <div style={{ fontFamily: FONT.mono, fontSize: w * 0.04, letterSpacing: '0.18em', color: '#7f8ea0' }}>FOLLOWERS</div>
      </div>
      <div style={{ marginTop: w * 0.05, fontSize: w * 0.048, color: '#c3cfdb', lineHeight: 1.3 }}>Gist with proof. No screenshots, no mercy.</div>
      {locked > 0 && <div style={{ position: 'absolute', inset: 0, borderRadius: w * 0.05, boxShadow: `inset 0 0 ${w * 0.12 * locked}px rgba(225,29,72,${0.5 * locked})` }} />}
    </div>
  );
};

export const Waveform: React.FC<{ w: number; h: number; playhead: number; seed?: string; color?: string }> = ({ w, h, playhead, seed = 'wv', color = '#9fd0ff' }) => {
  const bars = 46;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: w / bars / 2.2, height: h, width: w }}>
      {Array.from({ length: bars }, (_, i) => {
        const base = 0.22 + random(`${seed}${i}`) * 0.78;
        const shape = Math.sin((i / bars) * Math.PI) * 0.55 + 0.45;
        const played = i / bars < playhead;
        return <div key={i} style={{ flex: 1, height: `${base * shape * 100}%`, minHeight: 4, borderRadius: 3, background: played ? color : 'rgba(159,208,255,.28)', boxShadow: played ? `0 0 10px ${color}` : undefined }} />;
      })}
    </div>
  );
};

/** What every cornered person posts. Same words, same format, every time. */
export const TARGET_APOLOGY =
  'I take full responsibility for my actions. I have been selfish, and I have hurt people I love. I am deeply sorry.';
