const express = require("express");
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
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("faculty"));

router.get("/classes", getAssignedClasses);
router.get("/students", getAssignedStudents);
router.post("/attendance", markAttendance);
router.post("/marks", uploadMarks);
router.get("/records", getClassRecords);
router.get("/notifications", getNotifications);
router.get("/documents", getDocumentsForVerification);
router.put("/documents/:documentId/verify", verifyDocument);

module.exports = router;
