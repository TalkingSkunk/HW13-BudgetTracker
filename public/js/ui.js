// pinpoint the HTML elemet with class "bookTitle" (only in index.html)
const bookTitle = document.querySelector('#bookTitle');
// pinpoint the HTML element with id "bookList" (only in index.html)
const bookList = document.querySelector('#bookList');
// pinpoint the HTML element with class "chapters" (only in index.html)
const chapters = document.querySelector('#chapters');
// once all DOM content in browser are loaded, trigger a callback function
document.addEventListener('DOMContentLoaded', function() {
  // pinpoint the sidenav section (menu list)
  const menus = document.querySelectorAll('.side-menu');
  // use the Sidenav from Materialize JS library, then initialize it (using init()), passing it the menus variable, and the optional object (specifies we want the sidenav to slide from the right)
  M.Sidenav.init(menus, {edge: 'right'});
  // pinpoint the sidenav section (books list)
  const libraries = document.querySelectorAll('.side-library');
  // use the Sidenav from Materialize JS library, then initialize it (using init()), passing it the menus variable, and the optional object (specifies we want the sidenav to slide from the right)
  M.Sidenav.init(libraries, {edge: 'left'});
  // pinpoint the sidenav section (add chapter form)
  const forms = document.querySelectorAll('.side-form');
  // use the Sidenav from Materialize JS library, then initialize it (using init()), passing it the forms variable, and the optional object (specifies we want the sidenav to slide from the left)
  M.Sidenav.init(forms, {edge: 'left'});
  // dropdown list of the books, and initialize the Dropdown
  const dropdown = document.querySelectorAll('.dropdown-trigger');
  M.Dropdown.init(dropdown, {alignment: 'left', coverTrigger: false, constrainWidth: false});
  // pinpoint the modal form, and initialize
  const modal = document.querySelectorAll('.modal');
  M.Modal.init(modal, {inDuration: 1000});
  // time picker for transaction
  const timePicker = document.querySelectorAll('.datepicker');
  M.Datepicker.init(timePicker, {autoClose: true, format: 'yyyy-mm-dd'});
});
// render book title data
const renderTitle = title => {
  bookTitle.innerText = `${title}`;
}
// render book into bookList dropdown menu
const renderBookList = book => {
  bookList.innerHTML += `
  <li><a class="sidenav-close" href="javascript: renderTitle('${book}')" data-id="${book}">${book}</a></li>
  `
}
// render chapter data
const renderChapter = (data, id, totalBalance) => {
  const html = `
    <tr class="chapter ${data.type}" data-id="${id}">
      <td class="chapter-time">${data.timestamp}</td>
      <td class="chapter-type">${data.type}</td>
      <td class="chapter-commentary">${data.name}</td>
      <td class="chapter-number">$ ${data.amount}</td>
      <td class="totalBalance">
        $ ${totalBalance}
      </td>
      <td class="chapter-delete">
      <i class="material-icons" data-id="${id}">delete_outline</i>
      </td>
    </tr>
  `;
  chapters.innerHTML = html + chapters.innerHTML;
};