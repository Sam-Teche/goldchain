import {AccountRepository} from "../../domain/account/repository";
import {CreateListing} from "./command/createListing";
import {ListingRepository} from "../../domain/listing/repository";
import {Environment} from "../../../package/configs/environment";
import {StorageRepository} from "../../domain/storage/repository";
import {GetListings} from "./queries/getListings";
import {GetListing} from "./queries/getListing";
import {DeleteListing} from "./command/deleteListing";
import {ReportListing} from "./command/reportListing";
import {GetReportedListings} from "./queries/getReportedListings";

class Commands {
    createListing: CreateListing
    deleteListing: DeleteListing
    reportListing: ReportListing

    constructor(
        listingRepository: ListingRepository,
        accountRepository: AccountRepository,
        environmentVariables: Environment,
        storageRepository: StorageRepository
    ) {
        this.createListing = new CreateListing(listingRepository, accountRepository, environmentVariables, storageRepository)
        this.deleteListing = new DeleteListing(listingRepository)
        this.reportListing = new ReportListing(listingRepository)
    }
}

class Queries {
    getListings: GetListings
    getListing: GetListing
    getReportedListing: GetReportedListings

    constructor(listingRepository: ListingRepository, accountRepository: AccountRepository) {
        this.getListings = new GetListings(listingRepository)
        this.getListing = new GetListing(listingRepository)
        this.getReportedListing = new GetReportedListings(listingRepository)
    }
}

class ListingServices {
    commands: Commands
    queries: Queries

    constructor(
        listingRepository: ListingRepository,
        accountRepository: AccountRepository,
        environmentVariables: Environment,
        storageRepository: StorageRepository
    ) {
        this.commands = new Commands(listingRepository, accountRepository, environmentVariables, storageRepository)
        this.queries = new Queries(listingRepository, accountRepository)
    }
}

export default ListingServices