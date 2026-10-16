import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import ServiceType from "../models/ServiceType.js";

import { SERVICE_TYPES } from "../../frontend/src/data/serviceTypes.js";

const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME?.trim().toLowerCase() || "admin";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const MIN_SEED_PASSWORD_LENGTH = 12;

await connectDB();

try {
  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log(`Admin already exists (${existingAdmin.username}) skipping.`);
  } else {
    if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < MIN_SEED_PASSWORD_LENGTH) {
      throw new Error(
        `Set SEED_ADMIN_PASSWORD to a value of at least ${MIN_SEED_PASSWORD_LENGTH} characters.`,
      );
    }
    await User.create({
      username: ADMIN_USERNAME,
      fullName: "System Administrator",
      password: ADMIN_PASSWORD,
      role: "admin",
      mustChangePassword: true,
    });
    console.log(`Created admin "${ADMIN_USERNAME}".`);
  }

  for (const s of SERVICE_TYPES) {
    await ServiceType.updateOne(
      { stId: s.id },
      {
        $setOnInsert: {
          stId: s.id,
          code: s.code,
          tier: s.tier ?? null,
          name: s.name,
          nameAm: s.nameAm ?? "",
          active: true,
        },
      },
      { upsert: true },
    );
  }
  console.log(`Service types synced (${SERVICE_TYPES.length}).`);
} finally {
  await mongoose.disconnect();
}

console.log("Done.");
