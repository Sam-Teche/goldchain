import Status from "../../../package/types/status";
import Filter from "../../../package/types/filter";
import {Account} from "../account/account";

export interface IRequest {
    buyer: string | Account
    listing: string
    listedPrice: string
    status: Status
    expiresAt: Date
    createdAt: Date;
    updatedAt: Date;
}

export type RequestFilter = Filter & Pick<IRequest, "status" | "listing" | "buyer">