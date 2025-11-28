import {z} from "zod";

export const reviewFilterSchema = z.object({
    startDate: z.string().transform(Date).optional(),
    endDate: z.string().transform(Date).optional(),

    minRating: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxRating: z.string().regex(/^\d+$/).transform(Number).optional(),

    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
});
