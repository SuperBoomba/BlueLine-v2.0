const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const authMiddleware = require("../middleware/authMiddleware");

// ------------------
// GET – כל הקורסים
// ------------------
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------
// GET – קורס לפי ID
// ------------------
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------
// POST – הרשמה לקורס (רק משתמש מחובר)
// ------------------
router.post("/:id/enroll", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: "Course not found" });

    // האם מלא?
    if (course.participants.length >= course.maxParticipants) {
      return res.status(400).json({ message: "הקורס מלא" });
    }

    // האם המשתמש כבר רשום?
    const exists = course.participants.some(
      (p) => p.userId.toString() === userId
    );
    if (exists) {
      return res.status(400).json({ message: "אתה כבר רשום לקורס זה" });
    }

    // הוספת המשתתף
    course.participants.push({ userId });
    course.checkIfFull();
    await course.save();

    res.json({ message: "נרשמת בהצלחה!", course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------
// GET – סטטוס קורס
// ------------------
router.get("/:id/status", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: "Course not found" });

    const isFull = course.participants.length >= course.maxParticipants;

    res.json({
      isFull,
      participants: course.participants.length,
      maxParticipants: course.maxParticipants,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
