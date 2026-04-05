const request = require("supertest");
const app = require("../../app");
const { getOne } = require("../../models/query");

describe("Dashboard Integration API", () => {
  async function login(username, password) {
    const response = await request(app).post("/api/auth/login").send({
      username,
      password,
    });

    expect(response.status).toBe(200);
    return response.headers["set-cookie"];
  }

  async function loginAsAdmin() {
    return login("admin", "admin123");
  }

  describe("GET /api/dashboard/stats", () => {
    test("should return 401 when user is not authenticated", async () => {
      const response = await request(app).get("/api/dashboard/stats");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    test("should return 401 when request contains an invalid session cookie", async () => {
      const response = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", "connect.sid=s%3Ainvalid.invalid");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    test("should return dashboard stats for authenticated users", async () => {
      const cookies = await loginAsAdmin();

      const response = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/application\/json/);
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

    test("should allow non-admin authenticated users to access dashboard stats", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalBooks");
    });

    test("should return only the expected dashboard stat fields", async () => {
      const cookies = await loginAsAdmin();

      const response = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(Object.keys(response.body).sort()).toEqual([
        "activeMembers",
        "availableBooks",
        "borrowedBooks",
        "overdueBooks",
        "totalBooks",
        "unreturned",
      ]);
    });

    test("should calculate dashboard stats based on current controller queries", async () => {
      const cookies = await loginAsAdmin();
      const totalBooks = await getOne("SELECT COUNT(*) as total FROM books");
      const availableBooks = await getOne(
        "SELECT SUM(available_copies) as total FROM books",
      );
      const activeMembers = await getOne(
        'SELECT COUNT(*) as total FROM members WHERE status = "active"',
      );
      const borrowedBooks = await getOne(
        'SELECT COUNT(*) as total FROM borrowing WHERE status IN ("borrowed", "overdue")',
      );
      const overdueBooks = await getOne(
        'SELECT COUNT(*) as total FROM borrowing WHERE status = "overdue"',
      );
      const unreturned = await getOne(`
        SELECT COUNT(*) as total FROM borrowing
        WHERE status IN ('borrowed', 'overdue')
        AND due_date < date('now')
      `);

      const response = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalBooks: totalBooks.total,
        availableBooks: availableBooks.total,
        activeMembers: activeMembers.total,
        borrowedBooks: borrowedBooks.total,
        overdueBooks: overdueBooks.total,
        unreturned: unreturned.total,
      });
    });

    test("should return non-negative integer stats with consistent relationships", async () => {
      const cookies = await loginAsAdmin();

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

    test("should return the same stat keys across consecutive requests", async () => {
      const cookies = await loginAsAdmin();

      const firstResponse = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", cookies);

      const secondResponse = await request(app)
        .get("/api/dashboard/stats")
        .set("Cookie", cookies);

      expect(firstResponse.status).toBe(200);
      expect(secondResponse.status).toBe(200);
      expect(Object.keys(firstResponse.body).sort()).toEqual(
        Object.keys(secondResponse.body).sort(),
      );
    });
  });
});
