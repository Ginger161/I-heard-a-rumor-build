import React from 'react';
import { random } from 'remotion';

const PALETTE = ['255,190,90', '255,238,205', '255,70,60', '255,238,205', '120,190,255', '255,160,60'];

type Layer = { z: number; n: number; size: [number, number]; speed: number; alpha: number; blurCore: number };
const LAYERS: Layer[] = [
  { z: -900, n: 16, size: [140, 320], speed: 0.18, alpha: 0.32, blurCore: 0.15 },
  { z: -520, n: 14, size: [90, 210], speed: 0.34, alpha: 0.42, blurCore: 0.25 },
  { z: -240, n: 10, size: [50, 120], speed: 0.6, alpha: 0.5, blurCore: 0.4 },
];

/**
 * Night street at lens distance: defocused headlight discs on three parallax planes, a few anamorphic
 * streaks. Drawn with gradients only (no blur filters) so it stays cheap. `f` drives the drift.
 */
export const Bokeh: React.FC<{ f: number; spread?: number; intensity?: number; seed?: string }> = ({ f, spread = 2600, intensity = 1, seed = 'bk' }) => (
  <>
    {LAYERS.map((L, li) =>
      Array.from({ length: L.n }, (_, i) => {
        const r = (k: string) => random(`${seed}${li}${i}${k}`);
        const base = (r('x') - 0.5) * spread;
        const x = ((((base + f * L.speed * (r('s') > 0.5 ? 1 : -0.7)) % spread) + spread * 1.5) % spread) - spread / 2;
        const y = (r('y') - 0.5) * spread * 0.42 + 120;
        const size = L.size[0] + r('z') * (L.size[1] - L.size[0]);
        const col = PALETTE[Math.floor(r('c') * PALETTE.length)];
        const pulse = 0.75 + 0.25 * Math.sin(f * 0.04 + i * 2.1);
        const streak = r('k') > 0.78;
        return (
          <React.Fragment key={`${li}-${i}`}>
            <div
              style={{
                position: 'absolute',
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
                borderRadius: '50%',
                transform: `translateZ(${L.z}px)`,
                background: `radial-gradient(circle, rgba(${col},${L.alpha * pulse * intensity}) 0%, rgba(${col},${L.alpha * 0.8 * pulse * intensity}) ${L.blurCore * 100 + 25}%, rgba(${col},0) 70%)`,
                boxShadow: `inset 0 0 0 ${Math.max(1, size * 0.012)}px rgba(${col},${0.18 * intensity})`,
              }}
            />
            {streak && (
              <div
                style={{
                  position: 'absolute',
                  left: x - size * 2.2,
                  top: y - 3,
                  width: size * 4.4,
                  height: 6,
                  transform: `translateZ(${L.z}px)`,
                  background: `linear-gradient(90deg, rgba(${col},0), rgba(${col},${0.5 * intensity}), rgba(${col},0))`,
                  filter: 'blur(2px)',
                }}
              />
            )}
          </React.Fragment>
        );
      }),
    )}
  </>
);
