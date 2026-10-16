import { z } from "zod";

export const createServiceTypeSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Code is required"),
    tier: z.string().optional().nullable(),
    name: z.string().min(1, "Name is required"),
    nameAm: z.string().optional(),
    active: z.boolean().optional(),
  }),
});

export const updateServiceTypeSchema = z.object({
  body: z.object({
    code: z.string().optional(),
    tier: z.string().optional().nullable(),
    name: z.string().optional(),
    nameAm: z.string().optional(),
    active: z.boolean().optional(),
  }),
});
