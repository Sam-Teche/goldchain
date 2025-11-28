
import mongoose, {Document, Model, Schema} from "mongoose";
import {IAdmin} from "../../domain/admin/admin";

export interface IAdminDocument extends IAdmin, Document {
}

export type IAdminModel = Model<IAdminDocument>;

const AdminSchema = new Schema<IAdminDocument>(
    {
        email: {type: String, required: true, unique: true, lowercase: true},
        fullName: {type: String, required: true},
        profilePicture: {type: String},
        password: {type: String, required: true},
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "banned"],
            default: "approved",
        },
        roles: {
            type: [String],
            enum: ["viewer", "sales", "hr", "super"],
            default: ["viewer"],
        },
        isAdmin: {type: Boolean, default: true},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
    },
    {
        timestamps: true,
    }
);
export const AdminModel = mongoose.model<IAdminDocument, IAdminModel>("Admin", AdminSchema);





