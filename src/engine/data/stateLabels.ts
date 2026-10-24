import { NIGERIA_STATES } from './nigeriaData';
import { SVG_STATE_BBOXES } from './mapGeometry';
import { getStateCentroid } from './mapGeometry';
import { toSvgId } from './mapIds';
import { AIRPORT_HUBS, ZONE_IDS, ZONE_NAMES, ZONE_STATE_IDS, ZoneId } from './zones';

// ---------------------------------------------------------------------------
// STATE NAMES ON THE MAP
//
// Players know their own state and a few famous ones, but cannot find the rest by shape. So the map writes the real state
// names on it. No codes and no abbreviations: a name is either written in full or not at all. Which names appear depends on
// how much room there is: at normal zoom the big and famous states are named, and more names appear as you zoom in (and the
// Find-a-state list can take you to any state). Labels never overlap each other and never run off the edge of the map.
// ---------------------------------------------------------------------------

export const stateLabel = (id: string): string => (id === 'fct' ? 'Abuja' : NIGERIA_STATES[id]?.name ?? id);
export const stateListName = (id: string): string => (id === 'fct' ? 'Abuja (FCT)' : NIGERIA_STATES[id]?.name ?? id);

export const ALL_STATE_IDS: string[] = Object.keys(NIGERIA_STATES);
export const STATES_A_TO_Z: string[] = ALL_STATE_IDS.slice().sort((a, b) => stateLabel(a).localeCompare(stateLabel(b)));
export const STATES_BY_ZONE: { zone: ZoneId; name: string; ids: string[] }[] = ZONE_IDS.map(zone => ({
  zone, name: ZONE_NAMES[zone], ids: ZONE_STATE_IDS[zone].slice().sort((a, b) => stateLabel(a).localeCompare(stateLabel(b)))
}));

// The states people look for first get their names first.
const FAMOUS = ['lagos', 'fct', 'kano', 'rivers', 'oyo', 'kaduna', 'enugu', 'anambra', 'borno', 'delta', 'edo', 'ogun', 'plateau', 'imo', 'abia', 'osun', 'kwara', 'benue', 'sokoto', 'cross_river'];
const fameRank = (id: string) => { const i = FAMOUS.indexOf(id); return i < 0 ? 99 : i; };
const area = (id: string) => { const b = SVG_STATE_BBOXES[toSvgId(id)]; return b ? b.w * b.h : 0; };

export const MAP_VIEWBOX = { w: 744, h: 600 };

// How many screen pixels one map unit takes at zoom 1, given the size of the map area (the map is drawn at 94% of the area, at most 640x520).
export const mapBaseUnit = (viewW: number, viewH: number): number => {
  const w = Math.min(viewW * 0.94, 640), h = Math.min(viewH * 0.94, 520);
  return Math.max(0.05, Math.min(w / MAP_VIEWBOX.w, h / MAP_VIEWBOX.h));
};

export interface PlacedLabel {
  id: string;
  lines: string[];
  x: number; y: number;      // where the text is centred, in map units
  fontUnits: number;         // font size in map units (constant on screen)
  forced: boolean;
}

export interface LabelInput {
  viewW: number; viewH: number;               // the map area on screen, px
  scale: number; tx: number; ty: number;      // the current zoom and pan
  forced?: string[];                          // states that must be named (selected, searched, start)
  avoid?: { x: number; y: number }[];         // bubbles on the map (map units): a name never sits under one
  fontPx?: number;
}

const splitName = (name: string): string[] => {
  const words = name.split(' ');
  return words.length === 2 && name.length > 7 ? words : [name];
};

/** Decide which state names fit right now. Pure, so it can be tested. */
export const layoutLabels = ({ viewW, viewH, scale, tx, ty, forced = [], avoid = [], fontPx = 10 }: LabelInput): PlacedLabel[] => {
  if (viewW <= 0 || viewH <= 0) return [];
  const base = mapBaseUnit(viewW, viewH);
  const k = base * scale;                       // screen px per map unit now
  const halfW = (MAP_VIEWBOX.w / 2) * k, halfH = (MAP_VIEWBOX.h / 2) * k;
  const order = ALL_STATE_IDS.slice().sort((a, b) => {
    const fa = forced.includes(a) ? 0 : 1, fb = forced.includes(b) ? 0 : 1;
    return fa - fb || fameRank(a) - fameRank(b) || area(b) - area(a);
  });
  const R = 24;   // a bubble blocks about this many pixels around its middle
  const bubbles: { x0: number; y0: number; x1: number; y1: number }[] = avoid.map(a => {
    const bx = viewW / 2 + tx + (a.x - MAP_VIEWBOX.w / 2) * k, by = viewH / 2 + ty + (a.y - MAP_VIEWBOX.h / 2) * k;
    return { x0: bx - R, x1: bx + R, y0: by - R, y1: by + R };
  });
  const placed = bubbles.slice();
  const hits = (b: { x0: number; y0: number; x1: number; y1: number }, list: typeof placed) => list.some(p => b.x0 < p.x1 && b.x1 > p.x0 && b.y0 < p.y1 && b.y1 > p.y0);
  const out: PlacedLabel[] = [];
  for (const id of order) {
    const isForced = forced.includes(id);
    const lines = splitName(stateLabel(id));
    const fs = isForced ? fontPx + 1 : fontPx;
    const w = Math.max(...lines.map(l => l.length)) * fs * 0.62 + 8;
    const h = lines.length * fs * 1.15 + 4;
    const c = getStateCentroid(id);
    // Position relative to the middle of the map, on screen. Airports have a plane icon in the middle: sit the name just below it.
    let rx = (c.x - MAP_VIEWBOX.w / 2) * k;
    let ry = (c.y - MAP_VIEWBOX.h / 2) * k + (AIRPORT_HUBS.includes(id) ? 13 : 0);
    // Never run off the edge of the map: slide the name back inside it.
    rx = Math.min(halfW - w / 2, Math.max(-halfW + w / 2, rx));
    ry = Math.min(halfH - h / 2, Math.max(-halfH + h / 2, ry));
    // On screen (the view's middle plus the pan). Names outside the visible area are skipped and do not block others.
    const sx = viewW / 2 + tx + rx, sy = viewH / 2 + ty + ry;
    if (sx + w / 2 < 0 || sx - w / 2 > viewW || sy + h / 2 < 0 || sy - h / 2 > viewH) continue;
    let nudge = 0;
    const boxAt = (d: number) => ({ x0: sx - w / 2 - 2, x1: sx + w / 2 + 2, y0: sy + d - h / 2 - 1, y1: sy + d + h / 2 + 1 });
    if (isForced) {
      // A name that must be shown steps out of the way of a bubble instead of hiding under it.
      for (const d of [0, 28, -28, 56]) { nudge = d; if (!hits(boxAt(d), bubbles)) break; }
    } else {
      // Crowded: try sliding the name a little up or down (staying inside its own state) before leaving it out.
      const free = [0, 14, -14].find(d => !hits(boxAt(d), placed));
      if (free === undefined) continue;
      nudge = free;
    }
    placed.push(boxAt(nudge));
    out.push({ id, lines, x: MAP_VIEWBOX.w / 2 + rx / k, y: MAP_VIEWBOX.h / 2 + (ry + nudge) / k, fontUnits: fs / k, forced: isForced });
  }
  return out;
};

/** Pan and zoom that put a state in the middle of the map area. */
export const focusTransform = (id: string, viewW: number, viewH: number): { scale: number; x: number; y: number } => {
  const base = mapBaseUnit(viewW, viewH);
  const b = SVG_STATE_BBOXES[toSvgId(id)];
  const small = !b || b.w * b.h < 6000;
  const scale = small ? 3.2 : 2.2;
  const c = getStateCentroid(id);
  return { scale, x: -scale * (c.x - MAP_VIEWBOX.w / 2) * base, y: -scale * (c.y - MAP_VIEWBOX.h / 2) * base };
};
