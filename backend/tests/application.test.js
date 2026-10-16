import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

const app = express();
app.use(express.json());

// Mock auth middleware so we can test routes without real token
jest.unstable_mockModule("../middleware/authMiddleware.js", () => ({
  protect: (req, res, next) => {
    req.user = { _id: "507f1f77bcf86cd799439011", role: "applicant" };
    next();
  },
  requireRole: (...roles) => (req, res, next) => next(),
}));

// Mock validateRequest middleware
jest.unstable_mockModule("../middleware/validateRequest.js", () => ({
  validateRequest: () => (req, res, next) => next(),
  validateFormData: () => (req, res, next) => {
    req.body.data = JSON.stringify(req.body);
    next();
  },
}));

// Mock upload middleware
jest.unstable_mockModule("../middleware/uploadMiddleware.js", () => ({
  uploadDocuments: (req, res, next) => {
    req.files = {
      photo: [{ originalname: "photo.jpg", filename: "photo.jpg", mimetype: "image/jpeg", size: 100 }],
      education: [{ originalname: "edu.pdf", filename: "edu.pdf", mimetype: "application/pdf", size: 200 }],
    };
    next();
  },
}));

// Mock model
const mockCreate = jest.fn();
const mockFindOne = jest.fn();
jest.unstable_mockModule("../models/Application.js", () => ({
  default: {
    create: mockCreate,
    findOne: mockFindOne,
  },
}));

// Mock applicationController utils
jest.unstable_mockModule("../utils/referenceNumber.js", () => ({
  nextAppId: async () => "APP-123",
  nextReferenceNumber: async () => "REF-123",
  toEthiopianYear: () => 2017,
  updateReferenceNumberCounter: async () => {},
}));
jest.unstable_mockModule("../server.js", () => ({
  broadcastSSE: () => {},
}));

describe("Application Integration & Unit Tests", () => {
  let applicationRoutes;

  beforeAll(async () => {
    const importedModule = await import("../routes/applicationRoutes.js");
    applicationRoutes = importedModule.default;
    app.use("/api/applications", applicationRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject double-submit for same service type", async () => {
    // Simulate an existing pending application
    mockFindOne.mockResolvedValueOnce({
      _id: "existingAppId",
      status: "staff_review",
    });

    const response = await request(app).post("/api/applications").send({
      applicationType: "new",
      applicantInfo: {
        fullName: "John Doe",
        gender: "male",
        phone: "123",
        address: { region: "R", woreda: "W", kebele: "K" },
      },
      serviceType: { id: "service-123" },
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain("You already have an active or pending application");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("should create application when no pending application exists", async () => {
    // Simulate NO existing pending application
    mockFindOne.mockResolvedValueOnce(null);

    mockCreate.mockResolvedValueOnce({
      _id: "newAppId",
      appId: "APP-123",
      applicant: "507f1f77bcf86cd799439011",
      applicationType: "new",
      status: "staff_review",
    });

    const response = await request(app).post("/api/applications").send({
      applicationType: "new",
      applicantInfo: {
        fullName: "John Doe",
        gender: "male",
        phone: "123",
        address: { region: "R", woreda: "W", kebele: "K" },
      },
      serviceType: { id: "service-123" },
    });

    expect(response.status).toBe(201);
    expect(mockCreate).toHaveBeenCalled();
  });
});
