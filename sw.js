const CACHE_NAME = "ralph-game-cache-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "index.html",
        "main.css",
        "SRC/Scripts/engine.js",
        "SRC/Imagens/wall.png",
        "SRC/Imagens/ralph.png",
        "SRC/Audios/BackgroundMusic.mp3",
        "SRC/Audios/audio_hit.m4a",
        "SRC/Audios/gameOver.mp3",
        "SRC/Audios/ouro.mp3",
        "SRC/Audios/prata.mp3",
        "SRC/Audios/bronze.mp3"
      ]);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});