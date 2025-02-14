const RawDataLog = require("../models/RawDataLog");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// ✅ 1. Insert Raw Logs (With Query Parameters Support)
exports.insertRawLogs = catchAsync(async (req, res, next) => {
  const { userId, cameraId, date } = req.query; // 🔹 Get from Query Parameters
  const logs = req.body.logs;

  if (!userId || !cameraId || !logs || !Array.isArray(logs)) {
    return next(new AppError("Missing required fields", 400));
  }

  // ✅ Ensure Date is Properly Formatted
  const logDate = date ? new Date(date).toISOString() : new Date().toISOString();

  let rawLogEntry = await RawDataLog.findOne({ userId, cameraId, date: logDate });

  if (!rawLogEntry) {
    rawLogEntry = new RawDataLog({ userId, cameraId, date: logDate, logs });
  } else {
    rawLogEntry.logs.push(...logs);
  }

  await rawLogEntry.save();

  res.status(200).json({
    status: "success",
    message: "Raw logs inserted successfully",
    savedLogs: rawLogEntry,
  });
});

// ✅ 2. Fetch Raw Logs by userId, cameraId, and date range
exports.getRawLogs = catchAsync(async (req, res, next) => {
  const { userId, cameraId, startDate, endDate } = req.query;

  if (!userId || !cameraId || !startDate || !endDate) {
    return next(new AppError("User ID, Camera ID, and Date Range are required", 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const logs = await RawDataLog.find({
    userId,
    cameraId,
    date: { $gte: start, $lte: end },
  });

  res.status(200).json({
    status: "success",
    data: logs,
  });
});
