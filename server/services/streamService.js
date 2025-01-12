const ffmpeg = require('fluent-ffmpeg');
const { sendFrameToQueue } = require('../utils/queueManager');

exports.generateRTSPUrl = ({ username, password, ip, port, channel, streamType }) => {
    return `rtsp://${username}:${password}@${ip}:${port}/channel=${channel}&streamtype=${streamType}`;
};

exports.startStream = (rtspUrl) => {
    return new Promise((resolve, reject) => {
        ffmpeg(rtspUrl)
            .outputOptions(['-vf', 'fps=5'])
            .on('data', (frame) => {
                sendFrameToQueue(frame); // Send frame to RabbitMQ
            })
            .on('error', (err) => reject(err))
            .run();
    });
};
