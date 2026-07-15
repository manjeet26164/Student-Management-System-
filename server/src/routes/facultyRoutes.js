const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getAssignedClasses,
  getAssignedStudents,
  markAttendance,
  uploadMarks,
  getClassRecords,
  getNotifications,
  getDocumentsForVerification,
  verifyDocument,
} = require("../controllers/facultyController");
const { aiClassInsights } = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { uploadMarksSchema, updateAttendanceSchema } = require("../validators/sharedValidators");

const router = express.Router();

const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 15 });

router.use(protect, authorize("faculty"));

router.get("/classes", getAssignedClasses);
router.get("/students", getAssignedStudents);
router.post("/attendance", validate(updateAttendanceSchema), markAttendance);
router.post("/marks", validate(uploadMarksSchema), uploadMarks);
router.get("/records", getClassRecords);
router.get("/notifications", getNotifications);
router.get("/documents", getDocumentsForVerification);
router.put("/documents/:documentId/verify", verifyDocument);

router.get("/ai/insights", aiLimiter, aiClassInsights);

module.exports = router;