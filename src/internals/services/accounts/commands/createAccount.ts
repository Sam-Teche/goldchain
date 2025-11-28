import {AccountRepository,} from "../../../domain/account/repository";
import {encrypt, signToken} from "../../../../package/utils/encryption";
import {Environment} from "../../../../package/configs/environment";
import {EmailRepository} from "../../../domain/notification/repository";
import Payload from "../../../../package/types/payload";
import {OTPRepository} from "../../../domain/otp/repository";
import {EmailParameters, EmailType} from "../../../domain/notification/email";
import sendOTP from "../../../../package/view/sendOTP";

export class CreateAccount {
    accountRepository: AccountRepository;
    otpRepository: OTPRepository;
    environmentVariables: Environment
    emailRepository: EmailRepository

    constructor(
        accountRepository: AccountRepository,
        otpRepository: OTPRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.accountRepository = accountRepository;
        this.otpRepository = otpRepository;
        this.environmentVariables = environmentVariables
        this.emailRepository = emailRepository
    }

    handle = async (email: string, password: string): Promise<string> => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await encrypt(password);
        const accountId = await this.accountRepository.CreateAccount(email, hashedPassword)
        await this.otpRepository.AddOTP({
            account: accountId,
            accountModel: "Account",
            otp,
            type: "email_verification",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        })
        const emailParameters: EmailParameters = {
            type: EmailType.HTML,
            subject: "OTP Code",
            email,
            message: sendOTP(otp, this.environmentVariables.supportEmail),
        };

        try {
            this.emailRepository.send(emailParameters).catch();
        } catch (e) {
            console.log(e)
        }

        const payload: Payload = {_id: accountId};
        return signToken(payload)

    };
}

