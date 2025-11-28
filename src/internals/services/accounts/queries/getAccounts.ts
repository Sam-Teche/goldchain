import {AccountRepository} from "../../../domain/account/repository";
import {Account, AccountFilter} from "../../../domain/account/account";

export class GetAccounts {
    accountRepository: AccountRepository;

    constructor(
        accountRepository: AccountRepository,
    ) {
        this.accountRepository = accountRepository;
    }


    handle = async (filter: AccountFilter): Promise<Account[]> => {
        try {
            return await this.accountRepository.GetAccounts(filter)
        } catch (error) {
            throw error;
        }
    };
}
