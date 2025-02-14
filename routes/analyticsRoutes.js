const express = require("express");
const router = express.Router();
const { getAnalytics, storeAnalytics, getKPIAnalytics, getVisitorTrends, getAvgVisitorsByGender, getAgeRangeDistribution, getDwellTimeTrends, getVisitorSegmentation } = require("../controllers/analyticsController");

router.get("/", getAnalytics);
router.post("/", storeAnalytics);
// ✅ Fetch KPI data
router.get("/kpi", getKPIAnalytics);
router.get("/visitor-trends", getVisitorTrends);
router.get("/avg-visitors-gender", getAvgVisitorsByGender);
router.get("/age-range-distribution", getAgeRangeDistribution);
router.get("/dwell-time-trends", getDwellTimeTrends);
router.get("/visitor-segmentation", getVisitorSegmentation);

module.exports = router;
