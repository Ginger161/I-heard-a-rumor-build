import { useEffect, useState } from 'react';
import { useSettings } from './settings';

// Two deliberate layouts. Mobile is the portrait phone frame. Desktop is a different design for a big screen: a situation
// room with a case file, a large map, docked desks and a news ticker. 'auto' picks by window size and input type.
export type Layout = 'mobile' | 'desktop';

const DESKTOP_MIN_W = 1100;
const DESKTOP_MIN_H = 620;

const detect = (): Layout => {
  if (typeof window === 'undefined') return 'mobile';
  const wide = window.innerWidth >= DESKTOP_MIN_W && window.innerHeight >= DESKTOP_MIN_H;
  return wide ? 'desktop' : 'mobile';
};

export const useLayout = (): Layout => {
  const { layout } = useSettings();
  const [auto, setAuto] = useState<Layout>(detect);
  useEffect(() => {
    const on = () => setAuto(detect());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const resolved: Layout = layout === 'auto' ? auto : layout;
  useEffect(() => { document.documentElement.dataset.layout = resolved; }, [resolved]);
  return resolved;
};
