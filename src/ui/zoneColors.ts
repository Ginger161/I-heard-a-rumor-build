import type { ZoneId } from '../engine/data/zones';

// Every region has its own pale colour, so the map is colour-coded before a single rumour is told (and it quietly teaches where
// the regions are). All are cool, so they never look like the warm amber and red the spread paints over them.
export const ZONE_TINT: Record<ZoneId, string> = {
  SW: '#D9EBD9',   // South-West: green
  SE: '#E4D9F0',   // South-East: lilac
  SS: '#CFE6EC',   // South-South: teal
  NC: '#E3EAD0',   // North-Central: olive
  NE: '#D8DCF0',   // North-East: periwinkle
  NW: '#E6DFD6'    // North-West: stone
};
