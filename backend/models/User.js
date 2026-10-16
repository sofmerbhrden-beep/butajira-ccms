import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: { type: String, trim: true, default: "" },
    password: { type: String, minlength: 8, select: false },
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    resetToken: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    role: {
      type: String,
      enum: ["applicant", "staff", "admin"],
      default: "applicant",
    },
    active: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    verifyCode: { type: String, select: false },
    verifyCodeExpires: { type: Date, select: false },
    verifyCodeSentAt: { type: Date, select: false },
    mustChangePassword: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (entered) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
