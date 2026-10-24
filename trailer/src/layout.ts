import { useVideoConfig } from 'remotion';

// Both formats are authored in "design px" where the SHORT side is 1080. Scenes read `portrait` and
// re-compose (stack vs. side-by-side) instead of cropping, so nothing is ever cut off.
export const useLayout = () => {
  const { width: w, height: h } = useVideoConfig();
  const portrait = h > w;
  return { w, h, portrait, S: Math.min(w, h) / 1080 };
};
