// backend/db/mongo.js (קוד מתוקן)

const mongoose = require("mongoose");
let dbConnection; // ניתן להשתמש בזה אם יש לך לוגיקה מורכבת שדורשת את ה-Connection Object

const connectToDB = async () => {
  try {
    // 🟢 תיקון: שימוש ב-MONGO_URI במקום בכתובת המקומית
    dbConnection = await mongoose.connect(process.env.MONGO_URI, {
      // 💡 הסרת אפשרויות דפוקות כדי למנוע אזהרות ובעיות
    });
    console.log("✅ Connected to MongoDB");
    return dbConnection;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message); // מומלץ: לעצור את התהליך אם החיבור נכשל בפריסה // process.exit(1);
  }
};

const getDB = () => dbConnection;

module.exports = { connectToDB, getDB };
