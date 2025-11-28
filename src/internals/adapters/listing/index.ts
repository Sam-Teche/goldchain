import {
    IListing,
    Listing,
    ListingFilter,
    ReportedListingsFilter,
    ReportListingParameters
} from "../../domain/listing/listing";
import {ListingRepository} from "../../domain/listing/repository";
import {ListingModel} from "./schema";
import {NotFoundError} from "../../../package/errors/customError";
import mongoose from "mongoose";

export default class ListingClass implements ListingRepository {
    async CreateListing(listing: Omit<IListing, "createdAt" | "updatedAt" | "rating" | "reviews" | "reports" | "isReported">): Promise<string> {
        let newListing = await ListingModel.create(listing)
        return newListing.id
    }

    async UpdateListing(listingId: string, listing: Partial<IListing>): Promise<void> {
        const result = await ListingModel.updateOne({_id: listingId}, {$set: listing}).exec();
        if (result.matchedCount === 0) {
            throw new NotFoundError("listing does not exist");
        }
    }

    async DeleteListing(listingId: string, seller: string): Promise<void> {
        const result = await ListingModel.deleteOne({_id: listingId, seller});
        if (result.deletedCount === 0) {
            throw new NotFoundError("listing does not exist");
        }
    }

    async GetListings(filter: ListingFilter): Promise<Listing[]> {
        const query: any = {};

        if (filter.seller) query.seller = filter.seller;
        if (filter.buyerAccountType) query.buyerAccountType = filter.buyerAccountType;

        if (filter.deliveryMethod) query.deliveryMethod = filter.deliveryMethod;

        if (filter.startDate) query.createdAt = {$gte: filter.startDate};
        if (filter.endDate) query.createdAt = {$lte: filter.endDate, ...query.createdAt};

        if (filter.searchTerm) {
            const regex = new RegExp(filter.searchTerm, 'i');
            query.$or = [
                {'information.lotNumber': regex},
                {'information.sourceMineSite': regex},
                {'information.sourceCountry': regex},
                {'deliveryInformation.city': regex},
                {'deliveryInformation.state': regex},
                {'seller.profile.fullName': regex},
                {'seller.profile.companyName': regex}
            ];
        }

        if (filter.minRating !== undefined) query.rating.$gte = filter.minRating;
        if (filter.maxRating !== undefined) query.rating.$lte = filter.maxRating;

        const limit = Number(filter.limit) || 20;
        const page = Number(filter.page) || 1;
        const skip = (page - 1) * limit;

        return await ListingModel.find(query)
            .populate('seller', 'profile')
            .sort("-updatedAt")
            .select("-questions -deliveryInformation -signatureUrl -buyerAccountType -__v")
            .skip(skip)
            .limit(limit)
            .lean<Listing[]>()
            .exec();
    }

    async GetListingWithProfile(listingId: string, seller?: string): Promise<Listing> {
        let query: any = {_id: listingId}
        if (seller) query.seller = seller
        const listing = await ListingModel.findOne(query)
            .populate('seller', '-password')
            .lean<Listing>()
            .exec();

        if (!listing) {
            throw new NotFoundError("listing does not exist");
        }

        return listing;
    }

    async GetListing(listingId: string): Promise<Listing> {
        const listing = await ListingModel.findOne({_id: listingId})
            .lean<Listing>()
            .exec();

        if (!listing) {
            throw new NotFoundError("listing does not exist");
        }

        return listing;
    }

    async GetListingAnalytics(accountId: string): Promise<{ averagePricePerGram: number, totalWeight: number }> {
        const pipeline = [
            {
                $match: {
                    seller: new mongoose.Types.ObjectId(accountId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalWeight: {
                        $sum: {
                            $convert: {
                                input: "$information.lotWeight",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    },
                    totalPricePerGram: {
                        $sum: {
                            $convert: {
                                input: "$information.pricePerGram",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    },
                    listingCount: {$sum: 1}
                }
            },
            {
                $project: {
                    totalWeight: 1,
                    averagePricePerGram: {
                        $cond: {
                            if: {$gt: ["$listingCount", 0]},
                            then: {$divide: ["$totalPricePerGram", "$listingCount"]},
                            else: 0
                        }
                    }
                }
            }
        ];

        const result = await ListingModel.aggregate(pipeline);

        return result.length > 0
            ? {
                averagePricePerGram: Math.round((result[0].averagePricePerGram || 0) * 100) / 100,
                totalWeight: Math.round((result[0].totalWeight || 0) * 100) / 100
            }
            : {averagePricePerGram: 0, totalWeight: 0};
    }

    async ReportListing(parameters: ReportListingParameters): Promise<void> {
        const {listingId, reportedBy, reason, description} = parameters;

        const listing = await ListingModel.findById(listingId);
        if (!listing) {
            throw new Error('Listing not found');
        }

        const existingReport = listing.reports.find(
            report => report.reportedBy.toString() === reportedBy
        );

        if (existingReport) {
            throw new Error('You have already reported this listing');
        }

        listing.reports.push({
            reportedBy: reportedBy,
            reason,
            description,
            reportedAt: new Date(),
            status: 'pending'
        });

        await listing.save();
    };

    async GetReportedListings(query: ReportedListingsFilter): Promise<Listing[]> {
        const {
            status,
            reason,
            page = 1,
            limit = 20,
            sortBy = 'reportedAt',
            sortOrder = 'desc'
        } = query;

        // Build filter
        const filter: any = {isReported: true};

        if (status) {
            filter['reports.status'] = status;
        }

        if (reason) {
            filter['reports.reason'] = reason;
        }

        // Build sort
        const sort: any = {};
        if (sortBy === 'reportedAt') {
            sort['reports.reportedAt'] = (sortOrder === 'asc' || sortOrder === 'ascending') ? 1 : -1;
        } else {
            sort[sortBy] = (sortOrder === 'asc' || sortOrder === 'ascending') ? 1 : -1;
        }

        const skip = (page - 1) * limit;

        return await ListingModel
            .find(filter)
            .populate('seller', '-password')
            .populate('reports')
            .populate('reports.reportedBy', '-password')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean<Listing[]>()
            .exec()
    }
}
