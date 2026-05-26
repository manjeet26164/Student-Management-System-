const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const Fee = require("../models/Fee");
const Schedule = require("../models/Schedule");
const Document = require("../models/Document");

const REQUIRED_DOCUMENTS = [
  { key: "aadhaar", label: "Aadhaar Card" },
  { key: "migration", label: "Migration Certificate" },
  { key: "marksheet_10", label: "10th Marksheet" },
  { key: "marksheet_12", label: "12th Marksheet" },
  { key: "bonafide", label: "Bonafide Certificate" },
  { key: "nptel", label: "NPTEL Certificate" },
];

const getCurrentStudent = async (userId) =>
  Student.findOne({ user: userId }).populate("user", "fullName email universityId role");

const getDashboard = async (req, res) => {
  const student = await getCurrentStudent(req.user._id);
  if (!student) return res.status(404).json({ message: "Student profile not found" });

  const attendance = await Attendance.find({ student: student._id }).populate("subject", "code name");
  const latestResult = await Result.findOne({ student: student._id }).sort({ semester: -1 });
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const schedule = await Schedule.findOne({ student: student._id, day: today });

  const attendancePercent = attendance.length
    ? Math.round(attendance.reduce((sum, item) => sum + item.percentage, 0) / attendance.length)
    : 0;

  return res.json({
    welcome: {
      name: student.user.fullName,
      semester: student.semester,
      branch: student.branch,
    },
    summary: {
      cgpa: student.cgpa,
      attendancePercent,
      totalCredits: student.totalCredits,
      backlogs: student.backlogs,
    },
    subjectAttendance: attendance,
    todaySchedule: schedule ? schedule.classes : [],
    latestResult,
  });
};

const getProfile = async (req, res) => {
  const student = await getCurrentStudent(req.user._id);
  if (!student) return res.status(404).json({ message: "Student profile not found" });
  return res.json(student);
};

const getResults = async (req, res) => {
  const student = await getCurrentStudent(req.user._id);
  if (!student) return res.status(404).json({ message: "Student profile not found" });

  const results = await Result.find({ student: student._id }).sort({ semester: 1 });
  return res.json(results);
};

const getAttendance = async (req, res) => {
  const student = await getCurrentStudent(req.user._id);
  if (!student) return res.status(404).json({ message: "Student profile not found" });

  const attendance = await Attendance.find({ student: student._id }).populate("subject", "code name credits");
  const totalPresent = attendance.reduce((sum, item) => sum + item.present, 0);
  const totalAbsent = attendance.reduce((sum, item) => sum + item.absent, 0);
  const totalClasses = totalPresent + totalAbsent;

  return res.json({
    totalPresent,
    totalAbsent,
    totalClasses,
    overallPercentage: totalClasses ? Number(((totalPresent / totalClasses) * 100).toFixed(2)) : 0,
    subjects: attendance,
  });
};

const getFees = async (req, res) => {
  const student = await getCurrentStudent(req.user._id);
  if (!student) return res.status(404).json({ message: "Student profile not found" });

  const fees = await Fee.find({ student: student._id }).sort({ semester: 1 });

  const total = fees.reduce((sum, f) => sum + f.totalAmount, 0);
  const paid = fees.reduce((sum, f) => sum + f.paidAmount, 0);

  return res.json({
    summary: {
      total,
      paid,
      pending: total - paid,
    },
    records: fees,
  });
};

const getNotifications = async (req, res) => {
  const student = await getCurrentStudent(req.user._id);
  if (!student) return res.status(404).json({ message: "Student profile not found" });

  const attendance = await Attendance.find({ student: student._id }).populate("subject", "code name");
  const fees = await Fee.find({ student: student._id }).sort({ semester: -1 });

  const notifications = [];

  attendance
    .filter((row) => row.percentage < 75)
    .forEach((row) => {
      notifications.push({
        type: "warning",
        title: "Low attendance alert",
        message: `${row.subject?.code || "Subject"} attendance is ${row.percentage}%`,
        createdAt: row.updatedAt,
      });
    });

  fees
    .filter((fee) => fee.status !== "paid")
    .forEach((fee) => {
      notifications.push({
        type: "info",
        title: "Fee payment pending",
        message: `Semester ${fee.semester} has pending amount INR ${fee.totalAmount - fee.paidAmount}`,
        createdAt: fee.updatedAt,
      });
    });

  notifications.push({
    type: "success",
    title: "Portal update",
    message: "Your dashboard modules were refreshed with latest ERP services.",
    createdAt: new Date(),
  });

  return res.json(notifications.slice(0, 8));
};

const getDocuments = async (req, res) => {
  const student = await getCurrentStudent(req.user._id);
  if (!student) return res.status(404).json({ message: "Student profile not found" });

  const docs = await Document.find({ student: student._id }).populate("verifiedBy", "employeeId");
  const docsByType = new Map(docs.map((doc) => [doc.docType, doc]));

  const response = REQUIRED_DOCUMENTS.map((documentMeta) => {
    const found = docsByType.get(documentMeta.key);
    if (!found) {
      return {
        docType: documentMeta.key,
        label: documentMeta.label,
        uploaded: false,
        status: "not_uploaded",
      };
    }

    return {
      _id: found._id,
      docType: found.docType,
      label: documentMeta.label,
      uploaded: true,
      status: found.status,
      fileUrl: found.fileUrl,
      originalName: found.originalName,
      uploadedAt: found.uploadedAt,
      verifiedAt: found.verifiedAt,
      verifiedBy: found.verifiedBy,
    };
  });

  return res.json(response);
};

const uploadDocument = async (req, res) => {
  const student = await getCurrentStudent(req.user._id);
  if (!student) return res.status(404).json({ message: "Student profile not found" });

  if (!req.file) {
    return res.status(400).json({ message: "PDF file is required" });
  }

  const { docType } = req.body;
  const validTypes = REQUIRED_DOCUMENTS.map((doc) => doc.key);
  if (!docType || !validTypes.includes(docType)) {
    return res.status(400).json({ message: "Invalid document type" });
  }

  const payload = {
    student: student._id,
    docType,
    originalName: req.file.originalname,
    fileName: req.file.filename,
    fileUrl: `/uploads/documents/${req.file.filename}`,
    status: "pending",
    verifiedBy: null,
    verifiedAt: null,
    uploadedAt: new Date(),
  };

  const doc = await Document.findOneAndUpdate(
    { student: student._id, docType },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json(doc);
};

module.exports = {
  getDashboard,
  getProfile,
  getResults,
  getAttendance,
  getFees,
  getNotifications,
  getDocuments,
  uploadDocument,
};
