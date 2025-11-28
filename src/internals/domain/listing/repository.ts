import {IListing, Listing, ListingFilter, ReportedListingsFilter, ReportListingParameters} from "./listing";

export interface ListingRepository {
    CreateListing: (listing: Omit<IListing, "createdAt" | "updatedAt" | "rating" | "reviews" | "reports" | "isReported">) => Promise<string>
    UpdateListing: (listingId: string, listing: Partial<IListing>) => Promise<void>
    DeleteListing: (listingId: string, seller: string) => Promise<void>
    GetListings: (filter: ListingFilter) => Promise<Listing[]>
    GetListingWithProfile: (listingId: string, seller?: string) => Promise<Listing>
    GetListing: (listingId: string) => Promise<Listing>
    GetListingAnalytics: (accountId: string) => Promise<{ averagePricePerGram: number, totalWeight: number }>
    ReportListing: (parameters: ReportListingParameters) => Promise<void>
    GetReportedListings(query: ReportedListingsFilter): Promise<Listing[]>
}