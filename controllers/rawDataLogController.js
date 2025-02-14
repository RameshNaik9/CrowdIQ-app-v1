const RawDataLog = require("../models/RawDataLog");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// ✅ 1. Insert Raw Logs (With Date Support)
exports.insertRawLogs = catchAsync(async (req, res, next) => {
  const { userId, cameraId, logs, date } = req.body;

  if (!userId || !cameraId || !logs || !Array.isArray(logs)) {
    return next(new AppError("Missing required fields", 400));
  }

  // ✅ If no date is provided, use today
  const logDate = date ? new Date(date).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);

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
