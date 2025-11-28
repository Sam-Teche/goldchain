import {ListingRepository} from "../../../domain/listing/repository";
import {Listing, ListingFilter, ReportListingParameters} from "../../../domain/listing/listing";

export class ReportListing {
    listingRepository: ListingRepository;

    constructor(
        listingRepository: ListingRepository,
    ) {
        this.listingRepository = listingRepository;
    }


    handle = async (parameters: ReportListingParameters): Promise<void> => {
        try {
            await this.listingRepository.ReportListing(parameters)
        } catch (error) {
            throw error;
        }
    };
}
