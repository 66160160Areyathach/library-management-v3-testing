const request = require("supertest");
const app = require("../../app");

describe("Books Integration API", () => {
  async function login(username, password) {
    const response = await request(app).post("/api/auth/login").send({
      username,
      password,
    });

    expect(response.status).toBe(200);
    return response.headers["set-cookie"];
  }

  describe("GET /api/books", () => {
    test("should return 401 when user is not authenticated", async () => {
      const response = await request(app).get("/api/books");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    test("should return all books for authenticated users", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          book_id: expect.any(Number),
          title: expect.any(String),
          author: expect.any(String),
          available_copies: expect.any(Number),
        }),
      );
    });
  });

  describe("GET /api/books/search", () => {
    test("should search books by keyword", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books/search")
        .query({ q: "Python" })
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test("should return 400 when search query is missing", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books/search")
        .query({ q: "" })
        .set("Cookie", cookies);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Search query is required");
    });
  });

  describe("GET /api/books/:id", () => {
    test("should return book details when book exists", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books/1")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          book_id: 1,
          title: expect.any(String),
          author: expect.any(String),
          isBorrowed: expect.any(Boolean),
        }),
      );
    });

    test("should return 404 when book does not exist", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books/99999")
        .set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Book not found");
    });

    test("should return 404 when book id format is invalid", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books/abc")
        .set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Book not found");
    });
  });

  describe("POST /api/books", () => {
    test("should return 403 when non-admin tries to create a book", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          title: "Blocked Book Creation",
          author: "Librarian",
          totalCopies: 1,
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        "error",
        "Forbidden - Admin access required",
      );
    });

    test("should return 401 when unauthenticated user tries to create a book", async () => {
      const response = await request(app).post("/api/books").send({
        title: "No Auth Book",
        author: "Anonymous",
        totalCopies: 1,
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    test("should return 400 when required fields are missing", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          title: "Incomplete Book",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Title, author, and total copies are required",
      );
    });

    test("should create a new book when request is valid", async () => {
      const cookies = await login("admin", "admin123");
      const uniqueSuffix = Date.now();

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          isbn: `ISBN-${uniqueSuffix}`,
          title: `Integration Test Book ${uniqueSuffix}`,
          author: "Integration Author",
          category: "Testing",
          totalCopies: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          book_id: expect.any(Number),
        }),
      );
    });

    test("should return 400 when ISBN already exists", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          isbn: "978-616-123-456-7",
          title: "Duplicate ISBN Book",
          author: "Integration Author",
          totalCopies: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "ISBN already exists");
    });

    test("should return 400 when total copies is zero", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          isbn: `ZERO-${Date.now()}`,
          title: "Zero Copies Book",
          author: "Integration Author",
          totalCopies: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Title, author, and total copies are required",
      );
    });
  });

  describe("PUT /api/books/:id", () => {
    test("should update a book when request is valid", async () => {
      const cookies = await login("admin", "admin123");
      const uniqueSuffix = Date.now();

      const createResponse = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          isbn: `UPDATE-${uniqueSuffix}`,
          title: `Book To Update ${uniqueSuffix}`,
          author: "Original Author",
          totalCopies: 2,
        });

      expect(createResponse.status).toBe(201);

      const response = await request(app)
        .put(`/api/books/${createResponse.body.book_id}`)
        .set("Cookie", cookies)
        .send({
          isbn: `UPDATE-${uniqueSuffix}`,
          title: `Updated Book ${uniqueSuffix}`,
          author: "Updated Author",
          totalCopies: 3,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
        }),
      );
    });

    test("should return 404 when updating a non-existent book", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .put("/api/books/99999")
        .set("Cookie", cookies)
        .send({
          title: "Missing Book",
          author: "Nobody",
          totalCopies: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Book not found");
    });
  });

  describe("DELETE /api/books/:id", () => {
    test("should return 400 when deleting a borrowed book", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .delete("/api/books/1")
        .set("Cookie", cookies);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Cannot delete a borrowed book",
      );
    });
  });
});
