import {AdminRepository} from "../../../domain/admin/repository";
import {EmailRepository} from "../../../domain/notification/repository";
import {generateStrongPassword} from "../../../../package/utils/generate";
import {encrypt} from "../../../../package/utils/encryption";
import {EmailParameters, EmailType} from "../../../domain/notification/email";
import sendAdminCredential from "../../../../package/view/sendAdminCredential";
import {Environment} from "../../../../package/configs/environment";

export class AddAdmin {
    adminRepository: AdminRepository;
    emailRepository: EmailRepository;
    environmentVariables: Environment

    constructor(
        adminRepository: AdminRepository,
        emailRepository: EmailRepository,
        environmentVariables: Environment
    ) {
        this.adminRepository = adminRepository;
        this.emailRepository = emailRepository;
        this.environmentVariables = environmentVariables;
    }

    handle = async (email: string, fullName: string): Promise<string> => {
        try {
            const password = generateStrongPassword()
            const hashedPassword = await encrypt(password);
            await this.adminRepository.CreateAdmin(email, hashedPassword, fullName);

            const emailParameters: EmailParameters = {
                type: EmailType.HTML,
                subject: "GoldChain Admin Invite",
                email,
                message: sendAdminCredential(password, this.environmentVariables.supportEmail),
            };

            try {
                this.emailRepository.send(emailParameters).catch();
            } catch (e) {
                // console.log(e)
            }
            return password;
        } catch (error) {
            throw error;
        }
    };
}