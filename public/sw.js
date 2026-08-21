// PROJECT.md'ye göre offline cache gerekmiyor — bu service worker yalnızca
// "ana ekrana ekle" (PWA install) desteği için var, fetch'e müdahale etmez.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
