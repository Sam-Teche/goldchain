import {LedgerRepository} from "../../../domain/ledger/repository";
import {ListingRepository} from "../../../domain/listing/repository";
import {AccountRepository} from "../../../domain/account/repository";

export class Analytics {
    private readonly ledgerRepository: LedgerRepository;
    private readonly listingRepository: ListingRepository;
    private readonly accountRepository: AccountRepository;

    constructor(
        ledgerRepository: LedgerRepository,
        listingRepository: ListingRepository,
        accountRepository: AccountRepository,
    ) {
        this.ledgerRepository = ledgerRepository;
        this.listingRepository = listingRepository;
        this.accountRepository = accountRepository;
    }

    handle = async (accountId: string): Promise<{
        averagePricePerGram: number,
        totalWeight: number,
        totalTransactions: number;
        totalSales: number
    }> => {
        let ledgerAnalytics = await this.ledgerRepository.GetLedgerAnalytics(accountId)
        let listingAnalytics = await this.listingRepository.GetListingAnalytics(accountId)

        return {...ledgerAnalytics, ...listingAnalytics}
    }
}