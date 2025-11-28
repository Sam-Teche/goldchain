import {FundDetails} from "./payment";

export interface PaymentRepository {
    fund(amount: string): Promise<FundDetails>
}