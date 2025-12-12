const express = require("express");
const router = express.Router();
const path = require("path");
const { generateCertificate } = require("../helpers/certificate");
const { readJSON } = require("../helpers/db");

// POST /api/cert/generate  { userId, courseId }
// from server.js
router.post("/generate", (req, res) => {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) return res.status(400).json({ error: "Missing fields" });

    const users = readJSON("users.json");
    const courses = readJSON("courses.json");

    const user = users.find(u => u.id === userId);
    const course = courses.find(c => c.id === courseId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const student = (course.students || []).find(s => s.userId === userId);
    if (!student) return res.status(403).json({ error: "You must buy the course to get a certificate" });
    if (!student.unlocked) return res.status(403).json({ error: "Course not unlocked for this user" });

    const certId = `${userId}_${courseId}_${Date.now()}`;
    const pdfPath = generateCertificate(user.name, course.title, certId, course.duration || "2 HOURS", new Date().toDateString());

    // Optionally you can persist a certificates.json record (id, userId, courseId, url)
    res.json({ message: "Certificate generated successfully", url: pdfPath });
});


// serve the PDF file
router.get("/:certId", (req, res) => {
    const { certId } = req.params;
    const filePath = path.join(__dirname, "../certificates", `${certId}.pdf`);
    res.sendFile(filePath);
});

module.exports = router;
