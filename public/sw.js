const CACHE_NAME = 'meal-planner-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install: cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

// Fetch: cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // For API calls: network first, fallback to nothing
  if (event.request.url.includes('api.deepseek.com')) {
    return // Don't cache API calls
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      return cached || fetchPromise
    }),
  )
})
