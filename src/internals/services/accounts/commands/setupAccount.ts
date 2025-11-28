import {AccountRepository} from "../../../domain/account/repository";
import {
    AccountType,
    IDocuments,
    IExporterDocuments, IImporterDocuments, IOfftakerDocuments, IPaymentDetails,
    IProfile, IQuestions,
    ISourceDocuments
} from "../../../domain/account/account";
import {StorageRepository} from "../../../domain/storage/repository";
import {Environment} from "../../../../package/configs/environment";
import {BadRequestError} from "../../../../package/errors/customError";

export type SetupAccountParameters = {
    accountId: string,
    type?: AccountType,
    profile?: IProfile,
    files?: any,
    questions?: IQuestions,
    paymentMethods?: IPaymentDetails[]
    profilePictureFile?: any
    description?: string
}

export class SetupAccount {
    accountRepository: AccountRepository;
    storageRepository: StorageRepository
    environmentVariables: Environment

    constructor(
        accountRepository: AccountRepository, environmentVariables: Environment, storageRepository: StorageRepository
    ) {
        this.accountRepository = accountRepository;
        this.storageRepository = storageRepository;
        this.environmentVariables = environmentVariables
    }


    handle = async (parameters: SetupAccountParameters): Promise<void> => {
        try {
            let account = await this.accountRepository.GetAccount(parameters.accountId)
            // if (account.status == 'approved') {
            //     throw new BadRequestError("account activated")
            // }

            if (!parameters.profile && !parameters.paymentMethods && !account.type) {
                throw new BadRequestError("missing profile data — please complete your profile before continuing");
            } else if (!parameters.profile && !parameters.paymentMethods && account.type !== parameters.type) {
                throw new BadRequestError("account type mismatch — the type you provided doesn’t match your account");
            }

            let documents;
            if (parameters.type && parameters.files) {
                documents = await this.uploadFiles(parameters.files, parameters.type)
            }
            let profilePicture
            if (parameters.profilePictureFile) {
                profilePicture = await this.storageRepository.upload(parameters.profilePictureFile, this.environmentVariables.awsCredentials.s3BucketName)
            }
            await this.accountRepository.UpdateAccount(parameters.accountId, {
                type: parameters.type,
                profile: parameters.profile,
                documents,
                questions: parameters.questions,
                paymentMethods: parameters.paymentMethods,
                profilePicture,
                description: parameters.description
            })
        } catch (error) {
            throw error;
        }
    };

    private async uploadFiles(files: any, type: AccountType): Promise<IDocuments> {
        let documents: IDocuments;
        switch (type) {
            case "source":
                let sourceDocuments: ISourceDocuments = {
                    buyerCardUrl: await this.storageRepository.upload(files.buyerCard[0], this.environmentVariables.awsCredentials.s3BucketName),
                    companyRegistrationUrl: await this.storageRepository.upload(files.companyRegistration[0], this.environmentVariables.awsCredentials.s3BucketName),
                    identificationUrl: await this.storageRepository.upload(files.identification[0], this.environmentVariables.awsCredentials.s3BucketName),
                    mineTitleUrl: await this.storageRepository.upload(files.mineTitle[0], this.environmentVariables.awsCredentials.s3BucketName),
                    miningLicenseUrl: await this.storageRepository.upload(files.miningLicense[0], this.environmentVariables.awsCredentials.s3BucketName)
                }
                documents = sourceDocuments
                break
            case "exporter":
                let exporterDocuments: IExporterDocuments = {
                    buyerCardUrl: await this.storageRepository.upload(files.buyerCard[0], this.environmentVariables.awsCredentials.s3BucketName),
                    companyRegistrationUrl: await this.storageRepository.upload(files.companyRegistration[0], this.environmentVariables.awsCredentials.s3BucketName),
                    identificationUrl: await this.storageRepository.upload(files.identification[0], this.environmentVariables.awsCredentials.s3BucketName),
                    exportLicenseUrl: await this.storageRepository.upload(files.exportLicense[0], this.environmentVariables.awsCredentials.s3BucketName)
                }
                documents = exporterDocuments
                break
            case "importer":
                let importerDocuments: IImporterDocuments = {
                    companyRegistrationUrl: await this.storageRepository.upload(files.companyRegistration[0], this.environmentVariables.awsCredentials.s3BucketName),
                    identificationUrl: await this.storageRepository.upload(files.identification[0], this.environmentVariables.awsCredentials.s3BucketName),
                    importLicenseUrl: await this.storageRepository.upload(files.importLicense[0], this.environmentVariables.awsCredentials.s3BucketName)
                }
                documents = importerDocuments
                break
            case "offtaker":
                let offtakerDocuments: IOfftakerDocuments = {
                    companyRegistrationUrl: await this.storageRepository.upload(files.companyRegistration[0], this.environmentVariables.awsCredentials.s3BucketName),
                    identificationUrl: await this.storageRepository.upload(files.identification[0], this.environmentVariables.awsCredentials.s3BucketName),
                    refineryLicenseUrl: await this.storageRepository.upload(files.refineryLicense[0], this.environmentVariables.awsCredentials.s3BucketName),
                }
                documents = offtakerDocuments
                break
            default:
                throw new BadRequestError("invalid account type")
        }
        return documents
    }

}

