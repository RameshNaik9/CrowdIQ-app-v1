const Camera = require('../models/cameraModel');
const { exec } = require('child_process');
const logger = require('../utils/logger');

// ✅ Function to check RTSP stream health (using stream_link)
const checkRTSPStream = async (camera) => {
  return new Promise((resolve, reject) => {
    // Use the stream_link from the database
    const rtspUrl = camera.stream_link;
    
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

// ✅ Function to perform health check only for a specific user's cameras
//    Only check cameras whose last_active is before 48 hours ago
const performHealthCheck = async (userId) => {
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Fetch only the user's cameras that haven't been active in the last 48 hours
    const cameras = await Camera.find({
      created_by: userId,
      last_active: { $lt: fortyEightHoursAgo }
    });

    // Run the health checks in parallel
    await Promise.all(cameras.map(async (camera) => {
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
    }));
  } catch (err) {
    logger.error(`Health Check Error: ${err.message}`);
  }
};

module.exports = { performHealthCheck };
