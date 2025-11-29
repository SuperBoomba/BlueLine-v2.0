const mongoose = require("mongoose");
const Course = require("./models/Course"); // ודא שהנתיב למודל נכון
const dotenv = require("dotenv");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo connected"))
  .catch((err) => console.error("❌ Mongo connection error:", err));

const courses = [
  {
    name: "קורס גלישה למתחילים",
    level: "מתחילים",
    price: 450,
    duration: "4 מפגשים / שעה וחצי כל מפגש",
    description: "לימוד עמידה על הגלשן, תזמון, בטיחות וכניסה נכונה למים.",
    image: "/images/r.jpg",
    maxPeople: 6,
    registeredCount: 0,
  },
  {
    name: "קורס גלישה למתקדמים",
    level: "מתקדמים",
    price: 600,
    duration: "5 מפגשים / שעתיים כל מפגש",
    description: "שיפור טכניקת חיתוך, תמרונים, קריאה נכונה של הגלים.",
    image: "/images/surf-advanced.jpg",
    maxPeople: 6,
    registeredCount: 0,
  },
  {
    name: "קורס גלישת סאפ",
    level: "כל הרמות",
    price: 300,
    duration: "מפגש חד פעמי / שעתיים",
    description: "היכרות עם גלשן סאפ, שיווי משקל, חתירה וגלישה ראשונית.",
    image: "/images/surf-sup.jpg",
    maxPeople: 4,
    registeredCount: 0,
  },
];

async function seedCourses() {
  try {
    await Course.deleteMany(); // מוחק קודם את כל הנתונים הישנים
    await Course.insertMany(courses);
    console.log("✅ Courses seeded successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedCourses();
