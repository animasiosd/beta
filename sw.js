const CACHE_NAME = 'cerita-bahasa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/halaman-bahasa.html',
  '/css/style.css',
  '/js/auth.js',
  '/js/main.js',
  '/js/video.js',
  '/js/comments.js',
  '/js/analytics.js',
  '/assets/favicon-192.png',
  '/assets/favicon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
