import React from 'react';

// Procedural textures as inline SVG data-URIs. Chrome rasterises each tile once and reuses it, so they are
// far cheaper than live feTurbulence layers while still breaking up flat CSS colour.
const uri = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
const tile = (size: number, body: string) =>
  uri(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${body}</svg>`);

/** Fine warm speckle: the "tooth" of cheap newsprint / manila. */
export const PAPER_TEX = tile(
  320,
  `<filter id="a"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="5"/>
   <feColorMatrix values="0 0 0 0 .32  0 0 0 0 .24  0 0 0 0 .14  0 0 0 .62 -.12"/></filter>
   <rect width="320" height="320" filter="url(#a)"/>`,
);

/** Long, soft horizontal fibres plus a few blotches: uneven ageing. */
export const FIBER_TEX = tile(
  480,
  `<filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.45" numOctaves="3" seed="11"/>
   <feColorMatrix values="0 0 0 0 .28  0 0 0 0 .2  0 0 0 0 .1  0 0 0 .5 -.14"/></filter>
   <filter id="c"><feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="2" seed="3"/>
   <feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .1  0 0 0 .55 -.22"/></filter>
   <rect width="480" height="480" filter="url(#b)"/><rect width="480" height="480" filter="url(#c)"/>`,
);

/** Dark, stretched grain lines for the desk. */
export const WOOD_TEX = tile(
  1024,
  `<filter id="d"><feTurbulence type="fractalNoise" baseFrequency="0.0018 0.085" numOctaves="4" seed="8"/>
   <feColorMatrix values="0 0 0 0 .05  0 0 0 0 .02  0 0 0 0 0  0 0 0 1.5 -.5"/></filter>
   <rect width="1024" height="1024" filter="url(#d)"/>`,
);

/** Speckled cork. */
export const CORK_TEX = tile(
  512,
  `<filter id="e"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="2"/>
   <feColorMatrix values="0 0 0 0 .28  0 0 0 0 .15  0 0 0 0 .05  0 0 0 4.5 -1.9"/></filter>
   <filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="6"/>
   <feColorMatrix values="0 0 0 0 .95  0 0 0 0 .8  0 0 0 0 .55  0 0 0 4 -2.1"/></filter>
   <rect width="512" height="512" filter="url(#e)"/><rect width="512" height="512" filter="url(#f)" opacity=".5"/>`,
);

/**
 * Global filters, mounted once. Referenced from CSS as url(#ink) / url(#rough) / url(#mapgrain).
 *  - rough:    wobbles edges a few px so torn paper, labels and tape stop looking vector-perfect
 *  - ink:      wobble + speckled ink dropout, for rubber stamps and printed type
 *  - mapgrain: softens the map linework a touch and lays paper grain over the states
 */
export const SvgDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
    <defs>
      <filter id="rough" x="-3%" y="-3%" width="106%" height="106%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="4" />
      </filter>
      <filter id="ink" x="-4%" y="-6%" width="108%" height="112%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" seed="9" result="grain" />
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.4 2.55" result="holes" />
        <feComposite in="d" in2="holes" operator="in" />
      </filter>
      <filter id="mapgrain" x="-2%" y="-2%" width="104%" height="104%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="soft" />
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="12" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 .25  0 0 0 0 .18  0 0 0 0 .1  0 0 0 .55 -.1" result="shade" />
        <feComposite in="shade" in2="soft" operator="atop" result="grained" />
        <feComposite in="grained" in2="soft" operator="over" />
      </filter>
    </defs>
  </svg>
);
