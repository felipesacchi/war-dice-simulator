const CACHE_NAME = 'war-dice-v6';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './dice-engine.js',
  './dice-sound.mp3',
  'https://via.placeholder.com/192x192/e74c3c/ffffff?text=DICE',
  'https://via.placeholder.com/512x512/e74c3c/ffffff?text=DICE'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});