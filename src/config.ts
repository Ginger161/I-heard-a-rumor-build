// Launch switches. Change these here (or with environment variables at build time); nothing else needs to be edited.
//
// MONETIZATION_LIVE: false = Premium shows "Coming soon" with a waitlist. true = the Buy button appears (needs PAYMENT_URL).
// PAYMENT_URL:       the Paystack (or Flutterwave) payment-page link for the Premium plan.
// WAITLIST_URL:      where "Notify me" posts an email: a Netlify Form, Formspree or any endpoint that accepts a POST. Empty = stored on the device only.
// ONESIGNAL_APP_ID:  turns on real push reminders (see docs/LAUNCH.md). Empty = reminders show "coming soon".
// ANALYTICS_TOKEN:   Cloudflare Web Analytics token (cookie-free, no consent banner needed). Empty = no analytics.
// (import.meta.env does not exist when the engine tests run in Node, so fall back to an empty object.)
const env = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}) as Record<string, string | undefined>;

export const MONETIZATION_LIVE = env.VITE_MONETIZATION_LIVE === 'true';
export const PAYMENT_URL = env.VITE_PAYMENT_URL ?? '';
export const WAITLIST_URL = env.VITE_WAITLIST_URL ?? '';
export const ONESIGNAL_APP_ID = env.VITE_ONESIGNAL_APP_ID ?? '';
export const ANALYTICS_TOKEN = env.VITE_ANALYTICS_TOKEN ?? '';

export const PREMIUM_NAME = 'Gist Pass';
export const PREMIUM_PRICE_TEXT = env.VITE_PREMIUM_PRICE ?? '';   // e.g. "₦2,500 once". Empty while it is coming soon.
export const SUPPORT_EMAIL = env.VITE_SUPPORT_EMAIL ?? '';
