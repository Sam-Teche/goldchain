import {
    AccountRepository,
} from "../../../domain/account/repository";
import {compareHash, encrypt, signToken} from "../../../../package/utils/encryption";
import {BadRequestError, UnAuthorizedError} from "../../../../package/errors/customError";
import Payload from "../../../../package/types/payload";
import {Account} from "../../../domain/account/account";
import {Environment} from "../../../../package/configs/environment";

export class Authenticate {
    accountRepository: AccountRepository;
    environmentVariables: Environment

    constructor(
        accountRepository: AccountRepository,
        environmentVariables: Environment
    ) {
        this.accountRepository = accountRepository;
        this.environmentVariables = environmentVariables;
    }


    handle = async (email: string, password: string, stayLoggedIn?: boolean): Promise<{
        account: Account,
        token: string,
        expires?: number
    }> => {
            let account = await this.accountRepository.GetAccount("", email);
            const passwordCorrect = compareHash(password, account.password);
            if (!passwordCorrect) {
                throw new UnAuthorizedError(`invalid email or password`);
            }

            const payload: Payload = {_id: account._id};
            const token = signToken(payload, stayLoggedIn ? this.environmentVariables.jwtExpiresStay : undefined)

            account.password = "";
            return {
                account,
                token,
                expires: stayLoggedIn ? this.environmentVariables.cookieExpiresStay : undefined
            }
    };
}

