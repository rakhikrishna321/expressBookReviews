const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Register user (unchanged)
public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if(!username || !password){
    return res.status(400).json({message:"Username and password are required."});
  }
  const userExists = users.some((user)=>user.username === username);
  if(userExists){
    return res.status(409).json({message:"Username already exists. Please choose a different username"});
  }
  users.push({username,password});
  return res.status(200).json({message:"User registered successfully!"});
});


// ===== Task 10: Get the book list using async-await with Axios =====
public_users.get('/books-async', async (req, res) => {
  try {
    // Call the synchronous route internally
    const response = await axios.get('http://localhost:5000/books/books');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({message: "Error fetching book list asynchronously"});
  }
});

// ===== Task 11: Get book details by ISBN using async-await with Axios =====
public_users.get('/isbn-async/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/books/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({message: `Book not found asynchronously for ISBN: ${isbn}`});
  }
});

// ===== Task 12: Get books by author using async-await with Axios =====
public_users.get('/author-async/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/books/author/${author}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({message: `Books not found asynchronously for author: ${author}`});
  }
});

// ===== Task 13: Get books by title using async-await with Axios =====
public_users.get('/title-async/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:5000/books/title/${title}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({message: `Books not found asynchronously for title: ${title}`});
  }
});


// ========== Synchronous routes ==========

// Get the book list available in the shop
public_users.get('/books', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  } else {
    return res.status(404).json({message:"Book not found for ISBN: " + isbn});
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const bookKeys = Object.keys(books);
  let results = [];

  bookKeys.forEach((key) => {
    if (books[key].author.toLowerCase() == author) {
      results.push(books[key]);
    }
  });

  if(results.length > 0){
    return res.status(200).send(JSON.stringify(results, null, 4));
  } else {
    return res.status(400).json({message: `No books found for author: ${author}`});
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const results = [];
  for(let key in books){
    if (books[key].title.toLowerCase() == title){
      results.push(books[key]);
    }
  }
  if(results.length > 0){
    return res.status(200).send(JSON.stringify(results, null, 4));
  } else {
    return res.status(400).json({message: `No books found with title: ${title}` });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if(books[isbn]){
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({message:"Book not found for the given ISBN"});
  }
});

module.exports.general = public_users;
