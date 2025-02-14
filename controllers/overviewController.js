const mongoose = require("mongoose");
const VisitorAnalytics = require("../models/VisitorAnalytics");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverviewAnalytics = catchAsync(async (req, res, next) => {
  const { userId, cameraId, startDate, endDate } = req.query;

  // ✅ Validate required parameters
  if (!userId || !cameraId || !startDate || !endDate) {
    return next(new AppError("User ID, Camera ID, and Date Range are required", 400));
  }

  // ✅ Normalize `startDate` & `endDate`
  const start = new Date(startDate);
  const end = new Date(endDate);
  const numDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1; // Ensure at least 1 day

  try {
    // ✅ Query the database
    const analytics = await VisitorAnalytics.find({
      userId,
      cameraId,
      date: { $gte: start, $lte: end },
    });

    if (!analytics.length) {
      return res.status(200).json({
        status: "success",
        data: {
          totalVisitors: 0,
          avgMalePerDay: 0,
          avgFemalePerDay: 0,
          avgDwellTime: "0m",
          avgAge: 0,
          visitorTrend: [],
          genderDistribution: [],
          ageDistribution: [],
          dwellTimeDistribution: [],
        },
      });
    }

    // ✅ Calculate total visitors
    let totalVisitors = 0;
    let totalMale = 0;
    let totalFemale = 0;
    let totalDwellTime = 0;
    let totalAge = 0;
    let dwellTimeEntries = 0;

    // ✅ Visitor Trend & Age Distribution
    let visitorTrend = [];
    let ageDistribution = {};

    analytics.forEach((entry) => {
      totalVisitors += entry.totalVisitors;
      totalMale += entry.maleVisitors;
      totalFemale += entry.femaleVisitors;

      // ✅ Calculate Dwell Time (Convert "m s" format to total seconds)
      const [minutes, seconds] = entry.avgDwellTime.split("m").map((t) => parseInt(t, 10) || 0);
      totalDwellTime += minutes * 60 + seconds;
      dwellTimeEntries++;

      // ✅ Calculate Age Distribution
      totalAge += entry.avgAge || 0;

      entry.ageDistribution.forEach(({ name, count }) => {
        ageDistribution[name] = (ageDistribution[name] || 0) + count;
      });

      // ✅ Visitor Trend (Hourly Data)
      entry.visitorTrend.forEach(({ time, count }) => {
        const trendIndex = visitorTrend.findIndex((t) => t.time === time);
        if (trendIndex !== -1) {
          visitorTrend[trendIndex].count += count;
        } else {
          visitorTrend.push({ time, count });
        }
      });
    });

    // ✅ Compute Averages
    const avgMalePerDay = Math.round(totalMale / numDays);
    const avgFemalePerDay = Math.round(totalFemale / numDays);
    const avgDwellTime = dwellTimeEntries ? `${Math.floor(totalDwellTime / dwellTimeEntries / 60)}m ${totalDwellTime % 60}s` : "0m";
    const avgAge = dwellTimeEntries ? Math.round(totalAge / dwellTimeEntries) : 0;

    // ✅ Format Age Distribution
    const formattedAgeDistribution = Object.keys(ageDistribution).map((key) => ({
      name: key,
      count: ageDistribution[key],
    }));

    // ✅ Prepare Gender Distribution
    const genderDistribution = [
      { name: "Male", value: totalMale },
      { name: "Female", value: totalFemale },
    ];

    // ✅ Prepare Dwell Time Distribution (Example: Using visitor count per time)
    const dwellTimeDistribution = analytics.flatMap((entry) => entry.dwellTimeDistribution);

    // ✅ Send Response
    res.status(200).json({
      status: "success",
      data: {
        totalVisitors,
        avgMalePerDay,
        avgFemalePerDay,
        avgDwellTime,
        avgAge,
        visitorTrend,
        genderDistribution,
        ageDistribution: formattedAgeDistribution,
        dwellTimeDistribution,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching overview analytics:", error);
    return next(new AppError("Internal Server Error", 500));
  }
});
