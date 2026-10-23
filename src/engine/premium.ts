// PREMIUM ("Gist Pass"). A licence is a signed code. The game checks the signature with a public key, so licences work
// offline, can be gifted today (to testers and creators) and can be sold later: after a payment, a small server function
// signs a code with the private key and gives it to the buyer. The private key is never in the game.
//
// What Premium gives (see PREMIUM_FEATURES): every Target file unlocked, the gold front-page share card, and a supporter
// badge. More can be added here without touching the rest of the game.
export const PUBLIC_KEY: JsonWebKey = { kty: 'EC', crv: 'P-256', x: 'RwEY1gICeWhggzPXUQIDyXJxrKXaxMf3gV5tph2ayb0', y: 'vhUMAfiPrx8R2J21kHsBu7pq_gR_U6P7Ar8dVnfrAms' };

export const LICENSE_KEY = 'rumor_license_v1';

export interface LicensePayload { v: 1; id: string; plan: 'forever' | 'season' | 'monthly'; exp: number; note: string; at: number }
export interface Entitlement { active: boolean; plan: LicensePayload['plan']; id: string; expires: number | null; note: string }

export const PREMIUM_FEATURES: { icon: string; title: string; blurb: string }[] = [
  { icon: '🔓', title: 'Every file unlocked', blurb: 'All five tiers and every Target, from day one. No stars or envelopes needed to open them.' },
  { icon: '🏅', title: 'Gold front pages', blurb: 'A gold-edition share card with a Supporter stamp for your wins.' },
  { icon: '⭐', title: 'Supporter badge', blurb: 'A badge on your Dossier that shows you backed the game early.' },
  { icon: '🚀', title: 'Early access', blurb: 'New Targets and Story seasons before everyone else.' }
];

const b64urlToBytes = (s: string): Uint8Array => {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(pad);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
};

// Checks a code. Returns the entitlement, or null if the signature, format or expiry is wrong.
export const verifyLicense = async (code: string, now = Date.now()): Promise<Entitlement | null> => {
  try {
    const parts = code.trim().split('.');
    if (parts.length !== 3 || parts[0] !== 'RUMP1') return null;
    const key = await crypto.subtle.importKey('jwk', PUBLIC_KEY, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64urlToBytes(parts[2]) as BufferSource, new TextEncoder().encode(parts[1]));
    if (!ok) return null;
    const p = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1]))) as LicensePayload;
    if (p.v !== 1 || typeof p.id !== 'string' || !['forever', 'season', 'monthly'].includes(p.plan)) return null;
    if (p.exp && now > p.exp) return null;
    return { active: true, plan: p.plan, id: p.id, expires: p.exp || null, note: String(p.note ?? '').slice(0, 40) };
  } catch { return null; }
};

// ---- the live entitlement, with a subscribe so screens update the moment a code is redeemed ----
let current: Entitlement | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export const getEntitlement = (): Entitlement | null => current;
export const isPremium = (): boolean => !!current?.active;
export const subscribePremium = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const loadLicense = async (): Promise<void> => {
  try {
    const code = localStorage.getItem(LICENSE_KEY);
    current = code ? await verifyLicense(code) : null;
    // An expired or invalid stored code is dropped, never trusted.
    if (code && !current) localStorage.removeItem(LICENSE_KEY);
  } catch { current = null; }
  emit();
};

export const redeemLicense = async (code: string): Promise<'ok' | 'invalid'> => {
  const e = await verifyLicense(code);
  if (!e) return 'invalid';
  try { localStorage.setItem(LICENSE_KEY, code.trim()); } catch { /* storage unavailable: lasts for this session only */ }
  current = e;
  emit();
  return 'ok';
};

export const removeLicense = () => { try { localStorage.removeItem(LICENSE_KEY); } catch { /* ignore */ } current = null; emit(); };

// ---- the waitlist (works with no server; posts the email too when WAITLIST_URL is set) ----
export const WAITLIST_KEY = 'rumor_waitlist_v1';
export const onWaitlist = (): boolean => { try { return !!localStorage.getItem(WAITLIST_KEY); } catch { return false; } };
export const joinWaitlist = async (email: string, url: string): Promise<boolean> => {
  const e = email.trim().slice(0, 120);
  if (e && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return false;
  try { localStorage.setItem(WAITLIST_KEY, e || 'on-device'); } catch { /* storage unavailable */ }
  if (e && url) {
    try { await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'form-name': 'waitlist', email: e }).toString() }); } catch { /* offline: kept on the device */ }
  }
  return true;
};
