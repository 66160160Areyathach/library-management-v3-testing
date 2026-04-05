const request = require("supertest");
const app = require("../../app");

describe("Auth Integration API", () => {
  describe("POST /api/auth/login", () => {
    test("TC-001 should return 200 with user info for valid admin credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: "Login successful",
          user: expect.objectContaining({
            user_id: expect.any(Number),
            username: "admin",
            full_name: expect.any(String),
            role: "admin",
          }),
        }),
      );
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    test("TC-002 should return 401 for invalid password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "wrongpass",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "error",
        "Invalid username or password",
      );
    });

    test("TC-003 should return 400 when password is empty", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("TC-004 should return 400 when no fields are sent", async () => {
      const response = await request(app).post("/api/auth/login").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Username and password are required",
      );
    });

    test("TC-005 should return 401 for SQL injection payload", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "'OR'1'='1",
        password: "x",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "error",
        "Invalid username or password",
      );
    });

    test("TC-006 should return 400 when username is excessively long", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "a".repeat(300),
        password: "x",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("TC-007 should return 429 after repeated brute-force attempts", async () => {
      let lastResponse;

      for (let i = 0; i < 50; i += 1) {
        lastResponse = await request(app).post("/api/auth/login").send({
          username: "admin",
          password: "wrongpass",
        });
      }

      expect(lastResponse.status).toBe(429);
    });
  });
});
