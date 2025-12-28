const CACHE_NAME = 'tai-jitsu-pwa-v1';
const OFFLINE_URL = 'offline.html';
const HOME_URL = 'home.html';

// Les fichiers à mettre en cache à l'installation
const FILES_TO_CACHE = [
  HOME_URL,
  OFFLINE_URL,
  'index.html',
  'uv1.html',
  'uv2.html',
  'uv3.html',
  'uv4.html',
  'uv5.html',
  'uv6.html',
  'banner.css',
  'Spicy Sale.ttf',
  'SuperMeatball.ttf',
  'shanghai.ttf',
  'logopwa.png',
  'offline.png',
  'encart1.js',
  'encart2.js',
  'encart56.js',
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
