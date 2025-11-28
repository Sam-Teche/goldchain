import {z} from "zod";
import {accountTypeListingFiles} from "../../../domain/listing/listing";

// --- IBaseInformation & Extensions ---

export const baseInformationSchema = z.object({
    dateOfMining: z.preprocess(arg => (typeof arg === "string" || arg instanceof Date) ? new Date(arg) : arg, z.date()),
    lotWeight: z.string().min(1, "Lot weight is required"),
    purity: z.string().min(1, "Purity is required"),
    testingMode: z.string().min(1, "Testing mode is required"),
    lotNumber: z.string().min(1, "Lot number is required"),
    price: z.string().min(1, "Price is required"),
    pricePerGram: z.string().min(1, "Price per gram is required"),
});

export const sourceInformationSchema = baseInformationSchema.extend({
    sourceMineSite: z.string().min(1, "Source mine site is required"),
});

export const exporterInformationSchema = baseInformationSchema.extend({
    sourceMineSite: z.string().min(1, "Source mine site is required"),
});

export const importerInformationSchema = baseInformationSchema.extend({
    sourceCountry: z.string().min(1, "Source country is required"),
});

// --- IQuestions & Extensions ---

export const sourceQuestionsSchema = z.object({
    extractedFromYourMine: z.boolean(),
    underageOrForcedLaborInvolved: z.boolean(),
    hazardousSubstancesUsed: z.boolean(),
    transferOfTitleSubmitted: z.boolean(),
});

export const exporterQuestionsSchema = z.object({
    federalTaxPaid: z.boolean(),
    customsClearanceReceived: z.boolean(),
});

export const importerQuestionsSchema = z.object({
    importTariffsPaid: z.boolean(),
});

// --- Documents ---
export const sourceDocumentsSchema = z.object({
    goldLotUrl: z.string().url(),
    purityVerificationUrl: z.string().url(),
    weightVerificationUrl: z.string().url(),
    certificateOfOriginUrl: z.string().url(),
});
export const exporterDocumentsSchema = sourceDocumentsSchema.and(
    z.object(
        {
            icglrCertificateUrl: z.string().url(),
            taxReceiptUrl: z.string().url(),
        }
    )
);
export const importerDocumentsSchema = exporterDocumentsSchema.and(
    z.object(
        {
            customsClearanceUrl: z.string().url(),
            declarationStatementUrl: z.string().url(),
        }
    )
);

// --- Delivery / Pickup ---

export const deliverySchema = z.object({
    provider: z.string().min(1, "Provider is required"),
    weight: z.string().min(1, "Weight is required"),
    length: z.string().min(1, "Length is required"),
    width: z.string().min(1, "Width is required"),
    height: z.string().min(1, "Height is required"),
});

export const pickupSchema = z.object({
    addressOne: z.string().min(1, "Address is required"),
    addressTwo: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
});

// --- Listing ---
export const baseListingSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("source"),
        information: sourceInformationSchema,
        questions: sourceQuestionsSchema,
        signatureUrl: z.string().url(),
        documents: sourceDocumentsSchema
    }),
    z.object({
        type: z.literal("exporter"),
        information: exporterInformationSchema,
        questions: exporterQuestionsSchema,
        signatureUrl: z.string().url(),
        documents: exporterDocumentsSchema
    }),
    z.object({
        type: z.literal("importer"),
        information: importerInformationSchema,
        questions: importerQuestionsSchema,
        signatureUrl: z.string().url(),
        documents: importerDocumentsSchema
    }),
])

export const listingSchema = baseListingSchema.and(
    z.discriminatedUnion("deliveryMethod", [
        z.object({
            deliveryMethod: z.literal("pickup"),
            deliveryInformation: pickupSchema,
        }),
        z.object({
            deliveryMethod: z.literal("delivery"),
            deliveryInformation: deliverySchema,
        })
    ])
);

export const listingFilterSchema = z.object({
    deliveryMethod: z.enum(["delivery", "pickup"]).optional(),
    seller: z.string().optional(),

    startDate: z.string().transform(Date).optional(),
    endDate: z.string().transform(Date).optional(),

    searchTerm: z.string().optional(),

    minRating: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxRating: z.string().regex(/^\d+$/).transform(Number).optional(),

    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export function validateFiles(
    accountType: "source" | "exporter" | "importer",
    files: Record<string, Express.Multer.File[]>
): { valid: boolean; missing: string[] } {
    const required = accountTypeListingFiles[accountType];
    const missing = required.filter((field) => !files[field] || files[field].length === 0);
    return {valid: missing.length === 0, missing};
}

export const listingIdSchema = z.object({
    listingId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
        message: "invalid listing",
    })
});


export const createReviewSchema = z.object({
    rating: z.number()
        .int({message: "Rating must be an integer"})
        .min(1, {message: "Rating must be at least 1"})
        .max(5, {message: "Rating must be at most 5"}),
    comment: z.string()
        .trim()
        .min(1, {message: "Comment cannot be empty"})
})
export const reviewFilterSchema = z.object({
    startDate: z.string().transform(Date).optional(),
    endDate: z.string().transform(Date).optional(),

    minRating: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxRating: z.string().regex(/^\d+$/).transform(Number).optional(),

    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export const reportSchema = z.object({
    listingId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
        message: "invalid listing",
    }),
    reason: z.string({message: "is required"}),
    description: z.string().optional(),
});

