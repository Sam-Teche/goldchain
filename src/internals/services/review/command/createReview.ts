import {
    ReviewRepository
} from "../../../domain/review/repository";
import {
    IReview,
} from "../../../domain/review/review";


export class CreateReview {
    reviewRepository: ReviewRepository;

    constructor(
        reviewRepository: ReviewRepository,
    ) {
        this.reviewRepository = reviewRepository;
    }

    handle = async (review: Omit<IReview, "createdAt" | "updatedAt">): Promise<void> => {
        await this.reviewRepository.Create(review)
    };
}

