import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CinematicRig } from '../CinematicRig';
import { useLayout } from '../layout';
import { C } from '../theme';
import { FONT } from '../fonts';
import { Desk, Dymo, Pushpin, Tape } from '../components/props';
import { FIBER_TEX, PAPER_TEX } from '../texture';
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

// Other channels on the game's real tree, still locked: they give the board depth and tell the player
// there is far more to unlock than the four we pin.
const LOCKED: { lane: number; x: number; name: string }[] = [
  { lane: 0, x: -380, name: 'Keke & Okada Union Mudflaps' },
  { lane: 0, x: 240, name: 'Barber Shop & Salon Gist' },
  { lane: 0, x: 860, name: 'Market Women Association' },
  { lane: 1, x: 860, name: 'BaidaSoj — TikTok Drag Session' },
  { lane: 1, x: 1440, name: 'VeeDarkMan — Activist Callout' },
  { lane: 2, x: -380, name: 'Local Dialect FM Phone-In' },
  { lane: 2, x: 240, name: 'Broda Dapo — X Fact-Check' },
  { lane: 2, x: 1440, name: 'Dr. Aproko — Calm Thread' },
  { lane: 3, x: -380, name: 'Civil Service Secretariat Tea' },
  { lane: 3, x: 240, name: "Juma'at & Sunday Sub-Sermons" },
  { lane: 3, x: 860, name: 'Ikoyi & Maitama Golf Lounge' },
];

const Lock: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="rgba(26,26,26,.7)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

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
  const pins = S3.pins;

  // --- camera: hold on each pin, travel to the next, then pull back to reveal the whole web
  const focus = [pos[0].x, pos[1].x, pos[2].x, pos[3].x, tgt.x];
  const focusY = [pos[0].y, pos[1].y, pos[2].y, pos[3].y, tgt.y];
  const focusT = [pins[0], pins[1], pins[2], pins[3], S3.polaroid];
  const inputs = focusT.flatMap((t, i) => (i === 0 ? [0, t - 14] : [focusT[i - 1] + 40, t - 14]));
  const track = (ff: number, vals: number[], lead: number) =>
    interpolate(ff, inputs, vals.flatMap((v, i) => (i === 0 ? [v + lead, v] : [vals[i - 1], v])), {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easeInOut,
    });
  const camAt = (ff: number) => {
    const pull = easeInOut(ramp(ff, S3.pullStart, S3.pullEnd));
    return {
      camX: lerp(track(ff, focus, -150) + Math.sin(ff / 80) * 14, 400, pull),
      camY: lerp(track(ff, focusY, 0), 0, pull),
      cam: {
        ty: (portrait ? -60 : 30) * S,
        tz: lerp(portrait ? 120 : 170, portrait ? -1000 : -600, pull) + Math.sin(ff / 100) * 10,
        rx: lerp(portrait ? 46 : 50, portrait ? 40 : 44, pull) + Math.sin(ff / 120) * 0.6,
        ry: lerp(-12, 6, ramp(ff, 0, S3.pullEnd)) * (1 - pull * 0.5),
        rz: lerp(-3, 2, ramp(ff, 0, 540)),
      },
    };
  };
  const { camX, camY, cam } = camAt(f);
  const prev = camAt(f - 1).cam;
  // fold the board pan into the camera so motion blur follows it
  const camPan = { ...cam, tx: -camX * 0.55 };
  const camPanPrev = { ...prev, tx: -camAt(f - 1).camX * 0.55 };

  const lamp = { x: 0.5, y: portrait ? 0.46 : 0.5, intensity: 0.95, radius: 1100 * S, tint: '255,205,140' };

  // --- yarn
  const sway = (i: number) => Math.sin(f / 38 + i * 1.7) * 7;
  const yarnPath = (a: { x: number; y: number }, b: { x: number; y: number }, i: number) => {
    const dx = (b.x - a.x) * 0.55;
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y + 30 + sway(i)}, ${b.x - dx} ${b.y - 30 - sway(i)}, ${b.x} ${b.y}`;
  };
  const chain = [...pos, tgt];

  return (
    <CinematicRig id="s3" cam={camPan} camPrev={camPanPrev} lamp={lamp} impacts={pins} whipIn={S3.whipFrames} fadeIn={2} darkness={0.7}>
      <Desk kind="mahogany" />
      <div style={{ position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: `translate(${-camX * 0.45}px, ${-camY}px)` }}>
        {/* board: cork in a timber frame */}
        <div style={{ position: 'absolute', left: -BW / 2 - 40, top: -H / 2 - 40, width: BW + 80, height: H + 80, background: 'linear-gradient(135deg, #3a1d0d, #22100a)', borderRadius: 14, boxShadow: '24px 44px 70px rgba(0,0,0,.65)' }} />
        <Desk kind="cork" w={BW} h={H} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ position: 'absolute', left: -BW / 2 + 20, top: -H / 2 + laneH * i - 2, width: BW - 40, height: 0, borderTop: '5px dashed rgba(26,26,26,.34)' }} />
        ))}
        {LANES.map((l, i) => (
          <div key={l} style={{ position: 'absolute', left: -BW / 2 + 40, top: laneY(i) - 90, transform: `rotate(${i % 2 ? 2 : -3}deg)` }}>
            <div style={{ position: 'absolute', left: 30, top: -26 }}>
              <Tape w={120} rot={-5} />
            </div>
            <div style={{ background: `${PAPER_TEX}, ${C.paper}`, padding: '18px 28px', fontFamily: FONT.mono, fontWeight: 700, fontSize: 40, letterSpacing: '0.1em', color: C.ink, borderRadius: 6, boxShadow: '0 8px 18px rgba(0,0,0,.4)', filter: 'url(#rough)' }}>{l}</div>
          </div>
        ))}

        {/* still-locked channels from the real tree: faint, dashed, with a padlock */}
        {LOCKED.map((l, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: l.x - cardW / 2,
              top: laneY(l.lane) - cardH / 2,
              width: cardW,
              height: cardH,
              transform: 'translateZ(1px)',
              border: '4px dashed rgba(26,26,26,.4)',
              borderRadius: 10,
              background: 'rgba(240,228,205,.28)',
              padding: cardH * 0.12,
              fontFamily: FONT.serif,
              fontWeight: 700,
              fontSize: cardH * 0.12,
              lineHeight: 1.05,
              color: 'rgba(26,26,26,.62)',
            }}
          >
            <Lock size={cardH * 0.2} />
            <div style={{ marginTop: cardH * 0.06 }}>{l.name}</div>
          </div>
        ))}

        {/* yarn on its own plane just above the cork; pins stand above it */}
        <svg width={BW} height={H} viewBox={`${-BW / 2} ${-H / 2} ${BW} ${H}`} style={{ position: 'absolute', left: -BW / 2, top: -H / 2, overflow: 'visible', transform: 'translateZ(6px)' }}>
          {chain.slice(0, -1).map((a, i) => {
            const b = chain[i + 1];
            const start = pins[i] + 18;
            const p = easeInOut(ramp(f, start, start + 60));
            if (p <= 0) return null;
            const d = yarnPath({ x: a.x, y: a.y - cardH * 0.46 }, { x: b.x, y: b.y - cardH * 0.46 }, i);
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="rgba(0,0,0,.5)" strokeWidth={11} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform="translate(4 11)" strokeLinecap="round" style={{ filter: 'blur(4px)' }} />
                <path d={d} fill="none" stroke="#B91C1C" strokeWidth={9} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" />
                <path d={d} fill="none" stroke="#f87171" strokeOpacity={0.5} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" transform="translate(-1 -2)" />
              </g>
            );
          })}
        </svg>

        {/* cards + pins + dymo tape */}
        {NODES.map((n, i) => {
          const t = f - pins[i];
          if (t < -16) return null;
          const sp = spring({ frame: t + 16, fps, config: { damping: 11, stiffness: 150, mass: 1 } });
          const z = Math.abs(1 - sp) * 520;
          const tagT = t - 10;
          const tagSp = tagT < 0 ? 0 : spring({ frame: tagT, fps, config: { damping: 9, stiffness: 240, mass: 0.6 } });
          const p = pos[i];
          return (
            <div key={i} style={{ position: 'absolute', left: p.x - cardW / 2, top: p.y - cardH / 2, width: cardW, height: cardH, transformStyle: 'preserve-3d', transform: `rotate(${n.rot + Math.sin(f / 70 + i) * 0.35}deg)` }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(0,0,0,.7)', filter: `blur(${14 + z * 0.06}px)`, transform: `translate(${6 + z * 0.12}px, ${10 + z * 0.2}px)`, opacity: Math.max(0.3, 0.85 - z / 900) }} />
              <div style={{ position: 'absolute', inset: 0, transform: `translateZ(${Math.max(1, z + 3)}px)`, transformStyle: 'preserve-3d' }}>
                <div style={{ position: 'absolute', inset: 0, background: `${PAPER_TEX}, ${FIBER_TEX}, linear-gradient(160deg, #fffdf6, ${C.paper})`, borderRadius: 8, padding: cardH * 0.12, color: C.ink, boxShadow: 'inset 0 0 0 2px rgba(0,0,0,.07)' }}>
                  <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: cardH * 0.1, letterSpacing: '0.14em', color: C.blood }}>{LANES[n.lane]} · {n.cost} ⚡</div>
                  <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: cardH * 0.135, lineHeight: 1.04, marginTop: cardH * 0.05 }}>{n.name}</div>
                  <div style={{ position: 'absolute', left: cardH * 0.12, bottom: cardH * 0.1, fontFamily: FONT.mono, fontWeight: 700, fontSize: cardH * 0.085, opacity: 0.7 }}>{n.stat}</div>
                </div>
                <div style={{ position: 'absolute', left: cardW / 2 - 27, top: -cardH * 0.14, transform: `translateZ(${z * 0.25 + 12}px) rotateX(-52deg)`, transformOrigin: '50% 100%' }}>
                  <Pushpin size={54} />
                </div>
                {tagT >= 0 && (
                  <div style={{ position: 'absolute', left: cardW / 2, top: cardH + 14, transform: `translate(-50%, 0) translateZ(8px) scale(${2 - tagSp})`, opacity: clamp01(tagT / 4) }}>
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
        {f > S3.polaroid && (() => {
          const t = f - S3.polaroid;
          const sp = spring({ frame: t, fps, config: { damping: 12, stiffness: 170, mass: 0.9 } });
          const z = Math.abs(1 - sp) * 420;
          const pw = cardH * 1.15;
          const circle = ramp(t, 16, 50);
          return (
            <div style={{ position: 'absolute', left: tgt.x - pw / 2, top: tgt.y - pw * 0.6, width: pw, height: pw * 1.2, transformStyle: 'preserve-3d', transform: 'rotate(4deg)' }}>
              <div style={{ position: 'absolute', inset: 0, transform: `translateZ(${z + 3}px)`, background: `${PAPER_TEX}, #F8F6EE`, padding: pw * 0.07, borderRadius: 6, boxShadow: '12px 20px 34px rgba(0,0,0,.55)' }}>
                <div style={{ width: '100%', height: '76%', background: 'radial-gradient(circle at 50% 36%, #444 0 17%, transparent 18%), radial-gradient(ellipse at 50% 100%, #333 0 40%, transparent 41%), #9d968a', position: 'relative', filter: 'blur(0.5px)' }}>
                  <div style={{ position: 'absolute', left: '20%', right: '20%', top: '28%', height: '9%', background: C.ink }} />
                  <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', filter: 'url(#rough)' }} viewBox="0 0 100 100" width="100%" height="100%">
                    <ellipse cx="50" cy="50" rx="43" ry="45" fill="none" stroke={C.blood} strokeWidth="3.2" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circle} transform="rotate(-70 50 50)" />
                  </svg>
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
