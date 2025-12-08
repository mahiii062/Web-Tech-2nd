const fs = require("fs");
const path = require("path");

function readJSON(filename) {
  const p = path.join(__dirname, "..", "data", filename);
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, JSON.stringify([], null, 2));
  }
  const raw = fs.readFileSync(p, "utf8");
  try {
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

function writeJSON(filename, obj) {
  const p = path.join(__dirname, "..", "data", filename);
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

module.exports = { readJSON, writeJSON };
