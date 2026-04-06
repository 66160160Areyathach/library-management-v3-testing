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

  async function createMember(cookies, suffix, overrides = {}) {
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
        ...overrides,
      });

    expect(response.status).toBe(201);
    return response.body.member_id;
  }

  async function createBook(cookies, suffix, overrides = {}) {
    const response = await request(app)
      .post("/api/books")
      .set("Cookie", cookies)
      .send({
        isbn: `BORROW-${suffix}`,
        title: `Borrow Test Book ${suffix}`,
        author: "Integration Author",
        category: "Testing",
        totalCopies: 2,
        ...overrides,
      });

    expect(response.status).toBe(201);
    return response.body.book_id;
  }

  async function createBorrowRecord(cookies, suffix, borrowOverrides = {}) {
    const memberId = await createMember(cookies, `${suffix}-MEM`);
    const bookId = await createBook(cookies, `${suffix}-BOOK`);

    const borrowResponse = await request(app)
      .post("/api/borrowing")
      .set("Cookie", cookies)
      .send({
        memberId,
        bookId,
        borrowDate: "2025-01-10",
        dueDate: "2025-01-24",
        ...borrowOverrides,
      });

    expect(borrowResponse.status).toBe(201);

    return {
      memberId,
      bookId,
      borrowId: borrowResponse.body.borrow_id,
    };
  }

  describe("POST /api/borrowing", () => {
    test("TC-032 should create a borrowing record for valid input", async () => {
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
          borrowDate: "2024-05-20",
          dueDate: "2024-05-27",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          borrow_id: expect.any(Number),
        }),
      );
    });

    test("TC-033 should return 409 when book is unavailable", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const memberId = await createMember(cookies, `${suffix}-UNAVAIL-M`);
      const bookId = await createBook(cookies, `${suffix}-UNAVAIL-B`, {
        totalCopies: 1,
      });

      const firstBorrow = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId,
          bookId,
          borrowDate: "2024-05-20",
          dueDate: "2024-05-27",
        });

      expect(firstBorrow.status).toBe(201);

      const secondMemberId = await createMember(cookies, `${suffix}-UNAVAIL-M2`);
      const response = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId: secondMemberId,
          bookId,
          borrowDate: "2024-05-20",
          dueDate: "2024-05-27",
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error");
    });

    test("TC-034 should return 404 when book does not exist", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const memberId = await createMember(cookies, `${suffix}-NF`);

      const response = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId,
          bookId: 99999,
          borrowDate: "2024-05-20",
          dueDate: "2024-05-27",
        });

      expect(response.status).toBe(404);
    });

    test("TC-035 should return 409 when member borrows the same book twice", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const memberId = await createMember(cookies, `${suffix}-DUP-M`);
      const bookId = await createBook(cookies, `${suffix}-DUP-B`);

      const firstBorrow = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId,
          bookId,
          borrowDate: "2024-05-20",
          dueDate: "2024-05-27",
        });

      expect(firstBorrow.status).toBe(201);

      const secondBorrow = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId,
          bookId,
          borrowDate: "2024-05-20",
          dueDate: "2024-05-27",
        });

      expect(secondBorrow.status).toBe(409);
    });

    test("TC-036 should return 409 when member exceeds borrowing limit", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const memberId = await createMember(cookies, `${suffix}-LIMIT`, {
        maxBooks: 1,
      });
      const firstBookId = await createBook(cookies, `${suffix}-LIMIT-1`);
      const secondBookId = await createBook(cookies, `${suffix}-LIMIT-2`);

      const firstBorrow = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId,
          bookId: firstBookId,
          borrowDate: "2025-01-10",
          dueDate: "2025-01-24",
        });

      expect(firstBorrow.status).toBe(201);

      const secondBorrow = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId,
          bookId: secondBookId,
          borrowDate: "2025-01-10",
          dueDate: "2025-01-24",
        });

      expect(secondBorrow.status).toBe(409);
    });

    test("TC-037 should return 400 when due date is earlier than borrow date", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const memberId = await createMember(cookies, `${suffix}-DATE`);
      const bookId = await createBook(cookies, `${suffix}-DATE`);

      const response = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId,
          bookId,
          borrowDate: "2025-02-20",
          dueDate: "2025-02-10",
        });

      expect(response.status).toBe(400);
    });

    test("TC-038 should return 403 when suspended members borrow books", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const memberId = await createMember(cookies, `${suffix}-SUSP`);
      const updateResponse = await request(app)
        .put(`/api/members/${memberId}`)
        .set("Cookie", cookies)
        .send({
          fullName: `Borrow Member ${suffix}`,
          email: `borrow.member.${suffix}@example.com`,
          phone: "0800000000",
          memberType: "student",
          status: "suspended",
          maxBooks: 3,
        });

      expect(updateResponse.status).toBe(200);

      const bookId = await createBook(cookies, `${suffix}-SUSP`);
      const response = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId,
          bookId,
          borrowDate: "2025-01-10",
          dueDate: "2025-01-24",
        });

      expect(response.status).toBe(403);
    });

    test("TC-039 should return 401 when borrowing without authentication", async () => {
      const response = await request(app).post("/api/borrowing").send({
        memberId: 1,
        bookId: 1,
        borrowDate: "2025-01-10",
        dueDate: "2025-01-24",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/borrowing/:borrowId/return", () => {
    test("TC-040 should return 409 when returning the same borrow twice", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const { borrowId } = await createBorrowRecord(cookies, suffix);

      const firstReturn = await request(app)
        .put(`/api/borrowing/${borrowId}/return`)
        .set("Cookie", cookies)
        .send({
          returnDate: "2025-02-10",
        });

      expect(firstReturn.status).toBe(200);

      const secondReturn = await request(app)
        .put(`/api/borrowing/${borrowId}/return`)
        .set("Cookie", cookies)
        .send({
          returnDate: "2025-02-11",
        });

      expect(secondReturn.status).toBe(409);
    });
  });
});
