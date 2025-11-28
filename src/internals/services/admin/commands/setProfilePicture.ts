import {AdminRepository} from "../../../domain/admin/repository";
import {IAdmin} from "../../../domain/admin/admin";
import admin from "../index";
import {StorageRepository} from "../../../domain/storage/repository";
import {Environment} from "../../../../package/configs/environment";

export class SetProfilePicture {
    adminRepository: AdminRepository;
    storageRepository: StorageRepository;
    environmentVariable: Environment;

    constructor(
        adminRepository: AdminRepository,
        storageRepository: StorageRepository,
        environmentVariable: Environment
    ) {
        this.adminRepository = adminRepository;
        this.storageRepository = storageRepository;
        this.environmentVariable = environmentVariable;
    }


    handle = async (adminId: string, file: Express.Multer.File): Promise<void> => {
        try {
            let profilePicture = await this.storageRepository.upload(file, this.environmentVariable.awsCredentials.s3BucketName)
            await this.adminRepository.UpdateAdmin(adminId, {profilePicture});
        } catch (error) {
            throw error;
        }
    };
}

