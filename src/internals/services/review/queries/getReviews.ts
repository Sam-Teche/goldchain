import {ReviewRepository} from "../../../domain/review/repository";
import {ReferenceModel, Review, ReviewFilter} from "../../../domain/review/review";
import Filter from "../../../../package/types/filter";

export class GetReviews {
    reviewRepository: ReviewRepository;

    constructor(
        reviewRepository: ReviewRepository,
    ) {
        this.reviewRepository = reviewRepository;
    }


    handle = async (filter: ReviewFilter): Promise<{
        reviews: Review[],
        statistics: { averageRating: number, totalReviews: number, ratingDistribution: { [p: number]: number } }
    }> => {
        let reviews = await this.reviewRepository.Get(filter)
        let statistics = await this.reviewRepository.GetReviewStats(filter.listing,filter.account)
        return {reviews, statistics}
    };
}
