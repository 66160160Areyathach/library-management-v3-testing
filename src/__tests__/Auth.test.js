/**
 * Example test file for Authentication
 */

const request = require("supertest");
const app = require("../app");

describe("Authentication API", () => {
  describe("POST /api/auth/login", () => {
    test("should login successfully with valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.user).toHaveProperty("user_id");
      expect(response.body.user).toHaveProperty("username", "admin");
      expect(response.body.user).toHaveProperty("role");
    });

    test("should fail with invalid password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    test("should fail with non-existent username", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "nonexistent",
        password: "password",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    test("should return 400 when fields are missing", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        // Missing password
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/logout", () => {
    test("should logout successfully", async () => {
      // First login
      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });

      const cookies = loginResponse.headers["set-cookie"];

      // Then logout
      const logoutResponse = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", cookies[0]);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body).toHaveProperty("success", true);
    });
  });

  describe("GET /api/auth/me", () => {
    test("should get current user info when authenticated", async () => {
      // First login
      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "librarian",
        password: "lib123",
      });

      const cookies = loginResponse.headers["set-cookie"];

      // Get user info
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookies[0]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user_id");
      expect(response.body).toHaveProperty("username", "librarian");
      expect(response.body).toHaveProperty("role", "librarian");
    });

    test("should return 401 when not authenticated", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
    });
  });
});

describe("Authentication API - Excel Test Cases", () => {
  test("TC-001 POST /api/auth/login valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "Admin@123",
    });
    expect(res.status).toBe(200);
  });

  test("TC-002 POST /api/auth/login wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "wrongpass",
    });
    expect(res.status).toBe(401);
  });

  test("TC-003 POST /api/auth/login unknown username", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "notexist99",
      password: "Admin@123",
    });
    expect(res.status).toBe(401);
  });

  test("TC-004 POST /api/auth/login empty body", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  test("TC-005 POST /api/auth/login SQL injection username", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "' OR '1'='1",
      password: "x",
    });
    expect(res.status).toBe(401);
  });

  test("TC-006 POST /api/auth/login username length 300", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "a".repeat(300),
      password: "x",
    });
    expect(res.status).toBe(400);
  });

  test("TC-032 POST /api/auth/login brute-force 50 requests", async () => {
    let found429 = false;
    for (let i = 0; i < 50; i += 1) {
      const res = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "wrongpass",
      });
      if (res.status === 429) {
        found429 = true;
        break;
      }
    }
    expect(found429).toBe(true);
  });
});
