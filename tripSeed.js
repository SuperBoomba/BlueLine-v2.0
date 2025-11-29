const mongoose = require("mongoose");
const Trip = require("./models/Trip"); // ודא שהנתיב למודל נכון
const dotenv = require("dotenv");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo connected"))
  .catch((err) => console.error("❌ Mongo connection error:", err));

const trips = [
  {
    title: "טיול גלישה בסרי לנקה",
    location: "סרי לנקה",
    startDate: new Date("2025-11-10"),
    endDate: new Date("2025-11-20"),
    season: "חורף",
    price: 4500,
    description:
      "טיול גלישה חווייתי בסרי לנקה הכולל לינה, הדרכה מקצועית, טיולים בטבע וגלישה באחד החופים הטובים בעולם.",
    image: "/images/sri-lanka.jpg",
    maxPeople: 10,
    registeredCount: 0,
  },
  {
    title: "חופשת גלישה במרוקו",
    location: "מרוקו",
    startDate: new Date("2025-12-05"),
    endDate: new Date("2025-12-12"),
    season: "חורף",
    price: 3900,
    description:
      "הצטרפו לטיול למרוקו עם שיעורי גלישה יומיים, טיולים במדבר ובשווקים המקומיים, ואווירה מדהימה של גולשים מכל העולם.",
    image: "/images/morocco.jpg",
    maxPeople: 8,
    registeredCount: 0,
  },
  {
    title: "קורס גלישה מתקדם בפורטוגל",
    location: "אריסיירה, פורטוגל",
    startDate: new Date("2026-01-15"),
    endDate: new Date("2026-01-22"),
    season: "חורף",
    price: 4200,
    description:
      "קורס גלישה מתקדם בקבוצה קטנה עם מאמן אישי, מתאים לגולשים שרוצים להשתפר ברמה הטכנית באחד מאתרי הגלישה המובילים באירופה.",
    image: "/images/portugal.jpg",
    maxPeople: 6,
    registeredCount: 0,
  },
];

async function seedTrips() {
  try {
    await Trip.deleteMany(); // מוחק קודם את כל הנתונים הישנים
    await Trip.insertMany(trips);
    console.log("✅ Trips seeded successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedTrips();
