const Camera = require('../models/cameraModel');
const logger = require('../utils/logger');
const { exec } = require('child_process');

/**
 * @desc    Connect & register a new camera
 * @param   {Object} cameraDetails - Camera details from frontend
 * @returns {Promise<Object>} - Saved camera details
 */
exports.connectToCamera = async (cameraDetails) => {
    const { userId, name, location, username, password, ip_address, port, channel_number, stream_type } = cameraDetails;

    // Construct the RTSP URL
    const rtspUrl = `rtsp://${username}:${password}@${ip_address}:${port}/${channel_number}/${stream_type}`;
    logger.info(`Generated RTSP URL: ${rtspUrl}`);

    // Use a test RTSP connection for now
    const testRtspUrl = 'rtsp://localhost:8554/test';

    try {
        logger.info(`Testing RTSP connection with test URL: ${testRtspUrl}`);
        
        // Simulate a successful RTSP connection
        await testRTSPConnection(testRtspUrl);

        // Save the camera in the database
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
exports.getAllCamerasByUser = async (userId) => {
    return await Camera.find({ created_by: userId });
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
