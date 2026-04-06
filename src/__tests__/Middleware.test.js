const { requireAuth, requireAdmin } = require("../middleware/auth");

describe("Middleware: Authentication & Authorization", () => {
  let req, res, next;

  beforeEach(() => {
    // จำลอง Request, Response และ Next function ของ Express
    req = { session: {}, originalUrl: "" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  describe("requireAuth()", () => {
    test("ควรให้ผ่าน (next) ถ้ามี session", () => {
      req.session.user_id = 1;
      requireAuth(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test("ควรส่ง 401 ถ้าเรียก API โดยไม่มี session", () => {
      req.originalUrl = "/api/books";
      requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    test("ควร Redirect ไป /login ถ้าเข้าหน้าเว็บโดยไม่มี session", () => {
      req.originalUrl = "/dashboard";
      requireAuth(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("requireAdmin()", () => {
    test("ควรส่ง 401 ถ้าไม่มี session", () => {
      requireAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("ควรส่ง 403 ถ้ามี session แต่ไม่ใช่ Admin", () => {
      req.session = { user_id: 1, role: "librarian" };
      requireAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden - Admin access required" });
    });

    test("ควรให้ผ่าน (next) ถ้าเป็น Admin", () => {
      req.session = { user_id: 1, role: "admin" };
      requireAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});