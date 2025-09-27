// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./models/db");

const authRoutes = require("./routes/authRoutes");
const skillsRoutes = require("./routes/skills"); // ✅ Only once

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Route setup
app.use("/api", authRoutes);     // Handles /api/register and /api/login
app.use("/api", skillsRoutes);   // Handles /api/skills

app.get("/", (req, res) => {
  res.send("SkillQuest backend is running 🎯");
});

app.use("/api", require("./routes/skills"));


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
