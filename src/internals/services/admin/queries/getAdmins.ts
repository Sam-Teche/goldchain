import {AdminRepository} from "../../../domain/admin/repository";
import {AdminFilter, Admin} from "../../../domain/admin/admin";

export class GetAdmins {
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
    ) {
        this.adminRepository = adminRepository;
    }


    handle = async (filter: AdminFilter): Promise<Admin[]> => {
        try {
            return await this.adminRepository.GetAdmins(filter)
        } catch (error) {
            throw error;
        }
    };
}
