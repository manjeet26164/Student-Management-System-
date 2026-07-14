const request = require("supertest");
const app = require("../src/app");
const { connect, closeDatabase, clearDatabase } = require("./utils/db");
const { createStudent, createAdmin, loginAs } = require("./utils/factories");
const Fee = require("../src/models/Fee");

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("GET /api/student/dashboard", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/student/dashboard");
    expect(res.status).toBe(401);
  });

  it("rejects a non-student role", async () => {
    await createAdmin({ email: "admin4@test.com", universityId: "ADM4001", password: "Password@123" });
    const { cookie } = await loginAs(app, {
      identifier: "admin4@test.com",
      password: "Password@123",
      role: "admin",
    });

    const res = await request(app).get("/api/student/dashboard").set("Cookie", cookie);
    expect(res.status).toBe(403);
  });

  it("returns dashboard data for the logged-in student", async () => {
    await createStudent({
      user: { email: "dash@test.com", universityId: "STU4001", password: "Password@123" },
      rollNumber: "ROLL4001",
      cgpa: 8.5,
      semester: 4,
    });

    const { cookie } = await loginAs(app, {
      identifier: "dash@test.com",
      password: "Password@123",
      role: "student",
    });

    const res = await request(app).get("/api/student/dashboard").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.summary.cgpa).toBe(8.5);
    expect(res.body.welcome.semester).toBe(4);
  });
});

describe("GET /api/student/fees", () => {
  it("returns a correct paid/pending summary", async () => {
    const { student } = await createStudent({
      user: { email: "fees@test.com", universityId: "STU4002", password: "Password@123" },
      rollNumber: "ROLL4002",
    });

    await Fee.create({ student: student._id, semester: 1, totalAmount: 50000, paidAmount: 50000, status: "paid" });
    await Fee.create({ student: student._id, semester: 2, totalAmount: 50000, paidAmount: 20000, status: "partial" });

    const { cookie } = await loginAs(app, {
      identifier: "fees@test.com",
      password: "Password@123",
      role: "student",
    });

    const res = await request(app).get("/api/student/fees").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.summary).toEqual({ total: 100000, paid: 70000, pending: 30000 });
    expect(res.body.records).toHaveLength(2);
  });
});

describe("GET /api/student/profile", () => {
  it("returns the student profile for the logged-in user", async () => {
    await createStudent({
      user: { email: "profile@test.com", universityId: "STU4003", password: "Password@123" },
      rollNumber: "ROLL4003",
      branch: "ECE",
    });

    const { cookie } = await loginAs(app, {
      identifier: "profile@test.com",
      password: "Password@123",
      role: "student",
    });

    const res = await request(app).get("/api/student/profile").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.rollNumber).toBe("ROLL4003");
    expect(res.body.branch).toBe("ECE");
  });
});