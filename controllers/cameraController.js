const cameraService = require('../services/cameraService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');



/**
 * @desc    Connect & register a new camera
 * @route   POST /api/v1/cameras/connect
 * @access  Public (Will be protected later)
 */
exports.connectCamera = async (req, res, next) => {
    try {
        const { userId, name, location, username, password, ip_address, port, channel_number, stream_type } = req.body;

        if (!userId) {
            return next(new AppError('User ID is required', 400));
        }

        logger.info(`User ${userId} is connecting a new camera: ${name}`);

        // Call service to register and connect camera
        const result = await connectToCamera({
            userId,
            name,
            location,
            username,
            password,
            ip_address,
            port,
            channel_number,
            stream_type,
        });

        res.status(201).json({
            status: 'success',
            message: 'Camera connected successfully',
            data: result,
        });
    } catch (error) {
        logger.error(`Error in connectCamera: ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Get all cameras for a specific user
 * @route   GET /api/v1/cameras?userId=<USER_ID>
 * @access  Public (Will be protected later)
 */
exports.getAllCameras = catchAsync(async (req, res, next) => {
    const { userId } = req.query;

    if (!userId) {
        return next(new AppError('User ID is required', 400));
    }

    const cameras = await cameraService.getAllCamerasByUser(userId);

    res.status(200).json({
        status: 'success',
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
