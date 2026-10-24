import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CinematicRig } from '../CinematicRig';
import { useLayout } from '../layout';
import { C } from '../theme';
import { FONT } from '../fonts';
import { Desk, Dymo, Shards } from '../components/props';
import { SparkBubble, TornNotebook } from '../components/cards';
import { NigeriaMap, centroid, pathOf } from '../components/NigeriaMap';
import { clamp01, easeInOut, lerp, mapRange, ramp } from '../fx';
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

  // --- camera: crane down, then punch in on the shatter, then slide the focus aside for the card
  const crane = spring({ frame: f, fps, config: { damping: 32, stiffness: 36, mass: 1.5 } });
  const punch = f < S2.shatter - 6 ? 0 : spring({ frame: f - (S2.shatter - 6), fps, config: { damping: 20, stiffness: 55, mass: 1 } });
  const panP = easeInOut(ramp(f, 100, S2.shatter + 10));
  const shift = easeInOut(ramp(f, S2.cardSlam - 8, S2.cardSlam + 24));

  const camRx = lerp(10, 38, crane);
  const camRz = lerp(-14, -6, crane);
  const cam = {
    rx: camRx - punch * 5,
    rz: camRz,
    tz: lerp(-900, 0, crane) + punch * 430,
    ty: lerp(-220 * S, 0, crane) + (portrait ? -h * 0.2 : 0) * shift,
    tx: (portrait ? 0 : -w * 0.2) * shift,
  };
  const bill = `rotateZ(${-cam.rz}deg) rotateX(${-cam.rx}deg)`;

  // --- FCT highlight: pulsing amber fill + expanding rings
  const pulseStart = 40;
  const pulse = f < pulseStart ? 0 : 0.65 + 0.35 * Math.sin((f - pulseStart) / 7);
  const ringT = (n: number) => ((f - pulseStart + n * 20) % 60) / 60;
  const overlay =
    f < pulseStart ? null : (
      <g>
        <path d={pathOf('fct')} fill={C.amber} fillOpacity={pulse} stroke={C.amberDeep} strokeWidth={3} />
        {[0, 1, 2].map((n) => (
          <circle key={n} cx={fct.x} cy={fct.y} r={8 + ringT(n) * 70} fill="none" stroke={C.amber} strokeWidth={3.5 * (1 - ringT(n))} opacity={1 - ringT(n)} />
        ))}
      </g>
    );

  // --- Spark bubble: pops in, hovers, shatters in slow motion
  const popP = f < S2.sparkPop ? 0 : spring({ frame: f - S2.sparkPop, fps, config: { damping: 8, stiffness: 220, mass: 0.7 } });
  const bubbleSize = 170 * S;
  const bob = Math.sin(f / 9) * 10 * S;
  const sinceShatter = f - S2.shatter;
  const slowT = sinceShatter < 0 ? 0 : 1 - Math.exp(-sinceShatter / 42); // eased: moves fast, then hangs in the air
  const bubbleVisible = f >= S2.sparkPop && f < S2.shatter;
  const flashRing = sinceShatter >= 0 && sinceShatter < 40 ? sinceShatter / 40 : 0;

  // --- foreground card + depth of field
  const cardT = f - S2.cardSlam;
  const cardSp = cardT < 0 ? 0 : spring({ frame: cardT, fps, config: { damping: 13, stiffness: 190, mass: 0.8 } });
  const stageBlur = ramp(f, S2.cardSlam - 2, S2.cardSlam + 12) * 7;
  const cardW = (portrait ? 900 : 800) * S;

  const lamp = {
    x: lerp(portrait ? 0.5 : 0.45, portrait ? 0.5 : 0.3, shift),
    y: lerp(0.5, portrait ? 0.34 : 0.5, shift),
    intensity: 0.6 + punch * 0.2,
    radius: 1000 * S,
  };

  const hud = (
    <>
      {f > 20 && (
        <div style={{ position: 'absolute', left: (portrait ? 60 : 90) * S, top: (portrait ? 150 : 80) * S, opacity: clamp01((f - 20) / 6) }}>
          <Dymo size={34 * S} rot={-2}>
            Ground zero // FCT Abuja
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
            opacity: clamp01(cardT / 3),
            transformOrigin: '50% 50%',
          }}
        >
          <TornNotebook
            w={cardW}
            quote="Abuja dey boil. Dem say ₦85B just vanish from one ministry account and nobody wan talk."
            footer="— overheard · Wuse Market · 6:42am"
          />
        </div>
      )}
    </>
  );

  return (
    <CinematicRig id="s2" cam={cam} lamp={lamp} impacts={[S2.sparkPop, S2.shatter, S2.cardSlam]} hud={hud} stageBlur={stageBlur} fadeIn={6} darkness={0.6}>
      <Desk kind="mahogany" />
      <div style={{ position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: `translate(${-fx * panP}px, ${-fy * panP}px)` }}>
        {/* the map: hard offset shadow + soft falloff */}
        <div
          style={{
            position: 'absolute',
            left: -mapW / 2,
            top: -(mapW * 600) / 744 / 2,
            filter: 'drop-shadow(16px 24px 0 rgba(0,0,0,.55)) drop-shadow(0 46px 36px rgba(0,0,0,.65))',
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
              {flashRing > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: -bubbleSize * (0.5 + flashRing * 1.4),
                    top: -bubbleSize * (0.5 + flashRing * 1.4),
                    width: bubbleSize * (1 + flashRing * 2.8),
                    height: bubbleSize * (1 + flashRing * 2.8),
                    borderRadius: '50%',
                    border: `${6 * S}px solid rgba(253,230,138,${1 - flashRing})`,
                  }}
                />
              )}
              <Shards t={slowT} size={bubbleSize * 1.6} color={C.amber} glow="rgba(245,158,11,.95)" />
              {sinceShatter < 70 && (
                <div style={{ position: 'absolute', left: -150 * S, top: -(bubbleSize * 0.9) - sinceShatter * 0.7 * S, width: 300 * S, textAlign: 'center', fontFamily: FONT.sans, fontWeight: 900, fontSize: 54 * S, color: C.amberLight, textShadow: '0 4px 18px rgba(0,0,0,.8)', opacity: 1 - sinceShatter / 70 }}>
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
