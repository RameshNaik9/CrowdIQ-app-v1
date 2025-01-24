const mongoose = require('mongoose');

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
        },
        password: {
            type: String,
            required: true,
        },
        ip_address: {
            type: String,
            required: true,
        },
        port: {
            type: Number,
            default: 554,
        },
        stream_type: {
            type: String,
            default: 'main',
        },
        channel_number: {
            type: String,
        },
        notes: {
            type: String,
        },
        status: {
            type: String,
            enum: ['online', 'offline'],
            default: 'offline',
        },
        last_active: {
            type: Date,
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
    },
    { timestamps: true }
);

module.exports = mongoose.model('Camera', cameraSchema);
