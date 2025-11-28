import {ListingRepository} from "../../../domain/listing/repository";
import {Listing, ListingFilter} from "../../../domain/listing/listing";

export class GetListing {
    listingRepository: ListingRepository;

    constructor(
        listingRepository: ListingRepository,
    ) {
        this.listingRepository = listingRepository;
    }


    handle = async (listingId: string, seller?: string): Promise<Listing> => {
        try {
            return await this.listingRepository.GetListingWithProfile(listingId, seller)
        } catch (error) {
            throw error;
        }
    };
}
