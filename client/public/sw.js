const CACHE_NAME = 'ecobag-v1';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Don\'t forget your bags!',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2334C759"/><text y="70" font-size="60" text-anchor="middle" x="50" fill="white">🛍️</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2334C759"/><text y="70" font-size="60" text-anchor="middle" x="50" fill="white">🛍️</text></svg>',
    tag: 'bag-reminder',
    actions: [
      {
        action: 'brought-bags',
        title: 'I brought my bags! 🎉'
      },
      {
        action: 'remind-later',
        title: 'Remind me later'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('EcoBag Reminder', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'brought-bags') {
    // Open app to bag selection
    event.waitUntil(
      clients.openWindow('/?action=bag-selection')
    );
  } else if (event.action === 'remind-later') {
    // Do nothing, just close
    return;
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
