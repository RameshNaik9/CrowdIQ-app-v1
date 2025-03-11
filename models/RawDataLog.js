// models/RawDataLog.js
const mongoose = require("mongoose");

const RawDataLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cameraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camera",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true, // Index for faster queries
    },
    logs: [
      {
        tracking_id: { type: String, required: true },
        gender: { type: String, required: true },
        age: { type: String, required: true },
        time_spent: { type: Number, required: true },
        first_appearance: { type: Date, required: true },
        last_appearance: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Enforce uniqueness on userId, cameraId, and normalized date
RawDataLogSchema.index({ userId: 1, cameraId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("RawDataLog", RawDataLogSchema);
