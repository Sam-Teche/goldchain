import {
    RequestRepository
} from "../../../domain/request/repository";
import {AccountRepository} from "../../../domain/account/repository";
import {ForbidenError} from "../../../../package/errors/customError";
import {EmailRepository} from "../../../domain/notification/repository";
import {Environment} from "../../../../package/configs/environment";
import {ListingRepository} from "../../../domain/listing/repository";
import {IListing} from "../../../domain/listing/listing";
import {EmailParameters, EmailType} from "../../../domain/notification/email";
import sendOTP from "../../../../package/view/sendOTP";
import purchaseRequestHtml from "../../../../package/view/purchaseRequest";
import {timeUntil} from "../../../../package/utils/time";

export class CreateRequest {
    requestRepository: RequestRepository;
    accountRepository: AccountRepository;
    emailRepository: EmailRepository
    environmentVariables: Environment
    listingRepository: ListingRepository

    constructor(
        requestRepository: RequestRepository,
        accountRepository: AccountRepository,
        listingRepository: ListingRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.requestRepository = requestRepository;
        this.accountRepository = accountRepository;
        this.emailRepository = emailRepository;
        this.environmentVariables = environmentVariables
        this.listingRepository = listingRepository

    }

    handle = async (buyerId: string, listingId: string, expiresAt?: Date): Promise<void> => {
        let buyer = await this.accountRepository.GetAccount(buyerId);
        if (!buyer.type) {
            throw new ForbidenError("buyer setup incomplete")
        }

        let listing = await this.listingRepository.GetListing(listingId) as IListing;

        if (listing.seller.toString() == buyer._id.toString()) {
            throw new ForbidenError("can not request own item")
        }

        let expires = expiresAt || new Date(Date.now() + this.environmentVariables.defaultRequestExpiry)

        await this.requestRepository.AddRequest(
            buyer._id,
            listingId,
            expires
        )

        let seller = await this.accountRepository.GetAccount(listing.seller as string);

        const emailParameters: EmailParameters = {
            type: EmailType.HTML,
            subject: "New purchase request received on GoldChain!",
            email: seller.email,
            message: purchaseRequestHtml(seller.profile.fullName, listingId, listing.information.price, buyer.profile.companyName, this.environmentVariables.redirectUrl.reviewOrderRequest, timeUntil(expires)),
        };

        try {
            this.emailRepository.send(emailParameters).catch();
        } catch (e) {
        }
    };
}

