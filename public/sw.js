// Offline support. On install the whole app is fetched and stored (the page, its hashed scripts and styles, icons, the
// legal pages), so the very first visit is enough: the game opens and plays with no data afterwards. Hashed build files
// never change, so they are served from the cache first; everything else tries the network and falls back to the last copy.
const CACHE = 'rumor-v2';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png', '/privacy.html', '/terms.html', '/target-packs/index.json', '/music/index.json'];

const precache = async () => {
  const cache = await caches.open(CACHE);
  // Read the page to learn the names of this build's hashed files.
  const page = await fetch('/', { cache: 'reload' });
  const html = await page.clone().text();
  await cache.put('/', page);
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(m => m[1]);
  // Files the main script pulls in by name (extra chunks) are picked up too.
  for (const a of assets.filter(a => a.endsWith('.js'))) {
    try {
      const js = await (await fetch(a)).text();
      js.match(/assets\/[\w.-]+\.(?:js|css)/g)?.forEach(f => assets.push('/' + f));
    } catch { /* the file is cached below if it can be fetched */ }
  }
  // One missing file must never stop the rest from being stored.
  await Promise.all([...new Set([...SHELL.slice(1), ...assets])].map(u => cache.add(new Request(u, { cache: 'reload' })).catch(() => undefined)));
};

self.addEventListener('install', event => event.waitUntil(precache().catch(() => undefined).then(() => self.skipWaiting())));
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Hashed assets: cache first.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  // Pages, packs and music lists: network first, fall back to the cache (and to the app shell for navigations,
  // including addresses with a query such as /?unlock=all).
  event.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(async () => (await caches.match(req)) || (req.mode === 'navigate' ? (await caches.match(req, { ignoreSearch: true })) || (await caches.match('/')) : undefined) || Response.error())
  );
});
