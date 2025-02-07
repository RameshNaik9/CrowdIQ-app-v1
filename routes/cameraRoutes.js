const express = require('express');
const cameraController = require('../controllers/cameraController');
const { performHealthCheck } = require('../services/healthCheckService');


const router = express.Router();


// ✅ Add API to trigger health check only for the user's cameras
router.post('/trigger-health-check', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ status: "Fail", message: "User ID is required." });
        }

        await performHealthCheck(userId); // ✅ Pass userId to performHealthCheck function

        res.status(200).json({ status: "Success", message: "Health check triggered for user's cameras." });
    } catch (err) {
        res.status(500).json({ status: "Fail", message: "Failed to perform health check." });
    }
});


// ✅ Connect & Register a New Camera
router.post('/connect', cameraController.connectCamera);

// ✅ Get all cameras (No authentication for now)
router.get('/', cameraController.getAllCameras);

// ✅ Get a single camera by ID
router.get('/:cameraId', cameraController.getCamera);

// ✅ Update a camera
router.put('/:cameraId', cameraController.updateCamera);

// ✅ Delete a camera
router.delete('/:cameraId', cameraController.deleteCamera);

module.exports = router;
