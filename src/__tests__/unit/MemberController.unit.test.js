jest.mock("../../models/Member", () => ({
  findByCode: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  getBorrowingCount: jest.fn(),
  delete: jest.fn(),
}));

jest.mock("../../models/Borrowing", () => ({
  getByMember: jest.fn(),
}));

const Member = require("../../models/Member");
const MemberController = require("../../controllers/MemberController");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("MemberController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("create returns 400 when required fields are missing", async () => {
    const req = { body: { fullName: "Only Name" } };
    const res = createResponse();

    await MemberController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Member code, full name, and member type are required",
    });
  });

  test("create returns 400 when member code already exists", async () => {
    Member.findByCode.mockResolvedValue({ member_id: 5 });
    const req = {
      body: {
        memberCode: "M001",
        fullName: "Existing Member",
        memberType: "student",
      },
    };
    const res = createResponse();

    await MemberController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Member code already exists",
    });
  });

  test("create returns 201 with the created member id", async () => {
    Member.findByCode.mockResolvedValue(null);
    Member.create.mockResolvedValue({ lastID: 7 });
    const req = {
      body: {
        memberCode: "M007",
        fullName: "New Member",
        email: "new@example.com",
        memberType: "student",
        maxBooks: 5,
      },
    };
    const res = createResponse();

    await MemberController.create(req, res);

    expect(Member.create).toHaveBeenCalledWith(
      "M007",
      "New Member",
      "new@example.com",
      null,
      "student",
      5,
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      member_id: 7,
    });
  });

  test("delete returns 400 when member still has borrowed books", async () => {
    Member.findById.mockResolvedValue({ member_id: 7 });
    Member.getBorrowingCount.mockResolvedValue(2);
    const req = { params: { id: 7 } };
    const res = createResponse();

    await MemberController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Cannot delete member with unreturned books",
    });
  });
});
