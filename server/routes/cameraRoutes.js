const express = require('express');
const {
    connectCamera,
} = require('../controllers/cameraController');

const router = express.Router();

// Route for connecting to a camera
router.post('/connect', connectCamera);

module.exports = router;
