import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().optional(),
    role: z.enum(["applicant", "staff", "admin"]).optional(),
    accessCode: z.string().optional(),
    username: z.string().optional(), // In the controller, username often gets assigned email's value if not provided
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().min(1, "Email or username is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    accessCode: z.string().optional(), // Required for staff/admin, not for applicant
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    active: z.boolean().optional(),
    fullName: z.string().optional(),
    role: z.enum(["applicant", "staff", "admin"]).optional(),
  }),
});
