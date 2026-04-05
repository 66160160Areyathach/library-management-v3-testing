jest.mock("../../models/Borrowing", () => ({
  findById: jest.fn(),
  returnBook: jest.fn(),
}));

jest.mock("../../models/Book", () => ({
  findById: jest.fn(),
  updateAvailableCopies: jest.fn(),
}));

jest.mock("../../models/Member", () => ({}));

const Borrowing = require("../../models/Borrowing");
const Book = require("../../models/Book");
const BorrowingController = require("../../controllers/BorrowingController");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("BorrowingController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returnBook returns 400 when returnDate is missing", async () => {
    const req = { params: { borrowId: 1 }, body: {} };
    const res = createResponse();

    await BorrowingController.returnBook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Return date is required" });
  });

  test("returnBook returns 400 when the book is already returned", async () => {
    Borrowing.findById.mockResolvedValue({
      borrow_id: 1,
      status: "returned",
      due_date: "2026-04-01",
      book_id: 9,
    });
    const req = {
      params: { borrowId: 1 },
      body: { returnDate: "2026-04-05" },
    };
    const res = createResponse();

    await BorrowingController.returnBook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Book already returned" });
  });

  test("returnBook calculates fines for overdue returns", async () => {
    Borrowing.findById.mockResolvedValue({
      borrow_id: 1,
      status: "borrowed",
      due_date: "2026-04-01",
      book_id: 9,
    });
    Book.findById.mockResolvedValue({ book_id: 9, available_copies: 2 });
    const req = {
      params: { borrowId: 1 },
      body: { returnDate: "2026-04-04" },
    };
    const res = createResponse();

    await BorrowingController.returnBook(req, res);

    expect(Borrowing.returnBook).toHaveBeenCalledWith(1, "2026-04-04", 30);
    expect(Book.updateAvailableCopies).toHaveBeenCalledWith(9, 3);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      fineAmount: 30,
    });
  });

  test("extendDueDate returns 400 when newDueDate is missing", async () => {
    const req = { params: { borrowId: 3 }, body: {} };
    const res = createResponse();

    await BorrowingController.extendDueDate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "New due date is required" });
  });
});
