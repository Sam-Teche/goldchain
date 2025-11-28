import {IOTP} from "./otp";

export interface OTPRepository {
    AddOTP: (parameters: IOTP) => Promise<void>
    OTPValid: (parameters: Omit<IOTP, 'expiresAt'>) => Promise<void>
}