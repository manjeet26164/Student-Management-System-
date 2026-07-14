const request = require("supertest");
const User = require("../../src/models/User");
const Student = require("../../src/models/Student");
const Faculty = require("../../src/models/Faculty");

let counter = 0;
const unique = (prefix) => {
  counter += 1;
  return `${prefix}${Date.now()}${counter}`;
};

const createUser = async (overrides = {}) => {
  const role = overrides.role || "student";
  return User.create({
    fullName: overrides.fullName || "Test User",
    email: overrides.email || `${unique("user")}@test.com`,
    universityId: overrides.universityId || unique("UID"),
    password: overrides.password || "Password@123",
    role,
  });
};

const createStudent = async (overrides = {}) => {
  const user = await createUser({ role: "student", ...overrides.user });
  const student = await Student.create({
    user: user._id,
    rollNumber: overrides.rollNumber || unique("ROLL"),
    branch: overrides.branch || "CSE",
    semester: overrides.semester ?? 3,
    section: overrides.section || "A",
    batch: overrides.batch || "2023-2027",
    cgpa: overrides.cgpa ?? 8.2,
    backlogs: overrides.backlogs ?? 0,
  });
  return { user, student };
};

const createFaculty = async (overrides = {}) => {
  const user = await createUser({ role: "faculty", ...overrides.user });
  const faculty = await Faculty.create({
    user: user._id,
    employeeId: overrides.employeeId || unique("EMP"),
    department: overrides.department || "CSE",
    designation: overrides.designation || "Assistant Professor",
    assignedSubjects: overrides.assignedSubjects || [],
  });
  return { user, faculty };
};

const createAdmin = async (overrides = {}) => createUser({ role: "admin", ...overrides });

const loginAs = async (app, { identifier, password, role }) => {
  const res = await request(app)
    .post("/api/auth/login")
    .set("x-test-bypass-ratelimit", "true")
    .send({ identifier, password, role });
  const cookie = res.headers["set-cookie"];
  return { res, cookie };
};

module.exports = { createUser, createStudent, createFaculty, createAdmin, loginAs };