const request = require("supertest");
const app = require("../src/app");
const { connect, closeDatabase, clearDatabase } = require("./utils/db");
const { createStudent, createFaculty, createAdmin, loginAs } = require("./utils/factories");
const Subject = require("../src/models/Subject");
const Attendance = require("../src/models/Attendance");
const Result = require("../src/models/Result");
const Document = require("../src/models/Document");

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

const FACULTY_CREDS = { email: "fac@test.com", universityId: "FAC1001", password: "Password@123" };

const setupFacultyWithSubject = async (subjectOverrides = {}) => {
  const subject = await Subject.create({
    code: "CS101",
    name: "Data Structures",
    credits: 4,
    semester: 3,
    branch: "CSE",
    ...subjectOverrides,
  });

  const { user, faculty } = await createFaculty({
    user: FACULTY_CREDS,
    assignedSubjects: [subject._id],
  });

  const { cookie } = await loginAs(app, {
    identifier: FACULTY_CREDS.email,
    password: FACULTY_CREDS.password,
    role: "faculty",
  });

  return { user, faculty, subject, cookie };
};

describe("Faculty routes - authentication & role guard", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/faculty/classes");
    expect(res.status).toBe(401);
  });

  it("rejects a non-faculty role (student)", async () => {
    await createStudent({
      user: { email: "stu@test.com", universityId: "STU9001", password: "Password@123" },
      rollNumber: "ROLL9001",
    });
    const { cookie } = await loginAs(app, {
      identifier: "stu@test.com",
      password: "Password@123",
      role: "student",
    });

    const res = await request(app).get("/api/faculty/classes").set("Cookie", cookie);
    expect(res.status).toBe(403);
  });

  it("rejects a non-faculty role (admin)", async () => {
    await createAdmin({ email: "admin9@test.com", universityId: "ADM9001", password: "Password@123" });
    const { cookie } = await loginAs(app, {
      identifier: "admin9@test.com",
      password: "Password@123",
      role: "admin",
    });

    const res = await request(app).get("/api/faculty/classes").set("Cookie", cookie);
    expect(res.status).toBe(403);
  });
});

describe("GET /api/faculty/classes", () => {
  it("returns the faculty profile with assigned subjects", async () => {
    const { subject, cookie } = await setupFacultyWithSubject();

    const res = await request(app).get("/api/faculty/classes").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.subjects).toHaveLength(1);
    expect(res.body.subjects[0].code).toBe(subject.code);
  });

  it("returns 404 when faculty profile does not exist for the user", async () => {
    // A faculty-role user without a linked Faculty document (edge case).
    const { createUser } = require("./utils/factories");
    await createUser({ role: "faculty", email: "orphan@test.com", universityId: "FAC9002", password: "Password@123" });
    const { cookie } = await loginAs(app, {
      identifier: "orphan@test.com",
      password: "Password@123",
      role: "faculty",
    });

    const res = await request(app).get("/api/faculty/classes").set("Cookie", cookie);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/faculty/students", () => {
  it("returns students matching the faculty's assigned subjects (semester + branch)", async () => {
    const { cookie } = await setupFacultyWithSubject({ semester: 3, branch: "CSE" });

    await createStudent({
      user: { email: "match@test.com", universityId: "STU9010", password: "Password@123" },
      rollNumber: "ROLL9010",
      semester: 3,
      branch: "CSE",
    });
    await createStudent({
      user: { email: "nomatch@test.com", universityId: "STU9011", password: "Password@123" },
      rollNumber: "ROLL9011",
      semester: 5,
      branch: "ECE",
    });

    const res = await request(app).get("/api/faculty/students").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].rollNumber).toBe("ROLL9010");
  });
});

describe("POST /api/faculty/attendance", () => {
  it("rejects missing required fields with 400", async () => {
    const { cookie } = await setupFacultyWithSubject();
    const res = await request(app).post("/api/faculty/attendance").set("Cookie", cookie).send({});
    expect(res.status).toBe(400);
  });

  it("returns 403 when marking attendance for a subject not assigned to the faculty", async () => {
    const { cookie } = await setupFacultyWithSubject();
    const { student } = await createStudent({
      user: { email: "att1@test.com", universityId: "STU9020", password: "Password@123" },
      rollNumber: "ROLL9020",
    });
    const otherSubject = await Subject.create({
      code: "CS999",
      name: "Unrelated Subject",
      credits: 3,
      semester: 3,
      branch: "CSE",
    });

    const res = await request(app)
      .post("/api/faculty/attendance")
      .set("Cookie", cookie)
      .send({ studentId: student._id.toString(), subjectId: otherSubject._id.toString(), present: 5, absent: 1 });

    expect(res.status).toBe(403);
  });

  it("creates/updates attendance and computes percentage for an assigned subject", async () => {
    const { subject, cookie } = await setupFacultyWithSubject();
    const { student } = await createStudent({
      user: { email: "att2@test.com", universityId: "STU9021", password: "Password@123" },
      rollNumber: "ROLL9021",
    });

    const res = await request(app)
      .post("/api/faculty/attendance")
      .set("Cookie", cookie)
      .send({ studentId: student._id.toString(), subjectId: subject._id.toString(), present: 18, absent: 2 });

    expect(res.status).toBe(200);
    expect(res.body.percentage).toBe(90);

    const stored = await Attendance.findOne({ student: student._id, subject: subject._id });
    expect(stored.present).toBe(18);
    expect(stored.absent).toBe(2);
  });
});

describe("POST /api/faculty/marks (uploadMarks authorization)", () => {
  it("rejects missing required fields with 400", async () => {
    const { cookie } = await setupFacultyWithSubject();
    const res = await request(app).post("/api/faculty/marks").set("Cookie", cookie).send({});
    expect(res.status).toBe(400);
  });

  it("returns 403 when uploading marks for a subject code not assigned to the faculty", async () => {
    const { cookie } = await setupFacultyWithSubject(); // faculty only owns CS101
    const { student } = await createStudent({
      user: { email: "marks1@test.com", universityId: "STU9030", password: "Password@123" },
      rollNumber: "ROLL9030",
    });

    const res = await request(app)
      .post("/api/faculty/marks")
      .set("Cookie", cookie)
      .send({
        studentId: student._id.toString(),
        semester: 3,
        subjects: [{ subjectCode: "CS999", subjectName: "Unauthorized Subject", credits: 4, grade: "A", marks: 90 }],
      });

    expect(res.status).toBe(403);
    const result = await Result.findOne({ student: student._id, semester: 3 });
    expect(result).toBeNull(); // confirms no data was written for the unauthorized attempt
  });

  it("allows uploading marks for an assigned subject code (case-insensitive)", async () => {
    const { cookie } = await setupFacultyWithSubject(); // faculty owns CS101
    const { student } = await createStudent({
      user: { email: "marks2@test.com", universityId: "STU9031", password: "Password@123" },
      rollNumber: "ROLL9031",
    });

    const res = await request(app)
      .post("/api/faculty/marks")
      .set("Cookie", cookie)
      .send({
        studentId: student._id.toString(),
        semester: 3,
        subjects: [{ subjectCode: "cs101", subjectName: "Data Structures", credits: 4, grade: "A", marks: 92 }],
        cgpa: 9.1,
      });

    expect(res.status).toBe(200);
    expect(res.body.subjects[0].subjectCode.toLowerCase()).toBe("cs101");

    const Student = require("../src/models/Student");
    const updatedStudent = await Student.findById(student._id);
    expect(updatedStudent.cgpa).toBe(9.1);
  });

  it("merges new subject marks into an existing result for the same semester", async () => {
    const { subject, cookie } = await setupFacultyWithSubject();
    const secondSubject = await Subject.create({
      code: "CS102",
      name: "Algorithms",
      credits: 4,
      semester: 3,
      branch: "CSE",
    });
    // Re-login not needed; assign both subjects directly on the faculty doc for this test.
    const Faculty = require("../src/models/Faculty");
    const facultyDoc = await Faculty.findOne({ "user": (await require("../src/models/User").findOne({ email: FACULTY_CREDS.email }))._id });
    facultyDoc.assignedSubjects.push(secondSubject._id);
    await facultyDoc.save();

    const { student } = await createStudent({
      user: { email: "marks3@test.com", universityId: "STU9032", password: "Password@123" },
      rollNumber: "ROLL9032",
    });

    await Result.create({
      student: student._id,
      semester: 3,
      subjects: [{ subjectCode: "CS101", subjectName: "Data Structures", credits: 4, grade: "A", marks: 90 }],
    });

    const res = await request(app)
      .post("/api/faculty/marks")
      .set("Cookie", cookie)
      .send({
        studentId: student._id.toString(),
        semester: 3,
        subjects: [{ subjectCode: "CS102", subjectName: "Algorithms", credits: 4, grade: "B", marks: 75 }],
      });

    expect(res.status).toBe(200);
    expect(res.body.subjects).toHaveLength(2);
  });
});

describe("GET /api/faculty/records", () => {
  it("returns attendance records for the faculty's assigned subjects only", async () => {
    const { subject, cookie } = await setupFacultyWithSubject();
    const { student } = await createStudent({
      user: { email: "rec1@test.com", universityId: "STU9040", password: "Password@123" },
      rollNumber: "ROLL9040",
    });
    const otherSubject = await Subject.create({
      code: "CS200",
      name: "Other Subject",
      credits: 3,
      semester: 5,
      branch: "ECE",
    });

    await Attendance.create({ student: student._id, subject: subject._id, present: 10, absent: 0, percentage: 100 });
    await Attendance.create({ student: student._id, subject: otherSubject._id, present: 5, absent: 5, percentage: 50 });

    const res = await request(app).get("/api/faculty/records").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].subject.code).toBe(subject.code);
  });
});

describe("GET /api/faculty/notifications", () => {
  it("returns a notifications list summarizing assigned subjects and records", async () => {
    const { subject, cookie } = await setupFacultyWithSubject();
    const { student } = await createStudent({
      user: { email: "notif1@test.com", universityId: "STU9050", password: "Password@123" },
      rollNumber: "ROLL9050",
    });
    await Attendance.create({ student: student._id, subject: subject._id, present: 10, absent: 0, percentage: 100 });

    const res = await request(app).get("/api/faculty/notifications").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(res.body.some((n) => n.message.includes("1 active subjects"))).toBe(true);
  });
});

describe("GET /api/faculty/documents", () => {
  it("returns pending and verified documents, excluding other statuses", async () => {
    const { cookie } = await setupFacultyWithSubject();
    const { student } = await createStudent({
      user: { email: "doc1@test.com", universityId: "STU9060", password: "Password@123" },
      rollNumber: "ROLL9060",
    });

    await Document.create({
      student: student._id,
      docType: "bonafide",
      originalName: "bonafide.pdf",
      fileName: "bonafide-1.pdf",
      fileUrl: "/uploads/bonafide-1.pdf",
      status: "pending",
    });

    const res = await request(app).get("/api/faculty/documents").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe("pending");
  });
});

describe("PUT /api/faculty/documents/:documentId/verify", () => {
  it("returns 404 for a non-existent document", async () => {
    const mongoose = require("mongoose");
    const { cookie } = await setupFacultyWithSubject();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app).put(`/api/faculty/documents/${fakeId}/verify`).set("Cookie", cookie);
    expect(res.status).toBe(404);
  });

  it("marks a document as verified and stamps the verifying faculty", async () => {
    const { faculty, cookie } = await setupFacultyWithSubject();
    const { student } = await createStudent({
      user: { email: "doc2@test.com", universityId: "STU9061", password: "Password@123" },
      rollNumber: "ROLL9061",
    });

    const doc = await Document.create({
      student: student._id,
      docType: "aadhaar",
      originalName: "aadhaar.pdf",
      fileName: "aadhaar-1.pdf",
      fileUrl: "/uploads/aadhaar-1.pdf",
      status: "pending",
    });

    const res = await request(app).put(`/api/faculty/documents/${doc._id}/verify`).set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.doc.status).toBe("verified");
    expect(res.body.doc.verifiedBy).toBe(faculty._id.toString());
  });
});