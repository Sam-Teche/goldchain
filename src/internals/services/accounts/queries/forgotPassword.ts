import {AccountRepository, } from "../../../domain/account/repository";
import {BadRequestError} from "../../../../package/errors/customError";
import Payload from "../../../../package/types/payload";
import {EmailParameters, EmailType} from "../../../domain/notification/email";
import {EmailRepository} from "../../../domain/notification/repository";
import {Environment} from "../../../../package/configs/environment";
import forgotPasswordEmailHtml from "../../../../package/view/forgotPassword";
import {signToken} from "../../../../package/utils/encryption";

export class ForgotPassword {
    accountRepository: AccountRepository;
    environmentVariables: Environment
    emailRepository: EmailRepository

    constructor(
        accountRepository: AccountRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.accountRepository = accountRepository;
        this.environmentVariables = environmentVariables
        this.emailRepository = emailRepository
    }


    handle = async (email: string): Promise<void> => {
        try {
            // let account: ;
            // switch (accountType) {
            //     case .Admin:
            //         if (accountType != .Admin) {
            //             throw new BadRequestError("account must also be an administrator")
            //         }
            //         account = await this.accountRepository.AdminRepository.Get(undefined, email)
            //         break
            //     case .Tenant:
            //         if (accountType != .Tenant) {
            //             throw new BadRequestError("account must also be a tenant")
            //         }
            //         account = await this.accountRepository.TenantRepository.Get(undefined, email)
            //         break
            //     case .Landlord:
            //         if (accountType != .Landlord) {
            //             throw new BadRequestError("account must also be a landlord")
            //         }
            //         account = await this.accountRepository.LandlordRepository.Get(undefined, email)
            //         break
            // }
            //
            // const payload: Payload = {id: account.id, accountType: accountType};
            // const token = signToken(payload, 10 * 60)
            // const emailParameters: EmailParameters = {
            //     type: EmailType.HTML,
            //     subject: "User  Verification",
            //     email: account.email,
            //     message: forgotPasswordEmailHtml(`${this.environmentVariables.resetPasswordUrl}?token=${token}`, this.environmentVariables.supportEmail),
            // };
            //
            // try {
            //     this.emailRepository.send(emailParameters).catch();
            // } catch (e) {
            //     // console.log(e)
            // }
        } catch (error) {
            return
        }
    };
}