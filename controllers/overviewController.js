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
    let totalDwellTime = 0;
    let totalAge = 0;
    let dwellTimeEntries = 0;
    let visitorTrend = [];
    let genderDistribution = [];
    let ageDistribution = {};
    let dwellTimeMap = {
      "0-5m": 0,
      "5-10m": 0,
      "10-20m": 0,
      "20-30m": 0,
      "30-60m": 0,
      "60m+": 0,
    };

    analytics.forEach((entry) => {
      totalVisitors += entry.totalVisitors;

      // ✅ Process Dwell Time
      const [minutes, seconds] = entry.avgDwellTime.split("m").map((t) => parseInt(t, 10) || 0);
      totalDwellTime += minutes * 60 + seconds;
      dwellTimeEntries++;

      // ✅ Process Age Distribution
      totalAge += entry.avgAge || 0;
      entry.ageDistribution.forEach(({ name, count }) => {
        ageDistribution[name] = (ageDistribution[name] || 0) + count;
      });

      // ✅ Process Visitor Trend
      entry.visitorTrend.forEach(({ time, count }) => {
        const trendIndex = visitorTrend.findIndex((t) => t.time === time);
        if (trendIndex !== -1) {
          visitorTrend[trendIndex].count += count;
        } else {
          visitorTrend.push({ time, count });
        }
      });

      // ✅ Process Gender Distribution
      entry.genderDistribution.forEach(({ name, value }) => {
        const existingIndex = genderDistribution.findIndex((g) => g.name === name);
        if (existingIndex !== -1) {
          genderDistribution[existingIndex].value += value;
        } else {
          genderDistribution.push({ name, value });
        }
      });

      // ✅ Aggregate Dwell Time Distribution
      entry.dwellTimeDistribution.forEach(({ time, count }) => {
        if (dwellTimeMap[time] !== undefined) {
          dwellTimeMap[time] += count;
        }
      });
    });

    // ✅ Compute Averages
    const avgDwellTime = dwellTimeEntries
      ? `${Math.floor(totalDwellTime / dwellTimeEntries / 60)}m ${totalDwellTime % 60}s`
      : "0m";
    const avgAge = dwellTimeEntries ? Math.round(totalAge / dwellTimeEntries) : 0;

    // ✅ Format Age Distribution
    const formattedAgeDistribution = Object.keys(ageDistribution).map((key) => ({
      name: key,
      count: ageDistribution[key],
    }));

    // ✅ Format Dwell Time Distribution as an Array
    const dwellTimeDistribution = Object.keys(dwellTimeMap).map((time) => ({
      time,
      count: dwellTimeMap[time],
    }));

    // ✅ Send Response
    res.status(200).json({
      status: "success",
      data: {
        totalVisitors,
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
