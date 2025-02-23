// controllers/inferenceController.js
const RawDataLog = require("../models/RawDataLog");
const VisitorAnalytics = require("../models/VisitorAnalytics");


/**
 * New function to update analytics for a given user, camera, and date.
 */
async function updateVisitorAnalytics(userId, cameraId, dateObj) {
  try {
    // Create normalized date string
    const normalizedDateStr = dateObj.toISOString().split("T")[0];
    const rawLog = await RawDataLog.findOne({ userId, cameraId, date: normalizedDateStr });
    if (!rawLog) {
      console.log("[updateVisitorAnalytics] No raw log found for date:", normalizedDateStr);
      return;
    }
    const logs = rawLog.logs;
    const totalVisitors = logs.length;
    let maleVisitors = 0;
    let femaleVisitors = 0;
    let totalDwellTime = 0;
    let totalAge = 0;
    let ageCount = 0;
    
    logs.forEach(log => {
      totalDwellTime += log.time_spent;
      if (log.gender.toLowerCase() === "male") {
        maleVisitors++;
      } else if (log.gender.toLowerCase() === "female") {
        femaleVisitors++;
      }
      if (log.age === "25-35") {
        totalAge += 30;
        ageCount++;
      } else if (log.age === "36-50") {
        totalAge += 43;
        ageCount++;
      }
    });
    
    const avgDwellTimeSeconds = totalVisitors > 0 ? totalDwellTime / totalVisitors : 0;
    const minutes = Math.floor(avgDwellTimeSeconds / 60);
    const seconds = Math.round(avgDwellTimeSeconds % 60);
    const avgDwellTime = `${minutes}m ${seconds}s`;
    const avgAge = ageCount > 0 ? totalAge / ageCount : 0;
    
    await VisitorAnalytics.findOneAndUpdate(
      { userId, cameraId, date: normalizedDateStr },
      { totalVisitors, maleVisitors, femaleVisitors, avgDwellTime, avgAge },
      { upsert: true, new: true }
    );
    console.log("[updateVisitorAnalytics] Updated analytics for date:", normalizedDateStr);
  } catch (error) {
    console.error("[updateVisitorAnalytics] Error updating analytics:", error);
  }
}


exports.triggerInference = async (req, res) => {
    const { cameraId, rtspUrl, status } = req.body;

    if (!cameraId || !rtspUrl || !status) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    console.log(`[triggerInference] ${status} inference for Camera ID: ${cameraId}`);
    console.log("Request body:", req.body);

    res.status(200).json({ message: `Inference ${status} successfully triggered for camera ${cameraId}.` });
};

exports.processInferenceData = async (data) => {
    try {
        console.log("[processInferenceData] Raw data:", data);

        const {
            userId,
            cameraId,
            date, // e.g. "2025-02-13T00:00:00.000+00:00"
            track_id,
            gender,
            age,
            time_spent,
            first_appearance,
            last_appearance
        } = data;

        if (!userId || !cameraId || !date || !track_id || !first_appearance || !last_appearance) {
            console.error("[processInferenceData] Missing required fields. Received:", data);
            return;
        }

        const dateObj = new Date(date);
        // Create a normalized date string (YYYY-MM-DD)
        const normalizedDateStr = dateObj.toISOString().split("T")[0];
        console.log("[processInferenceData] normalizedDateStr:", normalizedDateStr);

        const firstAppearanceDate = new Date(first_appearance);
        const lastAppearanceDate = new Date(last_appearance);

        const logEntryUpdate = {
            $inc: { "logs.$.time_spent": time_spent },
            $set: { "logs.$.last_appearance": lastAppearanceDate }
        };

        let rawLog = await RawDataLog.findOneAndUpdate(
            { userId, cameraId, date: normalizedDateStr, "logs.tracking_id": track_id },
            logEntryUpdate,
            { new: true }
        );

        let isNewLog = false;
        if (rawLog) {
            console.log("[processInferenceData] Updated existing log for tracking_id:", track_id);
        } else {
            const newLogEntry = {
                tracking_id: track_id,
                gender,
                age,
                time_spent,
                first_appearance: firstAppearanceDate,
                last_appearance: lastAppearanceDate
            };
            rawLog = await RawDataLog.findOneAndUpdate(
                { userId, cameraId, date: normalizedDateStr },
                { $push: { logs: newLogEntry } },
                { upsert: true, new: true }
            );
            isNewLog = true;
            console.log("[processInferenceData] Pushed new log for tracking_id:", track_id, "rawLog:", rawLog);
        }

        await updateVisitorAnalytics(userId, cameraId, dateObj); // Pass the original dateObj
        console.log("[processInferenceData] Visitor analytics updated via aggregation.");
    } catch (error) {
        console.error("[processInferenceData] Error processing inference data:", error);
    }
};

