const { callGemini, getFunctionCall, getText } = require("../services/geminiClient");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const Fee = require("../models/Fee");
const Faculty = require("../models/Faculty");

const filterTool = {
  name: "filter_students",
  description: "Extract structured filter criteria from an admin's natural language request about students.",
  parameters: {
    type: "OBJECT",
    properties: {
      branch: { type: "STRING", description: "e.g. CSE, ECE, ME" },
      semester: { type: "NUMBER" },
      section: { type: "STRING" },
      batch: { type: "STRING" },
      cgpaMin: { type: "NUMBER" },
      cgpaMax: { type: "NUMBER" },
      backlogsMin: { type: "NUMBER" },
      backlogsMax: { type: "NUMBER" },
    },
  },
};

const aiQueryStudents = async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ message: "query (string) is required" });
  }

  const aiResponse = await callGemini({
    system:
      "Extract search filters for a student database from the admin's request. Only include fields the admin actually mentioned.",
    userText: query,
    tool: filterTool,
    forceTool: true,
    maxOutputTokens: 300,
  });

  const functionCall = getFunctionCall(aiResponse);
  if (!functionCall) {
    return res.status(502).json({ message: "AI did not return a usable filter" });
  }

  const f = functionCall.args || {};
  const mongoFilter = {};
  if (f.branch) mongoFilter.branch = new RegExp(`^${f.branch}$`, "i");
  if (f.semester !== undefined) mongoFilter.semester = f.semester;
  if (f.section) mongoFilter.section = new RegExp(`^${f.section}$`, "i");
  if (f.batch) mongoFilter.batch = f.batch;
  if (f.cgpaMin !== undefined || f.cgpaMax !== undefined) {
    mongoFilter.cgpa = {};
    if (f.cgpaMin !== undefined) mongoFilter.cgpa.$gte = f.cgpaMin;
    if (f.cgpaMax !== undefined) mongoFilter.cgpa.$lte = f.cgpaMax;
  }
  if (f.backlogsMin !== undefined || f.backlogsMax !== undefined) {
    mongoFilter.backlogs = {};
    if (f.backlogsMin !== undefined) mongoFilter.backlogs.$gte = f.backlogsMin;
    if (f.backlogsMax !== undefined) mongoFilter.backlogs.$lte = f.backlogsMax;
  }

  const students = await Student.find(mongoFilter)
    .populate("user", "fullName email universityId")
    .limit(100);

  return res.json({ appliedFilter: f, count: students.length, students });
};

const aiInsights = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ message: "Student profile not found" });

  const [attendance, results, fees] = await Promise.all([
    Attendance.find({ student: student._id }),
    Result.find({ student: student._id }).sort({ semester: 1 }),
    Fee.find({ student: student._id }),
  ]);

  const avgAttendance = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : null;
  const pendingFees = fees.filter((f) => f.status !== "paid").length;

  const dataSummary = {
    cgpa: student.cgpa,
    backlogs: student.backlogs,
    avgAttendancePercent: avgAttendance,
    semesterResults: results.map((r) => ({ semester: r.semester, sgpa: r.sgpa })),
    pendingFeeRecords: pendingFees,
  };

  const aiResponse = await callGemini({
    system:
      "You are an academic advisor. Given a student's stats, respond with ONLY valid JSON: " +
      '{"riskLevel":"low|medium|high","summary":"2-3 sentence plain-language summary","recommendations":["max 3 short action items"]}.',
    userText: JSON.stringify(dataSummary),
    jsonMode: true,
    maxOutputTokens: 400,
  });

  const rawText = getText(aiResponse);
  let insight;
  try {
    insight = JSON.parse(rawText);
  } catch {
    return res.status(502).json({ message: "AI returned an unparsable response" });
  }

  return res.json({ stats: dataSummary, insight });
};

const aiClassInsights = async (req, res) => {
  const faculty = await Faculty.findOne({ user: req.user._id }).populate("assignedSubjects");
  if (!faculty) return res.status(404).json({ message: "Faculty profile not found" });

  const subjectIds = faculty.assignedSubjects.map((s) => s._id);
  const semesters = [...new Set(faculty.assignedSubjects.map((s) => s.semester))];
  const branches = [...new Set(faculty.assignedSubjects.map((s) => s.branch))];

  const students = await Student.find({ semester: { $in: semesters }, branch: { $in: branches } });
  const studentIds = students.map((s) => s._id);

  const [attendance, results] = await Promise.all([
    Attendance.find({ student: { $in: studentIds }, subject: { $in: subjectIds } }),
    Result.find({ student: { $in: studentIds } }),
  ]);

  const avgAttendance = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : null;

  const lowAttendanceCount = attendance.filter((a) => a.percentage < 75).length;
  const avgCgpa = students.length
    ? Number((students.reduce((s, st) => s + (st.cgpa || 0), 0) / students.length).toFixed(2))
    : null;
  const atRiskCount = students.filter((s) => s.cgpa < 6 || s.backlogs > 0).length;

  const dataSummary = {
    totalStudents: students.length,
    totalSubjects: faculty.assignedSubjects.length,
    avgAttendancePercent: avgAttendance,
    lowAttendanceRecords: lowAttendanceCount,
    avgCgpa,
    atRiskStudentCount: atRiskCount,
    totalResultRecords: results.length,
  };

  const aiResponse = await callGemini({
    system:
      "You are an academic performance advisor for a faculty member. Given aggregate class stats, respond with ONLY valid JSON: " +
      '{"classHealth":"low|medium|high","summary":"2-3 sentence plain-language summary","recommendations":["max 3 short action items for the faculty member"]}. ' +
      'classHealth reflects how healthy the class performance is: "high" is good, "low" needs urgent attention.',
    userText: JSON.stringify(dataSummary),
    jsonMode: true,
    maxOutputTokens: 400,
  });

  const rawText = getText(aiResponse);
  let insight;
  try {
    insight = JSON.parse(rawText);
  } catch {
    return res.status(502).json({ message: "AI returned an unparsable response" });
  }

  return res.json({ stats: dataSummary, insight });
};

module.exports = { aiQueryStudents, aiInsights, aiClassInsights };