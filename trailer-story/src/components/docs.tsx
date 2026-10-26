import React from 'react';
import { random } from 'remotion';
import { C } from '../theme';
import { FONT } from '../fonts';
import { PAPER_TEX, FIBER_TEX } from '../texture';
import { clamp01 } from '../fx';
import { Waveform } from './ui';

const paper = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: [PAPER_TEX, FIBER_TEX, `linear-gradient(170deg, ${C.paper}, ${C.paperDeep})`].join(','),
  backgroundSize: '320px 320px, 480px 480px, auto',
  color: C.ink,
  boxShadow: '0 18px 50px rgba(0,0,0,.6), inset 0 0 0 1px rgba(0,0,0,.08)',
  ...extra,
});

const hl = (on: number): React.CSSProperties => ({
  background: `linear-gradient(90deg, rgba(253,224,71,.95) ${on * 100}%, transparent ${on * 100}%)`,
  padding: '0 6px',
});

/* ------------------------------------------------------------------ B: the five receipts */

export const TransferAlert: React.FC<{ w: number; mark?: number }> = ({ w, mark = 1 }) => (
  <div style={paper({ width: w, padding: w * 0.08, fontFamily: FONT.mono, borderRadius: 6 })}>
    <div style={{ fontWeight: 700, fontSize: w * 0.045, letterSpacing: '0.2em', color: C.blood }}>● DEBIT ALERT</div>
    <div style={{ fontFamily: FONT.display, fontSize: w * 0.2, lineHeight: 1.05, marginTop: w * 0.04 }}>₦2,400,000.00</div>
    <div style={{ fontSize: w * 0.05, marginTop: w * 0.04, lineHeight: 1.5 }}>
      TO &nbsp;&nbsp;&nbsp;DUBAI CABANA RESORT
      <br />
      NARR &nbsp;POOLSIDE · 3 NIGHTS
      <br />
      REF &nbsp;&nbsp;<span style={hl(mark)}>7741-HRP-0</span>
    </div>
  </div>
);

export const GroupChatShot: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, background: '#0E1A17', color: '#E8F5EF', borderRadius: w * 0.04, overflow: 'hidden', fontFamily: FONT.sans, boxShadow: '0 18px 50px rgba(0,0,0,.6)' }}>
    <div style={{ background: '#14302A', padding: `${w * 0.045}px ${w * 0.06}px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontWeight: 700, fontSize: w * 0.06 }}>Tea Time ☕</div>
      <div style={{ fontFamily: FONT.mono, fontSize: w * 0.04, opacity: 0.7 }}>47 members</div>
    </div>
    <div style={{ padding: w * 0.05, display: 'flex', flexDirection: 'column', gap: w * 0.03 }}>
      {[
        ['she cried for 2 hours 😭', 'in'],
        ['screenshot it before she deletes', 'in'],
        ['I have the voice note too 👀', 'out'],
      ].map(([t, s], i) => (
        <div key={i} style={{ alignSelf: s === 'in' ? 'flex-start' : 'flex-end', maxWidth: '82%', background: s === 'in' ? '#1D2B28' : '#0B5D4B', padding: `${w * 0.028}px ${w * 0.045}px`, borderRadius: w * 0.04, fontSize: w * 0.052 }}>
          {t}
        </div>
      ))}
    </div>
  </div>
);

export const HrEmail: React.FC<{ w: number; mark?: number }> = ({ w, mark = 1 }) => (
  <div style={paper({ width: w, padding: w * 0.07, fontFamily: FONT.sans, borderRadius: 6 })}>
    <div style={{ fontFamily: FONT.mono, fontSize: w * 0.04, color: '#555', lineHeight: 1.5 }}>
      FROM: hr-legal@■■■■■■■■.ng
      <br />
      SUBJECT: RE: Retention (confidential)
    </div>
    <div style={{ height: 2, background: C.ink, opacity: 0.2, margin: `${w * 0.04}px 0` }} />
    <div style={{ fontSize: w * 0.052, lineHeight: 1.45 }}>
      As discussed with leadership:
      <br />
      <span style={{ fontWeight: 900, fontSize: w * 0.075 }}>
        <span style={hl(mark)}>Do not terminate.</span>
        <br />
        <span style={hl(mark)}>Instruct.</span>
      </span>
    </div>
  </div>
);

export const NotebookPage: React.FC<{ w: number }> = ({ w }) => (
  <div style={paper({ width: w, padding: `${w * 0.09}px ${w * 0.08}px`, borderRadius: 6, background: `repeating-linear-gradient(0deg, transparent 0 ${w * 0.093}px, rgba(40,80,160,.22) ${w * 0.093}px ${w * 0.097}px), ${C.paper}` })}>
    <div style={{ borderLeft: `3px solid rgba(200,40,40,.45)`, paddingLeft: w * 0.05, fontFamily: FONT.hand, fontSize: w * 0.085, lineHeight: `${w * 0.097}px`, color: '#1b2a6b' }}>
      {['H.R.P.   ₦150,000', 'H.R.P.   ₦150,000', 'H.R.P.   ₦150,000', 'H.R.P.   ₦150,000', 'H.R.P.   ₦150,000'].map((l, i) => (
        <div key={i} style={{ opacity: 0.95 }}>{l}</div>
      ))}
    </div>
  </div>
);

export const DeedPage: React.FC<{ w: number; mark?: number }> = ({ w, mark = 1 }) => (
  <div style={paper({ width: w, padding: w * 0.08, fontFamily: FONT.serif, borderRadius: 6, position: 'relative' })}>
    <div style={{ textAlign: 'center', fontWeight: 900, fontSize: w * 0.07, letterSpacing: '0.12em' }}>DEED OF ASSIGNMENT</div>
    <div style={{ height: 2, background: C.ink, margin: `${w * 0.03}px 0`, opacity: 0.4 }} />
    <div style={{ fontSize: w * 0.05, lineHeight: 1.5 }}>
      This deed, made this <span style={{ position: 'relative', fontWeight: 700 }}>14th of March, 2016<span style={{ position: 'absolute', inset: -6, border: `3px solid ${C.siren}`, borderRadius: 40, clipPath: `inset(0 ${100 - mark * 100}% 0 0)` }} /></span>, between the landlord and the occupant…
    </div>
    <div style={{ fontFamily: FONT.hand, fontSize: w * 0.075, color: C.siren, transform: 'rotate(-4deg)', marginTop: w * 0.05, opacity: mark }}>printed 2024 ↑</div>
  </div>
);

/* ------------------------------------------------------------------ D: the board */

export const CctvStill: React.FC<{ w: number; f: number; zoom?: number }> = ({ w, f, zoom = 0 }) => {
  const h = w * 0.68;
  const k = Math.floor(f / 3);
  return (
    <div style={{ width: w, height: h, background: '#080b09', position: 'relative', overflow: 'hidden', boxShadow: '0 18px 50px rgba(0,0,0,.65), 0 0 0 6px #d9d5c7', filter: 'grayscale(.7) contrast(1.15)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 40%, rgba(180,220,190,.35), rgba(8,11,9,0) 60%), linear-gradient(180deg,#101612,#060807)' }} />
      {/* generator house */}
      <div style={{ position: 'absolute', left: '8%', bottom: '8%', width: '36%', height: '52%', background: '#171c18', boxShadow: 'inset 0 0 0 3px #2b332d' }} />
      <div style={{ position: 'absolute', left: '12%', bottom: '8%', width: '12%', height: '38%', background: '#0a0d0b' }} />
      {/* the figure: wide-shouldered, long robe */}
      <div style={{ position: 'absolute', left: '58%', bottom: '8%', width: '15%', height: '68%', transform: `scale(${1 + zoom * 0.08})`, transformOrigin: 'bottom center' }}>
        <div style={{ position: 'absolute', left: '28%', top: 0, width: '44%', height: '17%', borderRadius: '50%', background: '#1c231e', boxShadow: 'inset 0 0 0 2px rgba(190,230,200,.25)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '14%', bottom: 0, background: 'linear-gradient(180deg,#232b25,#0d110e)', clipPath: 'polygon(18% 0, 82% 0, 100% 22%, 92% 100%, 8% 100%, 0 22%)', boxShadow: 'inset 0 0 0 2px rgba(190,230,200,.2)' }} />
      </div>
      {/* scan-lines + flicker */}
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, transparent 2px 5px)', opacity: 0.8 }} />
      <div style={{ position: 'absolute', inset: 0, background: `rgba(190,230,200,${random(`cc${k}`) > 0.9 ? 0.08 : 0})` }} />
      <div style={{ position: 'absolute', left: w * 0.04, top: w * 0.035, fontFamily: FONT.mono, fontSize: w * 0.04, color: '#d7e8da', letterSpacing: '0.08em' }}>
        <span style={{ color: '#f43f5e' }}>● REC</span> &nbsp;CAM 04
      </div>
      <div style={{ position: 'absolute', left: w * 0.04, bottom: w * 0.03, fontFamily: FONT.mono, fontSize: w * 0.04, color: '#d7e8da' }}>BLACKOUT · 02:17:44</div>
      {/* the crop box */}
      <div style={{ position: 'absolute', left: '53%', top: '8%', width: '25%', height: '84%', border: `3px solid ${C.siren}`, opacity: clamp01(zoom * 3), boxShadow: '0 0 20px rgba(225,29,72,.6)' }} />
    </div>
  );
};

export const LedgerPage: React.FC<{ w: number; reveal?: number }> = ({ w, reveal = 1 }) => {
  const bar = (n: number): React.CSSProperties => ({ display: 'inline-block', width: w * n, height: w * 0.06, background: C.ink, verticalAlign: 'middle', borderRadius: 2 });
  return (
    <div style={paper({ width: w, padding: `${w * 0.09}px ${w * 0.08}px`, borderRadius: 6, background: `repeating-linear-gradient(0deg, transparent 0 ${w * 0.1}px, rgba(120,70,30,.28) ${w * 0.1}px ${w * 0.104}px), linear-gradient(170deg,#E7D9B5,#D5C195)`, fontFamily: FONT.hand, fontSize: w * 0.085, color: '#2a1a0c', lineHeight: `${w * 0.104}px` })}>
      <div style={{ opacity: clamp01(reveal * 4) }}>Subject: <b>THE RECEIPTS</b></div>
      <div style={{ opacity: clamp01(reveal * 4 - 1) }}>
        Project <span style={bar(0.34)} />, year 4
      </div>
      <div style={{ opacity: clamp01(reveal * 4 - 2) }}>
        Status: <span style={{ textDecoration: 'underline', textDecorationColor: C.siren, textDecorationThickness: 3 }}>on track.</span>
      </div>
    </div>
  );
};

export const CokerEmail: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, background: '#F1F3F5', color: '#14181d', borderRadius: w * 0.025, overflow: 'hidden', fontFamily: FONT.sans, boxShadow: '0 18px 50px rgba(0,0,0,.6)' }}>
    <div style={{ background: '#1d2b3a', color: '#dce7f3', padding: `${w * 0.035}px ${w * 0.05}px`, fontFamily: FONT.mono, fontSize: w * 0.04, letterSpacing: '0.08em' }}>✉ NEW MESSAGE · CYBERCRIME UNIT</div>
    <div style={{ padding: `${w * 0.05}px ${w * 0.06}px` }}>
      <div style={{ fontFamily: FONT.mono, fontSize: w * 0.038, color: '#5b6672' }}>FROM: Insp. D. Coker</div>
      <div style={{ fontSize: w * 0.058, lineHeight: 1.42, marginTop: w * 0.035, fontWeight: 500 }}>
        “I would like to meet the owner of The Receipts. At your convenience.
        <br />
        <b>Not at mine.</b>”
      </div>
    </div>
  </div>
);

export const OracleChat: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, background: '#0E1620', borderRadius: w * 0.04, padding: w * 0.05, fontFamily: FONT.sans, boxShadow: '0 18px 50px rgba(0,0,0,.65), 0 0 40px rgba(110,170,255,.12)' }}>
    <div style={{ fontFamily: FONT.mono, fontSize: w * 0.04, letterSpacing: '0.1em', color: '#7da3cf', marginBottom: w * 0.03 }}>@OracleNaija · unknown number</div>
    <div style={{ background: '#1F2C3A', color: '#fff', fontWeight: 700, fontSize: w * 0.075, lineHeight: 1.2, padding: `${w * 0.04}px ${w * 0.05}px`, borderRadius: w * 0.05, borderTopLeftRadius: w * 0.014 }}>Chapter two is already written.</div>
  </div>
);

export const VoiceNote: React.FC<{ w: number; playhead: number; f: number }> = ({ w, playhead, f }) => (
  <div style={{ width: w, background: 'linear-gradient(160deg,#16222f,#0c121a)', borderRadius: w * 0.06, padding: w * 0.06, boxShadow: '0 18px 50px rgba(0,0,0,.65), 0 0 60px rgba(110,170,255,.18)', fontFamily: FONT.sans, color: '#fff' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: w * 0.05 }}>
      <div style={{ width: w * 0.15, height: w * 0.15, borderRadius: '50%', background: '#9fd0ff', display: 'grid', placeItems: 'center', color: '#0c121a', fontSize: w * 0.07, flexShrink: 0 }}>{playhead > 0 && playhead < 1 ? '❚❚' : '▶'}</div>
      <div style={{ flex: 1 }}>
        <Waveform w={w * 0.66} h={w * 0.16} playhead={playhead} seed="halo" />
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: w * 0.04, fontFamily: FONT.mono, fontSize: w * 0.04, color: '#8fa6bd', letterSpacing: '0.12em' }}>
      <span>VOICE NOTE · HALO</span>
      <span>0:0{Math.min(9, Math.floor(playhead * 9))}</span>
    </div>
  </div>
);

/** Rubber-stamped word, used on every cornered target. */
export const ExposedStamp: React.FC<{ size: number; t: number }> = ({ size, t }) => {
  if (t < 0) return null;
  const p = clamp01(t / 6);
  const s = 2.4 - 1.4 * (1 - Math.pow(1 - p, 3));
  return (
    <div
      style={{
        display: 'inline-block',
        transform: `rotate(-9deg) scale(${s})`,
        opacity: p,
        border: `${size * 0.09}px solid ${C.siren}`,
        color: C.siren,
        fontFamily: FONT.display,
        fontSize: size,
        letterSpacing: '0.08em',
        padding: `${size * 0.04}px ${size * 0.25}px`,
        borderRadius: size * 0.12,
        filter: 'url(#ink)',
        background: 'rgba(8,10,14,.35)',
        textShadow: '0 0 30px rgba(225,29,72,.5)',
      }}
    >
      EXPOSED
    </div>
  );
};
