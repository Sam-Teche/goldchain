import {Request, Response, Router} from "express";
import AccountServices from "../../../services/accounts";
import {Authorize} from "../../../../package/middleware/authorization";
import ValidationMiddleware from "../../../../package/middleware/validation";
import {SuccessResponse} from "../../../../package/responses/success";
import OfferServices from "../../../services/offer";
import {
    createOfferSchema,
    listingIdSchema,
    offerFilterSchema,
    offerIdSchema,
    updateStatusSchema
} from "./validationSchema";
import {OfferFilter} from "../../../domain/offer/offer";
import {ForbidenError} from "../../../../package/errors/customError";
import ListingServices from "../../../services/listing";

export default class Handler {
    router: Router;
    accountServices: AccountServices;
    listingServices: ListingServices;
    offerServices: OfferServices

    constructor(accountServices: AccountServices, listingServices: ListingServices, offerServices: OfferServices) {
        this.accountServices = accountServices;
        this.listingServices = listingServices;
        this.offerServices = offerServices;
        this.router = Router();

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/").post(
            Authorize(this.accountServices),
            ValidationMiddleware(createOfferSchema, 'body'),
            this.offer
        ).get(
            Authorize(this.accountServices),
            ValidationMiddleware(offerFilterSchema, 'query'),
            this.getOffers
        )

        this.router.route("/listing").get(
            Authorize(this.accountServices),
            ValidationMiddleware(offerFilterSchema, 'query'),
            ValidationMiddleware(listingIdSchema, 'body'),
            this.getListingOffers
        )

        this.router.route("/:offerId").patch(
            Authorize(this.accountServices),
            ValidationMiddleware(offerIdSchema, 'params'),
            ValidationMiddleware(updateStatusSchema, 'body'),
            this.offerStatus
        )
            .get(
                Authorize(this.accountServices),
                ValidationMiddleware(offerIdSchema, 'params'),
                this.getOffer
            )

    }

    offer = async (req: Request, res: Response) => {
        await this.offerServices.commands.createOffer.handle(req.account._id, req.body.listingId, req.body.amount)
        new SuccessResponse(res, {message: "offer sent to seller"}).send()
    };

    offerStatus = async (req: Request, res: Response) => {
        await this.offerServices.commands.updateOfferStatus.handle(req.params.offerId, req.account._id, req.body.status, req.body.amount)
        new SuccessResponse(res, {message: `offer ${req.body.status}`}).send()
    };

    getOffers = async (req: Request, res: Response) => {
        let filter = req.query as unknown as OfferFilter
        filter.buyer = req.account._id
        let offers = await this.offerServices.queries.getOffers.handle(filter)
        new SuccessResponse(res, {offers}).send()
    };

    getListingOffers = async (req: Request, res: Response) => {
        let filter = req.query as unknown as OfferFilter
        filter.listing = req.body.listingId

        try {
            await this.listingServices.queries.getListing.handle(filter.listing, req.account._id)
        } catch (e) {
            throw new ForbidenError("can not view offer of listing")
        }

        let offers = await this.offerServices.queries.getOffers.handle(filter)
        new SuccessResponse(res, {offers}).send()
    };

    getOffer = async (req: Request, res: Response) => {
        let offer = await this.offerServices.queries.getOffer.handle(req.params.offerId)
        new SuccessResponse(res, {offer}).send()
    };

};
