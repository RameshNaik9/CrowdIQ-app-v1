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
      default: Date.now,
      index: true, // ✅ Faster queries for daily logs
    },
    logs: [
      {
        tracking_id: { type: String, required: true },
        gender: { type: String, required: true },
        age: { type: String, required: true },
        time_spent: { type: Number, required: true }, // Time spent in seconds
        first_appearance: { type: Date, required: true },
        last_appearance: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Indexes for optimized queries
RawDataLogSchema.index({ cameraId: 1, date: -1 });
RawDataLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("RawDataLog", RawDataLogSchema);
