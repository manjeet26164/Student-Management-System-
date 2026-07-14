jest.mock("../src/services/geminiClient");

const request = require("supertest");
const app = require("../src/app");
const { connect, closeDatabase, clearDatabase } = require("./utils/db");
const { createAdmin, createStudent, loginAs } = require("./utils/factories");
const { callGemini, getFunctionCall, getText } = require("../src/services/geminiClient");
const Attendance = require("../src/models/Attendance");
const Result = require("../src/models/Result");
const Subject = require("../src/models/Subject");

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
  jest.clearAllMocks();
});

afterAll(async () => {
  await closeDatabase();
});

describe("POST /api/admin/ai/query", () => {
  it("rejects a missing query field", async () => {
    await createAdmin({ email: "aiadmin1@test.com", universityId: "ADM5001", password: "Password@123" });
    const { cookie } = await loginAs(app, {
      identifier: "aiadmin1@test.com",
      password: "Password@123",
      role: "admin",
    });

    const res = await request(app).post("/api/admin/ai/query").set("Cookie", cookie).send({});
    expect(res.status).toBe(400);
  });

  it("returns 502 when the AI does not return a usable filter", async () => {
    await createAdmin({ email: "aiadmin2@test.com", universityId: "ADM5002", password: "Password@123" });
    const { cookie } = await loginAs(app, {
      identifier: "aiadmin2@test.com",
      password: "Password@123",
      role: "admin",
    });

    callGemini.mockResolvedValue({});
    getFunctionCall.mockReturnValue(null);

    const res = await request(app)
      .post("/api/admin/ai/query")
      .set("Cookie", cookie)
      .send({ query: "students with low cgpa" });

    expect(res.status).toBe(502);
  });

  it("builds a mongo filter from the AI tool call and returns matching students", async () => {
    await createAdmin({ email: "aiadmin3@test.com", universityId: "ADM5003", password: "Password@123" });
    const { cookie } = await loginAs(app, {
      identifier: "aiadmin3@test.com",
      password: "Password@123",
      role: "admin",
    });

    await createStudent({
      user: { email: "cse1@test.com", universityId: "STU5001" },
      rollNumber: "ROLL5001",
      branch: "CSE",
      cgpa: 9.1,
    });
    await createStudent({
      user: { email: "ece1@test.com", universityId: "STU5002" },
      rollNumber: "ROLL5002",
      branch: "ECE",
      cgpa: 7.0,
    });

    callGemini.mockResolvedValue({});
    getFunctionCall.mockReturnValue({ name: "filter_students", args: { branch: "CSE", cgpaMin: 8 } });

    const res = await request(app)
      .post("/api/admin/ai/query")
      .set("Cookie", cookie)
      .send({ query: "CSE students with cgpa above 8" });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.students[0].branch).toBe("CSE");
  });

  it("rejects non-admin roles", async () => {
    await createStudent({
      user: { email: "aistudent@test.com", universityId: "STU5003", password: "Password@123" },
      rollNumber: "ROLL5003",
    });

    const { cookie } = await loginAs(app, {
      identifier: "aistudent@test.com",
      password: "Password@123",
      role: "student",
    });

    const res = await request(app)
      .post("/api/admin/ai/query")
      .set("Cookie", cookie)
      .send({ query: "any query" });

    expect(res.status).toBe(403);
  });
});

describe("GET /api/student/ai/insights", () => {
  it("returns parsed AI insight JSON alongside computed stats", async () => {
    const { student } = await createStudent({
      user: { email: "insights@test.com", universityId: "STU5004", password: "Password@123" },
      rollNumber: "ROLL5004",
      cgpa: 6.2,
      backlogs: 1,
    });

    const subject = await Subject.create({
      code: "CS301",
      name: "Operating Systems",
      credits: 4,
      semester: 3,
      branch: "CSE",
    });

    await Attendance.create({ student: student._id, subject: subject._id, present: 60, absent: 40, percentage: 60 });
    await Result.create({ student: student._id, semester: 3, subjects: [], sgpa: 6.5, cgpa: 6.2 });

    const { cookie } = await loginAs(app, {
      identifier: "insights@test.com",
      password: "Password@123",
      role: "student",
    });

    callGemini.mockResolvedValue({});
    getText.mockReturnValue(
      JSON.stringify({
        riskLevel: "medium",
        summary: "Attendance and backlogs need attention.",
        recommendations: ["Attend more classes", "Clear pending backlog"],
      })
    );

    const res = await request(app).get("/api/student/ai/insights").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.stats.cgpa).toBe(6.2);
    expect(res.body.stats.avgAttendancePercent).toBe(60);
    expect(res.body.insight.riskLevel).toBe("medium");
  });

  it("returns 502 when the AI response is not valid JSON", async () => {
    await createStudent({
      user: { email: "badjson@test.com", universityId: "STU5005", password: "Password@123" },
      rollNumber: "ROLL5005",
    });

    const { cookie } = await loginAs(app, {
      identifier: "badjson@test.com",
      password: "Password@123",
      role: "student",
    });

    callGemini.mockResolvedValue({});
    getText.mockReturnValue("not valid json");

    const res = await request(app).get("/api/student/ai/insights").set("Cookie", cookie);

    expect(res.status).toBe(502);
  });
});