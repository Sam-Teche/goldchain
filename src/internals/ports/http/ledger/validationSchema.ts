import {z} from "zod";

export const ledgerFilterSchema = z.object({
    status: z.string().optional(),
    trackingId: z.string().optional(),
    hash: z.string().optional(),
    reference: z.string().optional(),

    startDate: z.string().transform(Date).optional(),
    endDate: z.string().transform(Date).optional(),

    searchTerm: z.string().optional(),

    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
});
