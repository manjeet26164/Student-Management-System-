const express = require("express");
const rateLimit = require("express-rate-limit");
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
const { aiQueryStudents } = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  addStudentSchema,
  updateStudentSchema,
  addFacultySchema,
  updateFacultySchema,
  addSubjectSchema,
  updateSubjectSchema,
  uploadMarksSchema,
  updateAttendanceSchema,
  updateFeeSchema,
} = require("../validators/adminValidators");

const router = express.Router();

const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

router.use(protect, authorize("admin"));

router.get("/students", getStudents);
router.post("/students", validate(addStudentSchema), addStudent);
router.put("/students/:id", validate(updateStudentSchema), updateStudent);
router.delete("/students/:id", deleteStudent);

router.get("/faculties", getFaculties);
router.post("/faculties", validate(addFacultySchema), addFaculty);
router.put("/faculties/:id", validate(updateFacultySchema), updateFaculty);
router.delete("/faculties/:id", deleteFaculty);

router.get("/subjects", getSubjects);
router.post("/subjects", validate(addSubjectSchema), addSubject);
router.put("/subjects/:id", validate(updateSubjectSchema), updateSubject);
router.delete("/subjects/:id", deleteSubject);

router.post("/marks", validate(uploadMarksSchema), uploadMarks);
router.post("/attendance", validate(updateAttendanceSchema), updateAttendance);
router.post("/fees", validate(updateFeeSchema), updateFee);
router.post("/ai/query", aiLimiter, aiQueryStudents);

module.exports = router;