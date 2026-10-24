import React, { useMemo } from 'react';
import Nigeria from '@svg-maps/nigeria';
import { SVG_STATE_CENTROIDS } from '../../../src/engine/data/mapGeometry';
import { NIGERIA_STATES } from '../../../src/engine/data/nigeriaData';
import { toSvgId } from '../../../src/engine/data/mapIds';
import { C } from '../theme';

// The trailer draws the game's real geometry: path data from @svg-maps/nigeria (viewBox 744x600),
// centroids from mapGeometry.ts and populations from nigeriaData.ts.
export const MAP_W = 744;
export const MAP_H = 600;
export const pathOf = (svgId: string) => Nigeria.locations.find((l) => l.id === svgId)!.path;
export const centroid = (svgId: string) => SVG_STATE_CENTROIDS[svgId];

export const POP_BY_SVG: Record<string, number> = Object.fromEntries(
  Object.entries(NIGERIA_STATES).map(([id, s]) => [toSvgId(id), s.population]),
);
export const TOTAL_POP = Object.values(POP_BY_SVG).reduce((a, b) => a + b, 0);

type Props = {
  width: number;
  fillFor?: (id: string) => string;
  strokeFor?: (id: string) => string | undefined;
  strokeWidth?: number;
  /** drawn in map coordinates, on top of the states */
  overlay?: React.ReactNode;
  style?: React.CSSProperties;
};

const States = React.memo(({ fillFor, strokeFor, strokeWidth }: Pick<Props, 'fillFor' | 'strokeFor' | 'strokeWidth'>) => (
  <>
    {Nigeria.locations.map((l) => (
      <path
        key={l.id}
        d={l.path}
        fill={fillFor ? fillFor(l.id) : C.paper}
        stroke={strokeFor?.(l.id) ?? C.ink}
        strokeWidth={strokeWidth ?? 1.4}
        strokeLinejoin="round"
      />
    ))}
  </>
));

export const NigeriaMap: React.FC<Props> = ({ width, fillFor, strokeFor, strokeWidth, overlay, style }) => {
  const height = (width * MAP_H) / MAP_W;
  // fillFor/strokeFor change identity every frame, so memo is cheap insurance for static scenes only
  const states = useMemo(
    () => <States fillFor={fillFor} strokeFor={strokeFor} strokeWidth={strokeWidth} />,
    [fillFor, strokeFor, strokeWidth],
  );
  return (
    <svg width={width} height={height} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ display: 'block', overflow: 'visible', ...style }}>
      {states}
      {overlay}
    </svg>
  );
};
