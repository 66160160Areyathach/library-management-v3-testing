/**
 * Example test file for Books functionality
 *
 * To run tests:
 * - npm test
 * - npm run test:watch
 * - npm test -- src/__tests__/Books.test.js
 */

const request = require("supertest");
const app = require("../app");
const { initializeDatabase } = require("../database");
const { run } = require("../models/query");

describe("Books API", () => {
  let sessionCookie;

  // Setup: Initialize database and login before each test suite
  beforeAll(async () => {
    // Initialize database first
    await initializeDatabase();

    // Then login
    const response = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "admin123",
    });

    // Extract session cookie
    const cookies = response.headers["set-cookie"];
    sessionCookie = cookies ? cookies[0].split(";")[0] : "";
  });

  describe("GET /api/books", () => {
    test("TC-007: Happy Path - should get all books with valid authentication", async () => {
      // Preconditions: มีหนังสือในระบบแล้ว (Books exist in system), Token ถูกต้อง (Valid token)
      const response = await request(app)
        .get("/api/books")
        .set("Cookie", sessionCookie);

      // Expected Result: HTTP 200 OK + array of books
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify that books have required fields
      const firstBook = response.body[0];
      expect(firstBook).toHaveProperty("book_id");
      expect(firstBook).toHaveProperty("title");
      expect(firstBook).toHaveProperty("author");
      expect(firstBook).toHaveProperty("available_copies");
    });

    test("should get all books", async () => {
      const response = await request(app)
        .get("/api/books")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test("should return book with correct fields", async () => {
      const response = await request(app)
        .get("/api/books")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      const book = response.body[0];
      expect(book).toHaveProperty("book_id");
      expect(book).toHaveProperty("title");
      expect(book).toHaveProperty("author");
      expect(book).toHaveProperty("available_copies");
    });

    test("TC-008: Happy Path - should get books filtered by genre", async () => {
      // Preconditions: มีหนังสือที่ genre=fiction (Books exist with fiction genre)
      const response = await request(app)
        .get("/api/books?genre=Fiction")
        .set("Cookie", sessionCookie);

      // Expected Result: HTTP 200 OK + filtered array (only fiction books)
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Verify all returned books have the requested genre
      response.body.forEach((book) => {
        expect(book.category).toBe("Fiction");
      });
    });

    test("TC-009: Sad Path - should return 401 when no authorization header", async () => {
      // Preconditions: Server is running
      const response = await request(app)
        .get("/api/books");
        // ไม่ใส่ Authorization header (no .set("Cookie", sessionCookie))

      // Expected Result: HTTP 401 Unauthorized
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/books/search", () => {
    test("should search books by title", async () => {
      const response = await request(app)
        .get("/api/books/search")
        .query({ q: "Python" })
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test("should return 400 when query is empty", async () => {
      const response = await request(app)
        .get("/api/books/search")
        .query({ q: "" })
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/books/:id", () => {
    test("should get book details by ID", async () => {
      const response = await request(app)
        .get("/api/books/1")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("book_id", 1);
      expect(response.body).toHaveProperty("title");
      expect(response.body).toHaveProperty("isBorrowed");
    });

    test("should return 404 for non-existent book", async () => {
      const response = await request(app)
        .get("/api/books/99999")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/books", () => {
    test("should create a new book (Admin only)", async () => {
      const newBook = {
        title: "Test Book",
        author: "Test Author",
        isbn: "TEST-ISBN-001",
        totalCopies: 2,
        category: "Testing",
      };

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", sessionCookie)
        .send(newBook);

      expect([201, 400]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body).toHaveProperty("book_id");
      }
    });

    test("should return 400 when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/books")
        .set("Cookie", sessionCookie)
        .send({
          title: "Test Book",
          // Missing author and totalCopies
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Authentication", () => {
    test("should return 401 when not authenticated", async () => {
      const response = await request(app).get("/api/books");

      expect(response.status).toBe(401);
    });
  });
});

describe("Books API - Excel Test Cases", () => {
  let adminCookie = "";

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "admin123",
    });
    const cookies = res.headers["set-cookie"];
    adminCookie = cookies ? cookies[0] : "";
  });

  test("TC-007 GET /api/books with auth", async () => {
    const res = await request(app).get("/api/books").set("Cookie", adminCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("TC-008 GET /api/books?genre=fiction", async () => {
    const res = await request(app)
      .get("/api/books?genre=fiction")
      .set("Cookie", adminCookie);
    expect(res.status).toBe(200);
  });

  test("TC-009 GET /api/books without auth", async () => {
    const res = await request(app).get("/api/books");
    expect(res.status).toBe(401);
  });

  test("TC-010 GET /api/books empty database returns []", async () => {
    // First, clear all books from database (simulate empty database)
    await run("DELETE FROM books");

    const res = await request(app).get("/api/books").set("Cookie", adminCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0); // Should return empty array

    // Reinitialize database after test to restore data for other tests
    await initializeDatabase();
  });

  test("TC-011 GET /api/books/1", async () => {
    const res = await request(app).get("/api/books/1").set("Cookie", adminCookie);
    expect(res.status).toBe(200);
  });

  test("TC-012 GET /api/books/99999", async () => {
    const res = await request(app)
      .get("/api/books/99999")
      .set("Cookie", adminCookie);
    expect(res.status).toBe(404);
  });

  test("TC-013 GET /api/books/abc", async () => {
    const res = await request(app)
      .get("/api/books/abc")
      .set("Cookie", adminCookie);
    expect(res.status).toBe(400);
  });

  test("TC-014 GET /api/books/0", async () => {
    const res = await request(app).get("/api/books/0").set("Cookie", adminCookie);
    expect([400, 404]).toContain(res.status);
  });

  test("TC-015 POST /api/books create", async () => {
    const res = await request(app)
      .post("/api/books")
      .set("Cookie", adminCookie)
      .send({
        title: "Test Book",
        author: "John Doe",
        isbn: "9781234567890",
      });
    expect(res.status).toBe(201);
  });

  test("TC-016 POST /api/books missing title", async () => {
    const res = await request(app)
      .post("/api/books")
      .set("Cookie", adminCookie)
      .send({ author: "John Doe" });
    expect(res.status).toBe(400);
  });

  test("TC-017 POST /api/books duplicate ISBN", async () => {
    const res = await request(app)
      .post("/api/books")
      .set("Cookie", adminCookie)
      .send({
        title: "Book",
        author: "John",
        isbn: "9781234567890",
      });
    expect(res.status).toBe(409);
  });

  test("TC-018 POST /api/books without auth", async () => {
    const res = await request(app).post("/api/books").send({
      title: "NoAuth",
      author: "John",
    });
    expect(res.status).toBe(401);
  });

  test("TC-019 POST /api/books empty title", async () => {
    const res = await request(app)
      .post("/api/books")
      .set("Cookie", adminCookie)
      .send({ title: "", author: "John" });
    expect(res.status).toBe(400);
  });

  test("TC-020 PUT /api/books/1 update title", async () => {
    const res = await request(app)
      .put("/api/books/1")
      .set("Cookie", adminCookie)
      .send({ title: "Updated Title" });
    expect(res.status).toBe(200);
  });

  test("TC-021 PUT /api/books/99999", async () => {
    const res = await request(app)
      .put("/api/books/99999")
      .set("Cookie", adminCookie)
      .send({ title: "Updated Title" });
    expect(res.status).toBe(404);
  });

  test("TC-022 PUT /api/books/1 without auth", async () => {
    const res = await request(app).put("/api/books/1").send({ title: "X" });
    expect(res.status).toBe(401);
  });

  test("TC-023 PUT /api/books/1 empty body", async () => {
    const res = await request(app)
      .put("/api/books/1")
      .set("Cookie", adminCookie)
      .send({});
    expect([400, 200]).toContain(res.status);
  });

  test("TC-024 DELETE /api/books/2", async () => {
    const res = await request(app)
      .delete("/api/books/2")
      .set("Cookie", adminCookie);
    expect([200, 204]).toContain(res.status);
  });

  test("TC-025 DELETE /api/books/99999", async () => {
    const res = await request(app)
      .delete("/api/books/99999")
      .set("Cookie", adminCookie);
    expect(res.status).toBe(404);
  });

  test("TC-026 DELETE /api/books/1 without auth", async () => {
    const res = await request(app).delete("/api/books/1");
    expect(res.status).toBe(401);
  });

  test("TC-027 POST /api/borrow create borrow record", async () => {
    const res = await request(app)
      .post("/api/borrow")
      .set("Cookie", adminCookie)
      .send({ bookId: 3, userId: 1 });
    expect(res.status).toBe(200);
  });

  test("TC-028 POST /api/borrow unavailable/already borrowed", async () => {
    const res = await request(app)
      .post("/api/borrow")
      .set("Cookie", adminCookie)
      .send({ bookId: 1, userId: 2 });
    expect([409, 400]).toContain(res.status);
  });

  test("TC-029 POST /api/borrow unknown book", async () => {
    const res = await request(app)
      .post("/api/borrow")
      .set("Cookie", adminCookie)
      .send({ bookId: 99999, userId: 1 });
    expect(res.status).toBe(404);
  });

  test("TC-030 POST /api/borrow duplicate borrow", async () => {
    const res = await request(app)
      .post("/api/borrow")
      .set("Cookie", adminCookie)
      .send({ bookId: 3, userId: 1 });
    expect(res.status).toBe(409);
  });

  test("TC-031 GET /api/books with expired bearer token", async () => {
    const res = await request(app)
      .get("/api/books")
      .set("Authorization", "Bearer expired_token");
    expect(res.status).toBe(401);
    expect(String(res.body.error || "")).toMatch(/token expired/i);
  });

  test("TC-033 POST /api/books XSS title", async () => {
    const res = await request(app)
      .post("/api/books")
      .set("Cookie", adminCookie)
      .send({
        title: "<script>alert('XSS')</script>",
        author: "Test",
      });
    expect([400, 201]).toContain(res.status);
  });
});
