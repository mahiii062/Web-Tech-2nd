const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { readJSON, writeJSON } = require("../helpers/db");

// Register
router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const users = readJSON("users.json");
  const exists = users.find((u) => u.email === email);
  if (exists) return res.status(400).json({ error: "Email already registered" });

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password, // NOTE: plain text for this project (no DB). In real apps hash it.
    role // "learner" or "instructor" or "admin"
  };

  users.push(newUser);
  writeJSON("users.json", users);
  res.json({ message: "Registered", user: newUser });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = readJSON("users.json");
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ message: "Login success", user });
});

module.exports = router;
