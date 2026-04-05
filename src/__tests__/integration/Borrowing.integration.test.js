const request = require("supertest");
const app = require("../../app");

describe("Borrowing Integration API", () => {
  async function login(username, password) {
    const response = await request(app).post("/api/auth/login").send({
      username,
      password,
    });

    expect(response.status).toBe(200);
    return response.headers["set-cookie"];
  }

  async function createMember(cookies, suffix) {
    const response = await request(app)
      .post("/api/members")
      .set("Cookie", cookies)
      .send({
        memberCode: `MBORROW${suffix}`,
        fullName: `Borrow Member ${suffix}`,
        email: `borrow.member.${suffix}@example.com`,
        phone: "0800000000",
        memberType: "student",
        maxBooks: 3,
      });

    expect(response.status).toBe(201);
    return response.body.member_id;
  }

  async function createBook(cookies, suffix) {
    const response = await request(app)
      .post("/api/books")
      .set("Cookie", cookies)
      .send({
        isbn: `BORROW-${suffix}`,
        title: `Borrow Test Book ${suffix}`,
        author: "Integration Author",
        category: "Testing",
        totalCopies: 2,
      });

    expect(response.status).toBe(201);
    return response.body.book_id;
  }

  async function createBorrowRecord(cookies, suffix) {
    const memberId = await createMember(cookies, `${suffix}-MEM`);
    const bookId = await createBook(cookies, `${suffix}-BOOK`);

    const borrowResponse = await request(app)
      .post("/api/borrowing")
      .set("Cookie", cookies)
      .send({
        memberId,
        bookId,
        borrowDate: "2026-04-01",
        dueDate: "2026-04-10",
      });

    expect(borrowResponse.status).toBe(201);

    return {
      memberId,
      bookId,
      borrowId: borrowResponse.body.borrow_id,
    };
  }

  describe("GET /api/borrowing", () => {
    test("should return 401 when user is not authenticated", async () => {
      const response = await request(app).get("/api/borrowing");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    test("should return all borrowing records for authenticated users", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/borrowing")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/borrowing", () => {
    test("should return 400 when required fields are missing", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId: 1,
          bookId: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Member ID, book ID, borrow date, and due date are required",
      );
    });

    test("should return 404 when member does not exist", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId: 99999,
          bookId: 1,
          borrowDate: "2026-04-01",
          dueDate: "2026-04-10",
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Member not found");
    });

    test("should return 404 when book does not exist", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const memberId = await createMember(cookies, `${suffix}-NF`);

      const response = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId,
          bookId: 99999,
          borrowDate: "2026-04-01",
          dueDate: "2026-04-10",
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Book not found");
    });

    test("should create a borrowing record when request is valid", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const memberId = await createMember(cookies, `${suffix}-A`);
      const bookId = await createBook(cookies, `${suffix}-A`);

      const response = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId,
          bookId,
          borrowDate: "2026-04-01",
          dueDate: "2026-04-10",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          borrow_id: expect.any(Number),
        }),
      );
    });
  });

  describe("GET /api/borrowing/member/:memberId", () => {
    test("should return borrowing records for a member", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const { memberId } = await createBorrowRecord(cookies, suffix);

      const response = await request(app)
        .get(`/api/borrowing/member/${memberId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /api/borrowing/:borrowId/return", () => {
    test("should return a borrowed book successfully", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const { borrowId } = await createBorrowRecord(cookies, suffix);

      const response = await request(app)
        .put(`/api/borrowing/${borrowId}/return`)
        .set("Cookie", cookies)
        .send({
          returnDate: "2026-04-08",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          fineAmount: 0,
        }),
      );
    });
  });

  describe("PUT /api/borrowing/:borrowId/extend", () => {
    test("should extend due date for an active borrowing record", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const { borrowId } = await createBorrowRecord(cookies, suffix);

      const response = await request(app)
        .put(`/api/borrowing/${borrowId}/extend`)
        .set("Cookie", cookies)
        .send({
          newDueDate: "2026-04-20",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });
});
