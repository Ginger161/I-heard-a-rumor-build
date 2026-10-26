import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CinematicRig } from '../CinematicRig';
import { useLayout } from '../layout';
import { C } from '../theme';
import { FONT } from '../fonts';
import { Desk, Dymo, Shards } from '../components/props';
import { SparkBubble, TornNotebook, typed } from '../components/cards';
import { NigeriaMap, centroid, pathOf } from '../components/NigeriaMap';
import { clamp01, easeInOut, lerp, ramp } from '../fx';
import { S2 } from '../timing';

const MAP_REF = { x: 372, y: 300 }; // centre of the 744x600 viewBox
const staticFill = () => C.paper;
const staticStroke = () => C.ink;

export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, portrait, S } = useLayout();

  const mapW = (portrait ? 1040 : 1180) * S;
  const k = mapW / 744;
  const fct = centroid('fct');
  const fx = (fct.x - MAP_REF.x) * k;
  const fy = (fct.y - MAP_REF.y) * k;

  // --- camera: crane down, drift, punch in on the shatter, then slide the focus aside for the card
  const phase = (ff: number) => {
    const crane = spring({ frame: ff, fps, config: { damping: 32, stiffness: 36, mass: 1.5 } });
    const punch = ff < S2.shatter - 6 ? 0 : spring({ frame: ff - (S2.shatter - 6), fps, config: { damping: 22, stiffness: 50, mass: 1 } });
    const panP = easeInOut(ramp(ff, 170, S2.shatter + 10));
    const shift = easeInOut(ramp(ff, S2.cardSlam - 10, S2.cardSlam + 40));
    return { crane, punch, panP, shift };
  };
  const camAt = (ff: number) => {
    const p = phase(ff);
    return {
      rx: lerp(10, 38, p.crane) - p.punch * 5 + Math.sin(ff / 110) * 0.8,
      rz: lerp(-14, -6, p.crane) + Math.sin(ff / 150) * 1.2,
      tz: lerp(-900, 0, p.crane) + p.punch * 430 + Math.sin(ff / 95) * 8,
      ty: lerp(-220 * S, 0, p.crane) + (portrait ? -h * 0.2 : 0) * p.shift,
      tx: (portrait ? 0 : -w * 0.2) * p.shift + Math.sin(ff / 120) * 10 * S,
    };
  };
  const cam = camAt(f);
  const { punch, panP, shift } = phase(f);
  const bill = `rotateZ(${-cam.rz}deg) rotateX(${-cam.rx}deg)`;

  // --- FCT highlight: pulsing amber fill + expanding rings
  const pulse = f < S2.pulse ? 0 : 0.65 + 0.35 * Math.sin((f - S2.pulse) / 8);
  const ringT = (n: number) => ((f - S2.pulse + n * 24) % 72) / 72;
  const overlay =
    f < S2.pulse ? null : (
      <g>
        <path d={pathOf('fct')} fill={C.amber} fillOpacity={pulse} stroke={C.amberDeep} strokeWidth={3} strokeLinejoin="round" />
        {[0, 1, 2].map((n) => (
          <circle key={n} cx={fct.x} cy={fct.y} r={8 + ringT(n) * 70} fill="none" stroke={C.amber} strokeWidth={3.5 * (1 - ringT(n))} opacity={1 - ringT(n)} />
        ))}
      </g>
    );

  // --- Spark bubble: pops in, hovers, shatters in slow motion
  const popP = f < S2.sparkPop ? 0 : spring({ frame: f - S2.sparkPop, fps, config: { damping: 8, stiffness: 200, mass: 0.7 } });
  const bubbleSize = 170 * S;
  const bob = Math.sin(f / 10) * 11 * S;
  const sinceShatter = f - S2.shatter;
  const slowT = sinceShatter < 0 ? 0 : 1 - Math.exp(-sinceShatter / 56); // fast at first, then hangs in the air
  const bubbleVisible = f >= S2.sparkPop && f < S2.shatter;
  const burst = sinceShatter >= 0 ? Math.exp(-sinceShatter / 14) : 0;

  // --- foreground card + depth of field
  const cardT = f - S2.cardSlam;
  const cardSp = cardT < 0 ? 0 : spring({ frame: cardT, fps, config: { damping: 13, stiffness: 190, mass: 0.8 } });
  const stageBlur = ramp(f, S2.cardSlam - 2, S2.cardSlam + 16) * 7;
  const cardW = (portrait ? 900 : 800) * S;
  const cardBlur = Math.max(0, 1 - Math.min(1, cardSp)) * 10;

  const lamp = {
    x: lerp(portrait ? 0.5 : 0.45, portrait ? 0.5 : 0.3, shift),
    y: lerp(0.5, portrait ? 0.34 : 0.5, shift),
    intensity: 0.6 + punch * 0.2,
    radius: 1000 * S,
  };

  const caption = typed('Ground zero // FCT Abuja', ramp(f, 30, 110));
  const hud = (
    <>
      {f > 28 && (
        <div style={{ position: 'absolute', left: (portrait ? 60 : 90) * S, top: (portrait ? 150 : 80) * S }}>
          <Dymo size={34 * S} rot={-2}>
            {caption}
          </Dymo>
        </div>
      )}
      {cardT >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: portrait ? (w - cardW) / 2 : w * 0.54,
            top: portrait ? h * 0.5 : (h - cardW * 0.7) / 2,
            transform: `rotate(${-6 + (1 - cardSp) * 11}deg) scale(${1 + (1 - cardSp) * 1.7})`,
            opacity: clamp01(cardT / 4),
            filter: cardBlur > 0.4 ? `blur(${cardBlur}px)` : undefined,
            transformOrigin: '50% 50%',
          }}
        >
          <TornNotebook w={cardW} quote="Abuja dey boil. ₦85B don vanish — and nobody wan talk." footer="— overheard · Wuse Market · 6:42am" type={ramp(f, S2.cardSlam + 16, S2.cardSlam + 110)} />
        </div>
      )}
    </>
  );

  return (
    <CinematicRig id="s2" cam={cam} camPrev={camAt(f - 1)} lamp={lamp} impacts={[S2.sparkPop, S2.shatter, S2.cardSlam]} hud={hud} stageBlur={stageBlur} fadeIn={6} darkness={0.6}>
      <Desk kind="mahogany" />
      <div style={{ position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: `translate(${-fx * panP}px, ${-fy * panP}px)` }}>
        {/* the map: cut from newsprint, lying on the desk with a soft shadow */}
        <div
          style={{
            position: 'absolute',
            left: -mapW / 2,
            top: -(mapW * 600) / 744 / 2,
            filter: 'drop-shadow(10px 18px 6px rgba(0,0,0,.5)) drop-shadow(0 40px 34px rgba(0,0,0,.6))',
          }}
        >
          <NigeriaMap width={mapW} fillFor={staticFill} strokeFor={staticStroke} strokeWidth={1.5} overlay={overlay} />
        </div>

        {/* billboarded spark bubble hovering over Abuja */}
        {bubbleVisible && (
          <div style={{ position: 'absolute', left: fx, top: fy, transformStyle: 'preserve-3d', transform: `translateZ(${90 * S + bob}px)` }}>
            <div style={{ position: 'absolute', left: -bubbleSize / 2, top: -bubbleSize / 2 - 60 * S, transform: `${bill} scale(${popP})` }}>
              <SparkBubble size={bubbleSize} label="15" />
            </div>
          </div>
        )}
        {sinceShatter >= 0 && (
          <div style={{ position: 'absolute', left: fx, top: fy, transformStyle: 'preserve-3d', transform: `translateZ(${120 * S}px)` }}>
            <div style={{ position: 'absolute', left: 0, top: -60 * S, transform: bill }}>
              {/* the pop itself: a soft flash, not a hard ring */}
              <div style={{ position: 'absolute', left: -bubbleSize * 1.3, top: -bubbleSize * 1.3, width: bubbleSize * 2.6, height: bubbleSize * 2.6, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,240,190,.95) 0%, rgba(245,158,11,.5) 35%, rgba(245,158,11,0) 70%)', opacity: burst, transform: `scale(${0.6 + (1 - burst) * 0.9})` }} />
              <Shards t={slowT} size={bubbleSize * 1.7} color={C.amberLight} glow="rgba(245,158,11,.9)" count={9} />
              {sinceShatter < 110 && (
                <div style={{ position: 'absolute', left: -150 * S, top: -(bubbleSize * 0.9) - sinceShatter * 0.5 * S, width: 300 * S, textAlign: 'center', fontFamily: FONT.sans, fontWeight: 900, fontSize: 54 * S, color: C.amberLight, textShadow: '0 4px 18px rgba(0,0,0,.8)', opacity: 1 - sinceShatter / 110 }}>
                  +15 ⚡
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CinematicRig>
  );
};
