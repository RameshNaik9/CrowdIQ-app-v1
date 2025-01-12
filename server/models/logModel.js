const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
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
        visitor_id: {
            type: String,
            required: true,
        },
        age_group: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Unknown'],
            required: true,
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
        },
        bounding_boxes: [
            {
                frame_number: { type: Number },
                coordinates: {
                    x1: { type: Number },
                    y1: { type: Number },
                    x2: { type: Number },
                    y2: { type: Number },
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);
