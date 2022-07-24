/**
 * Ethan Hu
 * 5/28/2020
 * Section AF, Jack Vanderberg
 *
 * JS for bestreadsAPI. Does the musclework of bestreadsAPI. Will throw errors
 * if API recives invalid parameters. Has 4 endpoints. First endpoint returns
 * the description of a book, given the ID. The second endpoint returns the title
 * and author of a book, given the ID. The third endpoint returns the reviews, with
 * review name, content and score, given the ID. The fourth endpoint returns all
 * book IDs and titles. Will throw errors with
 * invalid requests, and a seperate error for internal errors.
 */

'use strict';
const express = require('express');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const app = express();
const ERROR_MSG = 'Something went wrong on the server. Please try again later.';
const ERROR_CODE = 500;
const PARAM_ERROR = 400;
const PORT_NUM = 8000;

/**
 * Establishes a database connection to the bestReads database and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} the connected database.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'bestreads.db',
    driver: sqlite3.Database
  });
  return db;
}

/**
 * Endpoint description, with the description varying on the given book_id
 * parameter. If the book ID is invalid, it will throw and invalid input error.
 * If the endpoint fails to complete it's task, it will throw a seprate 500
 * error.
 */
app.get('/bestreads/description/:book_id', async function(req, res) {
  try {
    let db = await getDBConnection();
    res.type('text');
    let descQuery = 'SELECT description FROM books WHERE book_id=?;';
    let desc = await db.all(descQuery, req.params.book_id);
    await db.close();
    if (desc.length === 0) {
      res.status(PARAM_ERROR).send('No results for ' + req.params.book_id + '.');
    } else {
      res.send(descFormat(desc));
    }
  } catch (err) {
    res.status(ERROR_CODE).send(ERROR_MSG);
  }
});

/**
 * Helper function for the description endpoint which converts it to a string.
 * @param {Array} unformatted The array returned from the database.
 * @returns {String} The description in string form.
 */
function descFormat(unformatted) {
  return unformatted[0]['description'];
}

/**
 * Endpoint info, sends a JSON string about the given book, depending on the
 * book ID. If the book ID is invalid, it will throw and invalid input error.
 * If the endpoint fails to complete it's task, it will throw a seprate 500
 * error.
 */
app.get('/bestreads/info/:book_id', async function(req, res) {
  try {
    let descQuery = 'SELECT title, author FROM books WHERE book_id=? ORDER BY book_id;';
    let db = await getDBConnection();
    let info = await db.all(descQuery, req.params.book_id);
    await db.close();
    if (info.length === 0) {
      res.type('text');
      res.status(PARAM_ERROR).send('No results for ' + req.params.book_id + '.');
    } else {
      let infoObject = infoFormat(info);
      res.type('json');
      res.send(infoObject);
    }
  } catch (err) {
    res.status(ERROR_CODE).send(ERROR_MSG);
  }
});

/**
 * Helper function for endpoint info which reformats the given array
 * into JSON.
 * @param {Array} unformatted The unformatted array from bestreads.db.
 * @return {String} The JSON formatted version.
 */
function infoFormat(unformatted) {
  return JSON.stringify(unformatted[0]);
}

/**
 * Endpoint reviews which sends a list of names, ratings and text.
 * If the book ID is invalid, it will throw and invalid input error.
 * If the endpoint fails to complete it's task, it will throw a seprate 500
 * error.
 */
app.get('/bestreads/reviews/:book_id', async function(req, res) {
  try {
    let descQuery = 'SELECT name, rating, text FROM reviews WHERE book_id=? ORDER BY book_id;';
    let db = await getDBConnection();
    let review = await db.all(descQuery, req.params.book_id);
    await db.close();
    if (review.length === 0) {
      res.type('text');
      res.status(PARAM_ERROR).send('No results for ' + req.params.book_id + '.');
    } else {
      let reviewObject = reviewFormat(review);
      res.type('json');
      res.send(reviewObject);
    }
  } catch (err) {
    res.status(ERROR_CODE).send(ERROR_MSG);
  }
});

/**
 * Helper function for the books endpoint which converts the given array
 * into another type of array useable by the endpoint.
 * @param {Array} unformatted The array from bestreads.db
 * @returns {String} The new format, usable by the endpoint.
 */
function reviewFormat(unformatted) {
  return JSON.stringify(unformatted);
}

/**
 * Endpoint books, sends a JSON string with multiple details, depending on the
 * given parameter. A request with an invalid parameter will
 * send a status 400 error. An internal error will send a seperate 500 error.
 */
app.get('/bestreads/books', async function(req, res) {
  try {
    let db = await getDBConnection();
    let books = await db.all('SELECT title, book_id FROM books;');
    await db.close();
    res.type('json');
    res.send(bookFormat(books));
  } catch (err) {
    res.status(ERROR_CODE).send(ERROR_MSG);
  }
});

/**
 * Helper function for books endpoint that converts the given array
 * into an object.
 * @param {Array} unformatted The given array from bestreads.db
 * @returns {String} the JSON string that's usuable by the endpoint.
 */
function bookFormat(unformatted) {
  let topFormat = {};
  topFormat.books = unformatted;
  return JSON.stringify(topFormat);
}

app.use(express.static('public'));
const PORT = process.env.PORT || PORT_NUM;
app.listen(PORT);