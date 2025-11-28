import {z} from "zod";

export const listingIdSchema = z.object({
    listingId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
        message: "invalid listing id",
    })
});

export const createOfferSchema = z.object({
    amount: z.number().gt(0),
    listingId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
        message: "invalid listing id",
    })
});

export const offerIdSchema = z.object({
    offerId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
        message: "invalid offer id",
    })
});

export const updateStatusSchema = z.object({
    status: z.enum(["accepted", "rejected", "cancelled", "countered"]),
    amount: z.number().gt(0).optional(),
}).superRefine((data, ctx) => {
    if (data.status === "countered") {
        if (typeof data.amount !== "number" || data.amount <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["amount"],
                message: "required and must be greater than 0 when status is 'countered'.",
            });
        }
    } else if (data.amount !== undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["amount"],
            message: "only provided if status is 'countered'.",
        });
    }
});

export const offerFilterSchema = z.object({
    status: z.enum(["accepted", "rejected", "cancelled", "pending", "expired"]).optional(),
    sortOrder: z.enum(["ascending", "descending"]).optional(),
    sortBy: z.enum(["amount", "updatedAt"]).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
});
