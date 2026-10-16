import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "org" },
    orgNameEn: { type: String, default: "Ministry of Communication & Information Technology" },
    orgNameAm: { type: String, default: "የመገናኛና ኢንፎርሜሽን ቴክኖሎጅ ሚኒስቴር" },
    address: { type: String, default: "Addis Ababa, Ethiopia" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
  },
  { _id: false },
);

export default mongoose.model("Settings", settingsSchema);
