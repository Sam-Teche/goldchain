import {IAccount, AccountFilter, Account} from "./account";

export interface AccountRepository {
    CreateAccount: (email: string, password: string) => Promise<string>
    UpdateAccount: (accountId: string, account: Partial<IAccount>) => Promise<void>
    DeleteAccount: (accountId: string) => Promise<void>
    GetAccounts: (filter: AccountFilter) => Promise<Account[]>
    GetAccount: (accountId?: string, email?: string) => Promise<Account>
}

// When profile is set - use a service that just update without regard to if they exist before but when ever it is used account type changes to pending
// if rejected a mail with why would be sent, so if ui see status as rejected it would redirect them back to the setup page, but they can fetch previous information so to prefill inputs