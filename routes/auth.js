const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { readJSON, writeJSON } = require("../helpers/db");

// Register API
// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing fields" });
  }


  // for checking values with users.json file to compare
  const users = readJSON("users.json");
  const exists = users.find((u) => u.email === email);
  if (exists) return res.status(400).json({ error: "Email already registered" });

  // after checkin, Create new user object
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
    role
  };

  // Save user into JSON file
  users.push(newUser);
  writeJSON("users.json", users);
  // send response to frontend
  res.json({ message: "Registered", user: newUser });
});

// Login API
// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = readJSON("users.json");

  // check user credentials
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  // send res to frontend
  res.json({ message: "Login success", user });
});

module.exports = router; // to use this route from server.js we use exports
