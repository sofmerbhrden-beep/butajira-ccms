import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import ServiceType from "../models/ServiceType.js";

import { SERVICE_TYPES } from "../../frontend/src/data/serviceTypes.js";

const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

await connectDB();

const existingAdmin = await User.findOne({ role: "admin" });
if (existingAdmin) {
  console.log(`Admin already exists (${existingAdmin.username}) skipping.`);
} else {
  await User.create({
    username: ADMIN_USERNAME,
    fullName: "System Administrator",
    password: ADMIN_PASSWORD,
    role: "admin",
    emailVerified: true,
    mustChangePassword: true,
  });
  console.log(`Created admin "${ADMIN_USERNAME}" with password "${ADMIN_PASSWORD}"`);
  console.log("Log in and change this password immediately.");
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

await mongoose.disconnect();
console.log("Done.");
