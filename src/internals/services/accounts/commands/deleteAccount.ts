import {AccountRepository} from "../../../domain/account/repository";
import {BadRequestError} from "../../../../package/errors/customError";

export class DeleteAccount {
    accountRepository: AccountRepository;

    constructor(
        accountRepository: AccountRepository,
    ) {
        this.accountRepository = accountRepository;
    }


    handle = async (id: string): Promise<void> => {
        try {
            // switch (accountType) {
            //     case .Admin:
            //         if (accountType != .Admin) {
            //             throw new BadRequestError("account must also be an administrator")
            //         }
            //         await this.accountRepository.AdminRepository.Delete(id)
            //         break
            //     case .Tenant:
            //         if (accountType != .Tenant) {
            //             throw new BadRequestError("account must also be a tenant")
            //         }
            //         await this.accountRepository.TenantRepository.Delete(id)
            //         break
            //     case .Landlord:
            //         if (accountType != .Landlord) {
            //             throw new BadRequestError("account must also be a landlord")
            //         }
            //         await this.accountRepository.LandlordRepository.Delete(id)
            //         break
            // }
        } catch (error) {
            throw error;
        }
    };
}

