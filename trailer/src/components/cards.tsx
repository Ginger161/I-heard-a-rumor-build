import React from 'react';
import { C } from '../theme';
import { FONT } from '../fonts';
import { Bolt, Dymo, Stamp, Tape } from './props';

const paperGrain =
  'repeating-linear-gradient(0deg, rgba(0,0,0,.025) 0 1px, transparent 1px 3px), radial-gradient(circle at 30% 20%, rgba(255,255,255,.5), transparent 60%)';

/* ------------------------------------------------------------ manila case file */

export const ManilaFolder: React.FC<{ w: number; h: number; stampOpacity?: number; stampScale?: number }> = ({ w, h, stampOpacity = 1, stampScale = 1 }) => {
  const u = w / 560;
  return (
    <div style={{ position: 'relative', width: w, height: h, fontFamily: FONT.sans }}>
      {/* tab */}
      <div
        style={{
          position: 'absolute',
          left: 24 * u,
          top: -44 * u,
          width: 250 * u,
          height: 62 * u,
          background: C.manila,
          borderRadius: `${12 * u}px ${12 * u}px 0 0`,
          boxShadow: 'inset 0 2px 0 rgba(255,255,255,.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT.mono,
          fontWeight: 700,
          fontSize: 28 * u,
          color: C.ink,
          letterSpacing: '0.04em',
        }}
      >
        CASE #04
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `${paperGrain}, linear-gradient(160deg, #E4D4B2 0%, ${C.manila} 55%, #C9B890 100%)`,
          borderRadius: 10 * u,
          boxShadow: 'inset 0 0 0 2px rgba(120,90,40,.25), inset 0 -18px 30px rgba(110,80,30,.22)',
        }}
      />
      {/* typed label */}
      <div style={{ position: 'absolute', left: 36 * u, right: 36 * u, top: 70 * u, color: C.ink }}>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 21 * u, letterSpacing: '0.18em', opacity: 0.7 }}>STATE SECURITY // EYES ONLY</div>
        <div style={{ height: 3 * u, background: C.ink, margin: `${14 * u}px 0 ${22 * u}px`, opacity: 0.8 }} />
        <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: 64 * u, lineHeight: 0.98, textTransform: 'uppercase' }}>The Vanished</div>
        <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: 128 * u, lineHeight: 1, color: C.bloodDeep, letterSpacing: '-0.02em' }}>₦85B</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 20 * u, marginTop: 18 * u, lineHeight: 1.5, opacity: 0.75 }}>
          SUBJECT: ECOLOGICAL FUND
          <br />
          STATUS: ██████████ UNSEALED
          <br />
          WITNESSES: 0 &nbsp; RECEIPTS: 0
        </div>
      </div>
      <div style={{ position: 'absolute', right: 30 * u, bottom: 30 * u, opacity: stampOpacity, transform: `scale(${stampScale})`, transformOrigin: 'center' }}>
        <Stamp lines={['CLASSIFIED']} size={46 * u} rot={-9} />
      </div>
      <div style={{ position: 'absolute', left: 36 * u, bottom: 30 * u }}>
        <Dymo size={20 * u} rot={-2}>
          DAY 1 / 20
        </Dymo>
      </div>
      {/* paper clip */}
      <svg style={{ position: 'absolute', right: 70 * u, top: -16 * u }} width={44 * u} height={110 * u} viewBox="0 0 44 110" fill="none" stroke="#9aa0a8" strokeWidth="5" strokeLinecap="round">
        <path d="M30 8v70a10 10 0 0 1-20 0V22a7 7 0 0 1 14 0v52" />
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------ torn notebook */

const tornEdge =
  'polygon(0 0, 100% 0, 100% 92%, 96% 95%, 92% 91%, 87% 96%, 82% 92%, 77% 97%, 71% 93%, 66% 96%, 60% 92%, 54% 97%, 48% 93%, 43% 96%, 37% 92%, 31% 97%, 25% 93%, 19% 96%, 13% 92%, 7% 96%, 0 93%)';

export const TornNotebook: React.FC<{ w: number; title?: string; quote: string; footer: string }> = ({ w, title = 'STREET_WHISPER', quote, footer }) => {
  const u = w / 760;
  return (
    <div style={{ position: 'relative', width: w, filter: 'drop-shadow(0 22px 22px rgba(0,0,0,.55))' }}>
      <div
        style={{
          clipPath: tornEdge,
          background: `linear-gradient(transparent 0 ${58 * u}px, rgba(70,110,170,.35) ${58 * u}px ${60 * u}px, transparent ${60 * u}px) 0 0/100% ${62 * u}px, #FBF8EE`,
          padding: `${44 * u}px ${46 * u}px ${96 * u}px ${96 * u}px`,
          position: 'relative',
          color: C.ink,
        }}
      >
        <div style={{ position: 'absolute', left: 72 * u, top: 0, bottom: 0, width: 3 * u, background: 'rgba(220,60,60,.6)' }} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: 'absolute', left: 22 * u, top: (70 + i * 150) * u, width: 30 * u, height: 30 * u, borderRadius: '50%', background: '#2a1f14', boxShadow: 'inset 0 3px 6px rgba(0,0,0,.8)' }} />
        ))}
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 24 * u, color: C.blood, letterSpacing: '0.14em' }}>{title}</div>
        <div style={{ fontFamily: FONT.serifItalic, fontWeight: 700, fontSize: 47 * u, lineHeight: `${62 * u}px`, marginTop: 8 * u }}>{quote}</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 22 * u, marginTop: 18 * u, opacity: 0.65 }}>{footer}</div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------ wire / receipt / front page */

/** Pink carbon-copy DSS telex. */
export const SecurityWire: React.FC<{ w: number; heat: number }> = ({ w, heat }) => {
  const u = w / 820;
  return (
    <div style={{ width: w, background: `${paperGrain}, ${C.wireRed}`, border: `${4 * u}px solid #B91C1C`, boxShadow: `${10 * u}px ${10 * u}px 0 ${C.ink}`, padding: 32 * u, color: C.ink, fontFamily: FONT.mono, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 20 * u, letterSpacing: '0.12em', color: '#B91C1C' }}>
        <span>SECURITY_WIRE</span>
        <span>DSS // PRIORITY: FLASH</span>
      </div>
      <div style={{ height: 3 * u, background: '#B91C1C', margin: `${12 * u}px 0 ${18 * u}px` }} />
      <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 56 * u, lineHeight: 1.02, textTransform: 'uppercase' }}>
        DSS tracking vans outside
        <span style={{ color: '#B91C1C' }}> — {heat}% heat</span>
      </div>
      <div style={{ marginTop: 20 * u, height: 26 * u, background: 'rgba(0,0,0,.12)', border: `2px solid ${C.ink}` }}>
        <div style={{ width: `${heat}%`, height: '100%', background: 'repeating-linear-gradient(45deg, #B91C1C 0 14px, #7f1212 14px 28px)' }} />
      </div>
      <div style={{ marginTop: 16 * u, fontSize: 21 * u, opacity: 0.8, lineHeight: 1.5 }}>
        UNMARKED HILUX SPOTTED AT SAFEHOUSE. RAID IMMINENT.
        <br />
        BURN THE PHONES. MOVE NOW.
      </div>
    </div>
  );
};

/** WhatsApp-green viral receipt. */
export const ViralReceipt: React.FC<{ w: number; seen: string; text: string }> = ({ w, seen, text }) => {
  const u = w / 560;
  return (
    <div style={{ width: w, background: '#fff', border: `${4 * u}px solid ${C.ink}`, boxShadow: `${8 * u}px ${8 * u}px 0 ${C.ink}`, fontFamily: FONT.sans, color: C.ink }}>
      <div style={{ background: C.green, color: '#fff', padding: `${12 * u}px ${20 * u}px`, fontWeight: 900, fontSize: 24 * u, letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between' }}>
        <span>VIRAL_RECEIPT</span>
        <span>↗ FORWARDED MANY TIMES</span>
      </div>
      <div style={{ padding: 22 * u, background: '#E7F5DD' }}>
        <div style={{ background: '#fff', padding: 18 * u, borderRadius: 10 * u, fontWeight: 700, fontSize: 30 * u, lineHeight: 1.22, boxShadow: '0 2px 0 rgba(0,0,0,.15)' }}>{text}</div>
        <div style={{ marginTop: 16 * u, fontFamily: FONT.mono, fontWeight: 700, fontSize: 24 * u, color: C.green }}>✓✓ SEEN BY {seen}</div>
      </div>
    </div>
  );
};

/** Newsprint front page cutout. */
export const BreakingFront: React.FC<{ w: number; head: string; sub: string; masthead?: string }> = ({ w, head, sub, masthead = 'THE DAILY GIST' }) => {
  const u = w / 560;
  return (
    <div style={{ width: w, background: `${paperGrain}, ${C.paper}`, border: `${4 * u}px solid ${C.ink}`, boxShadow: `${8 * u}px ${8 * u}px 0 ${C.ink}`, padding: 22 * u, color: C.ink }}>
      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 18 * u, letterSpacing: '0.16em', color: C.blood }}>BREAKING_FRONT</div>
      <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: 40 * u, textAlign: 'center', borderTop: `3px solid ${C.ink}`, borderBottom: `3px solid ${C.ink}`, margin: `${8 * u}px 0 ${14 * u}px`, padding: `${4 * u}px 0` }}>{masthead}</div>
      <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: 52 * u, lineHeight: 0.98, textTransform: 'uppercase' }}>{head}</div>
      <div style={{ fontFamily: FONT.serifItalic, fontWeight: 700, fontSize: 24 * u, marginTop: 10 * u, opacity: 0.75 }}>{sub}</div>
      <div style={{ marginTop: 14 * u, height: 70 * u, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.55) 0 3px, transparent 3px 9px)' }} />
    </div>
  );
};

/** The full-screen victory front page. */
export const TabloidPage: React.FC<{ w: number; h: number; portrait: boolean; bleed?: number }> = ({ w, h, portrait, bleed = 0 }) => {
  const u = Math.min(w, h) / 1080;
  const headSize = portrait ? 112 * u : 150 * u;
  return (
    <div style={{ width: w, height: h, background: `${paperGrain}, ${C.paper}`, color: C.ink, position: 'relative', overflow: 'hidden', padding: `${56 * u + bleed}px ${(portrait ? 70 : 64) * u + bleed}px` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontWeight: 700, fontSize: 22 * u, letterSpacing: '0.12em' }}>
        <span>VOL. 1 · NO. 20</span>
        <span>★ FINAL EDITION ★</span>
        <span>₦200</span>
      </div>
      <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: (portrait ? 118 : 138) * u, textAlign: 'center', letterSpacing: '-0.02em', borderTop: `${8 * u}px solid ${C.ink}`, borderBottom: `${3 * u}px solid ${C.ink}`, margin: `${14 * u}px 0 ${24 * u}px`, lineHeight: 1.05 }}>THE DAILY GIST</div>
      <div style={{ display: 'flex', flexDirection: portrait ? 'column' : 'row', gap: 36 * u }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: headSize, lineHeight: 0.92, textTransform: 'uppercase', letterSpacing: '-0.015em' }}>
            Target <span style={{ color: C.blood }}>disgraced!</span>
          </div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: (portrait ? 74 : 60) * u, lineHeight: 1, marginTop: 20 * u, background: C.ink, color: C.paper, padding: `${12 * u}px ${22 * u}px`, display: 'inline-block' }}>EFCC ARREST IMMINENT</div>
          <div style={{ fontFamily: FONT.serifItalic, fontWeight: 700, fontSize: 36 * u, lineHeight: 1.3, marginTop: 24 * u, opacity: 0.85, maxWidth: portrait ? undefined : 760 * u }}>
            65.4% of the nation now believes. Twenty days. One whisper. The receipts are in, and the big man is not picking up.
          </div>
        </div>
        {/* halftone mugshot */}
        <div style={{ width: portrait ? '100%' : 520 * u, height: portrait ? 470 * u : 560 * u, position: 'relative', background: `radial-gradient(circle at 50% 38%, #777 0 16%, transparent 17%), radial-gradient(ellipse at 50% 100%, #555 0 38%, transparent 39%), #cfc9bb`, border: `${5 * u}px solid ${C.ink}` }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${C.ink} 0 2.2px, transparent 2.6px)`, backgroundSize: `${9 * u}px ${9 * u}px`, mixBlendMode: 'multiply', opacity: 0.55 }} />
          <div style={{ position: 'absolute', left: '18%', right: '18%', top: '30%', height: 46 * u, background: C.ink }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: C.ink, color: C.paper, fontFamily: FONT.mono, fontWeight: 700, fontSize: 24 * u, padding: `${8 * u}px ${14 * u}px`, letterSpacing: '0.1em' }}>EXCLUSIVE · THE VANISHED ₦85B</div>
        </div>
      </div>
    </div>
  );
};

/** Gold "+15 ⚡" Spark bubble, drawn as a flat disc (caller billboards it). */
export const SparkBubble: React.FC<{ size: number; label: string; ink?: string }> = ({ size, label, ink = C.amberDeep }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 32% 28%, #FFF7D1 0%, ${C.amberLight} 38%, ${C.amber} 100%)`,
      border: `${size * 0.04}px solid ${C.amberDeep}`,
      boxShadow: `0 0 ${size * 0.5}px rgba(245,158,11,.85), inset 0 -${size * 0.08}px ${size * 0.12}px rgba(180,83,9,.45)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: size * 0.03,
      color: ink,
      fontFamily: FONT.sans,
      fontWeight: 900,
      fontSize: size * 0.44,
    }}
  >
    {label}
    <Bolt size={size * 0.38} color={ink} />
  </div>
);

export { Tape };
