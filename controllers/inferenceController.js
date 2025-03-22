// controllers/inferenceController.js
const RawDataLog = require("../models/RawDataLog");
const VisitorAnalytics = require("../models/VisitorAnalytics");
const { updateAnalyticsFromRawLogs } = require('../services/analyticsService');


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

        // Normalize the provided date to midnight (00:00:00 UTC)
        const getDateAtMidnight = (dateInput) => {
            const d = new Date(dateInput);
            d.setUTCHours(0, 0, 0, 0);
            return d;
        };

        const normalizedDate = getDateAtMidnight(date);

        console.log("[processInferenceData] Normalized date:", normalizedDate.toISOString());

        // Also parse first_appearance and last_appearance
        const firstAppearanceDate = new Date(first_appearance);
        const lastAppearanceDate = new Date(last_appearance);

        // Prepare the update for an existing log entry
        const logEntryUpdate = {
            $inc: { "logs.$.time_spent": time_spent },
            $set: { "logs.$.last_appearance": lastAppearanceDate }
        };

        // Try to update an existing log with the same tracking_id in the normalized date document.
        let rawLog = await RawDataLog.findOneAndUpdate(
            { userId, cameraId, date: normalizedDate, "logs.tracking_id": track_id },
            logEntryUpdate,
            { new: true }
        );

        let isNewLog = false;
        if (rawLog) {
            console.log("[processInferenceData] Updated existing log for tracking_id:", track_id);
        } else {
            // No existing log for that tracking_id on this date; create a new log entry.
            const newLogEntry = {
                tracking_id: track_id,
                gender,
                age,
                time_spent,
                first_appearance: firstAppearanceDate,
                last_appearance: lastAppearanceDate
            };
            // Push the new log entry into the document for the normalized date.
            rawLog = await RawDataLog.findOneAndUpdate(
                { userId, cameraId, date: normalizedDate },
                { $push: { logs: newLogEntry } },
                { upsert: true, new: true }
            );
            isNewLog = true;
            console.log("[processInferenceData] Pushed new log for tracking_id:", track_id, "rawLog:", rawLog);
        }

        // // Update VisitorAnalytics with the same normalized date to maintain consistency across collections.
        // const analyticsUpdate = isNewLog
        //     ? { $inc: { totalVisitors: 1 }, $push: {
        //             genderDistribution: { name: gender, value: 1 },
        //             ageDistribution: { name: age, count: 1 }
        //         } }
        //     : { $push: {
        //             genderDistribution: { name: gender, value: 1 },
        //             ageDistribution: { name: age, count: 1 }
        //         } };

        // await VisitorAnalytics.findOneAndUpdate(
        //     { userId, cameraId, date: normalizedDate },
        //     analyticsUpdate,
        //     { upsert: true, new: true }
        // );

        await updateAnalyticsFromRawLogs(userId, cameraId, normalizedDate);
        console.log("[processInferenceData] Visitor analytics updated using recalculated data from raw logs.");
        
    } catch (error) {
        console.error("[processInferenceData] Error processing inference data:", error);
    }
};


