const request = require("supertest");
const app = require("../src/app");
const { connect, closeDatabase, clearDatabase } = require("./utils/db");
const { createAdmin, createStudent, loginAs } = require("./utils/factories");

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("GET /api/admin/students", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/admin/students");
    expect(res.status).toBe(401);
  });

  it("rejects non-admin roles", async () => {
    await createStudent({
      user: { email: "s1@test.com", universityId: "STU3001", password: "Password@123" },
    });

    const { cookie } = await loginAs(app, {
      identifier: "s1@test.com",
      password: "Password@123",
      role: "student",
    });

    const res = await request(app).get("/api/admin/students").set("Cookie", cookie);
    expect(res.status).toBe(403);
  });

  it("returns paginated results with correct metadata", async () => {
    await createAdmin({ email: "admin1@test.com", universityId: "ADM3001", password: "Password@123" });
    const { cookie } = await loginAs(app, {
      identifier: "admin1@test.com",
      password: "Password@123",
      role: "admin",
    });

    for (let i = 0; i < 25; i += 1) {
      await createStudent({
        user: { email: `bulk${i}@test.com`, universityId: `BULK${i}` },
        rollNumber: `ROLL${i}`,
      });
    }

    const page1 = await request(app).get("/api/admin/students?page=1&limit=10").set("Cookie", cookie);
    expect(page1.status).toBe(200);
    expect(page1.body.students).toHaveLength(10);
    expect(page1.body.pagination).toEqual({ page: 1, limit: 10, total: 25, totalPages: 3 });

    const page3 = await request(app).get("/api/admin/students?page=3&limit=10").set("Cookie", cookie);
    expect(page3.status).toBe(200);
    expect(page3.body.students).toHaveLength(5);
  });

  it("clamps limit to a maximum of 100 and defaults page to 1", async () => {
    await createAdmin({ email: "admin2@test.com", universityId: "ADM3002", password: "Password@123" });
    const { cookie } = await loginAs(app, {
      identifier: "admin2@test.com",
      password: "Password@123",
      role: "admin",
    });

    const res = await request(app).get("/api/admin/students?page=0&limit=999").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(100);
  });
});

describe("POST /api/admin/students", () => {
  const adminLogin = async () => {
    await createAdmin({ email: "admin3@test.com", universityId: "ADM3003", password: "Password@123" });
    const { cookie } = await loginAs(app, {
      identifier: "admin3@test.com",
      password: "Password@123",
      role: "admin",
    });
    return cookie;
  };

  it("creates a student with required fields", async () => {
    const cookie = await adminLogin();

    const res = await request(app).post("/api/admin/students").set("Cookie", cookie).send({
      fullName: "New Student",
      email: "newstudent@test.com",
      universityId: "STU3010",
      password: "Password@123",
      rollNumber: "ROLL3010",
      branch: "CSE",
      semester: 2,
      section: "B",
      batch: "2024-2028",
    });

    expect(res.status).toBe(201);
    expect(res.body.student.rollNumber).toBe("ROLL3010");
  });

  it("rejects missing required fields", async () => {
    const cookie = await adminLogin();

    const res = await request(app).post("/api/admin/students").set("Cookie", cookie).send({
      fullName: "Incomplete Student",
    });

    expect(res.status).toBe(400);
  });

  it("rejects a duplicate email or university id", async () => {
    const cookie = await adminLogin();

    await createStudent({
      user: { email: "dupe@test.com", universityId: "STU3011" },
      rollNumber: "ROLL3011",
    });

    const res = await request(app).post("/api/admin/students").set("Cookie", cookie).send({
      fullName: "Duplicate Student",
      email: "dupe@test.com",
      universityId: "STU3099",
      password: "Password@123",
      rollNumber: "ROLL3099",
      branch: "CSE",
      semester: 2,
      section: "B",
      batch: "2024-2028",
    });

    expect(res.status).toBe(409);
  });
});