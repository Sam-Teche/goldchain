import Filter from "../../../package/types/filter";
import {Account} from "../account/account";
import {Listing} from "../listing/listing";

export type ReferenceModel = "Account" | "Listing"

export interface IReview {
    listing: string | Listing
    reviewer: string | Account
    rating: number
    comment: string
    createdAt: Date
    updatedAt: Date
}

export type Review = IReview & { _id: string }

export type ReviewFilter = Filter & {
    account?: string
    listing?: string
}