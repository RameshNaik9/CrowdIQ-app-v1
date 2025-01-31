const express = require('express');
const { connectCamera, getCamerasForUser } = require('../controllers/cameraController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
// Route for connecting to a camerarouter.post('/connect', connectCamera);
router.get('/user/cameras', authMiddleware, getCamerasForUser); // ✅ Fetch cameras for logged-in user

module.exports = router;
