import {z} from "zod";

export const listingIdSchema = z.object({
    listingId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
        message: "invalid listing id",
    })
});

export const requestIdSchema = z.object({
    requestId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
        message: "invalid request id",
    })
});

export const updateStatusSchema = z.object({
    status: z.enum(["accepted", "rejected", "cancelled"]),
});

export const requestFilterSchema = z.object({
    status: z.enum(["accepted", "rejected", "cancelled", "pending", "expired"]).optional(),
    sortOrder: z.enum(["ascending", "descending"]).optional(),
    sortBy: z.enum(["amount", "updatedAt"]).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
});
