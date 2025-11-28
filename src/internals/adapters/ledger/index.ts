import {AddLedgerParameters, Ledger, LedgerFilter} from "../../domain/ledger/ledger";
import {LedgerRepository} from "../../domain/ledger/repository";
import {LedgerModel} from "./schema";
import {NotFoundError} from "../../../package/errors/customError";
import mongoose from "mongoose";

export default class LedgerClass implements LedgerRepository {
    async AddLedger(ledger: AddLedgerParameters): Promise<void> {
        await LedgerModel.create(ledger)
    };

    async UpdateLedger(ledgerId: string, ledger: Partial<Ledger>): Promise<void> {
        const result = await LedgerModel.updateOne({_id: ledgerId}, {$set: ledger}).exec();
        if (result.matchedCount === 0) {
            throw new NotFoundError("listing does not exist");
        }
    };

    async DeleteLedger(ledgerId: string): Promise<void> {
        const result = await LedgerModel.deleteOne({_id: ledgerId});
        if (result.deletedCount === 0) {
            throw new NotFoundError("listing does not exist");
        }
    };

    async GetLedgers(filter: LedgerFilter): Promise<Ledger[]> {
        const query: any = {};

        // If filter.account is provided, find ledgers where account is either buyer or seller
        if (filter.account) {
            query.$or = [
                {buyer: filter.account},
                {seller: filter.account}
            ];
        }

        if (filter.status) query.status = filter.status;
        if (filter.trackingId) query.trackingId = filter.trackingId;
        if (filter.hash) query.hash = filter.hash;
        if (filter.reference) query.reference = filter.reference;

        if (filter.startDate) query.createdAt = {$gte: filter.startDate};
        if (filter.endDate) query.createdAt = {$lte: filter.endDate, ...query.createdAt};

        if (filter.searchTerm) {
            // If there's already an $or from filter.account, combine with AND
            const searchConditions = [
                {'status': new RegExp(filter.searchTerm, 'i')},
                {'trackingId': new RegExp(filter.searchTerm, 'i')},
                {'hash': new RegExp(filter.searchTerm, 'i')},
                {'reference': new RegExp(filter.searchTerm, 'i')},
                {'listing.information.lotNumber': new RegExp(filter.searchTerm, 'i')},
                {'listing.information.sourceMineSite': new RegExp(filter.searchTerm, 'i')},
                {'listing.information.sourceCountry': new RegExp(filter.searchTerm, 'i')},
                {'listing.deliveryInformation.city': new RegExp(filter.searchTerm, 'i')},
                {'listing.deliveryInformation.state': new RegExp(filter.searchTerm, 'i')},
                {'seller.profile.fullName': new RegExp(filter.searchTerm, 'i')},
                {'seller.profile.companyName': new RegExp(filter.searchTerm, 'i')},
                {'buyer.profile.fullName': new RegExp(filter.searchTerm, 'i')},
                {'buyer.profile.companyName': new RegExp(filter.searchTerm, 'i')}
            ];

            if (query.$or) {
                // Combine account filter with search term using $and
                query.$and = [
                    {$or: query.$or}, // account condition
                    {$or: searchConditions} // search term condition
                ];
                delete query.$or;
            } else {
                query.$or = searchConditions;
            }
        }

        const limit = Number(filter.limit) || 20;
        const page = Number(filter.page) || 1;
        const skip = (page - 1) * limit;

        return await LedgerModel.find(query)
            .populate('seller', 'profile')
            .populate('buyer', 'profile')
            .populate('offer')
            .populate('request')
            .populate('listing')
            .sort("-updatedAt")
            .skip(skip)
            .limit(limit)
            .lean<Ledger[]>()
            .exec();
    };

    async GetLedger(ledgerId?: string, reference?: string): Promise<Ledger> {
        let query: any = {}
        if (ledgerId) query._id = ledgerId
        if (reference) query.reference = reference
        const ledger = await LedgerModel.findOne(query)
            .populate('seller', '-password')
            .lean<Ledger>()
            .exec();

        if (!ledger) {
            throw new NotFoundError("ledger does not exist");
        }

        return ledger;
    };

    async GetLedgerAnalytics(accountId: string): Promise<{ totalTransactions: number; totalSales: number }> {
        const pipeline = [
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                {buyer: new mongoose.Types.ObjectId(accountId)},
                                {seller: new mongoose.Types.ObjectId(accountId)}
                            ]
                        },
                        {status: {$ne: "canceled"}}
                    ]
                }
            },
            // Lookup offer data to get amount
            {
                $lookup: {
                    from: 'offers',
                    localField: 'offer',
                    foreignField: '_id',
                    as: 'offerData'
                }
            },
            // Lookup request data to get listedPrice
            {
                $lookup: {
                    from: 'requests',
                    localField: 'request',
                    foreignField: '_id',
                    as: 'requestData'
                }
            },
            // Add a field to determine the transaction amount
            {
                $addFields: {
                    transactionAmount: {
                        $cond: {
                            if: {$gt: [{$size: "$offerData"}, 0]},
                            then: {$arrayElemAt: ["$offerData.amount", 0]},
                            else: {
                                $cond: {
                                    if: {$gt: [{$size: "$requestData"}, 0]},
                                    then: {$arrayElemAt: ["$requestData.listedPrice", 0]},
                                    else: 0
                                }
                            }
                        }
                    }
                }
            },
            // Group to calculate totals
            {
                $group: {
                    _id: null,
                    totalTransactions: {$sum: 1},
                    totalSales: {$sum: "$transactionAmount"}
                }
            }
        ];

        const result = await LedgerModel.aggregate(pipeline);

        return result.length > 0
            ? {
                totalTransactions: result[0].totalTransactions,
                totalSales: result[0].totalSales
            }
            : {
                totalTransactions: 0,
                totalSales: 0
            };
    }


}