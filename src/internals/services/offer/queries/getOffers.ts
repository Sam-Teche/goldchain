import {OfferRepository} from "../../../domain/offer/repository";
import {IOffer, OfferFilter} from "../../../domain/offer/offer";

export class GetOffers {
    offerRepository: OfferRepository;

    constructor(
        offerRepository: OfferRepository,
    ) {
        this.offerRepository = offerRepository;
    }


    handle = async (filter: OfferFilter): Promise<IOffer[]> => {
        try {
            return await this.offerRepository.GetOffers(filter)
        } catch (error) {
            throw error;
        }
    };
}
