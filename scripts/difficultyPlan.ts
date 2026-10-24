// The difficulty plan: the single place that says where every Target sits in its tier. Shared by the tuner (scripts/tune2.ts),
// the rating script (scripts/rate.ts) and the spec checks (scripts/verify.ts).
import type { Family } from '../src/engine/data/playStyles';

// Each tier, EASIEST to HARDEST. `easy`/`hard` are the difficulty-score band (D: 0 = trivial, 100 = impossible) the tier occupies,
// with a gap between neighbouring tiers so they never overlap; `floor` is the lowest win rate the best plan may fall to in this tier.
export const PLAN: Record<number, { easy: number; hard: number; floor: number; order: string[] }> = {
  1: { easy: 1, hard: 11, floor: 92, order: ['skit_king', 'owambe_dj', 'slay_queen', 'caution_landlord', 'trials_coach', 'lga_councillor', 'forex_flexer', 'park_chairman', 'forex_signals', 'herbal_doctor', 'land_guard', 'iyaloja_general', 'fire_pastor'] },
  2: { easy: 15, hard: 22, floor: 90, order: ['lord_lambo', 'mavin_mogul', 'afrobeats_star', 'nollywood_queen', 'cryptoking', 'ngo_queen', 'football_chairman', 'bank_md', 'eze_ruler', 'vc_result_pending', 'afro_bad_boy', 'queen_afropop', 'pothole_commissioner'] },
  3: { easy: 26, hard: 34, floor: 82, order: ['daddy_freeze_frame', 'minister', 'televangelist', 'rapper_activist', 'presidency_spokesman', 'comedian_king', 'cement_sugar_baron', 'distinguished_senator', 'igp_everything', 'subsidy_marketer', 'adjournment_judge', 'telecom_tycoon', 'customs_controller', 'cbn_deputy'] },
  4: { easy: 38, hard: 46, floor: 70, order: ['media_owner', 'unicorn_founder', 'super_agent', 'prayer_jet_bishop', 'general_maradona', 'second_term_governor', 'offshore_chief', 'senate_president', 'brother_in_law', 'godfather', 'diaspora_investor'] },
  5: { easy: 50, hard: 62, floor: 62, order: ['dictators_son', 'supreme_oracle', 'central_bank_governor', 'richest_man', 'the_cabal', 'african_giant', 'chief_justice', 'everybody_godfather', 'the_landslide', 'mama_federation'] }
};

// Documented passives that are part of a Target's identity (and checked by `npm run verify`); the tuner never changes them,
// and tunes these Targets with a different family instead.
export const PROTECT: Record<string, Record<string, unknown>> = {
  minister: { counterHeat: 10 },
  televangelist: { doubtFlat: 25 },
  iyaloja_general: { tagDoubt: { GRASSROOTS: 8 } }
};
export const TUNE_WITH: Record<string, [Family, number][]> = { televangelist: [['SPIN', 1]], iyaloja_general: [['SPIN', 1]] };

