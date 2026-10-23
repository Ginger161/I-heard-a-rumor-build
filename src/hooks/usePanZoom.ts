import { useCallback, useRef, useState } from 'react';

export interface PanZoom { x: number; y: number; scale: number }

interface Options {
  minScale: number;
  maxScale: number;
  /** Size of the content at scale 1, or null to use the viewport's size. */
  content: { w: number; h: number } | null;
  /** 'center' when the content is centred in the viewport, 'topleft' when it is anchored at 0,0. */
  origin: 'center' | 'topleft';
  /** How far (px) the content may be dragged past its edges. */
  slack?: number;
}

const DRAG_THRESHOLD = 6;

/** One-finger pan, two-finger pinch and wheel zoom, always clamped so the content can't be lost off-screen. */
export function usePanZoom({ minScale, maxScale, content, origin, slack = 40 }: Options) {
  const [t, setT] = useState<PanZoom>({ x: 0, y: 0, scale: 1 });
  const tRef = useRef(t);
  const viewRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ t: PanZoom; cx: number; cy: number; dist: number } | null>(null);

  const apply = useCallback((next: PanZoom) => {
    const el = viewRef.current;
    const vw = el?.clientWidth ?? 0, vh = el?.clientHeight ?? 0;
    const scale = Math.min(maxScale, Math.max(minScale, next.scale));
    const cw = (content?.w ?? vw) * scale, ch = (content?.h ?? vh) * scale;
    const ox = origin === 'center' ? vw / 2 : 0, oy = origin === 'center' ? vh / 2 : 0;
    // Screen position of the content's left/top edge = o + t + scale*(0 - o) for centre origin, t for top-left.
    const edgeX = origin === 'center' ? ox - (content?.w ?? vw) * scale / 2 : 0;
    const edgeY = origin === 'center' ? oy - (content?.h ?? vh) * scale / 2 : 0;
    const limit = (edge: number, size: number, view: number, v: number) => {
      const lo = (size > view ? view - size : 0) - slack - edge;
      const hi = (size > view ? 0 : view - size) + slack - edge;
      return Math.min(Math.max(v, Math.min(lo, hi)), Math.max(lo, hi));
    };
    const out = { scale, x: limit(edgeX, cw, vw, next.x), y: limit(edgeY, ch, vh, next.y) };
    tRef.current = out;
    setT(out);
  }, [minScale, maxScale, content?.w, content?.h, origin, slack]);

  // Zoom keeping the point (fx, fy), in viewport coordinates, fixed on screen.
  const zoomAt = useCallback((from: PanZoom, scale: number, fx: number, fy: number) => {
    const el = viewRef.current;
    const ox = origin === 'center' ? (el?.clientWidth ?? 0) / 2 : 0;
    const oy = origin === 'center' ? (el?.clientHeight ?? 0) / 2 : 0;
    const k = scale / from.scale;
    return { scale, x: fx - ox - k * (fx - ox - from.x), y: fy - oy - k * (fy - oy - from.y) };
  }, [origin]);

  const rel = (e: { clientX: number; clientY: number }) => {
    const r = viewRef.current?.getBoundingClientRect();
    return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0) };
  };
  const rebase = () => {
    const pts = [...pointers.current.values()];
    if (pts.length === 0) { gesture.current = null; return; }
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gesture.current = { t: tRef.current, cx, cy, dist };
  };

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (pointers.current.size === 0) moved.current = false;
      pointers.current.set(e.pointerId, rel(e));
      rebase();
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!pointers.current.has(e.pointerId) || !gesture.current) return;
      pointers.current.set(e.pointerId, rel(e));
      const pts = [...pointers.current.values()];
      const g = gesture.current;
      const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
      const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
      if (pts.length === 1 && !moved.current && Math.hypot(cx - g.cx, cy - g.cy) < DRAG_THRESHOLD) return;
      moved.current = true;
      let next = g.t;
      if (pts.length > 1 && g.dist > 0) {
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        next = zoomAt(g.t, Math.min(maxScale, Math.max(minScale, g.t.scale * dist / g.dist)), g.cx, g.cy);
      }
      apply({ ...next, x: next.x + (cx - g.cx), y: next.y + (cy - g.cy) });
    },
    onPointerUp: (e: React.PointerEvent) => { pointers.current.delete(e.pointerId); rebase(); },
    onPointerCancel: (e: React.PointerEvent) => { pointers.current.delete(e.pointerId); rebase(); },
    onPointerLeave: (e: React.PointerEvent) => { pointers.current.delete(e.pointerId); rebase(); },
    onWheel: (e: React.WheelEvent) => {
      const p = rel(e);
      const cur = tRef.current;
      const scale = Math.min(maxScale, Math.max(minScale, cur.scale * Math.exp(-e.deltaY * 0.0015)));
      apply(zoomAt(cur, scale, p.x, p.y));
    },
  };

  const zoomBy = (factor: number) => {
    const el = viewRef.current;
    const cur = tRef.current;
    const scale = Math.min(maxScale, Math.max(minScale, cur.scale * factor));
    apply(zoomAt(cur, scale, (el?.clientWidth ?? 0) / 2, (el?.clientHeight ?? 0) / 2));
  };
  const reset = () => apply({ x: 0, y: 0, scale: 1 });

  return { t, viewRef, moved, handlers, zoomBy, reset, setT: apply };
}
