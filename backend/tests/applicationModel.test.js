import mongoose from "mongoose";
import Application from "../models/Application.js";
import User from "../models/User.js";
import { jest } from "@jest/globals";
import { connectDb, closeDb, clearDb } from "./dbSetup.js";

jest.setTimeout(60000);

beforeAll(async () => {
  await connectDb();
});

afterEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await closeDb();
});

describe("Application Model DB Tests", () => {
  let user;

  beforeEach(async () => {
    user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      role: "applicant"
    });
  });

  it("should create an application successfully", async () => {
    const appData = {
      appId: "APP-001",
      applicant: user._id,
      applicationType: "new",
      applicantInfo: {
        fullName: "John Doe",
        gender: "male",
        phone: "+251911123456",
        address: {
          region: "Addis Ababa",
          woreda: "01",
          kebele: "02"
        }
      }
    };

    const app = await Application.create(appData);
    expect(app._id).toBeDefined();
    expect(app.appId).toBe("APP-001");
    expect(app.applicant.toString()).toBe(user._id.toString());
    expect(app.status).toBe("staff_review"); // Default status
  });

  it("should fail validation if required fields are missing", async () => {
    // Missing applicant and applicantInfo
    const appData = { appId: "APP-002" };
    
    let error = null;
    try {
      await Application.create(appData);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe("ValidationError");
    expect(error.errors.applicant).toBeDefined();
    expect(error.errors["applicantInfo.fullName"]).toBeDefined();
  });

  it("should enforce unique appId", async () => {
    const appData = {
      appId: "APP-003",
      applicant: user._id,
      applicantInfo: {
        fullName: "Jane Doe",
        gender: "female",
        phone: "+251911123456",
        address: { region: "R", woreda: "W", kebele: "K" }
      }
    };

    await Application.create(appData);

    let error = null;
    try {
      // Trying to create another application with the same appId
      await Application.create(appData);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });
});
