const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User"); // ודא שיש require ל-User Model

const router = express.Router();

const verifyRecaptcha = async (captchaValue, req) => {
  if (!captchaValue) {
    // אם אין ערך, זרוק שגיאה שתוביל לקוד 400
    throw new Error("אנא אשר שאינך רובוט לפני ההתחברות");
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        timeout: 5000, // 💡 טיפול ב-Timeout של הרשת
        params: {
          // המפתח הסודי נשלף ממשתני הסביבה ב-Render
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaValue,
          remoteip: req.ip,
        },
      }
    );

    if (!response.data.success) {
      console.log("Google Error Codes:", response.data["error-codes"]);
      throw new Error(
        `reCAPTCHA failed: ${
          response.data["error-codes"]?.join(", ") || "unknown"
        }`
      );
    }
  } catch (err) {
    console.error("ReCAPTCHA Verification Error:", err.message);
    throw new Error("שגיאה קריטית באימות reCAPTCHA. אנא נסה שוב.");
  }
};

// --- POST /api/register (הרשמה) ---
router.post("/register", async (req, res) => {
  const { name, email, password, role, captchaValue } = req.body;

  try {
    await verifyRecaptcha(captchaValue, req); // הפעלת בדיקת reCAPTCHA

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
    if (err.message.includes("רובוט") || err.message.includes("reCAPTCHA")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
});

// --- POST /api/login (התחברות) ---
router.post("/login", async (req, res) => {
  const { email, password, captchaValue } = req.body;

  try {
    await verifyRecaptcha(captchaValue, req); // הפעלת בדיקת reCAPTCHA

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
    if (err.message.includes("רובוט") || err.message.includes("reCAPTCHA")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "שגיאת שרת פנימית", error: err.message });
  }
});

module.exports = router;
