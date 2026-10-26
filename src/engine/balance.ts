// Every tunable number that is not part of a data table lives here, so the difficulty system can
// scale the game from one place. Data tables (channels, evidence, defense, targets, events) own
// their own numbers.
export const BALANCE = {
  // ---- Clock (target session: about 5 minutes including paused time) ----
  dayBudget: 30,
  tickMs: 8000,
  assistTickMult: 1.5,      // Assist Mode stretches each day by this much
  assistRewardShare: 0.5,   // Assisted wins pay this share of envelopes (and cap at 1 star)

  // ---- Stat curves: raw sums are soft-capped so the late tree never becomes meaningless ----
  capVelocity: 1.5,
  capCredibility: 1.0,
  capNotoriety: 1.6,

  // ---- Funnel ----
  conversionScale: 0.35,        // Heard -> Believers per tick = heard * C_eff * shield * this
  convictionFloor: 0.03,        // Passive conversion once a state has real critical mass
  viralFloorPct: 0.014,         // Spec: share of population that hears per tick in an infected state
  doubtGrowth: { GRASSROOTS: 1.0, HYPER_ONLINE: 2.4, ELITE_HUB: 1.8 } as Record<string, number>,
  anchorScale: 1.7,             // Credibility anchor = C_eff * this
  doubtFloorPerDay: -0.8,       // Doubt can never fall faster than this per tick
  hypePerSocialVelocity: 0.5,   // Viral Social channels breed skepticism (receipts needed)
  coverUpDoubtPressure: 2.0,    // Extra Doubt growth at 100% Cover-Up
  baselineDoubtScale: 0.5,      // nigeriaData.ts keeps its Doubt; the engine starts at this share of it

  // ---- Contagion ----
  highwayBase: 0.05,
  highwayPerVelocity: 0.12,
  highwayPerStreet: 0.03,
  highwayMax: 0.45,
  highwaySeedPct: 0.002,        // Spec: 0.2% of the neighbour's population
  highwayMinReach: 2000,
  highwayMinReachPct: 0.005,
  flightBase: 0.1,
  flightPerVelocity: 0.15,
  flightMax: 0.5,
  flightMinAwareness: 0.03,
  flightSeedPct: 0.003,

  // ---- Sparks ----
  seedSpark: 15,
  whisperBase: 4,               // First Whisper bounty = base + scale * sqrt(pop / 15.4M)
  whisperScale: 10,
  stochasticBase: 0.34,
  stochasticPerNotoriety: 0.35,
  stochasticMax: 0.9,
  maxSparksOnBoard: 6,
  goldenChance: 0.07,           // Share of stochastic sparks that are rare GOLDEN jackpots
  goldenMultiplier: 3,
  fastSpark: [4, 6] as [number, number],
  fatSpark: [9, 14] as [number, number],
  // Where bubbles come from (see simulation.ts, Stage 5): (1) a steady drip over time, denser in the first days so the board is never left
  // empty while the rumour is still small; (2) a First Whisper for every state the rumour reaches; (3) a tipping-point bubble when a state
  // is really talking; (4) a guarantee that a board never stays empty. (2) and (3) grow with the spread: the more the news travels, the more bubbles.
  earlyDays: 6,                 // Days that count as "early": the drip is denser
  earlyDrip: 1,                 // Multiplier on the drip chance in those days
  tippingAwareness: 0.12,       // Share of a state's people who have heard it, for the tipping point
  whisperShare: 0.6,            // A state's bounty is paid in two bubbles: this share when the rumour reaches it...
  tippingFactor: 0.4,           // ...and this share when it tips (so the total is what it always was)
  emptyGuard: true,             // A board that is empty after a tick gets one small bubble
  earlySmall: 0.2,              // ...but those early bubbles are small (about a fifth), so the early game feels busy without being richer (the guided first case keeps full size)
  trainingMinBubbles: 3,        // The guided first case always keeps this many bubbles on the board (a person pops them in seconds, then waits for the next tick)
  trainingMinUntilDay: 14,
  trainingDrip: 1.6,            // The guided first case gets even more, so a beginner is never waiting

  // ---- Heat / Investigation ----
  heatFloor: 1.0,
  // ---- Heat v2: Heat is not a bank account. The DSS keeps a file, the story draws more eyes as it spreads, and cover-ups get dearer. ----
  heatFloorShare: 0.4,          // Defenses cannot push Heat below this share of your PEAK Heat (they remember how loud you were)...
  heatFloorCap: 40,             // ...up to this much
  heatExposure: 0.12,            // Daily Heat gain is multiplied by 1 + this x (share of the country that believes): the more it spreads, the more eyes it draws
  defenseCostStep: 0.08,        // Every defense you have already bought makes the next one 8% dearer
  burnerDecay: [1, 0.85, 0.7],   // Each extra Burner SIM scrubs less of the trail (18%, 15%, 13%)
  evidenceFade: 0.05,           // Each verified file you have already leaked makes the next one cut Doubt 5% less (floor 50%): people stop being shocked
  heatPerNotoriety: 7.0,
  investigationBase: 3.6,       // Spec 6%/day over 20 days, scaled to the longer run
  whistleblowerBonus: 3,

  // ---- Cover-Up meter (the Target's "cure") ----
  coverUpBase: 2.0,
  coverUpBelieverBoost: 1.5,    // x(1 + this * believerShare)
  coverUpCredibilityDamp: 0.45, // Credibility slows the cover-up by up to this share
  coverUpSpinDetonation: 3,
  coverUpLose: 100,

  // ---- Story freshness ----
  freshnessDecay: 2.0,
  freshnessFloor: 15,
  freshnessMinMultiplier: 0.55, // A stale story contributes this share of its V and C
  freshnessOnChannelBuy: 8,

  // ---- Spin bubbles ----
  spinLifetimeTicks: 3,
  spinAmbientBase: 0.05,
  spinAmbientPerCoverUp: 0.0025, // chance += coverUp * this
  spinAmbientMaxActive: 3,
  spinDoubt: 15,
  spinNeighbourDoubt: 4,

  // ---- Events ----
  eventMinDay: 3,
  eventCooldown: 4,
  eventChance: 0.35,

  // ---- Win ----
  winBelieverPct: 75,

  // ---- Per-tier baselines (index 0 = Tier 1). Spec ratios 24/20/18/16 days and Doubt/Heat x0.75/1/1.25/1.5, calibrated with `npm run simulate`. ----
  tier: {
    days: [36, 30, 28, 27, 26],
    heat: [0.75, 1.05, 1.05, 1.1, 1.1],   // eased at Tiers 3-5 when Heat v2 (the Heat floor, dearer defenses) arrived, so the top tiers stay winnable
    doubtGrowth: [0.75, 1.0, 1.25, 1.5, 1.55],
    coverUp: [1.1, 1.15, 1.4, 1.7, 1.85],
    doubtAdd: [3, 3, 6, 10, 10]
  },

  // ---- AI personalities ----
  crashoutBelieverPct: 15,       // THE_CRASHOUT rants at this Believers %
  crashoutVelocityBoost: 1.1,    // ...giving you +10% Velocity
  crashoutBoostDays: 6,
  crashoutSpin: 2,
  stoicAmbushPct: 55,            // THE_STOIC saves everything for this Believers %
  signaturePct: 50,              // Every Target's signature move
  signatureStrength: 2,          // ...is its strongest ability at double strength
  weaknessMult: 1.25,
  resistanceMult: 0.75,
  chatterMs: 4000,

  // ---- Stars (shares of the match's own day budget, per the design doc: 15/20 and 12/20) ----
  star2DayShare: 0.75,
  star2PeakHeat: 75,
  star3DayShare: 0.6,
  star3PeakHeat: 50,

  // ---- Brown Envelopes meta-economy ----
  envelopesStart: 50,
  envelopesFirstWin: 50,
  envelopesPerNewStar: 15,
  envelopesReplayWin: 15,
  bribeTarget: 100,
  tierBuyout: { 2: 80, 3: 120, 4: 250, 5: 400 } as Record<number, number>
};

export const STARS_TO_UNLOCK_TIER = 4;
