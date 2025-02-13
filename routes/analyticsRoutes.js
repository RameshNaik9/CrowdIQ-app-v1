const express = require("express");
const router = express.Router();
const { getAnalytics, storeAnalytics, getKPIAnalytics } = require("../controllers/analyticsController");

router.get("/", getAnalytics);
router.post("/", storeAnalytics);
// ✅ Fetch KPI data
router.get("/kpi", getKPIAnalytics);

module.exports = router;
