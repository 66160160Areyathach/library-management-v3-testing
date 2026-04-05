const request = require("supertest");
const app = require("../../app");
const { assertJsonSchema } = require("./helpers/assertJsonSchema");

const errorSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: { type: "string" },
  },
  additionalProperties: false,
};

const dashboardStatsSchema = {
  type: "object",
  required: [
    "totalBooks",
    "availableBooks",
    "activeMembers",
    "borrowedBooks",
    "overdueBooks",
    "unreturned",
  ],
  properties: {
    totalBooks: { type: "number" },
    availableBooks: { type: "number" },
    activeMembers: { type: "number" },
    borrowedBooks: { type: "number" },
    overdueBooks: { type: "number" },
    unreturned: { type: "number" },
  },
  additionalProperties: false,
};

function expectJson(response) {
  expect(response.headers["content-type"]).toMatch(/application\/json/);
}

function expectErrorContract(response, status) {
  expect(response.status).toBe(status);
  expectJson(response);
  assertJsonSchema(response.body, errorSchema);
}

describe("Dashboard API contract", () => {
  async function login(username, password) {
    const response = await request(app).post("/api/auth/login").send({
      username,
      password,
    });

    expect(response.status).toBe(200);
    return response.headers["set-cookie"];
  }

  describe("GET /api/dashboard/stats", () => {
    test("returns the unauthorized contract without a session", async () => {
      const response = await request(app).get("/api/dashboard/stats");

      expectErrorContract(response, 401);
      expect(response.body).toEqual({ error: "Unauthorized" });
    });

    test("returns the dashboard stats contract for authenticated admin users", async () => {
      const cookies = await login("admin", "admin123");
      const response = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, dashboardStatsSchema);
    });

    test("returns the same contract for authenticated non-admin users", async () => {
      const cookies = await login("librarian", "lib123");
      const response = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, dashboardStatsSchema);
    });

    test("returns non-negative integer stats with consistent relationships", async () => {
      const cookies = await login("admin", "admin123");
      const response = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);

      Object.values(response.body).forEach((value) => {
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
      });

      expect(response.body.borrowedBooks).toBeGreaterThanOrEqual(
        response.body.overdueBooks,
      );
      expect(response.body.unreturned).toBeGreaterThanOrEqual(
        response.body.overdueBooks,
      );
    });
  });
});
