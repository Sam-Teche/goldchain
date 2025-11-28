import {z} from "zod";

export const sendMessageSchema = z.object({
    content: z.string().optional(),
    accountModel: z.enum(["Account", "Admin"])
});

export const toSchema = z.object({
    to: z.string().regex(/^[a-fA-F0-9]{24}$/, {
        message: "invalid listing id",
    }),
});

export const ConversationPaginationSchema = z.object({
    limit: z
        .string()
        .optional()
        .transform((val) => val === undefined ? 20 : parseInt(val, 10))
        .refine((val) => Number.isInteger(val) && val >= 1 && val <= 100, {
            message: "limit must be an integer between 1 and 100",
        }),

    page: z
        .string()
        .optional()
        .transform((val) => val === undefined ? 1 : parseInt(val, 10))
        .refine((val) => Number.isInteger(val) && val >= 1 && val <= 100, {
            message: "limit must be an integer between 1 and 100",
        }),

    conversationId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
        message: "invalid listing id",
    }).optional(),
});

export const MessagePaginationSchema = z.object({
    limit: z
        .string()
        .optional()
        .transform((val) => val === undefined ? 20 : parseInt(val, 10))
        .refine((val) => Number.isInteger(val) && val >= 1 && val <= 100, {
            message: "limit must be an integer between 1 and 100",
        }),

    page: z
        .string()
        .optional()
        .transform((val) => val === undefined ? 1 : parseInt(val, 10))
        .refine((val) => Number.isInteger(val) && val >= 1 && val <= 100, {
            message: "limit must be an integer between 1 and 100",
        }),

    messageId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
        message: "invalid listing id",
    }).optional(),
});
