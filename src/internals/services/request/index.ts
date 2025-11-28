import {AccountRepository} from "../../domain/account/repository";
import {CreateRequest} from "./command/createRequest";
import {RequestRepository} from "../../domain/request/repository";
import {Environment} from "../../../package/configs/environment";
import {EmailRepository} from "../../domain/notification/repository";
import {GetRequests} from "./queries/getRequests";
import {GetRequest} from "./queries/getRequest";
import {DeleteRequest} from "./command/deleteRequest";
import {ListingRepository} from "../../domain/listing/repository";
import {UpdateRequestStatus} from "./command/updateRequestStatus";

class Commands {
    createRequest: CreateRequest
    updateRequestStatus: UpdateRequestStatus
    deleteRequest: DeleteRequest

    constructor(
        requestRepository: RequestRepository,
        accountRepository: AccountRepository,
        listingRepository: ListingRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.createRequest = new CreateRequest(requestRepository, accountRepository, listingRepository, environmentVariables, emailRepository)
        this.deleteRequest = new DeleteRequest(requestRepository)
        this.updateRequestStatus = new UpdateRequestStatus(requestRepository, accountRepository, listingRepository, environmentVariables, emailRepository)
    }
}

class Queries {
    getRequests: GetRequests
    getRequest: GetRequest

    constructor(requestRepository: RequestRepository) {
        this.getRequests = new GetRequests(requestRepository)
        this.getRequest = new GetRequest(requestRepository)
    }
}

class RequestServices {
    commands: Commands
    queries: Queries

    constructor(
        requestRepository: RequestRepository,
        accountRepository: AccountRepository,
        listingRepository: ListingRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.commands = new Commands(requestRepository, accountRepository, listingRepository, environmentVariables, emailRepository)
        this.queries = new Queries(requestRepository)
    }
}

export default RequestServices