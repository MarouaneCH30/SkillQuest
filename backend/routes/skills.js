const express = require("express");
const router = express.Router();
const db = require("../models/db");

// Create a new skill
router.post("/skills", async (req, res) => {
  const { user_id, name } = req.body;

  if (!user_id || !name) {
    return res.status(400).json({ message: "user_id and name are required" });
  }

  try {
    const [result] = await db
      .promise()
      .query("INSERT INTO skills (user_id, name) VALUES (?, ?)", [user_id, name]);

    res.status(201).json({ message: "Skill created", skillId: result.insertId });
  } catch (err) {
    console.error("Create skill error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all skills for a user
router.get("/skills/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM skills WHERE user_id = ?", [userId]);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Get skills error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new subskill
router.post("/skills/:skillId/subskills", async (req, res) => {
  const { skillId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Subskill name is required" });
  }

  try {
    const [result] = await db
      .promise()
      .query("INSERT INTO subskills (skill_id, name) VALUES (?, ?)", [skillId, name]);

    res.status(201).json({ message: "Subskill created", subskillId: result.insertId });
  } catch (err) {
    console.error("Create subskill error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get subskills for a skill
router.get("/skills/:skillId/subskills", async (req, res) => {
  const { skillId } = req.params;

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM subskills WHERE skill_id = ?", [skillId]);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Get subskills error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Update XP for a subskill
router.post("/skills/subskills/:subskillId/xp", async (req, res) => {
  const { subskillId } = req.params;
  const { xp } = req.body;

  if (!xp) {
    return res.status(400).json({ message: "XP is required" });
  }

  try {
    const [result] = await db
      .promise()
      .query("UPDATE subskills SET xp = COALESCE(xp, 0) + ? WHERE id = ?", [xp, subskillId]);

    res.status(200).json({ message: "XP updated" });
  } catch (err) {
    console.error("Update XP error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
