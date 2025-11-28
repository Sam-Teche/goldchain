import mongoose, {Document, Schema} from "mongoose";
import {IRequest} from "../../domain/request/request";

export interface IRequestDocument extends IRequest, Document {
}

const RequestSchema = new Schema({
        buyer: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
        listing: {type: Schema.Types.ObjectId, ref: 'Listing', required: true},
        listedPrice: {type: Number, required: true},
        status: {type: String, enum: ['accepted', 'rejected', 'pending', 'cancelled', 'expired', 'completed'], default: "pending"},
        expiresAt: {type: Date, required: true, index: true},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
    },
    {
        timestamps: true,
    }
);

export const RequestModel = mongoose.model<IRequestDocument>('Request', RequestSchema);