const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("MongoDB Error:", err.message);
    process.exit(1); // יציאה אם כשל (בטיחות קריסה)
  }
};

module.exports = connectDB;
