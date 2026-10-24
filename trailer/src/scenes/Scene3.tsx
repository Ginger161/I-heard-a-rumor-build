import React from 'react';
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CinematicRig } from '../CinematicRig';
import { useLayout } from '../layout';
import { C } from '../theme';
import { FONT } from '../fonts';
import { Desk, Dymo, Pushpin, Tape } from '../components/props';
import { clamp01, easeInOut, lerp, ramp } from '../fx';
import { S3 } from '../timing';

const BW = 2900;
const LANES = ['STREET', 'SOCIAL', 'PRESS', 'ELITE'];

type Node = { lane: number; x: number; name: string; tag: string; stat: string; cost: string; rot: number };
const NODES: Node[] = [
  { lane: 0, x: -1000, name: 'Agbero & Motor Park Loudmouths', tag: 'AGBERO LOUDMOUTHS', stat: 'VEL +0.22', cost: '12', rot: -2.5 },
  { lane: 1, x: -380, name: "WhatsApp 'Forwarded Many Times'", tag: 'WHATSAPP BROADCAST', stat: 'VEL +0.26', cost: '15', rot: 2 },
  { lane: 1, x: 240, name: 'Deh Geh — Financial Sense Live', tag: 'DEH GEH', stat: 'CRED +0.14', cost: '25', rot: -1.5 },
  { lane: 2, x: 860, name: 'Oga Rufai — Morning TV Grill', tag: 'OGA RUFAI', stat: 'CRED +0.42', cost: '45', rot: 2.5 },
];
const TARGET_X = 1440;

// deterministic cork clutter: stray notes and snapshots so the board feels lived-in
const FILLER = Array.from({ length: 26 }, (_, i) => ({
  x: -1250 + random(`fx${i}`) * 2650,
  lane: Math.floor(random(`fl${i}`) * 4),
  dy: (random(`fd${i}`) - 0.5) * 0.6,
  rot: (random(`fr${i}`) - 0.5) * 24,
  kind: i % 3,
  w: 150 + random(`fw${i}`) * 90,
}));

export const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { portrait, S } = useLayout();

  const H = portrait ? 1200 : 1000;
  const laneH = H / 4;
  const laneY = (i: number) => -H / 2 + laneH * (i + 0.5);
  const cardH = laneH * (portrait ? 0.8 : 0.78);
  const cardW = cardH * (portrait ? 1.6 : 1.9);
  const pos = NODES.map((n) => ({ x: n.x, y: laneY(n.lane) }));
  const tgt = { x: TARGET_X, y: laneY(3) };

  // --- camera: track along the chain, easing between pins, then pull back to reveal the whole web
  const pins = S3.pins;
  // hold on each pin, then travel to the next one
  const focus = [pos[0].x, pos[1].x, pos[2].x, pos[3].x, tgt.x];
  const focusT = [pins[0], pins[1], pins[2], pins[3], pins[3] + 62];
  const focusY = [pos[0].y, pos[1].y, pos[2].y, pos[3].y, tgt.y];
  const track = (vals: number[], lead: number) =>
    interpolate(
      f,
      focusT.flatMap((t, i) => (i === 0 ? [0, t - 10] : [focusT[i - 1] + 26, t - 10])),
      vals.flatMap((v, i) => (i === 0 ? [v + lead, v] : [vals[i - 1], v])),
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut },
    );
  const trackX = track(focus, -150);
  const trackY = track(focusY, 0);
  const pull = easeInOut(ramp(f, 300, 358));
  const camX = lerp(trackX, 400, pull);
  const camY = lerp(trackY, 0, pull);

  const cam = {
    ty: (portrait ? -60 : 30) * S,
    tz: lerp(portrait ? 120 : 170, portrait ? -1000 : -600, pull),
    rx: lerp(portrait ? 46 : 50, portrait ? 40 : 44, pull),
    ry: lerp(-12, 6, ramp(f, 0, 330)) * (1 - pull * 0.5),
    rz: lerp(-3, 2, ramp(f, 0, 360)),
  };

  const lamp = { x: 0.5, y: portrait ? 0.46 : 0.5, intensity: 0.95, radius: 1100 * S, tint: '255,205,140' };

  // --- yarn
  const yarnPath = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = (b.x - a.x) * 0.55;
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y + 30}, ${b.x - dx} ${b.y - 30}, ${b.x} ${b.y}`;
  };
  const chain = [...pos, tgt];

  return (
    <CinematicRig id="s3" cam={cam} lamp={lamp} impacts={pins} whipIn={S3.whipFrames} fadeIn={2} darkness={0.7}>
      <Desk kind="mahogany" />
      <div style={{ position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: `translate(${-camX}px, ${-camY}px)` }}>
      {/* board: cork on a dark timber frame */}
      <div style={{ position: 'absolute', left: -BW / 2 - 40, top: -H / 2 - 40, width: BW + 80, height: H + 80, background: '#2a1409', boxShadow: '30px 50px 60px rgba(0,0,0,.7)' }} />
      <Desk kind="cork" w={BW} h={H} />
      {/* lane dividers */}
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ position: 'absolute', left: -BW / 2 + 20, top: -H / 2 + laneH * i - 2, width: BW - 40, height: 0, borderTop: '5px dashed rgba(26,26,26,.38)' }} />
      ))}
      {/* taped lane labels */}
      {LANES.map((l, i) => (
        <div key={l} style={{ position: 'absolute', left: -BW / 2 + 40, top: laneY(i) - 90, transform: `rotate(${i % 2 ? 2 : -3}deg)` }}>
          <div style={{ position: 'absolute', left: 30, top: -26 }}>
            <Tape w={120} rot={-5} />
          </div>
          <div style={{ background: C.paper, padding: '18px 28px', fontFamily: FONT.mono, fontWeight: 700, fontSize: 40, letterSpacing: '0.1em', color: C.ink, boxShadow: '5px 7px 0 rgba(0,0,0,.4)' }}>{l}</div>
        </div>
      ))}

      {FILLER.filter((c) => ![...NODES.map((n) => ({ x: n.x, lane: n.lane })), { x: TARGET_X, lane: 3 }].some((n) => n.lane === c.lane && Math.abs(n.x - c.x) < 560)).map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: c.x - c.w / 2, top: laneY(c.lane) + c.dy * laneH - c.w * 0.4, width: c.w, height: c.w * (c.kind === 2 ? 1.15 : 0.85), transform: `rotate(${c.rot}deg) translateZ(2px)`, background: c.kind === 0 ? C.amberLight : c.kind === 1 ? '#EFEBE0' : '#F8F6EE', boxShadow: '6px 9px 10px rgba(0,0,0,.45)', padding: c.w * 0.1 }}>
          {c.kind === 2 ? <div style={{ width: '100%', height: '78%', background: 'radial-gradient(circle at 50% 38%, #555 0 18%, transparent 19%), radial-gradient(ellipse at 50% 100%, #444 0 42%, transparent 43%), #a49c8e' }} /> : [0, 1, 2, 3].map((l) => <div key={l} style={{ height: 3, marginBottom: c.w * 0.1, width: `${60 + ((l * 37 + i * 11) % 40)}%`, background: 'rgba(26,26,26,.35)' }} />)}
          <div style={{ position: 'absolute', left: '50%', top: -8, width: 16, height: 16, marginLeft: -8, borderRadius: '50%', background: c.kind === 1 ? '#2563EB' : '#B91C1C', boxShadow: '2px 3px 3px rgba(0,0,0,.5)' }} />
        </div>
      ))}

      {/* yarn: drawn on a dedicated plane just above the cork, pins stand above it */}
      <svg
        width={BW}
        height={H}
        viewBox={`${-BW / 2} ${-H / 2} ${BW} ${H}`}
        style={{ position: 'absolute', left: -BW / 2, top: -H / 2, overflow: 'visible', transform: 'translateZ(6px)' }}
      >
        {chain.slice(0, -1).map((a, i) => {
          const b = chain[i + 1];
          const start = pins[i] + 14;
          const p = easeInOut(ramp(f, start, start + 44));
          if (p <= 0) return null;
          const d = yarnPath({ x: a.x, y: a.y - cardH * 0.46 }, { x: b.x, y: b.y - cardH * 0.46 });
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth={11} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform="translate(5 12)" strokeLinecap="round" />
              <path d={d} fill="none" stroke="#B91C1C" strokeWidth={9} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" />
              <path d={d} fill="none" stroke="#f87171" strokeOpacity={0.55} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" transform="translate(-1 -2)" />
            </g>
          );
        })}
      </svg>

      {/* cards + pins + dymo tape */}
      {NODES.map((n, i) => {
        const t = f - pins[i];
        const sp = t < -14 ? 0 : spring({ frame: t + 14, fps, config: { damping: 11, stiffness: 150, mass: 1 } });
        const z = Math.abs(1 - sp) * 520;
        const tagT = t - 8;
        const tagSp = tagT < 0 ? 0 : spring({ frame: tagT, fps, config: { damping: 9, stiffness: 240, mass: 0.6 } });
        if (t < -14) return null;
        const p = pos[i];
        return (
          <div key={i} style={{ position: 'absolute', left: p.x - cardW / 2, top: p.y - cardH / 2, width: cardW, height: cardH, transformStyle: 'preserve-3d', transform: `rotate(${n.rot}deg)` }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', filter: `blur(${10 + z * 0.05}px)`, transform: `translate(${8 + z * 0.12}px, ${12 + z * 0.2}px)`, opacity: Math.max(0.3, 0.85 - z / 900) }} />
            <div style={{ position: 'absolute', inset: 0, transform: `translateZ(${Math.max(1, z + 3)}px)`, transformStyle: 'preserve-3d' }}>
              <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(0deg, rgba(0,0,0,.025) 0 1px, transparent 1px 3px), ${C.paper}`, padding: cardH * 0.12, color: C.ink, boxShadow: 'inset 0 0 0 2px rgba(0,0,0,.08)' }}>
                <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: cardH * 0.1, letterSpacing: '0.14em', color: C.blood }}>{LANES[n.lane]} · {n.cost} ⚡</div>
                <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: cardH * 0.135, lineHeight: 1.04, marginTop: cardH * 0.05 }}>{n.name}</div>
                <div style={{ position: 'absolute', left: cardH * 0.12, bottom: cardH * 0.1, fontFamily: FONT.mono, fontWeight: 700, fontSize: cardH * 0.085, opacity: 0.7 }}>{n.stat}</div>
              </div>
              {/* pushpin */}
              <div style={{ position: 'absolute', left: cardW / 2 - 27, top: -cardH * 0.14, transform: `translateZ(${z * 0.25 + 12}px) rotateX(-52deg)`, transformOrigin: '50% 100%' }}>
                <Pushpin size={54} />
              </div>
              {/* dymo tape label */}
              {tagT >= 0 && (
                <div style={{ position: 'absolute', left: cardW / 2, top: cardH + 14, transform: `translate(-50%, 0) translateZ(8px) scale(${2 - tagSp})`, opacity: clamp01(tagT / 3) }}>
                  <Dymo size={cardH * 0.13} rot={n.rot > 0 ? 2 : -2}>
                    {n.tag}
                  </Dymo>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* the target at the end of the string */}
      {f > pins[3] + 50 && (() => {
        const t = f - (pins[3] + 50);
        const sp = spring({ frame: t, fps, config: { damping: 12, stiffness: 170, mass: 0.9 } });
        const z = Math.abs(1 - sp) * 420;
        const pw = cardH * 1.15;
        return (
          <div style={{ position: 'absolute', left: tgt.x - pw / 2, top: tgt.y - pw * 0.6, width: pw, height: pw * 1.2, transformStyle: 'preserve-3d', transform: 'rotate(4deg)' }}>
            <div style={{ position: 'absolute', inset: 0, transform: `translateZ(${z + 3}px)`, background: '#F8F6EE', padding: pw * 0.07, boxShadow: '14px 22px 24px rgba(0,0,0,.6)' }}>
              <div style={{ width: '100%', height: '76%', background: 'radial-gradient(circle at 50% 36%, #444 0 17%, transparent 18%), radial-gradient(ellipse at 50% 100%, #333 0 40%, transparent 41%), #9d968a', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20%', right: '20%', top: '28%', height: '9%', background: C.ink }} />
                <div style={{ position: 'absolute', inset: '8%', border: `${pw * 0.03}px solid ${C.blood}`, borderRadius: '50%', opacity: ramp(t, 8, 18) }} />
              </div>
              <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: pw * 0.09, textAlign: 'center', marginTop: pw * 0.04, color: C.blood }}>THE TARGET</div>
            </div>
          </div>
        );
      })()}
      </div>
    </CinematicRig>
  );
};
