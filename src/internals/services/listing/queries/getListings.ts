import {ListingRepository} from "../../../domain/listing/repository";
import {Listing, ListingFilter} from "../../../domain/listing/listing";

export class GetListings {
    listingRepository: ListingRepository;

    constructor(
        listingRepository: ListingRepository,
    ) {
        this.listingRepository = listingRepository;
    }


    handle = async (filter: ListingFilter): Promise<Listing[]> => {
        try {
            return await this.listingRepository.GetListings(filter)
        } catch (error) {
            throw error;
        }
    };
}
