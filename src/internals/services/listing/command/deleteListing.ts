import {ListingRepository} from "../../../domain/listing/repository";
import {Listing, ListingFilter} from "../../../domain/listing/listing";

export class DeleteListing {
    listingRepository: ListingRepository;

    constructor(
        listingRepository: ListingRepository,
    ) {
        this.listingRepository = listingRepository;
    }


    handle = async (listingId: string, seller: string): Promise<void> => {
        try {
            await this.listingRepository.DeleteListing(listingId, seller)
        } catch (error) {
            throw error;
        }
    };
}
