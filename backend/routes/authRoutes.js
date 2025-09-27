const express = require("express");
const router = express.Router();
const db = require("../models/db");
const { registerUser, loginUser } = require("../controllers/authController");
const validateRegister = require("../middleware/validateRegister");

// Register route with validation
router.post("/register", validateRegister, registerUser);

// Login route (basic)
router.post("/login", loginUser);

// Email verification route
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Verification token is missing" });
  }

  try {
    // Find user by verification token
    const [userRows] = await db
      .promise()
      .query("SELECT * FROM users WHERE verification_token = ?", [token]);

    if (userRows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update user to verified
    await db
      .promise()
      .query(
        "UPDATE users SET is_verified = ?, verification_token = NULL WHERE id = ?",
        [true, userRows[0].id]
      );

    res.send("✅ Email verified! You can now log in.");
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
