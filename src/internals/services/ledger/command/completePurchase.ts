import {
    LedgerRepository
} from "../../../domain/ledger/repository";
import {Environment} from "../../../../package/configs/environment";
import {EmailRepository} from "../../../domain/notification/repository";
import {AccountRepository} from "../../../domain/account/repository";
import {BadRequestError, ForbidenError} from "../../../../package/errors/customError";
import {IOffer} from "../../../domain/offer/offer";
import {IRequest} from "../../../domain/request/request";
import {OfferRepository} from "../../../domain/offer/repository";
import {RequestRepository} from "../../../domain/request/repository";
import {ListingRepository} from "../../../domain/listing/repository";
import {Account} from "../../../domain/account/account";
import {EscrowRepository} from "../../../domain/escrow/repository";
import {CreateTransactionRequest} from "../../../domain/escrow/escrow";
import {Listing} from "../../../domain/listing/listing";
import {generateMUKCode, generateTXHashCode} from "../../../../package/utils/generate";
import {AddLedgerParameters, Ledger} from "../../../domain/ledger/ledger";
import listing from "../../listing";

interface PurchaseDetails {
    offer: IOffer | null;
    request: IRequest | null;
    buyer: Account;
    listing: Listing;
    seller: Account;
    amount: number;
}

export class CompletePurchase {
    private readonly ledgerRepository: LedgerRepository;
    private readonly escrowRepository: EscrowRepository;
    private readonly offerRepository: OfferRepository;
    private readonly requestRepository: RequestRepository;
    private readonly listingRepository: ListingRepository;
    private readonly accountRepository: AccountRepository;
    private readonly environmentVariables: Environment;
    private readonly emailRepository: EmailRepository;

    private static readonly MAX_GENERATION_ATTEMPTS = 3;
    private static readonly BROKER_ROLE = "broker";
    private static readonly BUYER_ROLE = "buyer";
    private static readonly SELLER_ROLE = "seller";

    constructor(
        ledgerRepository: LedgerRepository,
        escrowRepository: EscrowRepository,
        offerRepository: OfferRepository,
        requestRepository: RequestRepository,
        listingRepository: ListingRepository,
        accountRepository: AccountRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.ledgerRepository = ledgerRepository;
        this.escrowRepository = escrowRepository;
        this.offerRepository = offerRepository;
        this.requestRepository = requestRepository;
        this.listingRepository = listingRepository;
        this.accountRepository = accountRepository;
        this.environmentVariables = environmentVariables;
        this.emailRepository = emailRepository;
    }

    handle = async (accountId: string, offerId?: string, requestId?: string): Promise<Partial<Ledger>> => {
        this.validateInput(offerId, requestId);

        const purchaseDetails = await this.getPurchaseDetails(accountId, offerId, requestId);
        const [hash, trackingId] = await Promise.all([
            this.generateUniqueHash(),
            this.generateUniqueTrackingId()
        ]);

        const escrowTransactionResponse = await this.createEscrowTransaction(purchaseDetails);

        const addLedgerParameters: AddLedgerParameters = {
            reference: escrowTransactionResponse.id as string,
            buyer: purchaseDetails.buyer._id,
            hash,
            listing: purchaseDetails.listing._id,
            offer: offerId,
            request: requestId,
            seller: purchaseDetails.seller._id,
            trackingId
        };

        await this.ledgerRepository.AddLedger(addLedgerParameters);
        await this.updatePurchaseDetails(offerId, requestId)

        return {
            reference: escrowTransactionResponse.id as string,
            hash,
            trackingId,
            buyer: purchaseDetails.buyer,
            seller: purchaseDetails.seller,
            listing: purchaseDetails.listing,
            offer: purchaseDetails.offer as IOffer | undefined,
            request: purchaseDetails.request as IRequest | undefined
        };
    };

    private validateInput(offerId?: string, requestId?: string): void {
        if (!offerId && !requestId) {
            throw new BadRequestError("Provide either offer or purchase request id");
        }
    }

    private async getPurchaseDetails(
        accountId: string,
        offerId?: string,
        requestId?: string
    ): Promise<PurchaseDetails> {
        const buyer = await this.accountRepository.GetAccount(accountId);
        buyer.password = ""

        let offer: IOffer | null = null;
        let request: IRequest | null = null;
        let listing: Listing | null = null;

        if (offerId) {
            offer = await this.getOfferAndValidateOwnership(offerId, buyer);
            if (offer.status != "accepted") throw new BadRequestError("offer status is not accepted")
            listing = await this.listingRepository.GetListingWithProfile(offer.listing);
        }

        if (requestId) {
            request = await this.getRequestAndValidateOwnership(requestId, buyer);
            if (request.status != "accepted") throw new BadRequestError("request status is not accepted")
            listing = await this.listingRepository.GetListingWithProfile(request.listing);
        }

        if (!offer && !request) {
            throw new BadRequestError("Offer or request does not exist");
        }

        if (!listing) {
            throw new BadRequestError("Listing does not exist");
        }

        const seller = listing.seller as Account;
        const amount = offer ? Number(offer.amount) : Number(listing.information.price);

        return {offer, request, buyer, listing, seller, amount};
    }

    private async updatePurchaseDetails(
        offerId?: string,
        requestId?: string
    ): Promise<void> {
        if (offerId) {
            await this.offerRepository.UpdateOfferStatus(offerId, "completed");
        }

        if (requestId) {
            await this.requestRepository.UpdateRequestStatus(requestId, "completed");
        }

        if (!offerId && !requestId) {
            throw new BadRequestError("Offer or request does not exist");
        }
    }

    private async getOfferAndValidateOwnership(offerId: string, buyer: Account): Promise<IOffer> {
        try {
            const offer = await this.offerRepository.GetOfferWithProfile(offerId);
            const offerBuyer = offer.buyer as Account;

            if (offerBuyer._id.toString() !== buyer._id.toString()) {
                throw new ForbidenError("Offer does not belong to account");
            }

            return offer;
        } catch (error) {
            if (error instanceof ForbidenError) {
                throw error;
            }
            throw new BadRequestError("Invalid offer id");
        }
    }

    private async getRequestAndValidateOwnership(requestId: string, buyer: Account): Promise<IRequest> {
        try {
            const request = await this.requestRepository.GetRequest(requestId);
            const requestBuyer = request.buyer as Account;

            if (requestBuyer._id.toString() !== buyer._id.toString()) {
                throw new ForbidenError("Request does not belong to account");
            }

            return request;
        } catch (error) {
            if (error instanceof ForbidenError) {
                throw error;
            }
            throw new BadRequestError("Invalid request id");
        }
    }

    private async createEscrowTransaction(purchaseDetails: PurchaseDetails): Promise<any> {
        const brokerFee = (this.environmentVariables.escrowCredential.brokerPercentage / 100) * purchaseDetails.amount;
        const escrowTransaction: CreateTransactionRequest = {
            parties: [
                {
                    role: CompletePurchase.BROKER_ROLE,
                    customer: "me"
                },
                {
                    role: CompletePurchase.BUYER_ROLE,
                    customer: purchaseDetails.buyer.email // can not be same as email used for escrow api
                },
                {
                    role: CompletePurchase.SELLER_ROLE,
                    customer: purchaseDetails.seller.email, // can not be same as email used for escrow api
                }
            ],
            currency: "usd",
            description: `${purchaseDetails.listing.information.lotWeight} ($${purchaseDetails.listing.information.pricePerGram}/g) ${purchaseDetails.listing.information.purity}`,
            items: [
                {
                    inspection_period: 259200,
                    quantity: 1,
                    title: `${purchaseDetails.listing.information.lotWeight} ($${purchaseDetails.listing.information.pricePerGram}/g) ${purchaseDetails.listing.information.purity}`,
                    description: `${purchaseDetails.listing.information.lotWeight} ($${purchaseDetails.listing.information.pricePerGram}/g) ${purchaseDetails.listing.information.purity}`,
                    type: "general_merchandise",
                    schedule: [
                        {
                            amount: purchaseDetails.amount,
                            payer_customer: purchaseDetails.buyer.email,
                            beneficiary_customer: purchaseDetails.seller.email
                        }
                    ]
                },
                {
                    type: "broker_fee",
                    schedule: [
                        {
                            amount: brokerFee,
                            payer_customer: purchaseDetails.buyer.email,
                            beneficiary_customer: "me"
                        }
                    ]
                },
            ]
        };

        return await this.escrowRepository.createTransaction(escrowTransaction);
    }

    private async generateUniqueHash(): Promise<string> {
        return await this.generateUniqueValue(
            generateTXHashCode,
            (value) => this.ledgerRepository.GetLedgers({hash: value}),
            "hash"
        );
    }

    private async generateUniqueTrackingId(): Promise<string> {
        return await this.generateUniqueValue(
            generateMUKCode,
            (value) => this.ledgerRepository.GetLedgers({trackingId: value}),
            "tracking ID"
        );
    }

    private async generateUniqueValue(
        generator: () => string,
        checker: (value: string) => Promise<any[]>,
        valueType: string
    ): Promise<string> {
        for (let i = 0; i < CompletePurchase.MAX_GENERATION_ATTEMPTS; i++) {
            const value = generator();
            const existing = await checker(value);

            if (existing.length === 0) {
                return value;
            }
        }

        throw new BadRequestError(`Error generating unique ${valueType}. Please try again.`);
    }
}