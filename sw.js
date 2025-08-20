const CACHE_VERSION = 'v3';
const CACHE_NAME = `cerita-bahasa-cache-${CACHE_VERSION}`;

// Deteksi apakah website ini di /beta/ atau /
const BASE_PATH = self.location.pathname.includes('/beta/') ? '/beta/' : '/';

// Semua file penting yang harus di-cache untuk PWA
const urlsToCache = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'halaman-bahasa.html',
  BASE_PATH + 'navbar.html',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'css/style.css',
  BASE_PATH + 'js/auth.js',
  BASE_PATH + 'js/main.js',
  BASE_PATH + 'js/video.js',
  BASE_PATH + 'js/comments.js',
  BASE_PATH + 'js/analytics.js',
  BASE_PATH + 'js/geotracker.js',
  BASE_PATH + 'assets/favicon.png',
  BASE_PATH + 'assets/favicon-192.png',
  BASE_PATH + 'assets/favicon-512.png'
];

// URL fallback ketika offline
const OFFLINE_URL = BASE_PATH + 'index.html';

// Service Worker: INSTALL
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching files:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[SW] Cache addAll failed:', err))
  );

  // Langsung aktifkan SW terbaru
  self.skipWaiting();
});

// Service Worker: ACTIVATE
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  self.clients.claim();
});

// Service Worker: FETCH
self.addEventListener('fetch', event => {
  // Abaikan permintaan ke Firebase Auth agar tidak error
  if (event.request.url.includes('https://securetoken.googleapis.com') ||
      event.request.url.includes('https://www.googleapis.com') ||
      event.request.url.includes('https://apis.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Jika ada di cache → pakai cache
        if (cachedResponse) {
          return cachedResponse;
        }

        // Kalau tidak ada → ambil dari network dan cache hasilnya
        return fetch(event.request)
          .then(networkResponse => {
            // Jangan cache jika bukan file GET atau error
            if (!networkResponse || networkResponse.status !== 200 || event.request.method !== 'GET') {
              return networkResponse;
            }

            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            // Fallback ke offline page kalau gagal fetch
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});
