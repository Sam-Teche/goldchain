import {AdminRepository} from "../../../domain/admin/repository";
import {ForbidenError, UnAuthorizedError} from "../../../../package/errors/customError";
import {compareHash, encrypt} from "../../../../package/utils/encryption";


export type ChangePasswordParameters = {
    id: string,
    newPassword: string,
    oldPassword: string,
}

export class ChangePassword {
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
    ) {
        this.adminRepository = adminRepository;
    }


    handle = async (parameters: ChangePasswordParameters): Promise<void> => {
        let admin = await this.adminRepository.GetAdmin(parameters.id);

        const passwordCorrect = compareHash(parameters.oldPassword, admin.password);
        if (!passwordCorrect) {
            throw new ForbidenError(`wrong password`);
        }

        const hashedPassword = await encrypt(parameters.newPassword);
        await this.adminRepository.UpdateAdmin(admin._id, {password: hashedPassword})
    };
}

