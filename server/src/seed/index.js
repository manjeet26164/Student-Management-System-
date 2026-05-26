require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const Fee = require("../models/Fee");
const Schedule = require("../models/Schedule");
const Document = require("../models/Document");

const runSeed = async () => {
  await connectDB();

  await Promise.all([
    Attendance.deleteMany({}),
    Result.deleteMany({}),
    Fee.deleteMany({}),
    Document.deleteMany({}),
    Schedule.deleteMany({}),
    Subject.deleteMany({}),
    Student.deleteMany({}),
    Faculty.deleteMany({}),
    User.deleteMany({}),
  ]);

  const adminUser = await User.create({
    fullName: "Dr. Arvind Menon",
    email: "admin@unierp.edu",
    universityId: "ADM1001",
    password: "Admin@123",
    role: "admin",
  });

  const facultyUser = await User.create({
    fullName: "Prof. Kavya Raman",
    email: "faculty@unierp.edu",
    universityId: "FAC2101",
    password: "Faculty@123",
    role: "faculty",
  });

  const faculty = await Faculty.create({
    user: facultyUser._id,
    employeeId: "EMP-7782",
    department: "Computer Science",
    designation: "Associate Professor",
  });

  const studentUser = await User.create({
    fullName: "Aarav Sharma",
    email: "student@unierp.edu",
    universityId: "STU23001",
    password: "Student@123",
    role: "student",
  });

  const student = await Student.create({
    user: studentUser._id,
    rollNumber: "CSE23A001",
    branch: "CSE",
    semester: 5,
    section: "A",
    batch: "2023-2027",
    totalCredits: 112,
    cgpa: 8.74,
    backlogs: 0,
    personalInfo: {
      phone: "+91-9876543210",
      dob: "2005-02-18",
      bloodGroup: "B+",
    },
    address: {
      line1: "21 Lakeview Residency",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560076",
    },
    guardian: {
      name: "Rohit Sharma",
      relation: "Father",
      phone: "+91-9898989898",
    },
  });

  const subjects = await Subject.insertMany([
    { code: "CS501", name: "Design and Analysis of Algorithms", credits: 4, semester: 5, branch: "CSE", faculty: faculty._id },
    { code: "CS502", name: "Operating Systems", credits: 4, semester: 5, branch: "CSE", faculty: faculty._id },
    { code: "CS503", name: "Database Management Systems", credits: 3, semester: 5, branch: "CSE", faculty: faculty._id },
    { code: "CS504", name: "Web Engineering", credits: 3, semester: 5, branch: "CSE", faculty: faculty._id },
  ]);

  faculty.assignedSubjects = subjects.map((s) => s._id);
  await faculty.save();

  await Attendance.insertMany([
    { student: student._id, subject: subjects[0]._id, present: 34, absent: 4, percentage: 89.47 },
    { student: student._id, subject: subjects[1]._id, present: 29, absent: 7, percentage: 80.56 },
    { student: student._id, subject: subjects[2]._id, present: 31, absent: 5, percentage: 86.11 },
    { student: student._id, subject: subjects[3]._id, present: 33, absent: 3, percentage: 91.67 },
  ]);

  await Result.create({
    student: student._id,
    semester: 5,
    subjects: [
      { subjectCode: "CS501", subjectName: "Design and Analysis of Algorithms", credits: 4, grade: "A", marks: 86 },
      { subjectCode: "CS502", subjectName: "Operating Systems", credits: 4, grade: "A-", marks: 81 },
      { subjectCode: "CS503", subjectName: "Database Management Systems", credits: 3, grade: "A", marks: 88 },
      { subjectCode: "CS504", subjectName: "Web Engineering", credits: 3, grade: "O", marks: 93 },
    ],
    sgpa: 8.91,
    cgpa: 8.74,
  });

  await Fee.create({
    student: student._id,
    semester: 5,
    totalAmount: 145000,
    paidAmount: 120000,
    dueDate: new Date("2026-04-10"),
    status: "partial",
    transactions: [
      { amount: 75000, mode: "UPI", reference: "TXN-338101", paidOn: new Date("2026-01-08") },
      { amount: 45000, mode: "Card", reference: "TXN-338962", paidOn: new Date("2026-02-05") },
    ],
  });

  await Schedule.create({
    student: student._id,
    day: "Monday",
    classes: [
      { time: "09:00 - 10:00", subject: "CS501", room: "A-403", faculty: "Prof. Kavya Raman" },
      { time: "10:15 - 11:15", subject: "CS503", room: "Lab-2", faculty: "Prof. Kavya Raman" },
      { time: "12:00 - 13:00", subject: "CS504", room: "A-210", faculty: "Prof. Kavya Raman" },
    ],
  });

  console.log("Seed complete");
  console.log("Admin login: ADM1001 / Admin@123");
  console.log("Faculty login: FAC2101 / Faculty@123");
  console.log("Student login: STU23001 / Student@123");
  console.log(`Admin created: ${adminUser.fullName}`);
  process.exit(0);
};

runSeed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
