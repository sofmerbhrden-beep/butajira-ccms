import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    applicantInfo: z.object({
      fullName: z.string().min(1, "Full name is required"),
      gender: z.enum(["male", "female"]),
      dob: z.string().optional(),
      phone: z.string().min(1, "Phone number is required"),
      address: z.object({
        region: z.string().min(1, "Region is required"),
        woreda: z.string().min(1, "Woreda is required"),
        kebele: z.string().min(1, "Kebele is required"),
        houseNo: z.string().optional(),
        poBox: z.string().optional(),
        fax: z.string().optional(),
        email: z.string().email("Invalid email").optional().or(z.literal("")),
      }),
    }).optional(),
    applicationType: z.enum(["new", "renewal"]).optional(),
    renewalOf: z.string().optional().nullable(),
    hasTradeLicense: z.boolean().optional(),
    tin: z.string().optional().nullable(),
    businessName: z.string().optional().nullable(),
    serviceType: z.string().optional().or(z.object({
      id: z.string().min(1, "Service type ID is required"),
      code: z.string().optional(),
      tier: z.string().optional().nullable(),
      name: z.string().min(1, "Service type name is required"),
      nameAm: z.string().optional(),
    })),
  }),
});

export const reviewApplicationSchema = z.object({
  body: z.object({
    decision: z.enum(["approved", "rejected"]),
    reason: z.string().optional(),
  }),
});
