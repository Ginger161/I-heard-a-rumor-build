import React from 'react';
import { Composition } from 'remotion';
import { Story } from './Story';
import { FPS, TOTAL } from './timing';

export const Root: React.FC = () => (
  <>
    <Composition id="Story-16x9" component={Story} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="Story-9x16" component={Story} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
  </>
);
