import { z } from "zod";

export const addAdminSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
});

export const authenticateAdminSchema = z.object({
  email: z.string().email(),
  password: z.string(), // Or whatever your min password length is
  stayLoggedIn: z.boolean().optional(),
});

// Assuming AdminStatus is an enum like: enum AdminStatus { pending, approved, rejected, banned }
export const getAdminsSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "banned"]).optional(),
});

export const removeAdminSchema = z.object({
  id: z.string().length(24), // Assuming MongoDB ObjectId
});

export const updateAdminSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "banned"]).optional(),
  roles: z.array(z.enum(["viewer", "sales", "hr", "super"])).optional(),
});
export const emailSchema = z.object({
  email: z.string().email("Invalid email address").max(254, "Email too long"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address").max(254, "Email too long"),
  password: z.string().min(6),
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
});
