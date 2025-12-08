const express = require("express");
const router = express.Router();
const { readJSON, writeJSON } = require("../helpers/db");
const { v4: uuidv4 } = require("uuid");

// Get all courses
router.get("/", (req, res) => {
  const courses = readJSON("courses.json");
  res.json(courses);
});

// Add a course (instructor)
router.post("/add", (req, res) => {
  const { instructorId, title, price } = req.body;
  if (!instructorId || !title || !price) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const courses = readJSON("courses.json");
  if (courses.length >= 5) {
    return res.status(400).json({ error: "LMS hosts only 5 courses" });
  }

  const newCourse = {
    id: uuidv4(),
    title,
    price: Number(price),
    instructorId,
    materials: [], // can hold {type: 'video'|'pdf'|'mcq', title, url}
    students: [] // userIds who purchased
  };
  courses.push(newCourse);
  writeJSON("courses.json", courses);

  // pay lump sum to instructor's bank account logic is in instructor route (they can collect later)
  res.json({ message: "Course added", course: newCourse });
});

// Add material to course
router.post("/:courseId/material", (req, res) => {
  const { courseId } = req.params;
  const { type, title, url } = req.body;
  const courses = readJSON("courses.json");
  const course = courses.find((c) => c.id === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });

  course.materials.push({ id: uuidv4(), type, title, url });
  writeJSON("courses.json", courses);
  res.json({ message: "Material added", course });
});

module.exports = router;
