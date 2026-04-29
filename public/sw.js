const CACHE_NAME = 'takuya-merge-v1';

// Static assets to pre-cache on install
const PRE_CACHE = [
  '/',
  '/manifest.json',
  '/fruits/01_cherry.png',
  '/fruits/02_strawberry.png',
  '/fruits/03_grape.png',
  '/fruits/04_dekopon.png',
  '/fruits/05_persimmon.png',
  '/fruits/06_apple.png',
  '/fruits/07_pear.png',
  '/fruits/08_peach.png',
  '/fruits/09_pineapple.png',
  '/fruits/10_melon.png',
  '/fruits/11_watermelon.png',
  '/sounds/koukaon.mp3',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRE_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // Hashed JS/CSS assets → cache-first (内容が変わる時はファイル名も変わるので安全)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // 画像・音声など public assets → cache-first
  if (
    url.pathname.startsWith('/fruits/') ||
    url.pathname.startsWith('/sounds/') ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // HTML → network-first (更新を拾いつつ、オフライン時はキャッシュで動作)
  event.respondWith(networkFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request) || await caches.match('/');
    return cached || new Response('Offline', { status: 503 });
  }
}
