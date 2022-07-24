/**
 * Ethan Hu
 * 5/28/2020
 * Section AF, Jack Vanderberg
 *
 * JS for bestreads.html. Does the musclework in accessing bestreads API. Will throw errors
 * if API is inaccessible. Changes elements in reaction to user input in accordance
 * with the bestreads.html and bestreads.css file.
 */

'use strict';

(function() {

  window.addEventListener('load', init);

  /**
   * Runs only when the page elements are guarenteed loaded.
   * Loads the initial page, and sets it up for
   * other functions.
   */
  function init() {
    id('home').addEventListener('click', homeReturn);
    fetchList();
  }

  /**
   * Pulls up a list of all books in the database
   * Catches any errors that happen before reaching the bestreads API.
   */
  function fetchList() {
    let url = '/bestreads/books';
    fetch(url)
      .then(response => response.json())
      .then(bookList)
      .catch(showError);
  }

  /**
   * Helper function for fetchList that displays the books
   * on the page.
   * @param {Object} data JSON formatted list of books.
   */
  function bookList(data) {
    for (let i = 0; i < data.books.length; i++) {
      let bookDisplay = gen('div');
      let bookTitle = gen('p');
      bookTitle.textContent = data.books[i].title;
      let imgDisplay = gen('img');
      imgDisplay.src = 'covers/' + data.books[i].book_id + '.jpg';
      imgDisplay.alt = data.books[i].book_id;
      bookDisplay.appendChild(imgDisplay);
      bookDisplay.appendChild(bookTitle);
      bookDisplay.classList.add('selectable');
      bookDisplay.addEventListener('click', bookDetail);
      id('all-books').appendChild(bookDisplay);
      id('single-book').classList.add('hidden');
    }
  }

  /**
   * Brings up detailed information about a book, like author, description
   * and reviews, replacing the main book view.
   * @param {Event} event The event that triggered bookDetail
   */
  function bookDetail(event) {
    id('all-books').classList.add('hidden');
    id('single-book').classList.remove('hidden');
    let identification = event.currentTarget.children[0].alt;
    fetchDesc(identification);
    fetchInfo(identification);
    reviewFetch(identification);
    id('book-cover').src = 'covers/' + identification + '.jpg';
  }

  /**
   * Retrieves the description of a book and displays it on the page.
   * Any failure to use the bestreads API will throw an error.
   * @param {String} desc The bookID of the searched book.
   */
  function fetchDesc(desc) {
    let url = '/bestreads/description/' + desc;
    fetch(url)
      .then(checkStatus)
      .then(response => response.text())
      .then(descReturn)
      .catch(showError);
  }

  /**
   * Helper function for fetchDesc that actually puts the description on the
   * page.
   * @param {String} data the description.
   */
  function descReturn(data) {
    id('book-description').textContent = data;
  }

  /**
   * Retrieves the author and title of the book.
   * Any failure to use the bestreads API will throw an error.
   * @param {String} info The bookID of the searched book
   */
  function fetchInfo(info) {
    let url = '/bestreads/info/' + info;
    fetch(url)
      .then(checkStatus)
      .then(response => response.json())
      .then(infoReturn)
      .catch(showError);
  }

  /**
   * Helper function for fetchInfo that takes information from bestreads API
   * and displays it on the page.
   * @param {Object} data JSON formatted data for the infomation about the book.
   */
  function infoReturn(data) {
    id('book-title').textContent = data.title;
    id('book-author').textContent = data.author;
  }

  /**
   * Gets reviews about a given book and displays them.
   * Will throw an error if any part of the fetch fails.
   * @param {String} reviews the book_ID for the review set.
   */
  function reviewFetch(reviews) {
    let url = '/bestreads/reviews/' + reviews;
    fetch(url)
      .then(checkStatus)
      .then(response => response.json())
      .then(reviewReturn)
      .catch(showError);
  }

  /**
   * Helper function for reviewFetch that updates the page in accordance
   * with given review information.
   * @param {Object} data The JSON formatted data for ratings.
   */
  function reviewReturn(data) {
    let totalRating = 0;
    let reviewCount = 0;
    clearReviews();
    for (let i = 0; i < data.length; i++) {
      let name = gen('h3');
      let rating = gen('h4');
      let text = gen('p');
      name.textContent = data[i].name;
      let currentRating = data[i].rating.toFixed(1);
      rating.textContent = 'Rating: ' + currentRating;
      text.textContent = data[i].text;
      id('book-reviews').appendChild(name);
      id('book-reviews').appendChild(rating);
      id('book-reviews').appendChild(text);
      reviewCount++;
      totalRating += Number(currentRating);
    }
    let average = (totalRating / reviewCount).toFixed(1);
    id('book-rating').textContent = average;

  }

  /**
   * Helper function for review return. Clears the old set of reviews.
   */
  function clearReviews() {
    let reviewBox = id('book-reviews');
    while (reviewBox.firstChild) { // firstChild from MDN Javascript API.
      reviewBox.removeChild(reviewBox.firstChild);
    }
  }

  /**
   * Reverts the page to multi-book view.
   */
  function homeReturn() {
    id('single-book').classList.add('hidden');
    id('all-books').classList.remove('hidden');
  }

  /**
   * Checks the status of the bestreads API fetch - returning it if status successful
   * and throwing an error if not successful.
   * @param {Response} response the response to the fetch.
   * @returns {Response} the same response
   */
  function checkStatus(response) {
    if (response.ok) {
      return response;
    } else {
      throw Error('Error in request: ' + response.statusText);
    }
  }

  /**
   * Switches the page to error display if an error occours, disabling the home
   * button.
   */
  function showError() {
    id('book-data').classList.add('hidden');
    id('err-text').classList.remove('hidden');
    id('home').removeEventListener('click', homeReturn);
  }

  /**
   * shorthand of getElementById
   * @param {String} idName id to look for nodes with
   * @returns {Element} node with given id tag
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * shorthand for createElement
   * @param {String} tagName tag that new element goes as
   * @returns {Element} the new elment with the given tagname
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();