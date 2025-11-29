const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  season: {
    type: String,
    enum: ["חורף", "אביב", "קיץ", "סתיו"],
    required: true,
  },

  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },

  maxParticipants: { type: Number, default: 15 }, // כמות מקומות בטיול
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      registeredAt: { type: Date, default: Date.now },
    },
  ],

  isFull: { type: Boolean, default: false },
});

tripSchema.methods.checkIfFull = function () {
  this.isFull = this.participants.length >= this.maxParticipants;
  return this.isFull;
};

module.exports = mongoose.model("Trip", tripSchema);
