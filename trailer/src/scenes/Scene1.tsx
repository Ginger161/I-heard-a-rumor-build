import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CinematicRig } from '../CinematicRig';
import { useLayout } from '../layout';
import { C } from '../theme';
import { FONT } from '../fonts';
import { Desk, Dust, Lift, caShadow } from '../components/props';
import { ManilaFolder } from '../components/cards';
import { clamp01, flicker, mapRange, ramp } from '../fx';
import { S1, touchdowns } from '../timing';

const LINES: { words: string[]; start: number[]; color?: string }[] = [
  { words: ['ONE', 'WHISPER.'], start: [S1.words[0], S1.words[1]] },
  { words: ['TWENTY', 'DAYS.'], start: [S1.words[2], S1.words[3]] },
  { words: ['BRING', 'THEM'], start: [S1.words[4], S1.words[5]], color: C.blood },
  { words: ['DOWN.'], start: [S1.words[6]], color: C.blood },
];

const wordShadow = (t: number, S: number) => {
  const ca = Math.max(0, 1 - clamp01(t / 16)) * 7 * S;
  const drop = `0 ${6 * S}px ${26 * S}px rgba(0,0,0,.65)`;
  return t >= 0 && ca > 0.3 ? `${caShadow(ca)}, ${drop}` : drop;
};

export const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, portrait, S } = useLayout();

  const touch = touchdowns(S1.dropCfg, S1.dropDelay);
  const impacts = [...touch.slice(0, 3), S1.words[0], S1.words[2], S1.words[4], S1.words[6]];

  // |1 - spring| => falls from 1100px up, bounces off the desk each time the spring crosses 1
  const zAt = (ff: number) => Math.abs(1 - spring({ frame: ff - S1.dropDelay, fps, config: S1.dropCfg })) * 1100;
  const dropZ = zAt(f);
  const dropBlur = Math.abs(dropZ - zAt(f - 1)) * 0.11;
  const dropRot = (1 - Math.min(1, spring({ frame: f - S1.dropDelay, fps, config: S1.dropCfg }))) * 14;

  const fw = (portrait ? 600 : 540) * S;
  const fh = fw * 1.28;
  const fx = portrait ? 0 : -w * 0.22;
  const fy = portrait ? -h * 0.14 : 20 * S;

  // slow, continuous push-in with a little hand-held breathing, so the frame is never still
  const camAt = (ff: number) => ({
    rx: mapRange(ff, 0, 360, 54, 34),
    rz: mapRange(ff, 0, 360, -5, 2) + Math.sin(ff / 130) * 0.35,
    tz: mapRange(ff, 0, 360, -80, 190) + Math.sin(ff / 90) * 10,
    ty: mapRange(ff, 0, 360, 60 * S, -10 * S),
    tx: Math.sin(ff / 170) * 14 * S,
  });

  const lampOn = f < S1.lampOn ? flicker(f, [12, 13, 30, 31, 42]) * mapRange(f, 0, S1.lampOn, 0.1, 1) : flicker(f, [200, 201, 290]) * (0.97 + 0.03 * Math.sin(f / 22));
  const lamp = { x: portrait ? 0.5 : 0.3, y: portrait ? 0.3 : 0.5, intensity: lampOn, radius: (portrait ? 900 : 1000) * S };

  const size = 100 * S;
  const typeP = ramp(f, touch[0] + 24, touch[0] + 200);

  const hud = (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: clamp01((f - S1.lampOn) / 40) * 0.9,
          WebkitMaskImage: `radial-gradient(circle at ${lamp.x * 100}% ${lamp.y * 100}%, #000 0, transparent ${(portrait ? 560 : 640) * S}px)`,
          maskImage: `radial-gradient(circle at ${lamp.x * 100}% ${lamp.y * 100}%, #000 0, transparent ${(portrait ? 560 : 640) * S}px)`,
        }}
      >
        <Dust frame={f} w={w} h={h} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: portrait ? 60 * S : w * 0.52,
          top: portrait ? h * 0.56 : h * 0.5 - 300 * S,
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
          <div key={li} style={{ display: 'flex', gap: size * 0.28, marginBottom: size * 0.06, whiteSpace: 'nowrap' }}>
            {ln.words.map((word, wi) => {
              const t = f - ln.start[wi];
              const sp = t < 0 ? 0 : spring({ frame: t, fps, config: { damping: 12, stiffness: 150, mass: 0.7 } });
              const snap = Math.min(1.08, Math.abs(sp));
              const smear = Math.max(0, 1 - snap) * 16 * S;
              return (
                <span
                  key={wi}
                  style={{
                    display: 'inline-block',
                    opacity: t < 0 ? 0 : clamp01(t / 4),
                    transform: `scale(${1.55 - snap * 0.55}) translateY(${(1 - snap) * -26}px) rotate(${(1 - snap) * -2.5}deg)`,
                    color: ln.color ?? C.paper,
                    textShadow: wordShadow(t, S),
                    filter: `${smear > 0.4 ? `blur(${smear}px) ` : ''}url(#press)`,
                    transformOrigin: '50% 80%',
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <CinematicRig id="s1" cam={camAt(f)} camPrev={camAt(f - 1)} lamp={lamp} impacts={impacts} hud={hud} fadeIn={6} darkness={0.85}>
      <Desk kind="mahogany" />
      <Lift x={fx} y={fy} w={fw} h={fh} z={dropZ} rot={-3 + dropRot} blur={dropBlur}>
        <ManilaFolder w={fw} h={fh} type={typeP} stampOpacity={clamp01((f - touch[0] - 12) / 4)} stampScale={1 + (1 - clamp01((f - touch[0] - 12) / 8)) * 1.4} />
      </Lift>
    </CinematicRig>
  );
};
