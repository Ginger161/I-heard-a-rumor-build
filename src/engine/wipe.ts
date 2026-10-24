import { LICENSE_KEY } from './premium';

// START OVER FROM SCRATCH. Deletes everything this game has saved on the device and restarts it as a brand-new install:
// stars, envelopes, perks, the archive, story progress and the clue board, Arena Targets and results, scores, the saved match,
// tips and reveals already seen, and the tutorial. Two things are deliberately kept:
//   - a Gist Pass licence (it was paid for; starting a story again must not cost the player their purchase), and
//   - the founder's-mark discovery flag (so the one-time reward cannot be farmed by wiping and finding it again).
// Settings (sound, text size, layout) are kept unless the player asks for those to go too.
const SETTINGS_KEY = 'rumor_settings_v1';   // same key as ui/settings.ts
const PREFIX = 'rumor_';

let wiping = false;
/** While a wipe is under way nothing may write progress back (a page about to reload still fires its "save" handlers). */
export const isWiping = (): boolean => wiping;

const clearPrefixed = (store: Storage, keep: string[]) => {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) { const k = store.key(i); if (k && k.startsWith(PREFIX) && !keep.includes(k)) keys.push(k); }
  keys.forEach(k => store.removeItem(k));
};

/** Wipes the data. Does not reload (see startOver); exported so it can be tested. */
export const wipeData = (keepSettings: boolean) => {
  try {
    let old: Record<string, unknown> = {};
    try { old = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') as Record<string, unknown>; } catch { old = {}; }
    const muted = localStorage.getItem('rumor_sfx_muted');
    clearPrefixed(localStorage, [LICENSE_KEY]);
    clearPrefixed(sessionStorage, []);
    // What survives in the settings: the founder's mark always, the rest only if the player keeps their settings.
    const kept: Record<string, unknown> = keepSettings
      ? { ...old, tutorialDone: false, seenHints: [], playerName: '', crew: '' }
      : { eggFound: !!old.eggFound };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(kept));
    if (keepSettings && muted !== null) localStorage.setItem('rumor_sfx_muted', muted);
  } catch { /* storage unavailable: nothing to wipe */ }
};

export const startOver = (keepSettings: boolean) => {
  wiping = true;
  wipeData(keepSettings);
  try { window.location.replace(window.location.pathname); } catch { window.location.reload(); }
};
