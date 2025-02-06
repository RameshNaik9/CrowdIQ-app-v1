const express = require('express');
const cameraController = require('../controllers/cameraController');

const router = express.Router();

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
