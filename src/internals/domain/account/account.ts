import Filter from "../../../package/types/filter";
import ID from "../../../package/types/ID";

export interface IBaseProfile {
    country: string;
    fullName: string;
    phone: string;
    companyName: string;
    addressOne: string;
    addressTwo?: string;
    city: string;
    state: string;
    postalCode: string;
}

export interface ISourceProfile extends IBaseProfile {
    businessType: string;
    propertyName: string;
    propertyOwner: string;
    mineOperator: string;
    miningLicenseNumber: string;
    licenseType: string;
    mineSiteCode: string;
    mineSiteStatus: string;
    buyerCard: string;
    mineTitleUrl: string;
    miningLicenseUrl: string;
    buyerCardUrl: string;
}

export interface IExporterProfile extends IBaseProfile {
    businessType: "dealer" | "licensed exporter" | "refinery exporter";
    registrationNumber: string;
    exportLicenseNumber: string;
    buyerCard: string;
    exportLicenseUrl: string;
    buyerCardUrl: string;
}

export interface IImporterProfile extends IBaseProfile {
    businessType: "bullion trader" | "licensed importer";
    registrationNumber: string;
    importLicenseNumber: string;
    importLicenseUrl: string;
}

export interface IOfftakerProfile extends IBaseProfile {
    businessType: "jeweler" | "manufacturer" | "refinery";
    registrationNumber: string;
    refineryLicenseNumber: string;
    refineryLicenseUrl: string;
}

export type IProfile =
    | ISourceProfile
    | IExporterProfile
    | IImporterProfile
    | IOfftakerProfile;


// Documents
export interface IBaseDocuments {
    identificationUrl: string;
    companyRegistrationUrl: string;
}

export interface ISourceDocuments extends IBaseDocuments {
    mineTitleUrl: string;
    miningLicenseUrl: string;
    buyerCardUrl: string;
}

export interface IExporterDocuments extends IBaseDocuments {
    exportLicenseUrl: string;
    buyerCardUrl: string;
}

export interface IImporterDocuments extends IBaseDocuments {
    importLicenseUrl: string;
}

export interface IOfftakerDocuments extends IBaseDocuments {
    refineryLicenseUrl: string;
}

export type IDocuments =
    | ISourceDocuments
    | IExporterDocuments
    | IImporterDocuments
    | IOfftakerDocuments;


// Payment Methods
export interface IAirtmCashPickup {
    type: "airtm";
    email: string;
}

export interface IBankTransfer {
    type: "bank-transfer";
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    swiftCode: string;
    currency: string;
    country: string;
}

export interface IBitcoinBTC {
    type: "bitcoin";
    address: string;
}

export interface IMPesa {
    type: "mpesa";
    countryCode: string;
    mobileNumber: string;
    country: string;
}

export interface IMTNMoMo {
    type: "momo";
    countryCode: string;
    mobileNumber: string;
    country: string;
}

export interface ITetherUSDT {
    type: "tether";
    address: string;
    network: string;
}

export interface IWorldRemitCashPickup {
    type: "world-remit";
    fullName: string;
    countryCode: string;
    mobileNumber: string;
    country: string;
    pickupCity: string;
}

export type IPaymentDetails =
    | IAirtmCashPickup
    | IBankTransfer
    | IBitcoinBTC
    | IMPesa
    | IMTNMoMo
    | ITetherUSDT
    | IWorldRemitCashPickup;


// Questions
export interface ISourceQuestions {
    isSourcePropertyConflictFree: boolean;
    areWorkersVoluntaryLegalAgeFairWages: boolean;
    areWorkersSafeWorkConditionsEquipment: boolean;
    areEnvironmentalInitiativesInPlace: boolean;
    isMineCompliantWithLaws: boolean;
}

export interface IExporterQuestions {
    hasInternalConflictRiskPolicies: boolean;
    isFreeOfInternationalSanctions: boolean;
    compliesWithNationalExportTaxLaws: boolean;
    shipmentsAccompaniedByOfficialPermits: boolean;
    maintainsTransactionRecordsFiveYears: boolean;
}

export interface IImporterQuestions {
    hasInternalConflictRiskPolicies: boolean;
    isFreeOfInternationalSanctions: boolean;
    compliesWithNationalImportDutyLaws: boolean;
    shipmentsAccompaniedByCommercialInvoices: boolean;
    maintainsTransactionRecordsFiveYears: boolean;
}

export interface IOfftakerQuestions {
    hasInternalConflictRiskPolicies: boolean;
    isFreeOfInternationalSanctions: boolean;
    purchasesAccompaniedByCommercialInvoices: boolean;
    maintainsTransactionRecordsFiveYears: boolean;
}

export type IQuestions =
    | ISourceQuestions
    | IExporterQuestions
    | IImporterQuestions
    | IOfftakerQuestions;


// Account
export type  AccountType = "source" | "exporter" | "importer" | "offtaker"
export type  AccountStatus = "pending" | "approved" | "rejected" | "banned"

export interface IAccount {
    email: string;
    password: string;
    status: AccountStatus;
    type: AccountType;
    profile: IProfile;
    documents: IDocuments;
    questions: IQuestions;
    paymentMethods: IPaymentDetails[];
    emailVerified: boolean;
    activated: boolean;
    activationReference: string;
    stayLoggedIn: boolean;
    rating: number;
    reviews: number;
    profilePicture?: string
    description?: string
    activatedAt?: Date;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type Account = IAccount & ID

export type AccountFilter = Filter & {
    email?: string;
    status?: IAccount['status'] | Array<IAccount['status']>;
    type?: IAccount['type'] | Array<IAccount['type']>;
    emailVerified?: boolean;
    activated?: boolean;
    activationReference?: string;
};

export const profileTypeRequiredFiles: Record<
    "source" | "exporter" | "importer" | "offtaker",
    string[]
> = {
    source: [
        "identification",
        "companyRegistration",
        "mineTitle",
        "miningLicense",
        "buyerCard",
    ],
    exporter: [
        "identification",
        "companyRegistration",
        "exportLicense",
        "buyerCard",
    ],
    importer: [
        "identification",
        "companyRegistration",
        "importLicense",
    ],
    offtaker: [
        "identification",
        "companyRegistration",
        "refineryLicense",
    ],
};