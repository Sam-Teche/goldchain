import {IReview, ReferenceModel, Review, ReviewFilter} from "./review";
import Filter from "../../../package/types/filter";

export interface ReviewRepository {
    Create: (review: Omit<IReview, "createdAt" | "updatedAt">) => Promise<void>
    Update: (review: Pick<Review, "_id" | "comment" | "rating">) => Promise<void>
    Delete: (listing: string, reviewer: string) => Promise<void>
    Get: (filter: ReviewFilter) => Promise<Review[]>
    GetListingAverageRating: (listing: string) => Promise<number>
    GetReviewStats: (listing?: string, account?: string) => Promise<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: { [key: number]: number };
    }>
}