import {OfferRepository} from "../../../domain/offer/repository";
import {IOffer} from "../../../domain/offer/offer";

export class GetOffer {
    offerRepository: OfferRepository;

    constructor(
        offerRepository: OfferRepository,
    ) {
        this.offerRepository = offerRepository;
    }


    handle = async (offerId: string): Promise<IOffer> => {
        try {
            return await this.offerRepository.GetOfferWithProfile(offerId)
        } catch (error) {
            throw error;
        }
    };
}
