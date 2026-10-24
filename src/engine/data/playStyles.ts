import type { TargetArchetype } from './targetTypes';

// ---------------------------------------------------------------------------
// PLAY STYLES: what each Target asks of the player.
//
// Instead of every Target simply being "a stronger version of the last one", a Target puts one or two kinds of PRESSURE on
// you, and each kind punishes some plans and rewards others:
//   FORCE  (Watched)           the security services close in: loud plans burn you, quiet plans survive.
//   SPIN   (Spin machine)      their PR machine and Cover-Up grow fast: keep your guard up, build credibility.
//   CLOCK  (Short memory)      the news cycle is short: slow, cautious plans run out of time; fast plans win, and the Heat is lighter.
//   FAITH  (True believers)    their followers will not budge for hype: you need real evidence, not virality.
// A Target with two families needs a plan that handles both, which is how the top tiers get narrow without just being
// "stronger". Pairs are always COMPATIBLE (some plan can satisfy both): Watched + Spin machine is answered by careful, guarded
// plans; Short memory + True believers by fast plans that bring evidence. Watched + Short memory would demand "quiet and fast"
// at once, so it is never used. The numbers are the weights the tuner uses (1 = the Target's main pressure) and the hint shown to the player.
// ---------------------------------------------------------------------------
export type Family = 'FORCE' | 'SPIN' | 'CLOCK' | 'FAITH';

export const FAMILY_NAME: Record<Family, string> = { FORCE: 'Watched', SPIN: 'Spin machine', CLOCK: 'Short memory', FAITH: 'True believers' };

// One line per family: what the pressure is and, without spoiling it, what kind of answer it asks for.
export const FAMILY_HINT: Record<Family, string> = {
  FORCE: 'The security services are close. Loud, viral plans burn you out; stay quiet and keep your defences up.',
  SPIN: 'Their PR machine is fast. Do not leave Spin bubbles or Cover-Up to chance: guard early and build credibility.',
  CLOCK: 'The news cycle is short. Slow, cautious plans run out of days; move quickly, but keep it clean.',
  FAITH: 'Their followers will not move for hype. Real evidence early beats going viral.'
};

type Weights = [Family, number][];
export const PLAY_STYLES: Record<string, Weights> = {
  // ---- Tier 1 (easiest to hardest in the list order of the tuner plan, see scripts/tune2.ts)
  skit_king: [['CLOCK', 1]], owambe_dj: [['SPIN', 1]], slay_queen: [['FAITH', 1]], lga_councillor: [['SPIN', 1]], caution_landlord: [['FORCE', 1]],
  trials_coach: [['CLOCK', 1]], forex_flexer: [['FAITH', 1], ['SPIN', 0.6]], park_chairman: [['FORCE', 1]], herbal_doctor: [['SPIN', 1]], fire_pastor: [['FAITH', 1]],
  forex_signals: [['FAITH', 1], ['SPIN', 0.7]], land_guard: [['FORCE', 1]], iyaloja_general: [['FAITH', 1]],
  // ---- Tier 2
  vc_result_pending: [['FAITH', 1], ['SPIN', 0.5]], queen_afropop: [['FAITH', 1], ['SPIN', 0.4]], afro_bad_boy: [['FORCE', 1], ['FAITH', 0.6]],
  eze_ruler: [['FAITH', 1], ['FORCE', 0.5]], pothole_commissioner: [['CLOCK', 1], ['FAITH', 0.5]], bank_md: [['FORCE', 1], ['SPIN', 0.5]],
  lord_lambo: [['FAITH', 1]], cryptoking: [['FORCE', 1], ['FAITH', 0.5]], nollywood_queen: [['CLOCK', 1]], football_chairman: [['CLOCK', 1]],
  afrobeats_star: [['FAITH', 1]], ngo_queen: [['SPIN', 1]], mavin_mogul: [['FAITH', 0.8], ['CLOCK', 0.4]],
  // ---- Tier 3
  igp_everything: [['FORCE', 1], ['SPIN', 0.4]], customs_controller: [['FORCE', 1], ['SPIN', 0.4]], minister: [['FORCE', 0.8], ['SPIN', 0.5]],
  telecom_tycoon: [['CLOCK', 1], ['FAITH', 0.6]], adjournment_judge: [['CLOCK', 1], ['FAITH', 0.5]], cbn_deputy: [['FAITH', 1], ['CLOCK', 0.5]],
  subsidy_marketer: [['FORCE', 1]], distinguished_senator: [['FAITH', 1], ['SPIN', 0.7]], televangelist: [['FAITH', 1], ['SPIN', 0.6]],
  presidency_spokesman: [['FAITH', 1], ['SPIN', 0.5]], cement_sugar_baron: [['SPIN', 0.6], ['FORCE', 0.6]], rapper_activist: [['FAITH', 1]],
  daddy_freeze_frame: [['SPIN', 0.8]], comedian_king: [['CLOCK', 1]],
  // ---- Tier 4
  second_term_governor: [['FORCE', 1], ['FAITH', 0.5]], general_maradona: [['FORCE', 1], ['SPIN', 0.5]], senate_president: [['FORCE', 1], ['SPIN', 0.5]],
  offshore_chief: [['FAITH', 1], ['FORCE', 0.5], ['SPIN', 0.4]], brother_in_law: [['FORCE', 1], ['SPIN', 0.4]], godfather: [['FORCE', 1], ['FAITH', 0.5]],
  prayer_jet_bishop: [['FAITH', 1], ['FORCE', 0.5]], super_agent: [['CLOCK', 1], ['FAITH', 0.5]], media_owner: [['CLOCK', 0.8], ['FAITH', 1]],
  diaspora_investor: [['FAITH', 0.8], ['CLOCK', 0.6]], unicorn_founder: [['CLOCK', 0.8], ['FAITH', 0.4]],
  // ---- Tier 5
  the_cabal: [['FORCE', 1], ['FAITH', 0.4]], dictators_son: [['FORCE', 0.8], ['FAITH', 0.5]], mama_federation: [['FORCE', 1], ['FAITH', 0.7]],
  everybody_godfather: [['FORCE', 1], ['FAITH', 0.4]], the_landslide: [['FORCE', 1], ['FAITH', 0.5], ['SPIN', 0.4]], chief_justice: [['FORCE', 1], ['FAITH', 0.8]],
  richest_man: [['FAITH', 1], ['FORCE', 0.6], ['SPIN', 0.3]], supreme_oracle: [['FAITH', 1], ['FORCE', 0.5]], central_bank_governor: [['FAITH', 1], ['CLOCK', 0.6]],
  african_giant: [['FAITH', 0.8], ['CLOCK', 0.6]]
};

// A Target's families, strongest first.
export const familiesOf = (id: string): Family[] => (PLAY_STYLES[id] ?? []).slice().sort((a, b) => b[1] - a[1]).map(([f]) => f);

// What to show the player: a label and one or two hint lines. Story and Studio Targets have no entry and show nothing.
export const playStyleOf = (t: Pick<TargetArchetype, 'id'>): { label: string; hints: string[] } | null => {
  const fams = familiesOf(t.id);
  if (!fams.length) return null;
  return { label: fams.map(f => FAMILY_NAME[f]).join(' + '), hints: fams.map(f => FAMILY_HINT[f]) };
};
