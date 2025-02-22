const express = require("express");
const router = express.Router();
const { triggerInference } = require("../controllers/inferenceController");

router.post("/trigger", triggerInference);

module.exports = router;
