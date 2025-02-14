const express = require("express");
const rawDataLogController = require("../controllers/rawDataLogController");

const router = express.Router();

router.post("/dump", rawDataLogController.insertRawLogs);
router.get("/", rawDataLogController.getRawLogs);

module.exports = router;
