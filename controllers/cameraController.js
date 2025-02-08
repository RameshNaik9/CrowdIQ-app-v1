const cameraService = require('../services/cameraService');
const { connectToCamera } = require('../services/cameraService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { exec } = require('child_process');


/**
 * @desc    Connect & register a new camera OR update an existing one
 * @route   POST /api/v1/cameras/connect
 * @access  Public (Will be protected later)
 */
exports.connectCamera = async (req, res, next) => {
    try {
        // Extract userId, cameraId (optional) and the rest of the camera data from the request body
        const { userId, cameraId, ...cameraData } = req.body;

        if (!userId) {
            return next(new AppError('User ID is required', 400));
        }

        logger.info(`User ${userId} is connecting to a camera`);

        // Always test the RTSP connection using the test URL
        const testRtspUrl = 'rtsp://localhost:8554/test';
        await testRTSPConnection(testRtspUrl);

        if (cameraId) {
            // Update existing camera if cameraId is provided
            let existingCamera = await cameraService.getCameraById(cameraId);
            if (existingCamera) {
                logger.info(`Updating existing camera: ${existingCamera._id}`);

                // Update the existing camera's status, last active timestamp, and connection history
                const updatedCamera = await cameraService.updateCamera(existingCamera._id, {
                    status: 'online',
                    last_active: new Date(),
                    $push: {
                        connection_history: { status: 'success', reason: 'Reconnected successfully' },
                    },
                });

                return res.status(200).json({
                    status: 'success',
                    message: 'Camera reconnected successfully!',
                    data: updatedCamera,
                });
            } else {
                return next(new AppError('Camera not found', 404));
            }
        } else {
            // Create a new camera since no cameraId is provided
            const newCamera = await connectToCamera({ userId, ...cameraData });
            return res.status(200).json({
                status: 'success',
                message: 'Camera connected successfully!',
                data: newCamera,
            });
        }
    } catch (error) {
        logger.error(`Error in connectCamera: ${error.message}`);
        next(error);
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
 * @desc    Get all cameras for a specific user
 * @route   GET /api/v1/cameras?userId=<USER_ID>
 * @access  Public (Will be protected later)
 */
exports.getAllCameras = catchAsync(async (req, res, next) => {
    const userId = req.headers["user-id"]; // ✅ Read userId from headers

    if (!userId) {
        return next(new AppError("User ID is required", 400));
    }

    const cameras = await cameraService.getAllCameras(userId);

    res.status(200).json({
        status: "success",
        results: cameras.length,
        data: cameras,
    });
});


/**
 * @desc    Get a single camera by ID
 * @route   GET /api/v1/cameras/:cameraId
 * @access  Public
 */
exports.getCamera = catchAsync(async (req, res, next) => {
    const { cameraId } = req.params;
    const camera = await cameraService.getCameraById(cameraId);

    if (!camera) {
        return next(new AppError('Camera not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: camera,
    });
});

/**
 * @desc    Update a camera by ID
 * @route   PUT /api/v1/cameras/:cameraId
 * @access  Public
 */
exports.updateCamera = catchAsync(async (req, res, next) => {
    const { cameraId } = req.params;
    const updatedCamera = await cameraService.updateCamera(cameraId, req.body);

    if (!updatedCamera) {
        return next(new AppError('Camera not found or update failed', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Camera updated successfully',
        data: updatedCamera,
    });
});

/**
 * @desc    Delete a camera by ID
 * @route   DELETE /api/v1/cameras/:cameraId
 * @access  Public
 */
exports.deleteCamera = catchAsync(async (req, res, next) => {
    const { cameraId } = req.params;
    const deletedCamera = await cameraService.deleteCamera(cameraId);

    if (!deletedCamera) {
        return next(new AppError('Camera not found or delete failed', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Camera deleted successfully',
    });
});
