/**
 * Advanced Service Worker for HR Reports Application
 * Implements offline capability, intelligent caching, and performance optimization
 */

const CACHE_NAME = 'hr-reports-v1';
const STATIC_CACHE_NAME = 'hr-reports-static-v1';
const DYNAMIC_CACHE_NAME = 'hr-reports-dynamic-v1';
const API_CACHE_NAME = 'hr-reports-api-v1';

// Cache configuration
const CACHE_CONFIG = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxEntries: 100,
  networkTimeout: 3000,
  staleWhileRevalidate: true
};

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html'
];

// Dynamic cache patterns
const CACHE_PATTERNS = {
  images: /\.(png|jpg|jpeg|gif|webp|svg)$/i,
  scripts: /\.(js|jsx|ts|tsx)$/i,
  styles: /\.(css|scss)$/i,
  data: /\.(json|xml)$/i,
  api: /^\/api\//
};

// Advanced caching strategies
const CACHING_STRATEGIES = {
  cacheFirst: 'cache-first',
  networkFirst: 'network-first',
  staleWhileRevalidate: 'stale-while-revalidate',
  networkOnly: 'network-only',
  cacheOnly: 'cache-only'
};

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.addAll(PRECACHE_URLS);
      }),
      
      // Create other caches
      caches.open(DYNAMIC_CACHE_NAME),
      caches.open(API_CACHE_NAME)
    ]).then(() => {
      console.log('Service Worker: Static resources cached');
      // Force activation
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients
      return self.clients.claim();
    })
  );
});

// Fetch event - implement advanced caching strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Handle different resource types
  if (CACHE_PATTERNS.api.test(url.pathname)) {
    event.respondWith(handleApiRequest(event.request));
  } else if (CACHE_PATTERNS.images.test(url.pathname)) {
    event.respondWith(handleImageRequest(event.request));
  } else if (CACHE_PATTERNS.scripts.test(url.pathname) || 
             CACHE_PATTERNS.styles.test(url.pathname)) {
    event.respondWith(handleStaticAssetRequest(event.request));
  } else if (CACHE_PATTERNS.data.test(url.pathname)) {
    event.respondWith(handleDataRequest(event.request));
  } else if (url.origin === location.origin) {
    event.respondWith(handleNavigationRequest(event.request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cacheName = API_CACHE_NAME;
  
  try {
    // Try network first with timeout
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), CACHE_CONFIG.networkTimeout)
      )
    ]);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Serving API from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'API unavailable' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cacheName = DYNAMIC_CACHE_NAME;
  
  // Check cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Implement cache size management
      await manageCacheSize(cacheName);
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder image for offline
    return new Response(
      '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">Image unavailable</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

// Handle static assets with stale-while-revalidate strategy
async function handleStaticAssetRequest(request) {
  const cacheName = STATIC_CACHE_NAME;
  
  // Get cached response
  const cachedResponse = await caches.match(request);
  
  // Start network request (don't wait for it)
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network response if no cache
  return networkResponsePromise || new Response('', { status: 503 });
}

// Handle data requests with cache-first strategy
async function handleDataRequest(request) {
  const cacheName = DYNAMIC_CACHE_NAME;
  
  // Check cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse && !isStale(cachedResponse)) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache with timestamp
      const cache = await caches.open(cacheName);
      const responseWithTimestamp = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...networkResponse.headers,
          'sw-cached-at': Date.now().toString()
        }
      });
      
      cache.put(request, responseWithTimestamp.clone());
      return responseWithTimestamp;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // Return stale cache if available
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return empty data structure
    return new Response(
      JSON.stringify({ data: [], error: 'Data unavailable offline' }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Fallback to cached page or offline page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/offline.html') || new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>Application is offline</h1><p>Please check your internet connection.</p></body></html>',
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Cache size management
async function manageCacheSize(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > CACHE_CONFIG.maxEntries) {
    // Remove oldest entries
    const entriesToDelete = keys.slice(0, keys.length - CACHE_CONFIG.maxEntries);
    await Promise.all(entriesToDelete.map(key => cache.delete(key)));
  }
}

// Check if cached response is stale
function isStale(response) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;
  
  const age = Date.now() - parseInt(cachedAt);
  return age > CACHE_CONFIG.maxAge;
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      handleBackgroundSync()
    );
  }
});

async function handleBackgroundSync() {
  // Handle queued actions when back online
  const queuedActions = await getQueuedActions();
  
  for (const action of queuedActions) {
    try {
      await fetch(action.url, action.options);
      await removeFromQueue(action.id);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}

// Push notifications for updates
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: data.primaryKey
        }
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});

// Placeholder functions for queue management
async function getQueuedActions() {
  // Implementation would depend on IndexedDB or similar storage
  return [];
}

async function removeFromQueue(actionId) {
  // Implementation would depend on IndexedDB or similar storage
  return Promise.resolve();
}

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data.type === 'GET_CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage(stats);
    });
  }
});

async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = {
      entries: keys.length,
      urls: keys.map(key => key.url)
    };
  }
  
  return stats;
}

console.log('Service Worker: Loaded and ready');