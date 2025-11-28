import {
    AccountRepository
} from "../../../domain/account/repository";
import {BadRequestError} from "../../../../package/errors/customError";
import {OTPRepository} from "../../../domain/otp/repository";
import {AccountStatus} from "../../../domain/account/account";
import {EmailParameters, EmailType} from "../../../domain/notification/email";
import sendOTP from "../../../../package/view/sendOTP";
import {EmailRepository} from "../../../domain/notification/repository";
import {Environment} from "../../../../package/configs/environment";
import sendAccountStatus from "../../../../package/view/sendAccountStatus";

export class ChangeAccountStatus {
    accountRepository: AccountRepository;
    emailRepository: EmailRepository
    environmentVariables: Environment

    constructor(
        accountRepository: AccountRepository,
        emailRepository: EmailRepository,
        environmentVariables: Environment
    ) {
        this.accountRepository = accountRepository;
        this.emailRepository = emailRepository;
        this.environmentVariables = environmentVariables;

    }


    handle = async (accountId: string, status: AccountStatus): Promise<void> => {
        try {
            let account = await this.accountRepository.GetAccount(accountId);
            let approvedAt = status == "approved" ? new Date() : undefined
            await this.accountRepository.UpdateAccount(account._id, {status, approvedAt})
            const emailParameters: EmailParameters = {
                type: EmailType.HTML,
                subject: "Account Status Update",
                email: account.email,
                message: sendAccountStatus(status, this.environmentVariables.supportEmail),
            };

            try {
                this.emailRepository.send(emailParameters).catch();
            } catch (e) {
                // console.log(e)
            }

        } catch (error) {
            throw error;
        }
    };
}

