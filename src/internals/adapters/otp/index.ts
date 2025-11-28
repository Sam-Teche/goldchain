import {IOTP} from "../../domain/otp/otp";
import {BadRequestError} from "../../../package/errors/customError";
import {OTPRepository} from "../../domain/otp/repository";
import {OTP} from "./schema";

export default class OTPClass implements OTPRepository {
    async AddOTP(parameters: IOTP): Promise<void> {
        await OTP.updateOne(
            {account: parameters.account, accountModel: parameters.accountModel, type: parameters.type},
            {
                $set: {
                    otp: parameters.otp,
                    expiresAt: parameters.expiresAt,
                    createdAt: new Date()
                }
            },
            {upsert: true}
        );

    };

    async OTPValid(parameters: Omit<IOTP, 'expiresAt'>): Promise<void> {
        try {
            const otp = await OTP.findOne({
                account: parameters.account,
                accountModel: parameters.accountModel,
                type: parameters.type,
                otp: parameters.otp,
                expiresAt: {$gt: new Date()}
            });

            if (!otp) throw new BadRequestError("invalid or expired otp");
            await OTP.deleteOne({_id: otp._id});
        } catch (e) {
            throw e
        }
    };

}