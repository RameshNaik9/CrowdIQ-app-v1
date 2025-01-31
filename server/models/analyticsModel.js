const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
    {
        camera_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Camera',
            required: true,
            index: true,  // 🚀 Optimized: Index for faster queries
        },
        date: {
            type: String,
            required: true,
            index: true,  // 🚀 Optimized: Index for analytics reports
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
            men: { type: Number, default: 0 },   // 🚀 Ensures default values
            women: { type: Number, default: 0 }, // 🚀 Prevents null issues
        },
        processed_frames: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,  // 🚀 Removes the `__v` field
    }
);

// ✅ **TTL Index: Auto-delete older analytics data after 30 days (optional)**
analyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// ✅ **Compound Index for efficient queries (Find analytics by camera & date)**
analyticsSchema.index({ camera_id: 1, date: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
