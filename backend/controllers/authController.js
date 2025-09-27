const db = require("../models/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const sendVerificationEmail = require("../utils/sendVerificationEmail");

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, email, password } = req.body;

  try {
    const [existingUser] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      const user = existingUser[0];

      if (!user.is_verified) {
        return res.status(409).json({
          message: "User already exists but email is not verified. Please check your inbox.",
        });
      }

      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString("hex");

    await db.promise().query(
      "INSERT INTO users (name, email, password, verification_token, is_verified) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, token, false]
    );

    await sendVerificationEmail(email, token);

    res
      .status(201)
      .json({ message: "Verification email sent. Please check your inbox." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  try {
    const [userRows] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (userRows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userRows[0];

    if (!user.is_verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser };
