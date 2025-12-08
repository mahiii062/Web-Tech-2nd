const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../helpers/db");

// Purchase a course: flow -> check bank secret & balance -> create transaction record -> enroll student
router.post("/buy", (req, res) => {
  const { userId, courseId, secret } = req.body;
  if (!userId || !courseId || !secret)
    return res.status(400).json({ error: "Missing fields" });

  const bank = readJSON("bank.json");
  const acc = bank.find((b) => b.userId === userId);
  if (!acc) return res.status(404).json({ error: "Bank not setup" });
  if (acc.secret !== secret) return res.status(401).json({ error: "Auth failed" });

  const courses = readJSON("courses.json");
  const course = courses.find((c) => c.id === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });

  if (acc.balance < course.price) return res.status(400).json({ error: "Insufficient funds" });

  // deduct from learner and push transaction to transactions.json; LMS holds amount (toUserId = 'LMS')
  acc.balance -= course.price;
  writeJSON("bank.json", bank);

  const transactions = readJSON("transactions.json");
  const trx = {
    id: Date.now().toString(),
    fromUserId: userId,
    toUserId: "LMS",
    amount: course.price,
    courseId,
    date: new Date().toISOString(),
    instructorPaid: false
  };
  transactions.push(trx);
  writeJSON("transactions.json", transactions);

  // add student to course
  if (!course.students.includes(userId)) {
    course.students.push(userId);
    writeJSON("courses.json", courses);
  }

  res.json({ message: "Course purchased", transaction: trx });
});

// certificate (simple text response; could be enhanced to PDF)
router.get("/certificate/:userId/:courseId", (req, res) => {
  const { userId, courseId } = req.params;
  const courses = readJSON("courses.json");
  const course = courses.find((c) => c.id === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (!course.students.includes(userId)) return res.status(403).json({ error: "Not enrolled" });

  // For demo: return a simple certificate object
  res.json({
    certificate: {
      courseId,
      userId,
      courseTitle: course.title,
      issuedAt: new Date().toISOString(),
      certificateText: `This certifies that user ${userId} has completed ${course.title}`
    }
  });
});

module.exports = router;
