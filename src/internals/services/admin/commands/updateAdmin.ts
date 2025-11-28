import {AdminRepository} from "../../../domain/admin/repository";
import {IAdmin} from "../../../domain/admin/admin";
import admin from "../index";

export class UpdateAdmin {
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
    ) {
        this.adminRepository = adminRepository;
    }


    handle = async (adminId: string, admin: Partial<IAdmin>): Promise<void> => {
        try {
            await this.adminRepository.UpdateAdmin(adminId, admin);
        } catch (error) {
            throw error;
        }
    };
}

