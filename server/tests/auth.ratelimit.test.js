const request = require("supertest");
const app = require("../src/app");
const { connect, closeDatabase } = require("./utils/db");
const { createUser } = require("./utils/factories");

beforeAll(async () => {
  await connect();
  await createUser({
    email: "bruteforce@test.com",
    universityId: "STU2001",
    password: "Password@123",
    role: "student",
  });
});

afterAll(async () => {
  await closeDatabase();
});

describe("POST /api/auth/login rate limiting", () => {
  it("blocks after 5 attempts from the same IP within the window", async () => {
    const attempt = () =>
      request(app).post("/api/auth/login").send({
        identifier: "bruteforce@test.com",
        password: "WrongPassword@123",
        role: "student",
      });

    for (let i = 0; i < 5; i += 1) {
      const res = await attempt();
      expect(res.status).toBe(401);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
  });
});