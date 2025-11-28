import {z} from "zod";
import {profileTypeRequiredFiles} from "../../../domain/account/account";

const baseProfileSchema = z.object({
    country: z.string().min(1, "Country is required"),
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string()
        .min(7, "Phone must be at least 7 digits")
        .max(20, "Phone must be no more than 20 digits")
        .regex(/^\+?\d{7,20}$/, "Invalid phone number format"),
    companyName: z.string().min(1, "Company name is required"),
    addressOne: z.string().min(1, "Address is required"),
    addressTwo: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
});


const sourceProfileSchema = baseProfileSchema.extend({
    businessType: z.string().min(1, "business type is required"),
    propertyName: z.string().min(1, "Property name is required"),
    propertyOwner: z.string().min(1, "Property owner is required"),
    mineOperator: z.string().min(1, "Mine operator is required"),
    miningLicenseNumber: z.string().min(1, "License number is required"),
    licenseType: z.string().min(1, "License type is required"),
    mineSiteCode: z.string().min(1, "Mine site code is required"),
    mineSiteStatus: z.string().min(1, "Mine site status is required"),
    buyerCard: z.string().min(1, "Buyer card is required"),
})
const sourceQuestionSchema = z.object({
    isSourcePropertyConflictFree: z.boolean(),
    areWorkersVoluntaryLegalAgeFairWages: z.boolean(),
    areWorkersSafeWorkConditionsEquipment: z.boolean(),
    areEnvironmentalInitiativesInPlace: z.boolean(),
    isMineCompliantWithLaws: z.boolean(),
});

const exporterProfileSchema = baseProfileSchema.extend({
    businessType: z.string().min(1, "business type is required"),
    registrationNumber: z.string().min(4, "Registration number is required"),
    exportLicenseNumber: z.string().min(4, "Export license number is required"),
    buyerCard: z.string().min(1, "Buyer card is required"),
})
const exporterQuestionSchema = z.object({
    hasInternalConflictRiskPolicies: z.boolean(),
    isFreeOfInternationalSanctions: z.boolean(),
    compliesWithNationalExportTaxLaws: z.boolean(),
    shipmentsAccompaniedByOfficialPermits: z.boolean(),
    maintainsTransactionRecordsFiveYears: z.boolean(),
});

const importerProfileSchema = baseProfileSchema.extend({
    businessType: z.string().min(1, "business type is required"),
    registrationNumber: z.string().min(4, "Registration number is required"),
    importLicenseNumber: z.string().min(4, "Import license number is required"),
})
const importerQuestionSchema = z.object({
    hasInternalConflictRiskPolicies: z.boolean(),
    isFreeOfInternationalSanctions: z.boolean(),
    compliesWithNationalImportDutyLaws: z.boolean(),
    shipmentsAccompaniedByCommercialInvoices: z.boolean(),
    maintainsTransactionRecordsFiveYears: z.boolean(),
});

const offtakerProfileSchema = baseProfileSchema.extend({
    businessType: z.string().min(1, "business type is required"),
    registrationNumber: z.string().min(4, "Registration number is required"),
    businessLicenseNumber: z.string().min(4, "Refinery license number is required"),
})
const offtakerQuestionSchema = z.object({
    hasInternalConflictRiskPolicies: z.boolean(),
    isFreeOfInternationalSanctions: z.boolean(),
    purchasesAccompaniedByCommercialInvoices: z.boolean(),
    maintainsTransactionRecordsFiveYears: z.boolean(),
});

export const profileSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("source"),
        profile: sourceProfileSchema,
    }),
    z.object({
        type: z.literal("exporter"),
        profile: exporterProfileSchema,
    }),
    z.object({
        type: z.literal("importer"),
        profile: importerProfileSchema,
    }),
    z.object({
        type: z.literal("offtaker"),
        profile: offtakerProfileSchema,
    }),
]);

export const questionsSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("source"),
        questions: sourceQuestionSchema,
    }),
    z.object({
        type: z.literal("exporter"),
        questions: exporterQuestionSchema,
    }),
    z.object({
        type: z.literal("importer"),
        questions: importerQuestionSchema,
    }),
    z.object({
        type: z.literal("offtaker"),
        questions: offtakerQuestionSchema,
    }),
]);


export function validateProfileFiles(
    accountType: "source" | "exporter" | "importer" | "offtaker",
    files: Record<string, Express.Multer.File[]>
): { valid: boolean; missing: string[] } {
    const required = profileTypeRequiredFiles[accountType];
    const missing = required.filter((field) => !files[field] || files[field].length === 0);
    return {valid: missing.length === 0, missing};
}


const airtmCashPickupSchema = z.object({
    type: z.literal("airtm"),
    email: z.string().email("Invalid Airtm email"),
});

const bankTransferSchema = z.object({
    type: z.literal("bank-transfer"),
    accountHolder: z.string().min(1, "Account holder name required"),
    bankName: z.string().min(1, "Bank name required"),
    accountNumber: z.string()
        .min(1, "Account number must be at least 6 digits")
        .max(34, "Account number must be no more than 34 digits"),
    swiftCode: z.string()
        .min(1, "SWIFT code must be at least 8 characters")
        .max(11, "SWIFT code must be no more than 11 characters"),
    currency: z.string().min(1, "Currency required"),
    country: z.string().min(1, "Country required"),
});

const bitcoinBTCSchema = z.object({
    type: z.literal("bitcoin"),
    address: z.string()

});

const mpesaSchema = z.object({
    type: z.literal("mpesa"),
    countryCode: z.string(),
    mobileNumber: z.string().min(1, "Mobile number required"),
    country: z.string().min(1, "Country required"),
});

const mtnMoMoSchema = z.object({
    type: z.literal("momo"),
    countryCode: z.string(),
    mobileNumber: z.string().min(1, "Mobile number required"),
    country: z.string().min(1, "Country required"),
});

const tetherUSDTSchema = z.object({
    type: z.literal("tether"),
    address: z.string().min(1, "Address required"), // Add regex for actual address if needed
    network: z.enum(["ERC20", "TRC20", "BEP20", "SOL", "OMNI", "Polygon"]).or(z.string().min(3, "Network required")),
});

const worldRemitCashPickupSchema = z.object({
    type: z.literal("world-remit"),
    fullName: z.string().min(1, "Full name required"),
    countryCode: z.string(),
    mobileNumber: z.string().min(1, "Mobile number required"),
    country: z.string().min(1, "Country required"),
    pickupCity: z.string().min(1, "Pickup city required"),
});

const paymentDetailsSchema = z.discriminatedUnion("type", [
    airtmCashPickupSchema,
    bankTransferSchema,
    bitcoinBTCSchema,
    mpesaSchema,
    mtnMoMoSchema,
    tetherUSDTSchema,
    worldRemitCashPickupSchema,
]);

export const paymentMethodsSchema = z.object({
    paymentMethods: z.array(paymentDetailsSchema).min(1, "At least one payment method required"),
});

export const documentsSchema = z.object({
    type: z.enum(["source", "exporter", "importer", "offtaker"]),
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z
        .string()
        .min(6),
});

export const descriptionSchema = z.object({
    description: z.string().min(1),
});
