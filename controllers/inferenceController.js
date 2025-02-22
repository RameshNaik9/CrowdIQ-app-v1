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
    const { cameraId, track_id, gender, age, time_spent, first_appearance, last_appearance } = data;

    if (!cameraId || !track_id) {
        console.error("[processInferenceData] Missing required fields.");
        return;
    }

    console.log(`[processInferenceData] Processing data for camera ${cameraId}`);

    // 1. Update RawDataLog for detailed tracking
    const log = {
        tracking_id: track_id,
        gender,
        age,
        time_spent,
        first_appearance: new Date(parseFloat(first_appearance) * 1000),
        last_appearance: new Date(parseFloat(last_appearance) * 1000),
    };

    const rawLog = await RawDataLog.findOneAndUpdate(
        { cameraId },
        { $push: { logs: log } },
        { upsert: true, new: true }
    );

    console.log("[processInferenceData] Raw log updated:", rawLog);

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
