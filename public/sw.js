self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Optional: basic fetch handler passthrough (kept minimal for now)
self.addEventListener('fetch', () => {
  // Let the network handle requests for now
});