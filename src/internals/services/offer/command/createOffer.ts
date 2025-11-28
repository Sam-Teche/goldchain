import {
    OfferRepository
} from "../../../domain/offer/repository";
import {AccountRepository} from "../../../domain/account/repository";
import {ForbidenError} from "../../../../package/errors/customError";
import {EmailRepository} from "../../../domain/notification/repository";
import {Environment} from "../../../../package/configs/environment";
import {ListingRepository} from "../../../domain/listing/repository";
import {IListing} from "../../../domain/listing/listing";
import {EmailParameters, EmailType} from "../../../domain/notification/email";
import purchaseOfferHtml from "../../../../package/view/purchaseRequest";
import offerHtml from "../../../../package/view/offer";
import {timeUntil} from "../../../../package/utils/time";

export class CreateOffer {
    offerRepository: OfferRepository;
    accountRepository: AccountRepository;
    emailRepository: EmailRepository
    environmentVariables: Environment
    listingRepository: ListingRepository

    constructor(
        offerRepository: OfferRepository,
        accountRepository: AccountRepository,
        listingRepository: ListingRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.offerRepository = offerRepository;
        this.accountRepository = accountRepository;
        this.emailRepository = emailRepository;
        this.environmentVariables = environmentVariables
        this.listingRepository = listingRepository

    }

    handle = async (accountId: string, listingId: string, amount: number, expiresAt?: Date): Promise<void> => {
        let buyer = await this.accountRepository.GetAccount(accountId);
        if (!buyer.type) {
            throw new ForbidenError("buyer setup incomplete")
        }

        let listing = await this.listingRepository.GetListing(listingId) as IListing;

        if (listing.seller.toString() == buyer._id.toString()) {
            throw new ForbidenError("can not add offer your item")
        }
        let expires = expiresAt || new Date(Date.now() + this.environmentVariables.defaultRequestExpiry)

        await this.offerRepository.AddOffer(
            buyer._id,
            buyer._id,
            listingId,
            amount,
            expires
        )

        let seller = await this.accountRepository.GetAccount(listing.seller as  string);

        const emailParameters: EmailParameters = {
                type: EmailType.HTML,
                subject: "New offer received on GoldChain!",
                email: seller.email,
                message: offerHtml(
                    seller.profile.fullName,
                    listingId,
                    amount.toString(),
                    listing
                        .information.price,
                    buyer
                        .profile.companyName,
                    this
                        .environmentVariables.redirectUrl.reviewOffer,
                    timeUntil(expires)
                ),
            }
        ;

        try {
            this.emailRepository.send(emailParameters).catch();
        } catch (e) {
        }
    };
}

