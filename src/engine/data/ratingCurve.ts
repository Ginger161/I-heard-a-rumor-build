// RATING CURVE: how the bot check turns a Target's measured difficulty (D, 0 = trivial, 100 = impossible, from all thirty bot plans)
// into a PR rating. Fitted to the 61 official Targets by scripts/calibrate30.ts, so a player-made Target is rated on the
// same ladder as the official ones: a 1,400 Arena Target is about as hard as an official 1,400.
export const RATING_KNOTS: [number, number][] = [[0,300],[2.7,380],[6.7,530],[9.9,650],[14.6,910],[19.5,990],[24.9,1570],[28.7,1740],[40.7,2300],[48.5,2710],[60.8,3190],[100,3500]];

export const ratingFromD = (d: number): number => {
  const k = RATING_KNOTS;
  if (d <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (d <= k[i][0]) {
      const [x0, y0] = k[i - 1], [x1, y1] = k[i];
      return Math.round((y0 + ((y1 - y0) * (d - x0)) / Math.max(1e-9, x1 - x0)) / 10) * 10;
    }
  }
  return k[k.length - 1][1];
};
