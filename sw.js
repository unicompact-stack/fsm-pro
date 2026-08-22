/**
 * sw.js — Service Worker для FSM PRO.
 * Стратегия: cache-first для статики, network-fallback для остального.
 * Позволяет приложению открываться мгновенно без сети (offline-first).
 * Адаптирован для работы из подпапки (GitHub Pages) через self.registration.scope.
 */

const CACHE_NAME = 'fsm-pro-cache-v1';
const SCOPE = self.registration.scope; // e.g. https://user.github.io/repo/

const STATIC_ASSETS = [
  SCOPE,
  new URL('index.html', SCOPE).href,
  new URL('manifest.json', SCOPE).href,
  new URL('favicon.svg', SCOPE).href,
  new URL('icons/icon-192.png', SCOPE).href,
  new URL('icons/icon-512.png', SCOPE).href,
];

// Устанавливаем и кэшируем базовые ассеты
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Активация: чистим старые кэши
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

// Стратегия: cache-first для GET-запросов, fallback на сеть + кэширование
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Офлайн и нет в кэше — отдаём индекс для навигационных запросов
          if (request.mode === 'navigate') {
            return caches.match(SCOPE);
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
    })
  );
});