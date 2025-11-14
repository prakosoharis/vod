const CACHE_NAME = 'vod-app-v1'
const STATIC_CACHE_NAME = 'vod-static-v1'
const DYNAMIC_CACHE_NAME = 'vod-dynamic-v1'

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other critical assets
]

// API routes to cache
const CACHE_ROUTES = [
  '/api/content',
  '/api/content/featured',
  '/api/content/trending'
]

// Network-first routes (API calls)
const NETWORK_FIRST_ROUTES = [
  '/api/',
]

// Cache-first routes (static assets)
const CACHE_FIRST_ROUTES = [
  /\.(png|jpg|jpeg|svg|gif|webp)$/,
  /\.(woff|woff2|ttf|eot)$/,
  /\.(css|js)$/
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return
  }

  // API requests - Network First with Cache fallback
  if (NETWORK_FIRST_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(networkFirst(request))
    return
  }

  // Static assets - Cache First with Network fallback
  if (CACHE_FIRST_ROUTES.some(route => route.test(url.pathname))) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML pages - Network First
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Default: Network with Cache fallback
  event.respondWith(networkFirst(request))
})

// Network First strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page for HTML requests
    if (request.headers.get('Accept')?.includes('text/html')) {
      return caches.match('/') || new Response('Offline', { status: 503 })
    }

    throw error
  }
}

// Cache First strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    throw error
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Handle offline actions when connection is restored
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('VOD App', options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/browse')
    )
  }
})