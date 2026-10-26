import type { SilhouetteKind } from './targetTypes';

// ---------------------------------------------------------------------------
// LOOKS: who each Target is, so the portrait can match their gender, age, region and trade.
//
// A Look is a short description, not a picture. The portrait (ui/components/Face.tsx) turns it into a cartoon bust that can
// show emotions. Every Target in the game has an entry below; Targets without one (for example ones made in the Studio)
// get a Look derived from their silhouette. To use commissioned art instead, set `avatar.imageUrl` on the Target, or drop
// files at public/avatars/<targetId>/<emotion>.png (see Avatar in ui/components/Silhouette.tsx).
// ---------------------------------------------------------------------------
export type Gender = 'M' | 'F';
export type AgeBand = 'Y' | 'M' | 'O';                      // young adult, middle-aged, elderly
export type Region = 'IGBO' | 'YORUBA' | 'HAUSA' | 'SS' | 'MB'; // South-South (Niger Delta), Middle Belt
export type HeadStyle =
  | 'none' | 'fila' | 'okpu' | 'kufi' | 'turban' | 'hijab' | 'gele' | 'headtie' | 'cap' | 'peaked' | 'crown' | 'hood'
  | 'short' | 'fade' | 'afro' | 'locs' | 'balding' | 'braids' | 'weave' | 'puff' | 'bun' | 'wig';
export type Outfit =
  | 'suit' | 'agbada' | 'babariga' | 'senator' | 'buba' | 'isiagu' | 'clergy' | 'hoodie' | 'uniform' | 'judge' | 'dress' | 'tee';
export type Beard = 'none' | 'stubble' | 'full' | 'goatee' | 'moustache';
export type Extra = 'beads' | 'chain' | 'earrings' | 'mic' | 'sunglasses' | 'whistle';

export interface Look {
  g: Gender;
  age: AgeBand;
  region: Region;
  skin: number;            // 0 (lightest) to 5 (deepest)
  head: HeadStyle;
  outfit: Outfit;
  beard: Beard;
  glasses: boolean;
  extras: Extra[];
}

export const SKIN_TONES = ['#E6B58C', '#C98F63', '#A86C45', '#87502F', '#663A22', '#4A2916'];

type Part = Partial<Look>;
const L = (g: Gender, age: AgeBand, region: Region, skin: number, p: Part = {}): Part => ({ g, age, region, skin, ...p });

// head/outfit/beard are optional: when left out they come from the Target's silhouette and region (see lookFor).
export const LOOKS: Record<string, Part> = {
  // ----- Story Mode cast
  story_ex_boyfriend: L('M', 'Y', 'YORUBA', 3, { head: 'fade', outfit: 'hoodie', beard: 'stubble' }),
  story_ex_girlfriend: L('F', 'Y', 'IGBO', 2, { head: 'puff', outfit: 'buba', extras: ['earrings'] }),
  story_cheating_girlfriend: L('F', 'Y', 'YORUBA', 4, { head: 'weave', outfit: 'dress', extras: ['earrings'] }),
  story_cheating_boyfriend: L('M', 'Y', 'IGBO', 3, { head: 'short', outfit: 'suit', beard: 'moustache' }),
  story_former_bestie: L('F', 'Y', 'SS', 3, { head: 'braids', outfit: 'buba', glasses: true }),
  story_rival: L('M', 'Y', 'YORUBA', 2, { head: 'fade', outfit: 'hoodie', beard: 'goatee', extras: ['mic'] }),
  story_colleague: L('M', 'M', 'IGBO', 3, { head: 'short', outfit: 'suit', beard: 'none' }),
  story_boss: L('M', 'O', 'YORUBA', 5, { head: 'fila', outfit: 'agbada', beard: 'moustache' }),
  story_business_partner: L('M', 'Y', 'IGBO', 2, { head: 'short', outfit: 'suit', extras: ['mic'] }),
  story_in_law: L('F', 'O', 'IGBO', 3, { head: 'gele', outfit: 'buba', extras: ['beads'] }),
  story_ex_husband: L('M', 'M', 'YORUBA', 4, { head: 'balding', outfit: 'suit', glasses: true, beard: 'goatee' }),
  story_ex_wife: L('F', 'M', 'YORUBA', 3, { head: 'gele', outfit: 'dress', extras: ['earrings'] }),
  story_uncle: L('M', 'O', 'IGBO', 4, { head: 'okpu', outfit: 'isiagu', beard: 'full', extras: ['beads'] }),
  story_fixer: L('F', 'M', 'IGBO', 4, { head: 'wig', outfit: 'suit', glasses: true }),
  story_client: L('M', 'O', 'IGBO', 5, { head: 'okpu', outfit: 'isiagu', beard: 'full', extras: ['beads'] }),
  story_handler: L('M', 'M', 'YORUBA', 3, { head: 'short', outfit: 'suit', glasses: false, beard: 'stubble', extras: ['chain'] }),
  story_scapegoat: L('M', 'M', 'YORUBA', 5, { head: 'cap', outfit: 'tee', beard: 'moustache' }),
  story_supervisor: L('F', 'M', 'IGBO', 3, { head: 'bun', outfit: 'suit', glasses: true, extras: ['whistle'] }),
  story_security_head: L('M', 'M', 'IGBO', 6, { head: 'peaked', outfit: 'uniform', beard: 'moustache', extras: ['whistle'] }),
  story_chief_of_staff: L('M', 'M', 'IGBO', 4, { head: 'short', outfit: 'suit', glasses: true, beard: 'stubble' }),
  story_ops_head: L('M', 'Y', 'YORUBA', 3, { head: 'fade', outfit: 'hoodie', glasses: true, beard: 'none' }),
  story_mentor: L('M', 'O', 'YORUBA', 4, { head: 'balding', outfit: 'senator', glasses: true, beard: 'goatee' }),

  // ----- Campaign oppositions (campaigns.ts)
  camp_handwash: L('M', 'O', 'YORUBA', 4, { head: 'fila', outfit: 'agbada', beard: 'moustache' }),
  camp_nets: L('M', 'M', 'IGBO', 3, { head: 'short', outfit: 'tee', beard: 'stubble' }),
  camp_immunise: L('F', 'M', 'YORUBA', 3, { head: 'weave', outfit: 'dress', extras: ['earrings'], glasses: true }),
  camp_gutters: L('M', 'M', 'HAUSA', 4, { head: 'kufi', outfit: 'babariga', beard: 'full' }),
  camp_girls: L('M', 'O', 'HAUSA', 5, { head: 'turban', outfit: 'babariga', beard: 'full' }),
  camp_road: L('M', 'M', 'YORUBA', 4, { head: 'cap', outfit: 'tee', beard: 'moustache', extras: ['whistle'] }),
  camp_pvc: L('M', 'M', 'IGBO', 3, { head: 'balding', outfit: 'suit', glasses: true }),
  camp_issues: L('M', 'M', 'YORUBA', 4, { head: 'cap', outfit: 'senator', beard: 'goatee', extras: ['chain'] }),
  camp_peace: L('M', 'O', 'SS', 4, { head: 'short', outfit: 'agbada', beard: 'stubble' }),
  camp_zobo: L('F', 'M', 'YORUBA', 4, { head: 'gele', outfit: 'buba', extras: ['beads'] }),
  camp_agbero: L('M', 'Y', 'YORUBA', 3, { head: 'fade', outfit: 'hoodie', glasses: true }),
  camp_jollof: L('F', 'M', 'IGBO', 3, { head: 'gele', outfit: 'dress', extras: ['earrings', 'beads'] }),
  camp_garri: L('F', 'O', 'IGBO', 4, { head: 'gele', outfit: 'buba', extras: ['beads'] }),
  camp_datalink: L('M', 'Y', 'SS', 3, { head: 'hood', outfit: 'hoodie', glasses: false }),
  camp_tower: L('M', 'M', 'MB', 3, { head: 'balding', outfit: 'suit', glasses: true, beard: 'goatee' }),

  // ----- Tier 1
  iyaloja_general: L('F', 'O', 'YORUBA', 4, { head: 'gele', outfit: 'buba', extras: ['beads', 'earrings'] }),
  park_chairman: L('M', 'M', 'HAUSA', 4, { head: 'kufi', outfit: 'babariga', beard: 'full' }),
  fire_pastor: L('M', 'M', 'YORUBA', 5, { head: 'short', outfit: 'clergy', beard: 'moustache' }),
  caution_landlord: L('M', 'M', 'IGBO', 3, { head: 'balding', outfit: 'senator', glasses: true }),
  lga_councillor: L('M', 'M', 'IGBO', 4, { head: 'okpu', outfit: 'senator' }),
  owambe_dj: L('M', 'Y', 'YORUBA', 3, { head: 'cap', outfit: 'tee', extras: ['chain'] }),
  trials_coach: L('M', 'M', 'YORUBA', 4, { head: 'cap', outfit: 'hoodie', extras: ['whistle'] }),
  herbal_doctor: L('M', 'O', 'IGBO', 4, { head: 'balding', outfit: 'senator', glasses: true, beard: 'goatee' }),
  forex_flexer: L('M', 'Y', 'YORUBA', 3, { head: 'fade', outfit: 'tee', extras: ['chain', 'sunglasses'] }),
  land_guard: L('M', 'M', 'YORUBA', 5, { head: 'cap', outfit: 'tee', beard: 'stubble' }),
  slay_queen: L('F', 'Y', 'IGBO', 2, { head: 'weave', outfit: 'dress', extras: ['earrings'] }),
  forex_signals: L('M', 'Y', 'IGBO', 3, { head: 'fade', outfit: 'hoodie' }),
  skit_king: L('M', 'Y', 'YORUBA', 4, { head: 'afro', outfit: 'hoodie' }),

  // ----- Tier 2
  cryptoking: L('M', 'Y', 'YORUBA', 3, { head: 'fade', outfit: 'hoodie', beard: 'stubble' }),
  pothole_commissioner: L('M', 'M', 'YORUBA', 4, { head: 'short', outfit: 'suit', glasses: true }),
  nollywood_queen: L('F', 'M', 'IGBO', 2, { head: 'gele', outfit: 'dress', extras: ['earrings', 'beads'] }),
  afrobeats_star: L('M', 'Y', 'YORUBA', 4, { head: 'locs', outfit: 'tee', extras: ['chain'] }),
  vc_result_pending: L('M', 'O', 'IGBO', 3, { head: 'balding', outfit: 'suit', glasses: true }),
  bank_md: L('M', 'M', 'IGBO', 3, { head: 'short', outfit: 'suit' }),
  football_chairman: L('M', 'M', 'HAUSA', 4, { head: 'kufi', outfit: 'senator', beard: 'full' }),
  eze_ruler: L('M', 'O', 'IGBO', 5, { head: 'okpu', outfit: 'isiagu', beard: 'full', extras: ['beads'] }),
  afro_bad_boy: L('M', 'Y', 'YORUBA', 5, { head: 'locs', outfit: 'tee', beard: 'stubble', extras: ['chain'] }),
  ngo_queen: L('F', 'M', 'YORUBA', 4, { head: 'gele', outfit: 'buba', extras: ['earrings'] }),
  mavin_mogul: L('M', 'M', 'YORUBA', 4, { head: 'fade', outfit: 'suit', glasses: true, beard: 'goatee' }),
  queen_afropop: L('F', 'Y', 'YORUBA', 3, { head: 'weave', outfit: 'dress', extras: ['earrings'] }),

  // ----- Tier 3
  minister: L('M', 'M', 'HAUSA', 4, { head: 'kufi', outfit: 'senator', beard: 'full' }),
  distinguished_senator: L('M', 'O', 'HAUSA', 5, { head: 'kufi', outfit: 'agbada', beard: 'full' }),
  subsidy_marketer: L('M', 'O', 'HAUSA', 4, { head: 'turban', outfit: 'babariga', beard: 'full' }),
  telecom_tycoon: L('M', 'M', 'IGBO', 3, { head: 'short', outfit: 'suit', glasses: true }),
  cbn_deputy: L('F', 'M', 'YORUBA', 3, { head: 'wig', outfit: 'suit', glasses: true }),
  adjournment_judge: L('M', 'O', 'HAUSA', 4, { head: 'kufi', outfit: 'judge', beard: 'full' }),
  customs_controller: L('M', 'O', 'HAUSA', 5, { head: 'peaked', outfit: 'uniform', beard: 'moustache' }),
  presidency_spokesman: L('M', 'M', 'YORUBA', 3, { head: 'short', outfit: 'suit', glasses: true }),
  igp_everything: L('M', 'O', 'HAUSA', 4, { head: 'peaked', outfit: 'uniform', beard: 'moustache' }),
  cement_sugar_baron: L('M', 'O', 'HAUSA', 4, { head: 'kufi', outfit: 'babariga', beard: 'full' }),
  televangelist: L('M', 'M', 'IGBO', 4, { head: 'short', outfit: 'clergy', beard: 'goatee' }),
  rapper_activist: L('M', 'Y', 'YORUBA', 4, { head: 'cap', outfit: 'hoodie', beard: 'stubble' }),
  comedian_king: L('M', 'M', 'IGBO', 3, { head: 'balding', outfit: 'suit', extras: ['mic'] }),

  // ----- Tier 4
  general_maradona: L('M', 'O', 'HAUSA', 5, { head: 'peaked', outfit: 'uniform', beard: 'moustache' }),
  offshore_chief: L('M', 'O', 'SS', 5, { head: 'cap', outfit: 'agbada', beard: 'full' }),
  unicorn_founder: L('M', 'Y', 'YORUBA', 2, { head: 'short', outfit: 'hoodie', glasses: true }),
  prayer_jet_bishop: L('M', 'O', 'IGBO', 4, { head: 'balding', outfit: 'clergy', beard: 'goatee' }),
  senate_president: L('M', 'O', 'IGBO', 3, { head: 'okpu', outfit: 'agbada', beard: 'moustache' }),
  super_agent: L('M', 'M', 'YORUBA', 4, { head: 'fade', outfit: 'suit', beard: 'stubble' }),
  media_owner: L('M', 'O', 'YORUBA', 5, { head: 'fila', outfit: 'agbada', glasses: true }),
  second_term_governor: L('M', 'O', 'SS', 4, { head: 'cap', outfit: 'agbada' }),
  brother_in_law: L('M', 'M', 'IGBO', 3, { head: 'short', outfit: 'suit', beard: 'moustache' }),
  diaspora_investor: L('M', 'M', 'YORUBA', 2, { head: 'short', outfit: 'suit', glasses: true, beard: 'goatee' }),
  godfather: L('M', 'O', 'YORUBA', 5, { head: 'fila', outfit: 'agbada', beard: 'moustache', extras: ['beads'] }),

  // ----- Tier 5
  the_landslide: L('M', 'O', 'HAUSA', 4, { head: 'kufi', outfit: 'agbada' }),
  the_cabal: L('M', 'O', 'HAUSA', 5, { head: 'turban', outfit: 'babariga', beard: 'full' }),
  everybody_godfather: L('M', 'O', 'YORUBA', 4, { head: 'fila', outfit: 'agbada', beard: 'moustache', extras: ['beads'] }),
  mama_federation: L('F', 'O', 'HAUSA', 4, { head: 'hijab', outfit: 'dress', extras: ['earrings'] }),
  african_giant: L('M', 'Y', 'YORUBA', 3, { head: 'locs', outfit: 'tee', extras: ['chain', 'sunglasses'] }),
  richest_man: L('M', 'O', 'HAUSA', 4, { head: 'kufi', outfit: 'babariga', beard: 'full' }),
  supreme_oracle: L('M', 'O', 'MB', 5, { head: 'turban', outfit: 'clergy', beard: 'full' }),
  dictators_son: L('M', 'M', 'HAUSA', 3, { head: 'none', outfit: 'senator', extras: ['sunglasses'] }),
  central_bank_governor: L('M', 'O', 'IGBO', 3, { head: 'balding', outfit: 'suit', glasses: true }),
  chief_justice: L('M', 'O', 'SS', 4, { head: 'none', outfit: 'judge', glasses: true }),

  // ----- Creator spotlight
  lord_lambo: L('M', 'M', 'YORUBA', 3, { head: 'fade', outfit: 'tee', glasses: true, extras: ['chain'] }),
  daddy_freeze_frame: L('M', 'M', 'YORUBA', 3, { head: 'short', outfit: 'suit', extras: ['mic'], beard: 'goatee' })
};

// Defaults for a Target that has no entry, from its silhouette (the older, coarser description).
const FROM_SILHOUETTE: Record<SilhouetteKind, { head: HeadStyle; outfit: Outfit }> = {
  agbada: { head: 'fila', outfit: 'agbada' },
  suit: { head: 'short', outfit: 'suit' },
  cap: { head: 'cap', outfit: 'tee' },
  gele: { head: 'gele', outfit: 'buba' },
  robe: { head: 'short', outfit: 'clergy' },
  hoodie: { head: 'fade', outfit: 'hoodie' },
  uniform: { head: 'peaked', outfit: 'uniform' },
  crown: { head: 'crown', outfit: 'agbada' },
  mic: { head: 'fade', outfit: 'tee' },
  glasses: { head: 'short', outfit: 'suit' }
};

export const hashOf = (s: string): number => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const REGIONS: Region[] = ['YORUBA', 'IGBO', 'HAUSA', 'SS'];

// The Look for a Target: its table entry when there is one, otherwise a stable guess from its silhouette.
export const lookFor = (id: string, silhouette: SilhouetteKind): Look => {
  const part = LOOKS[id] ?? {};
  const h = hashOf(id);
  const sil = FROM_SILHOUETTE[silhouette];
  const g: Gender = part.g ?? (silhouette === 'gele' ? 'F' : 'M');
  const age: AgeBand = part.age ?? (silhouette === 'hoodie' || silhouette === 'mic' ? 'Y' : (['M', 'O'] as const)[h % 2]);
  const region: Region = part.region ?? REGIONS[h % REGIONS.length];
  return {
    g, age, region,
    skin: part.skin ?? 2 + (h % 3),
    head: part.head ?? (g === 'F' && !['gele', 'hijab', 'headtie'].includes(sil.head) ? 'braids' : sil.head),
    outfit: part.outfit ?? sil.outfit,
    beard: part.beard ?? 'none',
    glasses: part.glasses ?? silhouette === 'glasses',
    extras: part.extras ?? (silhouette === 'mic' ? ['mic'] : silhouette === 'crown' ? ['beads'] : [])
  };
};
