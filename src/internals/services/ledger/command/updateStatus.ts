import {LedgerRepository} from "../../../domain/ledger/repository";
import {EmailRepository} from "../../../domain/notification/repository";
import {Environment} from "../../../../package/configs/environment";
import {BlockchainRepository} from "../../../domain/blockchain/repository";
import {ListingRepository} from "../../../domain/listing/repository";


export class UpdateStatus {
    ledgerRepository: LedgerRepository;
    environmentVariables: Environment;
    emailRepository: EmailRepository
    blockchainRepository: BlockchainRepository;
    listingRepository: ListingRepository;

    constructor(
        ledgerRepository: LedgerRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository,
        blockchainRepository: BlockchainRepository,
        listingRepository: ListingRepository
    ) {
        this.ledgerRepository = ledgerRepository;
        this.environmentVariables = environmentVariables;
        this.emailRepository = emailRepository;
        this.blockchainRepository = blockchainRepository;
        this.listingRepository = listingRepository;
    }


    handle = async (status: string, ledgerId?: string, reference?: string,): Promise<void> => {
        let ledger = await this.ledgerRepository.GetLedger(ledgerId, reference)

        if (ledger.status == status) return;

        if (status == "complete") {
            let listing = await this.listingRepository.GetListing(ledger.listing as string)
            await this.blockchainRepository.AddLedger(ledger.trackingId, listing.information.lotNumber)
        }

        await this.ledgerRepository.UpdateLedger(ledger._id, {status})
    };
}
