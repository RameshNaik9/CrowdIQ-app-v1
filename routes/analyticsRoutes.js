const express = require("express");
const router = express.Router();
const { getAnalytics, storeAnalytics, getKPIAnalytics, getVisitorTrends, getAvgVisitorsByGender } = require("../controllers/analyticsController");

router.get("/", getAnalytics);
router.post("/", storeAnalytics);
// ✅ Fetch KPI data
router.get("/kpi", getKPIAnalytics);
router.get("/visitor-trends", getVisitorTrends);
router.get("/avg-visitors-gender", getAvgVisitorsByGender);

module.exports = router;
