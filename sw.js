// CarbuTrack SW - Network First, always fresh HTML
const CACHE = 'carbutrack-v4';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  // Delete ALL old caches
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = new URL(e.request.url);
  var isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  // HTML always from network - never cache
  if(isHTML){
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).catch(function(){
        // Only if truly offline, serve cached
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Other assets: cache first
  e.respondWith(
    caches.match(e.request).then(function(cached){
      var network = fetch(e.request).then(function(res){
        var clone = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return res;
      });
      return cached || network;
    })
  );
});
