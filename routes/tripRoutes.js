const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const authMiddleware = require("../middleware/authMiddleware");

// ------------------
// GET – כל הטיולים
// ------------------
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------
// GET – טיול לפי ID
// ------------------
router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------
// POST – הרשמה לטיול
// ------------------
router.post("/:id/register", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // אם הטיול מלא
    if (trip.participants.length >= trip.maxParticipants) {
      return res.status(400).json({ message: "הטיול מלא ואין מקומות פנויים" });
    }

    // אם המשתמש כבר רשום
    const already = trip.participants.some(
      (p) => p.userId.toString() === userId
    );
    if (already) {
      return res.status(400).json({ message: "אתה כבר רשום לטיול הזה" });
    }

    // הוספת המשתמש
    trip.participants.push({ userId });
    trip.checkIfFull();
    await trip.save();

    res.json({ message: "נרשמת בהצלחה!", trip });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------
// GET – בדיקת סטטוס מלא/פנוי
// ------------------
router.get("/:id/status", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const isFull = trip.participants.length >= trip.maxParticipants;

    res.json({
      isFull,
      participants: trip.participants.length,
      maxParticipants: trip.maxParticipants,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
