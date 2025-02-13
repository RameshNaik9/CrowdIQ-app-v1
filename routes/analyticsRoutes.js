const express = require("express");
const router = express.Router();
const { getAnalytics, storeAnalytics, getKPIAnalytics, getVisitorTrends } = require("../controllers/analyticsController");

router.get("/", getAnalytics);
router.post("/", storeAnalytics);
// ✅ Fetch KPI data
router.get("/kpi", getKPIAnalytics);
router.get("/visitor-trends", getVisitorTrends);

module.exports = router;
