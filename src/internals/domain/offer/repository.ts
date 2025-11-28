import {IOffer, OfferFilter} from "./offer";
import Status from "../../../package/types/status";

export interface OfferRepository {
    AddOffer: (accountId: string, createdBy: string, listingId: string, amount: number, expiresAt: Date) => Promise<void>
    UpdateOfferStatus: (offerId: string, status: Status) => Promise<void>
    DeleteOffer: (offerId: string, accountId: string) => Promise<void>
    GetOffers: (filter: OfferFilter) => Promise<IOffer[]>
    GetOfferWithProfile: (offerId: string) => Promise<IOffer>
    GetOffer: (offerId: string) => Promise<IOffer>
}