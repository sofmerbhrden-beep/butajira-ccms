import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

const app = express();
app.use(express.json());

let mockUserRole = "staff";
let mockUserId = "507f1f77bcf86cd799439022";

jest.unstable_mockModule("../middleware/authMiddleware.js", () => ({
  protect: (req, res, next) => {
    req.user = { _id: mockUserId, username: "staffuser", fullName: "Staff Member", role: mockUserRole };
    next();
  },
  requireRole: (...roles) => (req, res, next) => {
    if (roles.includes(mockUserRole)) return next();
    return res.status(403).json({ message: "Not allowed" });
  },
}));

jest.unstable_mockModule("../middleware/validateRequest.js", () => ({
  validateRequest: () => (req, res, next) => {
    if (req.body.decision === "rejected" && !req.body.reason) {
      return res.status(400).json({ message: "Reason is required for rejection" });
    }
    next();
  },
  validateFormData: () => (req, res, next) => next(),
}));

jest.unstable_mockModule("../middleware/uploadMiddleware.js", () => ({
  uploadDocuments: (req, res, next) => next(),
}));

const mockFindOne = jest.fn();
const mockFind = jest.fn();

jest.unstable_mockModule("../models/Application.js", () => ({
  default: {
    findOne: mockFindOne,
    find: mockFind,
  },
}));

jest.unstable_mockModule("../utils/auditLogger.js", () => ({
  logAudit: jest.fn(),
}));

jest.unstable_mockModule("../utils/mailer.js", () => ({
  sendStatusEmail: jest.fn().mockResolvedValue(true),
}));

jest.unstable_mockModule("../server.js", () => ({
  broadcastSSE: jest.fn(),
}));

describe("Staff Dashboard Logic & API Tests", () => {
  let applicationRoutes;

  beforeAll(async () => {
    const importedModule = await import("../routes/applicationRoutes.js");
    applicationRoutes = importedModule.default;
    app.use("/api/applications", applicationRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRole = "staff";
  });

  it("should allow staff to approve a pending application and move status to admin_review", async () => {
    const saveMock = jest.fn().mockResolvedValue(true);
    const mockApp = {
      appId: "APP-2001",
      applicant: "507f1f77bcf86cd799439011",
      status: "staff_review",
      applicantInfo: { fullName: "Jane Smith", address: { email: "jane@example.com" } },
      save: saveMock,
    };
    mockFindOne.mockResolvedValueOnce(mockApp);

    const response = await request(app)
      .post("/api/applications/APP-2001/decisions")
      .send({ decision: "approved", reason: "" });

    expect(response.status).toBe(201);
    expect(mockApp.status).toBe("admin_review");
    expect(mockApp.staffDecision).toBeDefined();
    expect(mockApp.staffDecision.decision).toBe("approved");
    expect(saveMock).toHaveBeenCalled();
  });

  it("should allow staff to reject an application with reason and set status to staff_rejected", async () => {
    const saveMock = jest.fn().mockResolvedValue(true);
    const mockApp = {
      appId: "APP-2002",
      applicant: "507f1f77bcf86cd799439011",
      status: "staff_review",
      applicantInfo: { fullName: "John Doe", address: { email: "john@example.com" } },
      save: saveMock,
    };
    mockFindOne.mockResolvedValueOnce(mockApp);

    const response = await request(app)
      .post("/api/applications/APP-2002/decisions")
      .send({ decision: "rejected", reason: "Missing education certificate" });

    expect(response.status).toBe(201);
    expect(mockApp.status).toBe("staff_rejected");
    expect(mockApp.staffDecision.reason).toBe("Missing education certificate");
    expect(saveMock).toHaveBeenCalled();
  });

  it("should return 409 Conflict if staff tries to review an application that is not in staff_review", async () => {
    const mockApp = {
      appId: "APP-2003",
      status: "admin_review",
    };
    mockFindOne.mockResolvedValueOnce(mockApp);

    const response = await request(app)
      .post("/api/applications/APP-2003/decisions")
      .send({ decision: "approved" });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain("not awaiting staff review");
  });

  it("should return 403 Forbidden if a non-staff/non-admin user tries to submit a decision", async () => {
    mockUserRole = "applicant";

    const response = await request(app)
      .post("/api/applications/APP-2004/decisions")
      .send({ decision: "approved" });

    expect(response.status).toBe(403);
  });
});
