import {AdminRepository} from "../../../domain/admin/repository";

export class RemoveAdmin {
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
    ) {
        this.adminRepository = adminRepository;
    }


    handle = async (adminId: string): Promise<void> => {
        try {
            const admin = await this.adminRepository.DeleteAdmin(adminId);
        } catch (error) {
            throw error;
        }
    };
}

