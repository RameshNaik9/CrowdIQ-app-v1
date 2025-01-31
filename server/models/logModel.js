const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
    {
        camera_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Camera',
            required: true,
            index: true, // 🚀 Optimized: Faster queries for logs by camera
        },
        date: {
            type: String,
            required: true,
            index: true, // 🚀 Optimized: Enables querying by date
        },
        visitor_id: {
            type: String,
            required: true,
            index: true, // 🚀 Optimized: Enables visitor tracking
        },
        age_group: {
            type: String,
            required: true,
            enum: ['Child', 'Teen', 'Adult', 'Senior'], // 🚀 Optimized: Standard age groups
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Unknown'],
            required: true,
            index: true, // 🚀 Optimized: Faster querying by gender
        },
        entry_time: {
            type: Date,
            required: true,
        },
        exit_time: {
            type: Date,
        },
        time_spent: {
            type: Number,
            default: 0, // 🚀 Default to 0 if exit_time is missing
        },
        bounding_boxes: [
            {
                frame_number: { type: Number, required: true },
                coordinates: {
                    x1: { type: Number, required: true },
                    y1: { type: Number, required: true },
                    x2: { type: Number, required: true },
                    y2: { type: Number, required: true },
                },
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false, // 🚀 Removes `__v` field
    }
);

// ✅ **Indexing for faster searches**
logSchema.index({ camera_id: 1 });
logSchema.index({ visitor_id: 1 });
logSchema.index({ date: 1 });

// ✅ **TTL Index (Auto-delete logs after 90 days)**
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// ✅ **Pre-save Hook: Auto-calculate `time_spent`**
logSchema.pre('save', function (next) {
    if (this.entry_time && this.exit_time) {
        this.time_spent = Math.floor((this.exit_time - this.entry_time) / 1000); // Time spent in seconds
    }
    next();
});

module.exports = mongoose.model('Log', logSchema);
