const CACHE_NAME = 'examfobiya-v1';
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/favicon-48x48.png',
    '/logo192.png',
    '/logo512.png'
];

// Install Service Worker and cache essential static resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching static assets');
            return cache.addAll(PRECACHE_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate Service Worker and clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event: Network-first strategy with cache fallback for fast loading & offline support
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Ignore Chrome extensions or non-http protocols
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // If valid response, clone and cache it for offline use
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(async () => {
                // Network failed, attempt to serve from cache
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Fallback for HTML page requests if offline
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/index.html');
                }
            })
    );
});
