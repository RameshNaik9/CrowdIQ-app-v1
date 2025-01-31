// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema(
//     {
//         email: {
//             type: String,
//             required: true,
//             unique: true,
//             index: true, // 🚀 Optimized: Faster authentication lookups
//             match: [
//                 /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//                 "Invalid email format",
//             ], // ✅ Ensures only valid emails are stored
//         },
//         name: {
//             type: String,
//             required: true,
//             trim: true, // ✅ Prevents accidental whitespace issues
//         },
//         role: {
//             type: String,
//             enum: ['admin', 'viewer'],
//             default: 'viewer',
//             index: true, // 🚀 Optimized: Efficient user role queries
//         },
//         preferences: {
//             timezone: {
//                 type: String,
//                 default: 'UTC',
//                 enum: ['UTC', 'EST', 'PST', 'CST', 'IST'], // ✅ Standardized timezones
//             },
//             default_camera: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'Camera',
//                 default: null,
//             },
//             reporting_format: {
//                 type: [String],
//                 default: ['CSV'],
//                 enum: ['CSV', 'JSON', 'PDF'], // ✅ Ensures consistent report formats
//             },
//             real_time_alerts: {
//                 type: Boolean,
//                 default: false, // ✅ Allows users to enable/disable real-time alerts
//             },
//         },
//     },
//     {
//         timestamps: true,
//         versionKey: false, // 🚀 Removes `__v` field
//     }
// );

// // ✅ Indexing for Performance
// userSchema.index({ email: 1 });
// userSchema.index({ role: 1 });

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        googleId: { type: String, unique: true }, // ✅ Google OAuth ID
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        profilePicture: { type: String }, // ✅ Store Google Profile Picture
        role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
        preferences: {
            timezone: { type: String, default: 'UTC' },
            default_camera: { type: mongoose.Schema.Types.ObjectId, ref: 'Camera' },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

