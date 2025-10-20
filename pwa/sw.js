const CACHE_NAME = 'eatfast-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/pages/newsletter.html',
  '/pages/about_us.html',
  '/pages/offline.html',
  '/assets/image/eat_fast.png',
  '/assets/image/livreur.png',
  '/assets/image/test.jpeg',
  '/pwa/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream that can only be consumed once
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a stream that can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        ).catch(() => {
          // Return offline page for navigation requests when offline
          if (event.request.mode === 'navigate') {
            return caches.match('/pages/offline.html');
          }
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle mise à jour d\'Eat Fast!',
    icon: '/assets/image/eat_fast.png',
    badge: '/assets/image/eat_fast.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'En savoir plus',
        icon: '/assets/image/eat_fast.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/assets/image/eat_fast.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Eat Fast', options)
  );
});
