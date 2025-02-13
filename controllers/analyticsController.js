const VisitorAnalytics = require("../models/VisitorAnalytics");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// ✅ Fetch analytics based on camera and date range
exports.getAnalytics = catchAsync(async (req, res, next) => {
  const { cameraId, startDate, endDate } = req.query;

  if (!cameraId || !startDate || !endDate) {
    return next(new AppError("Camera ID and Date Range are required", 400));
  }

  const analytics = await VisitorAnalytics.find({
    cameraId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).sort({ date: -1 });

  res.status(200).json({ status: "success", data: analytics });
});

// ✅ Store analytics (used by Python microservice or batch processing)
exports.storeAnalytics = catchAsync(async (req, res, next) => {
  const {
    userId,
    cameraId,
    date,
    totalVisitors,
    maleVisitors,
    femaleVisitors,
    avgDwellTime,
    avgAge,
    visitorTrend,
    genderDistribution,
    ageDistribution,
    dwellTimeDistribution,
    entryExitFlow,
    visitorSegmentation,
    aiInsights,
  } = req.body;

  if (!userId || !cameraId || !date) {
    return next(new AppError("User ID, Camera ID, and Date are required", 400));
  }

  // Check if analytics already exist for this date & camera
  let analytics = await VisitorAnalytics.findOne({ cameraId, date });

  if (analytics) {
    // ✅ If data exists, update it
    Object.assign(analytics, req.body);
  } else {
    // ✅ Else, create a new entry
    analytics = new VisitorAnalytics(req.body);
  }

  await analytics.save();

  res.status(201).json({
    status: "success",
    message: "Analytics data stored successfully!",
    data: analytics,
  });
});
