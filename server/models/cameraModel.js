const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            // index: true,  // 🚀 Optimized: Index for searching cameras by name
        },
        location: {
            type: String,
            required: true,
        },
        stream_link: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        ip_address: {
            type: String,
            required: true,
            // index: true,  // 🚀 Optimized: Index for efficient lookup
        },
        port: {
            type: Number,
            default: 554,
            min: 1,
            max: 65535, // 🚀 Ensuring valid port numbers
        },
        stream_type: {
            type: String,
            default: 'main',
        },
        channel_number: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
            default: '',
            trim: true,  // 🚀 Ensures stored notes don’t have unnecessary spaces
        },
        status: {
            type: String,
            enum: ['online', 'offline'],
            default: 'offline',
            // index: true,  // 🚀 Optimized: Query cameras by status
        },
        last_active: {
            type: Date,
            default: Date.now,
        },
        health_check_interval: {
            type: Date,
        },
        connection_history: [
            {
                timestamp: { type: Date, default: Date.now },
                status: { type: String, enum: ['success', 'failure'] },
                notes: { type: String },
            },
        ],
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,  // ✅ Added: User ID reference to track camera ownership
            // index: true,  // 🚀 Optimized: Fast retrieval of user's cameras
        },
    },
    {
        timestamps: true,
        versionKey: false,  // 🚀 Removes `__v` field
    }
);

// ✅ **TTL Index (Auto-delete old connection history after 30 days)**
cameraSchema.index({ "connection_history.timestamp": 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// ✅ **Indexing for faster queries**
cameraSchema.index({ name: 1 });
cameraSchema.index({ ip_address: 1 });
cameraSchema.index({ status: 1 });
cameraSchema.index({ created_by: 1 });  // 🚀 Optimized: Fetch cameras by user

module.exports = mongoose.model('Camera', cameraSchema);
