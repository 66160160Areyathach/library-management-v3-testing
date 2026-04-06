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

const borrowSuccessSchema = {
  type: "object",
  required: ["success", "borrow_id"],
  properties: {
    success: { const: true },
    borrow_id: { type: "number" },
  },
};

const returnSuccessSchema = {
  type: "object",
  required: ["success", "fineAmount"],
  properties: {
    success: { const: true },
    fineAmount: { type: "number" },
  },
};

const simpleSuccessSchema = {
  type: "object",
  required: ["success"],
  properties: {
    success: { const: true },
  },
};

const borrowingRecordSchema = {
  type: "object",
  required: [
    "borrow_id",
    "member_id",
    "book_id",
    "borrow_date",
    "due_date",
    "status",
  ],
  properties: {
    borrow_id: { type: "number" },
    member_id: { type: "number" },
    book_id: { type: "number" },
    borrow_date: { type: "string" },
    due_date: { type: "string" },
    status: { type: "string" },
    return_date: { type: "string", nullable: true },
    fine_amount: { type: "number" },
    member_name: { type: "string" },
    book_title: { type: "string" },
  },
};

const borrowingListSchema = {
  type: "array",
  items: borrowingRecordSchema,
};

function expectJson(response) {
  expect(response.headers["content-type"]).toMatch(/application\/json/);
}

function expectErrorContract(response, status) {
  expect(response.status).toBe(status);
  expectJson(response);
  assertJsonSchema(response.body, errorSchema);
}

describe("Borrowing API contract", () => {
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
        memberCode: `MCONTRACT${suffix}`,
        fullName: `Contract Member ${suffix}`,
        email: `contract.member.${suffix}@example.com`,
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
        isbn: `CONTRACT-BORROW-${suffix}`,
        title: `Contract Borrow Book ${suffix}`,
        author: "Contract Author",
        category: "Testing",
        totalCopies: 2,
      });

    expect(response.status).toBe(201);
    return response.body.book_id;
  }

  async function createBorrowRecord(cookies, suffix) {
    const memberId = await createMember(cookies, `${suffix}-MEM`);
    const bookId = await createBook(cookies, `${suffix}-BOOK`);

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
    assertJsonSchema(response.body, borrowSuccessSchema);

    return {
      memberId,
      bookId,
      borrowId: response.body.borrow_id,
    };
  }

  describe("GET /api/borrowing", () => {
    test("returns the unauthorized contract without a session", async () => {
      const response = await request(app).get("/api/borrowing");

      expectErrorContract(response, 401);
      expect(response.body).toEqual({ error: "Unauthorized" });
    });

    test("returns a borrowing list contract for authenticated users", async () => {
      const cookies = await login("librarian", "lib123");
      const response = await request(app)
        .get("/api/borrowing")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, borrowingListSchema);
    });
  });

  describe("POST /api/borrowing", () => {
    test("returns the validation error contract when required fields are missing", async () => {
      const cookies = await login("admin", "admin123");
      const response = await request(app)
        .post("/api/borrowing")
        .set("Cookie", cookies)
        .send({
          memberId: 1,
          bookId: 1,
        });

      expectErrorContract(response, 400);
      expect(response.body).toEqual({
        error: "Member ID, book ID, borrow date, and due date are required",
      });
    });

    test("returns the creation contract for valid requests", async () => {
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
      expectJson(response);
      assertJsonSchema(response.body, borrowSuccessSchema);
    });
  });

  describe("GET /api/borrowing/member/:memberId", () => {
    test("returns borrowing records for a member as an array contract", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const { memberId } = await createBorrowRecord(cookies, suffix);

      const response = await request(app)
        .get(`/api/borrowing/member/${memberId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, borrowingListSchema);
    });
  });

  describe("GET /api/borrowing/:borrowId", () => {
    test("returns the borrowing detail contract for an existing record", async () => {
      const cookies = await login("admin", "admin123");
      const suffix = Date.now();
      const { borrowId } = await createBorrowRecord(cookies, suffix);

      const response = await request(app)
        .get(`/api/borrowing/${borrowId}`)
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, borrowingRecordSchema);
    });

    test("returns the not found contract for an unknown record", async () => {
      const cookies = await login("admin", "admin123");
      const response = await request(app)
        .get("/api/borrowing/99999")
        .set("Cookie", cookies);

      expectErrorContract(response, 404);
      expect(response.body).toEqual({
        error: "Borrowing record not found",
      });
    });
  });

  describe("PUT /api/borrowing/:borrowId/return", () => {
    test("returns the return contract for a valid return request", async () => {
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
      expectJson(response);
      assertJsonSchema(response.body, returnSuccessSchema);
    });
  });

  describe("PUT /api/borrowing/:borrowId/extend", () => {
    test("returns the success contract for a valid extend request", async () => {
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
      expectJson(response);
      assertJsonSchema(response.body, simpleSuccessSchema);
    });
  });
});
