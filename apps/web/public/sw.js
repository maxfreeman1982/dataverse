// Service Worker for Progressive Web App
const CACHE_NAME = 'oj-investment-v1';
const RUNTIME_CACHE = 'oj-runtime-v1';

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/login',
  '/dashboard',
  '/projects',
  '/portfolio',
  '/offline.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching app shell');
      return cache.addAll(PRECACHE_URLS);
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Claim all clients immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/graphql')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - Cache first, network fallback
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image'
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // HTML pages - Network first, cache fallback
  if (request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Default strategy
  event.respondWith(cacheFirstStrategy(request));
});

/**
 * Cache first strategy - Check cache, fallback to network
 */
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);

    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

/**
 * Network first strategy - Try network, fallback to cache
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Network request failed:', error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

// Background sync event - retry failed requests
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-investments') {
    event.waitUntil(syncInvestments());
  }

  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncInvestments() {
  try {
    // Get pending investments from IndexedDB
    const db = await openDatabase();
    const pendingInvestments = await getPendingInvestments(db);

    // Sync each investment
    for (const investment of pendingInvestments) {
      try {
        await fetch('/api/investments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(investment),
        });

        // Remove from pending after successful sync
        await removePendingInvestment(db, investment.id);
      } catch (error) {
        console.error('[Service Worker] Failed to sync investment:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

async function syncTransactions() {
  // Similar implementation for transactions
  console.log('[Service Worker] Syncing transactions...');
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'OJ Investment';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    image: data.image,
    data: data.data,
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'dismiss', title: 'Ignorer' },
    ],
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the app or focus existing window
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow('/dashboard');
        }
      })
  );
});

// Message event - communicate with app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }
});

// Helper functions for IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OJInvestmentDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingInvestments')) {
        db.createObjectStore('pendingInvestments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingTransactions')) {
        db.createObjectStore('pendingTransactions', { keyPath: 'id' });
      }
    };
  });
}

function getPendingInvestments(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingInvestments'], 'readonly');
    const store = transaction.objectStore('pendingInvestments');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function removePendingInvestment(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingInvestments'], 'readwrite');
    const store = transaction.objectStore('pendingInvestments');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
