import {
    ListingRepository
} from "../../../domain/listing/repository";
import {AccountRepository} from "../../../domain/account/repository";
import {
    IDocuments,
    IExporterDocuments,
    IImporterDocuments,
    IListing,
    ISourceDocuments
} from "../../../domain/listing/listing";
import {BadRequestError, ForbidenError} from "../../../../package/errors/customError";
import {AccountType} from "../../../domain/account/account";
import {StorageRepository} from "../../../domain/storage/repository";
import {Environment} from "../../../../package/configs/environment";

export type CreateListingParameters =
    Omit<IListing, "createdAt" | "updatedAt" | "rating" | "reviews" | "seller" | "buyerAccountType" | "reports" | "isReported">
    & {
    accountId: string,
};

export class CreateListing {
    listingRepository: ListingRepository;
    accountRepository: AccountRepository;
    storageRepository: StorageRepository
    environmentVariables: Environment

    constructor(
        listingRepository: ListingRepository,
        accountRepository: AccountRepository,
        environmentVariables: Environment,
        storageRepository: StorageRepository
    ) {
        this.listingRepository = listingRepository;
        this.accountRepository = accountRepository;
        this.storageRepository = storageRepository;
        this.environmentVariables = environmentVariables

    }

    handle = async (parameters: CreateListingParameters): Promise<string> => {
        let account = await this.accountRepository.GetAccount(parameters.accountId);
        if (!account.type) {
            throw new ForbidenError("account setup incomplete")
        }
        let buyerAccountType = this.buyerAccountType(account.type)

        // if (parameters.files.signature.length < 1 || !parameters.files.signature) throw new BadRequestError("provide signature")
        // todo: test if signature no dey
        // let signatureUrl = await this.storageRepository.upload(parameters.files.signature[0], this.environmentVariables.awsCredentials.s3BucketName)

        // let documents = await this.uploadFiles(parameters.files, account.type)

        return await this.listingRepository.CreateListing({
            seller: account._id,
            buyerAccountType,
            information: parameters.information,
            documents: parameters.documents,
            questions: parameters.questions,
            deliveryMethod: parameters.deliveryMethod,
            deliveryInformation: parameters.deliveryInformation,
            signatureUrl: parameters.signatureUrl
        })
    };

    private buyerAccountType(sellerAccountType: AccountType): Exclude<AccountType, "source"> {
        switch (sellerAccountType) {
            case "source":
                return "exporter"
            case "exporter":
                return "importer"
            case "importer":
                return "offtaker"
            default:
                throw new ForbidenError("account can not create a listing")
        }
    }

    private async uploadFiles(files: any, type: AccountType): Promise<IDocuments> {
        let documents: IDocuments;
        switch (type) {
            case "source":
                const sourceDocuments: ISourceDocuments = {
                    goldLotUrl: await this.storageRepository.upload(files.goldLot[0], this.environmentVariables.awsCredentials.s3BucketName),
                    purityVerificationUrl: await this.storageRepository.upload(files.purityVerification[0], this.environmentVariables.awsCredentials.s3BucketName),
                    weightVerificationUrl: await this.storageRepository.upload(files.weightVerification[0], this.environmentVariables.awsCredentials.s3BucketName),
                    certificateOfOriginUrl: await this.storageRepository.upload(files.certificateOfOrigin[0], this.environmentVariables.awsCredentials.s3BucketName),
                };
                documents = sourceDocuments;
                break;
            case "exporter":
                const exporterDocuments: IExporterDocuments = {
                    goldLotUrl: await this.storageRepository.upload(files.goldLot[0], this.environmentVariables.awsCredentials.s3BucketName),
                    purityVerificationUrl: await this.storageRepository.upload(files.purityVerification[0], this.environmentVariables.awsCredentials.s3BucketName),
                    weightVerificationUrl: await this.storageRepository.upload(files.weightVerification[0], this.environmentVariables.awsCredentials.s3BucketName),
                    certificateOfOriginUrl: await this.storageRepository.upload(files.certificateOfOrigin[0], this.environmentVariables.awsCredentials.s3BucketName),
                    icglrCertificateUrl: await this.storageRepository.upload(files.icglrCertificate[0], this.environmentVariables.awsCredentials.s3BucketName),
                    taxReceiptUrl: await this.storageRepository.upload(files.taxReceipt[0], this.environmentVariables.awsCredentials.s3BucketName),
                };
                documents = exporterDocuments;
                break;
            case "importer":
                const importerDocuments: IImporterDocuments = {
                    goldLotUrl: await this.storageRepository.upload(files.goldLot[0], this.environmentVariables.awsCredentials.s3BucketName),
                    purityVerificationUrl: await this.storageRepository.upload(files.purityVerification[0], this.environmentVariables.awsCredentials.s3BucketName),
                    weightVerificationUrl: await this.storageRepository.upload(files.weightVerification[0], this.environmentVariables.awsCredentials.s3BucketName),
                    certificateOfOriginUrl: await this.storageRepository.upload(files.certificateOfOrigin[0], this.environmentVariables.awsCredentials.s3BucketName),
                    icglrCertificateUrl: await this.storageRepository.upload(files.icglrCertificate[0], this.environmentVariables.awsCredentials.s3BucketName),
                    taxReceiptUrl: await this.storageRepository.upload(files.taxReceipt[0], this.environmentVariables.awsCredentials.s3BucketName),
                    customsClearanceUrl: await this.storageRepository.upload(files.customsClearance[0], this.environmentVariables.awsCredentials.s3BucketName),
                    declarationStatementUrl: await this.storageRepository.upload(files.declarationStatement[0], this.environmentVariables.awsCredentials.s3BucketName),
                };
                documents = importerDocuments;
                break;
            default:
                throw new BadRequestError("invalid account type");
        }
        return documents;
    }

}

