const express = require("express");
const {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  getFaculties,
  addFaculty,
  updateFaculty,
  deleteFaculty,
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
  uploadMarks,
  updateAttendance,
  updateFee,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/students", getStudents);
router.post("/students", addStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

router.get("/faculties", getFaculties);
router.post("/faculties", addFaculty);
router.put("/faculties/:id", updateFaculty);
router.delete("/faculties/:id", deleteFaculty);

router.get("/subjects", getSubjects);
router.post("/subjects", addSubject);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);

router.post("/marks", uploadMarks);
router.post("/attendance", updateAttendance);
router.post("/fees", updateFee);

module.exports = router;
