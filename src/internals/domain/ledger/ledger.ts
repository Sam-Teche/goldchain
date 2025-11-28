import {Account} from "../account/account";
import {Listing} from "../listing/listing";
import Filter from "../../../package/types/filter";
import {IOffer} from "../offer/offer";
import {IRequest} from "../request/request";
import { number } from "zod";

export type LedgerStatusType = "pending" | "transit" | "delivered" | "completed" | "canceled"

export interface ILedger {
    trackingId: string;
    hash: string;
    reference: string;
    status: string;
    buyer: string | Account;
    seller: string | Account;
    listing: string | Listing;
    offer?: string | IOffer;
    request?: string | IRequest;
    createdAt: Date;
    updatedAt: Date;
}

export type Ledger = ILedger & { _id: string }

export type LedgerFilter = Filter & {
    account?: string
    status?: string
    trackingId?: string
    hash?: string
    reference?: string
};

export type AddLedgerParameters = {
    reference: string;
    trackingId: string;
    hash: string;
    buyer: string;
    seller: string;
    listing: string;
    offer?: string;
    request?: string;
}


