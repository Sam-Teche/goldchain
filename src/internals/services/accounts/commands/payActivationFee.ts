import {AccountRepository} from "../../../domain/account/repository";
import {OTPRepository} from "../../../domain/otp/repository";
import {PaymentRepository} from "../../../domain/payment/repository";
import {Environment} from "../../../../package/configs/environment";
import {BadRequestError} from "../../../../package/errors/customError";

export class PayActivationFee {
    accountRepository: AccountRepository;
    paymentRepository: PaymentRepository;
    environmentVariables: Environment

    constructor(
        accountRepository: AccountRepository,
        paymentRepository: PaymentRepository,
        environmentVariables: Environment
    ) {
        this.accountRepository = accountRepository;
        this.paymentRepository = paymentRepository;
        this.environmentVariables = environmentVariables;
    }


    handle = async (accountId: string): Promise<string> => {
        try {
            let account = await this.accountRepository.GetAccount(accountId);
            if (account.activated) throw new BadRequestError("account already activated")
            let {
                reference,
                checkoutUrl
            } = await this.paymentRepository.fund(this.environmentVariables.activationFee.toString())

            await this.accountRepository.UpdateAccount(account._id, {activationReference: reference})
            return checkoutUrl
        } catch (error) {
            throw error;
        }
    };
}