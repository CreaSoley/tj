const CACHE_NAME = 'taijitsu-cache-v1';

const urlsToCache = [
  'home.html',
  'index.html',
  'offline.html',
  'loading.html',
  'style.css',
  'banner.css',
  'sw.js',
  'manifest.json',
  'assets/logopwa.png',
  'load.png',
  'logopwa2.png',
  'offline.png',
  'icon-192.png',
  'icon-512.png',
  'uv1.html',
  'uv2.html',
  'uv3.html',
  'uv4.html',
  'uv5.html',
  'uv6.html',
  'kihon_simples.json',
  'kihon_enchainements_simples.json',
  'bbp.mp3',
  'beep.mp3',
  'bip.mp3',
  'ding.mp3',
  'notif.mp3',
  'silence.mp3',
  'top.mp3',
  'Spicy Sale.ttf',
  'SuperMeatball.ttf',
  'shanghai.ttf',
  'fredoka.ttf',
  'kata2.gif',
  'atemi5.gif',
  'cle5.gif',
  'projection5.gif'
];

// INSTALLATION DU SERVICE WORKER
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map(async (url) => {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn(`⚠️ Impossible de mettre en cache : ${url}`, err);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATION DU SERVICE WORKER
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// INTERCEPTION DES REQUÊTES
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(() => caches.match('offline.html'));
    })
  );
});
