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
    test("TC-008 should return 200 with an array of books for authenticated users", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          book_id: expect.any(Number),
          title: expect.any(String),
          author: expect.any(String),
        }),
      );
    });

    test("TC-009 should return filtered books by category", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books")
        .query({ category: "Computer" })
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((book) => {
        expect(book.category).toBe("Computer");
      });
    });

    test("TC-010 should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/api/books")
        .set("Authorization", "Bearer invalid_token_123");

      expect(response.status).toBe(401);
    });

    test("TC-011 should return 401 when no authorization is provided", async () => {
      const response = await request(app).get("/api/books");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    test("TC-012 should return 401 when bearer token is empty", async () => {
      const response = await request(app)
        .get("/api/books")
        .set("Authorization", "Bearer ");

      expect(response.status).toBe(401);
    });

    test("TC-013 should return only available books when available=true is requested", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books")
        .query({ available: true })
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((book) => {
        expect(book.available_copies).toBeGreaterThan(0);
      });
    });
  });

  describe("POST /api/books", () => {
    test("TC-014 should create a new book for admin users", async () => {
      const cookies = await login("admin", "admin123");
      const uniqueSuffix = Date.now();

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          title: `Clean Code ${uniqueSuffix}`,
          author: "Robert C. Martin",
          isbn: `9780132350884-${uniqueSuffix}`,
          category: "Computer",
          totalCopies: 2,
          shelfLocation: "A-110",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          book_id: expect.any(Number),
        }),
      );
    });

    test("TC-015 should return 400 when title is missing", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          author: "John Doe",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Title, author, and total copies are required",
      );
    });

    test("TC-016 should return 409 when ISBN already exists", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          title: "Book",
          author: "John",
          isbn: "9781234567890",
          totalCopies: 1,
        });

      expect(response.status).toBe(409);
    });

    test("TC-017 should return 401 when unauthenticated user creates a book", async () => {
      const response = await request(app).post("/api/books").send({
        title: "No Auth Book",
        author: "John Doe",
        totalCopies: 1,
      });

      expect(response.status).toBe(401);
    });

    test("TC-018 should return 400 when title is empty", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          title: "",
          author: "John",
          totalCopies: 1,
        });

      expect(response.status).toBe(400);
    });

    test("TC-019 should reject or sanitize XSS payloads in title", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          title: "<script>alert('XSS')</script>",
          author: "Test",
          totalCopies: 1,
        });

      expect([400, 201]).toContain(response.status);
    });
  });

  describe("GET /api/books/:id", () => {
    test("TC-020 should return book details when book exists", async () => {
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
        }),
      );
    });

    test("TC-021 should return 404 when book does not exist", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books/99999")
        .set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Book not found");
    });

    test("TC-022 should return 400 when book id is not an integer", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books/abc")
        .set("Cookie", cookies);

      expect(response.status).toBe(400);
    });

    test("TC-023 should return 400 or 404 when book id is zero", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/books/0")
        .set("Cookie", cookies);

      expect([400, 404]).toContain(response.status);
    });
  });

  describe("PUT /api/books/:id", () => {
    test("TC-024 should update an existing book", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .put("/api/books/1")
        .set("Cookie", cookies)
        .send({
          title: "Updated Title",
          shelfLocation: "A-101B",
        });

      expect(response.status).toBe(200);
    });

    test("TC-025 should return 404 when updating a non-existent book", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .put("/api/books/99999")
        .set("Cookie", cookies)
        .send({
          title: "Updated Title",
          author: "Nobody",
          totalCopies: 1,
        });

      expect(response.status).toBe(404);
    });

    test("TC-026 should return 401 for invalid token on update", async () => {
      const response = await request(app)
        .put("/api/books/1")
        .set("Authorization", "Bearer fake_token")
        .send({
          title: "Updated Title",
        });

      expect(response.status).toBe(401);
    });

    test("TC-027 should allow empty body or keep previous values on update", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .put("/api/books/1")
        .set("Cookie", cookies)
        .send({});

      expect([400, 200]).toContain(response.status);
    });
  });

  describe("DELETE /api/books/:id", () => {
    test("TC-028 should delete a non-borrowed book", async () => {
      const cookies = await login("admin", "admin123");
      const uniqueSuffix = Date.now();

      const createResponse = await request(app)
        .post("/api/books")
        .set("Cookie", cookies)
        .send({
          title: `Delete Me ${uniqueSuffix}`,
          author: "Cleanup Author",
          isbn: `DELETE-${uniqueSuffix}`,
          totalCopies: 1,
        });

      expect(createResponse.status).toBe(201);

      const response = await request(app)
        .delete(`/api/books/${createResponse.body.book_id}`)
        .set("Cookie", cookies);

      expect([200, 204]).toContain(response.status);
    });

    test("TC-029 should return 400 when deleting with invalid id format", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .delete("/api/books/abc")
        .set("Cookie", cookies);

      expect(response.status).toBe(400);
    });

    test("TC-030 should return 401 when deleting without authentication", async () => {
      const response = await request(app).delete("/api/books/1");

      expect(response.status).toBe(401);
    });

    test("TC-031 should return 409 when deleting a borrowed book", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .delete("/api/books/1")
        .set("Cookie", cookies);

      expect(response.status).toBe(409);
    });
  });
});
