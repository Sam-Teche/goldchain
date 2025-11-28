import {AccountRepository} from "../../domain/account/repository";
import {Environment} from "../../../package/configs/environment";
import {EmailRepository} from "../../domain/notification/repository";
import {LedgerRepository} from "../../domain/ledger/repository";
import {EscrowRepository} from "../../domain/escrow/repository";
import {OfferRepository} from "../../domain/offer/repository";
import {RequestRepository} from "../../domain/request/repository";
import {ListingRepository} from "../../domain/listing/repository";
import {CompletePurchase} from "./command/completePurchase";
import {UpdateStatus} from "./command/updateStatus";
import {GetLedgers} from "./queries/getLedgers";
import {GetLedger} from "./queries/getLedger";
import {Cancel} from "./command/cancel";
import {BlockchainRepository} from "../../domain/blockchain/repository";

class Commands {
    completePurchase: CompletePurchase
    updateStatus: UpdateStatus
    cancel: Cancel

    constructor(ledgerRepository: LedgerRepository,
                escrowRepository: EscrowRepository,
                offerRepository: OfferRepository,
                requestRepository: RequestRepository,
                listingRepository: ListingRepository,
                accountRepository: AccountRepository,
                environmentVariables: Environment,
                emailRepository: EmailRepository,
                blockchainRepository: BlockchainRepository
    ) {
        this.completePurchase = new CompletePurchase(
            ledgerRepository,
            escrowRepository,
            offerRepository,
            requestRepository,
            listingRepository,
            accountRepository,
            environmentVariables,
            emailRepository
        )
        this.updateStatus = new UpdateStatus(ledgerRepository, environmentVariables, emailRepository,blockchainRepository,listingRepository)
        this.cancel = new Cancel(ledgerRepository, escrowRepository, environmentVariables, emailRepository)
    }
}

class Queries {
    getLedgers: GetLedgers
    getLedger: GetLedger

    constructor(ledgerRepository: LedgerRepository, accountRepository: AccountRepository) {
        this.getLedgers = new GetLedgers(ledgerRepository)
        this.getLedger = new GetLedger(ledgerRepository)
    }
}

class LedgerServices {
    commands: Commands
    queries: Queries

    constructor(ledgerRepository: LedgerRepository,
                escrowRepository: EscrowRepository,
                offerRepository: OfferRepository,
                requestRepository: RequestRepository,
                listingRepository: ListingRepository,
                accountRepository: AccountRepository,
                environmentVariables: Environment,
                emailRepository: EmailRepository,
                blockchainRepository: BlockchainRepository
    ) {
        this.commands = new Commands(
            ledgerRepository,
            escrowRepository,
            offerRepository,
            requestRepository,
            listingRepository,
            accountRepository,
            environmentVariables,
            emailRepository,
            blockchainRepository
        )
        this.queries = new Queries(ledgerRepository, accountRepository)
    }
}

export default LedgerServices