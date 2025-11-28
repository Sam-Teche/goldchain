import {Types} from "mongoose";

export type OTPAccountModel = 'Account' | 'Admin'; // OTP
export type OTPType = 'email_verification' | 'password_reset' | 'login' | '2fa';

export interface IOTP {
    account: string;
    accountModel: OTPAccountModel,
    otp: string;
    type: OTPType;
    expiresAt: Date;
}
