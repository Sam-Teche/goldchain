import {OfferRepository} from "../../../domain/offer/repository";
import Status from "../../../../package/types/status";
import {ListingRepository} from "../../../domain/listing/repository";
import {BadRequestError, ForbidenError} from "../../../../package/errors/customError";
import {EmailParameters, EmailType} from "../../../domain/notification/email";
import {EmailRepository} from "../../../domain/notification/repository";
import {AccountRepository} from "../../../domain/account/repository";
import requestAcceptedHtml from "../../../../package/view/requestAccepted";
import requestRejectedHtml from "../../../../package/view/requestRejected";
import {Environment} from "../../../../package/configs/environment";
import offerHtml from "../../../../package/view/offer";
import {timeUntil} from "../../../../package/utils/time";


export type AcceptedStatus = Extract<Status, "accepted" | "rejected" | "cancelled" | "countered">

export class UpdateOfferStatus {
    offerRepository: OfferRepository;
    accountRepository: AccountRepository;
    listingRepository: ListingRepository;
    environmentVariables: Environment;
    emailRepository: EmailRepository

    constructor(
        offerRepository: OfferRepository,
        accountRepository: AccountRepository,
        listingRepository: ListingRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.offerRepository = offerRepository;
        this.accountRepository = accountRepository;
        this.listingRepository = listingRepository;
        this.environmentVariables = environmentVariables;
        this.emailRepository = emailRepository;
    }


    handle = async (offerId: string, accountId: string, status: AcceptedStatus, amount?: number, expiresAt?: Date): Promise<void> => {
        let offer = await this.offerRepository.GetOffer(offerId)

        if (offer.status == status) return;

        // if (offer.expiresAt < new Date()) {
        //     await this.offerRepository.UpdateOfferStatus(offerId, "expired")
        //     throw new BadRequestError("offer has expired")
        // }

        if (offer.status == "cancelled" || offer.status == "expired" || offer.status == "countered") {
            throw new BadRequestError(`offer has been ${offer.status}`)
        }

        let listing = await this.listingRepository.GetListing(offer.listing)

        if (listing.seller.toString() != accountId.toString() && offer.buyer.toString() != accountId.toString()) {
            throw new ForbidenError("only permitted to buyer or seller")
        }

        if (accountId.toString() == offer.createdBy.toString() && status != "cancelled") {
            throw new ForbidenError("can only cancel a created offer")
        }

        let buyer = await this.accountRepository.GetAccount(offer.buyer as string);
        let seller = await this.accountRepository.GetAccount(listing.seller as string);
        let toName = listing.seller.toString() == accountId.toString() ? buyer.profile.fullName : seller.profile.fullName
        let fromCompanyName = listing.seller.toString() == accountId.toString() ? seller.profile.companyName : buyer.profile.companyName
        let toEmail = listing.seller.toString() == accountId.toString() ? buyer.email : seller.email


        if (status == "countered") {
            if (!amount) throw new BadRequestError("provide counter amount")

            let expires = expiresAt || new Date(Date.now() + this.environmentVariables.defaultRequestExpiry)

            await this.offerRepository.UpdateOfferStatus(offerId, status)
            await this.offerRepository.AddOffer(
                offer.buyer as string,
                accountId,
                listing._id,
                amount,
                expires
            )

            const emailParameters: EmailParameters = {
                type: EmailType.HTML,
                subject: "New offer received on GoldChain!",
                email: toEmail,
                message: offerHtml(
                    toName,
                    listing._id,
                    amount.toString(),
                    listing
                        .information.price,
                    fromCompanyName,
                    this
                        .environmentVariables.redirectUrl.reviewOffer,
                    timeUntil(expires)
                ),
            }


            try {
                this.emailRepository.send(emailParameters).catch();
            } catch (e) {
            }

            return
        }
        if (status != "cancelled") {
            await this.offerRepository.UpdateOfferStatus(offerId, status)

            let emailParameters: EmailParameters
            if (status == "accepted") {
                emailParameters = {
                    type: EmailType.HTML,
                    subject: "Your purchase offer on GoldChain was accepted!!",
                    email: toEmail,
                    message: requestAcceptedHtml(fromCompanyName, toName, this.environmentVariables.redirectUrl.completePurchase, this.environmentVariables.supportEmail,),
                };
            } else {
                emailParameters = {
                    type: EmailType.HTML,
                    subject: "Your offer on GoldChain was not accepted",
                    email: toEmail,
                    message: requestRejectedHtml(fromCompanyName, toName, listing.information.price, this.environmentVariables.redirectUrl.completePurchase, this.environmentVariables.supportEmail),
                };

            }
            try {
                this.emailRepository.send(emailParameters).catch();
            } catch (e) {
            }
        }
    };
}
