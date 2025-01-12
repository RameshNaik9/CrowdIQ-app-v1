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
        notes: {
            type: String,
        },
        last_active: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Camera', cameraSchema);
