const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'viewer'],
            default: 'viewer',
        },
        preferences: {
            timezone: { type: String, default: 'UTC' },
            default_camera: { type: String },
            reporting_format: { type: [String], default: ['CSV'] },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
