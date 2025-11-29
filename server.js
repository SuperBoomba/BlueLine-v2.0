const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { connectToDB } = require("./db/mongo"); // ✅ שינוי לפי המבנה שלך
const courseRoutes = require("./routes/courseRoutes");
const tripRoutes = require("./routes/tripRoutes");

// 🟢 טעינת משתני סביבה
dotenv.config({ path: "./.env" });

// 🟢 התחברות ל-MongoDB
connectToDB(mongoose)
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

const app = express();
const server = http.createServer(app);

// 💡 הגדרת CORS מפושטת: יצירת אובייקט CORS Options
// הכתובת של ה-Frontend שלך ב-Render היא: https://blueline-yyzo.onrender.com/
const allowedOrigins = [
  "http://localhost:3000", // כתובת הפיתוח המקומית
  "https://blueline-yyzo.onrender.com", // כתובת ה-Frontend המפרוס
];

const corsOptions = {
  origin: allowedOrigins, // מאפשר גישה רק מהכתובות המאושרות
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // חיוני לשליחת cookies
};

const io = new Server(server, {
  cors: corsOptions, // השתמש בהגדרות המפורשות עבור Socket.io
});

// 🟢 Middleware
app.set("trust proxy", 1);
app.use(express.json());

// 💡 שימוש בהגדרת CORS המפושטת לאפליקציית אקספרס
app.use(cors(corsOptions));

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "יותר מדי בקשות מה-IP הזה, נסה שוב מאוחר יותר.",
});
app.use(limiter);
app.use(morgan("combined"));

// 🟢 Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const surfRoutes = require("./routes/surf");

app.use("/api/trips", tripRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/surf", surfRoutes);

// 🟢 Routes פורום
const forumRoutes = require("./routes/forumRoutes");
app.use("/api/forums", forumRoutes); // כל ה-Forum API יהיה כאן

// 🟢 Route בסיסי
app.get("/", (req, res) => res.send("🌊 BlueLine API is running..."));

// 🟢 WebSocket Events
io.on("connection", (socket) => {
  console.log("🔗 משתמש התחבר");

  socket.on("disconnect", () => {
    console.log("❌ משתמש התנתק");
  });

  socket.on("newMessage", (data) => {
    console.log("📩 הודעה חדשה:", data);
    io.emit("newMessage", data);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
