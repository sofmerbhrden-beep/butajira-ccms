import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: String,
    path: String,
    mimeType: String,
    size: Number,
  },
  { _id: false },
);

const decisionSchema = new mongoose.Schema(
  {
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    byName: String,
    decision: { type: String, enum: ["approved", "rejected"] },
    reason: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const applicationSchema = new mongoose.Schema(
  {

    appId: { type: String, unique: true },

    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applicantInfo: {
      fullName: { type: String, required: true },
      gender: { type: String, enum: ["male", "female"], required: true },
      dob: String,
      phone: { type: String, required: true },
      address: {
        region: { type: String, required: true },
        woreda: { type: String, required: true },
        kebele: { type: String, required: true },
        houseNo: String,
        poBox: String,
        fax: String,
        email: String,
        licenseOwnerAddress: String,
      },
    },


    applicationType: {
      type: String,
      enum: ["new", "renewal"],
      default: "new",
    },


    renewalOf: { type: String, default: null },


    tinVerified: { type: Boolean, default: false },

    hasTradeLicense: { type: Boolean, default: false },
    tin: { type: String, default: null },
    businessName: { type: String, default: null },

    serviceType: {
      id: String,
      code: String,
      tier: String,
      name: String,
      nameAm: String,
    },

    documents: {
      photo: documentSchema,
      education: documentSchema,
      competency: documentSchema,
      tradeLicense: documentSchema,
      others: { type: [documentSchema], default: [] },
    },

    status: {
      type: String,
      enum: [
        "staff_review",
        "staff_rejected",
        "admin_review",
        "admin_rejected",
        "admin_approved",
        "certificate_generated",
        "withdrawn",
        "expired",
      ],
      default: "staff_review",
    },

    staffDecision: { type: decisionSchema, default: null },
    adminDecision: { type: decisionSchema, default: null },

    certificate: {
      type: new mongoose.Schema(
        {

          referenceNumber: String,

          history: { type: Map, of: new mongoose.Schema({
            issuedAt: Date,
            adminName: String,
            pdfPath: { type: String, default: null },
          }, { _id: false }), default: {} },

          latestYear: { type: Number, default: null },
          issuedAt: Date,
          adminName: String,
          pdfPath: { type: String, default: null },
        },
        { _id: false },
      ),
      default: null,
    },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ "certificate.referenceNumber": 1 }, { sparse: true });

export default mongoose.model("Application", applicationSchema);
