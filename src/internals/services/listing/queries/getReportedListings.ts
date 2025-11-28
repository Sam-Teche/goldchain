import {ListingRepository} from "../../../domain/listing/repository";
import {Listing, ListingFilter, ReportedListingsFilter} from "../../../domain/listing/listing";

export class GetReportedListings {
    listingRepository: ListingRepository;

    constructor(
        listingRepository: ListingRepository,
    ) {
        this.listingRepository = listingRepository;
    }


    handle = async (filter: ReportedListingsFilter): Promise<Listing[]> => {
        try {
            return await this.listingRepository.GetReportedListings(filter)
        } catch (error) {
            throw error;
        }
    };
}
