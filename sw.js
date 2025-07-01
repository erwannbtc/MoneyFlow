/**
 * Movo App - Service Worker
 * Provides caching, offline support, and performance optimization
 * Version: 2.0 - Performance Optimized
 */

const CACHE_NAME = 'movo-v2.0';
const STATIC_CACHE = 'movo-static-v2.0';
const DYNAMIC_CACHE = 'movo-dynamic-v2.0';

// Critical assets to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/styles.min.css',
  '/app-core.min.js',
  '/manifest.json'
];

// Extended assets to cache on demand
const EXTENDED_ASSETS = [
  '/styles-extended.min.css',
  '/assets/growth-chart.webp',
  '/assets/growth-chart.jpg'
];

// External resources to cache
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
  'https://unpkg.com/@supabase/supabase-js@2'
];

// Install event - cache critical assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extensions and non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// Handle different types of requests with appropriate strategies
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Critical assets - Cache First with Network Fallback
    if (isCriticalAsset(request.url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: Extended assets - Stale While Revalidate
    if (isExtendedAsset(request.url)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // Strategy 3: External fonts/APIs - Cache First with Network Fallback
    if (isExternalAsset(request.url)) {
      return await cacheFirst(request, DYNAMIC_CACHE);
    }
    
    // Strategy 4: API calls - Network First with Cache Fallback
    if (isAPICall(request.url)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Strategy 5: Other assets - Network First
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('Service Worker: Request failed', error);
    
    // Return offline fallback if available
    if (request.destination === 'document') {
      const cache = await caches.open(STATIC_CACHE);
      return cache.match('/') || new Response('Offline');
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Caching strategy: Cache First with Network Fallback
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('Service Worker: Serving from cache', request.url);
    return cached;
  }
  
  console.log('Service Worker: Fetching and caching', request.url);
  const response = await fetch(request);
  
  if (response.status === 200) {
    cache.put(request, response.clone());
  }
  
  return response;
}

// Caching strategy: Network First with Cache Fallback
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('Service Worker: Network first for', request.url);
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// Caching strategy: Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Start network request (don't await)
  const networkPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cached) {
    console.log('Service Worker: Serving stale content', request.url);
    return cached;
  }
  
  // If no cache, wait for network
  console.log('Service Worker: No cache, waiting for network', request.url);
  return networkPromise;
}

// Helper functions to categorize requests
function isCriticalAsset(url) {
  return CRITICAL_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('.min.css') ||
         url.includes('app-core.min.js');
}

function isExtendedAsset(url) {
  return url.includes('/assets/') ||
         url.includes('styles-extended') ||
         url.includes('.webp') ||
         url.includes('.jpg') ||
         url.includes('.png');
}

function isExternalAsset(url) {
  return url.includes('fonts.googleapis.com') ||
         url.includes('unpkg.com') ||
         url.includes('fonts.gstatic.com');
}

function isAPICall(url) {
  return url.includes('/api/') ||
         url.includes('supabase.co') ||
         url.includes('coingecko.com') ||
         url.includes('finance.yahoo.com');
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'movo-sync-data') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions when back online
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB or localStorage
    const offlineActions = JSON.parse(localStorage.getItem('movoOfflineActions') || '[]');
    
    for (const action of offlineActions) {
      try {
        // Send action to server
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action)
        });
        
        console.log('Service Worker: Synced offline action', action);
      } catch (error) {
        console.error('Service Worker: Failed to sync action', action, error);
      }
    }
    
    // Clear synced actions
    localStorage.setItem('movoOfflineActions', '[]');
    
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-96x96.png',
    tag: data.tag || 'movo-notification',
    actions: data.actions || [],
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const clickAction = event.action;
  const notificationData = event.notification.data;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if no existing one
      if (clients.openWindow) {
        const targetUrl = clickAction ? `/${clickAction}` : '/';
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_REPORT') {
    console.log('Service Worker: Performance metrics', event.data.metrics);
    
    // Store performance data for analytics
    caches.open(DYNAMIC_CACHE).then(cache => {
      const performanceData = new Response(JSON.stringify({
        timestamp: Date.now(),
        metrics: event.data.metrics
      }));
      
      cache.put('/performance-data', performanceData);
    });
  }
});

console.log('Service Worker: Loaded and ready');