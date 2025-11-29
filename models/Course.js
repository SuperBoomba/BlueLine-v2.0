const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ["מתחילים", "ביניים", "מתקדמים", "כל הרמות"],
    required: true,
  },
  price: { type: Number, required: true },

  duration: { type: String },
  description: { type: String },
  image: { type: String },

  minAge: { type: Number, default: 10 },
  maxAge: { type: Number, default: 70 },

  includes: [
    {
      type: String, // לדוגמה: "טיסות", "מלון", "השכרת גלשן"
    },
  ],

  maxParticipants: { type: Number, default: 12 },
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      registeredAt: { type: Date, default: Date.now },
    },
  ],

  isFull: { type: Boolean, default: false },
});

courseSchema.methods.checkIfFull = function () {
  this.isFull = this.participants.length >= this.maxParticipants;
  return this.isFull;
};

module.exports = mongoose.model("Course", courseSchema);
