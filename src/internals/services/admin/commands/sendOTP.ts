import { AdminRepository } from "../../../domain/admin/repository";
import { BadRequestError } from "../../../../package/errors/customError";
import { EmailParameters, EmailType } from "../../../domain/notification/email";
import sendOTP from "../../../../package/view/sendOTP";
import { Environment } from "../../../../package/configs/environment";
import { EmailRepository } from "../../../domain/notification/repository";
import { OTPRepository } from "../../../domain/otp/repository";
import resetPasswordOTP from "../../../../package/view/resetPasswordOTP";

export class SendOTP {
  adminRepository: AdminRepository;
  otpRepository: OTPRepository;
  environmentVariables: Environment;
  emailRepository: EmailRepository;

  constructor(
    adminRepository: AdminRepository,
    otpRepository: OTPRepository,
    environmentVariables: Environment,
    emailRepository: EmailRepository
  ) {
    this.adminRepository = adminRepository;
    this.otpRepository = otpRepository;
    this.environmentVariables = environmentVariables;
    this.emailRepository = emailRepository;
  }

  handle = async (
    email: string,
    purpose?: "adminVerification" | "resetPassword"
  ): Promise<void> => {
    try {
      let admin = await this.adminRepository.GetAdmin("", email);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.otpRepository.AddOTP({
        account: admin._id,
        accountModel: "Admin",
        otp,
        type: "email_verification",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      if (purpose == "resetPassword") {
        const emailParameters: EmailParameters = {
          type: EmailType.HTML,
          subject: "Reset Password OTP",
          email,
          message: resetPasswordOTP(
            otp,
            this.environmentVariables.supportEmail
          ),
        };

        try {
          this.emailRepository.send(emailParameters).catch();
        } catch (e) {
          // console.log(e)
        }
      } else {
        const emailParameters: EmailParameters = {
          type: EmailType.HTML,
          subject: "OTP Code",
          email,
          message: sendOTP(otp, this.environmentVariables.supportEmail),
        };

        try {
          this.emailRepository.send(emailParameters).catch();
        } catch (e) {
          // console.log(e)
        }
      }
    } catch (error) {
      throw error;
    }
  };
}
