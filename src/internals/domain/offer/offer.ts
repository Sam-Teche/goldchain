import Status from "../../../package/types/status";
import Filter from "../../../package/types/filter";
import {Account} from "../account/account";
import {IListing} from "../listing/listing";

export interface IOffer {
    buyer: string | Account
    createdBy: string
    listing: string
    amount: string
    status: Status
    expiresAt: Date
    createdAt: Date;
    updatedAt: Date;
    original?: string
}

export type OfferFilter = Filter & Pick<IOffer, "status" | "listing" | "buyer">