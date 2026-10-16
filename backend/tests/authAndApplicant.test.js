import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

const app = express();
app.use(express.json());

// Mock mailer, token, representations, etc.
jest.unstable_mockModule("../utils/mailer.js", () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendTempPasswordEmail: jest.fn().mockResolvedValue(true),
  sendStatusEmail: jest.fn().mockResolvedValue(true),
  verifyMailer: jest.fn().mockResolvedValue(true),
  getTransporter: jest.fn(),
  wrap: (content) => content,
}));

jest.unstable_mockModule("../utils/token.js", () => ({
  sendToken: jest.fn(),
  clearToken: jest.fn(),
}));

// Mock User Model
const mockUserFindOne = jest.fn();
const mockUserCreate = jest.fn();
const mockUserFindById = jest.fn();

jest.unstable_mockModule("../models/User.js", () => ({
  default: {
    findOne: mockUserFindOne,
    create: mockUserCreate,
    findById: mockUserFindById,
  },
}));

// Mock Application Model
const mockAppFindOne = jest.fn();
const mockAppFind = jest.fn();
const mockAppFindById = jest.fn();

jest.unstable_mockModule("../models/Application.js", () => ({
  default: {
    findOne: mockAppFindOne,
    find: mockAppFind,
    findById: mockAppFindById,
  },
}));

// Mock auth middleware for protected application routes
jest.unstable_mockModule("../middleware/authMiddleware.js", () => ({
  protect: (req, res, next) => {
    req.user = { _id: "507f1f77bcf86cd799439011", role: "applicant", email: "applicant@example.com" };
    next();
  },
  identify: (req, res, next) => {
    req.user = { _id: "507f1f77bcf86cd799439011", role: "applicant", email: "applicant@example.com" };
    next();
  },
  requireRole: (...roles) => (req, res, next) => next(),
}));

jest.unstable_mockModule("../utils/referenceNumber.js", () => ({
  nextAppId: async () => "APP-999",
  nextReferenceNumber: async () => "1/2018",
  toEthiopianYear: () => 2018,
  updateReferenceNumberCounter: async () => {},
}));

jest.unstable_mockModule("../server.js", () => ({
  broadcastSSE: () => {},
}));

describe("Authentication & Applicant Workflow Backend Tests", () => {
  let userRoutes;
  let sessionRoutes;
  let applicationRoutes;

  beforeAll(async () => {
    process.env.STAFF_ACCESS_CODE = "STAFF123";
    process.env.ADMIN_ACCESS_CODE = "ADMIN123";

    const userMod = await import("../routes/userRoutes.js");
    const sessionMod = await import("../routes/sessionRoutes.js");
    const appMod = await import("../routes/applicationRoutes.js");

    userRoutes = userMod.default;
    sessionRoutes = sessionMod.default;
    applicationRoutes = appMod.default;

    app.use("/api/users", userRoutes);
    app.use("/api/sessions", sessionRoutes);
    app.use("/api/applications", applicationRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User Registration (POST /api/users/register)", () => {
    it("should reject applicant registration if email is invalid", async () => {
      const res = await request(app).post("/api/users/register").send({
        email: "bademail",
        password: "password123",
        fullName: "Test User",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors ? res.body.errors[0].message : res.body.message).toMatch(/email/i);
    });

    it("should reject applicant registration if password is under 8 chars", async () => {
      const res = await request(app).post("/api/users/register").send({
        email: "valid@example.com",
        password: "short",
        fullName: "Test User",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors ? res.body.errors[0].message : res.body.message).toMatch(/8 characters/i);
    });

    it("should reject staff registration if access code is wrong", async () => {
      const res = await request(app).post("/api/users/register").send({
        email: "staff@example.com",
        password: "password123",
        role: "staff",
        accessCode: "WRONG_CODE",
      });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Invalid access code");
    });

    it("should create new applicant user successfully", async () => {
      mockUserFindOne.mockResolvedValueOnce(null);
      mockUserCreate.mockResolvedValueOnce({
        _id: "507f1f77bcf86cd799439011",
        email: "applicant@example.com",
        username: "applicant@example.com",
        fullName: "Applicant Name",
        role: "applicant",
        save: jest.fn().mockResolvedValue(true),
      });

      const res = await request(app).post("/api/users/register").send({
        email: "applicant@example.com",
        password: "password123",
        fullName: "Applicant Name",
        role: "applicant",
      });

      expect(res.status).toBe(201);
      expect(mockUserCreate).toHaveBeenCalled();
    });

    it("allows login with a username without email verification", async () => {
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        username: "demo-applicant",
        active: true,
        role: "applicant",
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      mockUserFindOne.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app).post("/api/sessions/applicant").send({
        email: "demo-applicant",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.user.username).toBe("demo-applicant");
    });
  });

  describe("Authentication / Login (POST /api/sessions/applicant)", () => {
    it("should return 400 when missing credentials", async () => {
      const res = await request(app).post("/api/sessions/applicant").send({
        email: "",
        password: "",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors ? res.body.errors[0].message : res.body.message).toMatch(/required|email|password/i);
    });

    it("should return 401 for invalid credentials", async () => {
      mockUserFindOne.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).post("/api/sessions/applicant").send({
        email: "unknown@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid Credentials");
    });

    it("creates the requested demo account on first login", async () => {
      process.env.ENABLE_DEMO_LOGINS = "true";
      process.env.DEMO_APPLICANT_PASSWORD = "test-demo-password-12";
      const demoUser = {
        _id: "507f1f77bcf86cd799439012",
        username: "demo-applicant",
        role: "applicant",
        active: true,
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      mockUserFindOne
        .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({ select: jest.fn().mockResolvedValue(demoUser) });
      mockUserCreate.mockResolvedValueOnce({});

      const res = await request(app).post("/api/sessions/demo/applicant");

      expect(res.status).toBe(201);
      expect(mockUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "demo-applicant",
          role: "applicant",
          password: "test-demo-password-12",
        }),
      );
      expect(res.body.user.username).toBe("demo-applicant");
      delete process.env.ENABLE_DEMO_LOGINS;
      delete process.env.DEMO_APPLICANT_PASSWORD;
    });

  });

  describe("Applicant Application Management", () => {
    it("should allow applicant to lookup existing certificate for renewal", async () => {
      const mockApp = {
        _id: "app123",
        referenceNumber: "1/2018",
        status: "certificate_generated",
        applicant: { _id: "507f1f77bcf86cd799439011", equals: () => true },
        applicantInfo: { fullName: "Abebe Bikila" },
        serviceType: { name: "General Construction" },
        certificate: { latestYear: 2018, history: new Map() },
      };

      mockAppFindOne.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue(mockApp),
      });

      const res = await request(app).get("/api/applications/renewal-lookup?ref=1/2018");

      expect(res.status).toBe(200);
      expect(res.body.referenceNumber).toBe("1/2018");
      expect(res.body.holderName).toBe("Abebe Bikila");
    });

    it("should return 404 for renewal lookup if reference number does not exist", async () => {
      mockAppFindOne.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get("/api/applications/renewal-lookup?ref=NONEXISTENT");

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("No issued certificate found");
    });
  });
});
