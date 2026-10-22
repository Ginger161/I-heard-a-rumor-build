import { NIGERIA_STATES } from './nigeriaData';

export type ZoneId = 'SW' | 'SE' | 'SS' | 'NC' | 'NE' | 'NW';

export const ZONE_NAMES: Record<ZoneId, string> = {
  SW: 'South-West',
  SE: 'South-East',
  SS: 'South-South',
  NC: 'North-Central',
  NE: 'North-East',
  NW: 'North-West'
};

export const ZONE_IDS: ZoneId[] = ['SW', 'SE', 'SS', 'NC', 'NE', 'NW'];

export const ZONE_STATE_IDS: Record<ZoneId, string[]> = ZONE_IDS.reduce((acc, zone) => {
  acc[zone] = Object.values(NIGERIA_STATES).filter(s => s.region === zone).map(s => s.id);
  return acc;
}, {} as Record<ZoneId, string[]>);

// Power hubs that fire the STREET_WHISPER "Power Hub Breach" alert.
export const POWER_HUBS = ['lagos', 'fct', 'kano', 'rivers'];

// Domestic airport hubs (spec §6 Stage 3). Matches hasAirport in nigeriaData.ts.
export const AIRPORT_HUBS = ['lagos', 'fct', 'kano', 'rivers', 'enugu'];
