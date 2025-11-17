const User = require("../models/User"); // ← תיקון: models ולא model
const jwt = require("jsonwebtoken");

// יצירת טוקן
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// רישום משתמש חדש
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // בדיקה אם משתמש קיים
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // יצירת המשתמש
    const user = await User.create({ name, email, password });

    // החזרת פרטי המשתמש + ROLE + TOKEN
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // ← חובה בשביל Admin
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// התחברות משתמש
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // בדיקת אימייל וסיסמה
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // החזרת פרטים + ROLE + TOKEN
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
