const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getDashboard,
  getProfile,
  getResults,
  getAttendance,
  getFees,
  getNotifications,
  getDocuments,
  uploadDocument,
} = require("../controllers/studentController");
const { aiInsights } = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { documentUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Cap AI insight calls — 20/hour per student is plenty for this use case
const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20 });

router.use(protect, authorize("student"));

router.get("/dashboard", getDashboard);
router.get("/profile", getProfile);
router.get("/results", getResults);
router.get("/attendance", getAttendance);
router.get("/fees", getFees);
router.get("/notifications", getNotifications);
router.get("/documents", getDocuments);
router.post("/documents/upload", documentUpload.single("document"), uploadDocument);

router.get("/ai/insights", aiLimiter, aiInsights);

module.exports = router;