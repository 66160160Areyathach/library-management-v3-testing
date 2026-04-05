const request = require("supertest");
const app = require("../../app");

describe("Auth Integration API", () => {
  describe("POST /api/auth/login", () => {
    test("should login successfully with valid admin credentials", async () => {
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

    test("should return 401 for invalid password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "error",
        "Invalid username or password",
      );
    });

    test("should return 401 for non-existent username", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "notfound-user",
        password: "password",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "error",
        "Invalid username or password",
      );
    });

    test("should return 400 when username or password is missing", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Username and password are required",
      );
    });
  });

  describe("GET /api/auth/me", () => {
    test("should return current user info when authenticated", async () => {
      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "librarian",
        password: "lib123",
      });

      const cookies = loginResponse.headers["set-cookie"];
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          user_id: expect.any(Number),
          username: "librarian",
          full_name: expect.any(String),
          role: "librarian",
        }),
      );
    });

    test("should return 401 when not authenticated", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });
  });

  describe("POST /api/auth/logout", () => {
    test("should logout successfully after login", async () => {
      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });

      const cookies = loginResponse.headers["set-cookie"];
      const logoutResponse = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", cookies);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body).toEqual(
        expect.objectContaining({
          success: true,
          message: "Logout successful",
        }),
      );
    });

    test("should block access to current user info after logout", async () => {
      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });

      const cookies = loginResponse.headers["set-cookie"];

      await request(app).post("/api/auth/logout").set("Cookie", cookies);

      const meResponse = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookies);

      expect(meResponse.status).toBe(401);
      expect(meResponse.body).toHaveProperty("error", "Unauthorized");
    });
  });
});
