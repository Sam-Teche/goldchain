import {RequestRepository} from "../../../domain/request/repository";
import Status from "../../../../package/types/status";
import {ListingRepository} from "../../../domain/listing/repository";
import {BadRequestError, ForbidenError} from "../../../../package/errors/customError";
import {EmailParameters, EmailType} from "../../../domain/notification/email";
import {EmailRepository} from "../../../domain/notification/repository";
import {AccountRepository} from "../../../domain/account/repository";
import requestAcceptedHtml from "../../../../package/view/requestAccepted";
import requestRejectedHtml from "../../../../package/view/requestRejected";
import {Environment} from "../../../../package/configs/environment";

export class UpdateRequestStatus {
    requestRepository: RequestRepository;
    accountRepository: AccountRepository;
    listingRepository: ListingRepository;
    environmentVariable: Environment;
    emailRepository: EmailRepository

    constructor(
        requestRepository: RequestRepository,
        accountRepository: AccountRepository,
        listingRepository: ListingRepository,
        environmentVariable: Environment,
        emailRepository: EmailRepository
    ) {
        this.requestRepository = requestRepository;
        this.accountRepository = accountRepository;
        this.listingRepository = listingRepository;
        this.environmentVariable = environmentVariable;
        this.emailRepository = emailRepository;
    }


    handle = async (requestId: string, accountId: string, status: Extract<Status, "accepted" | "rejected" | "cancelled">): Promise<void> => {
        let request = await this.requestRepository.GetRequest(requestId)

        if (request.status == "cancelled" || request.status == "expired") {
            throw new BadRequestError(`request has been ${request.status}`)
        }

        let listing = await this.listingRepository.GetListing(request.listing)

        if (listing.seller.toString() != accountId.toString() && status != "cancelled") {
            throw new ForbidenError("not seller")
        }

        await this.requestRepository.UpdateRequestStatus(requestId, status)

        if (status != "cancelled") {
            let buyer = await this.accountRepository.GetAccount(request.buyer as string);
            let seller = await this.accountRepository.GetAccount(listing.seller as string);

            let emailParameters: EmailParameters
            if (status == "accepted") {
                emailParameters = {
                    type: EmailType.HTML,
                    subject: "Your purchase request on GoldChain was accepted!!",
                    email: buyer.email,
                    message: requestAcceptedHtml(seller.profile.companyName, buyer.profile.fullName, this.environmentVariable.redirectUrl.completePurchase, this.environmentVariable.supportEmail,),
                };
            } else {
                emailParameters = {
                    type: EmailType.HTML,
                    subject: "Your offer on GoldChain was not accepted",
                    email: buyer.email,
                    message: requestRejectedHtml(seller.profile.companyName, buyer.profile.fullName, listing.information.price, this.environmentVariable.redirectUrl.completePurchase, this.environmentVariable.supportEmail),
                };

            }
            try {
                this.emailRepository.send(emailParameters).catch();
            } catch (e) {
            }
        }
    };
}
