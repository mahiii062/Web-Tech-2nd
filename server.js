const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const bankRoutes = require("./routes/bank");
const learnerRoutes = require("./routes/learner");
const instructorRoutes = require("./routes/instructor");
const certificateRoutes = require("./routes/certificates");

const app = express();

/* -------------------------
   MIDDLEWARES (VERY IMPORTANT)
------------------------- */

// Body parsers ― MUST be before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

/* -------------------------
        API ROUTES 
------------------------- */

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/learner", learnerRoutes);
app.use("/api/instructor", instructorRoutes);

// Certificate API (PDF generator)
app.use("/api/cert", certificateRoutes);

/* -------------------------
        FRONTEND FALLBACK
------------------------- */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* -------------------------
         START SERVER
------------------------- */

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`LMS server running at http://localhost:${PORT}`);
});
