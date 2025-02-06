const Camera = require('../models/cameraModel');

/**
 * @desc    Fetch all cameras from the database
 * @returns {Promise<Array>} List of all cameras
 */
exports.getAllCameras = async () => {
    return await Camera.find();
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
