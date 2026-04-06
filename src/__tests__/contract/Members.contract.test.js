const request = require("supertest");
const app = require("../../app");
const { assertJsonSchema } = require("./helpers/assertJsonSchema");

const errorSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: { type: "string" },
  },
  additionalProperties: false,
};

const memberSummarySchema = {
  type: "object",
  required: [
    "member_id",
    "member_code",
    "full_name",
    "member_type",
    "status",
    "max_books",
  ],
  properties: {
    member_id: { type: "number" },
    member_code: { type: "string" },
    full_name: { type: "string" },
    email: { type: "string", nullable: true },
    phone: { type: "string", nullable: true },
    member_type: { type: "string" },
    registration_date: { type: "string" },
    status: { type: "string" },
    max_books: { type: "number" },
  },
};

const membersListSchema = {
  type: "array",
  items: memberSummarySchema,
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

const memberDetailSchema = {
  type: "object",
  required: [
    "member_id",
    "member_code",
    "full_name",
    "member_type",
    "status",
    "max_books",
    "borrowingCount",
    "borrowingRecords",
  ],
  properties: {
    member_id: { type: "number" },
    member_code: { type: "string" },
    full_name: { type: "string" },
    email: { type: "string", nullable: true },
    phone: { type: "string", nullable: true },
    member_type: { type: "string" },
    registration_date: { type: "string" },
    status: { type: "string" },
    max_books: { type: "number" },
    borrowingCount: { type: "number" },
    borrowingRecords: {
      type: "array",
      items: borrowingRecordSchema,
    },
  },
};

const createMemberSuccessSchema = {
  type: "object",
  required: ["success", "member_id"],
  properties: {
    success: { const: true },
    member_id: { type: "number" },
  },
  additionalProperties: false,
};

function expectJson(response) {
  expect(response.headers["content-type"]).toMatch(/application\/json/);
}

function expectErrorContract(response, status) {
  expect(response.status).toBe(status);
  expectJson(response);
  assertJsonSchema(response.body, errorSchema);
}

describe("Members API contract", () => {
  async function login(username, password) {
    const response = await request(app).post("/api/auth/login").send({
      username,
      password,
    });

    expect(response.status).toBe(200);
    return response.headers["set-cookie"];
  }

  describe("GET /api/members", () => {
    test("returns the unauthorized contract without a session", async () => {
      const response = await request(app).get("/api/members");

      expectErrorContract(response, 401);
      expect(response.body).toEqual({ error: "Unauthorized" });
    });

    test("returns a members list contract for authenticated users", async () => {
      const cookies = await login("librarian", "lib123");
      const response = await request(app)
        .get("/api/members")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, membersListSchema);
    });
  });

  describe("GET /api/members/:id", () => {
    test("returns the member detail contract for an existing member", async () => {
      const cookies = await login("librarian", "lib123");
      const response = await request(app)
        .get("/api/members/1")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expectJson(response);
      assertJsonSchema(response.body, memberDetailSchema);
    });

    test("returns the not found contract for an unknown member", async () => {
      const cookies = await login("librarian", "lib123");
      const response = await request(app)
        .get("/api/members/99999")
        .set("Cookie", cookies);

      expectErrorContract(response, 404);
      expect(response.body).toEqual({ error: "Member not found" });
    });
  });

  describe("POST /api/members", () => {
    test("returns the forbidden contract for non-admin users", async () => {
      const cookies = await login("librarian", "lib123");
      const response = await request(app)
        .post("/api/members")
        .set("Cookie", cookies)
        .send({
          memberCode: "M-CONTRACT-BLOCKED",
          fullName: "Blocked Contract Member",
          memberType: "student",
        });

      expectErrorContract(response, 403);
      expect(response.body).toEqual({
        error: "Forbidden - Admin access required",
      });
    });

    test("returns the validation error contract when required fields are missing", async () => {
      const cookies = await login("admin", "admin123");
      const response = await request(app)
        .post("/api/members")
        .set("Cookie", cookies)
        .send({
          fullName: "Missing Member Code",
        });

      expectErrorContract(response, 400);
      expect(response.body).toEqual({
        error: "Member code, full name, and member type are required",
      });
    });

    test("returns the creation contract for valid admin requests", async () => {
      const cookies = await login("admin", "admin123");
      const memberCode = `MCONTRACT${Date.now()}`;

      const response = await request(app)
        .post("/api/members")
        .set("Cookie", cookies)
        .send({
          memberCode,
          fullName: "Contract Test Member",
          email: "contract.member@example.com",
          phone: "0800000000",
          memberType: "student",
          maxBooks: 4,
        });

      expect(response.status).toBe(201);
      expectJson(response);
      assertJsonSchema(response.body, createMemberSuccessSchema);
    });

    test("returns the duplicate member code contract", async () => {
      const cookies = await login("admin", "admin123");
      const response = await request(app)
        .post("/api/members")
        .set("Cookie", cookies)
        .send({
          memberCode: "M001",
          fullName: "Duplicate Member",
          memberType: "student",
        });

      expectErrorContract(response, 400);
      expect(response.body).toEqual({
        error: "Member code already exists",
      });
    });
  });

  describe("DELETE /api/members/:id", () => {
    test("returns the unreturned books error contract", async () => {
      const cookies = await login("admin", "admin123");
      const response = await request(app)
        .delete("/api/members/1")
        .set("Cookie", cookies);

      expectErrorContract(response, 400);
      expect(response.body).toEqual({
        error: "Cannot delete member with unreturned books",
      });
    });
  });
});
