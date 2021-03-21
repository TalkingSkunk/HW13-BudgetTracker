// handle all offline activities (async task): sync up database with indexedDB (when indexedDB is changed when offline) when next time online, and store all database data in indexedDB to be accessed offline
db.enablePersistence()
  // catch error, and pass the err object...
  .catch(function(err) {
    // if there are multiple tabs open at once...
    if (err.code == 'failed-precondition') {
      console.log('persistance failed. Multiple tabs open.');
    // if the browser does not support indexedDB...
    } else if (err.code == 'unimplemented') {
      console.log('persistance not available. No browser support.');
    }
  });

// ADD A NEW BOOK
// pinpoint the form from DOM (Modal)
const bookForm = document.querySelector('#newBookForm');
// listen for submit event from the Modal form
bookForm.addEventListener('submit', evt =>{
  // submit event, by default, refreshes the page.
  evt.preventDefault();
  // extract user input for book name
  const book = bookForm.book.value.trim();
  // Create a document with the Book name as its unique ID
  db.collection('books').doc(`${book}`).set({})
    // no need to do .then (since there's nothing else to do)
    .catch(err => console.log(err));
  // clear the form inputs after.
  bookForm.book.value = '';
  // send title data to DOM (trigger function from ui.js)
  renderTitle(book);
})

// fetch all documents inside collection, and populate the bookList Dropdown menu
db.collection('books').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    // sense the change in the Collection, and output to DOM so user can see the change.
    if(change.type === 'added'){
      // send title data to DOM (trigger function from ui.js)
      renderBookList(change.doc.id);
    };
  })
});

// Select the node that will be observed for mutations (i.e. the element with id=bookTitle)
const node = document.querySelector('#bookTitle');
// Options for the observer (which mutations to observe)
const config = {
  childList: true, // observe direct children
  subtree: true, // and lower descendants too
  attributes: true
};
// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
  // Use traditional 'for loops' for IE 11
  for(const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      console.log('The book has been changed.');
      // pinpoint the HTML element with class "chapters" (only in index.html), then refresh the DOM every time a bookList is clicked.
      const chapters2 = document.querySelector('.chapters');
      chapters2.innerHTML = '';
      // pinpoint the HTML elemet with id "bookTitle" (only in index.html), then refresh the DOM every time a bookList is clicked.
      const bookTitle2 = document.querySelector('#bookTitle');
      const book = bookTitle2.innerText;

      // 24/7 real-time listener sends back changes to database immediate. onSnapshot method sends back any change to the collection through a callback function, which takes the snapshot object. (**Snapshot listens not only to changes to database, but also changes to indexedDB. So DOM will reflect the changes even when offline.**)
      db.collection('books').doc(book).collection('fragments').onSnapshot(snapshot => {
        // docChanges() puts all changes into an array to the collection since the last snapshot. Then we cycle through each change object...
        snapshot.docChanges().forEach(change => {
          console.log('change:', change)
          // sense the change in the Collection, and output to DOM so user can see the change.
          if(change.type === 'added'){
            // Add document data to DOM (trigger function from ui.js): doc property.data object (data inside each document), each id of document
            renderChapter(change.doc.data(), change.doc.id);
          };
          // sense the change in the Collection, and output to DOM so user can see the change.
          if(change.type === 'removed'){
            // Remove document data from DOM (trigger function from ui.js): id of document to be removed
            removeChapter(change.doc.id);
          };
        });
      });
    }
  }
};
// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);
// Start observing the target node for configured mutations
observer.observe(node, config);

// ADD NEW CHAPTER
// pinpoint the form from DOM
const chapterForm = document.querySelector('#newChapterForm');
chapterForm.addEventListener('submit', evt => {
  // submit event, by default, refreshes the page.
  evt.preventDefault();
  // make a JS object from user's input in the form
  const chapter = {
    chapter: chapterForm.chapter.value.trim(),
    commentary: chapterForm.commentary.value.trim()
  };
  // find what book we are in
  const book = document.querySelector('#bookTitle').innerText;
  // Add the JS Object into the Collection
  db.collection('books').doc(book).collection('fragments').add(chapter)
    // no need to do .then (since there's nothing else to do)
    .catch(err => console.log(err));
  // clear the form inputs after.
  chapterForm.chapter.value = '';
  chapterForm.commentary.value = '';
});

// REMOVE A CHAPTER
// pinpoint the parent <div> containing all the documents
const chapterContainer = document.querySelector('.chapters');
// attach only one event listener to the parent <div>. Clicking anywhere inside the section will trigger the callback function.
chapterContainer.addEventListener('click', evt => {
  // if clicked target is <i> tag...
  if(evt.target.tagName === 'I'){
    // find what book we are in
    const book = document.querySelector('#bookTitle').getAttribute('data-id');
    // extract the attribute date (i.e. the id of the document)
    const id = evt.target.getAttribute('data-id');
    // pass on the id of the document to be deleted
    db.collection('books').doc(book).collection('fragments').doc(id).delete();
  }
})