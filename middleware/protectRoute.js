const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    // חייב להיות בפורמט: "Bearer xxxxx"
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    token = token.split(" ")[1]; // מוריד את "Bearer "

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // פה נשמר האובייקט למידלוואר admin
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token is invalid" });
  }
};

module.exports = { protect };
