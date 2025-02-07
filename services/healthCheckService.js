const Camera = require('../models/cameraModel');
const { exec } = require('child_process');
const logger = require('../utils/logger');

// ✅ Function to check RTSP stream health
const checkRTSPStream = async (camera) => {
    return new Promise((resolve, reject) => {
        const rtspUrl = camera.rtsp_url;
        
        exec(`ffmpeg -i "${rtspUrl}" -t 5 -f null -`, (error, stdout, stderr) => {
            if (error) {
                logger.warn(`Camera Offline: ${camera.name} (${camera.ip_address})`);
                return reject(new Error('RTSP connection failed'));
            }
            logger.info(`Camera Online: ${camera.name} (${camera.ip_address})`);
            resolve('RTSP connection successful');
        });
    });
};

// ✅ Function to perform health check on cameras
const performHealthCheck = async () => {
    try {
        const cameras = await Camera.find(); // Fetch all cameras

        for (const camera of cameras) {
            try {
                await checkRTSPStream(camera);

                // ✅ Update camera status to online
                await Camera.findByIdAndUpdate(camera._id, {
                    status: 'online',
                    last_active: new Date(),
                    $push: { connection_history: { status: 'success', reason: 'Health Check Passed' } },
                });

            } catch (error) {
                // ❌ Update camera status to offline
                await Camera.findByIdAndUpdate(camera._id, {
                    status: 'offline',
                    $push: { connection_history: { status: 'failure', reason: error.message } },
                });
            }
        }
    } catch (err) {
        logger.error(`Health Check Error: ${err.message}`);
    }
};

module.exports = { performHealthCheck };
