import {AccountRepository} from "../../../domain/account/repository";
import {NotFoundError} from "../../../../package/errors/customError";
import {EmailParameters, EmailType} from "../../../domain/notification/email";
import accountSetupMail from "../../../../package/view/acccountSetupMail";
import {Environment} from "../../../../package/configs/environment";
import {EmailRepository} from "../../../domain/notification/repository";

export class ActivateAccount {
    accountRepository: AccountRepository;
    environmentVariables: Environment;
    emailRepository: EmailRepository

    constructor(
        accountRepository: AccountRepository, environmentVariables: Environment, emailRepository: EmailRepository
    ) {
        this.accountRepository = accountRepository;
        this.environmentVariables = environmentVariables;
        this.emailRepository = emailRepository
    }


    handle = async (activationReference: string): Promise<void> => {
        try {
            let accounts = await this.accountRepository.GetAccounts({activationReference});
            if (accounts.length < 1) throw new NotFoundError("no account bound to reference")
            await this.accountRepository.UpdateAccount(accounts[0]._id, {activated: true, activatedAt: new Date()})

            const emailParameters: EmailParameters = {
                type: EmailType.HTML,
                subject: "Account Being Reviewed",
                email: accounts[0].email,
                message: accountSetupMail(this.environmentVariables.supportEmail),
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