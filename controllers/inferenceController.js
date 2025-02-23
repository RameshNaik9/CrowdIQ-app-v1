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
    try {
        const {
            userId,
            cameraId,
            date,
            track_id,
            gender,
            age,
            time_spent,
            first_appearance,
            last_appearance
        } = data;

        if (!userId || !cameraId || !date || !track_id) {
            console.error("[processInferenceData] Missing required fields.");
            return;
        }

        console.log(`[processInferenceData] Processing data for Camera: ${cameraId}, User: ${userId}, Date: ${date}`);

        // Ensure date parsing
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

        // Update RawDataLog
        await RawDataLog.findOneAndUpdate(
            { userId, cameraId, date },
            { $push: { logs: logEntry } },
            { upsert: true, new: true }
        );

        console.log(`[processInferenceData] Log for tracking_id: ${track_id} updated.`);

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
        console.error(`[processInferenceData] Error processing inference data: ${error}`);
    }
};

