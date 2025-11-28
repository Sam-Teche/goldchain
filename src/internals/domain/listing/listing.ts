import Filter from "../../../package/types/filter";
import {Account, AccountType} from "../account/account";
import ID from "../../../package/types/ID";

export interface IBaseInformation {
    dateOfMining: Date
    lotWeight: string
    purity: string
    testingMode: string
    lotNumber: string
    price: string
    pricePerGram: string
}

export interface ISourceInformation extends IBaseInformation {
    sourceMineSite: string
}

export interface IExporterInformation extends IBaseInformation {
    sourceMineSite: string
}

export interface IImporterInformation extends IBaseInformation {
    sourceCountry: string
}

export type IInformation = ISourceInformation | IExporterInformation | IImporterInformation


export interface ISourceDocuments {
    goldLotUrl: string
    purityVerificationUrl: string
    weightVerificationUrl: string
    certificateOfOriginUrl: string
}

export interface IExporterDocuments extends ISourceDocuments {
    icglrCertificateUrl: string
    taxReceiptUrl: string
}

export interface IImporterDocuments extends IExporterDocuments {
    customsClearanceUrl: string
    declarationStatementUrl: string
}

export type IDocuments = ISourceDocuments | IExporterDocuments | IImporterDocuments


export interface ISourceQuestions {
    extractedFromYourMine: boolean;
    underageOrForcedLaborInvolved: boolean;
    hazardousSubstancesUsed: boolean;
    transferOfTitleSubmitted: boolean;
}

export interface IExporterQuestions {
    federalTaxPaid: boolean;
    customsClearanceReceived: boolean;
}

export interface IImporterQuestions {
    importTariffsPaid: boolean;
}

export type IQuestions = ISourceQuestions | IExporterQuestions | IImporterQuestions


export interface IDelivery {
    provider: string
    weight: string
    length: string
    width: string
    height: string
}

export interface IPickup {
    addressOne: string
    addressTwo: string
    city: string
    state: string
    postalCode: string
}

export type IDeliveryMethod = IDelivery | IPickup

export interface IReport {
    reportedBy: string;
    reason: string;
    description?: string;
    reportedAt: Date;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
}


export interface IListing {
    seller: string | Account
    buyerAccountType: Exclude<AccountType, "source">
    information: IInformation
    documents: IDocuments
    questions: IQuestions
    deliveryMethod: 'delivery' | 'pickup'
    deliveryInformation: IDeliveryMethod
    signatureUrl: string
    createdAt: Date;
    updatedAt: Date;
    reports: IReport[];
    isReported: boolean;
    rating: number
    reviews: number
}


export type Listing = IListing & ID

export type ListingFilter = Filter & {
    deliveryMethod?: 'delivery' | 'pickup'
    seller?: string
    buyerAccountType?: AccountType
};

export const accountTypeListingFiles: Record<
    "source" | "exporter" | "importer",
    string[]
> = {
    source: [
        "signature",
        "goldLot",
        "purityVerification",
        "weightVerification",
        "certificateOfOrigin",
    ],
    exporter: [
        "signature",
        "goldLot",
        "purityVerification",
        "weightVerification",
        "certificateOfOrigin",
        "icglrCertificate",
        "taxReceipt",
    ],
    importer: [
        "signature",
        "goldLot",
        "purityVerification",
        "weightVerification",
        "certificateOfOrigin",
        "icglrCertificate",
        "taxReceipt",
        "customsClearance",
        "declarationStatement",
    ],
};


export type ReportListingParameters = {
    listingId: string;
    reportedBy: string;
    reason: string;
    description?: string;
}

export type ReportedListingsFilter = Filter & {
    status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    reason?: string;
    reportedAt: Date;
}
