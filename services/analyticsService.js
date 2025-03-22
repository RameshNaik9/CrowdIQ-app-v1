// const RawDataLog = require("../models/RawDataLog");
// const VisitorAnalytics = require("../models/VisitorAnalytics");

// exports.updateAnalyticsFromRawLogs = async (userId, cameraId, normalizedDate) => {
//   // Fetch the raw logs document for the specified date
//   const rawLog = await RawDataLog.findOne({ userId, cameraId, date: normalizedDate });
//   if (!rawLog || !rawLog.logs || rawLog.logs.length === 0) {
//     // Optionally, clear analytics if no logs exist
//     await VisitorAnalytics.findOneAndUpdate(
//       { userId, cameraId, date: normalizedDate },
//       { totalVisitors: 0, genderDistribution: [], ageDistribution: [] },
//       { upsert: true, new: true }
//     );
//     return;
//   }
  
//   const logs = rawLog.logs;
//   const totalVisitors = logs.length;

//   // Aggregate gender and age counts based on raw logs
//   const genderMap = {};
//   const ageMap = {};
//   logs.forEach((log) => {
//     const g = log.gender;
//     const a = log.age;
//     genderMap[g] = (genderMap[g] || 0) + 1;
//     ageMap[a] = (ageMap[a] || 0) + 1;
//   });

//   const genderDistribution = Object.keys(genderMap).map((key) => ({
//     name: key,
//     value: genderMap[key],
//   }));
//   const ageDistribution = Object.keys(ageMap).map((key) => ({
//     name: key,
//     count: ageMap[key],
//   }));

//   // Update the VisitorAnalytics document with the aggregated values
//   await VisitorAnalytics.findOneAndUpdate(
//     { userId, cameraId, date: normalizedDate },
//     { totalVisitors, genderDistribution, ageDistribution },
//     { upsert: true, new: true }
//   );
// };


const RawDataLog = require("../models/RawDataLog");
const VisitorAnalytics = require("../models/VisitorAnalytics");

// Optional lookup for age groups to numeric averages
const ageGroupToAverage = {
  "18-25": 21,
  "25-35": 30,
  "36-50": 43,
  "50+": 55,
};

const formatSecondsToMinSec = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
};

exports.updateAnalyticsFromRawLogs = async (userId, cameraId, normalizedDate) => {
  // Retrieve the raw logs for the given date
  const rawLogDoc = await RawDataLog.findOne({ userId, cameraId, date: normalizedDate });
  if (!rawLogDoc || !rawLogDoc.logs || rawLogDoc.logs.length === 0) {
    // Clear analytics if no logs exist
    await VisitorAnalytics.findOneAndUpdate(
      { userId, cameraId, date: normalizedDate },
      {
        totalVisitors: 0,
        maleVisitors: 0,
        femaleVisitors: 0,
        avgDwellTime: "0m 0s",
        avgAge: 0,
        visitorTrend: [],
        genderDistribution: [],
        ageDistribution: [],
        dwellTimeDistribution: [],
        entryExitFlow: [],
        visitorSegmentation: [],
      },
      { upsert: true, new: true }
    );
    return;
  }

  const logs = rawLogDoc.logs;
  const totalVisitors = logs.length;

  // Initialize aggregators
  let maleCount = 0,
    femaleCount = 0,
    totalDwellTime = 0,
    totalAge = 0,
    ageCount = 0;
  const visitorTrendMap = {}; // e.g. { "9 AM": count }
  const dwellTimeBuckets = { "0-5m": 0, "5-10m": 0, "10-20m": 0, "20-30m": 0, "30-60m": 0, "60m+": 0 };

  // Process each log entry
  logs.forEach((log) => {
    // Count gender
    const gender = log.gender.toLowerCase();
    if (gender === "male") {
      maleCount++;
    } else if (gender === "female") {
      femaleCount++;
    }
    // For visitorTrend, we use the hour (from first_appearance) as key (example: "9 AM")
    const appearanceDate = new Date(log.first_appearance);
    const hour = appearanceDate.getHours();
    const hourLabel = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
    visitorTrendMap[hourLabel] = (visitorTrendMap[hourLabel] || 0) + 1;

    // Aggregate dwell time (in seconds)
    totalDwellTime += log.time_spent;

    // Compute age average if possible using our lookup
    if (ageGroupToAverage[log.age]) {
      totalAge += ageGroupToAverage[log.age];
      ageCount++;
    }

    // Bucket dwell times (for simplicity, assume time_spent is in seconds)
    const minutes = Math.floor(log.time_spent / 60);
    if (minutes < 5) {
      dwellTimeBuckets["0-5m"]++;
    } else if (minutes < 10) {
      dwellTimeBuckets["5-10m"]++;
    } else if (minutes < 20) {
      dwellTimeBuckets["10-20m"]++;
    } else if (minutes < 30) {
      dwellTimeBuckets["20-30m"]++;
    } else if (minutes < 60) {
      dwellTimeBuckets["30-60m"]++;
    } else {
      dwellTimeBuckets["60m+"]++;
    }
  });

  // Calculate averages
  const avgDwellTime = totalVisitors > 0 ? formatSecondsToMinSec(Math.round(totalDwellTime / totalVisitors)) : "0m 0s";
  const avgAge = ageCount > 0 ? Math.round(totalAge / ageCount) : 0;

  // Convert visitorTrendMap to an array
  const visitorTrend = Object.keys(visitorTrendMap).map((time) => ({ time, count: visitorTrendMap[time] }));

  // Convert dwellTimeBuckets to an array
  const dwellTimeDistribution = Object.keys(dwellTimeBuckets).map((bucket) => ({
    time: bucket,
    count: dwellTimeBuckets[bucket],
  }));

  // For entryExitFlow and visitorSegmentation, you need to define your own logic.
  // For this example, we will leave them as empty arrays.
  const entryExitFlow = []; // Example: derive from first and last appearance times
  const visitorSegmentation = []; // Example: if track_id appears for first time or repeated

  // Build gender and age distribution arrays (if needed, sort or combine similar entries)
  const genderDistribution = [
    { name: "Male", value: maleCount },
    { name: "Female", value: femaleCount },
  ];
  // For ageDistribution, you might want to combine counts from different logs.
  // Here we use the raw count from each log's age field.
  const ageMap = {};
  logs.forEach((log) => {
    ageMap[log.age] = (ageMap[log.age] || 0) + 1;
  });
  const ageDistribution = Object.keys(ageMap).map((ageGroup) => ({ name: ageGroup, count: ageMap[ageGroup] }));

  // Finally, update the analytics document
  await VisitorAnalytics.findOneAndUpdate(
    { userId, cameraId, date: normalizedDate },
    {
      totalVisitors,
      maleVisitors: maleCount,
      femaleVisitors: femaleCount,
      avgDwellTime,
      avgAge,
      visitorTrend,
      genderDistribution,
      ageDistribution,
      dwellTimeDistribution,
      entryExitFlow,
      visitorSegmentation,
    },
    { upsert: true, new: true }
  );
};
