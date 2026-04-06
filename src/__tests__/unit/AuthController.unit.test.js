jest.mock("../../models/User", () => ({
  findByUsername: jest.fn(),
}));

const User = require("../../models/User");
const AuthController = require("../../controllers/AuthController");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("AuthController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("login returns 400 when username and password are missing", async () => {
    const req = { body: {}, session: {} };
    const res = createResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Username and password are required",
    });
  });

  test("login returns 401 when user is not found", async () => {
    User.findByUsername.mockResolvedValue(null);
    const req = {
      body: { username: "ghost", password: "secret" },
      session: {},
    };
    const res = createResponse();

    await AuthController.login(req, res);

    expect(User.findByUsername).toHaveBeenCalledWith("ghost");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid username or password",
    });
  });

  test("login returns 401 when password is incorrect", async () => {
    User.findByUsername.mockResolvedValue({
      user_id: 1,
      username: "admin",
      password: "admin123",
      full_name: "Admin User",
      role: "admin",
    });
    const req = {
      body: { username: "admin", password: "wrongpass" },
      session: {},
    };
    const res = createResponse();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid username or password",
    });
  });

  test("login stores session and returns user payload for valid credentials", async () => {
    User.findByUsername.mockResolvedValue({
      user_id: 1,
      username: "admin",
      password: "admin123",
      full_name: "Admin User",
      role: "admin",
    });
    const req = {
      body: { username: "admin", password: "admin123" },
      session: {},
    };
    const res = createResponse();

    await AuthController.login(req, res);

    expect(req.session).toEqual({
      user_id: 1,
      username: "admin",
      full_name: "Admin User",
      role: "admin",
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      user: {
        user_id: 1,
        username: "admin",
        full_name: "Admin User",
        role: "admin",
      },
    });
  });

  test("getCurrentUser returns 401 when session is not authenticated", async () => {
    const req = { session: {} };
    const res = createResponse();

    await AuthController.getCurrentUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Not authenticated" });
  });

  test("getCurrentUser returns current session user", async () => {
    const req = {
      session: {
        user_id: 3,
        username: "librarian",
        full_name: "Library Staff",
        role: "librarian",
      },
    };
    const res = createResponse();

    await AuthController.getCurrentUser(req, res);

    expect(res.json).toHaveBeenCalledWith({
      user_id: 3,
      username: "librarian",
      full_name: "Library Staff",
      role: "librarian",
    });
  });
});
