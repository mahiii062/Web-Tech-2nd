const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../helpers/db");

// Instructor collects money from LMS (LMS account -> instructor account)
router.post("/collect", (req, res) => {
  const { instructorId, secret } = req.body;
  if (!instructorId || !secret) return res.status(400).json({ error: "Missing fields" });

  const bank = readJSON("bank.json");
  const instrAcc = bank.find((b) => b.userId === instructorId);
  const lmsAcc = bank.find((b) => b.userId === "LMS");

  if (!instrAcc) return res.status(404).json({ error: "Instructor account not found" });
  if (!lmsAcc) return res.status(404).json({ error: "LMS account not found" });
  if (instrAcc.secret !== secret) return res.status(401).json({ error: "Auth failed (instructor secret mismatch)" });

  // find transactions that are to LMS and not yet distributed
  const transactions = readJSON("transactions.json");
  const pending = transactions.filter((t) => t.toUserId === "LMS" && !t.instructorPaid);

  if (pending.length === 0) return res.json({ message: "No pending funds" });

  // For simplicity: split the pending amounts proportionally to instructors based on which instructor's course was bought.
  const courses = readJSON("courses.json");

  // compute amount owed to this instructor
  let amountDue = 0;
  pending.forEach((t) => {
    const course = courses.find((c) => c.id === t.courseId);
    if (course && course.instructorId === instructorId && !t.instructorPaid) {
      amountDue += t.amount;
      t.instructorPaid = true; // mark distributed
    }
  });

  if (amountDue > 0) {
    // transfer from LMS account to instructor account
    if (lmsAcc.balance < amountDue) {
      return res.status(500).json({ error: "LMS has insufficient funds (internal)" });
    }
    lmsAcc.balance -= amountDue;
    instrAcc.balance += amountDue;
    writeJSON("bank.json", bank);
    writeJSON("transactions.json", transactions);
    return res.json({ message: "Collected", amount: amountDue });
  } else {
    // no funds for this instructor
    writeJSON("transactions.json", transactions); // still update flags if any
    return res.json({ message: "No funds available for this instructor right now" });
  }
});

module.exports = router;
