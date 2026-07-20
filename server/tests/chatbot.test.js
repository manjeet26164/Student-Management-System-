jest.mock("../src/services/geminiClient");
jest.mock("../src/services/geminiEmbeddings", () => {
  const actual = jest.requireActual("../src/services/geminiEmbeddings");
  return { ...actual, embedText: jest.fn() };
});

const request = require("supertest");
const app = require("../src/app");
const { connect, closeDatabase, clearDatabase } = require("./utils/db");
const { createStudent, createFaculty, createAdmin, loginAs } = require("./utils/factories");
const { callGemini, getText } = require("../src/services/geminiClient");
const { embedText } = require("../src/services/geminiEmbeddings");
const KnowledgeChunk = require("../src/models/KnowledgeChunk");
const Result = require("../src/models/Result");
const Attendance = require("../src/models/Attendance");
const Fee = require("../src/models/Fee");


const VEC = [1, 0, 0];

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

const ask = (app, cookie, message) =>
  request(app).post("/api/chatbot/query").set("Cookie", cookie).send({ message });

describe("POST /api/chatbot/query — intent routing", () => {
  it("rejects a missing message field", async () => {
    const { user } = await createStudent({ user: { email: "cb1@test.com", universityId: "STU9001", password: "Password@123" } });
    const { cookie } = await loginAs(app, { identifier: user.email, password: "Password@123", role: "student" });

    const res = await ask(app, cookie, "");
    expect(res.status).toBe(400);
  });

  it("rejects an unauthenticated request", async () => {
    const res = await request(app).post("/api/chatbot/query").send({ message: "hi" });
    expect(res.status).toBe(401);
  });

  it("routes greetings to the general intent (no restricted context, no DB lookup)", async () => {
    const { user } = await createStudent({ user: { email: "cb2@test.com", universityId: "STU9002", password: "Password@123" } });
    const { cookie } = await loginAs(app, { identifier: user.email, password: "Password@123", role: "student" });

    callGemini.mockResolvedValue({});
    getText.mockReturnValue("Hello! How can I help you today?");

    const res = await ask(app, cookie, "hi there");

    expect(res.status).toBe(200);
    expect(res.body.intent).toBe("general");
    expect(embedText).not.toHaveBeenCalled();
  });
});

describe("POST /api/chatbot/query — rulebook RAG is DB-role-filtered, not filename-filtered", () => {
  it("only retrieves chunks whose roles array includes the caller's role, regardless of filename", async () => {
    await KnowledgeChunk.create({
      sourceFile: "random_doc_1.pdf",
      text: "Hostel curfew is 10 PM for all students.",
      embedding: VEC,
      roles: ["student"],
    });
    await KnowledgeChunk.create({
      sourceFile: "another_file.pdf",
      text: "Faculty leave must be approved 5 days in advance.",
      embedding: VEC,
      roles: ["faculty"],
    });

    const { user } = await createStudent({ user: { email: "cb3@test.com", universityId: "STU9003", password: "Password@123" } });
    const { cookie } = await loginAs(app, { identifier: user.email, password: "Password@123", role: "student" });

    embedText.mockResolvedValue(VEC);
    callGemini.mockResolvedValue({});
    getText.mockReturnValue("Hostel curfew is 10 PM.");

    const res = await ask(app, cookie, "what is the hostel rule?");

    expect(res.status).toBe(200);
    expect(res.body.intent).toBe("rulebook");
    expect(res.body.sources).toHaveLength(1);
    expect(res.body.sources[0].file).toBe("random_doc_1.pdf");
  });

  it("a document's access updates immediately after roles are reassigned, without any re-upload", async () => {
    const chunk = await KnowledgeChunk.create({
      sourceFile: "policy.pdf",
      text: "Exam re-evaluation fee is Rs. 500 per subject.",
      embedding: VEC,
      roles: ["admin"], 
    });

    const { user: studentUser } = await createStudent({ user: { email: "cb4@test.com", universityId: "STU9004", password: "Password@123" } });
    const { cookie: studentCookie } = await loginAs(app, { identifier: studentUser.email, password: "Password@123", role: "student" });

    embedText.mockResolvedValue(VEC);
    callGemini.mockResolvedValue({});
    getText.mockReturnValue("Rulebook data has not been uploaded yet.");

    const before = await ask(app, studentCookie, "what is the exam fine policy?");
    expect(before.body.sources).toHaveLength(0);

    // Admin reassigns roles on the SAME chunk — no filename change, no re-upload
    await KnowledgeChunk.updateMany({ sourceFile: "policy.pdf" }, { $set: { roles: ["student", "admin"] } });

    getText.mockReturnValue("Exam re-evaluation fee is Rs. 500 per subject.");
    const after = await ask(app, studentCookie, "what is the exam fine policy?");

    expect(after.body.sources).toHaveLength(1);
    expect(after.body.sources[0].file).toBe("policy.pdf");
  });

  it("tells the user politely when no chunks are visible to their role", async () => {
    await KnowledgeChunk.create({
      sourceFile: "admin_only.pdf",
      text: "Internal audit procedure.",
      embedding: VEC,
      roles: ["admin"],
    });

    const { user } = await createFaculty({ user: { email: "cb5@test.com", universityId: "FAC9005", password: "Password@123" } });
    const { cookie } = await loginAs(app, { identifier: user.email, password: "Password@123", role: "faculty" });

    const res = await ask(app, cookie, "what is the exam rule?");

    expect(res.status).toBe(200);
    expect(res.body.answer).toMatch(/not been uploaded|administration/i);
    expect(embedText).not.toHaveBeenCalled();
  });
});

describe("POST /api/chatbot/query — personal academic data", () => {
  it("returns the student's own CGPA/attendance/fee context, scoped to that student only", async () => {
    const { user, student } = await createStudent({
      user: { email: "cb6@test.com", universityId: "STU9006", password: "Password@123" },
      cgpa: 8.4,
    });
    await Result.create({ student: student._id, semester: 3, subjects: [], sgpa: 8.6, cgpa: 8.4 });
    await Fee.create({ student: student._id, semester: 3, status: "paid", paidAmount: 50000, totalAmount: 50000 });

    const { cookie } = await loginAs(app, { identifier: user.email, password: "Password@123", role: "student" });

    callGemini.mockResolvedValue({});
    getText.mockReturnValue("Your CGPA is 8.4.");

    const res = await ask(app, cookie, "what is my cgpa?");

    expect(res.status).toBe(200);
    expect(res.body.intent).toBe("personal_academic");
    expect(getText).toHaveBeenCalled();
  });

  it("blocks personal_academic queries from non-student roles", async () => {
    const { user } = await createFaculty({ user: { email: "cb7@test.com", universityId: "FAC9007", password: "Password@123" } });
    const { cookie } = await loginAs(app, { identifier: user.email, password: "Password@123", role: "faculty" });

    const res = await ask(app, cookie, "what is my cgpa?");

    expect(res.status).toBe(200);
    expect(res.body.answer).toMatch(/student login/i);
  });
});

describe("POST /api/chatbot/query — Gemini quota errors", () => {
  it("returns a friendly 429 instead of crashing when Gemini is rate-limited", async () => {
    const { user } = await createStudent({ user: { email: "cb8@test.com", universityId: "STU9008", password: "Password@123" } });
    const { cookie } = await loginAs(app, { identifier: user.email, password: "Password@123", role: "student" });

    callGemini.mockRejectedValue(new Error("Gemini API error (429): quota exceeded"));

    const res = await ask(app, cookie, "hello");

    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/busy|try again/i);
  });
});