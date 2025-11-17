const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { protect } = require("../middleware/protectRoute");
const admin = require("../middleware/admin");

// CREATE — יצירת משתמש חדש (Admin בלבד)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ — כל המשתמשים (Admin בלבד)
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ — משתמש לפי אימייל (Admin בלבד)
router.get("/:email", protect, admin, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select(
      "-password"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE — עדכון משתמש (Admin בלבד)
router.put("/:email", protect, admin, async (req, res) => {
  try {
    const { name, role } = req.body;

    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { name, role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE — מחיקת משתמש (Admin בלבד)
router.delete("/:email", protect, admin, async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({ email: req.params.email });

    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.json(deleted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BAN / UNBAN — חסימת משתמש או הורדת חסימה (Admin בלבד)
router.put("/:id/ban", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      message: `User is now ${user.isBanned ? "banned" : "unbanned"}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// הפיכת משתמש לאדמין (Admin בלבד)
router.put("/:id/make-admin", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    await user.save();

    res.json({ message: "User is now admin", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
