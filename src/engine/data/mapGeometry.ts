import { toSvgId } from './mapIds';

// Geometry helpers for @svg-maps/nigeria (viewBox "0 0 744 600"). Keyed by SVG location id.
export interface BBox { x: number; y: number; w: number; h: number }
export interface Point { x: number; y: number }

export const SVG_STATE_BBOXES: Record<string, BBox> = {
  abia: { x: 277, y: 491, w: 52, h: 75 },
  adamawa: { x: 540, y: 185, w: 143, h: 219 },
  'akwa-ibom': { x: 297, y: 522, w: 55, h: 66 },
  anambra: { x: 244, y: 444, w: 48, h: 68 },
  bauchi: { x: 373, y: 87, w: 149, h: 189 },
  benue: { x: 298, y: 360, w: 152, h: 106 },
  borno: { x: 555, y: 11, w: 189, h: 232 },
  bayelsa: { x: 167, y: 530, w: 85, h: 70 },
  'cross-river': { x: 322, y: 437, w: 100, h: 137 },
  delta: { x: 144, y: 460, w: 110, h: 94 },
  ebonyi: { x: 301, y: 443, w: 57, h: 70 },
  edo: { x: 143, y: 395, w: 107, h: 115 },
  ekiti: { x: 138, y: 364, w: 57, h: 51 },
  enugu: { x: 262, y: 424, w: 61, h: 74 },
  fct: { x: 252, y: 284, w: 56, h: 60 },
  gombe: { x: 487, y: 161, w: 88, h: 110 },
  imo: { x: 245, y: 497, w: 49, h: 47 },
  jigawa: { x: 337, y: 56, w: 155, h: 131 },
  kaduna: { x: 212, y: 150, w: 168, h: 157 },
  kebbi: { x: 51, y: 41, w: 158, h: 198 },
  kano: { x: 311, y: 82, w: 104, h: 129 },
  kogi: { x: 166, y: 323, w: 158, h: 138 },
  katsina: { x: 260, y: 34, w: 131, h: 141 },
  kwara: { x: 4, y: 235, w: 216, h: 137 },
  lagos: { x: 2, y: 449, w: 103, h: 21 },
  nassarawa: { x: 264, y: 284, w: 167, h: 100 },
  niger: { x: 57, y: 160, w: 233, h: 197 },
  ogun: { x: 0, y: 370, w: 120, h: 104 },
  ondo: { x: 104, y: 383, w: 105, h: 119 },
  osun: { x: 84, y: 363, w: 65, h: 71 },
  oyo: { x: 0, y: 295, w: 118, h: 134 },
  plateau: { x: 364, y: 223, w: 131, h: 125 },
  rivers: { x: 230, y: 510, w: 75, h: 85 },
  sokoto: { x: 90, y: 0, w: 165, h: 149 },
  taraba: { x: 399, y: 269, w: 178, h: 193 },
  yobe: { x: 434, y: 32, w: 175, h: 176 },
  zamfara: { x: 146, y: 44, w: 138, h: 147 }
};

export const SVG_STATE_CENTROIDS: Record<string, Point> = {
  abia: { x: 303, y: 529 },
  adamawa: { x: 612, y: 295 },
  'akwa-ibom': { x: 324, y: 555 },
  anambra: { x: 268, y: 478 },
  bauchi: { x: 447, y: 182 },
  benue: { x: 374, y: 413 },
  borno: { x: 650, y: 127 },
  bayelsa: { x: 210, y: 565 },
  'cross-river': { x: 372, y: 506 },
  delta: { x: 199, y: 507 },
  ebonyi: { x: 329, y: 478 },
  edo: { x: 197, y: 452 },
  ekiti: { x: 167, y: 389 },
  enugu: { x: 292, y: 461 },
  fct: { x: 280, y: 314 },
  gombe: { x: 531, y: 216 },
  imo: { x: 269, y: 521 },
  jigawa: { x: 415, y: 121 },
  kaduna: { x: 296, y: 229 },
  kebbi: { x: 130, y: 140 },
  kano: { x: 363, y: 147 },
  kogi: { x: 245, y: 392 },
  katsina: { x: 326, y: 105 },
  kwara: { x: 112, y: 303 },
  lagos: { x: 54, y: 460 },
  nassarawa: { x: 348, y: 334 },
  niger: { x: 173, y: 259 },
  ogun: { x: 60, y: 422 },
  ondo: { x: 157, y: 443 },
  osun: { x: 117, y: 398 },
  oyo: { x: 59, y: 362 },
  plateau: { x: 429, y: 285 },
  rivers: { x: 268, y: 553 },
  sokoto: { x: 173, y: 74 },
  taraba: { x: 488, y: 366 },
  yobe: { x: 521, y: 120 },
  zamfara: { x: 215, y: 118 }
};

const FALLBACK_BBOX: BBox = { x: 0, y: 0, w: 744, h: 600 };
const FALLBACK_CENTROID: Point = { x: 372, y: 300 };

// Accept either a simulation (data) id or an SVG id.
export const getStateBBox = (id: string): BBox =>
  SVG_STATE_BBOXES[toSvgId(id)] ?? SVG_STATE_BBOXES[id] ?? FALLBACK_BBOX;

export const getStateCentroid = (id: string): Point =>
  SVG_STATE_CENTROIDS[toSvgId(id)] ?? SVG_STATE_CENTROIDS[id] ?? FALLBACK_CENTROID;
