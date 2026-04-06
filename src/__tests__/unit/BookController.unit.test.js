jest.mock("../../models/Book", () => ({
  findById: jest.fn(),
  search: jest.fn(),
  findByIsbn: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../../models/Borrowing", () => ({
  checkIfBookBorrowed: jest.fn(),
}));

const Book = require("../../models/Book");
const Borrowing = require("../../models/Borrowing");
const BookController = require("../../controllers/BookController");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("BookController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("search returns 400 when query is missing", async () => {
    const req = { query: {} };
    const res = createResponse();

    await BookController.search(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Search query is required",
    });
  });

  test("getById returns 404 when the book does not exist", async () => {
    Book.findById.mockResolvedValue(null);
    const req = { params: { id: 999 } };
    const res = createResponse();

    await BookController.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Book not found" });
  });

  test("getById appends borrowing status to the response", async () => {
    Book.findById.mockResolvedValue({
      book_id: 1,
      title: "Test Book",
      author: "Test Author",
    });
    Borrowing.checkIfBookBorrowed.mockResolvedValue(true);
    const req = { params: { id: 1 } };
    const res = createResponse();

    await BookController.getById(req, res);

    expect(Borrowing.checkIfBookBorrowed).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      book_id: 1,
      title: "Test Book",
      author: "Test Author",
      isBorrowed: true,
    });
  });

  test("create returns 400 when required fields are missing", async () => {
    const req = { body: { author: "Author Only" } };
    const res = createResponse();

    await BookController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Title, author, and total copies are required",
    });
  });

  test("create returns 400 when ISBN already exists", async () => {
    Book.findByIsbn.mockResolvedValue({ book_id: 10 });
    const req = {
      body: {
        isbn: "9781234567890",
        title: "Existing",
        author: "Author",
        totalCopies: 2,
      },
    };
    const res = createResponse();

    await BookController.create(req, res);

    expect(Book.findByIsbn).toHaveBeenCalledWith("9781234567890");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "ISBN already exists" });
  });

  test("create returns 201 with the created book id for valid payloads", async () => {
    Book.findByIsbn.mockResolvedValue(null);
    Book.create.mockResolvedValue({ lastID: 42 });
    const req = {
      body: {
        isbn: "9781234567890",
        title: "New Book",
        author: "Author",
        totalCopies: 3,
      },
    };
    const res = createResponse();

    await BookController.create(req, res);

    expect(Book.create).toHaveBeenCalledWith(
      "9781234567890",
      "New Book",
      "Author",
      null,
      null,
      null,
      3,
      null,
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      book_id: 42,
    });
  });
});
