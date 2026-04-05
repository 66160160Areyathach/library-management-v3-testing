const request = require("supertest");
const app = require("../../app");

describe("Members Integration API", () => {
  async function login(username, password) {
    const response = await request(app).post("/api/auth/login").send({
      username,
      password,
    });

    expect(response.status).toBe(200);
    return response.headers["set-cookie"];
  }

  describe("GET /api/members", () => {
    test("should return 401 when user is not authenticated", async () => {
      const response = await request(app).get("/api/members");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    test("should return all members for authenticated users", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/members")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          member_id: expect.any(Number),
          member_code: expect.any(String),
          full_name: expect.any(String),
          member_type: expect.any(String),
          status: expect.any(String),
        }),
      );
    });
  });

  describe("GET /api/members/:id", () => {
    test("should return member details when member exists", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/members/1")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          member_id: 1,
          member_code: expect.any(String),
          full_name: expect.any(String),
          borrowingCount: expect.any(Number),
          borrowingRecords: expect.any(Array),
        }),
      );
    });

    test("should return 404 when member does not exist", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/members/99999")
        .set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Member not found");
    });

    test("should return 404 when member id format is invalid", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .get("/api/members/abc")
        .set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Member not found");
    });
  });

  describe("POST /api/members", () => {
    test("should return 403 when non-admin tries to create member", async () => {
      const cookies = await login("librarian", "lib123");

      const response = await request(app)
        .post("/api/members")
        .set("Cookie", cookies)
        .send({
          memberCode: "M-LIBRARIAN-BLOCKED",
          fullName: "Blocked Librarian Request",
          memberType: "student",
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        "error",
        "Forbidden - Admin access required",
      );
    });

    test("should return 400 when required fields are missing", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .post("/api/members")
        .set("Cookie", cookies)
        .send({
          fullName: "Missing Member Code",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Member code, full name, and member type are required",
      );
    });

    test("should create a member when request is valid", async () => {
      const cookies = await login("admin", "admin123");
      const memberCode = `MTEST${Date.now()}`;

      const response = await request(app)
        .post("/api/members")
        .set("Cookie", cookies)
        .send({
          memberCode,
          fullName: "Integration Test Member",
          email: "integration.member@example.com",
          phone: "0800000000",
          memberType: "student",
          maxBooks: 4,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          member_id: expect.any(Number),
        }),
      );
    });

    test("should return 400 when member code already exists", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .post("/api/members")
        .set("Cookie", cookies)
        .send({
          memberCode: "M001",
          fullName: "Duplicate Member",
          memberType: "student",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Member code already exists",
      );
    });

    test("should return 401 when unauthenticated user tries to create member", async () => {
      const response = await request(app).post("/api/members").send({
        memberCode: `MNOAUTH${Date.now()}`,
        fullName: "No Auth Member",
        memberType: "student",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });
  });

  describe("DELETE /api/members/:id", () => {
    test("should return 400 when deleting a member with unreturned books", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .delete("/api/members/1")
        .set("Cookie", cookies);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Cannot delete member with unreturned books",
      );
    });

    test("should return 404 when deleting a non-existent member", async () => {
      const cookies = await login("admin", "admin123");

      const response = await request(app)
        .delete("/api/members/99999")
        .set("Cookie", cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Member not found");
    });
  });
});
