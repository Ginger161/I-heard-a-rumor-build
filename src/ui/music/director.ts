import { TRACKS, Track, Station, getTrack } from './library';

// THE MUSIC DIRECTOR. Pure functions: given what is happening in the game, which song should play and how hard should it
// hit? The audio layer calls these on every change and handles crossfades and minimum play times.
export type Screen = 'dossier' | 'story' | 'live' | 'end';
export type Style = 'auto' | Station;

export interface MusicContext {
  screen: Screen;
  started?: boolean;        // live: the first spark has been popped
  won?: boolean;            // end
  tier?: number;            // 1-5: the Target's tier
  heat?: number;            // 0-100
  coverUp?: number;         // 0-100
  believers?: number;       // national %, 0-100
  dayFrac?: number;         // 0-1 of the day budget used
  climateId?: string;
  storyAct?: 1 | 2 | 3;
  training?: boolean;
}

export interface Pick { trackId: string; reason: string }

const byIds = (ids: string[]): Track[] => ids.map(getTrack).filter((t): t is Track => !!t);

// Prefers tracks on the chosen station; if the station has nothing suitable, falls back to the whole list.
const pickFrom = (list: Track[], style: Style, salt: number): Track => {
  const filtered = style === 'auto' ? list : list.filter(t => t.stations.includes(style));
  const pool = filtered.length ? filtered : list;
  return pool[((salt % pool.length) + pool.length) % pool.length];
};

const TIER_POOLS: Record<number, string[]> = {
  1: ['afrosoul_evenings', 'third_mainland_cruise', 'private_school'],
  2: ['private_school', 'log_drum_nights', 'third_mainland_cruise'],
  3: ['owambe_highlife', 'log_drum_nights', 'third_mainland_cruise'],
  4: ['konko_street_pop', 'log_drum_nights', 'owambe_highlife'],
  5: ['ikoyi_drill', 'konko_street_pop', 'dss_on_your_tail']
};
const CLIMATE_POOLS: Record<string, string[]> = {
  RAINY_SEASON: ['mainland_lofi', 'private_school', 'afrosoul_evenings'],
  BLACKOUT_WEEK: ['mainland_lofi', 'harmattan_morning', 'afrosoul_evenings'],
  SLOW_NEWS: ['mainland_lofi', 'afrosoul_evenings', 'private_school'],
  HARMATTAN: ['owambe_highlife', 'afrosoul_evenings', 'third_mainland_cruise'],
  DETTY_DECEMBER: ['detty_december', 'yanos_party', 'third_mainland_cruise'],
  ELECTION_YEAR: ['konko_street_pop', 'owambe_highlife', 'third_mainland_cruise'],
  FUEL_SCARCITY: ['third_mainland_cruise', 'konko_street_pop', 'afrosoul_evenings']
};
const HIGH_POOL = ['yanos_party', 'detty_december', 'konko_street_pop'];
const CHILL_POOL = ['mainland_lofi', 'private_school', 'afrosoul_evenings', 'harmattan_morning'];

// `salt` varies the choice between cases (use the copy seed), so the same situation does not always play the same song.
export const chooseTrack = (c: MusicContext, style: Style = 'auto', salt = 0): Pick => {
  if (c.screen === 'end') return c.won ? { trackId: 'front_page_glory', reason: 'victory' } : { trackId: 'dead_air', reason: 'defeat' };
  if (c.screen === 'dossier') return { trackId: pickFrom(byIds(CHILL_POOL), style, salt).id, reason: 'dossier' };
  if (c.screen === 'story') {
    const act = c.storyAct ?? 1;
    const pool = act === 1 ? ['mainland_lofi', 'afrosoul_evenings'] : act === 2 ? ['private_school', 'afrosoul_evenings'] : ['afrosoul_evenings', 'harmattan_morning', 'mainland_lofi'];
    return { trackId: pickFrom(byIds(pool), style, salt + act).id, reason: `story act ${act}` };
  }

  // live
  const heat = c.heat ?? 0, cover = c.coverUp ?? 0, bel = c.believers ?? 0, tier = c.tier ?? 1, day = c.dayFrac ?? 0;
  if (!c.started) return { trackId: 'harmattan_morning', reason: 'quiet before the first spark' };
  if (c.training) return { trackId: pickFrom(byIds(['afrosoul_evenings', 'mainland_lofi']), style, salt).id, reason: 'training' };
  if (heat >= 85 || cover >= 90) return { trackId: 'safehouse_critical', reason: 'critical' };
  if (heat >= 70 || cover >= 80) {
    return { trackId: tier >= 4 && (style === 'street' || style === 'auto') ? 'ikoyi_drill' : 'dss_on_your_tail', reason: 'danger' };
  }
  if (day >= 0.8 && bel < 45) return { trackId: pickFrom(byIds(['dss_on_your_tail', 'ikoyi_drill']), style, salt).id, reason: 'running out of time' };
  if (bel >= 55) return { trackId: pickFrom(byIds(HIGH_POOL), style, salt).id, reason: 'momentum' };
  const climatePool = c.climateId ? CLIMATE_POOLS[c.climateId] : undefined;
  if (climatePool && (salt % 3 !== 0)) return { trackId: pickFrom(byIds(climatePool), style, salt).id, reason: `climate ${c.climateId}` };
  return { trackId: pickFrom(byIds(TIER_POOLS[Math.max(1, Math.min(5, tier))]), style, salt).id, reason: `tier ${tier}` };
};

// 0-1: how many layers of the current song are playing.
export const energyFor = (c: MusicContext): number => {
  if (c.screen === 'dossier' || c.screen === 'story') return 0.45;
  if (c.screen === 'end') return c.won ? 1 : 0.4;
  if (!c.started) return 0.3;
  const e = 0.22 + 0.3 * Math.min(1, (c.believers ?? 0) / 75) + 0.25 * ((c.heat ?? 0) / 100) + 0.12 * (c.dayFrac ?? 0) + 0.04 * ((c.tier ?? 1) - 1);
  return Math.max(0.15, Math.min(1, e));
};

export const STATIONS: { id: Style; name: string; blurb: string }[] = [
  { id: 'auto', name: 'Auto', blurb: 'The soundtrack follows your case.' },
  { id: 'afrobeats', name: 'Afrobeats', blurb: 'Groove, highlife and afro-soul.' },
  { id: 'amapiano', name: 'Amapiano', blurb: 'Log drums and jazzy keys.' },
  { id: 'chill', name: 'Chill', blurb: 'Lo-fi and soft keys. Low drama.' },
  { id: 'street', name: 'Street', blurb: 'Talking drums, pop and drill.' }
];

export const trackCount = TRACKS.length;
