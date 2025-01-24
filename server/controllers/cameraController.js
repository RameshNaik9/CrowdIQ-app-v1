const { connectToCamera } = require('../services/cameraService');
const logger = require('../utils/logger'); // Corrected import

exports.connectCamera = async (req, res, next) => {
    try {
        const cameraDetails = req.body;

        // Log incoming request
        logger.info(`Connecting to camera with details: ${JSON.stringify(cameraDetails)}`);

        // Call service to connect the camera
        const result = await connectToCamera(cameraDetails);

        // Send response to frontend
        res.status(200).json({
            message: 'Camera connected successfully',
            data: result,
        });
    } catch (error) {
        logger.error(`Error in connectCamera: ${error.message}`);
        next(error); // Pass error to global error handler
    }
};
