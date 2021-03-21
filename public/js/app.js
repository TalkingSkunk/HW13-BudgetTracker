// if browser supports use of Service Worker...
if('serviceWorker' in navigator){
  // promise syntax
  navigator.serviceWorker.register('/sw.js')
    // callback functions for successful/unsuccessful promises, using registration, and error objects
    .then(reg => console.log('service worker registered:', reg))
    .catch(err => console.log('service worker not registered:', err));
}