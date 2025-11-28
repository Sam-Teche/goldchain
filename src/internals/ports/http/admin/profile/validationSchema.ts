import {z} from "zod";

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(6), // Adjust as needed
    newPassword: z.string().min(8), // Use your actual password rules
});
