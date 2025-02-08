const mongoose = require("mongoose");
const VisitorAnalytics = require("../models/VisitorAnalytics");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAnalytics = catchAsync(async (req, res, next) => {
  const { cameraId, startDate, endDate } = req.query;

  // ✅ Validate required parameters
  if (!cameraId || !startDate || !endDate) {
    return next(new AppError("Camera ID and Date Range are required", 400));
  }

  try {
    // ✅ Convert `cameraId` to ObjectId
    const cameraObjectId = new mongoose.Types.ObjectId(cameraId);

    // ✅ Normalize `startDate` & `endDate` to cover the entire day (UTC)
    const startDateTime = new Date(startDate);
    startDateTime.setUTCHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setUTCHours(23, 59, 59, 999);

    console.log(`🔍 Fetching analytics for Camera: ${cameraId}`);
    console.log(`📅 Start Date: ${startDateTime.toISOString()}`);
    console.log(`📅 End Date: ${endDateTime.toISOString()}`);

    // ✅ Query MongoDB with formatted date range
    const analytics = await VisitorAnalytics.find({
      cameraId: cameraObjectId,
      date: { $gte: startDateTime, $lte: endDateTime },
    }).sort({ date: -1 });

    console.log(`✅ Found ${analytics.length} records`);

    // ✅ Return response
    res.status(200).json({ status: "success", data: analytics });
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    return next(new AppError("Internal Server Error", 500));
  }
});


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
  } = req.body;

  if (!userId || !cameraId || !date) {
    return next(new AppError("User ID, Camera ID, and Date are required", 400));
  }

  let analytics = await VisitorAnalytics.findOne({ cameraId, date });

  if (analytics) {
    Object.assign(analytics, req.body);
  } else {
    analytics = new VisitorAnalytics(req.body);
  }

  await analytics.save();

  res.status(201).json({
    status: "success",
    message: "Analytics data stored successfully!",
    data: analytics,
  });
});
