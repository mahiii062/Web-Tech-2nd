// importing required modules
const express = require("express");
const router = express.Router(); // handle /api/instructor/... routes
const { readJSON, writeJSON } = require("../helpers/db");

// Instructor collects pending payments
// POST /api/instructor/collect
router.post("/collect", (req, res) => {
  const { instructorId, secret } = req.body;
  if (!instructorId || !secret) return res.status(400).json({ error: "Missing fields" });

  const bank = readJSON("bank.json");
  const instAcc = bank.find(b => b.userId === instructorId);
  const lmsAcc = bank.find(b => b.userId === "LMS");

  if (!instAcc) return res.status(404).json({ error: "Instructor bank missing" });
  if (!lmsAcc) return res.status(400).json({ error: "LMS bank missing" });

  if (instAcc.secret !== secret) return res.status(401).json({ error: "Wrong bank secret" });

  const trxs = readJSON("transactions.json"); // read all transactions and store it to trx for future use
  const courses = readJSON("courses.json");

  let collected = 0;
  trxs.forEach(trx => {
    if (trx.instructorId === instructorId && trx.status === "pending") {
      if (lmsAcc.balance >= trx.amount) {
        lmsAcc.balance -= trx.amount;
        instAcc.balance += trx.amount;
        trx.status = "completed";
        collected += trx.amount;
      }
    }
  });

  // update course sales records
  writeJSON("transactions.json", trxs);
  writeJSON("bank.json", bank);

  // respond to frontend
  res.json({ message: `Collected ${collected} TK successfully`, collected });
});

// Instructor uploads materials → gets reward instantly (+200)
// POST /api/instructor/reward
router.post("/reward", (req, res) => {
  const { instructorId } = req.body; // take instructorId from req body 
  const bank = readJSON("bank.json");
  const instAcc = bank.find(b => b.userId === instructorId);
  if (!instAcc) return res.status(404).json({ error: "Instructor bank missing" });
  instAcc.balance += 200;
  writeJSON("bank.json", bank);
  res.json({ message: "Reward added: +200 TK" });
});

module.exports = router;
