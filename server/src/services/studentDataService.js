const Student = require("../models/Student");
const Result = require("../models/Result");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");

const buildStudentContext = async (userId) => {
  const student = await Student.findOne({ user: userId }).lean();

  if (!student) {
    return null;
  }

  const results = await Result.find({ student: student._id }).sort({ semester: 1 }).lean();
  const attendance = await Attendance.find({ student: student._id })
    .populate("subject", "name code")
    .lean();
  const fees = await Fee.find({ student: student._id }).sort({ semester: 1 }).lean();

  const resultLines = results.map(
    (r) => `Semester ${r.semester}: SGPA ${r.sgpa}, CGPA ${r.cgpa}`
  );

  const attendanceLines = attendance.map((a) => {
    const subjectName = a.subject?.name || "Unknown Subject";
    return `${subjectName}: ${a.percentage}% (present ${a.present}, absent ${a.absent})`;
  });

  const feeLines = fees.map(
    (f) => `Semester ${f.semester}: status ${f.status}, paid ${f.paidAmount}/${f.totalAmount}`
  );

  return [
    `Roll Number: ${student.rollNumber}`,
    `Branch: ${student.branch}, Section: ${student.section}, Current Semester: ${student.semester}, Batch: ${student.batch}`,
    `Overall CGPA: ${student.cgpa}, Total Credits: ${student.totalCredits}, Backlogs: ${student.backlogs}`,
    resultLines.length ? `Semester Results:\n${resultLines.join("\n")}` : "Semester Results: not available",
    attendanceLines.length ? `Attendance:\n${attendanceLines.join("\n")}` : "Attendance: not available",
    feeLines.length ? `Fee Records:\n${feeLines.join("\n")}` : "Fee Records: not available",
  ].join("\n\n");
};

module.exports = { buildStudentContext };