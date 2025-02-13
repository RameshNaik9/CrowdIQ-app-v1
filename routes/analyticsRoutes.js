const express = require("express");
const router = express.Router();
const { getAnalytics, storeAnalytics } = require("../controllers/analyticsController");

router.get("/", getAnalytics);
router.post("/", storeAnalytics);

module.exports = router;
