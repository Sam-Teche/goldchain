import mongoose, {Document, Model, Schema} from "mongoose";
import {IAccount} from "../../domain/account/account";

export interface IAccountDocument extends IAccount, Document {
}


export type IAccountModel = Model<IAccountDocument>;

const PaymentMethodSchema = new Schema(
    {
        type: {
            type: String,
            required: true,
            enum: [
                "airtm",
                "bank-transfer",
                "bitcoin",
                "mpesa",
                "momo",
                "tether",
                "world-remit",
            ],
        },

        email: String,
        accountHolder: String,
        bankName: String,
        accountNumber: String,
        swiftCode: String,
        currency: String,
        country: String,
        address: String,
        network: String,
        countryCode: String,
        mobileNumber: String,
        fullName: String,
        pickupCity: String,
    },
    {_id: false}
);

const AccountSchema = new Schema<IAccountDocument>(
    {
        email: {type: String, required: true, unique: true, lowercase: true},
        password: {type: String, required: true},
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "banned"],
            default: "pending",
        },
        type: {
            type: String,
            enum: ["source", "exporter", "importer", "offtaker"],
        },
        profile: {type: Schema.Types.Mixed},
        documents: {type: Schema.Types.Mixed},
        questions: {type: Schema.Types.Mixed},
        paymentMethods: {type: [PaymentMethodSchema], default: []},
        emailVerified: {type: Boolean, default: false},
        activated: {type: Boolean, default: false},
        activationReference: {type: String},
        rating: {type: Number, default: 0},
        reviews: {type: Number, default: 0},
        profilePicture: {type: String},
        description: {type: String},
        approvedAt: {type: Date},
        activatedAt: {type: Date},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
    },
    {
        timestamps: true,
    }
);
export const AccountModel = mongoose.model<IAccountDocument, IAccountModel>("Account", AccountSchema);


