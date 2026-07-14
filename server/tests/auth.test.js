const request = require("supertest");
const app = require("../src/app");
const { connect, closeDatabase, clearDatabase } = require("./utils/db");
const { createUser, loginAs } = require("./utils/factories");

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials and sets an httpOnly cookie", async () => {
    await createUser({
      email: "student@test.com",
      universityId: "STU1001",
      password: "Password@123",
      role: "student",
    });

    const res = await request(app).post("/api/auth/login").send({
      identifier: "student@test.com",
      password: "Password@123",
      role: "student",
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("student@test.com");
    expect(res.body.user.password).toBeUndefined();

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.startsWith("erp_token=") && c.includes("HttpOnly"))).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    await createUser({
      email: "student2@test.com",
      universityId: "STU1002",
      password: "Password@123",
      role: "student",
    });

    const res = await request(app).post("/api/auth/login").send({
      identifier: "student2@test.com",
      password: "WrongPass@123",
      role: "student",
    });

    expect(res.status).toBe(401);
  });

  it("rejects a mismatched role", async () => {
    await createUser({
      email: "student3@test.com",
      universityId: "STU1003",
      password: "Password@123",
      role: "student",
    });

    const res = await request(app).post("/api/auth/login").send({
      identifier: "student3@test.com",
      password: "Password@123",
      role: "admin",
    });

    expect(res.status).toBe(403);
  });

  it("rejects an unknown identifier", async () => {
    const res = await request(app).post("/api/auth/login").send({
      identifier: "nouser@test.com",
      password: "Password@123",
      role: "student",
    });

    expect(res.status).toBe(401);
  });

  it("returns validation errors for a missing role", async () => {
    const res = await request(app).post("/api/auth/login").send({
      identifier: "student@test.com",
      password: "Password@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === "role")).toBe(true);
  });
});

describe("GET /api/auth/me", () => {
  it("rejects a request with no token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the logged-in user when the cookie is present", async () => {
    await createUser({
      email: "me@test.com",
      universityId: "STU1004",
      password: "Password@123",
      role: "student",
    });

    const { cookie } = await loginAs(app, {
      identifier: "me@test.com",
      password: "Password@123",
      role: "student",
    });

    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@test.com");
  });

  it("rejects a tampered token", async () => {
    const res = await request(app).get("/api/auth/me").set("Cookie", "erp_token=invalid.token.value");
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/auth/change-password", () => {
  it("changes the password and allows login with the new one", async () => {
    await createUser({
      email: "cp@test.com",
      universityId: "STU1005",
      password: "OldPass@123",
      role: "student",
    });

    const { cookie } = await loginAs(app, {
      identifier: "cp@test.com",
      password: "OldPass@123",
      role: "student",
    });

    const res = await request(app).put("/api/auth/change-password").set("Cookie", cookie).send({
      currentPassword: "OldPass@123",
      newPassword: "NewPass@456",
      confirmPassword: "NewPass@456",
    });

    expect(res.status).toBe(200);

   const relogin = await request(app)
      .post("/api/auth/login")
      .set("x-test-bypass-ratelimit", "true")
      .send({
        identifier: "cp@test.com",
        password: "NewPass@456",
        role: "student",
      });

    expect(relogin.status).toBe(200);
  });

  it("rejects an incorrect current password", async () => {
    await createUser({
      email: "cp2@test.com",
      universityId: "STU1006",
      password: "OldPass@123",
      role: "student",
    });

    const { cookie } = await loginAs(app, {
      identifier: "cp2@test.com",
      password: "OldPass@123",
      role: "student",
    });

    const res = await request(app).put("/api/auth/change-password").set("Cookie", cookie).send({
      currentPassword: "WrongOld@123",
      newPassword: "NewPass@456",
      confirmPassword: "NewPass@456",
    });

    expect(res.status).toBe(400);
  });

  it("rejects a weak new password", async () => {
    await createUser({
      email: "cp3@test.com",
      universityId: "STU1007",
      password: "OldPass@123",
      role: "student",
    });

    const { cookie } = await loginAs(app, {
      identifier: "cp3@test.com",
      password: "OldPass@123",
      role: "student",
    });

    const res = await request(app).put("/api/auth/change-password").set("Cookie", cookie).send({
      currentPassword: "OldPass@123",
      newPassword: "weak",
      confirmPassword: "weak",
    });

    expect(res.status).toBe(400);
  });

  it("rejects mismatched confirm password", async () => {
    await createUser({
      email: "cp4@test.com",
      universityId: "STU1008",
      password: "OldPass@123",
      role: "student",
    });

    const { cookie } = await loginAs(app, {
      identifier: "cp4@test.com",
      password: "OldPass@123",
      role: "student",
    });

    const res = await request(app).put("/api/auth/change-password").set("Cookie", cookie).send({
      currentPassword: "OldPass@123",
      newPassword: "NewPass@456",
      confirmPassword: "NewPass@789",
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the auth cookie", async () => {
    await createUser({
      email: "logout@test.com",
      universityId: "STU1009",
      password: "Password@123",
      role: "student",
    });

    const { cookie } = await loginAs(app, {
      identifier: "logout@test.com",
      password: "Password@123",
      role: "student",
    });

    const res = await request(app).post("/api/auth/logout").set("Cookie", cookie);

    expect(res.status).toBe(200);
    const clearedCookie = res.headers["set-cookie"].find((c) => c.startsWith("erp_token="));
    expect(clearedCookie).toMatch(/erp_token=;/);
  });
});