import {
    AccountRepository
} from "../../../domain/account/repository";
import {BadRequestError} from "../../../../package/errors/customError";
import {OTPRepository} from "../../../domain/otp/repository";
import {encrypt} from "../../../../package/utils/encryption";

export class ResetPassword {
    accountRepository: AccountRepository;
    otpRepository: OTPRepository;

    constructor(
        accountRepository: AccountRepository,
        otpRepository: OTPRepository,
    ) {
        this.accountRepository = accountRepository;
        this.otpRepository = otpRepository;

    }


    handle = async (email: string, password: string, otp: string): Promise<void> => {
        try {
            let account = await this.accountRepository.GetAccount("", email);
            await this.otpRepository.OTPValid({
                account: account._id,
                accountModel: "Account",
                otp,
                type: "email_verification",
            })
            const hashedPassword = await encrypt(password);
            await this.accountRepository.UpdateAccount(account._id, {password: hashedPassword})
        } catch (error) {
            throw error;
        }
    };
}

