import {z} from "zod";
import {passwordRegex} from "../../../../package/utils/zod";

export const signupSchema = z.object({
    email: z.string().email("Invalid email address").max(254, "Email too long"),
    password: z
        .string()
        .min(6),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
        .string(),
    stayLoggedIn: z
        .boolean().optional(),
});

export const verifyEmailSchema = z.object({
    email: z.string().email("Invalid email address").max(254, "Email too long"),
    otp: z.string().length(6).regex(/^\d{6}$/),
});

export const emailSchema = z.object({
    email: z.string().email("Invalid email address").max(254, "Email too long"),
});

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address").max(254, "Email too long"),
    password: z
        .string()
        .min(6),
    otp: z.string().length(6).regex(/^\d{6}$/),
});
