import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CinematicRig, Cam } from '../CinematicRig';
import { useLayout } from '../layout';
import { D, sec } from '../timing';
import { clamp01, easeInOut, easeOut, flash, flicker, lerp } from '../fx';
import { Desk, Pushpin, Dymo, Tape } from '../components/props';
import { TransferAlert, CctvStill, LedgerPage, CokerEmail, OracleChat, VoiceNote } from '../components/docs';
import { Tag } from '../components/kinetic';
import { C } from '../theme';
import { FONT } from '../fonts';

type Item = { x: number; y: number; rot: number; w: number; label: string; tape?: boolean };
const ITEMS: Item[] = [
  { x: -1550, y: -130, rot: -5, w: 470, label: 'Transfer · 9:41 PM' },
  { x: -930, y: 150, rot: 3, w: 580, label: 'CCTV · blackout night' },
  { x: -310, y: -170, rot: -3, w: 540, label: 'Ledger page', tape: true },
  { x: 330, y: 140, rot: 2, w: 580, label: 'Cybercrime Unit' },
  { x: 950, y: -150, rot: -4, w: 500, label: '@OracleNaija' },
  { x: 1580, y: 120, rot: 3, w: 620, label: 'Halo' },
];
const BOARD_W = 5400;
const BOARD_H = 2800;
const HEIGHTS = [0.62, 0.68, 0.5, 0.56, 0.42, 0.34];

// sticky notes that fill the board and plant questions
const NOTES: { x: number; y: number; rot: number; text: string }[] = [
  { x: -1230, y: -430, rot: -6, text: '6:06 ?' },
  { x: -620, y: -520, rot: 4, text: 'who writes these?' },
  { x: 40, y: 380, rot: -3, text: 'same words !!' },
  { x: 650, y: -470, rot: 5, text: 'HRP = ?' },
  { x: 1270, y: 420, rot: -5, text: 'she knew' },
  { x: -1700, y: 420, rot: 4, text: 'follow the money' },
];

// extra strings that only appear in the wide reveal: the web
const WEB: [number, number][] = [
  [0, 2],
  [1, 4],
  [2, 5],
  [0, 3],
];

const pinPos = (i: number) => ({ x: ITEMS[i].x, y: ITEMS[i].y - 150 });

const sag = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 + 60;
  return `M ${a.x + BOARD_W / 2} ${a.y + BOARD_H / 2} Q ${mx + BOARD_W / 2} ${my + BOARD_H / 2} ${b.x + BOARD_W / 2} ${b.y + BOARD_H / 2}`;
};

/** The trail: receipts on a board under a lamp, red thread between them, and a voice note that knew you would come. */
export const SceneD: React.FC = () => {
  const f = useCurrentFrame();
  const { portrait } = useLayout();
  const pins = D.pins.map(sec);
  const voiceF = sec(D.voice);
  const wideS = sec(8.05);
  const wideE = sec(8.9);
  const end = sec(13);
  const focusZ = portrait ? 520 : 430;

  // camera waypoints: frame, board point looked at, zoom
  type Wp = { t: number; x: number; y: number; z: number };
  const wps: Wp[] = [{ t: 0, x: ITEMS[0].x + 260, y: ITEMS[0].y - 60, z: -120 }];
  ITEMS.forEach((it, i) => {
    wps.push({ t: pins[i] - 6, x: it.x, y: it.y - 40, z: focusZ });
    if (i < 5) wps.push({ t: pins[i] + sec(0.75), x: it.x + 40, y: it.y - 20, z: focusZ + 40 });
  });
  wps.push({ t: wideS, x: 0, y: 0, z: portrait ? -720 : -1020 });
  wps.push({ t: wideE, x: 120, y: 0, z: portrait ? -660 : -940 });
  wps.push({ t: end, x: ITEMS[5].x - 60, y: ITEMS[5].y + 10, z: portrait ? 300 : 240 });

  const camAt = (g: number): Cam => {
    let a = wps[0];
    let b = wps[wps.length - 1];
    for (let i = 0; i < wps.length - 1; i++) {
      if (g >= wps[i].t && g <= wps[i + 1].t) {
        a = wps[i];
        b = wps[i + 1];
        break;
      }
    }
    if (g < wps[0].t) b = a;
    if (g > wps[wps.length - 1].t) a = b;
    const k = a === b ? 0 : easeInOut(clamp01((g - a.t) / (b.t - a.t)));
    const x = lerp(a.x, b.x, k);
    const y = lerp(a.y, b.y, k);
    return { tx: -x, ty: -y, tz: lerp(a.z, b.z, k), ry: Math.max(-4, Math.min(4, -x / 420)), rx: 3 + Math.max(-2, Math.min(2, y / 300)), rz: Math.sin(g * 0.012) * 0.8 };
  };
  const cam = camAt(f);

  // lamp tracks whichever item is in focus
  const wide = f >= wideS - 6;

  const thread = (a: number, b: number, from: number, len: number, key: string, op = 1) => {
    const p = easeOut(clamp01((f - from) / len));
    if (p <= 0) return null;
    const A = pinPos(a);
    const B = pinPos(b);
    return (
      <g key={key} opacity={op}>
        <path d={sag(A, B)} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform="translate(5 9)" />
        <path d={sag(A, B)} fill="none" stroke="#D31F3B" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} style={{ filter: 'drop-shadow(0 0 6px rgba(225,29,72,.7))' }} />
      </g>
    );
  };

  const itemEl = (i: number) => {
    const t = f - pins[i];
    const m = clamp01(t / sec(1.2));
    switch (i) {
      case 0:
        return <TransferAlert w={ITEMS[0].w} mark={clamp01((t - 10) / 26)} />;
      case 1:
        return <CctvStill w={ITEMS[1].w} f={f} zoom={clamp01((t - 14) / sec(1.0))} />;
      case 2:
        return <LedgerPage w={ITEMS[2].w} reveal={m} />;
      case 3:
        return <CokerEmail w={ITEMS[3].w} />;
      case 4:
        return <OracleChat w={ITEMS[4].w} />;
      default:
        return <VoiceNote w={ITEMS[5].w} playhead={clamp01((f - voiceF) / sec(3.9))} f={f} />;
    }
  };

  const stage = (
    <>
      <div style={{ position: 'absolute', transform: 'translateZ(-70px)' }}>
        <Desk kind="cork" w={BOARD_W} h={BOARD_H} />
      </div>

      {NOTES.map((n, j) => {
        const t = f - (wideS - 24 + j * 5);
        if (t < 0) return null;
        const p = easeOut(clamp01(t / 9));
        return (
          <div key={j} style={{ position: 'absolute', left: n.x - 130, top: n.y - 110, width: 260, height: 220, background: 'linear-gradient(160deg,#FBE36A,#F2C94C)', boxShadow: '0 14px 30px rgba(0,0,0,.5)', transform: `translateZ(${2 + (1 - p) * 300}px) rotate(${n.rot}deg) scale(${1.15 - p * 0.15})`, opacity: p, padding: 22, fontFamily: FONT.hand, fontSize: 52, lineHeight: 1.05, color: '#3a2a08' }}>
            {n.text}
          </div>
        );
      })}

      <svg width={BOARD_W} height={BOARD_H} style={{ position: 'absolute', left: -BOARD_W / 2, top: -BOARD_H / 2, transform: 'translateZ(6px)', overflow: 'visible' }}>
        {[1, 2, 3, 4, 5].map((i) => thread(i - 1, i, pins[i] - 4, 22, `t${i}`))}
        {WEB.map(([a, b], j) => thread(a, b, wideS - 18 + j * 10, 34, `w${j}`, 0.9))}
      </svg>

      {ITEMS.map((it, i) => {
        const t = f - pins[i];
        if (t < -2) return null;
        const p = easeOut(clamp01(t / 9));
        const pz = (1 - p) * 520;
        return (
          <div key={i} style={{ position: 'absolute', left: it.x, top: it.y, transformStyle: 'preserve-3d' }}>
            <div style={{ position: 'absolute', left: -it.w / 2, top: -it.w * 0.2, transform: `translateZ(${pz + 4}px) rotate(${it.rot * (0.5 + 0.5 * p)}deg) scale(${1 + (1 - p) * 0.25})`, opacity: clamp01(t / 3) }}>
              {itemEl(i)}
              {it.tape && (
                <div style={{ position: 'absolute', left: it.w * 0.28, top: -22 }}>
                  <Tape w={170} rot={-3} />
                </div>
              )}
            </div>
            <div style={{ position: 'absolute', left: -it.w / 2 + 10, top: -it.w * 0.2 + it.w * HEIGHTS[i] + 22, transform: 'translateZ(10px)', opacity: clamp01((t - 12) / 8) }}>
              <Dymo size={portrait ? 30 : 26} rot={i % 2 ? 2 : -2}>
                {it.label}
              </Dymo>
            </div>
            <div style={{ position: 'absolute', left: -27, top: -it.w * 0.2 - 62 - (i === 2 ? 14 : 0), transform: `translateZ(${24 + Math.max(0, 1 - t / 5) * 220}px)`, opacity: clamp01(t / 2) }}>
              <Pushpin size={54} />
            </div>
          </div>
        );
      })}
    </>
  );

  const cluesN = pins.filter((p) => f >= p).length;
  const hud = (
    <>
      <AbsoluteFill style={{ padding: portrait ? '100px 64px' : '56px 84px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Tag size={portrait ? 28 : 24} color="#d5dde6">The clue board</Tag>
          <div style={{ textAlign: 'right' }}>
            <Tag size={portrait ? 24 : 20} color="#d5dde6">Receipts found</Tag>
            <div style={{ fontFamily: FONT.display, fontSize: portrait ? 96 : 84, color: '#fff', lineHeight: 1.05 }}>{String(cluesN).padStart(2, '0')}</div>
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#fff', opacity: pins.reduce((a, p) => a + flash(f, p, 1, 7) * 0.12, 0), mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: `rgba(3,4,6,${clamp01((f - (end - 14)) / 14) * 0.0})` }} />
    </>
  );

  return (
    <CinematicRig
      id="d"
      cam={cam}
      camPrev={camAt(f - 1)}
      lamp={{ x: 0.5, y: 0.48, intensity: (wide ? 0.62 : 1) * flicker(f, [pins[3] + 20]), radius: wide ? 1500 : 980, tint: '255,200,130' }}
      impacts={pins}
      glitches={[pins[5]]}
      hud={hud}
      whipIn={12}
      fadeIn={2}
      mbScale={0.3}
      darkness={0.88}
      shakeAmp={0.7}
    >
      {stage}
    </CinematicRig>
  );
};
