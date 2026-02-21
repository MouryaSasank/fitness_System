// ─────────────────────────────────────────────
// sw.js — Service Worker v3 (Full Offline PWA)
// ─────────────────────────────────────────────

const CACHE_NAME = 'solo-fitness-v3';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './data.js',
    './app.js',
    './sounds.js',
    './mobile-features.js',
    './profile.js',
    './share.js',
    './manifest.json',
    './icon.jpg',
    './icon (1).jpg'
];

// ── Install: pre-cache all assets ─────────────
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

// ── Activate: clean old caches ────────────────
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            )
        ).then(() => clients.claim())
    );
});

// ── Fetch: Stale-While-Revalidate strategy ─────
self.addEventListener('fetch', (e) => {
    // Skip non-GET and non-http(s) requests
    if (e.request.method !== 'GET') return;
    if (!e.request.url.startsWith('http')) return;

    e.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cached = await cache.match(e.request);

            const networkFetch = fetch(e.request).then(response => {
                // Cache fresh response (only valid responses)
                if (response && response.status === 200 && response.type !== 'opaque') {
                    cache.put(e.request, response.clone());
                }
                return response;
            }).catch(() => null);

            // Return cached instantly, update in background
            return cached || networkFetch;
        })
    );
});

// ── Background Sync: notify clients of updates ─
self.addEventListener('message', (e) => {
    if (e.data === 'skipWaiting') {
        self.skipWaiting();
    }
});