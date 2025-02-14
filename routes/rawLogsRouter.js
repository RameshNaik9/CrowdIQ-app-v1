const express = require("express");
const rawLogsController = require("../controllers/rawLogsController");

const router = express.Router();

router.get("/", rawLogsController.getRawLogs);
router.post("/update", rawLogsController.updateRawLog);

module.exports = router;
