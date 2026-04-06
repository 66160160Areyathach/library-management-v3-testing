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

const bookSummarySchema = {
  type: "object",
  required: ["book_id", "title", "author", "available_copies"],
  properties: {
    book_id: { type: "number" },
    title: { type: "string" },
    author: { type: "string" },
    available_copies: { type: "number" },
  },
};

const booksListSchema = {
  type: "array",
  items: bookSummarySchema,
};

const bookDetailSchema = {
  type: "object",
  required: ["book_id", "title", "author", "isBorrowed"],
  properties: {
    book_id: { type: "number" },
    title: { type: "string" },
    author: { type: "string" },
    isBorrowed: { type: "boolean" },
  },
};

const createBookSuccessSchema = {
  type: "object",
  required: ["success", "book_id"],
  properties: {
    success: { const: true },
    book_id: { type: "number" },
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

describe("Books API contract", () => {
  async function login(username, password) {
    const response = await request(app).post("/api/auth/login").send({
      username,
      password,
    });

    expect(response.status).toBe(200);
    expectJson(response);
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
    });
  });

  describe("GET /api/books", () => {
    test("accepts an empty array as a valid books list contract", () => {
      expect(() => assertJsonSchema([], booksListSchema)).not.toThrow();
    });

    test("returns the unauthorized contract when no session is provided", async () => {
      const response = await request(app).get("/api/books");
      expectErrorContract(response, 401);
      expect(response.body).toEqual({ error: "Unauthorized" });
    });

    test("returns an array of book summaries for authenticated users", async () => {
      const cookies = await login("librarian", "lib123");
      const response = await request(app)
        .get("/api/books")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, booksListSchema);
    });
  });

  describe("GET /api/books/:id", () => {
    test("returns the book detail contract for an existing book", async () => {
      const cookies = await login("librarian", "lib123");
      const response = await request(app)
        .get("/api/books/1")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, bookDetailSchema);
    });

    test("returns the not found contract for an unknown book", async () => {
      const cookies = await login("librarian", "lib123");
      const response = await request(app)
        .get("/api/books/99999")
        .set("Cookie", cookies);

      expectErrorContract(response, 404);
      expect(response.body).toEqual({ error: "Book not found" });
    });
  });

  describe("POST /api/books", () => {
    test("returns the creation contract for valid admin requests", async () => {
      const cookies = await login("admin", "admin123");
      const uniqueSuffix = Date.now();

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          isbn: `CONTRACT-${uniqueSuffix}`,
          title: `Contract Test Book ${uniqueSuffix}`,
          author: "Contract Author",
          category: "Testing",
          totalCopies: 2,
        });

      expect(response.status).toBe(201);
      expectJson(response);
      assertJsonSchema(response.body, createBookSuccessSchema);
    });

    test("returns the forbidden contract for non-admin users", async () => {
      const cookies = await login("librarian", "lib123");
      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          title: "Blocked Contract Book",
          author: "Librarian",
          totalCopies: 1,
        });

      expectErrorContract(response, 403);
      expect(response.body).toEqual({
        error: "Forbidden - Admin access required",
      });
    });
  });
});
