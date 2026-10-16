import mongoose from "mongoose";

const serviceTypeSchema = new mongoose.Schema(
  {

    stId: { type: String, unique: true },
    code: { type: String, required: true },
    tier: { type: String, default: null },
    name: { type: String, required: true },
    nameAm: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("ServiceType", serviceTypeSchema);
