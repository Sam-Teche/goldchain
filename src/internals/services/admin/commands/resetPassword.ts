import {
    AdminRepository
} from "../../../domain/admin/repository";
import {OTPRepository} from "../../../domain/otp/repository";
import {encrypt} from "../../../../package/utils/encryption";

export class ResetPassword {
    adminRepository: AdminRepository;
    otpRepository: OTPRepository;

    constructor(
        adminRepository: AdminRepository,
        otpRepository: OTPRepository,
    ) {
        this.adminRepository = adminRepository;
        this.otpRepository = otpRepository;

    }


    handle = async (email: string, password: string, otp: string): Promise<void> => {
        try {
            let admin = await this.adminRepository.GetAdmin("", email);
            await this.otpRepository.OTPValid({
                account: admin._id,
                accountModel: "Admin",
                otp,
                type: "email_verification",
            })
            const hashedPassword = await encrypt(password);
            await this.adminRepository.UpdateAdmin(admin._id, {password: hashedPassword})
        } catch (error) {
            throw error;
        }
    };
}

