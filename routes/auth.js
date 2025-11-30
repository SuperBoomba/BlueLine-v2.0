const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");

const router = express.Router();

// --- POST /api/register (הרשמה) ---
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body; // הוסר captchaValue

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "משתמש כבר קיים עם המייל הזה" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || "user",
    });

    await newUser.save();

    res.status(201).json({
      message: "משתמש נרשם בהצלחה",
      user: { _id: newUser._id, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
});

// --- POST /api/login (התחברות) ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body; // הוסר captchaValue

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "משתמש לא נמצא" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "סיסמה שגויה" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "התחברות הצליחה",
      token,
      user: { _id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ message: "שגיאת שרת פנימית", error: err.message });
  }
});

module.exports = router;
