/* Service worker: laat de app starten zonder internet.
 *
 * Verhoog CACHE bij elke wijziging aan index.html of config.js,
 * anders blijven toestellen de oude versie tonen.
 */
var CACHE = "agenda-v1";

var SHELL = [
  "./",
  "./index.html",
  "./config.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // addAll faalt in zijn geheel als één bestand ontbreekt; los toevoegen is vergevingsgezinder
      return Promise.all(SHELL.map(function(u){
        return c.add(u).catch(function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);

  // Supabase nooit uit de cache: gegevens moeten vers zijn, en de app
  // vangt een mislukte aanvraag zelf op.
  if (url.pathname.indexOf("/rest/v1/") === 0 || url.pathname.indexOf("/auth/v1/") === 0) return;

  // Lettertypen: eerst cache, anders netwerk en dan bewaren.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    e.respondWith(
      caches.match(req).then(function(hit){
        return hit || fetch(req).then(function(res){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
          return res;
        }).catch(function(){ return hit; });
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Eigen bestanden: toon de cache meteen, ververs op de achtergrond.
  e.respondWith(
    caches.match(req).then(function(hit){
      var net = fetch(req).then(function(res){
        if (res && res.ok){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){ return hit; });
      return hit || net;
    })
  );
});
