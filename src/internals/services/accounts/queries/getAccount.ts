import {AccountRepository} from "../../../domain/account/repository";
import {BadRequestError} from "../../../../package/errors/customError";
import {Account} from "../../../domain/account/account";

export class GetAccount {
    accountRepository: AccountRepository;

    constructor(
        accountRepository: AccountRepository,
    ) {
        this.accountRepository = accountRepository;
    }


    handle = async (id?: string, email?: string): Promise<Account> => {
        try {
            let account = await this.accountRepository.GetAccount(id, email);
            account.password = ""
            return account
        } catch (error) {
            throw error;
        }
    };
}
