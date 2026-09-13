/**
 * BlueLine DataWorks: Rinkside Offline Service Worker
 * Enables full offline-first usage inside cold arenas and metal basements without cellular connectivity.
 */

const CACHE_NAME = 'blueline-rinkside-v1';

const PRECACHE_ASSETS = [
  'index.html',
  'database.html',
  'scoreboard.html',
  'rink3d.html',
  'film.html',
  'portal.html',
  'draft.html',
  'combine.html',
  'community.html',
  'agents.html',
  'player.html',
  'broadcast_ai.html',
  'manifest.json',
  'static/css/custom.css',
  'static/img/blueline_logo.jpg',
  'static/img/blueline_og_preview.jpg',
  'static/js/combine_engine.js',
  'static/js/social_mesh_engine.js',
  'static/js/draft_simulator.js',
  'static/js/portal_engine.js',
  'static/js/rink_3d_simulator.js',
  'static/js/ai_film_studio.js',
  'static/js/agent_mesh_engine.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core enterprise assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache version:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for offline navigation
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('index.html');
        }
      });
    })
  );
});
