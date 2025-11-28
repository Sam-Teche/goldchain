import {IRequest, RequestFilter} from "./request";
import Status from "../../../package/types/status";

export interface RequestRepository {
    AddRequest: (accountId: string, listingId: string,expiresAt: Date) => Promise<void>
    UpdateRequestStatus: (requestId: string, status: Status) => Promise<void>
    DeleteRequest: (requestId: string, accountId: string) => Promise<void>
    GetRequests: (filter: RequestFilter) => Promise<IRequest[]>
    GetRequest: (requestId: string) => Promise<IRequest>
}