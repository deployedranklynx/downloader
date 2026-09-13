// Clean Service Worker that does not interfere with Google Auth Bridge or iframe navigation
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Do not intercept any fetch events so Google Auth Bridge and iframe communications pass through cleanly
self.addEventListener('fetch', () => {
  // Let the browser handle all network requests natively
  return;
});
