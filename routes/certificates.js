const express = require("express");
const router = express.Router();
const path = require("path");
const { generateCertificate } = require("../helpers/certificate");
const { readJSON } = require("../helpers/db");

// POST /api/cert/generate
router.post("/generate", (req, res) => {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) return res.status(400).json({ error: "Missing fields" });

    // load user and course data
    const users = readJSON("users.json");
    const courses = readJSON("courses.json");

    // validate user and course
    const user = users.find(u => u.id === userId);
    const course = courses.find(c => c.id === courseId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!course) return res.status(404).json({ error: "Course not found" });

    // check if user enrolled in the course
    const student = (course.students || []).find(s => s.userId === userId);
    if (!student) return res.status(403).json({ error: "You must buy the course to get a certificate" });
    if (!student.unlocked) return res.status(403).json({ error: "Course not unlocked for this user" });

    // making unique certificate ID and generating PDF
    const certId = `${userId}_${courseId}_${Date.now()}`;
    const pdfPath = generateCertificate(
        user.name,
        course.title,
        certId,
        course.duration || "4 HOURS",
        new Date().toDateString()
    );

    // send response with certificate URL
    res.json({
        message: "Certificate generated successfully",
        url: pdfPath
    });
});

// serve the PDF file
// GET /api/cert/:certId
router.get("/:certId", (req, res) => {
    const { certId } = req.params;
    const filePath = path.join(__dirname, "../certificates", `${certId}.pdf`);
    res.sendFile(filePath);
});

module.exports = router;
