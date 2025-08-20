// === [1] Deteksi Base Path Otomatis ===
const BASE_PATH = self.location.pathname.includes('/beta/')
  ? '/beta/'
  : '/cerita-bahasa-daerah/';

// === [2] Versi Cache ===
const CACHE_NAME = `cerita-bahasa-cache-v${BASE_PATH === '/beta/' ? 'beta' : 'main'}-v1`;

// === [3] Daftar File untuk di-cache ===
const urlsToCache = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}halaman-bahasa.html`,
  `${BASE_PATH}css/style.css`,
  `${BASE_PATH}js/auth.js`,
  `${BASE_PATH}js/main.js`,
  `${BASE_PATH}js/video.js`,
  `${BASE_PATH}js/comments.js`,
  `${BASE_PATH}js/analytics.js`,
  `${BASE_PATH}assets/favicon-192.png`,
  `${BASE_PATH}assets/favicon-512.png`
];

// === [4] Instalasi Service Worker ===
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.warn('Beberapa file gagal dicache:', err);
      })
  );
  self.skipWaiting();
});

// === [5] Aktivasi Service Worker & Hapus Cache Lama ===
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('cerita-bahasa-cache') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// === [6] Fetch Request ===
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Jika file ada di cache → gunakan cache
      if (response) return response;

      // Jika tidak ada di cache → ambil dari network
      return fetch(event.request)
        .then(networkResponse => {
          // Simpan file baru ke cache jika berhasil diambil
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback → jika gagal ambil file dan offline
          if (event.request.mode === 'navigate') {
            return caches.match(`${BASE_PATH}index.html`);
          }
        });
    })
  );
});
