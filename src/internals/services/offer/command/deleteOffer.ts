import {OfferRepository} from "../../../domain/offer/repository";

export class DeleteOffer {
    offerRepository: OfferRepository;

    constructor(
        offerRepository: OfferRepository,
    ) {
        this.offerRepository = offerRepository;
    }


    handle = async (offerId: string, accountId: string): Promise<void> => {
        try {
            await this.offerRepository.DeleteOffer(offerId, accountId)
        } catch (error) {
            throw error;
        }
    };
}
