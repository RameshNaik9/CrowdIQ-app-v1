const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
    {
        camera_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Camera',
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        start_time: {
            type: Date,
        },
        end_time: {
            type: Date,
        },
        total_visitors: {
            type: Number,
            default: 0,
        },
        men_count: {
            type: Number,
            default: 0,
        },
        women_count: {
            type: Number,
            default: 0,
        },
        busiest_hour: {
            hour: { type: Number },
            count: { type: Number },
        },
        least_busy_hour: {
            hour: { type: Number },
            count: { type: Number },
        },
        average_time_spent: {
            men: { type: Number },
            women: { type: Number },
        },
        processed_frames: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
