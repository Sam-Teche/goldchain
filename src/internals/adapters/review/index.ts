import Filter from "../../../package/types/filter";
import {ReviewRepository} from "../../domain/review/repository";
import {IReview, ReferenceModel, Review, ReviewFilter} from "../../domain/review/review";
import {ReviewModel} from "./schema";
import {NotFoundError} from "../../../package/errors/customError";
import {ListingModel} from "../listing/schema";
import {AccountModel} from "../account/schema";
import mongoose from "mongoose";

export default class ReviewClass implements ReviewRepository {
    async Create(review: Omit<IReview, "createdAt" | "updatedAt">): Promise<void> {
        const reviewExist = await ReviewModel.findOne({
            reviewer: review.reviewer,
            listing: review.listing
        }).lean<Review>().exec();
        if (reviewExist) {
            await this.Update({_id: reviewExist._id, comment: review.comment, rating: review.rating})
            return
        }

        const newReview = await ReviewModel.create(review);
        await this.updateListingRating(newReview.listing as string);
    }

    async Update(review: Pick<Review, "_id" | "comment" | "rating">): Promise<void> {
        const existingReview = await ReviewModel.findById(review._id);
        if (!existingReview) {
            throw new NotFoundError("Review not found");
        }

        const result = await ReviewModel.updateOne(
            {_id: review._id},
            {
                comment: review.comment,
                rating: review.rating,
                updatedAt: new Date()
            }
        );

        if (result.matchedCount === 0) {
            throw new NotFoundError("Review not found");
        }

        await this.updateListingRating(existingReview.listing as string);
    }

    async Delete(listing: string, reviewer: string): Promise<void> {
        const reviewToDelete = await ReviewModel.findOne({listing, reviewer});
        if (!reviewToDelete) {
            throw new NotFoundError("Review does not exist");
        }

        const result = await ReviewModel.deleteOne({_id: reviewToDelete._id, reviewer});
        if (result.deletedCount === 0) {
            throw new NotFoundError("Review does not exist");
        }

        await this.updateListingRating(listing);
    }

    // async Get(filter: ReviewFilter): Promise<Review[]> {
    //     const limit = Number(filter.limit) || 20;
    //     const page = Number(filter.page) || 1;
    //     const skip = (page - 1) * limit;
    //     let query: any = {}
    //     if (filter.minRating !== undefined || filter.maxRating !== undefined) {
    //         query.rating = {};
    //         if (filter.minRating !== undefined) query.rating.$gte = filter.minRating;
    //         if (filter.maxRating !== undefined) query.rating.$lte = filter.maxRating;
    //     }
    //
    //     // If only listing is provided, get reviews for that specific listing
    //     if (filter.listing && !filter.account) {
    //
    //         return await ReviewModel.find({listing: filter.listing, ...query})
    //             .populate('listing')
    //             .populate('reviewer', 'profile')
    //             .sort('-createdAt')
    //             .skip(skip)
    //             .limit(limit)
    //             .lean<Review[]>()
    //             .exec();
    //     }
    //
    //     // If account is provided, need to find reviews for listings where account is the seller
    //     if (filter.account) {
    //         const pipeline: any[] = [
    //             // Lookup listing data to access seller information
    //             {
    //                 $lookup: {
    //                     from: 'listings',
    //                     localField: 'listing',
    //                     foreignField: '_id',
    //                     as: 'listingData'
    //                 }
    //             },
    //             {
    //                 $unwind: '$listingData'
    //             },
    //             // Match conditions
    //             {
    //                 $match: {
    //                     'listingData.seller': new mongoose.Types.ObjectId(filter.account),
    //                     // If both account and listing are provided, also filter by listing
    //                     ...(filter.listing && {listing: new mongoose.Types.ObjectId(filter.listing)}),
    //                 }
    //             },
    //             // Lookup reviewer data
    //             {
    //                 $lookup: {
    //                     from: 'accounts',
    //                     localField: 'reviewer',
    //                     foreignField: '_id',
    //                     as: 'reviewerData',
    //                     pipeline: [
    //                         {$project: {password: 0}}
    //                     ]
    //                 }
    //             },
    //             // Lookup full listing data for final result
    //             {
    //                 $lookup: {
    //                     from: 'listings',
    //                     localField: 'listing',
    //                     foreignField: '_id',
    //                     as: 'listingFullData'
    //                 }
    //             },
    //             // Sort by createdAt descending
    //             {
    //                 $sort: {createdAt: -1}
    //             },
    //             // Pagination
    //             {
    //                 $skip: skip
    //             },
    //             {
    //                 $limit: limit
    //             },
    //             // Project final structure
    //             {
    //                 $project: {
    //                     _id: 1,
    //                     listing: {$arrayElemAt: ['$listingFullData', 0]},
    //                     reviewer: {$arrayElemAt: ['$reviewerData', 0]},
    //                     comment: 1,
    //                     rating: 1,
    //                     createdAt: 1,
    //                     updatedAt: 1
    //                 }
    //             }
    //         ];
    //
    //         return await ReviewModel.aggregate(pipeline).exec();
    //     }
    //
    //     // If neither account nor listing is provided, return all reviews
    //     return await ReviewModel.find({})
    //         .populate('listing')
    //         .populate('reviewer', '-password')
    //         .sort('-createdAt')
    //         .skip(skip)
    //         .limit(limit)
    //         .lean<Review[]>()
    //         .exec();
    // }
    async Get(filter: ReviewFilter): Promise<Review[]> {
        const limit = Number(filter.limit) || 20;
        const page = Number(filter.page) || 1;
        const skip = (page - 1) * limit;

        // Build rating query
        let ratingQuery: any = {};
        if (filter.minRating !== undefined || filter.maxRating !== undefined) {
            ratingQuery.rating = {};
            if (filter.minRating !== undefined) ratingQuery.rating.$gte = filter.minRating;
            if (filter.maxRating !== undefined) ratingQuery.rating.$lte = filter.maxRating;
        }

        // If only listing is provided, get reviews for that specific listing
        if (filter.listing && !filter.account) {
            const query = {
                listing: filter.listing,
                ...ratingQuery
            };

            return await ReviewModel.find(query)
                .populate('listing')
                .populate('reviewer', 'profile')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .lean<Review[]>()
                .exec();
        }

        // If account is provided, need to find reviews for listings where account is the seller
        if (filter.account) {
            const matchConditions: any = {
                'listingData.seller': new mongoose.Types.ObjectId(filter.account),
                // If both account and listing are provided, also filter by listing
                ...(filter.listing && {listing: new mongoose.Types.ObjectId(filter.listing)})
            };

            // Add rating filters separately for aggregation
            if (filter.minRating !== undefined || filter.maxRating !== undefined) {
                matchConditions.rating = {};
                if (filter.minRating !== undefined) matchConditions.rating.$gte = filter.minRating;
                if (filter.maxRating !== undefined) matchConditions.rating.$lte = filter.maxRating;
            }

            const pipeline: any[] = [
                // Lookup listing data to access seller information
                {
                    $lookup: {
                        from: 'listings',
                        localField: 'listing',
                        foreignField: '_id',
                        as: 'listingData'
                    }
                },
                {
                    $unwind: '$listingData'
                },
                // Match conditions
                {
                    $match: matchConditions
                },
                // Lookup reviewer data
                {
                    $lookup: {
                        from: 'accounts',
                        localField: 'reviewer',
                        foreignField: '_id',
                        as: 'reviewerData',
                        pipeline: [
                            {$project: {profile: 1}}
                        ]
                    }
                },
                // Lookup full listing data for final result
                {
                    $lookup: {
                        from: 'listings',
                        localField: 'listing',
                        foreignField: '_id',
                        as: 'listingFullData'
                    }
                },
                // Sort by createdAt descending
                {
                    $sort: {createdAt: -1}
                },
                // Pagination
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                // Project final structure
                {
                    $project: {
                        _id: 1,
                        listing: {$arrayElemAt: ['$listingFullData', 0]},
                        reviewer: {$arrayElemAt: ['$reviewerData', 0]},
                        comment: 1,
                        rating: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ];

            return await ReviewModel.aggregate(pipeline).exec();
        }

        // If neither account nor listing is provided, return all reviews
        const query = {...ratingQuery};

        return await ReviewModel.find(query)
            .populate('listing')
            .populate('reviewer', 'profile')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean<Review[]>()
            .exec();
    }

    private async updateListingRating(listing: string): Promise<void> {
        try {
            const ratingStats = await ReviewModel.aggregate([
                {$match: {listing}},
                {
                    $group: {
                        _id: null,
                        averageRating: {$avg: "$rating"},
                        totalReviews: {$sum: 1}
                    }
                }
            ]);

            let newRating = 0;

            if (ratingStats.length > 0 && ratingStats[0].totalReviews > 0) {
                newRating = Math.round(ratingStats[0].averageRating * 10) / 10;
            }

            const updateResult = await ListingModel.updateOne(
                {_id: listing},
                {
                    rating: newRating,
                    reviews: ratingStats[0].totalReviews,
                }
            );

            if (updateResult.matchedCount === 0) {
                throw new NotFoundError("Listing not found");
            }
        } catch (error) {
            console.error(`Error updating rating for listing ${listing}:`, error);
        }
    }

    async GetListingAverageRating(listing: string): Promise<number> {
        const ratingStats = await ReviewModel.aggregate([
            {$match: {listing}},
            {
                $group: {
                    _id: null,
                    averageRating: {$avg: "$rating"},
                    totalReviews: {$sum: 1}
                }
            }
        ]);

        if (ratingStats.length === 0 || ratingStats[0].totalReviews === 0) {
            return 0;
        }

        return Math.round(ratingStats[0].averageRating * 10) / 10;
    }

    async GetReviewStats(listing?: string, account?: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: { [key: number]: number };
    }> {
        let pipeline: any[] = [];

        // If account is provided, need to filter by listings where account is the seller
        if (account) {
            pipeline.push(
                // Lookup listing data to access seller information
                {
                    $lookup: {
                        from: 'listings',
                        localField: 'listing',
                        foreignField: '_id',
                        as: 'listingData'
                    }
                },
                {
                    $unwind: '$listingData'
                },
                // Match listings where account is the seller
                {
                    $match: {
                        'listingData.seller': new mongoose.Types.ObjectId(account),
                        // If both account and listing are provided, also filter by listing
                        ...(listing && {listing: new mongoose.Types.ObjectId(listing)})
                    }
                }
            );
        } else if (listing) {
            // If only listing is provided, filter by listing directly
            pipeline.push({
                $match: {
                    listing: new mongoose.Types.ObjectId(listing)
                }
            });
        }

        // Add aggregation stages to calculate statistics
        pipeline.push(
            // Group to calculate stats
            {
                $group: {
                    _id: null,
                    totalReviews: {$sum: 1},
                    averageRating: {$avg: '$rating'},
                    ratings: {$push: '$rating'}
                }
            },
            // Unwind ratings to count distribution
            {
                $unwind: '$ratings'
            },
            // Group again to count rating distribution
            {
                $group: {
                    _id: {
                        totalReviews: '$totalReviews',
                        averageRating: '$averageRating'
                    },
                    ratingCounts: {
                        $push: {
                            rating: '$ratings',
                            count: 1
                        }
                    }
                }
            },
            // Group by rating to get distribution
            {
                $unwind: '$ratingCounts'
            },
            {
                $group: {
                    _id: {
                        totalReviews: '$_id.totalReviews',
                        averageRating: '$_id.averageRating',
                        rating: '$ratingCounts.rating'
                    },
                    count: {$sum: 1}
                }
            },
            // Group final result
            {
                $group: {
                    _id: {
                        totalReviews: '$_id.totalReviews',
                        averageRating: '$_id.averageRating'
                    },
                    distribution: {
                        $push: {
                            rating: '$_id.rating',
                            count: '$count'
                        }
                    }
                }
            }
        );

        const result = await ReviewModel.aggregate(pipeline).exec();

        // Handle empty results
        if (!result.length) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            };
        }

        const stats = result[0];

        // Build rating distribution object (1-5 stars)
        const ratingDistribution: { [key: number]: number } = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

        stats.distribution.forEach((item: { rating: number; count: number }) => {
            ratingDistribution[item.rating] = item.count;
        });

        return {
            averageRating: Math.round((stats._id.averageRating || 0) * 100) / 100, // Round to 2 decimal places
            totalReviews: stats._id.totalReviews || 0,
            ratingDistribution
        };
    }
}