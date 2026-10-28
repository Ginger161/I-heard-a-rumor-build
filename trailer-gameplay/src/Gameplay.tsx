import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import './fonts';
import { Graded, PostFX } from './PostFX';
import { SvgDefs } from './texture';
import { SCENES, SceneKey } from './timing';
import { SceneHook, SceneTarget, ScenePlant, SceneChannels, SceneSpread, SceneFight, SceneDesks, SceneEnding, SceneTitle } from './scenes';

const LIST: [SceneKey, React.FC][] = [
  ['hook', SceneHook], ['target', SceneTarget], ['plant', ScenePlant], ['channels', SceneChannels], ['spread', SceneSpread],
  ['fight', SceneFight], ['desks', SceneDesks], ['ending', SceneEnding], ['title', SceneTitle],
];

/** One composition, two aspect ratios: every scene re-composes itself for the frame it is given. */
export const Gameplay: React.FC<{ audio?: boolean }> = ({ audio = true }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <SvgDefs />
    <Graded>
      {LIST.map(([key, Scene]) => (
        <Sequence key={key} from={SCENES[key].from} durationInFrames={SCENES[key].dur} layout="none">
          <Scene />
        </Sequence>
      ))}
    </Graded>
    <PostFX />
    {audio && <Audio src={staticFile('gameplay-mix.wav')} />}
  </AbsoluteFill>
);
