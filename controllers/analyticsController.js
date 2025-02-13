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

// ✅ Function to fetch KPI data
exports.getKPIAnalytics = catchAsync(async (req, res, next) => {
  const { userId, cameraId, startDate, endDate } = req.query;

  if (!userId || !cameraId || !startDate || !endDate) {
    return next(new AppError("User ID, Camera ID, and Date Range are required", 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const numDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

  // ✅ Fetch analytics data for the selected range
  const analytics = await VisitorAnalytics.find({
    userId,
    cameraId,
    date: { $gte: start, $lte: end },
  });

  if (!analytics.length) {
    return res.status(200).json({
      status: "success",
      data: {
        avgVisitorsPerDay: 0,
        avgVisitorsChange: 0,
        peakHour: "N/A",
        peakHourVisitors: 0,
        peakHourChange: 0,
        dwellTime: "0m",
        dwellTimeChange: 0,
        returningVisitors: "0%",
        returningVisitorsChange: 0,
      },
    });
  }

  // ✅ Calculate Total Visitors
  const totalVisitors = analytics.reduce((sum, entry) => sum + entry.totalVisitors, 0);
  const avgVisitorsPerDay = Math.round(totalVisitors / numDays);

  // ✅ Fetch previous period analytics (same number of days before startDate)
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - numDays);
  const prevEnd = new Date(end);
  prevEnd.setDate(prevEnd.getDate() - numDays);

  const prevAnalytics = await VisitorAnalytics.find({
    userId,
    cameraId,
    date: { $gte: prevStart, $lte: prevEnd },
  });

  const prevTotalVisitors = prevAnalytics.reduce((sum, entry) => sum + entry.totalVisitors, 0);
  const prevAvgVisitorsPerDay = prevTotalVisitors > 0 ? Math.round(prevTotalVisitors / numDays) : 0;
  const avgVisitorsChange = prevAvgVisitorsPerDay
    ? ((avgVisitorsPerDay - prevAvgVisitorsPerDay) / prevAvgVisitorsPerDay) * 100
    : 0;

  // ✅ Find Peak Hour & Average Visitors in that Hour
  const hourMap = {};
  analytics.forEach((entry) => {
    entry.visitorTrend.forEach(({ time, count }) => {
      hourMap[time] = (hourMap[time] || 0) + count;
    });
  });

  const peakHour = Object.keys(hourMap).reduce((a, b) => (hourMap[a] > hourMap[b] ? a : b), "N/A");
  const peakHourVisitors = peakHour !== "N/A" ? Math.round(hourMap[peakHour] / numDays) : 0;

  // ✅ Find previous period peak hour & its avg visitors
  const prevHourMap = {};
  prevAnalytics.forEach((entry) => {
    entry.visitorTrend.forEach(({ time, count }) => {
      prevHourMap[time] = (prevHourMap[time] || 0) + count;
    });
  });

  const prevPeakHour = Object.keys(prevHourMap).reduce((a, b) => (prevHourMap[a] > prevHourMap[b] ? a : b), "N/A");
  const prevPeakHourVisitors = prevPeakHour !== "N/A" ? Math.round(prevHourMap[prevPeakHour] / numDays) : 0;

  const peakHourChange = prevPeakHourVisitors
    ? ((peakHourVisitors - prevPeakHourVisitors) / prevPeakHourVisitors) * 100
    : 0;

  // ✅ Calculate Average Dwell Time
  const totalDwellTimes = analytics.map((entry) =>
    parseInt(entry.avgDwellTime.split("m")[0]) * 60 + parseInt(entry.avgDwellTime.split(" ")[1].replace("s", ""))
  );

  const avgDwellTime = totalDwellTimes.length
    ? Math.round(totalDwellTimes.reduce((a, b) => a + b, 0) / totalDwellTimes.length)
    : 0;

  const prevDwellTimes = prevAnalytics.map((entry) =>
    parseInt(entry.avgDwellTime.split("m")[0]) * 60 + parseInt(entry.avgDwellTime.split(" ")[1].replace("s", ""))
  );

  const prevAvgDwellTime = prevDwellTimes.length
    ? Math.round(prevDwellTimes.reduce((a, b) => a + b, 0) / prevDwellTimes.length)
    : 0;

  const dwellTimeChange = prevAvgDwellTime
    ? ((avgDwellTime - prevAvgDwellTime) / prevAvgDwellTime) * 100
    : 0;

  // ✅ Calculate Returning Visitors
  const totalReturning = analytics.reduce(
    (sum, entry) => sum + (entry.visitorSegmentation.find((v) => v.category === "Returning Visitors")?.count || 0),
    0
  );

  const totalSegmented = analytics.reduce((sum, entry) => sum + entry.totalVisitors, 0);

  const returningVisitors = totalSegmented ? Math.round((totalReturning / totalSegmented) * 100) + "%" : "0%";

  const prevTotalReturning = prevAnalytics.reduce(
    (sum, entry) => sum + (entry.visitorSegmentation.find((v) => v.category === "Returning Visitors")?.count || 0),
    0
  );

  const prevTotalSegmented = prevAnalytics.reduce((sum, entry) => sum + entry.totalVisitors, 0);
  const prevReturningVisitors = prevTotalSegmented
    ? Math.round((prevTotalReturning / prevTotalSegmented) * 100)
    : 0;

  const returningVisitorsChange = prevReturningVisitors
    ? ((parseInt(returningVisitors) - prevReturningVisitors) / prevReturningVisitors) * 100
    : 0;

  // ✅ Send Final KPI Data
  res.status(200).json({
    status: "success",
    data: {
      avgVisitorsPerDay,
      avgVisitorsChange,
      peakHour,
      peakHourVisitors,
      peakHourChange,
      dwellTime: `${Math.floor(avgDwellTime / 60)}m ${avgDwellTime % 60}s`,
      dwellTimeChange,
      returningVisitors,
      returningVisitorsChange,
    },
  });
});


// ✅ Function to fetch hourly visitor trends
exports.getVisitorTrends = catchAsync(async (req, res, next) => {
  const { userId, cameraId, startDate, endDate } = req.query;

  if (!userId || !cameraId || !startDate || !endDate) {
    return next(new AppError("User ID, Camera ID, and Date Range are required", 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const numDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

  // ✅ Fetch current period analytics
  const currentAnalytics = await VisitorAnalytics.find({
    userId,
    cameraId,
    date: { $gte: start, $lte: end },
  });

  // ✅ Compute total visitors per hour for current period
  let currentHourMap = {};
  currentAnalytics.forEach((entry) => {
    entry.visitorTrend.forEach(({ time, count }) => {
      currentHourMap[time] = (currentHourMap[time] || 0) + count;
    });
  });

  // ✅ Convert to average per hour
  Object.keys(currentHourMap).forEach((hour) => {
    currentHourMap[hour] = Math.round(currentHourMap[hour] / numDays);
  });

  // ✅ Fetch previous period analytics (same duration before start date)
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - numDays);
  const prevEnd = new Date(end);
  prevEnd.setDate(prevEnd.getDate() - numDays);

  const prevAnalytics = await VisitorAnalytics.find({
    userId,
    cameraId,
    date: { $gte: prevStart, $lte: prevEnd },
  });

  // ✅ Compute total visitors per hour for previous period
  let prevHourMap = {};
  prevAnalytics.forEach((entry) => {
    entry.visitorTrend.forEach(({ time, count }) => {
      prevHourMap[time] = (prevHourMap[time] || 0) + count;
    });
  });

  // ✅ Convert to average per hour
  Object.keys(prevHourMap).forEach((hour) => {
    prevHourMap[hour] = Math.round(prevHourMap[hour] / numDays);
  });

  // ✅ Prepare final response with % change
  let visitorTrends = [];
  const allHours = new Set([...Object.keys(currentHourMap), ...Object.keys(prevHourMap)]);

  allHours.forEach((hour) => {
    const currentVisitors = currentHourMap[hour] || 0;
    const previousVisitors = prevHourMap[hour] || 0;
    const change = previousVisitors
      ? ((currentVisitors - previousVisitors) / previousVisitors) * 100
      : 0;

    visitorTrends.push({
      hour,
      visitors: currentVisitors,
      change: parseFloat(change.toFixed(2)),
    });
  });

  res.status(200).json({
    status: "success",
    data: {
      currentPeriod: visitorTrends,
      previousPeriod: Object.keys(prevHourMap).map((hour) => ({
        hour,
        visitors: prevHourMap[hour],
      })),
    },
  });
});

// ✅ Fetch Average Visitors Per Day by Gender
exports.getAvgVisitorsByGender = catchAsync(async (req, res, next) => {
  const { userId, cameraId, startDate, endDate } = req.query;

  if (!userId || !cameraId || !startDate || !endDate) {
    return next(new AppError("User ID, Camera ID, and Date Range are required", 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const numDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1; // Ensure at least 1 day

  // ✅ Fetch gender distribution data from DB
  const analytics = await VisitorAnalytics.find({
    userId,
    cameraId,
    date: { $gte: start, $lte: end },
  });

  if (!analytics.length) {
    return res.status(200).json({
      status: "success",
      data: {
        avgMalePerDay: 0,
        avgFemalePerDay: 0,
        avgOtherPerDay: 0,
      },
    });
  }

  // ✅ Calculate total gender-wise counts
  let totalMale = 0;
  let totalFemale = 0;
  let totalOther = 0; // If you later add other genders

  analytics.forEach((entry) => {
    totalMale += entry.maleVisitors;
    totalFemale += entry.femaleVisitors;
  });

  // ✅ Compute the averages per day
  const avgMalePerDay = Math.round(totalMale / numDays);
  const avgFemalePerDay = Math.round(totalFemale / numDays);

  // ✅ Send the Response
  res.status(200).json({
    status: "success",
    data: {
      avgMalePerDay,
      avgFemalePerDay,
      avgOtherPerDay: 0, // Keeping structure for future extension
    },
  });
});
