import Status from "../../../package/types/status";
import {RequestRepository} from "../../domain/request/repository";
import {IRequest, RequestFilter} from "../../domain/request/request";
import {RequestModel} from "./schema";
import {ListingModel} from "../listing/schema";
import {Listing} from "../../domain/listing/listing";
import {NotFoundError} from "../../../package/errors/customError";
import {IOffer, OfferFilter} from "../../domain/offer/offer";
import {OfferModel} from "../offer/schema";

export default class RequestClass implements RequestRepository {
    async AddRequest(buyerId: string, listingId: string, expiresAt: Date): Promise<void> {
        const listing = await ListingModel.findOne({_id: listingId})
            .select("information.price")
            .lean<Listing>()
            .exec();
        if (!listing) throw new NotFoundError("listing does not exist")

        await RequestModel.updateOne(
            {buyer: buyerId, listing: listingId, status: "pending"},
            {
                $set: {
                    listedPrice: listing.information.price,
                    expiresAt
                }
            },
            {upsert: true}
        );
    }

    async UpdateRequestStatus(requestId: string, status: Status): Promise<void> {
        await RequestModel.updateOne(
            {_id: requestId},
            {
                $set: {
                    status: status
                }
            },
        );
    }

    async DeleteRequest(requestId: string, buyerId: string): Promise<void> {
        await RequestModel.deleteOne({_id: requestId, buyer: buyerId});
    }

    async GetRequests(filter: RequestFilter): Promise<IRequest[]> {
        let sortOrder = "-"
        if (filter.sortOrder == "ascending") {
            sortOrder = ""
        }
        let sortBy = "updatedAt"
        if (filter.sortBy == "amount") {
            sortBy = "listedPrice"
        }
        let sort = sortOrder + sortBy

        const limit = Number(filter.limit) || 20;
        const page = Number(filter.page) || 1;
        const skip = (page - 1) * limit;

        // Build aggregation pipeline
        const pipeline: any[] = [];

        // Lookup listing data to access seller information
        pipeline.push({
            $lookup: {
                from: 'listings',
                localField: 'listing',
                foreignField: '_id',
                as: 'listingData'
            }
        });

        pipeline.push({
            $unwind: '$listingData'
        });

        // Build match conditions
        const matchConditions: any = {};

        // If filter.buyer is provided, find offers where user is either buyer or listing seller
        if (filter.buyer) {
            matchConditions.$or = [
                {buyer: filter.buyer},
                {'listingData.seller': filter.buyer}
            ];
        }

        if (filter.listing) matchConditions.listing = filter.listing;
        if (filter.status) matchConditions.status = filter.status;

        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({$match: matchConditions});
        }

        // Add sorting
        const sortObj: any = {};
        sortObj[sortBy] = sortOrder === "-" ? -1 : 1;
        pipeline.push({$sort: sortObj});

        // Add pagination
        pipeline.push({$skip: skip});
        pipeline.push({$limit: limit});

        // Lookup buyer data
        pipeline.push({
            $lookup: {
                from: 'accounts',
                localField: 'buyer',
                foreignField: '_id',
                as: 'buyerData',
                pipeline: [
                    {$project: {'password': 0}}
                    // { $project: { 'profile.companyName': 1, 'profile.fullName': 1 } }
                ]
            }
        });

        // Lookup full listing data for final result
        pipeline.push({
            $lookup: {
                from: 'listings',
                localField: 'listing',
                foreignField: '_id',
                as: 'listingFullData',
                pipeline: [
                    // {$project: {'information.price': 1}}
                ]
            }
        });

        // Project final structure
        pipeline.push({
            $project: {
                _id: 1,
                buyer: {$arrayElemAt: ['$buyerData', 0]},
                listing: {$arrayElemAt: ['$listingFullData', 0]},
                listedPrice: 1,
                status: 1,
                expiresAt: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        });

        return await RequestModel.aggregate(pipeline).exec();
    }

    // async GetRequests(filter: RequestFilter): Promise<IRequest[]> {
    //     const query: any = {};
    //
    //     if (filter.buyer) query.buyer = filter.buyer;
    //     if (filter.listing) query.listing = filter.listing;
    //     if (filter.status) query.status = filter.status;
    //
    //
    //     let sortOrder = "-"
    //     if (filter.sortOrder == "ascending") {
    //         sortOrder = ""
    //     }
    //     let sortBy = "updatedAt"
    //     if (filter.sortBy == "amount") {
    //         sortBy = "listedPrice"
    //     }
    //     let sort = sortOrder + sortBy
    //
    //     const limit = Number(filter.limit) || 20;
    //     const page = Number(filter.page) || 1;
    //     const skip = (page - 1) * limit;
    //
    //     return await RequestModel.find(query)
    //         .populate('buyer', '-password')
    //         .sort(sort)
    //         .select("-__v")
    //         .skip(skip)
    //         .limit(limit)
    //         .lean<IRequest[]>()
    //         .exec();
    // }

    async GetRequest(requestId: string): Promise<IRequest> {
        let request = await RequestModel.findOne({_id: requestId})
            .populate('buyer', '-password')
            .select("-__v")
            .lean<IRequest>()
            .exec();

        if (!request) throw new NotFoundError("request does not exist")

        return request
    }
}
