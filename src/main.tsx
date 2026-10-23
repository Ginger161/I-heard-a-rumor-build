import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './ErrorBoundary';
import { loadAllPacks } from './engine/data/targetPacks';
import './engine/data/story'; // registers the Story Mode cast
import { ANALYTICS_TOKEN } from './config';
import './index.css';

const render = () => ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Published packs and this browser's Studio drafts are registered before the first screen, so a saved game that
// belongs to a pack Target still loads. A slow or missing network never blocks the game for more than a moment.
Promise.race([loadAllPacks().catch(() => []), new Promise(resolve => setTimeout(resolve, 2500))]).finally(render);

// Offline play: after the first visit the game opens with no data. Not registered in development, where it would hide changes.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* offline support is optional */ }); });
}

// Cookie-free visit counts (Cloudflare Web Analytics), only if a token is configured. No personal data, no consent banner.
if (import.meta.env.PROD && ANALYTICS_TOKEN) {
  const s = document.createElement('script');
  s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: ANALYTICS_TOKEN }));
  document.head.appendChild(s);
}
