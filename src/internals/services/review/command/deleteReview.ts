import {ReviewRepository} from "../../../domain/review/repository";
import {ReferenceModel} from "../../../domain/review/review";

export class DeleteReview {
    reviewRepository: ReviewRepository;

    constructor(
        reviewRepository: ReviewRepository,
    ) {
        this.reviewRepository = reviewRepository;
    }


    handle = async (listing: string, reviewer: string): Promise<void> => {
        await this.reviewRepository.Delete(listing, reviewer)
    };
}
