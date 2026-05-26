const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const Document = require("../models/Document");

const getFacultyProfile = async (userId) =>
  Faculty.findOne({ user: userId }).populate("user", "fullName email universityId").populate("assignedSubjects");

const getAssignedClasses = async (req, res) => {
  const faculty = await getFacultyProfile(req.user._id);
  if (!faculty) return res.status(404).json({ message: "Faculty profile not found" });

  return res.json({ faculty, subjects: faculty.assignedSubjects });
};

const getAssignedStudents = async (req, res) => {
  const faculty = await getFacultyProfile(req.user._id);
  if (!faculty) return res.status(404).json({ message: "Faculty profile not found" });

  const semesters = [...new Set(faculty.assignedSubjects.map((s) => s.semester))];
  const branches = [...new Set(faculty.assignedSubjects.map((s) => s.branch))];

  const students = await Student.find({ semester: { $in: semesters }, branch: { $in: branches } })
    .populate("user", "fullName universityId email")
    .sort({ semester: 1 });

  return res.json(students);
};

const markAttendance = async (req, res) => {
  const { studentId, subjectId, present, absent } = req.body;
  if (!studentId || !subjectId || present === undefined || absent === undefined) {
    return res.status(400).json({ message: "studentId, subjectId, present, absent are required" });
  }

  const faculty = await getFacultyProfile(req.user._id);
  if (!faculty) return res.status(404).json({ message: "Faculty profile not found" });

  const isAssigned = faculty.assignedSubjects.some((s) => s._id.toString() === subjectId);
  if (!isAssigned) return res.status(403).json({ message: "Not authorized for this subject" });

  const total = Number(present) + Number(absent);
  const percentage = total ? Number(((present / total) * 100).toFixed(2)) : 0;

  const attendance = await Attendance.findOneAndUpdate(
    { student: studentId, subject: subjectId },
    { present, absent, percentage },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.json(attendance);
};

const uploadMarks = async (req, res) => {
  const { studentId, semester, subjects, sgpa, cgpa } = req.body;

  if (!studentId || !semester || !Array.isArray(subjects)) {
    return res.status(400).json({ message: "studentId, semester and subjects are required" });
  }

  const normalizedSubjects = subjects
    .filter((item) => item && item.subjectCode && item.subjectName)
    .map((item) => ({
      subjectCode: item.subjectCode,
      subjectName: item.subjectName,
      credits: Number(item.credits) || 0,
      grade: item.grade || "",
      marks: Number(item.marks) || 0,
    }));

  if (!normalizedSubjects.length) {
    return res.status(400).json({ message: "At least one valid subject is required" });
  }

  let result = await Result.findOne({ student: studentId, semester });

  if (!result) {
    result = await Result.create({
      student: studentId,
      semester,
      subjects: normalizedSubjects,
      sgpa,
      cgpa,
    });
  } else {
    const merged = [...result.subjects];

    normalizedSubjects.forEach((incoming) => {
      const index = merged.findIndex(
        (subject) => subject.subjectCode.toLowerCase() === incoming.subjectCode.toLowerCase()
      );

      if (index >= 0) {
        merged[index] = incoming;
      } else {
        merged.push(incoming);
      }
    });

    result.subjects = merged;
    if (sgpa !== undefined) result.sgpa = sgpa;
    if (cgpa !== undefined) result.cgpa = cgpa;
    await result.save();
  }

  if (cgpa !== undefined) {
    await Student.findByIdAndUpdate(studentId, { cgpa });
  }

  return res.json(result);
};

const getClassRecords = async (req, res) => {
  const faculty = await getFacultyProfile(req.user._id);
  if (!faculty) return res.status(404).json({ message: "Faculty profile not found" });

  const subjectIds = faculty.assignedSubjects.map((s) => s._id);
  const attendance = await Attendance.find({ subject: { $in: subjectIds } })
    .populate("student", "rollNumber semester branch")
    .populate("subject", "code name")
    .sort({ updatedAt: -1 });

  return res.json(attendance);
};

const getNotifications = async (req, res) => {
  const faculty = await getFacultyProfile(req.user._id);
  if (!faculty) return res.status(404).json({ message: "Faculty profile not found" });

  const recordsCount = await Attendance.countDocuments({
    subject: { $in: faculty.assignedSubjects.map((subject) => subject._id) },
  });

  const notifications = [
    {
      type: "info",
      title: "Today classes",
      message: `You are assigned to ${faculty.assignedSubjects.length} active subjects.`,
      createdAt: new Date(),
    },
    {
      type: "warning",
      title: "Records review",
      message: `${recordsCount} attendance records are available for verification.`,
      createdAt: new Date(),
    },
    {
      type: "success",
      title: "Academic portal update",
      message: "Marks and attendance tools are now available from your dashboard.",
      createdAt: new Date(),
    },
  ];

  return res.json(notifications);
};

const getDocumentsForVerification = async (req, res) => {
  const faculty = await getFacultyProfile(req.user._id);
  if (!faculty) return res.status(404).json({ message: "Faculty profile not found" });

  const docs = await Document.find({ status: { $in: ["pending", "verified"] } })
    .populate({
      path: "student",
      populate: { path: "user", select: "fullName universityId" },
      select: "rollNumber branch semester",
    })
    .populate("verifiedBy", "employeeId")
    .sort({ updatedAt: -1 });

  return res.json(docs);
};

const verifyDocument = async (req, res) => {
  const faculty = await getFacultyProfile(req.user._id);
  if (!faculty) return res.status(404).json({ message: "Faculty profile not found" });

  const doc = await Document.findById(req.params.documentId);
  if (!doc) return res.status(404).json({ message: "Document not found" });

  doc.status = "verified";
  doc.verifiedBy = faculty._id;
  doc.verifiedAt = new Date();
  await doc.save();

  return res.json({ message: "Document verified successfully", doc });
};

module.exports = {
  getAssignedClasses,
  getAssignedStudents,
  markAttendance,
  uploadMarks,
  getClassRecords,
  getNotifications,
  getDocumentsForVerification,
  verifyDocument,
};
