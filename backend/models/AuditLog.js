import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorName: String,
    actorRole: String,
    targetResource: {
      type: String,
      required: true,
    },
    targetId: {
      type: String, // E.g., application ID or User ID
    },
    details: {
      type: Object, // Stores any JSON payload, old/new states, etc.
      default: {},
    },
    ipAddress: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
