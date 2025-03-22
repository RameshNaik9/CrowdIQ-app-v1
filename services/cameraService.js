const Camera = require('../models/cameraModel');
const logger = require('../utils/logger');
const { exec } = require('child_process');

// /**
//  * @desc    Connect & register a new camera
//  * @param   {Object} cameraDetails - Camera details from frontend
//  * @returns {Promise<Object>} - Saved camera details
//  */
// exports.connectToCamera = async (cameraDetails) => {
//     const { userId, name, location, username, password, ip_address, port, channel_number, stream_type } = cameraDetails;

//     // Construct the correct RTSP URL using the provided details
//     const rtspUrl = `rtsp://${username}:${password}@${ip_address}:${port}/${channel_number}/${stream_type}`;
//     logger.info(`Generated RTSP URL: ${rtspUrl}`);

//     // Determine which RTSP URL to use based on the environment
//     const isProduction = process.env.NODE_ENV === 'production';
//     const testRtspUrl = isProduction ? rtspUrl : 'rtsp://localhost:8554/test';

//     try {
//         logger.info(`Testing RTSP connection with URL: ${testRtspUrl}`);
        
//         // Simulate a successful RTSP connection
//         await testRTSPConnection(testRtspUrl);

//         // Save the camera in the database
//         const updatedCamera = await Camera.findOneAndUpdate(
//             { name, location, created_by: userId },
//             {
//                 name,
//                 location,
//                 stream_link: testRtspUrl, // Use the determined RTSP URL
//                 username,
//                 password,
//                 ip_address,
//                 port,
//                 channel_number,
//                 stream_type,
//                 last_active: new Date(),
//                 status: 'online',
//                 created_by: userId,
//             },
//             { new: true, upsert: true }
//         );

//         logger.info(`Camera connected and saved to DB: ${updatedCamera._id}`);

//         return updatedCamera;
//     } catch (error) {
//         logger.error(`Error saving camera to DB: ${error.message}`);
//         throw new Error('Failed to save the camera. Please check the provided details.');
//     }
// };


/**
 * @desc    Connect & register a new camera
 * @param   {Object} cameraDetails - Camera details from frontend
 * @returns {Promise<Object>} - Saved camera details
 */
exports.connectToCamera = async (cameraDetails) => {
  const {
    userId,
    name,
    location,
    username,
    password,
    ip_address,
    port,
    channel_number,
    stream_type,
    rtsp_url, // user-supplied editable field
  } = cameraDetails;
  
  // Construct a URL if user did not provide one
  const constructedUrl = `rtsp://${username}:${password}@${ip_address}:${port}/${channel_number}/${stream_type}`;
  const finalUrl = rtsp_url && rtsp_url.trim() !== "" ? rtsp_url : constructedUrl;
  logger.info(`Constructed RTSP URL: ${constructedUrl}`);
  logger.info(`Final RTSP URL: ${finalUrl}`);
  
  // Check NODE_ENV: In production, use the client-provided URL (or constructed URL); in development, use the test URL.
  const isProduction = process.env.NODE_ENV === 'production';
  const testRtspUrl = isProduction ? finalUrl : 'rtsp://localhost:8554/test';
  
  try {
    logger.info(`Testing RTSP connection with URL: ${testRtspUrl}`);
    await testRTSPConnection(testRtspUrl);
    
    // Save or update the camera in the database using the final tested URL.
    const updatedCamera = await Camera.findOneAndUpdate(
      { name, location, created_by: userId },
      {
        name,
        location,
        stream_link: testRtspUrl,
        username,
        password,
        ip_address,
        port,
        channel_number,
        stream_type,
        last_active: new Date(),
        status: 'online',
        created_by: userId,
      },
      { new: true, upsert: true }
    );
    logger.info(`Camera connected and saved to DB: ${updatedCamera._id}`);
    return updatedCamera;
  } catch (error) {
    logger.error(`Error saving camera to DB: ${error.message}`);
    throw new Error('Failed to save the camera. Please check the provided details.');
  }
};

/**
 * @desc    Function to test RTSP connection (Simulated for now)
 * @param   {String} rtspUrl - RTSP stream URL
 * @returns {Promise<String>} - Connection success message
 */
const testRTSPConnection = (rtspUrl) => {
    return new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${rtspUrl}" -t 5 -f null -`, (error, stdout, stderr) => {
            if (error) {
                logger.error(`FFmpeg error: ${stderr}`);
                reject(new Error('RTSP connection failed'));
            } else {
                logger.info(`FFmpeg output: ${stdout}`);
                resolve('RTSP connection successful');
            }
        });
    });
};

/**
 * @desc    Fetch all cameras associated with a specific user
 * @param   {String} userId - The user's ID
 * @returns {Promise<Array>} List of cameras belonging to this user
 */
exports.getAllCameras = async (userId) => {
    return await Camera.find({ created_by: userId }); // ✅ Fetch only user's cameras
};


/**
 * @desc    Fetch a single camera by ID
 * @param   {String} cameraId - The camera's ID
 * @returns {Promise<Object|null>} The camera object or null if not found
 */
exports.getCameraById = async (cameraId) => {
    return await Camera.findById(cameraId);
};

/**
 * @desc    Update camera details
 * @param   {String} cameraId - The camera's ID
 * @param   {Object} updateData - The data to update
 * @returns {Promise<Object|null>} Updated camera object or null if not found
 */
exports.updateCamera = async (cameraId, updateData) => {
    return await Camera.findByIdAndUpdate(cameraId, updateData, {
        new: true,
        runValidators: true,
    });
};

/**
 * @desc    Delete a camera by ID
 * @param   {String} cameraId - The camera's ID
 * @returns {Promise<Object|null>} The deleted camera object or null if not found
 */
exports.deleteCamera = async (cameraId) => {
    return await Camera.findByIdAndDelete(cameraId);
};
