const mongoose = require("mongoose");

const VisitorAnalyticsSchema = new mongoose.Schema(
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
      index: true, // ✅ Index for fast queries
    },
    totalVisitors: { type: Number, required: true },
    maleVisitors: { type: Number, required: true },
    femaleVisitors: { type: Number, required: true },
    avgDwellTime: { type: String, required: true }, // Example: "14m 32s"
    avgAge: { type: Number, required: true }, // Example: 29 (years)
    visitorTrend: [{ time: String, count: Number }], // Hourly data
    genderDistribution: [{ name: String, value: Number }], // Male, Female
    ageDistribution: [{ name: String, count: Number }], // Age groups
    dwellTimeDistribution: [{ time: String, count: Number }], // Dwell times
  },
  { timestamps: true }
);

// ✅ **Indexes for optimized queries**
VisitorAnalyticsSchema.index({ cameraId: 1, date: -1 });
VisitorAnalyticsSchema.index({ userId: 1 });

module.exports = mongoose.model("VisitorAnalytics", VisitorAnalyticsSchema);
