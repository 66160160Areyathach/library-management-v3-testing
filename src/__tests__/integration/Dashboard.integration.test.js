const request = require("supertest");
const app = require("../../app");

describe("Dashboard Integration API", () => {
  async function loginAsAdmin() {
    const response = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "admin123",
    });

    expect(response.status).toBe(200);
    return response.headers["set-cookie"];
  }

  describe("GET /api/dashboard/stats", () => {
    test("should return 401 when user is not authenticated", async () => {
      const response = await request(app).get("/api/dashboard/stats");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    test("should return dashboard stats for authenticated users", async () => {
      const cookies = await loginAsAdmin();

      const response = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          totalBooks: expect.any(Number),
          availableBooks: expect.any(Number),
          activeMembers: expect.any(Number),
          borrowedBooks: expect.any(Number),
          overdueBooks: expect.any(Number),
          unreturned: expect.any(Number),
        }),
      );
    });
  });
});
