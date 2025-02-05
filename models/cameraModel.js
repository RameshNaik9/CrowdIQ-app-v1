const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const cameraSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
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
            select: false,  // 🚀 Hide from queries by default (security)
        },
        password: {
            type: String,
            required: true,
            select: false,  // 🚀 Hide from queries by default (security)
        },
        ip_address: {
            type: String,
            required: true,
        },
        port: {
            type: Number,
            default: 554,
            min: 1,
            max: 65535,
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
            trim: true,
        },
        status: {
            type: String,
            enum: ['online', 'offline'],
            default: 'offline',
        },
        last_active: {
            type: Date,
            default: Date.now,
        },
        health_check_interval: {
            type: Number,  // ✅ Store as seconds (e.g., 60 = check every 1 min)
            default: 60,
        },
        connection_history: [
            {
                timestamp: { type: Date, default: Date.now },
                status: { type: String, enum: ['success', 'failure'] },
                reason: { type: String }, // ✅ Added failure reason field
            },
        ],
        rtsp_url: {
            type: String, // ✅ Auto-generated based on IP, Port, Channel
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ✅ **Hash password before saving (Security)**
cameraSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// ✅ **Generate RTSP URL Before Saving**
cameraSchema.pre('save', function (next) {
    this.rtsp_url = `rtsp://${this.ip_address}:${this.port}/${this.channel_number}`;
    next();
});

// ✅ **TTL Index (Auto-delete old connection history after 30 days)**
cameraSchema.index({ "connection_history.timestamp": 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// ✅ **Indexes for Faster Queries**
cameraSchema.index({ name: 1 });
cameraSchema.index({ ip_address: 1 });
cameraSchema.index({ status: 1 });
cameraSchema.index({ created_by: 1 });

module.exports = mongoose.model('Camera', cameraSchema);
