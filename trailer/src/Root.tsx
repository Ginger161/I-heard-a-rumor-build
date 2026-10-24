import React from 'react';
import { Composition } from 'remotion';
import { Trailer } from './Trailer';
import { FPS, TOTAL } from './timing';

export const Root: React.FC = () => (
  <>
    <Composition id="Trailer-9x16" component={Trailer} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    <Composition id="Trailer-16x9" component={Trailer} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
  </>
);
