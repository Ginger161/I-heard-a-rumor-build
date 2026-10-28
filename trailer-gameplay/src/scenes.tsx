import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CinematicRig, Cam, Lamp } from './CinematicRig';
import { useLayout } from './layout';
import { easeInOut, easeOut, clamp01, flash, mapRange, lerp } from './fx';
import { Backdrop, Chip, Headline, Stat } from './components/ui';
import { Phone, ClipKey } from './components/Phone';
import { Map3D, SIM, simAt, nationalBelievers, nationalHeard } from './components/Map3D';
import { SlamText, Tag } from './components/kinetic';
import { C } from './theme';
import { FONT } from './fonts';
import { sec, T_HOOK, T_TARGET, T_PLANT, T_CHANNELS, T_SPREAD, T_FIGHT, T_DESKS, T_ENDING, T_TITLE, SCENE_SEC } from './timing';

type Chip = { at: number; out: number; text: string; sub?: string; n?: number };

/** Callouts come one at a time in a fixed slot: left column in landscape, a band under the phone in portrait. */
const ChipSeq: React.FC<{ f: number; chips: Chip[]; color?: string }> = ({ f, chips, color }) => {
  const { portrait } = useLayout();
  return (
    <>
      {chips.map((c, i) => (
        <Chip key={i} f={f} at={sec(c.at)} out={sec(c.out)} n={c.n} text={c.text} sub={c.sub} x={portrait ? 540 : 90} y={portrait ? 1690 : 560} align={portrait ? 'center' : 'left'} color={color} />
      ))}
    </>
  );
};

/** Where a single hero phone sits for the current frame shape. */
const useHero = () => {
  const { portrait } = useLayout();
  return portrait ? { h: 1170, x: 0, y: 110 } : { h: 860, x: 470, y: 30 };
};

type ShellProps = {
  id: string;
  camAt: (f: number) => Cam;
  lamp: Lamp;
  impacts?: number[];
  whipIn?: number;
  hud?: (f: number) => React.ReactNode;
  children: (f: number) => React.ReactNode;
  glitches?: number[];
  hue?: string;
  darkness?: number;
};
const Shell: React.FC<ShellProps> = ({ id, camAt, lamp, impacts, whipIn = 0, hud, children, glitches, hue, darkness = 0.72 }) => {
  const f = useCurrentFrame();
  return (
    <CinematicRig id={id} cam={camAt(f)} camPrev={camAt(f - 1)} lamp={lamp} impacts={impacts} whipIn={whipIn} glitches={glitches} darkness={darkness} hud={hud ? <>{hud(f)}</> : undefined}>
      <Backdrop hue={hue} />
      {children(f)}
    </CinematicRig>
  );
};

/** slow orbit helper: eases from a to b across the scene */
const orbit = (f: number, dur: number, a: number, b: number) => lerp(a, b, easeInOut(clamp01(f / dur)));

// ---- 1. hook ----------------------------------------------------------------------------------------------------------------
export const SceneHook: React.FC = () => {
  const { portrait, S } = useLayout();
  const dur = sec(SCENE_SEC.hook.dur);
  const idx = (f: number) => mapRange(f, sec(T_HOOK.glow), dur, 0, 3.2, easeInOut);
  const camAt = (f: number): Cam => ({ tz: orbit(f, dur, -380, 130), rx: orbit(f, dur, 62, 50), rz: orbit(f, dur, -26, 8), ry: 0, ty: portrait ? orbit(f, dur, 380, 300) : orbit(f, dur, 90, 30) });
  const line = (t: number, text: string, color: string) => <SlamText text={text} t={t} size={(portrait ? 150 : 170) * S} font="display" color={color} spacing={0.01} glow={`${color}55`} />;
  return (
    <Shell id="hook" camAt={camAt} lamp={{ x: 0.5, y: 0.52, intensity: 0.9, radius: 900, tint: '150,190,255' }} impacts={[sec(T_HOOK.l1), sec(T_HOOK.l2), sec(T_HOOK.l3)]} hue="70,110,170"
      hud={(f) => (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: portrait ? 'flex-start' : 'center', paddingTop: portrait ? 230 * S : 0, flexDirection: 'column', gap: 18 * S }}>
          <Tag size={26 * S} color={C.amber} style={{ letterSpacing: '0.5em', opacity: clamp01(f / 20) }}>Nigeria · 223.8M people</Tag>
          {line(f - sec(T_HOOK.l1), 'ONE WHISPER.', '#fff')}
          {line(f - sec(T_HOOK.l2), 'ONE COUNTRY.', '#fff')}
          {line(f - sec(T_HOOK.l3), 'ZERO RECEIPTS.', C.siren)}
          <AbsoluteFill style={{ background: '#fff', opacity: flash(f, sec(T_HOOK.cut) - 6, 3, 18) * 0.9, pointerEvents: 'none' }} />
        </AbsoluteFill>
      )}
    >
      {(f) => <Map3D run={SIM.win} idx={idx(f)} frame={f} w={portrait ? 1000 : 1500} lift={1.2} sparkAt={f > sec(T_HOOK.glow) ? 'lagos' : undefined} showFlights={false} />}
    </Shell>
  );
};

// ---- phone scenes -----------------------------------------------------------------------------------------------------------
type PhoneSceneProps = {
  id: string; scene: keyof typeof SCENE_SEC; clip: ClipKey; kicker: string; line: string; sub?: string; chips: Chip[];
  rate?: number; headAt: number; impacts?: number[]; whip?: number; accent?: string; ryA?: number; ryB?: number; from?: number; hue?: string;
};
const PhoneScene: React.FC<PhoneSceneProps> = ({ id, scene, clip, kicker, line, sub, chips, rate = 1, headAt, impacts, whip = 14, accent = C.amber, ryA = -16, ryB = 6, from, hue }) => {
  const { portrait } = useLayout();
  const hero = useHero();
  const dur = sec(SCENE_SEC[scene].dur);
  const camAt = (f: number): Cam => ({ tz: orbit(f, dur, -90, 50), ry: orbit(f, dur, ryA, ryB), rx: orbit(f, dur, 7, 2), tx: orbit(f, dur, portrait ? 0 : -30, portrait ? 0 : 20), rz: orbit(f, dur, -1.5, 1) });
  return (
    <Shell id={id} camAt={camAt} whipIn={whip} impacts={impacts} hue={hue}
      lamp={{ x: portrait ? 0.5 : 0.7, y: 0.5, intensity: 0.85, radius: 1000, tint: '190,215,255' }}
      hud={(f) => (
        <>
          <Headline t={f - sec(headAt)} kicker={kicker} line={line} sub={sub} accent={accent} />
          <ChipSeq f={f} chips={chips} color={accent} />
        </>
      )}
    >
      {(f) => <Phone clip={clip} from={from} t={f} rate={rate} h={hero.h} x={hero.x} y={hero.y} ry={0} rx={0} glare={clamp01(f / dur)} />}
    </Shell>
  );
};

export const SceneTarget: React.FC = () => (
  <PhoneScene id="target" scene="target" clip="target" kicker="Step 1 · Choose" line="PICK YOUR TARGET" headAt={T_TARGET.head}
    chips={[
      { at: T_TARGET.tiers, out: T_TARGET.sealed - 0.2, n: 1, text: '61 TARGETS. 5 TIERS.', sub: 'Climb the ladder' },
      { at: T_TARGET.sealed, out: T_TARGET.pick - 0.2, n: 2, text: 'SEALED UNTIL YOU EARN THEM', sub: 'No peeking at the big men' },
      { at: T_TARGET.pick, out: T_TARGET.file - 0.2, n: 3, text: 'EVERY TARGET FIGHTS DIFFERENT', sub: 'Passives · play style · scandals' },
      { at: T_TARGET.file, out: 99, n: 4, text: 'PICK THE SCANDAL', sub: 'Match it to your channels for x1.35' },
    ]}
  />
);

export const ScenePlant: React.FC = () => (
  <PhoneScene id="plant" scene="plant" clip="plant" kicker="Step 2 · Spark" line="PLANT THE RUMOUR" headAt={T_PLANT.head} ryA={14} ryB={-6}
    impacts={[sec(T_PLANT.pop)]}
    chips={[
      { at: T_PLANT.plant, out: T_PLANT.pop - 0.2, n: 1, text: 'TAP ANY STATE', sub: 'Ground zero' },
      { at: T_PLANT.pop, out: T_PLANT.clock - 0.1, n: 2, text: 'POP THE FIRST SPARK ⚡', sub: 'Sparks are your money' },
      { at: T_PLANT.clock, out: 99, n: 3, text: 'THE CLOCK STARTS', sub: 'Days run out. So does your luck.' },
    ]}
  />
);

export const SceneChannels: React.FC = () => (
  <PhoneScene id="channels" scene="channels" clip="channels" kicker="Step 3 · Build" line="CHAIN THE GIST" headAt={T_CHANNELS.head} accent="#7DD3FC" ryA={-14} ryB={8}
    chips={[
      { at: T_CHANNELS.lanes, out: T_CHANNELS.pin - 0.2, n: 1, text: '26 CHANNELS. 4 LANES.', sub: 'Street · Social · Press · Elite' },
      { at: T_CHANNELS.pin, out: T_CHANNELS.buy - 0.2, n: 2, text: 'TAP A PIN. SEE WHAT IT DOES.', sub: 'Velocity · Credibility · Notoriety' },
      { at: T_CHANNELS.buy, out: 99, n: 3, text: 'SPEND SPARKS. UNLOCK THE NEXT.', sub: 'Every pin opens another' },
    ]}
  />
);

// ---- 5. the spread (3D map from a real simulated game) ----------------------------------------------------------------------
export const SceneSpread: React.FC = () => {
  const { portrait, S } = useLayout();
  const dur = sec(SCENE_SEC.spread.dur);
  const n = SIM.win.frames.length - 1;
  const idx = (f: number) => Math.pow(clamp01((f - sec(T_SPREAD.run)) / (dur - sec(0.8) - sec(T_SPREAD.run))), 0.62) * n;
  const camAt = (f: number): Cam => ({ tz: orbit(f, dur, -300, -20), rx: orbit(f, dur, 64, 46), rz: orbit(f, dur, 22, -14), ry: 0, ty: portrait ? orbit(f, dur, 120, 60) : orbit(f, dur, 70, 20), tx: portrait ? -20 : 400 });
  const chips: Chip[] = [
    { at: T_SPREAD.run, out: T_SPREAD.planes - 0.2, n: 1, text: 'WATCH IT SPREAD', sub: 'Street to street. State to state.' },
    { at: T_SPREAD.planes, out: T_SPREAD.hot - 0.2, n: 2, text: 'PLANES CARRY IT', sub: 'Lagos · Abuja · Kano · PH · Enugu' },
    { at: T_SPREAD.hot, out: 99, n: 3, text: 'AMBER HEARD. RED BELIEVES.', sub: 'Tall = hot' },
  ];
  return (
    <Shell id="spread" camAt={camAt} whipIn={12} hue="70,110,170" lamp={{ x: portrait ? 0.5 : 0.66, y: 0.5, intensity: 0.9, radius: 1100, tint: '170,200,255' }}
      hud={(f) => {
        const st = simAt(SIM.win, idx(f));
        const bel = nationalBelievers(st.believers) * 100;
        const heard = nationalHeard(st.heard) * 100;
        return (
          <>
            <Headline t={f - sec(T_SPREAD.head)} kicker="Step 4 · Spread" line="WATCH IT BLOOM" sub="A real match, played by the game's own bot." accent={C.siren} />
            <div style={{ position: 'absolute', left: (portrait ? 70 : 90) * S, bottom: (portrait ? 330 : 120) * S, display: 'flex', gap: 44 * S, opacity: clamp01((f - sec(T_SPREAD.run)) / 14) }}>
              <Stat label="Day" value={`${st.day}/${SIM.win.day}`} color="#fff" w={portrait ? 210 : 250} />
              <Stat label="Heard" value={`${heard.toFixed(0)}%`} color={C.amber} w={portrait ? 210 : 250} />
              <Stat label="Believers" value={`${bel.toFixed(0)}%`} color={C.siren} w={portrait ? 250 : 300} />
            </div>
            <ChipSeq f={f} chips={chips} color={C.siren} />
          </>
        );
      }}
    >
      {(f) => <Map3D run={SIM.win} idx={idx(f)} frame={f} w={portrait ? 900 : 940} lift={1.35} />}
    </Shell>
  );
};

export const SceneFight: React.FC = () => (
  <PhoneScene id="fight" scene="fight" clip="fight" kicker="Step 5 · Resist" line="THEY FIGHT BACK" headAt={T_FIGHT.head} accent="#FB923C" ryA={12} ryB={-8} rate={1}
    chips={[
      { at: T_FIGHT.doubt, out: T_FIGHT.spin - 0.2, n: 1, text: 'DOUBT KILLS GOSSIP', sub: 'Every state starts sceptical' },
      { at: T_FIGHT.spin, out: T_FIGHT.coverup - 0.2, n: 2, text: 'THEY SPIN IT. YOU SHATTER IT.', sub: 'Pop the spin bubbles in time' },
      { at: T_FIGHT.coverup, out: 99, n: 3, text: 'COVER-UP CLIMBS. 100% = YOU LOSE.', sub: 'Keep the story fresh' },
    ]}
  />
);

// ---- 7. desks: three phones ------------------------------------------------------------------------------------------------
export const SceneDesks: React.FC = () => {
  const { portrait, S } = useLayout();
  const dur = sec(SCENE_SEC.desks.dur);
  const camAt = (f: number): Cam => ({ tz: orbit(f, dur, -200, 80), ry: orbit(f, dur, -10, 10), rx: orbit(f, dur, 6, 3), tx: 0, rz: 0 });
  const hh = portrait ? 700 : 680;
  const pos = portrait
    ? [{ x: -250, y: 30, z: 0, ry: 14, rz: -3 }, { x: 0, y: 170, z: 80, ry: 0, rz: 0 }, { x: 250, y: 30, z: 0, ry: -14, rz: 3 }]
    : [{ x: -520, y: 110, z: 0, ry: 18, rz: -2 }, { x: 0, y: 90, z: 120, ry: 0, rz: 0 }, { x: 520, y: 110, z: 0, ry: -18, rz: 2 }];
  const clips: [ClipKey, number, string, string, string][] = [
    ['evidence', T_DESKS.evidence, 'EVIDENCE', 'Drop receipts. Push the cover-up back.', C.amber],
    ['defense', T_DESKS.defense, 'DEFENSE', 'Scrub your trail. Cool the heat.', '#7DD3FC'],
    ['heat', T_DESKS.heat, 'HEAT', '100% and the DSS kicks your door.', C.siren],
  ];
  return (
    <Shell id="desks" camAt={camAt} whipIn={12} hue="90,100,160" lamp={{ x: 0.5, y: 0.5, intensity: 0.8, radius: 1200, tint: '200,210,255' }}
      hud={(f) => (
        <>
          <Headline t={f - sec(T_DESKS.head)} kicker="Step 6 · Survive" line="DON'T GET BUSTED" accent={C.siren} />
          {clips.map(([, at, label, sub, col], i) => (
            <Chip key={label} f={f} at={sec(at)} out={i === 2 ? 1e9 : sec(clips[i + 1][1]) - 4} n={i + 1} text={label} sub={sub} x={portrait ? 540 : 960} y={portrait ? 1700 : 960} align={portrait ? 'center' : 'center'} color={col} />
          ))}
        </>
      )}
    >
      {(f) => (
        <>
          {clips.map(([clip, at], i) => {
            const nextAt = i < 2 ? sec(clips[i + 1][1]) : 1e9;
            const active = f >= sec(at) - 2 && f < nextAt - 2;
            if (portrait) {
              // one big phone at a time: it slides in from the right at its beat and the previous one slides out to the left
              const tIn = easeOut(clamp01((f - (sec(at) - 2)) / 16));
              const tOut = i < 2 ? easeInOut(clamp01((f - (nextAt - 2)) / 14)) : 0;
              const x = (1 - tIn) * 900 - tOut * 900;
              if (f < sec(at) - 2 || tOut >= 1) return null;
              return <Phone key={clip} clip={clip} t={f} h={1060} x={x} y={90} z={40} ry={(1 - tIn) * -24 + tOut * 24} glare={clamp01(f / dur)} />;
            }
            const p = easeOut(clamp01((f - sec(0.15) - i * 8) / 20));
            const lift = active ? 1 : 0;
            return <Phone key={clip} clip={clip} t={f} h={hh * (active ? 1.06 : 0.96)} x={pos[i].x} y={pos[i].y + (1 - p) * 240 - lift * 24} z={pos[i].z + lift * 80} ry={pos[i].ry} rz={pos[i].rz} opacity={p * (active ? 1 : 0.55)} dim={active ? 1 : 0.8} glare={clamp01(f / dur)} />;
          })}
        </>
      )}
    </Shell>
  );
};

// ---- 8. endings -------------------------------------------------------------------------------------------------------------
export const SceneEnding: React.FC = () => {
  const { portrait } = useLayout();
  const hero = useHero();
  const dur = sec(SCENE_SEC.ending.dur);
  const bust = sec(T_ENDING.bust);
  const camAt = (f: number): Cam => ({ tz: orbit(f, dur, -100, 160), ry: f < bust ? orbit(f, bust, -12, 6) : orbit(f - bust, dur - bust, 12, -4), rx: 3, tx: portrait ? 0 : -20 });
  return (
    <Shell id="ending" camAt={camAt} whipIn={10} impacts={[bust]} glitches={[bust, bust + 6]} hue="120,90,90"
      lamp={{ x: portrait ? 0.5 : 0.7, y: 0.5, intensity: 0.9, radius: 1000, tint: '255,220,200' }}
      hud={(f) => {
        const busted = f >= bust;
        return (
          <>
            <Headline t={busted ? f - bust : f - sec(T_ENDING.win)} kicker={busted ? 'Or…' : 'The ending'} line={busted ? 'GET BUSTED.' : 'WIN THE FRONT PAGE.'} accent={busted ? C.siren : C.amber} color={busted ? C.siren : '#fff'} />
            <AbsoluteFill style={{ background: busted ? C.siren : '#fff', opacity: flash(f, bust, 2, 16) * 0.55, pointerEvents: 'none' }} />
          </>
        );
      }}
    >
      {(f) => <Phone clip={f < bust ? 'win' : 'lose'} t={f} h={hero.h} x={hero.x} y={hero.y} glare={clamp01(f / dur)} />}
    </Shell>
  );
};

// ---- 9. modes + title ------------------------------------------------------------------------------------------------------------
export const SceneTitle: React.FC = () => {
  const { portrait, S } = useLayout();
  const dur = sec(SCENE_SEC.title.dur);
  const camAt = (f: number): Cam => ({ tz: orbit(f, dur, -260, 40), ry: orbit(f, dur, -8, 8), rx: orbit(f, dur, 8, 2), ty: portrait ? -60 : 0 });
  const titleF = sec(T_TITLE.title);
  const modes: [ClipKey, string, string][] = [
    ['arcade', 'ARCADE', C.amber],
    ['story', 'STORY', '#fb7185'],
    ['arena', 'ARENA', '#22d3ee'],
    ['campaign', 'CAMPAIGNS', '#86efac'],
  ];
  const MODE_SUB = ['Quick cases. Pick a Target.', 'A thriller where every choice costs', 'Build a Target. Beat your friends', 'Spread something good'];
  const hh = portrait ? 560 : 560;
  const xs = portrait ? [-330, -110, 110, 330] : [-690, -230, 230, 690];
  const rys = [20, 8, -8, -20];
  return (
    <Shell id="title" camAt={camAt} whipIn={10} hue="70,110,170" impacts={[titleF]} lamp={{ x: 0.5, y: 0.5, intensity: 0.85, radius: 1300, tint: '190,215,255' }}
      hud={(f) => {
        const t = f - titleF;
        return (
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 0, paddingBottom: 0, flexDirection: 'column' }}>
            {t < 0 && <Headline t={f} kicker="Four ways to play" line="ONE RUMOUR. FOUR WAYS." />}
            {t < 0 && modes.map(([, label, col], i) => (
              <Chip key={label} f={f} at={sec(T_TITLE.m[i])} out={i < 3 ? sec(T_TITLE.m[i + 1]) - 4 : titleF - 4} text={label === 'STORY' ? 'STORY MODE' : label} sub={MODE_SUB[i]} x={portrait ? 540 : 960} y={portrait ? 1700 : 955} align="center" color={col} />
            ))}
            {t >= 0 && (
              <>
                {portrait ? (
                  <>
                    <SlamText text="I HEARD" t={t} size={210 * S} font="display" color="#fff" spacing={0.01} glow="rgba(225,29,72,.6)" />
                    <div style={{ height: 6 * S }} />
                    <SlamText text="A RUMOR" t={t - 3} size={210 * S} font="display" color="#fff" spacing={0.01} glow="rgba(225,29,72,.6)" />
                  </>
                ) : (
                  <SlamText text="I HEARD A RUMOR" t={t} size={200 * S} font="display" color="#fff" spacing={0.01} glow="rgba(225,29,72,.6)" />
                )}
                <div style={{ width: (portrait ? 760 : 1100) * S, height: 10 * S, marginTop: 18 * S, background: C.siren, transform: `scaleX(${easeOut(clamp01((t - 10) / 20))}) skewX(-18deg)`, boxShadow: '0 0 36px rgba(225,29,72,.9)' }} />
                <div style={{ marginTop: 28 * S, opacity: clamp01((f - sec(T_TITLE.sub)) / 10) }}>
                  <Tag size={(portrait ? 24 : 32) * S} color="#cfe0f2" style={{ letterSpacing: portrait ? '0.26em' : '0.42em' }}>A Nigerian rumour strategy game</Tag>
                </div>
                <div style={{ marginTop: 22 * S, opacity: clamp01((f - sec(T_TITLE.tag)) / 10), fontFamily: FONT.display, fontSize: 64 * S, color: C.amber, letterSpacing: '0.06em' }}>SPREAD AM.</div>
              </>
            )}
          </AbsoluteFill>
        );
      }}
    >
      {(f) => (
        <>
          {modes.map(([clip, label, col], i) => {
            const p = easeOut(clamp01((f - sec(T_TITLE.modes) - i * 8) / 22));
            const sink = f >= titleF ? easeOut(clamp01((f - titleF) / 24)) : 0;
            const on = f >= sec(T_TITLE.m[i]) && (i === 3 || f < sec(T_TITLE.m[i + 1])) ? 1 : 0;
            return (
              <React.Fragment key={clip}>
                <Phone clip={clip} t={f} h={hh} x={xs[i]} y={(portrait ? 190 : 110) + (1 - p) * 300 + sink * (portrait ? 40 : -30) - on * 18} z={sink * -520 + on * 70} ry={rys[i]} opacity={p * (1 - sink * 0.82) * (f < titleF && !on ? 0.62 : 1)} glare={clamp01(f / dur)} />
              </React.Fragment>
            );
          })}
        </>
      )}
    </Shell>
  );
};
