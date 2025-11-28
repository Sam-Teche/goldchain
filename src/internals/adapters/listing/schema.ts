import mongoose, {Document, Model, Schema} from "mongoose";
import {IListing} from "../../domain/listing/listing";

export interface IListingDocument extends IListing, Document {
}

export type IListingModel = Model<IListingDocument>;

const ReportSchema = new Schema({
    reportedBy: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    reason: {
        type: String,
        required: true
    },
    description: { type: String, maxlength: 500 },
    reportedAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    }
});


const ListingSchema = new Schema(
    {
        seller: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
        buyerAccountType: {
            type: String,
            enum: ["offtaker", "exporter", "importer"],
        },
        information: {type: Schema.Types.Mixed, required: true},
        documents: {type: Schema.Types.Mixed, required: true},
        questions: {type: Schema.Types.Mixed, required: true},
        deliveryMethod: {type: String, enum: ['delivery', 'pickup'], required: true},
        deliveryInformation: {type: Schema.Types.Mixed, required: true},
        signatureUrl: {type: String, required: true},
        rating: {type: Number, default: 0},
        reviews: {type: Number, default: 0},
        reports: [ReportSchema],
        isReported: { type: Boolean, default: false },
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
    },
    {
        timestamps: true,
    });

ListingSchema.index({ isReported: 1 });
ListingSchema.index({ 'reports.status': 1 });

// Pre-save middleware to update isReported field
ListingSchema.pre('save', function(next) {
    this.isReported = this.reports && this.reports.length > 0;
    next();
});

export const ListingModel = mongoose.model<IListingDocument, IListingModel>('Listing', ListingSchema);


