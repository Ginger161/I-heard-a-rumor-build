// Tuning knobs for numbers the spec does NOT dictate. Everything the spec states (channel stats,
// the 6-stage pipeline, evidence and defense effects) lives in its own file and is never tuned here.
export const BALANCE = {
  // nigeriaData.ts keeps each state's original Doubt; the engine multiplies it by this scale to get
  // the ordinary starting baseline (spec §2.2 only fixes Flock Immunity's 25%).
  baselineDoubtScale: 0.5,
  flockImmunityDoubt: 25,

  // Spin bubbles beyond the three scripted counter-offensives (spec §2.3 says only that Bot Farm
  // spawns them "twice as often" in the online hubs, which implies an ambient rate).
  spinLifetimeTicks: 3,
  spinAmbientChance: 0.15,
  spinAmbientMaxActive: 3,
  spinAmbientMinBelieverPct: 5
};
