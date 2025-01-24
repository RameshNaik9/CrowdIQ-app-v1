const express = require('express');
const { setupStream } = require('../controllers/streamController');
const router = express.Router();

router.post('/setup', setupStream);

module.exports = router;
