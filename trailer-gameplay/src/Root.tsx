import React from 'react';
import { Composition } from 'remotion';
import { Gameplay } from './Gameplay';
import { FPS, TOTAL } from './timing';

export const Root: React.FC = () => (
  <>
    <Composition id="Gameplay-16x9" component={Gameplay} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} defaultProps={{ audio: false }} />
    <Composition id="Gameplay-9x16" component={Gameplay} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{ audio: false }} />
  </>
);
