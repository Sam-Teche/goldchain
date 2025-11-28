import mongoose, {Document, Schema} from "mongoose";
import {IOffer} from "../../domain/offer/offer";

export interface IOfferDocument extends IOffer, Document {
}

const OfferSchema = new Schema({
        buyer: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
        listing: {type: Schema.Types.ObjectId, ref: 'Listing', required: true},
        amount: {type: Number, required: true},
        status: {
            type: String,
            enum: ['accepted', 'rejected', 'pending', 'cancelled', 'expired', 'countered', 'completed'],
            default: "pending"
        },
        expiresAt: {type: Date, required: true, index: true},
        createdBy: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
        original: {type: Schema.Types.ObjectId, ref: 'Offer'},
    },
    {
        timestamps: true,
    }
);

export const OfferModel = mongoose.model<IOfferDocument>('Offer', OfferSchema);