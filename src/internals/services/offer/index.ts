import {AccountRepository} from "../../domain/account/repository";
import {CreateOffer} from "./command/createOffer";
import {OfferRepository} from "../../domain/offer/repository";
import {Environment} from "../../../package/configs/environment";
import {EmailRepository} from "../../domain/notification/repository";
import {GetOffers} from "./queries/getOffers";
import {GetOffer} from "./queries/getOffer";
import {DeleteOffer} from "./command/deleteOffer";
import {ListingRepository} from "../../domain/listing/repository";
import {UpdateOfferStatus} from "./command/updateOfferStatus";

class Commands {
    createOffer: CreateOffer
    updateOfferStatus: UpdateOfferStatus
    deleteOffer: DeleteOffer

    constructor(
        offerRepository: OfferRepository,
        accountRepository: AccountRepository,
        listingRepository: ListingRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.createOffer = new CreateOffer(offerRepository, accountRepository, listingRepository, environmentVariables, emailRepository)
        this.deleteOffer = new DeleteOffer(offerRepository)
        this.updateOfferStatus = new UpdateOfferStatus(offerRepository, accountRepository, listingRepository, environmentVariables, emailRepository)
    }
}

class Queries {
    getOffers: GetOffers
    getOffer: GetOffer

    constructor(offerRepository: OfferRepository) {
        this.getOffers = new GetOffers(offerRepository)
        this.getOffer = new GetOffer(offerRepository)
    }
}

class OfferServices {
    commands: Commands
    queries: Queries

    constructor(
        offerRepository: OfferRepository,
        accountRepository: AccountRepository,
        listingRepository: ListingRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.commands = new Commands(offerRepository, accountRepository, listingRepository, environmentVariables, emailRepository)
        this.queries = new Queries(offerRepository)
    }
}

export default OfferServices