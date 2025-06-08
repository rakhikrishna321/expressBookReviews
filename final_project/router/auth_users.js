const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // should be imported from your auth_users.js or wherever user data is stored

const isValid = (username) => {
  // Check if username exists in users array
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Check if username and password match
  return users.some(user => user.username === username && user.password === password);
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "User not found. Please register first." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // If authentication successful, create JWT token and send it back
  const token = jwt.sign({ username }, "access_key", { expiresIn: '1h' });
  // Save token in session or send it to client for future requests
  req.session.authorization = { token, username };

  return res.status(200).json({ message: "User successfully logged in", token });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization ? req.session.authorization.username : null;
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Review text is required in query parameter" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
  
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
  
    // Add or update review by username
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({ message: `Review for book ${isbn} added/updated successfully.` });
  });
  
  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization ? req.session.authorization.username : null;
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
  
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review by this user not found for the book." });
    }
  
    delete books[isbn].reviews[username];
  
    return res.status(200).json({ message: `Review deleted successfully for ISBN ${isbn}` });
  });
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
