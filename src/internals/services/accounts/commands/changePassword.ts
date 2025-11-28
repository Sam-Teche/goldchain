import {AccountRepository} from "../../../domain/account/repository";
import {compareHash, encrypt} from "../../../../package/utils/encryption";
import {ForbidenError} from "../../../../package/errors/customError";


export type ChangePasswordParameters = {
    id: string,
    newPassword: string,
    oldPassword: string,
}

export class ChangePassword {
    accountRepository: AccountRepository;

    constructor(
        accountRepository: AccountRepository,
    ) {
        this.accountRepository = accountRepository;
    }


    handle = async (parameters: ChangePasswordParameters): Promise<void> => {
        let account = await this.accountRepository.GetAccount(parameters.id);

        const passwordCorrect = compareHash(parameters.oldPassword, account.password);
        if (!passwordCorrect) {
            throw new ForbidenError(`wrong password`);
        }

        const hashedPassword = await encrypt(parameters.newPassword);
        await this.accountRepository.UpdateAccount(account._id, {password: hashedPassword})
    };
}

