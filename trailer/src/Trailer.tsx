import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import './fonts';
import { Graded, PostFX } from './PostFX';
import { Scene1 } from './scenes/Scene1';
import { Scene2 } from './scenes/Scene2';
import { Scene3 } from './scenes/Scene3';
import { Scene4 } from './scenes/Scene4';
import { Scene5 } from './scenes/Scene5';
import { Scene6 } from './scenes/Scene6';
import { SCENES } from './timing';

const SCENE_LIST: [keyof typeof SCENES, React.FC][] = [
  ['s1', Scene1],
  ['s2', Scene2],
  ['s3', Scene3],
  ['s4', Scene4],
  ['s5', Scene5],
  ['s6', Scene6],
];

/** One composition, two aspect ratios: every scene re-composes itself for the frame it is given. */
export const Trailer: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Graded>
      {SCENE_LIST.map(([key, Scene]) => (
        <Sequence key={key} from={SCENES[key].from} durationInFrames={SCENES[key].dur} layout="none">
          <Scene />
        </Sequence>
      ))}
    </Graded>
    <PostFX />
    <Audio src={staticFile('trailer-mix.wav')} />
  </AbsoluteFill>
);
