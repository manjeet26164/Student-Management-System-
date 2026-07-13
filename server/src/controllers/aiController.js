const { callClaude } = require("../services/anthropicClient");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const Fee = require("../models/Fee");

const filterTool = {
  name: "filter_students",
  description: "Extract structured filter criteria from an admin's natural language request about students.",
  input_schema: {
    type: "object",
    properties: {
      branch: { type: "string", description: "e.g. CSE, ECE, ME" },
      semester: { type: "number" },
      section: { type: "string" },
      batch: { type: "string" },
      cgpaMin: { type: "number" },
      cgpaMax: { type: "number" },
      backlogsMin: { type: "number" },
      backlogsMax: { type: "number" },
    },
  },
};

const aiQueryStudents = async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ message: "query (string) is required" });
  }

  const aiResponse = await callClaude({
    system: "Extract search filters for a student database from the admin's request. Only include fields the admin actually mentioned.",
    messages: [{ role: "user", content: query }],
    tools: [filterTool],
    tool_choice: { type: "tool", name: "filter_students" },
    max_tokens: 300,
  });

  const toolUse = aiResponse.content.find((block) => block.type === "tool_use");
  if (!toolUse) {
    return res.status(502).json({ message: "AI did not return a usable filter" });
  }

  const f = toolUse.input;
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

  const aiResponse = await callClaude({
    system:
      "You are an academic advisor. Given a student's stats, respond with ONLY valid JSON: " +
      '{"riskLevel":"low|medium|high","summary":"2-3 sentence plain-language summary","recommendations":["max 3 short action items"]}. No markdown, no extra text.',
    messages: [{ role: "user", content: JSON.stringify(dataSummary) }],
    max_tokens: 400,
  });

  const textBlock = aiResponse.content.find((b) => b.type === "text");
  let insight;
  try {
    insight = JSON.parse(textBlock.text);
  } catch {
    return res.status(502).json({ message: "AI returned an unparsable response" });
  }

  return res.json({ stats: dataSummary, insight });
};

module.exports = { aiQueryStudents, aiInsights };