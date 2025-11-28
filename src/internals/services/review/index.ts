import {AccountRepository} from "../../domain/account/repository";
import {CreateReview} from "./command/createReview";
import {ReviewRepository} from "../../domain/review/repository";
import {GetReviews} from "./queries/getReviews";
import {DeleteReview} from "./command/deleteReview";

class Commands {
    createReview: CreateReview
    deleteReview: DeleteReview

    constructor(
        reviewRepository: ReviewRepository,
    ) {
        this.createReview = new CreateReview(reviewRepository)
        this.deleteReview = new DeleteReview(reviewRepository)
    }
}

class Queries {
    getReviews: GetReviews

    constructor(reviewRepository: ReviewRepository) {
        this.getReviews = new GetReviews(reviewRepository)
    }
}

class ReviewServices {
    commands: Commands
    queries: Queries

    constructor(
        reviewRepository: ReviewRepository,
    ) {
        this.commands = new Commands(reviewRepository)
        this.queries = new Queries(reviewRepository)
    }
}

export default ReviewServices