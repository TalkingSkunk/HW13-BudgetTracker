// static cache version
const staticCacheName = 'site-static-v1';
// dynamic cache version
const dynamicCacheName = 'site-dynamic-v1';
// CORE assets (keys) to be saved in static cache storage
const assets = [
  '/',
  '/index.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
  '/pages/fallback.html'
];

// limit the size of the dynamic cache storage
const limitCacheSize = (name, size) => {
  // open (if exists) or create cache storage
  caches.open(name).then(cache => {
    // keys from static or dynamic cache storage (async task)
    cache.keys().then(keys => {
      // limit the number of items in the cache storage
      if(keys.length > size){
        // delete items, first in, first out; then cycle until size is met.
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

// listen for install event(happens only when sw.js file changes), then trigger callback function
self.addEventListener('install', evt => {
  //console.log('service worker installed');
  //wait for the async task to complete
  evt.waitUntil(
    // create or open (if exists) static cache storage, and use the cache as parameter
    caches.open(staticCacheName).then(cache => {
      console.log('caching shell assets');
      // use .addAll method to reach out to server to get an array of resources
      cache.addAll(assets);
    })
  );
});

// listen for activate event (when re-opening browser, or clicking on 'Update on Reload', or clicking 'Skip Waiting')
self.addEventListener('activate', evt => {
  //console.log('service worker activated');
  //wait for the async task to complete
  evt.waitUntil(
    // get all keys (names) of caches in array (returns a promise), then...
    caches.keys().then(keys => {
      //console.log(keys);
      // combine the array of promises into one promise (wait till all promises resolve)
      return Promise.all(keys
        // filter out current versions for static and dynamic, and...
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        // delete all the caches left behind
        .map(key => caches.delete(key))
      );
    })
  );
});

// intercept fetch requests from browser, and Service Worker modifies/stops/relays the requests (search cache first if we have matching requests). Fetch event gives us the evt object.
self.addEventListener('fetch', evt => {
  // Eliminate all requests for Googleapis (real-time snapshot listeners) from being saved to dynamic cache storage
  if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
    // pause the fetch event, and respond from the cache
    evt.respondWith(
      // search the cache and try to match the request (returns a promise), to which we tack on a callback function that gives us a cache response (if exists)
      caches.match(evt.request).then(cacheRes => {
        // return the a cache response OR continue our fetch request to server, then take the response...
        return cacheRes || fetch(evt.request).then(fetchRes => {
          // open (if exists) or create dynamic cache storage, then...
          return caches.open(dynamicCacheName).then(cache => {
            // siphon off a copy of fetch response into the dynamic cache storage (the request URL (key), and the fetch response (value)) and put it in the dynamic cache storage
            cache.put(evt.request.url, fetchRes.clone());
            // check cached items limit, and delete to not exceed the limit
            limitCacheSize(dynamicCacheName, 15);
            // give the user the fetch response
            return fetchRes;
          })
        });
      // if fetch fails...
      }).catch(() => {
        // if user requests a HTML page (not CSS, not image), then value !== -1. So if user requests HTML, then...
        if(evt.request.url.indexOf('.html') > -1){
          // return the fallback.html from the static cache storage (if resource no found in caches, AND user is offline)
          return caches.match('./pages/fallback.html');
        } 
      })
    );
  }
});