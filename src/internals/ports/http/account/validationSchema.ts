import {z} from "zod";

// Example enums (customize as needed)
const statusEnum = z.enum(["pending", "approved", "rejected", "banned"]);
const typeEnum = z.enum(["source", "exporter", "importer", "offtaker"]);

// Main schema
export const AccountFilterSchema = z.object({
    email: z.string().email().optional(),

    status: z.union([
        statusEnum,
        statusEnum.array()
    ]).optional(),

    type: z.union([
        typeEnum,
        typeEnum.array()
    ]).optional(),

    emailVerified: z.boolean().optional(),

    startDate: z.string().transform(Date).optional(),
    endDate: z.string().transform(Date).optional(),

    searchTerm: z.string().optional(),

    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export const NoteSchema = z.object({
    note: z.string().min(1),
});
export const MongoIdSchema = z.object({
    accountId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
        message: "invalid account",
    })
});

export const NoteFilterSchema = z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
});


export const AccountStatusSchema = z.object({
    status: statusEnum
})


// Base profile fields
const baseProfileSchema = z.object({
    country: z.string().min(1).optional(),
    fullName: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    companyName: z.string().min(1).optional(),
    addressOne: z.string().min(1).optional(),
    addressTwo: z.string().optional(),
    city: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    postalCode: z.string().min(1).optional(),
});

// Extended profile with type-specific fields
const profileSchema = baseProfileSchema.extend({
    businessType: z.string().optional(),
    // Source-specific
    propertyName: z.string().optional(),
    propertyOwner: z.string().optional(),
    mineOperator: z.string().optional(),
    miningLicenseNumber: z.string().optional(),
    licenseType: z.string().optional(),
    mineSiteCode: z.string().optional(),
    mineSiteStatus: z.string().optional(),
    buyerCard: z.string().optional(),
    mineTitleUrl: z.string().url().optional(),
    miningLicenseUrl: z.string().url().optional(),
    buyerCardUrl: z.string().url().optional(),
    // Exporter/Importer/Offtaker common
    registrationNumber: z.string().optional(),
    // Exporter-specific
    exportLicenseNumber: z.string().optional(),
    exportLicenseUrl: z.string().url().optional(),
    // Importer-specific
    importLicenseNumber: z.string().optional(),
    importLicenseUrl: z.string().url().optional(),
    // Offtaker-specific
    refineryLicenseNumber: z.string().optional(),
    refineryLicenseUrl: z.string().url().optional(),
}).partial();

// Documents schema
const documentsSchema = z.object({
    identificationUrl: z.string().url().optional(),
    companyRegistrationUrl: z.string().url().optional(),
    mineTitleUrl: z.string().url().optional(),
    miningLicenseUrl: z.string().url().optional(),
    buyerCardUrl: z.string().url().optional(),
    exportLicenseUrl: z.string().url().optional(),
    importLicenseUrl: z.string().url().optional(),
    refineryLicenseUrl: z.string().url().optional(),
}).partial();

// Questions schema
const questionsSchema = z.object({
    // Source questions
    isSourcePropertyConflictFree: z.boolean().optional(),
    areWorkersVoluntaryLegalAgeFairWages: z.boolean().optional(),
    areWorkersSafeWorkConditionsEquipment: z.boolean().optional(),
    areEnvironmentalInitiativesInPlace: z.boolean().optional(),
    isMineCompliantWithLaws: z.boolean().optional(),
    // Common questions
    hasInternalConflictRiskPolicies: z.boolean().optional(),
    isFreeOfInternationalSanctions: z.boolean().optional(),
    maintainsTransactionRecordsFiveYears: z.boolean().optional(),
    // Exporter questions
    compliesWithNationalExportTaxLaws: z.boolean().optional(),
    shipmentsAccompaniedByOfficialPermits: z.boolean().optional(),
    // Importer questions
    compliesWithNationalImportDutyLaws: z.boolean().optional(),
    shipmentsAccompaniedByCommercialInvoices: z.boolean().optional(),
    // Offtaker questions
    purchasesAccompaniedByCommercialInvoices: z.boolean().optional(),
}).partial();

// Payment methods schemas
const paymentMethodSchemas = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("airtm"),
        email: z.string().email(),
    }),
    z.object({
        type: z.literal("bank-transfer"),
        accountHolder: z.string().min(1),
        bankName: z.string().min(1),
        accountNumber: z.string().min(1),
        swiftCode: z.string().min(1),
        currency: z.string().min(1),
        country: z.string().min(1),
    }),
    z.object({
        type: z.literal("bitcoin"),
        address: z.string().min(1),
    }),
    z.object({
        type: z.literal("mpesa"),
        countryCode: z.string().min(1),
        mobileNumber: z.string().min(1),
        country: z.string().min(1),
    }),
    z.object({
        type: z.literal("momo"),
        countryCode: z.string().min(1),
        mobileNumber: z.string().min(1),
        country: z.string().min(1),
    }),
    z.object({
        type: z.literal("tether"),
        address: z.string().min(1),
        network: z.string().min(1),
    }),
    z.object({
        type: z.literal("world-remit"),
        fullName: z.string().min(1),
        countryCode: z.string().min(1),
        mobileNumber: z.string().min(1),
        country: z.string().min(1),
        pickupCity: z.string().min(1),
    }),
]);

// Main update schema
export const UpdateAccountDetailsSchema = z.object({
    profile: profileSchema.optional(),
    documents: documentsSchema.optional(),
    questions: questionsSchema.optional(),
    paymentMethods: z.array(paymentMethodSchemas).optional(),
    description: z.string().optional(),
    profilePicture: z.string().url().optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" }
);