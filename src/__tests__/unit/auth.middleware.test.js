const { requireAuth, requireAdmin } = require("../../middleware/auth");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    redirect: jest.fn(),
  };
}

describe("auth middleware", () => {
  test("requireAuth returns 401 for unauthenticated API requests", () => {
    const req = { session: {}, originalUrl: "/api/books" };
    const res = createResponse();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test("requireAuth redirects unauthenticated page requests to login", () => {
    const req = { session: {}, originalUrl: "/books" };
    const res = createResponse();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });

  test("requireAuth calls next for authenticated requests", () => {
    const req = { session: { user_id: 1 }, originalUrl: "/api/books" };
    const res = createResponse();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("requireAdmin returns 401 when session is missing", () => {
    const req = { session: null };
    const res = createResponse();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test("requireAdmin returns 403 for non-admin users", () => {
    const req = { session: { user_id: 1, role: "librarian" } };
    const res = createResponse();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden - Admin access required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("requireAdmin calls next for admin users", () => {
    const req = { session: { user_id: 1, role: "admin" } };
    const res = createResponse();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
