import mongoose, {Document, Model, Schema} from "mongoose";
import {IOTP} from "../../domain/otp/otp";

export interface IOTPDocument extends IOTP, Document {
}

const OTPSchema = new Schema({
    account: { type: Schema.Types.ObjectId, required: true, index: true, refPath: 'accountModel' },
    accountModel: { type: String, required: true, enum: ['Account', 'Admin'] },
    otp: { type: String, required: true },
    type: { type: String, enum: ['email_verification', 'password_reset', 'login', '2fa'], required: true },
    expiresAt: { type: Date, required: true, index: true },
});

export const OTP = mongoose.model<IOTPDocument>('OTP', OTPSchema);

