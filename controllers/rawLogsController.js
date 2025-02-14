const RawDataLog = require("../models/RawDataLog");
const { io } = require("../server"); // ✅ Import WebSocket instance
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// ✅ Get Raw Logs (Today: Dynamic Updates, Past: Static)
exports.getRawLogs = catchAsync(async (req, res, next) => {
  const { userId, cameraId, startDate, endDate } = req.query;

  if (!userId || !cameraId || !startDate || !endDate) {
    return next(new AppError("User ID, Camera ID, and Date Range are required", 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // ✅ Fetch Logs
  const logs = await RawDataLog.find({
    userId,
    cameraId,
    date: { $gte: start, $lte: end },
  });

  res.status(200).json({
    status: "success",
    data: logs.length ? logs[0].logs : [],
  });
});

// ✅ Add/Update Logs for Today (Real-Time Data)
exports.updateRawLog = catchAsync(async (req, res, next) => {
  const { userId, cameraId, tracking_id, gender, age, time_spent, first_appearance, last_appearance } = req.body;

  if (!userId || !cameraId || !tracking_id || !gender || !age || !time_spent || !first_appearance || !last_appearance) {
    return next(new AppError("All fields are required", 400));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ✅ Find or Create today's log entry for the camera
  let logEntry = await RawDataLog.findOne({ userId, cameraId, date: today });

  if (!logEntry) {
    logEntry = await RawDataLog.create({
      userId,
      cameraId,
      date: today,
      logs: [],
    });
  }

  // ✅ Check if tracking_id already exists
  const existingLog = logEntry.logs.find((log) => log.tracking_id === tracking_id);

  if (existingLog) {
    // ✅ Update existing log
    existingLog.time_spent = time_spent;
    existingLog.last_appearance = last_appearance;
  } else {
    // ✅ Add new entry
    logEntry.logs.push({
      tracking_id,
      gender,
      age,
      time_spent,
      first_appearance,
      last_appearance,
    });
  }

  await logEntry.save();

  // ✅ Send real-time update to clients
  io.emit("newLog", logEntry.logs);

  res.status(200).json({ status: "success", message: "Log updated successfully" });
});
