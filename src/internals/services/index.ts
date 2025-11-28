import Adapters from "../adapters";
import AccountServices from "./accounts";
import AdminServices from "./admin";
import NoteServices from "./note";
import ListingServices from "./listing";
import RequestServices from "./request";
import ReviewServices from "./review";
import OfferServices from "./offer";
import ChatServices from "./chat";
import LedgerServices from "./ledger";

class Services {
    accountServices: AccountServices
    adminServices: AdminServices
    noteServices: NoteServices
    listingServices: ListingServices
    requestServices: RequestServices
    offerServices: OfferServices
    reviewServices: ReviewServices
    chatServices: ChatServices
    ledgerServices: LedgerServices

    constructor(adapters: Adapters) {
        this.accountServices = new AccountServices(adapters.accountRepository, adapters.otpRepository, adapters.environmentVariables, adapters.emailRepository, adapters.storageRepository, adapters.paymentRepository, adapters.ledgerRepository, adapters.listingRepository)
        this.adminServices = new AdminServices(adapters.adminRepository, adapters.otpRepository, adapters.environmentVariables, adapters.emailRepository, adapters.storageRepository)
        this.noteServices = new NoteServices(adapters.noteRepository, adapters.accountRepository, adapters.adminRepository, adapters.environmentVariables, adapters.emailRepository)
        this.listingServices = new ListingServices(adapters.listingRepository, adapters.accountRepository, adapters.environmentVariables, adapters.storageRepository)
        this.requestServices = new RequestServices(adapters.requestRepository, adapters.accountRepository, adapters.listingRepository, adapters.environmentVariables, adapters.emailRepository)
        this.offerServices = new OfferServices(adapters.offerRepository, adapters.accountRepository, adapters.listingRepository, adapters.environmentVariables, adapters.emailRepository)
        this.reviewServices = new ReviewServices(adapters.reviewRepository)
        this.chatServices = new ChatServices(adapters.chatRepository, adapters.environmentVariables, adapters.storageRepository, adapters.chatWebsocketRepository)
        this.ledgerServices = new LedgerServices(adapters.ledgerRepository, adapters.escrowRepository, adapters.offerRepository, adapters.requestRepository, adapters.listingRepository, adapters.accountRepository, adapters.environmentVariables, adapters.emailRepository,adapters.blockchainRepository)
    }
}

export default Services;