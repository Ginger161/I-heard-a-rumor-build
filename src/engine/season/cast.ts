import { LOOKS } from '../data/looks';
import type { SilhouetteKind } from '../data/targetTypes';
import type { CastId } from './types';

// The people of the season. Most Targets already have a face (data/looks.ts); these are the ones who are not Targets.
export interface CastInfo { name: string; sil: SilhouetteKind; id: string; color: string }

export const CAST_INFO: Record<Exclude<CastId, 'target' | 'you'>, CastInfo> = {
  biko: { name: 'Biko', sil: 'hoodie', id: 'cast_biko', color: '#2DD4BF' },
  halo: { name: 'Halo', sil: 'suit', id: 'story_mentor', color: '#F59E0B' },
  ngozi: { name: 'Madam Ngozi', sil: 'suit', id: 'story_fixer', color: '#A78BFA' },
  fola: { name: 'Fola', sil: 'glasses', id: 'cast_fola', color: '#38BDF8' },
  coker: { name: 'Inspector Coker', sil: 'uniform', id: 'cast_coker', color: '#F87171' },
  zainab: { name: 'Zainab', sil: 'glasses', id: 'cast_zainab', color: '#34D399' },
  gistlord: { name: 'Gistlord', sil: 'mic', id: 'story_rival', color: '#FB7185' },
  mbakwe: { name: 'Chief Mbakwe', sil: 'agbada', id: 'story_client', color: '#FBBF24' }
};

// Faces for the cast who are not Targets: Biko (19), Fola (23), Inspector Coker (41), Zainab Lawal (34).
Object.assign(LOOKS, {
  cast_biko: { g: 'M', age: 'Y', region: 'YORUBA', skin: 3, head: 'fade', outfit: 'hoodie', beard: 'none', glasses: false, extras: [] },
  cast_fola: { g: 'F', age: 'Y', region: 'YORUBA', skin: 2, head: 'puff', outfit: 'tee', glasses: true, extras: ['earrings'] },
  cast_coker: { g: 'M', age: 'M', region: 'YORUBA', skin: 4, head: 'short', outfit: 'uniform', beard: 'stubble', glasses: false, extras: [] },
  cast_zainab: { g: 'F', age: 'M', region: 'HAUSA', skin: 2, head: 'hijab', outfit: 'dress', glasses: true, extras: [] }
});
