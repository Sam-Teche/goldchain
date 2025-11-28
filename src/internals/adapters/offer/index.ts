import Status from "../../../package/types/status";
import {OfferRepository} from "../../domain/offer/repository";
import {IOffer, OfferFilter} from "../../domain/offer/offer";
import {OfferModel} from "./schema";
import {ListingModel} from "../listing/schema";
import {Listing} from "../../domain/listing/listing";
import {NotFoundError} from "../../../package/errors/customError";

export default class OfferClass implements OfferRepository {
    async AddOffer(buyerId: string, createdBy: string, listingId: string, amount: number, expiresAt: Date, original?: string): Promise<void> {
        await OfferModel.updateOne(
            {buyer: buyerId, listing: listingId, createdBy, status: "pending"},
            {
                $set: {amount, expiresAt, original}
            },
            {upsert: true}
        );
    }

    async UpdateOfferStatus(offerId: string, status: Status): Promise<void> {
        await OfferModel.updateOne(
            {_id: offerId},
            {
                $set: {
                    status: status
                }
            },
        );
    }

    async DeleteOffer(offerId: string, buyerId: string): Promise<void> {
        await OfferModel.deleteOne({_id: offerId, buyer: buyerId});
    }

    async GetOffers(filter: OfferFilter): Promise<IOffer[]> {
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
                amount: 1,
                status: 1,
                expiresAt: 1,
                createdBy: 1,
                createdAt: 1,
                updatedAt: 1,
                original: 1
            }
        });

        return await OfferModel.aggregate(pipeline).exec();
    }

    async GetOfferWithProfile(offerId: string): Promise<IOffer> {
        let offer = await OfferModel.findOne({_id: offerId})
            .populate('listing', )
            .populate('buyer', '-password')
            .select("-__v")
            .lean<IOffer>()
            .exec();

        if (!offer) throw new NotFoundError("offer does not exist")

        return offer
    }

    async GetOffer(offerId: string): Promise<IOffer> {
        let offer = await OfferModel.findOne({_id: offerId})
            .select("-__v")
            .lean<IOffer>()
            .exec();

        if (!offer) throw new NotFoundError("offer does not exist")

        return offer
    }
}
