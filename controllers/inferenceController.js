const RawDataLog = require("../models/RawDataLog");
const VisitorAnalytics = require("../models/VisitorAnalytics");


exports.triggerInference = async (req, res) => {
    const { cameraId, rtspUrl, status } = req.body;

    if (!cameraId || !rtspUrl || !status) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    console.log(`[triggerInference] ${status} inference for Camera ID: ${cameraId}`);

    res.status(200).json({ message: `Inference ${status} successfully triggered for camera ${cameraId}.` });
};

exports.processInferenceData = async (data) => {
    const { userId, cameraId, date, track_id, gender, age, time_spent, first_appearance, last_appearance } = data;

    if (!userId || !cameraId || !date || !track_id) {
        console.error("[processInferenceData] Missing required fields.");
        return;
    }

    console.log(`[processInferenceData] Processing data for Camera: ${cameraId}, User: ${userId}, Date: ${date}`);

    // 1. Update RawDataLog for detailed tracking
    const logEntry = {
        tracking_id: track_id,
        gender,
        age,
        time_spent,
        first_appearance: new Date(first_appearance),
        last_appearance: new Date(last_appearance)
    };

    // Update RawDataLog by userId, cameraId, and date
    const log = await RawDataLog.findOneAndUpdate(
        { userId, cameraId, date },
        { $push: { logs: logEntry } },
        { upsert: true, new: true }
    );

    console.log("[processInferenceData] Raw log updated:", log);

    // 2. Update VisitorAnalytics for aggregate metrics
    const analyticsUpdate = {
        $inc: { totalVisitors: 1 },
        $push: {
            genderDistribution: { name: gender, value: 1 },
            ageDistribution: { name: age, count: 1 },
        },
    };

    const analytics = await VisitorAnalytics.findOneAndUpdate(
        { cameraId },
        analyticsUpdate,
        { upsert: true, new: true }
    );

    console.log("[processInferenceData] Visitor analytics updated:", analytics);
};
