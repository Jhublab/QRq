/**
 * SERVICE WORKER - Offline Support & Caching
 */

const CACHE_NAME = 'qr-sys32-v1.0.0';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/privacy.html',
    '/manifest.json',
    '/css/global.css',
    '/css/components.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/js/utils.js',
    '/js/qr-generator.js',
    '/js/ui-handler.js',
    '/js/sharing.js',
    '/js/history.js',
    '/js/theme.js',
    '/js/app.js'
];

// Install event - Cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((error) => {
                console.log('Cache installation failed:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // CDN resources - network only
    if (request.url.includes('cdnjs.cloudflare.com')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    return new Response('CDN resource not available offline', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                })
        );
        return;
    }

    // App resources - cache first with network fallback
    event.respondWith(
        caches.match(request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone response for caching
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Return offline page or cached response
                        return caches.match(request)
                            .then((response) => {
                                return response || new Response(
                                    'Resource not available offline',
                                    {
                                        status: 503,
                                        statusText: 'Service Unavailable',
                                        headers: new Headers({
                                            'Content-Type': 'text/plain'
                                        })
                                    }
                                );
                            });
                    });
            })
    );
});

// Background sync for future features
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-qr-history') {
        event.waitUntil(syncQRHistory());
    }
});

// Periodic sync for future features
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-cache') {
        event.waitUntil(updateCache());
    }
});

/**
 * Sync QR history
 */
async function syncQRHistory() {
    try {
        // This is a stub for future implementation
        console.log('Syncing QR history...');
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

/**
 * Update cache
 */
async function updateCache() {
    try {
        const cache = await caches.open(CACHE_NAME);
        for (const url of ASSETS_TO_CACHE) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                }
            } catch (error) {
                console.warn(`Failed to update cache for ${url}`);
            }
        }
    } catch (error) {
        console.error('Cache update failed:', error);
    }
}

// Push notifications for future features
self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {};
    const title = data.title ?? 'QR.SYS32.LT';
    const options = {
        body: data.body ?? 'New notification',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%230f0f23" width="192" height="192"/><g fill="%2300ff88"><rect x="20" y="20" width="50" height="50"/><rect x="122" y="20" width="50" height="50"/><rect x="20" y="122" width="50" height="50"/><rect x="70" y="70" width="50" height="50"/></g></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%230f0f23" width="192" height="192"/><g fill="%2300ff88"><rect x="20" y="20" width="50" height="50"/><rect x="122" y="20" width="50" height="50"/><rect x="20" y="122" width="50" height="50"/><rect x="70" y="70" width="50" height="50"/></g></svg>',
        tag: 'qr-notification'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open app if not already open
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});
