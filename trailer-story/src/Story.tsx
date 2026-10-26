import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import './fonts';
import { Graded, PostFX } from './PostFX';
import { SvgDefs } from './texture';
import { SCENES, SceneKey } from './timing';
import { SceneA } from './scenes/SceneA';
import { SceneB } from './scenes/SceneB';
import { SceneC } from './scenes/SceneC';
import { SceneD } from './scenes/SceneD';
import { SceneE } from './scenes/SceneE';
import { SceneF } from './scenes/SceneF';
import { SceneG } from './scenes/SceneG';

const SCENE_LIST: [SceneKey, React.FC][] = [['a', SceneA], ['b', SceneB], ['c', SceneC], ['d', SceneD], ['e', SceneE], ['f', SceneF], ['g', SceneG]];

/** One composition, two aspect ratios: every scene re-composes itself for the frame it is given. */
export const Story: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <SvgDefs />
    <Graded>
      {SCENE_LIST.map(([key, Scene]) => (
        <Sequence key={key} from={SCENES[key].from} durationInFrames={SCENES[key].dur} layout="none">
          <Scene />
        </Sequence>
      ))}
    </Graded>
    <PostFX />
    <Audio src={staticFile('story-mix.wav')} />
  </AbsoluteFill>
);
