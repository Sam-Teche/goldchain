import mongoose, {Document, Model, Schema} from "mongoose";
import {ILedger} from "../../domain/ledger/ledger";

export interface ILedgerDocument extends ILedger, Document {
}

export type ILedgerModel = Model<ILedgerDocument>;

const LedgerSchema = new Schema(
    {
        trackingId: {type: String, required: true},
        hash: {type: String, required: true},
        reference: {type: String, required: true},
        // status: {type: String, enum: ["pending", "transit", "delivered", "completed", "canceled"], default: "pending"},
        status: {type: String, default: "pending"},
        buyer: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
        seller: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
        listing: {type: Schema.Types.ObjectId, ref: 'Listing', required: true},
        offer: {type: Schema.Types.ObjectId, ref: 'Offer'},
        request: {type: Schema.Types.ObjectId, ref: 'Request'},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
    },
    {
        timestamps: true,
    });

export const LedgerModel = mongoose.model<ILedgerDocument, ILedgerModel>('Ledger', LedgerSchema);


