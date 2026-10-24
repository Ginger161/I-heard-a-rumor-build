import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CinematicRig } from '../CinematicRig';
import { useLayout } from '../layout';
import { C } from '../theme';
import { FONT } from '../fonts';
import { Desk, Lift, Dymo } from '../components/props';
import { ManilaFolder } from '../components/cards';
import { caShadow } from '../components/props';
import { clamp01, flicker, mapRange } from '../fx';
import { S1, touchdowns } from '../timing';

const LINES: { words: string[]; start: number[]; color?: string }[] = [
  { words: ['ONE', 'WHISPER.'], start: [S1.words[0], S1.words[1]] },
  { words: ['TWENTY', 'DAYS.'], start: [S1.words[2], S1.words[3]] },
  { words: ['BRING', 'THEM'], start: [S1.words[4], S1.words[5]], color: C.blood },
  { words: ['DOWN.'], start: [S1.words[6]], color: C.blood },
];

const wordShadow = (t: number, S: number) => {
  const ca = Math.max(0, 1 - clamp01(t / 14)) * 7 * S;
  const drop = `0 ${6 * S}px ${24 * S}px rgba(0,0,0,.6)`;
  return t >= 0 && ca > 0.3 ? `${caShadow(ca)}, ${drop}` : drop;
};

export const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, portrait, S } = useLayout();

  const touch = touchdowns(S1.dropCfg, S1.dropDelay);
  const impacts = [...touch.slice(0, 3), ...[S1.words[0], S1.words[2], S1.words[4]]];

  // |1 - spring| => falls from 1100px up, bounces off the desk each time the spring crosses 1
  const s = spring({ frame: f - S1.dropDelay, fps, config: S1.dropCfg });
  const dropZ = Math.abs(1 - s) * 1100;
  const dropRot = (1 - Math.min(1, s)) * 14;

  // folder footprint: portrait stacks type under it, landscape puts type to the right
  const fw = (portrait ? 600 : 540) * S;
  const fh = fw * 1.28;
  const fx = portrait ? 0 : -w * 0.22;
  const fy = portrait ? -h * 0.14 : 20 * S;

  const cam = {
    rx: mapRange(f, 0, 240, 54, 36),
    rz: mapRange(f, 0, 240, -5, 2),
    tz: mapRange(f, 0, 240, -80, 170),
    ty: mapRange(f, 0, 240, 60 * S, -10 * S),
  };

  const lampOn = f < 36 ? flicker(f, [8, 9, 20, 21, 27]) * mapRange(f, 0, 36, 0.1, 1) : flicker(f, [112, 113, 176]);
  const lamp = { x: portrait ? 0.5 : 0.3, y: portrait ? 0.3 : 0.5, intensity: lampOn, radius: (portrait ? 900 : 1000) * S };

  const size = 100 * S;

  const hud = (
    <div
      style={{
        position: 'absolute',
        left: portrait ? 60 * S : w * 0.52,
        top: portrait ? h * 0.58 : h * 0.5 - 255 * S,
        width: portrait ? w - 120 * S : w * 0.44,
        fontFamily: FONT.serif,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: '-0.015em',
        color: C.paper,
        textTransform: 'uppercase',
      }}
    >
      {LINES.map((ln, li) => (
        <div key={li} style={{ display: 'flex', gap: size * 0.28, flexWrap: 'nowrap', marginBottom: size * 0.06, whiteSpace: 'nowrap' }}>
          {ln.words.map((word, wi) => {
            const t = f - ln.start[wi];
            const sp = t < 0 ? 0 : spring({ frame: t, fps, config: { damping: 11, stiffness: 260, mass: 0.6 } });
            const snap = Math.abs(sp);
            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  opacity: t < 0 ? 0 : clamp01(t / 3),
                  transform: `scale(${1.7 - snap * 0.7}) translateY(${(1 - snap) * -30}px) rotate(${(1 - snap) * -3}deg)`,
                  color: ln.color ?? C.paper,
                  textShadow: wordShadow(t, S),
                  transformOrigin: '50% 80%',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
      {f > 226 && (
        <div style={{ marginTop: 24 * S, opacity: clamp01((f - 226) / 8) }}>
          <Dymo size={26 * S} rot={-1.5} bg={C.blood}>
            I Heard A Rumor
          </Dymo>
        </div>
      )}
    </div>
  );

  return (
    <CinematicRig id="s1" cam={cam} lamp={lamp} impacts={impacts} hud={hud} fadeIn={4} darkness={0.85}>
      <Desk kind="mahogany" />
      {/* clutter: loose sheets, coffee ring, pencil */}
      <Lift x={fx + (portrait ? -470 : -520) * S} y={fy - 330 * S} w={260 * S} h={340 * S} rot={-14} z={0}>
        <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(0deg, #EFE9D8 0 20px, #cfc7b0 20px 22px)' }} />
      </Lift>
      <Lift x={fx + (portrait ? 430 : 470) * S} y={fy + 330 * S} w={250 * S} h={320 * S} rot={11} z={0}>
        <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(0deg, #E9E2CC 0 20px, #c5bda3 20px 22px)' }} />
      </Lift>
      <div style={{ position: 'absolute', left: fx - 520 * S, top: fy + 160 * S, width: 190 * S, height: 190 * S, borderRadius: '50%', border: `${9 * S}px solid rgba(25,10,3,.55)`, filter: 'blur(1.5px)' }} />
      <div style={{ position: 'absolute', left: fx - 300 * S, top: fy - (portrait ? 560 : 470) * S, width: 520 * S, height: 18 * S, background: 'linear-gradient(#e8b33a, #c58a14)', transform: 'rotate(7deg)', boxShadow: '8px 12px 14px rgba(0,0,0,.6)', borderRadius: 4 }} />

      <Lift x={fx} y={fy} w={fw} h={fh} z={dropZ} rot={-3 + dropRot}>
        <ManilaFolder w={fw} h={fh} stampOpacity={clamp01((f - touch[0] - 10) / 4)} stampScale={1 + (1 - clamp01((f - touch[0] - 10) / 8)) * 1.4} />
      </Lift>
    </CinematicRig>
  );
};
