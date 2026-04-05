const request = require("supertest");
const app = require("../app");

describe("Members API", () => {
  let adminCookie;

  // Setup: ล็อกอินในฐานะ Admin เพื่อเอา Session Cookie ก่อนเริ่มการทดสอบ
  beforeAll(async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "admin",
      password: "admin123",
    });
    const cookies = response.headers["set-cookie"];
    adminCookie = cookies ? cookies[0].split(";")[0] : "";
  });

  describe("GET /api/members", () => {
    test("ควรดึงข้อมูลสมาชิกทั้งหมดได้สำเร็จ (HTTP 200)", async () => {
      const res = await request(app)
        .get("/api/members")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("ควรคืนค่า 401 หากเรียก API โดยไม่มี Auth Token", async () => {
      const res = await request(app).get("/api/members");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/members/:id", () => {
    test("ควรดึงข้อมูลสมาชิกระบุ ID ได้สำเร็จและมีข้อมูลการยืมแนบมา", async () => {
      const res = await request(app)
        .get("/api/members/1")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("member_id", 1);
      expect(res.body).toHaveProperty("full_name");
      expect(res.body).toHaveProperty("borrowingCount");
    });

    test("ควรคืนค่า 404 หากระบุ ID สมาชิกที่ไม่มีอยู่ในระบบ", async () => {
      const res = await request(app)
        .get("/api/members/99999")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /api/members", () => {
    test("ควรสร้างสมาชิกใหม่ได้สำเร็จ หากข้อมูลครบถ้วน", async () => {
      const newMember = {
        memberCode: `M-${Date.now()}`, // สุ่มรหัสเพื่อไม่ให้ซ้ำเวลา Run Test ซ้ำ
        fullName: "Test Member",
        email: "test@example.com",
        phone: "0801234567",
        memberType: "student",
        maxBooks: 3,
      };

      const res = await request(app)
        .post("/api/members")
        .set("Cookie", adminCookie)
        .send(newMember);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("member_id");
    });

    test("ควรคืนค่า 400 หากส่งข้อมูลที่จำเป็นมาไม่ครบ (missing fields)", async () => {
      const res = await request(app)
        .post("/api/members")
        .set("Cookie", adminCookie)
        .send({ fullName: "Incomplete Data" }); // ขาด memberCode และ memberType

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/members/:id", () => {
    test("ควรอัปเดตข้อมูลสมาชิกได้สำเร็จ", async () => {
      const updateData = {
        fullName: "Updated Name Test",
        memberType: "teacher",
        status: "active",
      };

      const res = await request(app)
        .put("/api/members/1")
        .set("Cookie", adminCookie)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  describe("DELETE /api/members/:id", () => {
    test("ควรคืนค่า 404 หากพยายามลบสมาชิกที่ไม่มีอยู่ในระบบ", async () => {
      const res = await request(app)
        .delete("/api/members/99999")
        .set("Cookie", adminCookie);
      expect(res.status).toBe(404);
    });
  });
});