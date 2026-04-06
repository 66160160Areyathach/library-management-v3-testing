const request = require("supertest");
const app = require("../../app");
const { assertJsonSchema } = require("./helpers/assertJsonSchema");

const errorSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: { type: "string" },
  },
};

const loginSuccessSchema = {
  type: "object",
  required: ["success", "message", "user"],
  properties: {
    success: { const: true },
    message: { type: "string" },
    user: {
      type: "object",
      required: ["user_id", "username", "full_name", "role"],
      properties: {
        user_id: { type: "number" },
        username: { type: "string" },
        full_name: { type: "string" },
        role: { type: "string" },
      },
    },
  },
};

const logoutSuccessSchema = {
  type: "object",
  required: ["success", "message"],
  properties: {
    success: { const: true },
    message: { type: "string" },
  },
};

const currentUserSchema = {
  type: "object",
  required: ["user_id", "username", "full_name", "role"],
  properties: {
    user_id: { type: "number" },
    username: { type: "string" },
    full_name: { type: "string" },
    role: { type: "string" },
  },
};

function expectJson(response) {
  expect(response.headers["content-type"]).toMatch(/application\/json/);
}

function expectErrorContract(response, status) {
  expect(response.status).toBe(status);
  expectJson(response);
  assertJsonSchema(response.body, errorSchema);
}

describe("Auth API contract", () => {
  async function login(username, password) {
    const response = await request(app).post("/api/auth/login").send({
      username,
      password,
    });

    expect(response.status).toBe(200);
    expectJson(response);
    assertJsonSchema(response.body, loginSuccessSchema);
    return response.headers["set-cookie"];
  }

  describe("POST /api/auth/login", () => {
    test("returns the documented success contract", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "admin123",
      });

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, loginSuccessSchema);
    });

    test("returns the documented validation error contract", async () => {
      const response = await request(app).post("/api/auth/login").send({});
      expectErrorContract(response, 400);
      expect(response.body).toEqual({
        error: "Username and password are required",
      });
    });

    test("returns the documented invalid credentials contract", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "wrongpassword",
      });

      expectErrorContract(response, 401);
      expect(response.body).toEqual({
        error: "Invalid username or password",
      });
    });
  });

  describe("POST /api/auth/logout", () => {
    test("returns the documented success contract", async () => {
      const cookies = await login("admin", "admin123");
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, logoutSuccessSchema);
    });
  });

  describe("GET /api/auth/me", () => {
    test("returns the current user contract for authenticated users", async () => {
      const cookies = await login("librarian", "lib123");
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, currentUserSchema);
    });

    test("returns the not authenticated contract without a session", async () => {
      const response = await request(app).get("/api/auth/me");

      expectErrorContract(response, 401);
      expect(response.body).toEqual({
        error: "Unauthorized",
      });
    });
  });
});
