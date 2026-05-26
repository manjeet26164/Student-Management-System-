const express = require("express");
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
const { protect, authorize } = require("../middleware/authMiddleware");
const { documentUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect, authorize("student"));

router.get("/dashboard", getDashboard);
router.get("/profile", getProfile);
router.get("/results", getResults);
router.get("/attendance", getAttendance);
router.get("/fees", getFees);
router.get("/notifications", getNotifications);
router.get("/documents", getDocuments);
router.post("/documents/upload", documentUpload.single("document"), uploadDocument);

module.exports = router;
