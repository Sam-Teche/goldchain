import {AdminRepository} from "../../../domain/admin/repository";
import {Admin} from "../../../domain/admin/admin";

export class GetAdmin {
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
    ) {
        this.adminRepository = adminRepository;
    }


    handle = async (id?: string, email?: string): Promise<Admin> => {
        try {
            let admin = await this.adminRepository.GetAdmin(id, email);
            admin.password = ""
            return admin
        } catch (error) {
            throw error;
        }
    };
}
