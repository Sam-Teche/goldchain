import mongoose, {Document, Model, Schema} from "mongoose";
import {IReview} from "../../domain/review/review";

export interface IReviewDocument extends IReview, Document {
}

export type IReviewModel = Model<IReviewDocument>;

const ReviewSchema = new Schema(
    {
        listing: {type: Schema.Types.ObjectId, ref: 'Listing', required: true},
        reviewer: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
        comment: {type: String, required: true},
        rating: {type: Number, required: true},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
    },
    {
        timestamps: true,
    });

export const ReviewModel = mongoose.model<IReviewDocument, IReviewModel>('Review', ReviewSchema);

