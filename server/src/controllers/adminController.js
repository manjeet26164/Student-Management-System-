const User = require("../models/User");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Subject = require("../models/Subject");
const Result = require("../models/Result");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const Document = require("../models/Document");

const buildStudentPayload = (body) => {
  const payload = {};

  const scalarFields = [
    "user",
    "rollNumber",
    "branch",
    "semester",
    "section",
    "batch",
    "cgpa",
    "backlogs",
    "totalCredits",
  ];

  scalarFields.forEach((field) => {
    if (body[field] !== undefined && body[field] !== "") payload[field] = body[field];
  });

  if (
    body.phone !== undefined ||
    body.dob !== undefined ||
    body.bloodGroup !== undefined
  ) {
    payload.personalInfo = {
      phone: body.phone || "",
      dob: body.dob || "",
      bloodGroup: body.bloodGroup || "",
    };
  }

  if (
    body.addressLine1 !== undefined ||
    body.city !== undefined ||
    body.state !== undefined ||
    body.pincode !== undefined
  ) {
    payload.address = {
      line1: body.addressLine1 || "",
      city: body.city || "",
      state: body.state || "",
      pincode: body.pincode || "",
    };
  }

  if (
    body.guardianName !== undefined ||
    body.guardianRelation !== undefined ||
    body.guardianPhone !== undefined
  ) {
    payload.guardian = {
      name: body.guardianName || "",
      relation: body.guardianRelation || "",
      phone: body.guardianPhone || "",
    };
  }

  return payload;
};

const getStudents = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    Student.find()
      .populate("user", "fullName email universityId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Student.countDocuments(),
  ]);

  return res.json({
    students,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

const addStudent = async (req, res) => {
  const {
    fullName,
    email,
    universityId,
    password,
    rollNumber,
    branch,
    semester,
    section,
    batch,
    cgpa,
    backlogs,
    totalCredits,
    phone,
    dob,
    bloodGroup,
    addressLine1,
    city,
    state,
    pincode,
    guardianName,
    guardianRelation,
    guardianPhone,
  } = req.body;

  if (!fullName || !email || !universityId || !password || !rollNumber || !branch || !semester || !section || !batch) {
    return res.status(400).json({ message: "Missing required student fields" });
  }

  const userExists = await User.findOne({ $or: [{ email }, { universityId }] });
  if (userExists) return res.status(409).json({ message: "User with email or ID already exists" });

  const studentExists = await Student.findOne({ rollNumber });
  if (studentExists) return res.status(409).json({ message: "Roll number already exists" });

  const user = await User.create({ fullName, email, universityId, password, role: "student" });
  const studentPayload = buildStudentPayload({
    user: user._id,
    rollNumber,
    branch,
    semester,
    section,
    batch,
    totalCredits: totalCredits || 0,
    cgpa: cgpa || 0,
    backlogs: backlogs || 0,
    phone,
    dob,
    bloodGroup,
    addressLine1,
    city,
    state,
    pincode,
    guardianName,
    guardianRelation,
    guardianPhone,
  });

  const student = await Student.create(studentPayload);

  return res.status(201).json({ user, student });
};

const updateStudent = async (req, res) => {
  const student = await Student.findById(req.params.id).populate("user");
  if (!student) return res.status(404).json({ message: "Student not found" });

  const {
    fullName,
    email,
    universityId,
    password,
    rollNumber,
    branch,
    semester,
    section,
    batch,
    cgpa,
    backlogs,
    totalCredits,
    phone,
    dob,
    bloodGroup,
    addressLine1,
    city,
    state,
    pincode,
    guardianName,
    guardianRelation,
    guardianPhone,
  } = req.body;

  if (fullName) student.user.fullName = fullName;
  if (email) student.user.email = email.toLowerCase();
  if (universityId) student.user.universityId = universityId;
  if (password) student.user.password = password;
  await student.user.save();

  const studentPayload = buildStudentPayload({
    rollNumber,
    branch,
    semester,
    section,
    batch,
    cgpa,
    backlogs,
    totalCredits,
    phone,
    dob,
    bloodGroup,
    addressLine1,
    city,
    state,
    pincode,
    guardianName,
    guardianRelation,
    guardianPhone,
  });

  Object.assign(student, studentPayload);

  await student.save();

  return res.json(student);
};

const getFaculties = async (req, res) => {
  const faculties = await Faculty.find()
    .populate("user", "fullName email universityId")
    .populate("assignedSubjects", "code name")
    .sort({ createdAt: -1 });
  return res.json(faculties);
};

const addFaculty = async (req, res) => {
  const {
    fullName,
    email,
    universityId,
    password,
    employeeId,
    department,
    designation,
    assignedSubjects,
  } = req.body;

  if (!fullName || !email || !universityId || !password || !employeeId || !department || !designation) {
    return res.status(400).json({ message: "Missing required faculty fields" });
  }

  const userExists = await User.findOne({ $or: [{ email }, { universityId }] });
  if (userExists) return res.status(409).json({ message: "User with email or ID already exists" });

  const employeeExists = await Faculty.findOne({ employeeId });
  if (employeeExists) return res.status(409).json({ message: "Employee ID already exists" });

  const user = await User.create({ fullName, email, universityId, password, role: "faculty" });
  const faculty = await Faculty.create({
    user: user._id,
    employeeId,
    department,
    designation,
    assignedSubjects: Array.isArray(assignedSubjects) ? assignedSubjects : [],
  });

  await Subject.updateMany(
    { _id: { $in: faculty.assignedSubjects } },
    { faculty: faculty._id }
  );

  return res.status(201).json({ user, faculty });
};

const updateFaculty = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).populate("user");
  if (!faculty) return res.status(404).json({ message: "Faculty not found" });

  const {
    fullName,
    email,
    universityId,
    password,
    employeeId,
    department,
    designation,
    assignedSubjects,
  } = req.body;

  if (fullName) faculty.user.fullName = fullName;
  if (email) faculty.user.email = email.toLowerCase();
  if (universityId) faculty.user.universityId = universityId;
  if (password) faculty.user.password = password;
  await faculty.user.save();

  if (employeeId) faculty.employeeId = employeeId;
  if (department) faculty.department = department;
  if (designation) faculty.designation = designation;
  if (Array.isArray(assignedSubjects)) faculty.assignedSubjects = assignedSubjects;

  await faculty.save();

  await Subject.updateMany({ faculty: faculty._id }, { $unset: { faculty: 1 } });
  await Subject.updateMany(
    { _id: { $in: faculty.assignedSubjects } },
    { faculty: faculty._id }
  );

  return res.json(faculty);
};

const deleteFaculty = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);
  if (!faculty) return res.status(404).json({ message: "Faculty not found" });

  await Promise.all([
    Subject.updateMany({ faculty: faculty._id }, { $unset: { faculty: 1 } }),
    User.findByIdAndDelete(faculty.user),
    Faculty.findByIdAndDelete(faculty._id),
  ]);

  return res.json({ message: "Faculty removed successfully" });
};

const deleteStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });

  await Promise.all([
    User.findByIdAndDelete(student.user),
    Result.deleteMany({ student: student._id }),
    Attendance.deleteMany({ student: student._id }),
    Fee.deleteMany({ student: student._id }),
    Document.deleteMany({ student: student._id }),
    Student.findByIdAndDelete(student._id),
  ]);

  return res.json({ message: "Student removed successfully" });
};

const getSubjects = async (req, res) => {
  const subjects = await Subject.find().populate({ path: "faculty", populate: { path: "user", select: "fullName" } });
  return res.json(subjects);
};

const addSubject = async (req, res) => {
  const { code, name, credits, semester, branch, faculty } = req.body;
  if (!code || !name || !credits || !semester || !branch) {
    return res.status(400).json({ message: "Missing required subject fields" });
  }

  const exists = await Subject.findOne({ code });
  if (exists) return res.status(409).json({ message: "Subject code already exists" });

  const subject = await Subject.create({ code, name, credits, semester, branch, faculty: faculty || null });
  return res.status(201).json(subject);
};

const updateSubject = async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) return res.status(404).json({ message: "Subject not found" });

  Object.assign(subject, req.body);
  await subject.save();
  return res.json(subject);
};

const deleteSubject = async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) return res.status(404).json({ message: "Subject not found" });

  await subject.deleteOne();
  return res.json({ message: "Subject removed successfully" });
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

const updateAttendance = async (req, res) => {
  const { studentId, subjectId, present, absent } = req.body;
  if (!studentId || !subjectId || present === undefined || absent === undefined) {
    return res.status(400).json({ message: "studentId, subjectId, present, and absent are required" });
  }

  const total = Number(present) + Number(absent);
  const percentage = total ? Number(((present / total) * 100).toFixed(2)) : 0;

  const attendance = await Attendance.findOneAndUpdate(
    { student: studentId, subject: subjectId },
    { present, absent, percentage },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.json(attendance);
};

const updateFee = async (req, res) => {
  const { studentId, semester, totalAmount, paidAmount, dueDate, status, transaction } = req.body;
  if (!studentId || !semester || totalAmount === undefined || paidAmount === undefined) {
    return res.status(400).json({ message: "Missing required fee fields" });
  }

  const update = {
    totalAmount,
    paidAmount,
    dueDate,
    status: status || (paidAmount >= totalAmount ? "paid" : paidAmount > 0 ? "partial" : "pending"),
  };

  if (transaction) {
    update.$push = { transactions: transaction };
  }

  const fee = await Fee.findOneAndUpdate(
    { student: studentId, semester },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.json(fee);
};

module.exports = {
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
};
