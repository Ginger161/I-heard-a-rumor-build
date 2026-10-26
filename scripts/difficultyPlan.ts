// The difficulty plan: the single place that says where every Target sits in its tier. Shared by the tuner (scripts/tune2.ts),
// the rating script (scripts/rate.ts) and the spec checks (scripts/verify.ts).
import type { Family } from '../src/engine/data/playStyles';

// Each tier, EASIEST to HARDEST. `easy`/`hard` are the difficulty-score band (D: 0 = trivial, 100 = impossible) the tier occupies,
// with a gap between neighbouring tiers so they never overlap; `floor` is the lowest win rate the best plan may fall to in this tier.
export const PLAN: Record<number, { easy: number; hard: number; floor: number; order: string[] }> = {
  1: { easy: 1, hard: 11, floor: 92, order: ['slay_queen', 'lga_councillor', 'skit_king', 'owambe_dj', 'forex_flexer', 'trials_coach', 'forex_signals', 'caution_landlord', 'park_chairman', 'herbal_doctor', 'fire_pastor', 'land_guard', 'iyaloja_general'] },
  2: { easy: 15, hard: 22, floor: 90, order: ['lord_lambo', 'mavin_mogul', 'nollywood_queen', 'cryptoking', 'football_chairman', 'vc_result_pending', 'afrobeats_star', 'ngo_queen', 'pothole_commissioner', 'queen_afropop', 'bank_md', 'eze_ruler', 'afro_bad_boy'] },
  3: { easy: 26, hard: 34, floor: 82, order: ['daddy_freeze_frame', 'minister', 'igp_everything', 'rapper_activist', 'subsidy_marketer', 'presidency_spokesman', 'comedian_king', 'televangelist', 'cement_sugar_baron', 'customs_controller', 'adjournment_judge', 'cbn_deputy', 'telecom_tycoon', 'distinguished_senator'] },
  4: { easy: 38, hard: 46, floor: 70, order: ['general_maradona', 'godfather', 'second_term_governor', 'brother_in_law', 'media_owner', 'prayer_jet_bishop', 'super_agent', 'unicorn_founder', 'diaspora_investor', 'senate_president', 'offshore_chief'] },
  5: { easy: 50, hard: 62, floor: 62, order: ['dictators_son', 'central_bank_governor', 'the_cabal', 'supreme_oracle', 'the_landslide', 'mama_federation', 'everybody_godfather', 'richest_man', 'african_giant', 'chief_justice'] }
};

// Documented passives that are part of a Target's identity (and checked by `npm run verify`); the tuner never changes them,
// and tunes these Targets with a different family instead.
export const PROTECT: Record<string, Record<string, unknown>> = {
  minister: { counterHeat: 10 },
  televangelist: { doubtFlat: 25 },
  iyaloja_general: { tagDoubt: { GRASSROOTS: 8 } }
};
export const TUNE_WITH: Record<string, [Family, number][]> = { televangelist: [['SPIN', 1]], iyaloja_general: [['SPIN', 1]] };

