// controllers/inferenceController.js
const RawDataLog = require("../models/RawDataLog");
const VisitorAnalytics = require("../models/VisitorAnalytics");


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

        // Validate all required fields
        if (!userId || !cameraId || !date || !track_id || !first_appearance || !last_appearance) {
            console.error("[processInferenceData] Missing required fields. Received:", data);
            return;
        }

        // Convert string -> Date object
        const dateObj = new Date(date);
        console.log("[processInferenceData] dateObj after parsing:", dateObj.toISOString());

        // Also parse first_appearance / last_appearance
        const firstAppearanceDate = new Date(first_appearance);
        const lastAppearanceDate = new Date(last_appearance);

        // Prepare log entry
        const logEntry = {
            tracking_id: track_id,
            gender,
            age,
            time_spent,
            first_appearance: firstAppearanceDate,
            last_appearance: lastAppearanceDate
        };
        console.log("[processInferenceData] logEntry:", logEntry);

        // Update RawDataLog
        const rawLog = await RawDataLog.findOneAndUpdate(
            {
                userId,
                cameraId,
                date: dateObj  // <--- store your date in Mongo as the full Date
            },
            { $push: { logs: logEntry } },
            { upsert: true, new: true }
        );

        console.log("[processInferenceData] rawLog updated ->", rawLog);

        // Update VisitorAnalytics
        await VisitorAnalytics.findOneAndUpdate(
            { userId, cameraId, date },
            {
                $inc: { totalVisitors: 1 },
                $push: {
                    genderDistribution: { name: gender, value: 1 },
                    ageDistribution: { name: age, count: 1 },
                },
            },
            { upsert: true, new: true }
        );

        console.log(`[processInferenceData] Visitor analytics updated.`);
    } catch (error) {
        console.error("[processInferenceData] Error processing inference data:", error);
    }
};


