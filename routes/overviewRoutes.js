const express = require("express");
const router = express.Router();
const overviewController = require("../controllers/overviewController");

router.get("/", overviewController.getAnalytics);
router.post("/", overviewController.storeAnalytics);

module.exports = router;
