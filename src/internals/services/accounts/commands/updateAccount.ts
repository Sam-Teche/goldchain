import {AccountRepository} from "../../../domain/account/repository";
import { IAccount } from "../../../domain/account/account";
import account from "../index";

export class UpdateAccount {
    accountRepository: AccountRepository;

    constructor (
        accountRepository: AccountRepository
    ){
        this.accountRepository = accountRepository
        }
    
         handle = async (accountId: string, account: Partial<IAccount>): Promise<void> => {
                try {
                    await this.accountRepository.UpdateAccount(accountId, account);
                } catch (error) {
                    throw error;
                }
            };

}